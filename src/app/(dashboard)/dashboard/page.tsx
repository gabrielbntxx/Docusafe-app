import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if no session
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user statistics, real storage, recent documents, and expiring documents in parallel
  const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const [user, storageAgg, recentDocuments, expiringDocuments] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            documents: true,
            folders: true,
          },
        },
      },
    }),
    db.document.aggregate({
      where: { userId: session.user.id, deletedAt: null },
      _sum: { sizeBytes: true },
    }),
    db.document.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: { uploadedAt: "desc" },
      take: 3,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }),
    db.document.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
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
  ]);

  const stats = {
    documentsCount: user?._count.documents || 0,
    foldersCount: user?._count.folders || 0,
    storageUsedBytes: Number(storageAgg._sum.sizeBytes) || 0,
    planType: user?.planType || "FREE",
  };

  // Serialize documents for client
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

  return <DashboardClient stats={stats} recentDocuments={serializedDocuments} expiringDocuments={serializedExpiring} />;
}
