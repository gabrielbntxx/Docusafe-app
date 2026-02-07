import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFromR2 } from "@/lib/storage";
import {
  decryptDocument,
  decryptUserKey,
  isEncrypted,
  removeEncryptionMarker,
} from "@/lib/encryption";

// GET - View a shared document (public, for preview)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string; docId: string }> }
) {
  try {
    const { token, docId } = await params;

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

    // Get the document
    const document = await db.document.findUnique({
      where: { id: docId },
      include: {
        user: {
          select: {
            encryptionKey: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    // Check if document is in the share (directly or via folder)
    const isDirectlyShared = share.items.some(
      (item) => item.documentId === docId
    );
    const isInSharedFolder = share.items.some(
      (item) => item.folderId && item.folderId === document.folderId
    );

    if (!isDirectlyShared && !isInSharedFolder) {
      return NextResponse.json(
        { error: "Document non autorisé" },
        { status: 403 }
      );
    }

    // Get file from R2
    let fileBuffer = await getFromR2(document.storageKey);

    // Decrypt if encrypted
    if (document.isEncrypted === 1 && isEncrypted(fileBuffer)) {
      if (!document.user.encryptionKey) {
        return NextResponse.json(
          { error: "Clé de chiffrement manquante" },
          { status: 500 }
        );
      }

      const userKey = decryptUserKey(document.user.encryptionKey);
      const encryptedData = removeEncryptionMarker(fileBuffer);
      fileBuffer = decryptDocument(encryptedData, userKey);
    }

    // Types dangereux pouvant exécuter du JS (SVG, HTML)
    const dangerousTypes = ["image/svg+xml", "text/html", "text/xml", "application/xhtml+xml"];
    const isDangerous = dangerousTypes.includes(document.mimeType);
    const contentType = isDangerous ? "application/octet-stream" : document.mimeType;
    const disposition = isDangerous ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(document.displayName)}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("View shared document error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la visualisation" },
      { status: 500 }
    );
  }
}
