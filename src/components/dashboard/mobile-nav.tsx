"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Settings,
  LogOut,
  CreditCard,
  User,
  Bell,
  ChevronRight,
  HelpCircle,
  Bot,
  MessageCircle,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/translations";

const menuItems: Array<{ nameKey: TranslationKey; href: string; icon: React.ElementType; description: string }> = [
  { nameKey: "docubot", href: "/dashboard/docubot", icon: Bot, description: "Ton assistant intelligent" },
  { nameKey: "profile", href: "/dashboard/profile", icon: User, description: "Gérer votre profil" },
  { nameKey: "subscription", href: "/dashboard/subscription", icon: CreditCard, description: "Plan et facturation" },
  { nameKey: "settings", href: "/dashboard/settings", icon: Settings, description: "Préférences de l'app" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();
          const unread = data.notifications.filter((n: { read: number }) => n.read === 0).length;
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

  // Fetch profile image URL
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/profile/image");
          if (response.ok) {
            const data = await response.json();
            setProfileImageUrl(data.imageUrl);
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      }
    };

    fetchProfileImage();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-black/5 bg-white/95 backdrop-blur-xl px-4 dark:border-white/5 dark:bg-neutral-950/95 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-md">
            <Image src="/logo.png" alt="DocuSafe" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-base font-semibold text-neutral-900 dark:text-white">
            DocuSafe
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <Link
            href="/dashboard/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100/80 text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-neutral-950">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100/80 text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
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
          <div className="flex-shrink-0 flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/5">
            <span className="text-base font-semibold text-neutral-900 dark:text-white">Menu</span>
            <button
              onClick={closeMenu}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex-shrink-0">
            <Link
              href="/dashboard/profile"
              onClick={closeMenu}
              className="mx-3 mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 p-3 dark:from-blue-500/10 dark:to-violet-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="h-12 w-12 object-cover" />
                ) : (
                  session?.user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                  {session?.user?.name || t("user")}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            </Link>
          </div>

          {/* Menu Items - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 min-h-0">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.nameKey}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-500/20"
                        : "bg-neutral-100 dark:bg-white/5"
                    }`}>
                      <item.icon className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-neutral-500 dark:text-neutral-400"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t(item.nameKey)}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section - Always visible */}
          <div className="flex-shrink-0 border-t border-black/5 bg-neutral-50/50 dark:border-white/5 dark:bg-neutral-900/50">
            <div className="p-3 space-y-1">
              {/* Help Link */}
              <Link
                href="#"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-600 hover:bg-white active:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5 dark:active:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Aide</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Centre d&apos;aide</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
              </Link>

              {/* Support Link */}
              <Link
                href="#"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-600 hover:bg-white active:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5 dark:active:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-500/20">
                  <MessageCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Support</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Nous contacter</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
              </Link>

              {/* Divider */}
              <div className="my-2 border-t border-neutral-200/50 dark:border-neutral-800" />

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10 dark:active:bg-red-500/20"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{t("signOut")}</p>
                  <p className="text-xs text-red-500/70 dark:text-red-400/70">Fermer la session</p>
                </div>
              </button>
            </div>

            {/* Safe area padding for iPhones */}
            <div className="h-safe-area-bottom pb-2" />
          </div>
        </div>
      </aside>
    </>
  );
}
