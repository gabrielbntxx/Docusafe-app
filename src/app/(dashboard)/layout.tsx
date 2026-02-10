import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Header } from "@/components/dashboard/header";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TutorialProvider } from "@/components/providers/tutorial-provider";
import { SubscriptionProvider } from "@/components/providers/subscription-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch user data for verification and subscription checks
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true, planType: true, onboardingCompleted: true },
  });

  if (!user) {
    redirect("/login");
  }

  // Check email verification
  if (!user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
  }

  // Check onboarding for FREE users
  if (user.planType === "FREE" && !user.onboardingCompleted) {
    redirect("/onboarding");
  }

  const isRestricted = user.planType === "FREE";

  return (
    <SessionProvider>
      <ThemeProvider>
        <SubscriptionProvider isRestricted={isRestricted} planType={user.planType}>
          <TutorialProvider>
            <div className="min-h-screen bg-neutral-100/50 dark:bg-neutral-950">
              {/* Restricted Mode Banner */}
              {isRestricted && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-violet-600 to-blue-600 text-white text-center py-2 px-4 text-sm font-medium lg:pl-72">
                  <a href="/dashboard/subscription" className="flex items-center justify-center gap-2 hover:underline">
                    Abonnez-vous pour débloquer toutes les fonctionnalités
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
                      Voir les offres →
                    </span>
                  </a>
                </div>
              )}
              <Sidebar />
              <MobileNav />
              <BottomNav />
              <div className={`lg:ml-72 ${isRestricted ? "pt-24 lg:pt-10" : "pt-14 lg:pt-0"} pb-24 lg:pb-0`}>
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
