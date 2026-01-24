"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Search,
  Plus,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/translations";

const leftNav: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { nameKey: "myDocuments", href: "/dashboard/documents", icon: FileText },
];

const rightNav: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: "myFolders", href: "/dashboard/my-files", icon: Folder },
  { nameKey: "search", href: "/dashboard/search", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-200/50 dark:border-neutral-800/50" />

      {/* Navigation Content */}
      <div className="relative flex items-end justify-between px-2 pb-6 pt-2">
        {/* Left Navigation Items */}
        <div className="flex flex-1 justify-around">
          {leftNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className="flex flex-col items-center gap-1 min-w-[64px] py-1"
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-500/20"
                    : ""
                }`}>
                  <item.icon className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}>
                  {t(item.nameKey)}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Center Add Button */}
        <div className="relative -mt-6 mx-2">
          <Link
            href="/dashboard/upload"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 transition-all active:scale-95 hover:shadow-xl hover:shadow-blue-500/50"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </Link>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            Ajouter
          </span>
        </div>

        {/* Right Navigation Items */}
        <div className="flex flex-1 justify-around">
          {rightNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className="flex flex-col items-center gap-1 min-w-[64px] py-1"
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-500/20"
                    : ""
                }`}>
                  <item.icon className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}>
                  {t(item.nameKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for iOS */}
      <div className="h-safe bg-white/90 dark:bg-neutral-900/95" />
    </nav>
  );
}
