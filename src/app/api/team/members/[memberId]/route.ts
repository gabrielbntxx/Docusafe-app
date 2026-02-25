import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_ROLES = ["admin", "editeur", "lecteur"] as const;
type MemberRole = typeof VALID_ROLES[number];

// PATCH /api/team/members/[memberId] — Update role and/or folderAccess (owner only)
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
    const body = await req.json();
    const { role, folderAccess } = body as {
      role?: string;
      folderAccess?: string[] | null;
    };

    // Validate role if provided
    if (role !== undefined && !VALID_ROLES.includes(role as MemberRole)) {
      return NextResponse.json(
        { error: "Rôle invalide. Valeurs acceptées : admin, editeur, lecteur" },
        { status: 400 }
      );
    }

    // Validate folderAccess if provided (must be array of strings or null)
    if (
      folderAccess !== undefined &&
      folderAccess !== null &&
      (!Array.isArray(folderAccess) || folderAccess.some((id) => typeof id !== "string"))
    ) {
      return NextResponse.json(
        { error: "folderAccess doit être un tableau d'identifiants ou null" },
        { status: 400 }
      );
    }

    // Only the team owner can update members
    const owner = await db.user.findUnique({
      where: { id: session.user.id },
      select: { teamOwnerId: true },
    });

    if (owner?.teamOwnerId) {
      return NextResponse.json(
        { error: "Seul le propriétaire de l'équipe peut modifier les membres" },
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

    // Build the update data
    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.teamRole = role as MemberRole;
    if ("folderAccess" in body) {
      updateData.folderAccess =
        folderAccess === null ? null : JSON.stringify(folderAccess);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: memberId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      member: { id: member.id, email: member.email, role, folderAccess },
    });
  } catch (error) {
    console.error("[Team Member Update] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
