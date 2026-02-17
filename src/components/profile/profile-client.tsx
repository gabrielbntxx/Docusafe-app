"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useProfileImage } from "@/hooks/useProfileImage";
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
  X,
  AlertTriangle,
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

const PLAN_CONFIG: Record<
  string,
  {
    label: string;
    storageLimitBytes: number;
    storageLabel: string;
    docLimit: number;
    docLabel: string;
    isPaid: boolean;
    gradient: string;
    shadow: string;
  }
> = {
  FREE: {
    label: "Gratuit",
    storageLimitBytes: 1 * 1024 * 1024 * 1024,
    storageLabel: "1 Go",
    docLimit: 15,
    docLabel: "15",
    isPaid: false,
    gradient: "",
    shadow: "",
  },
  STUDENT: {
    label: "Étudiant",
    storageLimitBytes: 100 * 1024 * 1024 * 1024,
    storageLabel: "100 Go",
    docLimit: Infinity,
    docLabel: "∞",
    isPaid: true,
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    shadow: "shadow-xl shadow-blue-500/25",
  },
  PRO: {
    label: "Pro",
    storageLimitBytes: 200 * 1024 * 1024 * 1024,
    storageLabel: "200 Go",
    docLimit: Infinity,
    docLabel: "∞",
    isPaid: true,
    gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
    shadow: "shadow-xl shadow-violet-500/25",
  },
  BUSINESS: {
    label: "Business",
    storageLimitBytes: Infinity,
    storageLabel: "Illimité",
    docLimit: Infinity,
    docLabel: "∞",
    isPaid: true,
    gradient: "bg-gradient-to-br from-indigo-600 to-violet-700",
    shadow: "shadow-xl shadow-indigo-500/25",
  },
};

export function ProfileClient({ user }: { user: ProfileUser }) {
  const { t } = useTranslation();
  const { update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const { imageUrl, refresh: refreshProfileImage } = useProfileImage(user.image);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const plan = PLAN_CONFIG[user.planType] || PLAN_CONFIG.FREE;
  const storagePercentage = plan.storageLimitBytes === Infinity ? 0 : (user.storageUsedBytes / plan.storageLimitBytes) * 100;
  const docsPercentage =
    plan.docLimit === Infinity ? 0 : (user.documentsCount / plan.docLimit) * 100;

  // Synchroniser avec l'URL signée
  useEffect(() => {
    if (imageUrl) {
      setProfileImage(imageUrl);
    }
  }, [imageUrl]);

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
        await refreshProfileImage();
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
      timeZone: "UTC",
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Mo";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return (mb / 1024).toFixed(2) + " Go";
    }
    return mb.toFixed(2) + " Mo";
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Abonnement annulé avec succès");
        setShowCancelModal(false);
        window.location.reload();
      } else {
        alert(data.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      alert("Erreur lors de l'annulation de l'abonnement");
    } finally {
      setIsCanceling(false);
    }
  };

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
              {plan.isPaid && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  {plan.label.toUpperCase()}
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
                  / {plan.docLabel}
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
                  / {plan.storageLabel}
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
          plan.isPaid
            ? `${plan.gradient} text-white ${plan.shadow}`
            : "bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none"
        }`}
      >
        {plan.isPaid && (
          <>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
          </>
        )}

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                plan.isPaid
                  ? "bg-white/20"
                  : "bg-amber-100 dark:bg-amber-500/20"
              }`}
            >
              <Crown
                className={`h-7 w-7 ${
                  plan.isPaid
                    ? "text-white"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
            </div>
            <div>
              <h3
                className={`text-xl font-bold ${
                  plan.isPaid
                    ? "text-white"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                Plan {plan.label}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  plan.isPaid
                    ? "text-white/70"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {plan.isPaid
                  ? `${plan.storageLabel} de stockage - Documents illimités`
                  : "Passez à un plan supérieur pour débloquer toutes les fonctionnalités"}
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
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                Actif
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-red-500/30 hover:text-white"
              >
                Se désabonner
              </button>
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
              <span className="text-sm">100 GB {t("storageLimit")}</span>
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

      {/* Modal de confirmation de désabonnement */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-neutral-800">
            {/* Bouton fermer */}
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icône */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            {/* Titre */}
            <h3 className="text-center text-xl font-bold text-neutral-900 dark:text-white">
              Vous êtes sûr de vouloir nous quitter ?
            </h3>

            {/* Description */}
            <p className="mt-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
              En annulant votre abonnement {plan.label}, vous perdrez accès à :
            </p>

            {/* Liste des avantages perdus */}
            <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Documents illimités
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {plan.storageLabel} de stockage
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                OCR intelligent
              </li>
              {user.planType === "BUSINESS" && (
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Equipe (jusqu&apos;à 5 membres)
                </li>
              )}
            </ul>

            {/* Boutons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl bg-neutral-100 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
              >
                Rester {plan.label}
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isCanceling ? "Annulation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
