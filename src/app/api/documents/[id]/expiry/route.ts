import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";

// PATCH /api/documents/[id]/expiry - Set or clear the expiry date of a document
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    // expiryDate can be an ISO string or null (to clear it)
    const { expiryDate } = body as { expiryDate: string | null };

    const document = await db.document.findUnique({ where: { id } });

    if (!document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    const effectiveUserId = await getEffectiveUserId(session.user.id);
    if (document.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const parsedDate = expiryDate ? new Date(expiryDate) : null;
    if (expiryDate && isNaN(parsedDate!.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const updated = await db.document.update({
      where: { id },
      data: {
        expiryDate: parsedDate,
        // Reset notifications when date is changed so user gets fresh alerts
        expiryNotified: parsedDate ? "[]" : null,
      },
    });

    return NextResponse.json({
      success: true,
      expiryDate: updated.expiryDate,
    });
  } catch (error) {
    console.error("Error updating document expiry:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la date d'expiration" },
      { status: 500 }
    );
  }
}
