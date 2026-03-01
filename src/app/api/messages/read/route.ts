import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST — marquer les messages comme lus
// Body: { teamOwnerId: string, receiverId?: string | null }
// receiverId = undefined or null → canal équipe ; userId → DM
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamOwnerId, receiverId } = await request.json();
  if (!teamOwnerId) {
    return NextResponse.json({ error: "teamOwnerId required" }, { status: 400 });
  }

  try {
    // Find unread messages in this conversation
    const where =
      receiverId
        ? {
            teamOwnerId,
            OR: [
              { senderId: receiverId, receiverId: session.user.id },
              { senderId: session.user.id, receiverId },
            ],
            NOT: { readBy: { contains: session.user.id } },
          }
        : {
            teamOwnerId,
            receiverId: null,
            NOT: { readBy: { contains: session.user.id } },
          };

    const unread = await db.message.findMany({ where, select: { id: true, readBy: true } });

    for (const msg of unread) {
      const readByArr: string[] = JSON.parse(msg.readBy || "[]");
      if (!readByArr.includes(session.user.id)) {
        readByArr.push(session.user.id);
        await db.message.update({
          where: { id: msg.id },
          data: { readBy: JSON.stringify(readByArr) },
        });
      }
    }

    return NextResponse.json({ ok: true, marked: unread.length });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
