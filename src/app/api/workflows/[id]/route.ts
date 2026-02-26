import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";

// PATCH — update a workflow template
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const userId = await getEffectiveUserId(session.user.id);

    const template = await db.workflowTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "Workflow non trouvé" }, { status: 404 });
    }
    if (template.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { name, steps, deadlineDays, reminderDays } = await req.json();

    const updated = await db.workflowTemplate.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(steps !== undefined && { steps: JSON.stringify(steps) }),
        ...(deadlineDays !== undefined && { deadlineDays: Number(deadlineDays) }),
        ...(reminderDays !== undefined && { reminderDays: Number(reminderDays) }),
      },
    });

    return NextResponse.json({ ...updated, steps: JSON.parse(updated.steps || "[]") });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — delete a workflow template (and cascade its runs)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const userId = await getEffectiveUserId(session.user.id);

    const template = await db.workflowTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "Workflow non trouvé" }, { status: 404 });
    }
    if (template.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await db.workflowTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
