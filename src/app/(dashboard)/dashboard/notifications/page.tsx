"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Bell, FileText, Folder, Trash2, CheckCheck, AlertTriangle, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  message?: string;
  time: Date;
  read: boolean;
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(
          data.notifications.map((n: any) => ({
            ...n,
            time: new Date(n.createdAt),
            read: n.read === 1,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    if (type === "document_uploaded") return <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />;
    if (type === "document_deleted") return <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (type === "folder_created") return <Folder className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />;
    if (type === "folder_deleted") return <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (type === "folder_updated") return <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    if (type === "plan_upgraded") return <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    if (type === "storage_warning") return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    return <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />;
  };

  const getNotificationMessage = (type: string) => {
    if (type === "document_uploaded") return t("documentUploaded");
    if (type === "document_deleted") return t("documentDeleted");
    if (type === "folder_created") return t("folderCreated");
    if (type === "folder_deleted") return t("folderDeleted");
    if (type === "folder_updated") return t("folderUpdated");
    if (type === "document_moved") return t("documentMoved");
    if (type === "plan_upgraded") return t("planUpgraded");
    if (type === "storage_warning") return t("storageWarning");
    return "";
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return diffMins + " " + t("minutesAgo");
    if (diffHours < 24) return diffHours + " " + t("hoursAgo");
    return diffDays + " " + t("daysAgo");
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (response.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (response.ok) {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard"
            className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t("notificationsTitle")}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {unreadCount > 0 ? `${unreadCount} ${t("unreadNotifications")}` : t("noNewNotifications")}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="mt-3 flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
          >
            <CheckCheck className="h-4 w-4" />
            {t("markAllAsRead")}
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600 dark:border-neutral-700 dark:border-t-primary-400"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Bell className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t("noNotifications")}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t("notificationsWillAppear")}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                !notification.read
                  ? "border-primary-200 bg-primary-50/50 dark:border-primary-900/50 dark:bg-primary-900/20"
                  : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                    !notification.read
                      ? "bg-primary-100 dark:bg-primary-900/40"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-neutral-900 dark:text-white">{notification.title}</p>
                    {!notification.read && <div className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                    {notification.message || getNotificationMessage(notification.type)}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">{getTimeAgo(notification.time)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
