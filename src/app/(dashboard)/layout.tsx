import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Header } from "@/components/dashboard/header";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TutorialProvider } from "@/components/providers/tutorial-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <ThemeProvider>
        <TutorialProvider>
          <div className="min-h-screen bg-neutral-100/50 dark:bg-neutral-950">
            <Sidebar />
            <MobileNav />
            <BottomNav />
            <div className="lg:ml-72 pt-14 lg:pt-0 pb-24 lg:pb-0">
              <Header />
              <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
          </div>
        </TutorialProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
