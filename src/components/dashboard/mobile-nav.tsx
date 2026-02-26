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
  Bot,
  FileUp,
  FilePlus2,
  Image as ImageIcon,
  Lock,
  GitBranch,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscription } from "@/components/providers/subscription-provider";
import type { TranslationKey } from "@/lib/translations";

const menuItems: Array<{ nameKey: TranslationKey; href: string; icon: React.ElementType; description: string; businessOnly?: boolean }> = [
  { nameKey: "createDocuments", href: "/dashboard/create", icon: FilePlus2, description: "Générez des documents professionnels", businessOnly: true },
  { nameKey: "workflow", href: "/dashboard/workflow", icon: GitBranch, description: "Validation et approbation de documents", businessOnly: true },
  { nameKey: "myPhotos", href: "/dashboard/photos", icon: ImageIcon, description: "Vos photos et images" },
  { nameKey: "docubot", href: "/dashboard/docubot", icon: Bot, description: "Ton assistant intelligent" },
  { nameKey: "requests", href: "/dashboard/requests", icon: FileUp, description: "Demandes de documents" },
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
  const { isRestricted, planType } = useSubscription();

  const userId = session?.user?.id;

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

    if (!userId) return;
    fetchNotifications();
    // Poll every 30s so badge stays up-to-date without manual refresh
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close menu on navigation to prevent stale overlay
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
    setIsOpen(false);
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

          <button
            onClick={() => setIsOpen(!isOpen)}
            data-tutorial="mobile-menu-button"
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
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-screen w-[85vw] max-w-[320px] transform bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-950 lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu Header - Fixed */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 dark:border-white/5 dark:bg-neutral-950">
          <span className="text-base font-semibold text-neutral-900 dark:text-white">Menu</span>
          <button
            onClick={closeMenu}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 active:scale-95 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Footer Section - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-black/5 bg-neutral-50 dark:border-white/5 dark:bg-neutral-900" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="p-3 space-y-1">
            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left text-sm font-medium">{t("signOut")}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="h-full overflow-y-auto pt-14 pb-[120px]">
          {/* User Profile Card */}
          <Link
            href="/dashboard/profile"
            onClick={closeMenu}
            className="mx-3 mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 p-3 dark:from-blue-500/10 dark:to-violet-500/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
              {profileImageUrl ? (
                <Image src={profileImageUrl} alt="Profile" width={48} height={48} className="h-12 w-12 object-cover" />
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

          {/* Menu Items */}
          <nav className="px-3 py-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const isLocked =
                  (isRestricted && (item.nameKey === "docubot" || item.nameKey === "settings")) ||
                  (item.businessOnly === true && planType !== "BUSINESS");
                const href = isLocked ? "/dashboard/subscription" : item.href;
                return (
                  <Link
                    key={item.nameKey}
                    href={href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                      isLocked
                        ? "text-neutral-400 dark:text-neutral-600"
                        : isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isLocked
                        ? "bg-neutral-100 dark:bg-white/5"
                        : isActive
                        ? "bg-blue-100 dark:bg-blue-500/20"
                        : "bg-neutral-100 dark:bg-white/5"
                    }`}>
                      <item.icon className={`h-4 w-4 ${isLocked ? "text-neutral-400 dark:text-neutral-600" : isActive ? "text-blue-600 dark:text-blue-400" : "text-neutral-500 dark:text-neutral-400"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t(item.nameKey)}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
                    </div>
                    {isLocked ? (
                      <Lock className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
