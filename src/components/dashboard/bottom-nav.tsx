"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Folder,
  ArrowLeftRight,
  Plus,
  Lock,
} from "lucide-react";
import { useSubscription } from "@/components/providers/subscription-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { isRestricted } = useSubscription();

  const navItems = [
    { key: "dashboard", label: "Accueil", href: "/dashboard", icon: LayoutDashboard, tutorialId: "mobile-dashboard" },
    { key: "documents", label: "Documents", href: "/dashboard/documents", icon: FileText, tutorialId: "mobile-documents" },
    { key: "add", label: "", href: "/dashboard/upload", icon: Plus, isCenter: true, tutorialId: "mobile-upload" },
    { key: "folders", label: "Dossiers", href: "/dashboard/my-files", icon: Folder, tutorialId: "mobile-folders" },
    { key: "triage", label: "Trier", href: "/dashboard/documents?triage=1", icon: ArrowLeftRight, tutorialId: "mobile-triage" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background */}
      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = item.href.includes("?")
              ? pathname === item.href.split("?")[0]
              : pathname === item.href;

            // Center button (Add)
            if (item.isCenter) {
              return (
                <Link
                  key={item.key}
                  href={isRestricted ? "/dashboard/subscription" : item.href}
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
                </Link>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
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
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
