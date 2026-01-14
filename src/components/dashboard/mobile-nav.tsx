"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
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
  { nameKey: "upload", href: "/dashboard/upload", icon: Upload },
  { nameKey: "myDocuments", href: "/dashboard/documents", icon: FileText },
  { nameKey: "myFiles", href: "/dashboard/my-files", icon: Folder },
  { nameKey: "search", href: "/dashboard/search", icon: Search },
  { nameKey: "subscription", href: "/dashboard/subscription", icon: CreditCard },
  { nameKey: "settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-800 lg:hidden">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            Justif'
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <aside
        className={`fixed top-16 right-0 bottom-0 z-50 w-72 transform border-l border-neutral-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-neutral-700 dark:bg-neutral-800 lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Upload Button */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <Link
              href="/dashboard/upload"
              onClick={closeMenu}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-primary-700 active:scale-95"
            >
              <Upload className="h-5 w-5" />
              {t("addDocument")}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.nameKey}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    isActive
                      ? "bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {t(item.nameKey)}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              {t("signOut")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
