import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";
import { createNotification } from "@/lib/notifications";

export async function DELETE(
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

    // Await params
    const { id } = await params;

    // Récupérer le document
    const document = await db.document.findUnique({
      where: { id },
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

    // Supprimer le fichier physique
    try {
      const filePath = join(process.cwd(), "uploads", document.storageKey);
      await unlink(filePath);
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // Continue même si le fichier n'existe pas
    }

    // Récupérer les stats actuelles de l'utilisateur
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        documentsCount: true,
        storageUsedBytes: true,
      },
    });

    // Supprimer l'entrée en base de données
    await db.document.delete({
      where: { id },
    });

    // Mettre à jour les statistiques utilisateur en évitant les valeurs négatives
    const newDocumentsCount = Math.max(0, (user?.documentsCount || 0) - 1);
    const newStorageUsed = Math.max(0, Number(user?.storageUsedBytes || 0) - Number(document.sizeBytes));

    await db.user.update({
      where: { id: session.user.id },
      data: {
        documentsCount: newDocumentsCount,
        storageUsedBytes: BigInt(newStorageUsed),
      },
    });

    // Créer une notification
    await createNotification(
      session.user.id,
      "document_deleted",
      document.displayName
    );

    return NextResponse.json(
      { message: "Document supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
