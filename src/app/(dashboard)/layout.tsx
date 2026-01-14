import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
          <Sidebar />
          <div className="ml-64">
            <Header />
            <main className="p-8">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
