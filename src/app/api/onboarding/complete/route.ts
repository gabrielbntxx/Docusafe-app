import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { profile, volume, priority } = body;

    // Determine recommended plan
    let recommendedPlan = "PRO";

    if (profile === "student") {
      recommendedPlan = "STUDENT";
    } else if (profile === "business" || priority === "collaboration") {
      recommendedPlan = "BUSINESS";
    } else if (priority === "simplicity" && volume === "low") {
      recommendedPlan = "STUDENT";
    } else {
      recommendedPlan = "PRO";
    }

    // Mark onboarding as completed
    await db.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({
      success: true,
      recommendedPlan,
    });
  } catch (error) {
    console.error("[Onboarding] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
