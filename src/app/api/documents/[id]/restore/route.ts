import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/documents/[id]/restore — restore a soft-deleted document
export async function POST(
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
      select: { id: true, userId: true, deletedAt: true },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    if (!document.deletedAt) {
      return NextResponse.json({ error: "Document déjà actif" }, { status: 400 });
    }

    await db.document.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json({ message: "Document restauré" });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
