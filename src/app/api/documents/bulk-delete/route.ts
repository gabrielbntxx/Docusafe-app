import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId, canDeleteDocs } from "@/lib/team";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "Aucun document sélectionné" }, { status: 400 });
    }
    if (ids.length > 500) {
      return NextResponse.json({ error: "Trop de documents (max 500)" }, { status: 400 });
    }

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // Team member permission check
    if (session.user.id !== effectiveUserId) {
      const allowed = await canDeleteDocs(session.user.id);
      if (!allowed) {
        return NextResponse.json(
          { error: "Votre rôle ne vous permet pas de supprimer des documents" },
          { status: 403 }
        );
      }
    }

    // Atomic soft-delete — only touches documents that belong to this workspace
    const result = await db.document.updateMany({
      where: {
        id: { in: ids },
        userId: effectiveUserId,
        deletedAt: null, // skip already-deleted docs
      },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/dashboard", "layout");

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
