"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Search,
  Plus,
  Lock,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscription } from "@/components/providers/subscription-provider";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRestricted } = useSubscription();

  const navItems = [
    { key: "dashboard", label: "Accueil", href: "/dashboard", icon: LayoutDashboard, tutorialId: "mobile-dashboard" },
    { key: "documents", label: "Documents", href: "/dashboard/documents", icon: FileText, tutorialId: "mobile-documents" },
    { key: "add", label: "", href: "/dashboard/upload", icon: Plus, isCenter: true, tutorialId: "mobile-upload" },
    { key: "folders", label: "Dossiers", href: "/dashboard/my-files", icon: Folder, tutorialId: "mobile-folders" },
    { key: "search", label: "Recherche", href: "/dashboard/search", icon: Search, tutorialId: "mobile-search" },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background */}
      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            // Center button (Add)
            if (item.isCenter) {
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(isRestricted ? "/dashboard/subscription" : item.href)}
                  data-tutorial={item.tutorialId}
                  className={`flex h-12 w-12 items-center justify-center rounded-full -mt-4 ${
                    isRestricted
                      ? "bg-neutral-300 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-500"
                      : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  }`}
                >
                  {isRestricted ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Plus className="h-6 w-6" strokeWidth={2.5} />
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.href)}
                data-tutorial={item.tutorialId}
                className="flex flex-col items-center justify-center w-16 h-full"
              >
                <item.icon className={`h-5 w-5 ${
                  isActive
                    ? "text-blue-500"
                    : "text-neutral-400 dark:text-neutral-500"
                }`} />
                <span className={`text-[10px] mt-1 ${
                  isActive
                    ? "text-blue-500 font-medium"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
