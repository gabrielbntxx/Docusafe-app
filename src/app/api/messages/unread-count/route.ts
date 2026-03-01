import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — total des messages non lus (canal + tous DMs)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true, teamOwnerId: true },
    });

    if (!user) return NextResponse.json({ count: 0 });

    const teamOwnerId =
      user.teamOwnerId ?? (user.planType === "BUSINESS" ? session.user.id : null);

    if (!teamOwnerId) return NextResponse.json({ count: 0 });

    const count = await db.message.count({
      where: {
        teamOwnerId,
        NOT: { readBy: { contains: session.user.id } },
        OR: [
          { receiverId: null }, // canal équipe
          { receiverId: session.user.id }, // DM pour moi
        ],
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ count: 0 });
  }
}
