import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH - Update user settings
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { language, theme, notifications } = await req.json();

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(language && { language }),
        ...(theme && { theme }),
        ...(notifications !== undefined && { notificationsEnabled: notifications ? 1 : 0 }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    );
  }
}
