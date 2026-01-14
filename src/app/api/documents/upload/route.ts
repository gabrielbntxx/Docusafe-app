import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { createNotification } from "@/lib/notifications";

// Limite de taille: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Quotas
const FREE_PLAN_LIMITS = {
  maxDocuments: 5,
  maxStorage: 2 * 1024 * 1024, // 2MB
};

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

    // Vérifier les quotas pour plan FREE
    if (user.planType === "FREE") {
      if (user.documentsCount >= FREE_PLAN_LIMITS.maxDocuments) {
        return NextResponse.json(
          { error: `Limite atteinte: ${FREE_PLAN_LIMITS.maxDocuments} fichiers maximum pour le plan FREE. Passez à la version Pro pour plus de fichiers.` },
          { status: 403 }
        );
      }

      if (Number(user.storageUsedBytes) >= FREE_PLAN_LIMITS.maxStorage) {
        return NextResponse.json(
          { error: "Limite de stockage atteinte: 2MB maximum pour le plan FREE. Passez à la version Pro pour plus de stockage." },
          { status: 403 }
        );
      }
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

    // Vérifier la taille du fichier pour le plan FREE
    if (user.planType === "FREE" && file.size > FREE_PLAN_LIMITS.maxStorage) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 2MB par fichier pour le plan FREE). Passez à la version Pro pour télécharger des fichiers plus volumineux." },
        { status: 403 }
      );
    }

    // Vérifier la taille générale (10MB pour PRO)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10MB)" },
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
        { error: "Type de fichier non supporté" },
        { status: 400 }
      );
    }

    // Vérifier si le stockage après upload dépasserait la limite
    if (
      user.planType === "FREE" &&
      Number(user.storageUsedBytes) + file.size > FREE_PLAN_LIMITS.maxStorage
    ) {
      return NextResponse.json(
        { error: "Ce fichier dépasserait votre limite de stockage de 2MB. Passez à la version Pro pour plus de stockage." },
        { status: 403 }
      );
    }

    // Générer un nom unique
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueId = randomBytes(16).toString("hex");
    const fileExtension = file.name.split(".").pop();
    const storageKey = `${uniqueId}.${fileExtension}`;

    // Sauvegarder le fichier localement
    const uploadDir = join(process.cwd(), "uploads");
    const filePath = join(uploadDir, storageKey);

    await writeFile(filePath, buffer);

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
        storageUrl: `/uploads/${storageKey}`,
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
