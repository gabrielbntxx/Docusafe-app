"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { FileText, Folder, HardDrive, TrendingUp } from "lucide-react";

type DashboardStats = {
  documentsCount: number;
  foldersCount: number;
  storageUsedBytes: number;
  planType: string;
};

export function DashboardClient({ stats }: { stats: DashboardStats }) {
  const { t } = useTranslation();

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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {t("dashboard")}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t("overview")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.nameKey}
            className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition-all hover:shadow-soft-md dark:border-neutral-700 dark:bg-neutral-800"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${stat.bgColor} p-3 dark:bg-opacity-20`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(stat.nameKey)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6 dark:text-neutral-100">
          {t("quickActions")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/dashboard/upload"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition-all hover:border-primary-500 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:border-primary-500 dark:hover:bg-primary-900/20"
          >
            <FileText className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-primary-600 dark:text-neutral-500 dark:group-hover:text-primary-400" />
            <p className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-primary-700 dark:text-neutral-300 dark:group-hover:text-primary-400">
              {t("addDocument")}
            </p>
          </a>

          <a
            href="/dashboard/my-files?create=true"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition-all hover:border-secondary-500 hover:bg-secondary-50 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:border-secondary-500 dark:hover:bg-secondary-900/20"
          >
            <Folder className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-secondary-600 dark:text-neutral-500 dark:group-hover:text-secondary-400" />
            <p className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-secondary-700 dark:text-neutral-300 dark:group-hover:text-secondary-400">
              {t("createFolder")}
            </p>
          </a>

          <a
            href="/dashboard/search"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition-all hover:border-accent-500 hover:bg-accent-50 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:border-accent-500 dark:hover:bg-accent-900/20"
          >
            <TrendingUp className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-accent-600 dark:text-neutral-500 dark:group-hover:text-accent-400" />
            <p className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-accent-700 dark:text-neutral-300 dark:group-hover:text-accent-400">
              {t("search")}
            </p>
          </a>
        </div>
      </div>

      {/* Recent Documents Placeholder */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4 dark:text-neutral-100">
          {t("recentDocuments")}
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            {t("noDocuments")}
          </p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            {t("startByAdding")}
          </p>
        </div>
      </div>
    </div>
  );
}
