import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";
import { hasActiveSubscription } from "@/lib/storage";

// GET — list workflow templates for the workspace
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = await getEffectiveUserId(session.user.id);

    const templates = await db.workflowTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      templates.map((t) => ({
        ...t,
        steps: JSON.parse(t.steps || "[]"),
      }))
    );
  } catch (error) {
    console.error("Error listing workflows:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — create a new workflow template
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true, teamOwnerId: true, subscriptionStatus: true },
    });

    if (!currentUser || (currentUser.planType !== "BUSINESS" && !currentUser.teamOwnerId)) {
      return NextResponse.json(
        { error: "Le plan Business est requis pour créer des workflows" },
        { status: 403 }
      );
    }

    if (!hasActiveSubscription(currentUser)) {
      return NextResponse.json(
        { error: "Votre abonnement est expiré." },
        { status: 403 }
      );
    }

    const userId = await getEffectiveUserId(session.user.id);
    const { name, type, steps, deadlineDays, reminderDays } = await req.json();

    if (!name || !type || !Array.isArray(steps)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const VALID_TYPES = [
      "INVOICE_VALIDATION",
      "LEAVE_REQUEST",
      "CONTRACT_APPROVAL",
      "DOCUMENT_REVIEW",
    ];
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Type de workflow invalide" }, { status: 400 });
    }

    const template = await db.workflowTemplate.create({
      data: {
        userId,
        name: name.trim(),
        type,
        steps: JSON.stringify(steps),
        deadlineDays: Number(deadlineDays) || 7,
        reminderDays: Number(reminderDays) || 2,
      },
    });

    return NextResponse.json({ ...template, steps });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
