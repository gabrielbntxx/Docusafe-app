import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseFolderRules } from "@/types/folder-rules";
import { canConvertToPdf, convertImageToPdf } from "@/lib/pdf-converter";
import { getFromR2, uploadToR2, deleteFromR2, generateStorageKey } from "@/lib/storage";
import {
  decryptUserKey,
  decryptDocument,
  encryptDocument,
  addEncryptionMarker,
  isEncrypted,
  removeEncryptionMarker,
} from "@/lib/encryption";

// PATCH - Move a document to a different folder
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const { folderId } = await req.json();

    // Check if document exists and belongs to user (include user for encryption key)
    const document = await db.document.findUnique({
      where: { id },
      include: {
        user: {
          select: { encryptionKey: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // If folderId is provided, verify it exists and belongs to user
    let folder = null;
    if (folderId) {
      folder = await db.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Dossier non trouvé" },
          { status: 404 }
        );
      }

      if (folder.userId !== session.user.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    }

    // Move the document first
    let updatedDocument = await db.document.update({
      where: { id },
      data: {
        folderId: folderId || null,
      },
    });

    // Check if destination folder has convert-to-PDF rule and file is convertible
    if (folder?.rules) {
      const rules = parseFolderRules(folder.rules);

      if (
        rules.convertToPdf?.enabled &&
        canConvertToPdf(document.mimeType) &&
        document.mimeType !== "application/pdf"
      ) {
        try {
          console.log(`[Move] Converting ${document.originalName} to PDF for folder ${folder.name}`);

          // 1. Download from R2
          let fileBuffer = await getFromR2(document.storageKey);

          // 2. Decrypt if encrypted
          if (document.isEncrypted === 1 && document.user.encryptionKey) {
            if (isEncrypted(fileBuffer)) {
              fileBuffer = removeEncryptionMarker(fileBuffer);
            }
            const userKey = decryptUserKey(document.user.encryptionKey);
            fileBuffer = decryptDocument(fileBuffer, userKey);
          }

          // 3. Convert to PDF
          const { pdfBuffer, newFileName } = await convertImageToPdf(
            fileBuffer,
            document.mimeType,
            document.originalName
          );

          // 4. Re-encrypt
          let finalBuffer = pdfBuffer;
          if (document.isEncrypted === 1 && document.user.encryptionKey) {
            const userKey = decryptUserKey(document.user.encryptionKey);
            finalBuffer = addEncryptionMarker(encryptDocument(pdfBuffer, userKey));
          }

          // 5. Upload new PDF to R2
          const newStorageKey = generateStorageKey(session.user.id, newFileName);
          await uploadToR2(newStorageKey, finalBuffer, "application/octet-stream");

          // 6. Delete old file from R2
          await deleteFromR2(document.storageKey);

          // 7. Update document record
          const sizeDiff = BigInt(finalBuffer.length) - document.sizeBytes;
          updatedDocument = await db.document.update({
            where: { id },
            data: {
              originalName: newFileName,
              displayName: newFileName,
              fileType: "pdf",
              mimeType: "application/pdf",
              sizeBytes: finalBuffer.length,
              storageKey: newStorageKey,
              description: `Converti depuis ${document.originalName}`,
            },
          });

          // 8. Update user storage stats
          if (sizeDiff !== BigInt(0)) {
            await db.user.update({
              where: { id: session.user.id },
              data: {
                storageUsedBytes: { increment: sizeDiff },
              },
            });
          }

          console.log(`[Move] Conversion successful: ${document.originalName} → ${newFileName}`);
        } catch (conversionError) {
          // Conversion failed, but the move already happened - that's OK
          console.error("[Move] Conversion failed, file moved without conversion:", conversionError);
        }
      }
    }

    // Convert BigInt to Number for JSON serialization
    const serializedDocument = {
      ...updatedDocument,
      sizeBytes: Number(updatedDocument.sizeBytes),
    };

    return NextResponse.json(serializedDocument);
  } catch (error) {
    console.error("Error moving document:", error);
    return NextResponse.json(
      { error: "Erreur lors du déplacement du document" },
      { status: 500 }
    );
  }
}
