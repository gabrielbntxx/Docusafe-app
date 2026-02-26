"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Bell, FileText, Folder, Trash2, CheckCheck, AlertTriangle, Sparkles, GitBranch, CheckCircle2, XCircle, Clock } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message?: string;
  time: Date;
  read: boolean;
};

export function NotificationsDropdown() {
  const translation = useTranslation();
  const t = translation.t;
  const session2 = useSession();
  const session = session2.data;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    // Poll every 30s so new notifications appear without manual refresh
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications.map((n: any) => (Object.assign(Object.assign({}, n), { time: new Date(n.createdAt), read: n.read === 1 }))));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    if (type === "document_uploaded") return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    if (type === "document_deleted") return <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (type === "folder_created") return <Folder className="h-5 w-5 text-violet-600 dark:text-violet-400" />;
    if (type === "folder_deleted") return <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (type === "folder_updated") return <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    if (type === "plan_upgraded") return <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    if (type === "storage_warning") return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    if (type === "workflow_step_pending") return <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    if (type === "workflow_completed") return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    if (type === "workflow_rejected") return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (type === "workflow_reminder") return <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
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
        setNotifications(notifications.map(n => (Object.assign(Object.assign({}, n), { read: true }))));
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
        setNotifications(notifications.map(n => n.id === id ? Object.assign(Object.assign({}, n), { read: true }) : n));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && notifications.length === 0) fetchNotifications();
        }}
        className="relative rounded-xl p-2 transition-all hover:bg-neutral-100 active:scale-95 dark:hover:bg-neutral-700"
      >
        <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-white">{t("notificationsTitle")}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                <CheckCheck className="h-3.5 w-3.5" />
                {t("markAllAsRead")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto overflow-x-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{t("noNotifications")}</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${!notification.read ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${!notification.read ? "bg-blue-100 dark:bg-blue-500/20" : "bg-neutral-100 dark:bg-neutral-700"}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">{notification.message || getNotificationMessage(notification.type)}</p>
                        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{getTimeAgo(notification.time)}</p>
                      </div>
                      {!notification.read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
