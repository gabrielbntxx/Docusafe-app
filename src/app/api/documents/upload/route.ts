import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import {
  uploadToR2,
  generateStorageKey,
  checkStorageLimit,
  checkDocumentLimit,
} from "@/lib/storage";
import {
  validateFile,
  checkRateLimit,
  getClientIdentifier,
  generateSecureFilename,
} from "@/lib/security";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Rate limiting pour les uploads
    const clientId = await getClientIdentifier(session.user.id);
    const rateLimit = checkRateLimit(clientId, "upload");

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Récupérer les infos utilisateur
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        planType: true,
        documentsCount: true,
        storageUsedBytes: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Parser le FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer pour validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validation complète du fichier (type, taille, magic bytes, nom)
    const fileValidation = await validateFile(file, buffer);

    if (!fileValidation.valid) {
      return NextResponse.json(
        {
          error: "Fichier invalide",
          details: fileValidation.errors,
        },
        { status: 400 }
      );
    }

    // Vérifier le nombre de documents
    const documentCheck = checkDocumentLimit(user.planType, user.documentsCount);
    if (!documentCheck.allowed) {
      return NextResponse.json(
        { error: documentCheck.reason },
        { status: 403 }
      );
    }

    // Vérifier la limite de stockage
    const storageCheck = checkStorageLimit(
      user.planType,
      Number(user.storageUsedBytes),
      file.size
    );
    if (!storageCheck.allowed) {
      return NextResponse.json(
        { error: storageCheck.reason },
        { status: 403 }
      );
    }

    // Générer un nom de fichier sécurisé pour le stockage
    const secureFilename = generateSecureFilename(
      fileValidation.sanitizedName,
      session.user.id
    );

    // Générer la clé de stockage avec le nom sécurisé
    const storageKey = generateStorageKey(session.user.id, secureFilename);

    // Upload vers R2
    await uploadToR2(storageKey, buffer, file.type);

    // Déterminer le type de fichier
    let fileType = "other";
    if (file.type === "application/pdf") fileType = "pdf";
    else if (file.type.startsWith("image/")) fileType = "image";

    // Créer l'entrée dans la DB avec le nom sanitisé
    const document = await db.document.create({
      data: {
        userId: session.user.id,
        originalName: fileValidation.sanitizedName, // Nom sanitisé
        displayName: fileValidation.sanitizedName,
        fileType,
        mimeType: file.type,
        sizeBytes: BigInt(file.size),
        storageKey,
        storageUrl: `r2://${storageKey}`,
        ocrStatus: "PENDING",
      },
    });

    // Mettre à jour les statistiques utilisateur
    await db.user.update({
      where: { id: session.user.id },
      data: {
        documentsCount: { increment: 1 },
        storageUsedBytes: { increment: file.size },
      },
    });

    // Créer une notification
    await createNotification(
      session.user.id,
      "document_uploaded",
      fileValidation.sanitizedName
    );

    return NextResponse.json(
      {
        document: {
          id: document.id,
          name: document.displayName,
          size: file.size,
          type: fileType,
        },
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
