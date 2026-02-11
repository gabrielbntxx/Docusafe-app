import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNextMemberColor, TEAM_COLORS } from "@/lib/team";

// POST /api/team/accept - Accept a team invitation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    // Find valid invitation
    const invitation = await db.teamInvitation.findFirst({
      where: {
        token,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation invalide ou expirée" },
        { status: 404 }
      );
    }

    // Can't accept your own invitation
    if (invitation.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas accepter votre propre invitation" },
        { status: 400 }
      );
    }

    // Check user is not already in a team
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { teamOwnerId: true, teamRole: true, planType: true },
    });

    if (currentUser?.teamOwnerId) {
      return NextResponse.json(
        { error: "Vous êtes déjà membre d'une équipe. Quittez-la d'abord." },
        { status: 400 }
      );
    }

    if (currentUser?.teamRole === "owner") {
      return NextResponse.json(
        { error: "Vous êtes propriétaire d'une équipe. Vous ne pouvez pas rejoindre une autre équipe." },
        { status: 400 }
      );
    }

    // Assign a unique color for this member
    const memberColor = await getNextMemberColor(invitation.ownerId);

    // Also ensure owner has their color set
    const owner = await db.user.findUnique({
      where: { id: invitation.ownerId },
      select: { memberColor: true },
    });
    if (!owner?.memberColor) {
      await db.user.update({
        where: { id: invitation.ownerId },
        data: { memberColor: TEAM_COLORS[0] },
      });
    }

    // Accept: update user and invitation in a transaction
    // - Set team membership + color
    // - Upgrade planType to BUSINESS
    // - Mark onboarding as completed so they go straight to dashboard
    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: {
          teamOwnerId: invitation.ownerId,
          teamRole: "member",
          planType: "BUSINESS",
          memberColor,
          onboardingCompleted: true,
        },
      }),
      db.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: "accepted" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      team: {
        ownerName: invitation.owner.name || invitation.owner.email,
      },
    });
  } catch (error) {
    console.error("[Team Accept] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'acceptation" },
      { status: 500 }
    );
  }
}
