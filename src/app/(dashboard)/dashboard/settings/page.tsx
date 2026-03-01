import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
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
      language: true,
      theme: true,
      notificationsEnabled: true,
      activityMessagesEnabled: true,
      planType: true,
      teamOwnerId: true,
      teamRole: true,
      profession: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email,
        language: user.language,
        theme: user.theme,
        notifications: user.notificationsEnabled === 1,
        activityMessages: user.activityMessagesEnabled === 1,
      }}
      planType={user.planType}
      isTeamOwner={!user.teamOwnerId && user.planType === "BUSINESS"}
      profession={user.profession ?? null}
    />
  );
}
