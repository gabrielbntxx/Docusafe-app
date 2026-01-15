"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { FileText, Folder, HardDrive, TrendingUp, Eye, Download, Image as ImageIcon, File } from "lucide-react";
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

export function DashboardClient({
  stats,
  recentDocuments = [],
}: {
  stats: DashboardStats;
  recentDocuments?: RecentDocument[];
}) {
  const { t } = useTranslation();
  const [previewDocument, setPreviewDocument] = useState<RecentDocument | null>(null);

  const statCards = [
    {
      nameKey: "documents" as const,
      value: stats.documentsCount || 0,
      icon: FileText,
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50",
      textColor: "text-primary-600",
    },
    {
      nameKey: "folders" as const,
      value: stats.foldersCount || 0,
      icon: Folder,
      color: "from-secondary-500 to-secondary-600",
      bgColor: "bg-secondary-50",
      textColor: "text-secondary-600",
    },
    {
      nameKey: "storage" as const,
      value: `${((stats.storageUsedBytes || 0) / 1024 / 1024).toFixed(1)} MB`,
      icon: HardDrive,
      color: "from-accent-500 to-accent-600",
      bgColor: "bg-accent-50",
      textColor: "text-accent-600",
    },
    {
      nameKey: "currentPlan" as const,
      value: stats.planType || "FREE",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return FileText;
    if (fileType === "image") return ImageIcon;
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

      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
            {t("dashboard")}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t("overview")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.nameKey}
              className="group rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-soft transition-all hover:shadow-soft-md dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl ${stat.bgColor} p-2 sm:p-3 dark:bg-opacity-20`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{t(stat.nameKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 dark:text-neutral-100">
            {t("quickActions")}
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Link
              href="/dashboard/upload"
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 sm:p-8 transition-all hover:border-primary-500 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:border-primary-500 dark:hover:bg-primary-900/20"
            >
              <FileText className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-primary-600 dark:text-neutral-500 dark:group-hover:text-primary-400" />
              <p className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-primary-700 dark:text-neutral-300 dark:group-hover:text-primary-400">
                {t("addDocument")}
              </p>
            </Link>

            <Link
              href="/dashboard/my-files?create=true"
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 sm:p-8 transition-all hover:border-secondary-500 hover:bg-secondary-50 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:border-secondary-500 dark:hover:bg-secondary-900/20"
            >
              <Folder className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-secondary-600 dark:text-neutral-500 dark:group-hover:text-secondary-400" />
              <p className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-secondary-700 dark:text-neutral-300 dark:group-hover:text-secondary-400">
                {t("createFolder")}
              </p>
            </Link>

            <Link
              href="/dashboard/search"
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 sm:p-8 transition-all hover:border-accent-500 hover:bg-accent-50 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:border-accent-500 dark:hover:bg-accent-900/20"
            >
              <TrendingUp className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-accent-600 dark:text-neutral-500 dark:group-hover:text-accent-400" />
              <p className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-accent-700 dark:text-neutral-300 dark:group-hover:text-accent-400">
                {t("search")}
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {t("recentDocuments")}
            </h2>
            {recentDocuments.length > 0 && (
              <Link
                href="/dashboard/documents"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {t("viewAll")}
              </Link>
            )}
          </div>

          {recentDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                {t("noDocuments")}
              </p>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                {t("startByAdding")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocuments.map((doc) => {
                const Icon = getFileIcon(doc.fileType);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 sm:gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:p-4 transition-all hover:bg-white hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/50"
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/40 dark:to-secondary-900/40 flex-shrink-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {doc.displayName}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{formatFileSize(doc.sizeBytes)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                        {doc.folder && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <div className="hidden sm:flex items-center gap-1">
                              <Folder
                                className="h-3 w-3"
                                style={{ color: doc.folder.color || undefined }}
                              />
                              <span className="truncate max-w-[100px]">{doc.folder.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => setPreviewDocument(doc)}
                        className="rounded-lg bg-primary-50 p-2 text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-900/60"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc.id, doc.originalName)}
                        className="rounded-lg bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                      >
                        <Download className="h-4 w-4" />
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
