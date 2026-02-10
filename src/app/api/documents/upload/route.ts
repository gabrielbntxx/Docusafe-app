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
import {
  encryptDocument,
  addEncryptionMarker,
  generateUserEncryptionKey,
  encryptUserKey,
  decryptUserKey,
} from "@/lib/encryption";
import { applyFolderRules } from "@/lib/folder-rules";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Check subscription - FREE users cannot upload
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true },
    });
    if (!currentUser || currentUser.planType === "FREE") {
      return NextResponse.json(
        { error: "Abonnement requis pour importer des documents" },
        { status: 403 }
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

    // Récupérer les infos utilisateur avec la clé de chiffrement
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        planType: true,
        documentsCount: true,
        storageUsedBytes: true,
        encryptionKey: true,
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
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Verify folder belongs to user if provided
    if (folderId) {
      const folder = await db.folder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
        },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Dossier non trouvé" },
          { status: 404 }
        );
      }
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

    // Appliquer les règles du dossier (ex: conversion en PDF)
    const processedFile = await applyFolderRules(
      folderId,
      buffer,
      fileValidation.sanitizedName,
      file.type
    );

    // Utiliser le fichier traité pour le reste de l'upload
    const finalFileBuffer = processedFile.buffer;
    const finalFileName = processedFile.fileName;
    const finalMimeType = processedFile.mimeType;
    const finalFileSize = finalFileBuffer.length;

    // Générer un nom de fichier sécurisé pour le stockage
    const secureFilename = generateSecureFilename(
      finalFileName,
      session.user.id
    );

    // Générer la clé de stockage avec le nom sécurisé
    const storageKey = generateStorageKey(session.user.id, secureFilename);

    // Obtenir ou créer la clé de chiffrement utilisateur
    let userEncryptionKey: string;
    if (user.encryptionKey) {
      // Déchiffrer la clé existante
      userEncryptionKey = decryptUserKey(user.encryptionKey);
    } else {
      // Générer une nouvelle clé pour l'utilisateur
      userEncryptionKey = generateUserEncryptionKey();
      const encryptedKey = encryptUserKey(userEncryptionKey);
      await db.user.update({
        where: { id: session.user.id },
        data: { encryptionKey: encryptedKey },
      });
    }

    // Chiffrer le document (utiliser le fichier traité)
    const encryptedBuffer = encryptDocument(finalFileBuffer, userEncryptionKey);
    const encryptedFinalBuffer = addEncryptionMarker(encryptedBuffer);

    // Upload vers R2 (données chiffrées)
    await uploadToR2(storageKey, encryptedFinalBuffer, "application/octet-stream");

    // Déterminer le type de fichier (utiliser le type final après règles)
    let fileType = "other";
    if (finalMimeType === "application/pdf") fileType = "pdf";
    else if (finalMimeType.startsWith("image/")) fileType = "image";
    else if (finalMimeType.startsWith("audio/")) fileType = "audio";
    else if (finalMimeType.startsWith("video/")) fileType = "video";

    // Créer l'entrée dans la DB avec le nom final (après règles)
    const document = await db.document.create({
      data: {
        userId: session.user.id,
        folderId: folderId || null, // Associate with folder if provided
        originalName: processedFile.wasConverted
          ? processedFile.originalFileName || fileValidation.sanitizedName
          : fileValidation.sanitizedName,
        displayName: finalFileName,
        fileType,
        mimeType: finalMimeType,
        sizeBytes: BigInt(finalFileSize),
        storageKey,
        storageUrl: `r2://${storageKey}`,
        aiAnalyzed: 0, // Not analyzed yet
        isEncrypted: 1, // Document chiffré
        // Store conversion info in description if converted
        description: processedFile.wasConverted
          ? `Converti depuis ${processedFile.originalMimeType}`
          : null,
      },
    });

    // Mettre à jour les statistiques utilisateur (avec taille finale)
    await db.user.update({
      where: { id: session.user.id },
      data: {
        documentsCount: { increment: 1 },
        storageUsedBytes: { increment: finalFileSize },
      },
    });

    // Créer une notification
    await createNotification(
      session.user.id,
      "document_uploaded",
      finalFileName
    );

    return NextResponse.json(
      {
        document: {
          id: document.id,
          name: document.displayName,
          size: finalFileSize,
          type: fileType,
          wasConverted: processedFile.wasConverted,
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
