import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image trop volumineuse (max 5MB)" },
        { status: 400 }
      );
    }

    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Générer un nom unique
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueId = randomBytes(16).toString("hex");
    const fileExtension = file.name.split(".").pop();
    const storageKey = `profile_${uniqueId}.${fileExtension}`;

    // Sauvegarder le fichier localement
    const uploadDir = join(process.cwd(), "uploads");
    const filePath = join(uploadDir, storageKey);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${storageKey}`;

    // Mettre à jour l'utilisateur
    await db.user.update({
      where: { id: session.user.id },
      data: {
        image: imageUrl,
      },
    });

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
