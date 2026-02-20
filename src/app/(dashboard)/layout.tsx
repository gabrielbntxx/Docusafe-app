import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Header } from "@/components/dashboard/header";
import { NavigationProgress } from "@/components/dashboard/navigation-progress";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TutorialProvider } from "@/components/providers/tutorial-provider";
import { SubscriptionProvider } from "@/components/providers/subscription-provider";

async function getLayoutData() {
  const session = await getServerSession(authOptions);
  if (!session) return { redirect: "/login" as const, session: null };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true, planType: true, onboardingCompleted: true, teamOwnerId: true },
  });

  if (!user) return { redirect: "/login" as const, session: null };
  if (!user.emailVerified) return { redirect: `/verify-email?email=${encodeURIComponent(user.email)}` as const, session: null };

  // FREE users must complete onboarding then subscribe
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const isSubscriptionPage = pathname.startsWith("/dashboard/subscription");
  if (user.planType === "FREE" && !user.teamOwnerId) {
    if (!user.onboardingCompleted) {
      return { redirect: "/onboarding" as const, session: null };
    }
    if (!isSubscriptionPage) {
      return { redirect: "/dashboard/subscription" as const, session: null };
    }
  }

  return { redirect: null, user, session };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getLayoutData();

  if (data.redirect) {
    redirect(data.redirect);
  }

  const { user, session } = data as { user: NonNullable<typeof data["user"]>; session: NonNullable<typeof data["session"]> };

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <SubscriptionProvider isRestricted={user.planType === "FREE" && !user.teamOwnerId} planType={user.planType}>
          <TutorialProvider>
            <div className="min-h-screen bg-neutral-100/50 dark:bg-neutral-950">
              <NavigationProgress />
              <Sidebar />
              <MobileNav />
              <BottomNav />
              <div className="lg:ml-72 pt-14 lg:pt-0 pb-24 lg:pb-0">
                <Header />
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
              </div>
            </div>
          </TutorialProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
