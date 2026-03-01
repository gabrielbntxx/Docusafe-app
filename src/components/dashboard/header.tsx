"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscription } from "@/components/providers/subscription-provider";
import { NotificationsDropdown } from "./notifications-dropdown";
import { MessagingDropdown } from "./messaging-dropdown";
import { TeamQuickPanel } from "./team-quick-panel";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { planType } = useSubscription();
  const isOwner = !session?.user?.teamOwnerId;
  const showTeamButton = planType === "BUSINESS" && isOwner;
  const showMessaging = planType === "BUSINESS";
  const [isTeamPanelOpen, setIsTeamPanelOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  // Greeting computed client-side only to avoid hydration mismatch (server/client timezone diff)
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t("goodMorning"));
    else if (hour < 18) setGreeting(t("goodAfternoon"));
    else setGreeting(t("goodEvening"));
  }, [t]);

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

  return (
    <header className="sticky top-0 z-[50] hidden lg:block">
      <div className="border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-950/90">
        <div className="flex h-16 items-center justify-between px-8">
          {/* Left: Greeting - suppressHydrationWarning because greeting is client-only */}
          <div suppressHydrationWarning>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {greeting
                ? `${greeting}, ${session?.user?.name?.split(" ")[0] || ""}`
                : <span className="inline-block h-5 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("manageDocumentsEasily")}
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {showTeamButton && (
              <button
                onClick={() => setIsTeamPanelOpen(true)}
                className="relative rounded-xl p-2 transition-all hover:bg-neutral-100 active:scale-95 dark:hover:bg-neutral-700"
                title="Mon équipe"
              >
                <Users className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            )}
            {showMessaging && <MessagingDropdown />}
            <NotificationsDropdown />

            <Link
              href="/dashboard/profile"
              prefetch={false}
              className="group flex items-center gap-3 rounded-2xl bg-neutral-100/80 px-3 py-2 transition-all hover:bg-neutral-200/80 active:scale-[0.98] dark:bg-white/5 dark:hover:bg-white/10"
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={session?.user?.name || "User"}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white ring-2 ring-white dark:ring-neutral-800">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {session?.user?.name || t("user")}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t("viewProfile")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
      <TeamQuickPanel isOpen={isTeamPanelOpen} onClose={() => setIsTeamPanelOpen(false)} />
    </header>
  );
}
