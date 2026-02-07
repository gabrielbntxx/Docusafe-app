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

    // Récupérer le document avec les infos utilisateur
    const document = await db.document.findUnique({
      where: { id },
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

    // Vérifier que le document appartient à l'utilisateur
    if (document.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer le fichier depuis R2
    let fileBuffer = await getFromR2(document.storageKey);

    // Déchiffrer si le document est chiffré
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
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(document.originalName)}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("View error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la visualisation" },
      { status: 500 }
    );
  }
}
