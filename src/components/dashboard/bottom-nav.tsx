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

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { key: "dashboard", label: "Accueil", href: "/dashboard", icon: LayoutDashboard },
    { key: "documents", label: "Documents", href: "/dashboard/documents", icon: FileText },
    { key: "add", label: "", href: "/dashboard/upload", icon: Plus, isCenter: true },
    { key: "folders", label: "Dossiers", href: "/dashboard/my-files", icon: Folder },
    { key: "search", label: "Recherche", href: "/dashboard/search", icon: Search },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background */}
      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            // Center button (Add)
            if (item.isCenter) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 -mt-4"
                >
                  <Plus className="h-6 w-6" strokeWidth={2.5} />
                </Link>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
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
