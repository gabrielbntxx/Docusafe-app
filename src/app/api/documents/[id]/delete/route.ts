import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { getEffectiveUserId } from "@/lib/team";
import { revalidatePath } from "next/cache";

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

    // Récupérer le document (y compris déjà supprimés pour éviter double-delete)
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

    // Soft delete: move to trash (keep R2 file for 30-day restore window)
    await db.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Créer une notification
    await createNotification(
      effectiveUserId,
      "document_deleted",
      document.displayName
    );

    revalidatePath("/dashboard", "layout");

    return NextResponse.json(
      { message: "Document déplacé dans la corbeille" },
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
