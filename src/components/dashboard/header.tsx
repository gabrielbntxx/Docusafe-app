"use client";

import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { NotificationsDropdown } from "./notifications-dropdown";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  return (
    <header className="sticky top-0 z-30 hidden lg:block">
      <div className="border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-950/90">
        <div className="flex h-16 items-center justify-between px-8">
          {/* Left: Greeting */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {getGreeting()}, {session?.user?.name?.split(" ")[0] || t("user")}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("manageDocumentsEasily")}
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <NotificationsDropdown />

            <button
              onClick={() => router.push("/dashboard/profile")}
              className="group flex items-center gap-3 rounded-2xl bg-neutral-100/80 px-3 py-2 transition-all hover:bg-neutral-200/80 active:scale-[0.98] dark:bg-white/5 dark:hover:bg-white/10"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white ring-2 ring-white dark:ring-neutral-800">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {session?.user?.name || t("user")}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t("viewProfile")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
