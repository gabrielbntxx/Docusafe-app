import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSignedViewUrl } from "@/lib/storage";

// GET - Récupérer l'URL signée de l'image de profil
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (!user?.image) {
      return NextResponse.json({ imageUrl: null });
    }

    // Si l'image est sur R2, générer une URL signée
    if (user.image.startsWith("r2://")) {
      const storageKey = user.image.replace("r2://", "");
      const signedUrl = await getSignedViewUrl(storageKey, 86400); // 24h
      return NextResponse.json({ imageUrl: signedUrl });
    }

    // Sinon, retourner l'URL telle quelle (anciennes images locales)
    return NextResponse.json({ imageUrl: user.image });
  } catch (error) {
    console.error("Error getting profile image:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'image" },
      { status: 500 }
    );
  }
}
