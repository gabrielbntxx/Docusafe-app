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

const navigation: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { nameKey: "myDocuments", href: "/dashboard/documents", icon: FileText },
  { nameKey: "myFolders", href: "/dashboard/my-files", icon: Folder },
  { nameKey: "search", href: "/dashboard/search", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Floating Add Button */}
      <Link
        href="/dashboard/upload"
        className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Bottom Navigation Bar */}
      <div className="border-t border-black/5 bg-white/95 backdrop-blur-xl pb-safe dark:border-white/5 dark:bg-neutral-950/95">
        <div className="flex items-center justify-around px-2 py-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            // Add spacing in the middle for the floating button
            const isLeftSide = index < 2;

            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-neutral-500 dark:text-neutral-400"
                } ${index === 1 ? "mr-8" : ""} ${index === 2 ? "ml-8" : ""}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                  {t(item.nameKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
