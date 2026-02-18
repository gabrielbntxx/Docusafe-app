import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubscriptionClient } from "@/components/subscription/subscription-client";

export const metadata = {
  title: "Subscription | Justif'",
  description: "Manage your subscription plan",
};

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, stats] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, planType: true },
    }),
    db.document.aggregate({
      where: { userId: session.user.id },
      _count: { id: true },
      _sum: { sizeBytes: true },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <SubscriptionClient
      currentPlan={user.planType as "FREE" | "STUDENT" | "PRO" | "BUSINESS"}
      documentsCount={stats._count.id}
      storageUsedBytes={Number(stats._sum.sizeBytes) || 0}
      userEmail={user.email}
    />
  );
}
