import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE - Delete a share link
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

    // Find the share and verify ownership
    const share = await db.sharedLink.findUnique({
      where: { id },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Partage non trouvé" },
        { status: 404 }
      );
    }

    if (share.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Delete the share (cascade deletes items)
    await db.sharedLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete share error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du partage" },
      { status: 500 }
    );
  }
}
