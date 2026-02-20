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
  Bot,
  FileUp,
  Lock,
  ArrowLeftRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscription } from "@/components/providers/subscription-provider";
import type { TranslationKey } from "@/lib/translations";

const navigation: Array<{ nameKey: TranslationKey; href: string; icon: any; tutorialId?: string; exact?: boolean }> = [
  { nameKey: "dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { nameKey: "myDocuments", href: "/dashboard/documents", icon: FileText, tutorialId: "documents-link", exact: true },
  { nameKey: "myFiles", href: "/dashboard/my-files", icon: Folder, tutorialId: "folders-link" },
  { nameKey: "search", href: "/dashboard/search", icon: Search, tutorialId: "search-link" },
  { nameKey: "requests", href: "/dashboard/requests", icon: FileUp },
  { nameKey: "triageMode", href: "/dashboard/documents?triage=1", icon: ArrowLeftRight },
  { nameKey: "docubot", href: "/dashboard/docubot", icon: Bot, tutorialId: "docubot-link" },
];

const bottomNavigation: Array<{ nameKey: TranslationKey; href: string; icon: any; tutorialId?: string }> = [
  { nameKey: "subscription", href: "/dashboard/subscription", icon: CreditCard },
  { nameKey: "settings", href: "/dashboard/settings", icon: Settings, tutorialId: "settings-link" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isRestricted } = useSubscription();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isItemActive = (item: { href: string; exact?: boolean }) => {
    // For links with query params (like triage), never show as "active" based on pathname
    if (item.href.includes("?")) return false;
    // Exact match for dashboard home and documents (to avoid matching sub-routes)
    if (item.exact) return pathname === item.href;
    // Starts-with match for others
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-[60] lg:flex lg:h-screen lg:w-72 lg:flex-col lg:bg-white/70 lg:backdrop-blur-xl lg:border-r lg:border-black/5 dark:lg:bg-neutral-950/95 dark:lg:border-white/5">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
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
      <div className="shrink-0 px-4 py-2">
        <Link
          href={isRestricted ? "/dashboard/subscription" : "/dashboard/upload"}
          data-tutorial="upload-button"
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
            isRestricted
              ? "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isRestricted ? <Lock className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {t("addDocument")}
        </Link>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Menu
        </p>
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = isItemActive(item);
            const isLocked = isRestricted && item.nameKey === "docubot";
            return (
              <Link
                key={item.nameKey}
                href={isLocked ? "/dashboard/subscription" : item.href}
                prefetch={false}
                data-tutorial={item.tutorialId}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isLocked
                    ? "text-neutral-400 dark:text-neutral-600"
                    : isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive && !isLocked ? "text-blue-500" : ""}`} />
                {t(item.nameKey)}
                {isLocked && <Lock className="h-3.5 w-3.5 ml-auto text-neutral-400 dark:text-neutral-600" />}
              </Link>
            );
          })}
        </div>

      </nav>

      {/* Bottom Section - Fixed */}
      <div className="shrink-0 border-t border-black/5 px-3 py-3 space-y-1 dark:border-white/5">

        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = isRestricted && item.nameKey === "settings";
          return (
            <Link
              key={item.nameKey}
              href={isLocked ? "/dashboard/subscription" : item.href}
              prefetch={false}
              data-tutorial={item.tutorialId}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isLocked
                  ? "text-neutral-400 dark:text-neutral-600"
                  : isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive && !isLocked ? "text-blue-500" : ""}`} />
              {t(item.nameKey)}
              {isLocked && <Lock className="h-3.5 w-3.5 ml-auto text-neutral-400 dark:text-neutral-600" />}
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
