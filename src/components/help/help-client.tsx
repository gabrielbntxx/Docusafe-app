"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  FolderOpen,
  Search,
  Bot,
  Shield,
  Share2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  FileText,
  Image,
  Video,
  Music,
  Mail,
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/lib/translations";

type GuideSection = {
  id: string;
  titleKey: TranslationKey;
  icon: React.ElementType;
  color: string;
  descriptionKey: TranslationKey;
  steps: {
    titleKey: TranslationKey;
    contentKey: TranslationKey;
  }[];
};

const guides: GuideSection[] = [
  {
    id: "upload",
    titleKey: "guideUpload",
    icon: Upload,
    color: "blue",
    descriptionKey: "guideUploadDesc",
    steps: [
      { titleKey: "guideUploadStep1", contentKey: "guideUploadStep1" },
      { titleKey: "guideUploadStep2", contentKey: "guideUploadStep2" },
      { titleKey: "guideUploadStep3", contentKey: "guideUploadStep3" },
      { titleKey: "guideUploadStep4", contentKey: "guideUploadStep4" },
    ],
  },
  {
    id: "folders",
    titleKey: "guideFolders",
    icon: FolderOpen,
    color: "amber",
    descriptionKey: "guideFoldersDesc",
    steps: [
      { titleKey: "guideFoldersStep1", contentKey: "guideFoldersStep1" },
      { titleKey: "guideFoldersStep2", contentKey: "guideFoldersStep2" },
      { titleKey: "guideFoldersStep3", contentKey: "guideFoldersStep3" },
      { titleKey: "guideFoldersStep4", contentKey: "guideFoldersStep4" },
    ],
  },
  {
    id: "search",
    titleKey: "guideSearch",
    icon: Search,
    color: "violet",
    descriptionKey: "guideSearchDesc",
    steps: [
      { titleKey: "guideSearchStep1", contentKey: "guideSearchStep1" },
      { titleKey: "guideSearchStep2", contentKey: "guideSearchStep2" },
      { titleKey: "guideSearchStep3", contentKey: "guideSearchStep3" },
      { titleKey: "guideSearchStep4", contentKey: "guideSearchStep4" },
    ],
  },
  {
    id: "docubot",
    titleKey: "guideDocubot",
    icon: Bot,
    color: "emerald",
    descriptionKey: "guideDocubotDesc",
    steps: [
      { titleKey: "guideDocubotStep1", contentKey: "guideDocubotStep1" },
      { titleKey: "guideDocubotStep2", contentKey: "guideDocubotStep2" },
      { titleKey: "guideDocubotStep3", contentKey: "guideDocubotStep3" },
      { titleKey: "guideDocubotStep4", contentKey: "guideDocubotStep4" },
    ],
  },
  {
    id: "ai-sorting",
    titleKey: "guideAiSort",
    icon: Sparkles,
    color: "pink",
    descriptionKey: "guideAiSortDesc",
    steps: [
      { titleKey: "guideAiSortStep1", contentKey: "guideAiSortStep1" },
      { titleKey: "guideAiSortStep2", contentKey: "guideAiSortStep2" },
      { titleKey: "guideAiSortStep3", contentKey: "guideAiSortStep3" },
      { titleKey: "guideAiSortStep4", contentKey: "guideAiSortStep4" },
    ],
  },
  {
    id: "share",
    titleKey: "guideShare",
    icon: Share2,
    color: "cyan",
    descriptionKey: "guideShareDesc",
    steps: [
      { titleKey: "guideShareStep1", contentKey: "guideShareStep1" },
      { titleKey: "guideShareStep2", contentKey: "guideShareStep2" },
      { titleKey: "guideShareStep3", contentKey: "guideShareStep3" },
      { titleKey: "guideShareStep4", contentKey: "guideShareStep4" },
    ],
  },
  {
    id: "security",
    titleKey: "guideSecurity",
    icon: Shield,
    color: "green",
    descriptionKey: "guideSecurityDesc",
    steps: [
      { titleKey: "guideSecurityStep1", contentKey: "guideSecurityStep1" },
      { titleKey: "guideSecurityStep2", contentKey: "guideSecurityStep2" },
      { titleKey: "guideSecurityStep3", contentKey: "guideSecurityStep3" },
      { titleKey: "guideSecurityStep4", contentKey: "guideSecurityStep4" },
    ],
  },
  {
    id: "email-import",
    titleKey: "guideEmail",
    icon: Mail,
    color: "indigo",
    descriptionKey: "guideEmailDesc",
    steps: [
      { titleKey: "guideEmailStep1", contentKey: "guideEmailStep1" },
      { titleKey: "guideEmailStep2", contentKey: "guideEmailStep2" },
      { titleKey: "guideEmailStep3", contentKey: "guideEmailStep3" },
      { titleKey: "guideEmailStep4", contentKey: "guideEmailStep4" },
    ],
  },
];

export function HelpClient() {
  const [expandedGuide, setExpandedGuide] = useState<string | null>("upload");
  const { t } = useTranslation();

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; lightBg: string }> = {
      blue: { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", lightBg: "bg-blue-50 dark:bg-blue-500/10" },
      amber: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", lightBg: "bg-amber-50 dark:bg-amber-500/10" },
      violet: { bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", lightBg: "bg-violet-50 dark:bg-violet-500/10" },
      emerald: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", lightBg: "bg-emerald-50 dark:bg-emerald-500/10" },
      pink: { bg: "bg-pink-500", text: "text-pink-600 dark:text-pink-400", lightBg: "bg-pink-50 dark:bg-pink-500/10" },
      cyan: { bg: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", lightBg: "bg-cyan-50 dark:bg-cyan-500/10" },
      green: { bg: "bg-green-500", text: "text-green-600 dark:text-green-400", lightBg: "bg-green-50 dark:bg-green-500/10" },
      indigo: { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", lightBg: "bg-indigo-50 dark:bg-indigo-500/10" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
              {t("helpCenter")}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("helpDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-6 grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { icon: FileText, label: "PDF", color: "text-red-500" },
          { icon: Image, label: "Images", color: "text-blue-500" },
          { icon: Video, label: "Videos", color: "text-purple-500" },
          { icon: Music, label: "Audio", color: "text-pink-500" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 rounded-xl bg-white p-3 text-center shadow-sm dark:bg-neutral-800/50 sm:p-4"
          >
            <item.icon className={`h-5 w-5 ${item.color} sm:h-6 sm:w-6`} />
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Guides */}
      <div className="space-y-3">
        {guides.map((guide) => {
          const isExpanded = expandedGuide === guide.id;
          const colors = getColorClasses(guide.color);

          return (
            <div
              key={guide.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50"
            >
              {/* Guide Header */}
              <button
                onClick={() => toggleGuide(guide.id)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} shadow-md`}>
                  <guide.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {t(guide.titleKey)}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {t(guide.descriptionKey)}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                )}
              </button>

              {/* Guide Content */}
              {isExpanded && (
                <div className="border-t border-neutral-100 px-4 pb-4 dark:border-neutral-700/50">
                  <div className="space-y-4 pt-4">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colors.lightBg} text-xs font-bold ${colors.text}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {t(step.contentKey)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Link */}
      <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 p-5 text-white shadow-lg shadow-cyan-500/25">
        <h3 className="font-semibold">{t("supportTitle")}</h3>
        <p className="mt-1 text-sm text-cyan-100">
          {t("supportDescription")}
        </p>
        <Link
          href="/dashboard/support"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          {t("contactByEmail")}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
