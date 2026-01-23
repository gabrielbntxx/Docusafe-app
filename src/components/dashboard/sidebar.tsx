"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Settings,
  LogOut,
  Upload,
  Search,
  CreditCard,
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
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:bg-white/70 lg:backdrop-blur-xl lg:border-r lg:border-black/5 dark:lg:bg-neutral-950/95 dark:lg:border-white/5">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg">
            <Image src="/logo.png" alt="DocuSafe" width={40} height={40} className="object-contain" />
          </div>
          <span className="text-xl font-semibold text-neutral-900 dark:text-white">
            DocuSafe
          </span>
        </Link>
      </div>

      {/* Upload Button */}
      <div className="px-4 py-2">
        <Link
          href="/dashboard/upload"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Upload className="h-4 w-4" />
          {t("addDocument")}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Menu
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.nameKey}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
              {t(item.nameKey)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-black/5 px-3 py-4 space-y-1 dark:border-white/5">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {t("settings")}
        </p>
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.nameKey}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
              {t(item.nameKey)}
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
