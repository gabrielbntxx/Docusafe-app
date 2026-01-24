"use client";

import { useState } from "react";
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
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400">
          <Settings className="h-4 w-4" />
          {t("settings")}
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
          {t("settings")}
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
          {t("managePreferences")}
        </p>
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

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Language Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t("language")}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("chooseLanguage")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex w-full items-center gap-4 rounded-2xl p-4 transition-all ${
                  language === lang.code
                    ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10"
                    : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                  {lang.name}
                </span>
                {language === lang.code && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/25">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
              {theme === "dark" ? (
                <Moon className="h-7 w-7 text-white" />
              ) : (
                <Sun className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t("appearance")}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("customizeTheme")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex w-full items-center gap-4 rounded-2xl p-4 transition-all ${
                theme === "light"
                  ? "bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-500/10"
                  : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
                <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                {t("lightMode")}
              </span>
              {theme === "light" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/25">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex w-full items-center gap-4 rounded-2xl p-4 transition-all ${
                theme === "dark"
                  ? "bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-500/10"
                  : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
                <Moon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                {t("darkMode")}
              </span>
              {theme === "dark" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/25">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t("notifications")}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("manageNotifications")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setNotifications(!notifications)}
            className="flex w-full items-center justify-between rounded-2xl bg-neutral-50 p-5 transition-all hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  notifications
                    ? "bg-violet-100 dark:bg-violet-500/20"
                    : "bg-neutral-200 dark:bg-neutral-600"
                }`}
              >
                <Bell
                  className={`h-5 w-5 ${
                    notifications
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">
                  {t("pushNotifications")}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {notifications ? t("enabled") : t("disabled")}
                </p>
              </div>
            </div>
            <div
              className={`relative h-8 w-14 rounded-full transition-colors ${
                notifications
                  ? "bg-violet-500"
                  : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                  notifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Security Settings */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/25">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t("security")}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("protectWithPin")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-700/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    user.hasFolderPin
                      ? "bg-emerald-100 dark:bg-emerald-500/20"
                      : "bg-neutral-200 dark:bg-neutral-600"
                  }`}
                >
                  <Shield
                    className={`h-6 w-6 ${
                      user.hasFolderPin
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {t("folderPin")}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {user.hasFolderPin ? t("pinEnabled") : t("pinDisabled")}
                  </p>
                </div>
              </div>
              {user.hasFolderPin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              {user.hasFolderPin ? (
                <>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                  >
                    {t("changePin")}
                  </button>
                  <button
                    onClick={() => setIsRemovingPin(true)}
                    className="flex-1 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                  >
                    {t("removePin")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPinModal(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                >
                  {t("setPin")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 border-t border-black/5 bg-white/95 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95 lg:static lg:bottom-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:dark:bg-transparent z-40">
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className={`w-full rounded-2xl py-4 text-sm font-semibold text-white shadow-lg transition-all lg:w-auto lg:px-10 ${
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
