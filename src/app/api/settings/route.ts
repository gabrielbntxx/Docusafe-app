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

    // Check subscription - FREE users cannot modify settings
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true },
    });
    if (!currentUser || currentUser.planType === "FREE") {
      return NextResponse.json(
        { error: "Abonnement requis pour modifier les paramètres" },
        { status: 403 }
      );
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
