import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFromR2 } from "@/lib/storage";
import {
  decryptDocument,
  decryptUserKey,
  isEncrypted,
  removeEncryptionMarker,
} from "@/lib/encryption";
import { verifyShareAccessToken } from "@/lib/share-access";
import JSZip from "jszip";

// GET - Download all shared documents as ZIP
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the share link
    const share = await db.sharedLink.findUnique({
      where: { token },
      include: {
        items: true,
      },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Partage non trouvé" },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: "Ce lien de partage a expiré" },
        { status: 410 }
      );
    }

    // If share is password-protected, require a valid access token
    if (share.password) {
      const url = new URL(req.url);
      const accessToken = url.searchParams.get("access");
      if (!accessToken || !verifyShareAccessToken(token, accessToken)) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }
    }

    // Get folder and document IDs
    const folderIds = share.items
      .filter((item) => item.folderId)
      .map((item) => item.folderId as string);
    const documentIds = share.items
      .filter((item) => item.documentId)
      .map((item) => item.documentId as string);

    // Get all documents to include
    const allDocuments: {
      id: string;
      displayName: string;
      storageKey: string;
      isEncrypted: number;
      userId: string;
      folderName?: string;
    }[] = [];

    // Get documents from folders
    if (folderIds.length > 0) {
      const folders = await db.folder.findMany({
        where: { id: { in: folderIds } },
        include: {
          documents: {
            select: {
              id: true,
              displayName: true,
              storageKey: true,
              isEncrypted: true,
              userId: true,
            },
          },
        },
      });

      for (const folder of folders) {
        for (const doc of folder.documents) {
          allDocuments.push({
            ...doc,
            folderName: folder.name,
          });
        }
      }
    }

    // Get individual documents
    if (documentIds.length > 0) {
      const docs = await db.document.findMany({
        where: { id: { in: documentIds } },
        select: {
          id: true,
          displayName: true,
          storageKey: true,
          isEncrypted: true,
          userId: true,
        },
      });
      allDocuments.push(...docs);
    }

    if (allDocuments.length === 0) {
      return NextResponse.json(
        { error: "Aucun document à télécharger" },
        { status: 404 }
      );
    }

    // Get user encryption keys (we need them for decryption)
    const userIds = [...new Set(allDocuments.map((d) => d.userId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, encryptionKey: true },
    });
    const userKeyMap = new Map(users.map((u) => [u.id, u.encryptionKey]));

    // Create ZIP using JSZip
    const zip = new JSZip();

    // Add all files to the ZIP
    for (const doc of allDocuments) {
      try {
        let fileBuffer = await getFromR2(doc.storageKey);

        // Decrypt if encrypted
        if (doc.isEncrypted === 1 && isEncrypted(fileBuffer)) {
          const encryptionKey = userKeyMap.get(doc.userId);
          if (encryptionKey) {
            const userKey = decryptUserKey(encryptionKey);
            const encryptedData = removeEncryptionMarker(fileBuffer);
            fileBuffer = decryptDocument(encryptedData, userKey);
          }
        }

        // Add to ZIP with folder structure if applicable
        const filePath = doc.folderName
          ? `${doc.folderName}/${doc.displayName}`
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

    // Generate filename
    const zipName = share.name
      ? `${share.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.zip`
      : "documents.zip";

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(zipName)}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("Download all error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}
