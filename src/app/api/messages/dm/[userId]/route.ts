import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function getTeamOwnerId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { planType: true, teamOwnerId: true },
  });
  if (!user) return null;
  if (user.teamOwnerId) return user.teamOwnerId;
  if (user.planType === "BUSINESS") return userId;
  return null;
}

// Vérifie que targetId appartient bien à la même équipe que teamOwnerId
async function isTeamMember(targetId: string, teamOwnerId: string): Promise<boolean> {
  const target = await db.user.findUnique({
    where: { id: targetId },
    select: { id: true, teamOwnerId: true, planType: true },
  });
  if (!target) return false;
  // Le destinataire est soit le owner de l'équipe, soit un membre de cette équipe
  const targetTeam = target.teamOwnerId ?? (target.planType === "BUSINESS" ? target.id : null);
  return targetTeam === teamOwnerId;
}

// GET — messages DM entre moi et userId
export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamOwnerId = await getTeamOwnerId(session.user.id);
  if (!teamOwnerId) {
    return NextResponse.json({ error: "Business plan required" }, { status: 403 });
  }

  if (!(await isTeamMember(params.userId, teamOwnerId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const messages = await db.message.findMany({
      where: {
        teamOwnerId,
        OR: [
          { senderId: session.user.id, receiverId: params.userId },
          { senderId: params.userId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, email: true, memberColor: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching DM:", error);
    return NextResponse.json({ error: "Failed to fetch DM" }, { status: 500 });
  }
}

// POST — envoyer un DM
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamOwnerId = await getTeamOwnerId(session.user.id);
  if (!teamOwnerId) {
    return NextResponse.json({ error: "Business plan required" }, { status: 403 });
  }

  if (!(await isTeamMember(params.userId, teamOwnerId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        receiverId: params.userId,
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
    console.error("Error sending DM:", error);
    return NextResponse.json({ error: "Failed to send DM" }, { status: 500 });
  }
}
