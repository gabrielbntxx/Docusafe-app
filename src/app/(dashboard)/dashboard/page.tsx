import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getEffectiveUserId, getMemberFolderAccess } from "@/lib/team";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const effectiveUserId = await getEffectiveUserId(session.user.id);
  const isOwner = effectiveUserId === session.user.id;

  // Folder access restriction for team members
  const memberFolderAccess = !isOwner ? await getMemberFolderAccess(session.user.id) : null;

  const folderFilter =
    memberFolderAccess !== null
      ? memberFolderAccess.length === 0
        ? { folderId: "__NONE__" as string }
        : { folderId: { in: memberFolderAccess } }
      : {};

  const baseDocWhere = {
    userId: effectiveUserId,
    deletedAt: null,
    ...(isOwner ? {} : { isPrivate: 0, ...folderFilter }),
  };

  const baseFolderWhere = {
    userId: effectiveUserId,
    ...(isOwner
      ? {}
      : {
          isPrivate: 0,
          ...(memberFolderAccess !== null
            ? memberFolderAccess.length === 0
              ? { id: "__NONE__" }
              : { id: { in: memberFolderAccess } }
            : {}),
        }),
  };

  const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const [docCount, folderCount, storageAgg, recentDocuments, expiringDocuments, ownerUser] =
    await Promise.all([
      db.document.count({ where: baseDocWhere }),
      db.folder.count({ where: baseFolderWhere }),
      db.document.aggregate({
        where: { userId: effectiveUserId, deletedAt: null },
        _sum: { sizeBytes: true },
      }),
      db.document.findMany({
        where: baseDocWhere,
        orderBy: { uploadedAt: "desc" },
        take: 3,
        include: {
          folder: { select: { id: true, name: true, color: true } },
        },
      }),
      db.document.findMany({
        where: {
          ...baseDocWhere,
          expiryDate: { not: null, lte: in60Days },
        },
        select: {
          id: true,
          displayName: true,
          fileType: true,
          aiCategory: true,
          expiryDate: true,
        },
        orderBy: { expiryDate: "asc" },
        take: 8,
      }),
      db.user.findUnique({
        where: { id: effectiveUserId },
        select: { planType: true },
      }),
    ]);

  const stats = {
    documentsCount: docCount,
    foldersCount: folderCount,
    storageUsedBytes: Number(storageAgg._sum.sizeBytes) || 0,
    planType: ownerUser?.planType || "FREE",
  };

  const serializedDocuments = recentDocuments.map((doc) => ({
    id: doc.id,
    displayName: doc.displayName,
    originalName: doc.originalName,
    fileType: doc.fileType,
    mimeType: doc.mimeType,
    sizeBytes: Number(doc.sizeBytes),
    uploadedAt: doc.uploadedAt.toISOString(),
    folder: doc.folder,
  }));

  const serializedExpiring = expiringDocuments.map((doc) => ({
    id: doc.id,
    displayName: doc.displayName,
    fileType: doc.fileType,
    aiCategory: doc.aiCategory,
    expiryDate: doc.expiryDate!.toISOString(),
  }));

  return (
    <DashboardClient
      stats={stats}
      recentDocuments={serializedDocuments}
      expiringDocuments={serializedExpiring}
    />
  );
}
