import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Helper: resolve teamOwnerId for the current user
async function getTeamOwnerId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { planType: true, teamOwnerId: true },
  });
  if (!user) return null;
  if (user.teamOwnerId) return user.teamOwnerId; // member
  if (user.planType === "BUSINESS") return userId; // owner
  return null;
}

// GET — canal équipe + liste des membres pour DMs
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamOwnerId = await getTeamOwnerId(session.user.id);
  if (!teamOwnerId) {
    return NextResponse.json({ error: "Business plan required" }, { status: 403 });
  }

  try {
    // Team channel messages (receiverId = null)
    const channelMessages = await db.message.findMany({
      where: { teamOwnerId, receiverId: null },
      include: {
        sender: { select: { id: true, name: true, email: true, memberColor: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Team members list (owner + all members)
    const [owner, members] = await Promise.all([
      db.user.findUnique({
        where: { id: teamOwnerId },
        select: { id: true, name: true, email: true, memberColor: true },
      }),
      db.user.findMany({
        where: { teamOwnerId },
        select: { id: true, name: true, email: true, memberColor: true },
      }),
    ]);

    const teamMembers = [
      ...(owner ? [owner] : []),
      ...members,
    ].filter((m) => m.id !== session.user.id);

    // For each member, fetch last DM + unread count
    const membersWithDm = await Promise.all(
      teamMembers.map(async (member) => {
        const dmWhere = {
          teamOwnerId,
          OR: [
            { senderId: session.user.id, receiverId: member.id },
            { senderId: member.id, receiverId: session.user.id },
          ],
        };

        const [lastMessage, unreadCount] = await Promise.all([
          db.message.findFirst({
            where: dmWhere,
            orderBy: { createdAt: "desc" },
            select: { content: true, createdAt: true, senderId: true },
          }),
          db.message.count({
            where: {
              teamOwnerId,
              senderId: member.id,
              receiverId: session.user.id,
              NOT: { readBy: { contains: session.user.id } },
            },
          }),
        ]);

        return { ...member, lastMessage, unreadCount };
      })
    );

    return NextResponse.json({ channelMessages, members: membersWithDm, teamOwnerId });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST — envoyer un message dans le canal équipe
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamOwnerId = await getTeamOwnerId(session.user.id);
  if (!teamOwnerId) {
    return NextResponse.json({ error: "Business plan required" }, { status: 403 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  try {
    const message = await db.message.create({
      data: {
        teamOwnerId,
        senderId: session.user.id,
        receiverId: null,
        content: content.trim(),
        type: "text",
        readBy: JSON.stringify([session.user.id]),
      },
      include: {
        sender: { select: { id: true, name: true, email: true, memberColor: true } },
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
