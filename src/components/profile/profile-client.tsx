"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Camera,
  Mail,
  Calendar,
  Crown,
  HardDrive,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Settings,
  CreditCard,
} from "lucide-react";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  planType: string;
  documentsCount: number;
  storageUsedBytes: number;
  createdAt: string;
};

export function ProfileClient({ user }: { user: ProfileUser }) {
  const { t } = useTranslation();
  const { update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user.image);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Le fichier doit être une image");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.imageUrl);
        await update();
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de l'upload de l'image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return (mb / 1024).toFixed(2) + " GB";
    }
    return mb.toFixed(2) + " MB";
  };

  const maxStorage =
    user.planType === "PRO" ? 10 * 1024 * 1024 * 1024 : 2 * 1024 * 1024;
  const storagePercentage = (user.storageUsedBytes / maxStorage) * 100;
  const maxDocs = user.planType === "PRO" ? 999 : 5;
  const docsPercentage = (user.documentsCount / maxDocs) * 100;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
          <User className="h-4 w-4" />
          {t("profile")}
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
          Mon Profil
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-8 text-white shadow-xl shadow-blue-500/25">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Photo de profil */}
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-4 ring-white/30 sm:h-32 sm:w-32">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Bouton pour changer la photo */}
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-blue-600 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Camera className="h-5 w-5" />
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <h2 className="text-2xl font-bold sm:text-3xl">{user.name}</h2>
              {user.planType === "PRO" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  PRO
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-white/80 sm:justify-start">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-white/80 sm:justify-start">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Membre depuis {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <a
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <Settings className="h-4 w-4" />
                {t("settings")}
              </a>
              <a
                href="/dashboard/subscription"
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <CreditCard className="h-4 w-4" />
                {t("subscription")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Documents */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("documents")}
              </p>
              <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                {user.documentsCount}
                <span className="text-lg font-normal text-neutral-400">
                  {" "}
                  / {user.planType === "PRO" ? "∞" : "5"}
                </span>
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20">
              <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${Math.min(docsPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stockage */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("storage")}
              </p>
              <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                {formatBytes(user.storageUsedBytes)}
                <span className="text-lg font-normal text-neutral-400">
                  {" "}
                  / {user.planType === "PRO" ? "10 GB" : "2 MB"}
                </span>
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <HardDrive className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className={`h-full rounded-full transition-all ${
                storagePercentage > 80
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600"
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Plan Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-8 ${
          user.planType === "PRO"
            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/25"
            : "bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none"
        }`}
      >
        {user.planType === "PRO" && (
          <>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
          </>
        )}

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                user.planType === "PRO"
                  ? "bg-white/20"
                  : "bg-amber-100 dark:bg-amber-500/20"
              }`}
            >
              <Crown
                className={`h-7 w-7 ${
                  user.planType === "PRO"
                    ? "text-white"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
            </div>
            <div>
              <h3
                className={`text-xl font-bold ${
                  user.planType === "PRO"
                    ? "text-white"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                Plan {user.planType === "PRO" ? "Pro" : "Gratuit"}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  user.planType === "PRO"
                    ? "text-violet-200"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {user.planType === "PRO"
                  ? "Profitez de tous les avantages premium"
                  : "Passez à Pro pour débloquer toutes les fonctionnalités"}
              </p>
            </div>
          </div>

          {user.planType === "FREE" ? (
            <a
              href="/dashboard/subscription"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 active:scale-[0.98]"
            >
              {t("upgradeNow")}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              Actif
            </div>
          )}
        </div>

        {user.planType === "FREE" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
                <FileText className="h-3 w-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm">{t("unlimitedFiles")}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
                <HardDrive className="h-3 w-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm">10 GB {t("storageLimit")}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
                <Sparkles className="h-3 w-3 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm">{t("aiOcr")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-500/20">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t("security")}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Votre compte est sécurisé
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Email vérifié
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Connexion sécurisée
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
