export const dynamic = "force-dynamic";

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

  // Fetch user statistics, real storage, and recent documents in parallel
  const [user, storageAgg, recentDocuments] = await Promise.all([
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
      where: { userId: session.user.id },
      _sum: { sizeBytes: true },
    }),
    db.document.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
      take: 5,
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

  return <DashboardClient stats={stats} recentDocuments={serializedDocuments} />;
}
