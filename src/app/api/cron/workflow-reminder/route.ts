export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

// GET /api/cron/workflow-reminder — Called daily by cron job
// Sends reminder notifications to current-step assignees whose deadline is approaching
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const url = new URL(request.url);
    const querySecret = url.searchParams.get("secret");
    const validHeader = authHeader === `Bearer ${cronSecret}`;
    const validQuery = querySecret === cronSecret;
    if (!validHeader && !validQuery) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  console.log("[WorkflowReminder] Starting at", now.toISOString());

  // Find in_progress runs with a deadline approaching and no reminder sent yet
  const runs = await db.workflowRun.findMany({
    where: {
      status: "in_progress",
      deadline: { not: null },
      reminderSentAt: null,
    },
    include: { template: { select: { name: true, reminderDays: true } } },
  });

  let reminded = 0;

  for (const run of runs) {
    if (!run.deadline) continue;

    const daysUntilDeadline = Math.floor(
      (run.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Send reminder if deadline is within reminderDays
    if (daysUntilDeadline > run.template.reminderDays) continue;

    const stepStatuses: Array<{
      order: number;
      assigneeId: string;
      title: string;
      status: string;
    }> = JSON.parse(run.stepStatuses || "[]");

    const currentStep = stepStatuses[run.currentStep];
    if (!currentStep?.assigneeId) continue;

    const daysLabel = daysUntilDeadline <= 0
      ? "dépassée"
      : daysUntilDeadline === 1
      ? "demain"
      : `dans ${daysUntilDeadline} jour(s)`;

    await createNotification(
      currentStep.assigneeId,
      "workflow_reminder",
      `Rappel : ${run.template.name}`,
      `${currentStep.title} — Deadline ${daysLabel}. Votre validation est en attente.`
    );

    await db.workflowRun.update({
      where: { id: run.id },
      data: { reminderSentAt: now },
    });

    reminded++;
  }

  console.log(`[WorkflowReminder] Sent ${reminded} reminder(s)`);
  return NextResponse.json({ ok: true, reminded });
}
