"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "@/components/providers/theme-provider";
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
  Settings,
  Sparkles,
  Mail,
  Copy,
  HelpCircle,
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
    <div className="mx-auto max-w-5xl">
      {/* Header - More compact on desktop */}
      <div className="mb-6 flex items-center justify-between lg:mb-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 lg:hidden">
            <Settings className="h-3.5 w-3.5" />
            {t("settings")}
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white lg:text-xl">
            {t("settings")}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 lg:text-xs">
            {t("managePreferences")}
          </p>
        </div>

        {/* Save Button - Always visible on desktop in header */}
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className={`hidden lg:flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${
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

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-3xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  New PIN (4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full rounded-2xl border-0 bg-neutral-100 px-4 py-4 text-center text-2xl tracking-[0.5em] text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
                  className="w-full rounded-2xl border-0 bg-neutral-100 px-4 py-4 text-center text-2xl tracking-[0.5em] text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPin("");
                    setConfirmPin("");
                  }}
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white py-4 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetPin}
                  disabled={pin.length !== 4 || confirmPin.length !== 4}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-3xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
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
                  className="w-full rounded-2xl border-0 bg-neutral-100 px-4 py-4 text-center text-2xl tracking-[0.5em] text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-red-500/30 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsRemovingPin(false);
                    setCurrentPin("");
                  }}
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white py-4 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemovePin}
                  disabled={currentPin.length !== 4}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 py-4 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-3xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {t("emailGuideTitle")}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowEmailGuide(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  1
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-0.5">
                  {t("emailGuideStep1")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  2
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-0.5">
                  {t("emailGuideStep2")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  3
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 pt-0.5">
                  {t("emailGuideStep3")}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {t("emailGuideNote")}
                </p>
              </div>

              <button
                onClick={() => setShowEmailGuide(false)}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
              >
                {t("gotIt")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Grid - Compact on desktop */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-4">
        {/* Language Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none lg:rounded-2xl lg:p-5">
          <div className="mb-4 flex items-center gap-3 lg:mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25 lg:h-11 lg:w-11 lg:rounded-xl lg:shadow-md">
              <Globe className="h-6 w-6 text-white lg:h-5 lg:w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("language")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("chooseLanguage")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all lg:rounded-xl lg:p-2.5 ${
                  language === lang.code
                    ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10"
                    : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span className="text-xl lg:text-lg">{lang.flag}</span>
                <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white">
                  {lang.name}
                </span>
                {language === lang.code && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-md">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none lg:rounded-2xl lg:p-5">
          <div className="mb-4 flex items-center gap-3 lg:mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25 lg:h-11 lg:w-11 lg:rounded-xl lg:shadow-md">
              {theme === "dark" ? (
                <Moon className="h-6 w-6 text-white lg:h-5 lg:w-5" />
              ) : (
                <Sun className="h-6 w-6 text-white lg:h-5 lg:w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("appearance")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("customizeTheme")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all lg:rounded-xl lg:p-2.5 ${
                theme === "light"
                  ? "bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-500/10"
                  : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white">
                {t("lightMode")}
              </span>
              {theme === "light" && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-md">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all lg:rounded-xl lg:p-2.5 ${
                theme === "dark"
                  ? "bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-500/10"
                  : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                <Moon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white">
                {t("darkMode")}
              </span>
              {theme === "dark" && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-md">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none lg:rounded-2xl lg:p-5">
          <div className="mb-4 flex items-center gap-3 lg:mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25 lg:h-11 lg:w-11 lg:rounded-xl lg:shadow-md">
              <Bell className="h-6 w-6 text-white lg:h-5 lg:w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("notifications")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("manageNotifications")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setNotifications(!notifications)}
            className="flex w-full items-center justify-between rounded-xl bg-neutral-50 p-4 transition-all hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50 lg:rounded-xl lg:p-3.5"
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
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notifications
                  ? "bg-violet-500"
                  : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Security Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none lg:rounded-2xl lg:p-5">
          <div className="mb-4 flex items-center gap-3 lg:mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/25 lg:h-11 lg:w-11 lg:rounded-xl lg:shadow-md">
              <Lock className="h-6 w-6 text-white lg:h-5 lg:w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("security")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("protectWithPin")}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-700/30 lg:rounded-xl lg:p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg lg:h-9 lg:w-9 ${
                    user.hasFolderPin
                      ? "bg-emerald-100 dark:bg-emerald-500/20"
                      : "bg-neutral-200 dark:bg-neutral-600"
                  }`}
                >
                  <Shield
                    className={`h-5 w-5 ${
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
              {user.hasFolderPin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              {user.hasFolderPin ? (
                <>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className="flex-1 rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                  >
                    {t("changePin")}
                  </button>
                  <button
                    onClick={() => setIsRemovingPin(true)}
                    className="flex-1 rounded-lg bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                  >
                    {t("removePin")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPinModal(true)}
                  className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  {t("setPin")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email Import Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none lg:rounded-2xl lg:p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3 lg:mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25 lg:h-11 lg:w-11 lg:rounded-xl lg:shadow-md">
              <Mail className="h-6 w-6 text-white lg:h-5 lg:w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("emailImport")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("emailImportDescription")}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-700/30 lg:rounded-xl lg:p-3.5">
            <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {t("yourImportEmail")}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-lg bg-white px-3 py-2.5 dark:bg-neutral-800">
                {isLoadingEmail ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t("loading")}...
                    </span>
                  </div>
                ) : importEmail ? (
                  <p className="truncate text-sm font-mono text-neutral-900 dark:text-white">
                    {importEmail}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t("emailImportNotConfigured")}
                  </p>
                )}
              </div>
              <button
                onClick={handleCopyEmail}
                disabled={isLoadingEmail || !importEmail}
                className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
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
                className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              >
                <HelpCircle className="h-4 w-4" />
                {t("emailGuide")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button - Mobile only (desktop has it in header) */}
      <div className="fixed bottom-20 left-0 right-0 border-t border-black/5 bg-white/95 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95 z-40 lg:hidden">
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className={`w-full rounded-2xl py-4 text-sm font-semibold text-white shadow-lg transition-all ${
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
              <Check className="h-5 w-5" />
              {t("saved")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />
              {t("saveSettings")}
            </span>
          )}
        </button>
      </div>

      {/* Spacer for fixed button on mobile */}
      <div className="h-32 lg:hidden" />
    </div>
  );
}
