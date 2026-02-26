-- CreateTable: WorkflowTemplate
CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "steps" TEXT NOT NULL DEFAULT '[]',
    "deadlineDays" INTEGER NOT NULL DEFAULT 7,
    "reminderDays" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WorkflowRun
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "folderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "stepStatuses" TEXT NOT NULL DEFAULT '[]',
    "deadline" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowTemplate_userId_idx" ON "WorkflowTemplate"("userId");
CREATE INDEX "WorkflowRun_templateId_idx" ON "WorkflowRun"("templateId");
CREATE INDEX "WorkflowRun_userId_idx" ON "WorkflowRun"("userId");
CREATE INDEX "WorkflowRun_status_idx" ON "WorkflowRun"("status");

-- AddForeignKey: WorkflowTemplate.userId → User
ALTER TABLE "WorkflowTemplate" ADD CONSTRAINT "WorkflowTemplate_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: WorkflowRun.templateId → WorkflowTemplate
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "WorkflowTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: WorkflowRun.userId → User
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: WorkflowRun.documentId → Document
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: WorkflowRun.folderId → Folder
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_folderId_fkey"
    FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
