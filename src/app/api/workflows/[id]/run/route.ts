import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";
import { createNotification } from "@/lib/notifications";

// POST — launch a workflow run on a document or folder
export async function POST(
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

    const { documentId, folderId } = await req.json();

    if (!documentId && !folderId) {
      return NextResponse.json(
        { error: "Un document ou un dossier est requis" },
        { status: 400 }
      );
    }

    const steps: Array<{ order: number; title: string; assigneeId: string }> =
      JSON.parse(template.steps || "[]");

    if (steps.length === 0) {
      return NextResponse.json(
        { error: "Ce workflow n'a pas d'étapes configurées" },
        { status: 400 }
      );
    }

    // Build step statuses (all pending initially)
    const stepStatuses = steps.map((s) => ({
      order: s.order,
      assigneeId: s.assigneeId,
      title: s.title,
      status: "pending" as const,
      comment: null,
      respondedAt: null,
    }));

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + template.deadlineDays);

    const run = await db.workflowRun.create({
      data: {
        templateId: id,
        userId,
        documentId: documentId || null,
        folderId: folderId || null,
        status: "in_progress",
        currentStep: 0,
        stepStatuses: JSON.stringify(stepStatuses),
        deadline,
      },
    });

    // Notify first step assignee
    const firstStep = steps[0];
    if (firstStep?.assigneeId) {
      // Get the target name for context
      let targetName = "un document";
      if (documentId) {
        const doc = await db.document.findUnique({
          where: { id: documentId },
          select: { displayName: true },
        });
        if (doc) targetName = `"${doc.displayName}"`;
      } else if (folderId) {
        const folder = await db.folder.findUnique({
          where: { id: folderId },
          select: { name: true },
        });
        if (folder) targetName = `le dossier "${folder.name}"`;
      }

      await createNotification(
        firstStep.assigneeId,
        "workflow_step_pending",
        template.name,
        `${firstStep.title} — Votre validation est requise pour ${targetName}`
      );
    }

    return NextResponse.json({
      ...run,
      stepStatuses: JSON.parse(run.stepStatuses || "[]"),
    });
  } catch (error) {
    console.error("Error launching workflow run:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
