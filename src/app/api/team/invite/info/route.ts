import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/team/invite/info?token=xxx - Get invitation info (public, no auth required)
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    const invitation = await db.teamInvitation.findFirst({
      where: {
        token,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      select: {
        email: true,
        expiresAt: true,
        owner: {
          select: { name: true, email: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation invalide ou expirée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ownerName: invitation.owner.name || invitation.owner.email,
      ownerEmail: invitation.owner.email,
      email: invitation.email,
      expiresAt: invitation.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("[Team Invite Info] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
