import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import {
  uploadToR2,
  generateStorageKey,
  checkStorageLimit,
  checkFileSizeLimit,
  checkDocumentLimit,
} from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
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

    // Vérifier le type de fichier
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Formats acceptés: PDF, JPG, PNG, GIF" },
        { status: 400 }
      );
    }

    // Vérifier la limite de taille du fichier
    const fileSizeCheck = checkFileSizeLimit(user.planType, file.size);
    if (!fileSizeCheck.allowed) {
      return NextResponse.json(
        { error: fileSizeCheck.reason },
        { status: 403 }
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

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer la clé de stockage
    const storageKey = generateStorageKey(session.user.id, file.name);

    // Upload vers R2
    await uploadToR2(storageKey, buffer, file.type);

    // Déterminer le type de fichier
    let fileType = "other";
    if (file.type === "application/pdf") fileType = "pdf";
    else if (file.type.startsWith("image/")) fileType = "image";

    // Créer l'entrée dans la DB
    const document = await db.document.create({
      data: {
        userId: session.user.id,
        originalName: file.name,
        displayName: file.name,
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
      file.name
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
