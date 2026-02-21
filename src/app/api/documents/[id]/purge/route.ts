import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFromR2 } from "@/lib/storage";
import { revalidatePath } from "next/cache";

// DELETE /api/documents/[id]/purge — permanently delete one trashed document
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const document = await db.document.findUnique({
      where: { id },
      select: { id: true, userId: true, storageKey: true, deletedAt: true, sizeBytes: true },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    // Only allow purging documents that are in the trash
    if (!document.deletedAt) {
      return NextResponse.json({ error: "Utilisez l'endpoint delete normal" }, { status: 400 });
    }

    // Delete from R2 then DB
    try {
      await deleteFromR2(document.storageKey);
    } catch (e) {
      console.error("R2 purge error:", e);
    }

    await db.document.delete({ where: { id } });

    // Update user counters
    await db.user.update({
      where: { id: document.userId },
      data: {
        documentsCount: { decrement: 1 },
        storageUsedBytes: { decrement: Number(document.sizeBytes) || 0 },
      },
    });

    revalidatePath("/dashboard", "layout");

    return NextResponse.json({ message: "Document supprimé définitivement" });
  } catch (error) {
    console.error("Purge error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
