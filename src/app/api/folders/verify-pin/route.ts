import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { folderId, pin } = await req.json();

    if (!folderId || !pin) {
      return NextResponse.json(
        { error: "Folder ID et PIN requis" },
        { status: 400 }
      );
    }

    // Récupérer le dossier
    const folder = await db.folder.findUnique({
      where: { id: folderId },
      select: {
        userId: true,
        pin: true,
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Dossier non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Vérifier le PIN
    if (!folder.pin) {
      return NextResponse.json(
        { error: "Ce dossier n'est pas protégé" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(pin, folder.pin);

    if (!isValid) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification du PIN" },
      { status: 500 }
    );
  }
}
