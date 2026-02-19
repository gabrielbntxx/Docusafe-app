import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFromR2, uploadToR2, deleteFromR2, generateStorageKey } from "@/lib/storage";
import {
  decryptDocument,
  encryptDocument,
  decryptUserKey,
  isEncrypted,
  removeEncryptionMarker,
  addEncryptionMarker,
} from "@/lib/encryption";
import { parseFolderRules } from "@/types/folder-rules";
import { convertFileToPdf, canConvertToPdf } from "@/lib/pdf-converter";
import { getEffectiveUserId } from "@/lib/team";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: folderId } = await params;
    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // Verify folder belongs to the workspace
    const folder = await db.folder.findFirst({
      where: { id: folderId, userId: effectiveUserId },
      select: { id: true, name: true, rules: true },
    });

    if (!folder) {
      return NextResponse.json({ error: "Dossier non trouvé" }, { status: 404 });
    }

    const rules = parseFolderRules(folder.rules);

    if (!rules.convertToPdf?.enabled) {
      return NextResponse.json(
        { error: "La règle de conversion PDF n'est pas activée sur ce dossier" },
        { status: 400 }
      );
    }

    // Fetch all non-PDF documents in the folder.
    // We intentionally do NOT filter by sourceTypes here because they may be
    // stale (saved before new MIME types like text/x-c were added to the converter).
    // canConvertToPdf() is the single source of truth — applied below in the loop.
    const documents = await db.document.findMany({
      where: {
        folderId,
        userId: effectiveUserId,
        deletedAt: null,
        NOT: { mimeType: "application/pdf" },
      },
      select: {
        id: true,
        displayName: true,
        originalName: true,
        storageKey: true,
        mimeType: true,
        sizeBytes: true,
        isEncrypted: true,
      },
    });

    if (documents.length === 0) {
      return NextResponse.json({ converted: 0, skipped: 0, failed: 0 });
    }

    // Get user encryption key
    const owner = await db.user.findUnique({
      where: { id: effectiveUserId },
      select: { encryptionKey: true },
    });

    const userEncryptionKey = owner?.encryptionKey
      ? decryptUserKey(owner.encryptionKey)
      : null;

    let converted = 0;
    let skipped = 0;
    let failed = 0;

    for (const doc of documents) {
      if (!canConvertToPdf(doc.mimeType)) {
        skipped++;
        continue;
      }

      try {
        // 1. Fetch from R2
        let fileBuffer = await getFromR2(doc.storageKey);

        // 2. Decrypt if needed
        if (doc.isEncrypted === 1 && isEncrypted(fileBuffer)) {
          if (!userEncryptionKey) {
            failed++;
            continue;
          }
          const encryptedData = removeEncryptionMarker(fileBuffer);
          fileBuffer = decryptDocument(encryptedData, userEncryptionKey);
        }

        // 3. Convert to PDF
        const { pdfBuffer, newFileName } = await convertFileToPdf(
          fileBuffer,
          doc.mimeType,
          doc.displayName
        );

        // 4. Re-encrypt
        let finalBuffer: Buffer = pdfBuffer;
        if (doc.isEncrypted === 1 && userEncryptionKey) {
          const encryptedPdf = encryptDocument(pdfBuffer, userEncryptionKey);
          finalBuffer = addEncryptionMarker(encryptedPdf);
        }

        // 5. Upload new PDF to R2 with a new key
        const newStorageKey = generateStorageKey(effectiveUserId, newFileName);
        await uploadToR2(newStorageKey, finalBuffer, "application/octet-stream");

        // 6. Delete old R2 object
        await deleteFromR2(doc.storageKey);

        // 7. Update DB record
        const sizeDiff = pdfBuffer.length - Number(doc.sizeBytes);
        await db.document.update({
          where: { id: doc.id },
          data: {
            displayName: newFileName,
            mimeType: "application/pdf",
            fileType: "pdf",
            storageKey: newStorageKey,
            storageUrl: `r2://${newStorageKey}`,
            sizeBytes: BigInt(pdfBuffer.length),
            description: `Converti depuis ${doc.mimeType}`,
          },
        });

        // 8. Update user storage stats
        if (sizeDiff !== 0) {
          await db.user.update({
            where: { id: effectiveUserId },
            data: { storageUsedBytes: { increment: sizeDiff } },
          });
        }

        converted++;
        console.log(`[ApplyRules] Converted ${doc.displayName} → ${newFileName}`);
      } catch (err) {
        console.error(`[ApplyRules] Failed to convert ${doc.displayName}:`, err);
        failed++;
      }
    }

    console.log(`[ApplyRules] Folder ${folder.name}: converted=${converted}, skipped=${skipped}, failed=${failed}`);

    return NextResponse.json({ converted, skipped, failed });
  } catch (error) {
    console.error("[ApplyRules] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'application des règles" }, { status: 500 });
  }
}
