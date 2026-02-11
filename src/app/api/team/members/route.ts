import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTeamMembers, getTeamMemberCount } from "@/lib/team";

// GET /api/team/members - List team members
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check user is team owner
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { teamOwnerId: true, planType: true },
    });

    if (!user || user.teamOwnerId) {
      return NextResponse.json(
        { error: "Seul le propriétaire peut voir les membres" },
        { status: 403 }
      );
    }

    const [members, totalCount] = await Promise.all([
      getTeamMembers(session.user.id),
      getTeamMemberCount(session.user.id),
    ]);

    return NextResponse.json({ members, totalCount, maxMembers: 5 });
  } catch (error) {
    console.error("[Team Members] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    );
  }
}

// DELETE /api/team/members - Remove a team member
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { memberId } = await req.json();
    if (!memberId) {
      return NextResponse.json({ error: "ID membre requis" }, { status: 400 });
    }

    // Verify ownership
    const member = await db.user.findFirst({
      where: { id: memberId, teamOwnerId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    // Remove from team
    await db.user.update({
      where: { id: memberId },
      data: { teamOwnerId: null, teamRole: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Team Members] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du retrait du membre" },
      { status: 500 }
    );
  }
}
