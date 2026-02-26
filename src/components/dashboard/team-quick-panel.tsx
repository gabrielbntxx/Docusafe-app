"use client";

import { useEffect, useRef } from "react";
import { X, Users } from "lucide-react";
import { TeamSection } from "@/components/settings/team-section";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function TeamQuickPanel({ isOpen, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-neutral-900 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
              <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Mon Équipe
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Gérez vos membres et invitations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <TeamSection />
        </div>
      </div>
    </div>
  );
}
