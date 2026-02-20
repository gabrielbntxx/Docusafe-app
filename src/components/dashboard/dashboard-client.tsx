"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import {
  FileText,
  Folder,
  HardDrive,
  Crown,
  Eye,
  Download,
  Image as ImageIcon,
  File,
  Plus,
  Search,
  ArrowUpRight,
  Clock,
  Bot,
  Sparkles,
  Music,
  Video,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";

type DashboardStats = {
  documentsCount: number;
  foldersCount: number;
  storageUsedBytes: number;
  planType: string;
};

type RecentDocument = {
  id: string;
  displayName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  folder: {
    id: string;
    name: string;
    color: string | null;
  } | null;
};

type ExpiringDocument = {
  id: string;
  displayName: string;
  fileType: string;
  aiCategory: string | null;
  expiryDate: string;
};

export function DashboardClient({
  stats,
  recentDocuments = [],
  expiringDocuments = [],
}: {
  stats: DashboardStats;
  recentDocuments?: RecentDocument[];
  expiringDocuments?: ExpiringDocument[];
}) {
  const { t } = useTranslation();
  const [previewDocument, setPreviewDocument] = useState<RecentDocument | null>(null);

  const formatStorageSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return FileText;
    if (fileType === "image") return ImageIcon;
    if (fileType === "audio") return Music;
    if (fileType === "video") return Video;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  };

  const handleDownload = async (docId: string, originalName: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      <div className="mx-auto max-w-6xl space-y-4 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
          {/* Documents */}
          <Link
            href="/dashboard/documents"
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 lg:p-6 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            <div className="absolute -right-4 -top-4 h-16 lg:h-24 w-16 lg:w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="mb-2 lg:mb-4 inline-flex rounded-xl lg:rounded-2xl bg-white/20 p-2 lg:p-3">
                <FileText className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{stats.documentsCount || 0}</p>
              <p className="mt-0.5 lg:mt-1 text-xs lg:text-sm text-blue-100">{t("documents")}</p>
            </div>
          </Link>

          {/* Folders */}
          <Link
            href="/dashboard/my-files"
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 lg:p-6 text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            <div className="absolute -right-4 -top-4 h-16 lg:h-24 w-16 lg:w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="mb-2 lg:mb-4 inline-flex rounded-xl lg:rounded-2xl bg-white/20 p-2 lg:p-3">
                <Folder className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{stats.foldersCount || 0}</p>
              <p className="mt-0.5 lg:mt-1 text-xs lg:text-sm text-violet-100">{t("folders")}</p>
            </div>
          </Link>

          {/* Storage */}
          <Link
            href="/dashboard/profile"
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 lg:p-6 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            <div className="absolute -right-4 -top-4 h-16 lg:h-24 w-16 lg:w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="mb-2 lg:mb-4 inline-flex rounded-xl lg:rounded-2xl bg-white/20 p-2 lg:p-3">
                <HardDrive className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
              <p className="text-xl lg:text-3xl font-bold">{formatStorageSize(stats.storageUsedBytes || 0)}</p>
              <p className="mt-0.5 lg:mt-1 text-xs lg:text-sm text-emerald-100">{t("storage")}</p>
            </div>
          </Link>

          {/* Plan */}
          <Link
            href="/dashboard/profile"
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 lg:p-6 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            <div className="absolute -right-4 -top-4 h-16 lg:h-24 w-16 lg:w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="mb-2 lg:mb-4 inline-flex rounded-xl lg:rounded-2xl bg-white/20 p-2 lg:p-3">
                <Crown className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{stats.planType || "FREE"}</p>
              <p className="mt-0.5 lg:mt-1 text-xs lg:text-sm text-amber-100">{t("currentPlan")}</p>
            </div>
          </Link>
        </div>

        {/* DocuBot Card */}
        <Link
          href="/dashboard/docubot"
          className="group flex items-center gap-4 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 lg:p-5 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl lg:rounded-2xl bg-white/20">
            <Bot className="h-6 w-6 lg:h-7 lg:w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base lg:text-lg font-semibold">DocuBot</h3>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
                <Sparkles className="h-2.5 w-2.5" />
                IA
              </span>
            </div>
            <p className="text-xs lg:text-sm text-blue-100">Ton assistant intelligent</p>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 opacity-70 transition-all group-hover:opacity-100" />
        </Link>

        {/* Expiring Documents Widget */}
        {expiringDocuments.length > 0 && (
          <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg lg:shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="mb-4 lg:mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl lg:rounded-2xl bg-orange-100 dark:bg-orange-500/20">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-white">
                    À renouveler
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Dans les 60 prochains jours</p>
                </div>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
                {expiringDocuments.length}
              </span>
            </div>

            <div className="space-y-2">
              {expiringDocuments.map((doc) => {
                const daysLeft = Math.floor((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000);
                const isExpired = daysLeft < 0;
                const isUrgent = daysLeft >= 0 && daysLeft <= 30;
                const badgeBg = isExpired ? "bg-red-100 dark:bg-red-500/20" : isUrgent ? "bg-orange-100 dark:bg-orange-500/20" : "bg-yellow-100 dark:bg-yellow-500/20";
                const badgeText = isExpired ? "text-red-600 dark:text-red-400" : isUrgent ? "text-orange-600 dark:text-orange-400" : "text-yellow-600 dark:text-yellow-400";
                const label = isExpired ? "Expiré" : `${daysLeft}j`;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isExpired ? "bg-red-100 dark:bg-red-500/20" : "bg-orange-100 dark:bg-orange-500/20"}`}>
                      <AlertTriangle className={`h-4 w-4 ${isExpired ? "text-red-500" : "text-orange-500"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {doc.displayName}
                      </p>
                      {doc.aiCategory && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">{doc.aiCategory}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeBg} ${badgeText}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions - Hidden on mobile since we have bottom nav */}
        <div className="hidden lg:block rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">
            {t("quickActions")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <Link
              href="/dashboard/upload"
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-5 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-blue-500">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{t("addDocument")}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("uploadNewFile")}</p>
              </div>
            </Link>

            <Link
              href="/dashboard/my-files?create=true"
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-5 transition-all hover:border-violet-300 hover:bg-violet-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-500 group-hover:text-white dark:bg-violet-500/20 dark:text-violet-400 dark:group-hover:bg-violet-500">
                <Folder className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{t("createFolder")}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("organizeFiles")}</p>
              </div>
            </Link>

            <Link
              href="/dashboard/search"
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-5 transition-all hover:border-emerald-300 hover:bg-emerald-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{t("search")}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("findDocuments")}</p>
              </div>
            </Link>

            <Link
              href="/dashboard/docubot"
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-5 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 transition-colors group-hover:from-blue-500 group-hover:to-violet-500 group-hover:text-white dark:from-blue-500/20 dark:to-violet-500/20 dark:text-blue-400 dark:group-hover:from-blue-500 dark:group-hover:to-violet-500">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{t("docubot")}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("docubotDescription")}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg lg:shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="mb-4 lg:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl lg:rounded-2xl bg-blue-100 dark:bg-blue-500/20">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-white">
                {t("recentDocuments")}
              </h2>
            </div>
            {recentDocuments.length > 0 && (
              <Link
                href="/dashboard/documents"
                className="flex items-center gap-1 text-xs lg:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t("viewAll")}
                <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4" />
              </Link>
            )}
          </div>

          {recentDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 lg:py-16">
              <div className="mb-4 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                <FileText className="h-7 w-7 lg:h-8 lg:w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400">{t("noDocuments")}</p>
              <p className="mt-1 text-xs lg:text-sm text-neutral-400 dark:text-neutral-500">
                {t("startByAdding")}
              </p>
              <Link
                href="/dashboard/upload"
                className="mt-4 lg:mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 lg:px-5 py-2 lg:py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                {t("addDocument")}
              </Link>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {recentDocuments.map((doc) => {
                const Icon = getFileIcon(doc.fileType);
                return (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-3 lg:gap-4 rounded-xl lg:rounded-2xl bg-neutral-50 p-3 lg:p-4 transition-all hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
                  >
                    <div className="flex h-10 w-10 lg:h-12 lg:w-12 flex-shrink-0 items-center justify-center rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20">
                      <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm lg:text-base font-medium text-neutral-900 dark:text-white">
                        {doc.displayName}
                      </h3>
                      <div className="mt-0.5 lg:mt-1 flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
                        <span>{formatFileSize(doc.sizeBytes)}</span>
                        <span className="text-neutral-300 dark:text-neutral-600">•</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 lg:gap-2 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
                      <button
                        onClick={() => setPreviewDocument(doc)}
                        className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg lg:rounded-xl bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                        title={t("preview")}
                      >
                        <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc.id, doc.originalName)}
                        className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg lg:rounded-xl bg-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                        title={t("download")}
                      >
                        <Download className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
