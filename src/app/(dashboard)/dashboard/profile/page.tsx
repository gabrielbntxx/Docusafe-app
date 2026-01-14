import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      planType: true,
      documentsCount: true,
      storageUsedBytes: true,
      createdAt: true,
    },
  });

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
        documentsCount: user.documentsCount,
        storageUsedBytes: Number(user.storageUsedBytes),
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
