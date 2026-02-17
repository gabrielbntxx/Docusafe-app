import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFromR2 } from "@/lib/storage";
import {
  decryptDocument,
  decryptUserKey,
  isEncrypted,
  removeEncryptionMarker,
} from "@/lib/encryption";
import { getEffectiveUserId } from "@/lib/team";
import JSZip from "jszip";

// POST - Download multiple documents as ZIP
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { documentIds } = body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "Aucun document sélectionné" },
        { status: 400 }
      );
    }

    // Use effective userId for team members (workspace owner's docs)
    const effectiveUserId = await getEffectiveUserId(session.user.id);
    const isOwner = effectiveUserId === session.user.id;

    // Get documents that belong to the workspace
    const documents = await db.document.findMany({
      where: {
        id: { in: documentIds },
        userId: effectiveUserId,
        // Team members can't download private docs they didn't upload
        ...(isOwner ? {} : {
          OR: [
            { isPrivate: 0 },
            { addedById: session.user.id },
          ],
        }),
      },
      include: {
        folder: {
          select: { name: true },
        },
      },
    });

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "Aucun document trouvé" },
        { status: 404 }
      );
    }

    // Get workspace owner's encryption key (not the team member's)
    const user = await db.user.findUnique({
      where: { id: effectiveUserId },
      select: { encryptionKey: true },
    });

    // Create ZIP
    const zip = new JSZip();

    for (const doc of documents) {
      try {
        let fileBuffer = await getFromR2(doc.storageKey);

        // Decrypt if encrypted
        if (doc.isEncrypted === 1 && isEncrypted(fileBuffer)) {
          if (user?.encryptionKey) {
            const userKey = decryptUserKey(user.encryptionKey);
            const encryptedData = removeEncryptionMarker(fileBuffer);
            fileBuffer = decryptDocument(encryptedData, userKey);
          }
        }

        // Add to ZIP with folder structure if applicable
        const filePath = doc.folder
          ? `${doc.folder.name}/${doc.displayName}`
          : doc.displayName;

        zip.file(filePath, fileBuffer);
      } catch (err) {
        console.error(`Error adding file ${doc.displayName}:`, err);
        // Continue with other files
      }
    }

    // Generate the ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 5 },
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="documents.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("Download multiple error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}
