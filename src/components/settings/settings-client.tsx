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
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const [language, setLanguage] = useState(user.language);
  const [theme, setTheme] = useState(user.theme);
  const [notifications, setNotifications] = useState(user.notifications);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [isRemovingPin, setIsRemovingPin] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

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

        // Update the global theme immediately
        setGlobalTheme(theme as "light" | "dark");

        // Only reload if language changed (to update all translations)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t("settings")}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("managePreferences")}
          </p>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-primary-100 dark:bg-primary-900/40 p-3">
                <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Set Folder PIN
              </h3>
            </div>

            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Enter a 4-digit PIN to protect folder creation.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  New PIN (4 digits)
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Confirm PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPinModal(false);
                    setPin("");
                    setConfirmPin("");
                  }}
                  className="flex-1 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSetPin}
                  className="flex-1"
                  disabled={pin.length !== 4 || confirmPin.length !== 4}
                >
                  Set PIN
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove PIN Modal */}
      {isRemovingPin && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-100 dark:bg-red-900/40 p-3">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Remove Folder PIN
              </h3>
            </div>

            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Enter your current PIN to remove folder protection.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Current PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRemovingPin(false);
                    setCurrentPin("");
                  }}
                  className="flex-1 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemovePin}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={currentPin.length !== 4}
                >
                  Remove PIN
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Language Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-primary-100 dark:bg-primary-900/40 p-2.5">
              <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-white">{t("language")}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("chooseLanguage")}</p>
            </div>
          </div>

          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  language === lang.code
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                  {lang.name}
                </span>
                {language === lang.code && (
                  <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 dark:bg-amber-900/40 p-2.5">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-white">{t("appearance")}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("customizeTheme")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                theme === "light"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
              }`}
            >
              <Sun className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                {t("lightMode")}
              </span>
              {theme === "light" && <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                theme === "dark"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
              }`}
            >
              <Moon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                {t("darkMode")}
              </span>
              {theme === "dark" && <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 dark:bg-purple-900/40 p-2.5">
              <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-white">{t("notifications")}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("manageNotifications")}</p>
            </div>
          </div>

          <button
            onClick={() => setNotifications(!notifications)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-neutral-200 p-3 transition-all hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">{t("pushNotifications")}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {notifications ? t("enabled") : t("disabled")}
                </p>
              </div>
            </div>
            <div
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notifications ? "bg-primary-600" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            >
              <div
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                  notifications ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Security Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-green-100 dark:bg-green-900/40 p-2.5">
              <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 dark:text-white">{t("security")}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("protectWithPin")}</p>
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white">{t("folderPin")}</h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {user.hasFolderPin ? t("pinEnabled") : t("pinDisabled")}
                </p>
              </div>
              <Shield
                className={`h-5 w-5 ${
                  user.hasFolderPin ? "text-green-600 dark:text-green-400" : "text-neutral-400 dark:text-neutral-500"
                }`}
              />
            </div>

            <div className="mt-4 flex gap-2">
              {user.hasFolderPin ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowPinModal(true)}
                    className="flex-1 dark:border-neutral-600 dark:text-neutral-300"
                    size="sm"
                  >
                    {t("changePin")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsRemovingPin(true)}
                    className="flex-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    size="sm"
                  >
                    {t("removePin")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowPinModal(true)}
                  className="w-full"
                  size="sm"
                >
                  {t("setPin")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button - Fixed at bottom on mobile */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:dark:bg-transparent">
        <Button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className="w-full lg:w-auto lg:min-w-32"
          size="lg"
        >
          {saveStatus === "saving" ? (
            t("saving")
          ) : saveStatus === "saved" ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t("saved")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("saveSettings")}
            </>
          )}
        </Button>
      </div>

      {/* Spacer for fixed button on mobile */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
