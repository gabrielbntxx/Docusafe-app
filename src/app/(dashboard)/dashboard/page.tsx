import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch user statistics
  const user = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      _count: {
        select: {
          documents: true,
          folders: true,
        },
      },
    },
  });

  const stats = {
    documentsCount: user?._count.documents || 0,
    foldersCount: user?._count.folders || 0,
    storageUsedBytes: Number(user?.storageUsedBytes) || 0,
    planType: user?.planType || "FREE",
  };

  return <DashboardClient stats={stats} />;
}
