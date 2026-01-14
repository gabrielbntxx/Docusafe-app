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
  User,
  Save,
  Check,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        // Theme changes are handled by setGlobalTheme above
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
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">{t("settings")}</h1>
        <p className="mt-2 text-neutral-500">
          {t("managePreferences")}
        </p>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-primary-50 p-3">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Set Folder PIN
              </h3>
            </div>

            <p className="mb-4 text-sm text-neutral-600">
              Enter a 4-digit PIN to protect folder creation. You will need to enter this PIN every time you create a new folder.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  New PIN (4 digits)
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Confirm PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest"
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
                  className="flex-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Remove Folder PIN
              </h3>
            </div>

            <p className="mb-4 text-sm text-neutral-600">
              Enter your current PIN to remove folder protection.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Current PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRemovingPin(false);
                    setCurrentPin("");
                  }}
                  className="flex-1"
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Language Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-3">
              <Globe className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{t("language")}</h2>
              <p className="text-sm text-neutral-500">{t("chooseLanguage")}</p>
            </div>
          </div>

          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                  language === lang.code
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium text-neutral-900">
                  {lang.name}
                </span>
                {language === lang.code && (
                  <Check className="h-5 w-5 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-secondary-50 p-3">
              <Lock className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{t("security")}</h2>
              <p className="text-sm text-neutral-500">{t("protectWithPin")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-900">{t("folderPin")}</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {user.hasFolderPin
                      ? t("pinEnabled")
                      : t("pinDisabled")}
                  </p>
                </div>
                <Shield
                  className={`h-5 w-5 ${
                    user.hasFolderPin ? "text-green-600" : "text-neutral-400"
                  }`}
                />
              </div>

              <div className="mt-4 flex gap-2">
                {user.hasFolderPin ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowPinModal(true)}
                      className="flex-1"
                      size="sm"
                    >
                      {t("changePin")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsRemovingPin(true)}
                      className="flex-1 text-red-600 hover:bg-red-50"
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

        {/* Theme Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-accent-50 p-3">
              {theme === "dark" ? (
                <Moon className="h-6 w-6 text-accent-600" />
              ) : (
                <Sun className="h-6 w-6 text-accent-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{t("appearance")}</h2>
              <p className="text-sm text-neutral-500">{t("customizeTheme")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                theme === "light"
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <Sun className="h-5 w-5 text-neutral-700" />
              <span className="flex-1 text-left font-medium text-neutral-900">
                {t("lightMode")}
              </span>
              {theme === "light" && <Check className="h-5 w-5 text-primary-600" />}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                theme === "dark"
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <Moon className="h-5 w-5 text-neutral-700" />
              <span className="flex-1 text-left font-medium text-neutral-900">
                {t("darkMode")}
              </span>
              {theme === "dark" && <Check className="h-5 w-5 text-primary-600" />}
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-3">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{t("notifications")}</h2>
              <p className="text-sm text-neutral-500">{t("manageNotifications")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setNotifications(!notifications)}
              className="flex w-full items-center justify-between rounded-xl border-2 border-neutral-200 p-4 transition-all hover:border-neutral-300"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-neutral-700" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">{t("pushNotifications")}</p>
                  <p className="text-sm text-neutral-500">
                    {t("receiveUpdates")}
                  </p>
                </div>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifications ? "bg-primary-600" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saveStatus === "saving"}
          className="min-w-32"
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
    </div>
  );
}
