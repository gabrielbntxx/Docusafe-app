"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Settings,
  LogOut,
  Upload,
  Search,
  CreditCard
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/translations";

const navigation: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { nameKey: "myDocuments", href: "/dashboard/documents", icon: FileText },
  { nameKey: "myFiles", href: "/dashboard/my-files", icon: Folder },
  { nameKey: "search", href: "/dashboard/search", icon: Search },
];

const bottomNavigation: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: "subscription", href: "/dashboard/subscription", icon: CreditCard },
  { nameKey: "settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:block lg:h-screen lg:w-64 lg:border-r lg:border-neutral-200 lg:bg-white dark:lg:border-neutral-700 dark:lg:bg-neutral-800">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-neutral-200 px-6 dark:border-neutral-700">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              Justif'
            </span>
          </Link>
        </div>

        <div className="p-4">
          <Link
            href="/dashboard/upload"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-soft-md active:scale-95"
          >
            <Upload className="h-4 w-4" />
            {t("addDocument")}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all " + (isActive ? "bg-primary-50 text-primary-700 shadow-soft dark:bg-primary-900/20 dark:text-primary-400" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100")}
              >
                <item.icon className="h-5 w-5" />
                {t(item.nameKey)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 p-3 space-y-1 dark:border-neutral-700">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all " + (isActive ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100")}
              >
                <item.icon className="h-5 w-5" />
                {t(item.nameKey)}
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-red-50 hover:text-red-600 dark:text-neutral-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            {t("signOut")}
          </button>
        </div>
      </div>
    </aside>
  );
}
