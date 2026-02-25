import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_ROLES = ["admin", "editeur", "lecteur"] as const;
type MemberRole = typeof VALID_ROLES[number];

// PATCH /api/team/members/[memberId] — Update a team member's role (owner only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { memberId } = await params;
    const { role } = await req.json();

    if (!role || !VALID_ROLES.includes(role as MemberRole)) {
      return NextResponse.json(
        { error: "Rôle invalide. Valeurs acceptées : admin, editeur, lecteur" },
        { status: 400 }
      );
    }

    // Only the team owner can change roles
    const owner = await db.user.findUnique({
      where: { id: session.user.id },
      select: { teamOwnerId: true, teamRole: true },
    });

    if (owner?.teamOwnerId) {
      return NextResponse.json(
        { error: "Seul le propriétaire de l'équipe peut modifier les rôles" },
        { status: 403 }
      );
    }

    // Verify the target member belongs to this owner's team
    const member = await db.user.findFirst({
      where: { id: memberId, teamOwnerId: session.user.id },
      select: { id: true, name: true, email: true, teamRole: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre non trouvé dans votre équipe" },
        { status: 404 }
      );
    }

    await db.user.update({
      where: { id: memberId },
      data: { teamRole: role as MemberRole },
    });

    return NextResponse.json({
      success: true,
      member: { id: member.id, email: member.email, role },
    });
  } catch (error) {
    console.error("[Team Member Role] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
