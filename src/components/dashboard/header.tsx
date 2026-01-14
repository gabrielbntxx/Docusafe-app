"use client";

import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { NotificationsDropdown } from "./notifications-dropdown";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 hidden border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-800/80 lg:block">
      <div className="flex h-16 items-center justify-between px-8">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t("hello")}, {session?.user?.name?.split(" ")[0] || t("user")} 👋
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("manageDocumentsEasily")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsDropdown />

          <button
            onClick={() => router.push("/dashboard/profile")}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 transition-all hover:bg-neutral-50 hover:shadow-soft active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-medium text-white">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {session?.user?.name || t("user")}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {session?.user?.email}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
