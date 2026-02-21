import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFromR2 } from "@/lib/storage";
import { revalidatePath } from "next/cache";

const TRASH_RETENTION_DAYS = 30;

// GET /api/documents/trash — list soft-deleted docs for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRASH_RETENTION_DAYS);

    const documents = await db.document.findMany({
      where: {
        userId: session.user.id,
        deletedAt: { not: null },
        // Only show docs deleted within the retention window
        // (older ones will be purged by the cleanup job)
      },
      select: {
        id: true,
        displayName: true,
        originalName: true,
        fileType: true,
        mimeType: true,
        sizeBytes: true,
        deletedAt: true,
        folder: { select: { id: true, name: true, color: true } },
      },
      orderBy: { deletedAt: "desc" },
    });

    const serialized = documents.map((doc) => ({
      ...doc,
      sizeBytes: Number(doc.sizeBytes),
      daysLeft: doc.deletedAt
        ? Math.max(
            0,
            TRASH_RETENTION_DAYS -
              Math.floor(
                (Date.now() - new Date(doc.deletedAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
          )
        : 0,
    }));

    return NextResponse.json({ documents: serialized });
  } catch (error) {
    console.error("Trash GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/documents/trash — permanently delete ALL trashed docs for the user
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const trashed = await db.document.findMany({
      where: { userId: session.user.id, deletedAt: { not: null } },
      select: { id: true, storageKey: true, sizeBytes: true },
    });

    // Delete from R2 in parallel, ignore individual errors
    await Promise.allSettled(trashed.map((doc) => deleteFromR2(doc.storageKey)));

    // Delete from DB
    await db.document.deleteMany({
      where: { userId: session.user.id, deletedAt: { not: null } },
    });

    // Update user counters
    if (trashed.length > 0) {
      const totalBytes = trashed.reduce((sum, d) => sum + Number(d.sizeBytes), 0);
      await db.user.update({
        where: { id: session.user.id },
        data: {
          documentsCount: { decrement: trashed.length },
          storageUsedBytes: { decrement: totalBytes },
        },
      });
    }

    revalidatePath("/dashboard", "layout");

    return NextResponse.json({ deleted: trashed.length });
  } catch (error) {
    console.error("Trash DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
