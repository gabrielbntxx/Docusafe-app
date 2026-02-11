import { db } from "@/lib/db";

const MAX_TEAM_MEMBERS = 5; // Including the owner

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
