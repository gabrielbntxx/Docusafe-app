import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";

// Lightweight GET endpoint used by DocuBot frontend to decide which quick actions to show.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ expiringCount: 0 }, { status: 401 });
    }

    const userId = await getEffectiveUserId(session.user.id);

    const expiringCount = await db.document.count({
      where: {
        userId,
        expiryDate: {
          not: null,
          lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({ expiringCount });
  } catch {
    return NextResponse.json({ expiringCount: 0 });
  }
}
