import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";
import { createNotification } from "@/lib/notifications";

// PATCH — respond to the current step (approve or reject) or update status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { runId } = await params;
    const userId = await getEffectiveUserId(session.user.id);

    const run = await db.workflowRun.findUnique({
      where: { id: runId },
      include: { template: true },
    });

    if (!run) {
      return NextResponse.json({ error: "Run non trouvé" }, { status: 404 });
    }
    if (run.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    if (run.status !== "in_progress") {
      return NextResponse.json(
        { error: "Ce flux n'est plus actif" },
        { status: 400 }
      );
    }

    const { action, comment } = await req.json();
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const stepStatuses: Array<{
      order: number;
      assigneeId: string;
      title: string;
      status: string;
      comment: string | null;
      respondedAt: string | null;
    }> = JSON.parse(run.stepStatuses || "[]");

    const currentIdx = run.currentStep;

    // Only the current step's assignee can respond
    const currentStepStatus = stepStatuses[currentIdx];
    if (!currentStepStatus) {
      return NextResponse.json({ error: "Étape introuvable" }, { status: 400 });
    }
    if (currentStepStatus.assigneeId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas l'approbateur de cette étape" },
        { status: 403 }
      );
    }

    // Update the current step
    stepStatuses[currentIdx] = {
      ...currentStepStatus,
      status: action === "approve" ? "approved" : "rejected",
      comment: comment ?? null,
      respondedAt: new Date().toISOString(),
    };

    let newStatus = run.status;
    let newCurrentStep = currentIdx;

    if (action === "reject") {
      newStatus = "rejected";

      // Notify workspace owner
      await createNotification(
        run.userId,
        "workflow_rejected",
        run.template.name,
        `L'étape "${currentStepStatus.title}" a été rejetée.`
      );
    } else {
      // Approved — advance to next step or complete
      const nextIdx = currentIdx + 1;
      if (nextIdx >= stepStatuses.length) {
        // All steps approved → completed
        newStatus = "completed";
        await createNotification(
          run.userId,
          "workflow_completed",
          run.template.name,
          `Toutes les étapes ont été approuvées ✓`
        );
      } else {
        // Notify next step assignee
        newCurrentStep = nextIdx;
        const nextStep = stepStatuses[nextIdx];
        if (nextStep?.assigneeId) {
          await createNotification(
            nextStep.assigneeId,
            "workflow_step_pending",
            run.template.name,
            `${nextStep.title} — Votre validation est requise`
          );
        }
      }
    }

    const updated = await db.workflowRun.update({
      where: { id: runId },
      data: {
        status: newStatus,
        currentStep: newCurrentStep,
        stepStatuses: JSON.stringify(stepStatuses),
      },
    });

    return NextResponse.json({
      ...updated,
      stepStatuses,
    });
  } catch (error) {
    console.error("Error responding to workflow step:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE — cancel a workflow run
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { runId } = await params;
    const userId = await getEffectiveUserId(session.user.id);

    const run = await db.workflowRun.findUnique({ where: { id: runId } });
    if (!run) {
      return NextResponse.json({ error: "Run non trouvé" }, { status: 404 });
    }
    if (run.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await db.workflowRun.update({
      where: { id: runId },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling workflow run:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
