import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/team";
import { WorkflowClient } from "./workflow-client";

export default async function WorkflowPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Only team owners or workspace users can access this page (not members checking their own workspace)
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { planType: true, teamOwnerId: true },
  });

  if (!currentUser) redirect("/login");

  // BUSINESS plan required — members of a BUSINESS workspace may also access
  const effectiveUserId = await getEffectiveUserId(session.user.id);
  const ownerUser = await db.user.findUnique({
    where: { id: effectiveUserId },
    select: { planType: true },
  });

  if (ownerUser?.planType !== "BUSINESS") {
    redirect("/dashboard/subscription");
  }

  const isOwner = effectiveUserId === session.user.id;

  // Fetch all data in parallel
  const [templates, runs, teamMembers, recentDocs, folders] = await Promise.all([
    db.workflowTemplate.findMany({
      where: { userId: effectiveUserId },
      orderBy: { createdAt: "desc" },
    }),
    db.workflowRun.findMany({
      where: { userId: effectiveUserId },
      orderBy: { createdAt: "desc" },
      include: {
        template: { select: { name: true, type: true } },
        document: { select: { id: true, displayName: true } },
        folder: { select: { id: true, name: true } },
      },
    }),
    db.user.findMany({
      where: { teamOwnerId: effectiveUserId },
      select: { id: true, name: true, email: true, memberColor: true },
    }),
    db.document.findMany({
      where: { userId: effectiveUserId, deletedAt: null },
      select: { id: true, displayName: true, aiDocumentType: true },
      orderBy: { uploadedAt: "desc" },
      take: 50,
    }),
    db.folder.findMany({
      where: { userId: effectiveUserId },
      select: { id: true, name: true, icon: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Include the owner themselves in the assignee list
  const ownerInfo = await db.user.findUnique({
    where: { id: effectiveUserId },
    select: { id: true, name: true, email: true, memberColor: true },
  });

  const allMembers = [
    ...(ownerInfo ? [{ ...ownerInfo, memberColor: "#8B5CF6" }] : []),
    ...teamMembers,
  ];

  // Serialize data
  const serializedTemplates = templates.map((t) => ({
    id: t.id,
    userId: t.userId,
    name: t.name,
    type: t.type,
    steps: JSON.parse(t.steps || "[]") as Array<{
      order: number;
      title: string;
      assigneeId: string;
    }>,
    deadlineDays: t.deadlineDays,
    reminderDays: t.reminderDays,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  const serializedRuns = runs.map((r) => ({
    id: r.id,
    templateId: r.templateId,
    templateName: r.template.name,
    templateType: r.template.type,
    status: r.status,
    currentStep: r.currentStep,
    stepStatuses: JSON.parse(r.stepStatuses || "[]") as Array<{
      order: number;
      assigneeId: string;
      title: string;
      status: "pending" | "approved" | "rejected";
      comment: string | null;
      respondedAt: string | null;
    }>,
    deadline: r.deadline ? r.deadline.toISOString() : null,
    documentId: r.documentId,
    documentName: r.document?.displayName ?? null,
    folderId: r.folderId,
    folderName: r.folder?.name ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <WorkflowClient
      currentUserId={session.user.id}
      isOwner={isOwner}
      templates={serializedTemplates}
      runs={serializedRuns}
      teamMembers={allMembers.map((m) => ({
        id: m.id,
        name: m.name ?? m.email ?? "Membre",
        email: m.email ?? "",
        color: m.memberColor ?? "#3B82F6",
      }))}
      documents={recentDocs.map((d) => ({
        id: d.id,
        name: d.displayName,
        type: d.aiDocumentType ?? "",
      }))}
      folders={folders.map((f) => ({
        id: f.id,
        name: f.name,
        icon: f.icon,
        color: f.color,
      }))}
    />
  );
}
