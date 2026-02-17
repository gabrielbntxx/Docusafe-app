"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  HelpCircle,
  MessageCircle,
  FileUp,
  Lock,
  ArrowLeftRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscription } from "@/components/providers/subscription-provider";
import type { TranslationKey } from "@/lib/translations";

const navigation: Array<{ nameKey: TranslationKey; href: string; icon: any; tutorialId?: string }> = [
  { nameKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { nameKey: "myDocuments", href: "/dashboard/documents", icon: FileText, tutorialId: "documents-link" },
  { nameKey: "myFiles", href: "/dashboard/my-files", icon: Folder, tutorialId: "folders-link" },
  { nameKey: "search", href: "/dashboard/search", icon: Search, tutorialId: "search-link" },
  { nameKey: "requests", href: "/dashboard/requests", icon: FileUp },
  { nameKey: "triageMode", href: "/dashboard/documents?triage=1", icon: ArrowLeftRight },
];

const bottomNavigation: Array<{ nameKey: TranslationKey; href: string; icon: any; tutorialId?: string }> = [
  { nameKey: "docubot", href: "/dashboard/docubot", icon: Bot, tutorialId: "docubot-link" },
  { nameKey: "subscription", href: "/dashboard/subscription", icon: CreditCard },
  { nameKey: "settings", href: "/dashboard/settings", icon: Settings, tutorialId: "settings-link" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRestricted } = useSubscription();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:bg-white/70 lg:backdrop-blur-xl lg:border-r lg:border-black/5 dark:lg:bg-neutral-950/95 dark:lg:border-white/5">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <button onClick={() => handleNavigation("/dashboard")} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg">
            <Image src="/logo.png" alt="DocuSafe" width={40} height={40} className="object-contain" />
          </div>
          <span className="text-xl font-semibold text-neutral-900 dark:text-white">
            DocuSafe
          </span>
        </button>
      </div>

      {/* Upload Button */}
      <div className="px-4 py-2">
        <button
          onClick={() => handleNavigation(isRestricted ? "/dashboard/subscription" : "/dashboard/upload")}
          data-tutorial="upload-button"
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
            isRestricted
              ? "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isRestricted ? <Lock className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {t("addDocument")}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Menu
        </p>
        {navigation.map((item) => {
          const isActive = item.href.includes("?")
            ? pathname === item.href.split("?")[0]
            : pathname === item.href;
          return (
            <button
              key={item.nameKey}
              onClick={() => handleNavigation(item.href)}
              data-tutorial={item.tutorialId}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
              {t(item.nameKey)}
            </button>
          );
        })}

        {/* Help & Support */}
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {t("assistance")}
          </p>
          <button
            onClick={() => handleNavigation("/dashboard/help")}
            data-tutorial="help-link"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              pathname === "/dashboard/help"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
            }`}
          >
            <HelpCircle className={`h-5 w-5 ${pathname === "/dashboard/help" ? "text-blue-500" : ""}`} />
            {t("help")}
          </button>
          <button
            onClick={() => handleNavigation("/dashboard/support")}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              pathname === "/dashboard/support"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
            }`}
          >
            <MessageCircle className={`h-5 w-5 ${pathname === "/dashboard/support" ? "text-blue-500" : ""}`} />
            {t("support")}
          </button>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-black/5 px-3 py-4 space-y-1 dark:border-white/5">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {t("settings")}
        </p>
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = isRestricted && (item.nameKey === "docubot" || item.nameKey === "settings");
          return (
            <button
              key={item.nameKey}
              onClick={() => handleNavigation(isLocked ? "/dashboard/subscription" : item.href)}
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
            </button>
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
