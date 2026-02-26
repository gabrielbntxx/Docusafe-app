import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";

// GET — return current sorting rule for the workspace owner
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const userId = await getEffectiveUserId(session.user.id);
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { sortingRule: true, sortingRuleEnabled: true },
    });
    return NextResponse.json({
      sortingRule: user?.sortingRule ?? null,
      sortingRuleEnabled: user?.sortingRuleEnabled ?? 0,
    });
  } catch (error) {
    console.error("Error fetching sorting rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH — save or toggle sorting rule
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const userId = await getEffectiveUserId(session.user.id);
    const body = await req.json();
    const data: { sortingRule?: string; sortingRuleEnabled?: number } = {};
    if (typeof body.sortingRule === "string") {
      data.sortingRule = body.sortingRule.trim().slice(0, 500);
    }
    if (typeof body.sortingRuleEnabled === "number") {
      data.sortingRuleEnabled = body.sortingRuleEnabled;
    }
    const updated = await db.user.update({
      where: { id: userId },
      data,
      select: { sortingRule: true, sortingRuleEnabled: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating sorting rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — clear sorting rule
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const userId = await getEffectiveUserId(session.user.id);
    await db.user.update({
      where: { id: userId },
      data: { sortingRule: null, sortingRuleEnabled: 0 },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting sorting rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
