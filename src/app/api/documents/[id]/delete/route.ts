import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { deleteFromR2 } from "@/lib/storage";
import { getEffectiveUserId } from "@/lib/team";

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

    // Check document belongs to user's workspace (shared team or own)
    const effectiveUserId = await getEffectiveUserId(session.user.id);
    if (document.userId !== effectiveUserId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Supprimer le fichier de R2
    try {
      await deleteFromR2(document.storageKey);
    } catch (fileError) {
      console.error("Error deleting file from R2:", fileError);
    }

    // Récupérer les stats du propriétaire de l'espace
    const user = await db.user.findUnique({
      where: { id: effectiveUserId },
      select: {
        documentsCount: true,
        storageUsedBytes: true,
      },
    });

    // Supprimer l'entrée en base de données
    await db.document.delete({
      where: { id },
    });

    // Mettre à jour les statistiques du propriétaire
    const newDocumentsCount = Math.max(0, (user?.documentsCount || 0) - 1);
    const newStorageUsed = Math.max(0, Number(user?.storageUsedBytes || 0) - Number(document.sizeBytes));

    await db.user.update({
      where: { id: effectiveUserId },
      data: {
        documentsCount: newDocumentsCount,
        storageUsedBytes: BigInt(newStorageUsed),
      },
    });

    // Créer une notification
    await createNotification(
      effectiveUserId,
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
