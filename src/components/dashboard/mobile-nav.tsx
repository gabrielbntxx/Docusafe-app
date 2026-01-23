"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-xl px-4 dark:border-white/5 dark:bg-neutral-950/90 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg">
            <Image src="/logo.png" alt="DocuSafe" width={36} height={36} className="object-contain" />
          </div>
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            DocuSafe
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <Link
            href="/dashboard/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100/80 text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-900">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>

          {/* Profile Button */}
          <Link
            href="/dashboard/profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
          >
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100/80 text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-950 lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Menu Header */}
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-4 dark:border-white/5">
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">Menu</span>
            <button
              onClick={closeMenu}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <Link
            href="/dashboard/profile"
            onClick={closeMenu}
            className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 p-4 dark:from-blue-500/10 dark:to-violet-500/10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-500/25">
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
            >
              <Upload className="h-5 w-5" />
              {t("addDocument")}
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
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
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
                    {t(item.nameKey)}
                  </Link>
                );
              })}
            </div>

            {/* Secondary Navigation */}
            <p className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
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
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-blue-500" : ""}`} />
                    {t(item.nameKey)}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sign Out Button */}
          <div className="border-t border-black/5 p-4 dark:border-white/5">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
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
