"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "@/components/providers/theme-provider";
import { useTutorial } from "@/contexts/TutorialContext";
import {
  Globe,
  Lock,
  Bell,
  Moon,
  Sun,
  Save,
  Check,
  Shield,
  X,
  Sparkles,
  Mail,
  Copy,
  HelpCircle,
  ChevronRight,
  Play,
  GraduationCap,
} from "lucide-react";

type UserSettings = {
  id: string;
  name: string;
  email: string;
  language: string;
  hasFolderPin: boolean;
  theme: string;
  notifications: boolean;
};

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export function SettingsClient({ user }: { user: UserSettings }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { setTheme: setGlobalTheme } = useTheme();
  const { startTutorial, hasCompletedTutorial } = useTutorial();
  const [language, setLanguage] = useState(user.language);
  const [theme, setTheme] = useState(user.theme);
  const [notifications, setNotifications] = useState(user.notifications);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [isRemovingPin, setIsRemovingPin] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showEmailGuide, setShowEmailGuide] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [importEmail, setImportEmail] = useState<string | null>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);

  // Fetch import email from API on mount
  useEffect(() => {
    const fetchImportEmail = async () => {
      try {
        const response = await fetch("/api/settings/import-email");
        if (response.ok) {
          const data = await response.json();
          setImportEmail(data.importEmail);
        }
      } catch (error) {
        console.error("Error fetching import email:", error);
      } finally {
        setIsLoadingEmail(false);
      }
    };

    fetchImportEmail();
  }, []);

  const handleCopyEmail = async () => {
    if (!importEmail) return;

    try {
      await navigator.clipboard.writeText(importEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = importEmail;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus("saving");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          theme,
          notifications,
        }),
      });

      if (response.ok) {
        setSaveStatus("saved");
        setGlobalTheme(theme as "light" | "dark");

        if (language !== user.language) {
          setTimeout(() => window.location.reload(), 500);
        } else {
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      } else {
        alert(t("error"));
        setSaveStatus("idle");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(t("error"));
      setSaveStatus("idle");
    }
  };

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      alert("PIN must be exactly 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      alert("PINs do not match");
      return;
    }

    try {
      const response = await fetch("/api/settings/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        setShowPinModal(false);
        setPin("");
        setConfirmPin("");
        router.refresh();
        alert("PIN successfully set");
      } else {
        const data = await response.json();
        alert(data.error || "Error setting PIN");
      }
    } catch (error) {
      console.error("Error setting PIN:", error);
      alert("Error setting PIN");
    }
  };

  const handleRemovePin = async () => {
    if (currentPin.length !== 4 || !/^\d{4}$/.test(currentPin)) {
      alert("Enter your current 4-digit PIN");
      return;
    }

    try {
      const response = await fetch("/api/settings/pin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin }),
      });

      if (response.ok) {
        setIsRemovingPin(false);
        setCurrentPin("");
        router.refresh();
        alert("PIN successfully removed");
      } else {
        const data = await response.json();
        alert(data.error || "Error removing PIN");
      }
    } catch (error) {
      console.error("Error removing PIN:", error);
      alert("Error removing PIN");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-0">
      {/* Mobile Header */}
      <div className="mb-6 lg:mb-4">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl lg:text-xl">
          {t("settings")}
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400 sm:mt-1">
          {t("managePreferences")}
        </p>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-[28px]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Set Folder PIN
                  </h3>
                  <p className="text-xs text-neutral-500">Protect your folders</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin("");
                  setConfirmPin("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  New PIN (4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full rounded-2xl border-0 bg-neutral-100 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) =>
                    setConfirmPin(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="••••"
                  className="w-full rounded-2xl border-0 bg-neutral-100 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPin("");
                    setConfirmPin("");
                  }}
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetPin}
                  disabled={pin.length !== 4 || confirmPin.length !== 4}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                >
                  Set PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove PIN Modal */}
      {isRemovingPin && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-[28px]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Remove Folder PIN
                  </h3>
                  <p className="text-xs text-neutral-500">Disable folder protection</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsRemovingPin(false);
                  setCurrentPin("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Current PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) =>
                    setCurrentPin(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="••••"
                  className="w-full rounded-2xl border-0 bg-neutral-100 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-red-500/30 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsRemovingPin(false);
                    setCurrentPin("");
                  }}
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemovePin}
                  disabled={currentPin.length !== 4}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                >
                  Remove PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Guide Modal */}
      {showEmailGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-[28px]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    {t("emailGuideTitle")}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowEmailGuide(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  1
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-0.5">
                  {t("emailGuideStep1")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  2
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-0.5">
                  {t("emailGuideStep2")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  3
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-0.5">
                  {t("emailGuideStep3")}
                </p>
              </div>

              <div className="mt-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {t("emailGuideNote")}
                </p>
              </div>

              <button
                onClick={() => setShowEmailGuide(false)}
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
              >
                {t("gotIt")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Cards - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">

        {/* Language Settings */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50 sm:rounded-3xl sm:shadow-xl sm:shadow-black/5 dark:sm:shadow-none">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-700/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-500/20 sm:h-11 sm:w-11">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white sm:text-base">
                {t("language")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("chooseLanguage")}
              </p>
            </div>
          </div>

          <div className="p-2 sm:p-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all sm:p-3 ${
                  language === lang.code
                    ? "bg-blue-50 dark:bg-blue-500/10"
                    : "hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-700/30"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white">
                  {lang.name}
                </span>
                {language === lang.code ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50 sm:rounded-3xl sm:shadow-xl sm:shadow-black/5 dark:sm:shadow-none">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-700/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/20 sm:h-11 sm:w-11">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-white" />
              ) : (
                <Sun className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white sm:text-base">
                {t("appearance")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("customizeTheme")}
              </p>
            </div>
          </div>

          <div className="p-2 sm:p-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all sm:p-3 ${
                theme === "light"
                  ? "bg-amber-50 dark:bg-amber-500/10"
                  : "hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-700/30"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white">
                {t("lightMode")}
              </span>
              {theme === "light" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
              )}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all sm:p-3 ${
                theme === "dark"
                  ? "bg-amber-50 dark:bg-amber-500/10"
                  : "hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-700/30"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                <Moon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white">
                {t("darkMode")}
              </span>
              {theme === "dark" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50 sm:rounded-3xl sm:shadow-xl sm:shadow-black/5 dark:sm:shadow-none">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-700/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-md shadow-violet-500/20 sm:h-11 sm:w-11">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white sm:text-base">
                {t("notifications")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("manageNotifications")}
              </p>
            </div>
          </div>

          <div className="p-2 sm:p-3">
            <button
              onClick={() => setNotifications(!notifications)}
              className="flex w-full items-center justify-between rounded-xl p-3 transition-all hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-700/30 sm:p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    notifications
                      ? "bg-violet-100 dark:bg-violet-500/20"
                      : "bg-neutral-200 dark:bg-neutral-600"
                  }`}
                >
                  <Bell
                    className={`h-4 w-4 ${
                      notifications
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {t("pushNotifications")}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {notifications ? t("enabled") : t("disabled")}
                  </p>
                </div>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications
                    ? "bg-violet-500"
                    : "bg-neutral-300 dark:bg-neutral-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    notifications ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50 sm:rounded-3xl sm:shadow-xl sm:shadow-black/5 dark:sm:shadow-none">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-700/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-500/20 sm:h-11 sm:w-11">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white sm:text-base">
                {t("security")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("protectWithPin")}
              </p>
            </div>
            {user.hasFolderPin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Sparkles className="h-2.5 w-2.5" />
                Active
              </span>
            )}
          </div>

          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-700/30 sm:p-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    user.hasFolderPin
                      ? "bg-emerald-100 dark:bg-emerald-500/20"
                      : "bg-neutral-200 dark:bg-neutral-600"
                  }`}
                >
                  <Shield
                    className={`h-4 w-4 ${
                      user.hasFolderPin
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {t("folderPin")}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user.hasFolderPin ? t("pinEnabled") : t("pinDisabled")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {user.hasFolderPin ? (
                <>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                  >
                    {t("changePin")}
                  </button>
                  <button
                    onClick={() => setIsRemovingPin(true)}
                    className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                  >
                    {t("removePin")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPinModal(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  {t("setPin")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email Import Settings - Full Width */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50 sm:rounded-3xl sm:shadow-xl sm:shadow-black/5 dark:sm:shadow-none lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-700/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md shadow-cyan-500/20 sm:h-11 sm:w-11">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white sm:text-base">
                {t("emailImport")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("emailImportDescription")}
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {t("yourImportEmail")}
            </p>

            {/* Email Display - Mobile Optimized */}
            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-700/30">
              {isLoadingEmail ? (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t("loading")}...
                  </span>
                </div>
              ) : importEmail ? (
                <p className="break-all text-sm font-mono text-neutral-900 dark:text-white">
                  {importEmail}
                </p>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t("emailImportNotConfigured")}
                </p>
              )}
            </div>

            {/* Action Buttons - Stack on Mobile */}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleCopyEmail}
                disabled={isLoadingEmail || !importEmail}
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed sm:h-10 ${
                  emailCopied
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {emailCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {t("copyEmail")}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowEmailGuide(true)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600 sm:h-10"
              >
                <HelpCircle className="h-4 w-4" />
                {t("emailGuide")}
              </button>
            </div>
          </div>
        </div>

        {/* Tutorial Settings - Full Width */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50 sm:rounded-3xl sm:shadow-xl sm:shadow-black/5 dark:sm:shadow-none lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-700/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md shadow-purple-500/20 sm:h-11 sm:w-11">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white sm:text-base">
                {t("tutorial")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("tutorialSettingsDescription")}
              </p>
            </div>
            {hasCompletedTutorial && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Check className="h-2.5 w-2.5" />
                {t("completed")}
              </span>
            )}
          </div>

          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-700/30 sm:p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {t("guidedTour")}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t("guidedTourDescription")}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={startTutorial}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg active:scale-[0.98]"
            >
              <Play className="h-4 w-4" />
              {t("restartTutorial")}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button - Fixed Bottom on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200/80 bg-white/90 p-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90 z-40 safe-area-bottom lg:hidden">
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className={`w-full rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all ${
            saveStatus === "saved"
              ? "bg-emerald-500 shadow-emerald-500/25"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/25 hover:shadow-xl"
          } active:scale-[0.98] disabled:opacity-50 disabled:shadow-none`}
        >
          {saveStatus === "saving" ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("saving")}
            </span>
          ) : saveStatus === "saved" ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              {t("saved")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />
              {t("saveSettings")}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Save Button - In Header Position */}
      <div className="hidden lg:fixed lg:right-8 lg:top-20 lg:block lg:z-40">
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${
            saveStatus === "saved"
              ? "bg-emerald-500 shadow-emerald-500/25"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/25 hover:shadow-xl"
          } active:scale-[0.98] disabled:opacity-50 disabled:shadow-none`}
        >
          {saveStatus === "saving" ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("saving")}
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check className="h-4 w-4" />
              {t("saved")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("saveSettings")}
            </>
          )}
        </button>
      </div>

      {/* Spacer for fixed button on mobile */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
