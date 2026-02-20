import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  let user = null;
  let storageAgg = { _sum: { sizeBytes: null } };

  try {
    [user, storageAgg] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          planType: true,
          createdAt: true,
          _count: {
            select: { documents: true },
          },
        },
      }),
      db.document.aggregate({
        where: { userId: session.user.id },
        _sum: { sizeBytes: true },
      }),
    ]);
  } catch {
    // DB error — redirect to dashboard rather than crashing
    redirect("/dashboard");
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email,
        image: user.image,
        planType: user.planType,
        documentsCount: user._count.documents,
        storageUsedBytes: Number(storageAgg._sum.sizeBytes) || 0,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
