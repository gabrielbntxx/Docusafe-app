import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// PATCH /api/documents/[id]/privacy — Toggle isPrivate (owner only)
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Only the workspace owner (no teamOwnerId) can toggle privacy
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { teamOwnerId: true },
    });

    if (user?.teamOwnerId) {
      return NextResponse.json(
        { error: "Seul le propriétaire du compte peut modifier la confidentialité des documents" },
        { status: 403 }
      );
    }

    const document = await db.document.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, userId: true, isPrivate: true },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    const newPrivate = document.isPrivate === 1 ? 0 : 1;

    await db.document.update({
      where: { id },
      data: { isPrivate: newPrivate },
    });

    revalidatePath("/dashboard", "layout");

    return NextResponse.json({ success: true, isPrivate: newPrivate === 1 });
  } catch (error) {
    console.error("[Document Privacy] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
