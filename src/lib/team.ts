import { db } from "@/lib/db";

const MAX_TEAM_MEMBERS = 5; // Including the owner

// 5 distinct colors for team members (owner + 4 members)
export const TEAM_COLORS = [
  "#8B5CF6", // violet (owner)
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
] as const;

/**
 * Get the effective userId for shared workspace queries.
 * If the user is a team member, returns the team owner's ID.
 * Otherwise returns the user's own ID.
 */
export async function getEffectiveUserId(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { teamOwnerId: true },
  });

  return user?.teamOwnerId || userId;
}

/**
 * Check if the current user is the team owner (or solo user).
 * Members have teamOwnerId set; owners/solo do not.
 */
export async function isTeamOwner(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { teamOwnerId: true },
  });

  // If teamOwnerId is null, user is either owner or solo (not a member)
  return !user?.teamOwnerId;
}

/**
 * Check if user has a team (is an owner with members)
 */
export async function hasTeam(userId: string): Promise<boolean> {
  const memberCount = await db.user.count({
    where: { teamOwnerId: userId },
  });
  return memberCount > 0;
}

/**
 * Get all team members for an owner (excluding the owner)
 */
export async function getTeamMembers(ownerId: string) {
  return db.user.findMany({
    where: { teamOwnerId: ownerId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      memberColor: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Count current team size (members + owner + pending invitations)
 */
export async function getTeamMemberCount(ownerId: string): Promise<number> {
  const [memberCount, pendingCount] = await Promise.all([
    db.user.count({ where: { teamOwnerId: ownerId } }),
    db.teamInvitation.count({
      where: { ownerId, status: "pending", expiresAt: { gt: new Date() } },
    }),
  ]);

  // +1 for the owner themselves
  return 1 + memberCount + pendingCount;
}

/**
 * Check if the team can accept more members
 */
export async function canInviteMore(ownerId: string): Promise<boolean> {
  const count = await getTeamMemberCount(ownerId);
  return count < MAX_TEAM_MEMBERS;
}

/**
 * Get the next available member color for a team.
 * Owner always gets TEAM_COLORS[0], members get 1-4.
 */
export async function getNextMemberColor(ownerId: string): Promise<string> {
  const usedColors = await db.user.findMany({
    where: { teamOwnerId: ownerId },
    select: { memberColor: true },
  });

  const used = new Set(usedColors.map((u) => u.memberColor));
  // Skip index 0 (owner color), assign from 1 onward
  for (let i = 1; i < TEAM_COLORS.length; i++) {
    if (!used.has(TEAM_COLORS[i])) return TEAM_COLORS[i];
  }
  return TEAM_COLORS[1]; // fallback
}

// ─── Role helpers ────────────────────────────────────────────────────────────

export type TeamRole = "owner" | "admin" | "editeur" | "lecteur";

/**
 * Returns the effective role of a user:
 * - "owner"   : no teamOwnerId, teamRole = "owner" (or solo = no teamRole)
 * - "admin"   : member with teamRole "admin"
 * - "editeur" : member with teamRole "editeur"
 * - "lecteur" : member with teamRole "lecteur"
 */
export async function getUserRole(userId: string): Promise<TeamRole | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { teamOwnerId: true, teamRole: true },
  });
  if (!user) return null;
  if (!user.teamOwnerId) return "owner"; // owner or solo
  return (user.teamRole as TeamRole) || "editeur";
}

/** Can upload documents / create folders (owner, admin, editeur) */
export async function canUpload(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "owner" || role === "admin" || role === "editeur";
}

/** Can delete / purge documents (owner, admin) */
export async function canDeleteDocs(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "owner" || role === "admin";
}

/** Can invite members and manage team (owner only) */
export async function canManageTeam(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "owner";
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a map of userId -> { name, color } for all team members + owner.
 * Used to display who added a document/folder.
 */
export async function getTeamMemberMap(ownerId: string): Promise<Record<string, { name: string; color: string }>> {
  const [owner, members] = await Promise.all([
    db.user.findUnique({
      where: { id: ownerId },
      select: { id: true, name: true, email: true, memberColor: true },
    }),
    db.user.findMany({
      where: { teamOwnerId: ownerId },
      select: { id: true, name: true, email: true, memberColor: true },
    }),
  ]);

  const map: Record<string, { name: string; color: string }> = {};
  if (owner) {
    map[owner.id] = {
      name: owner.name || owner.email,
      color: owner.memberColor || TEAM_COLORS[0],
    };
  }
  for (const m of members) {
    map[m.id] = {
      name: m.name || m.email,
      color: m.memberColor || TEAM_COLORS[1],
    };
  }
  return map;
}
