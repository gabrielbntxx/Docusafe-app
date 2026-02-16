import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { canInviteMore } from "@/lib/team";
import { hasActiveSubscription } from "@/lib/storage";
import { sendTeamInvitationEmail } from "@/lib/email";
import crypto from "crypto";

// POST /api/team/invite - Send a team invitation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check user is BUSINESS plan with active subscription
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true, name: true, email: true, teamOwnerId: true, subscriptionStatus: true },
    });

    if (!user || user.planType !== "BUSINESS") {
      return NextResponse.json(
        { error: "Le plan Business est requis pour inviter des membres" },
        { status: 403 }
      );
    }
    if (!hasActiveSubscription(user)) {
      return NextResponse.json(
        { error: "Votre abonnement est expiré. Veuillez renouveler votre paiement." },
        { status: 403 }
      );
    }

    // Members can't invite
    if (user.teamOwnerId) {
      return NextResponse.json(
        { error: "Seul le propriétaire de l'équipe peut inviter" },
        { status: 403 }
      );
    }

    // Can't invite yourself
    if (normalizedEmail === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous inviter vous-même" },
        { status: 400 }
      );
    }

    // Check team size limit
    const canInvite = await canInviteMore(session.user.id);
    if (!canInvite) {
      return NextResponse.json(
        { error: "Limite de 5 membres atteinte (invitations en attente incluses)" },
        { status: 400 }
      );
    }

    // Check if already invited (pending)
    const existingInvite = await db.teamInvitation.findFirst({
      where: {
        ownerId: session.user.id,
        email: normalizedEmail,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Une invitation est déjà en attente pour cet email" },
        { status: 400 }
      );
    }

    // Check if this person is already a member
    const existingMember = await db.user.findFirst({
      where: {
        email: normalizedEmail,
        teamOwnerId: session.user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Cette personne est déjà membre de votre équipe" },
        { status: 400 }
      );
    }

    // Set teamRole to "owner" if first time inviting
    await db.user.update({
      where: { id: session.user.id },
      data: { teamRole: "owner" },
    });

    // Generate invitation token and hash it for storage
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation (store hash, not raw token)
    const invitation = await db.teamInvitation.create({
      data: {
        ownerId: session.user.id,
        email: normalizedEmail,
        token: tokenHash,
        expiresAt,
      },
    });

    // Send email (await to report status)
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.docusafe.online";
    const inviteLink = `${baseUrl}/invite/${token}`;
    let emailSent = false;

    try {
      const emailResult = await sendTeamInvitationEmail(
        normalizedEmail,
        user.name || "Un utilisateur DocuSafe",
        token
      );
      emailSent = emailResult.success;
      if (!emailSent) {
        console.error("[Team] Email not sent:", emailResult.error);
      }
    } catch (err) {
      console.error("[Team] Failed to send invitation email:", err);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      inviteLink,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("[Team Invite] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'invitation" },
      { status: 500 }
    );
  }
}

// GET /api/team/invite - List pending invitations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const invitations = await db.teamInvitation.findMany({
      where: {
        ownerId: session.user.id,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("[Team Invite] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des invitations" },
      { status: 500 }
    );
  }
}

// DELETE /api/team/invite - Revoke an invitation
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { invitationId } = await req.json();
    if (!invitationId) {
      return NextResponse.json({ error: "ID invitation requis" }, { status: 400 });
    }

    const invitation = await db.teamInvitation.findFirst({
      where: { id: invitationId, ownerId: session.user.id, status: "pending" },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation non trouvée" }, { status: 404 });
    }

    await db.teamInvitation.update({
      where: { id: invitationId },
      data: { status: "revoked" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Team Invite] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    );
  }
}
