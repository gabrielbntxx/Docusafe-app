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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const effectiveUserId = await getEffectiveUserId(session.user.id);

    const document = await db.document.findUnique({
      where: { id, deletedAt: null },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    if (document.userId !== effectiveUserId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Team members can't download private docs they didn't upload
    const isOwner = effectiveUserId === session.user.id;
    if (!isOwner && document.isPrivate === 1 && document.addedById !== session.user.id) {
      return NextResponse.json(
        { error: "Ce document est privé" },
        { status: 403 }
      );
    }

    // Récupérer le fichier depuis R2
    let fileBuffer = await getFromR2(document.storageKey);

    // Déchiffrer avec la clé du propriétaire de l'espace
    if (document.isEncrypted === 1 && isEncrypted(fileBuffer)) {
      const owner = await db.user.findUnique({
        where: { id: effectiveUserId },
        select: { encryptionKey: true },
      });

      if (!owner?.encryptionKey) {
        return NextResponse.json(
          { error: "Clé de chiffrement manquante" },
          { status: 500 }
        );
      }

      const userKey = decryptUserKey(owner.encryptionKey);
      const encryptedData = removeEncryptionMarker(fileBuffer);
      fileBuffer = decryptDocument(encryptedData, userKey);
    }

    // Retourner le fichier en téléchargement (attachment)
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalName)}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}
