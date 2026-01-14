"use client";

import { useState, useEffect } from "react";
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
  User,
  Bell,
  ChevronRight,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/translations";

const navigation: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { nameKey: "myDocuments", href: "/dashboard/documents", icon: FileText },
  { nameKey: "myFolders", href: "/dashboard/my-files", icon: Folder },
  { nameKey: "search", href: "/dashboard/search", icon: Search },
];

const secondaryNavigation: Array<{ nameKey: TranslationKey; href: string; icon: any }> = [
  { nameKey: "subscription", href: "/dashboard/subscription", icon: CreditCard },
  { nameKey: "profile", href: "/dashboard/profile", icon: User },
  { nameKey: "settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session } = useSession();

  useEffect(() => {
    // Fetch notification count
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();
          const unread = data.notifications.filter((n: any) => n.read === 0).length;
          setNotificationCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/95 backdrop-blur-md px-4 dark:border-neutral-800 dark:bg-neutral-900/95 lg:hidden">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500" />
          <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            Justif'
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Notifications Button */}
          <Link
            href="/dashboard/notifications"
            className="relative rounded-xl p-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>

          {/* Profile Button */}
          <Link
            href="/dashboard/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-semibold text-white"
          >
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-900 lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Menu Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">Menu</span>
            <button
              onClick={closeMenu}
              className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <Link
            href="/dashboard/profile"
            onClick={closeMenu}
            className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 p-4 dark:from-primary-900/30 dark:to-secondary-900/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-xl font-bold text-white shadow-lg">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900 dark:text-white truncate">
                {session?.user?.name || t("user")}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                {session?.user?.email}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
          </Link>

          {/* Upload Button */}
          <div className="px-4 pt-4">
            <Link
              href="/dashboard/upload"
              onClick={closeMenu}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98]"
            >
              <Upload className="h-5 w-5" />
              {t("addDocument")}
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Navigation
            </p>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.nameKey}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-all ${
                      isActive
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`} />
                    {t(item.nameKey)}
                  </Link>
                );
              })}
            </div>

            {/* Secondary Navigation */}
            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {t("settings")}
            </p>
            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.nameKey}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-all ${
                      isActive
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`} />
                    {t(item.nameKey)}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sign Out Button */}
          <div className="border-t border-neutral-100 p-4 dark:border-neutral-800">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
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
