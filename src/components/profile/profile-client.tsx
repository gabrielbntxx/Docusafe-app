"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Camera, Mail, Calendar, Crown, HardDrive, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Vérifier le type
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

        // Rafraîchir la session pour mettre à jour l'image dans le header
        await update();

        // Recharger la page pour voir les changements partout
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
    return mb.toFixed(2) + " MB";
  };

  const maxStorage = user.planType === "PRO" ? 10 * 1024 * 1024 * 1024 : 2 * 1024 * 1024; // 10GB ou 2MB
  const storagePercentage = (user.storageUsedBytes / maxStorage) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Mon Profil
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Gérez vos informations personnelles et votre abonnement
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Photo de profil */}
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-secondary-500">
              {profileImage ? (
                <img src={profileImage} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Bouton pour changer la photo */}
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-all hover:bg-primary-700 active:scale-95"
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
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {user.name}
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400 md:justify-start">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400 md:justify-start">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Membre depuis {formatDate(user.createdAt)}</span>
              </div>

              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Plan {user.planType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Documents */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Documents déposés
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {user.documentsCount}
                {user.planType === "FREE" && (
                  <span className="text-sm text-neutral-500"> / 5</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stockage */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
              <HardDrive className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Stockage utilisé
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatBytes(user.storageUsedBytes)}
              </p>
              <p className="text-xs text-neutral-500">
                sur {formatBytes(maxStorage)}
              </p>

              {/* Barre de progression */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className={`h-full transition-all ${
                    storagePercentage > 80
                      ? "bg-red-500"
                      : storagePercentage > 50
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Abonnement */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary-50 to-secondary-50 p-8 dark:border-neutral-700 dark:from-primary-900/20 dark:to-secondary-900/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {user.planType === "PRO" ? "Plan Pro 💎" : "Plan Gratuit"}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {user.planType === "PRO"
                ? "Profitez de tous les avantages premium"
                : "Passez à Pro pour débloquer toutes les fonctionnalités"}
            </p>

            {user.planType === "FREE" && (
              <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                <li>✨ Fichiers illimités</li>
                <li>💾 10 GB de stockage</li>
                <li>🤖 OCR alimenté par IA</li>
                <li>🏷️ Tags intelligents</li>
                <li>🔍 Recherche avancée</li>
              </ul>
            )}
          </div>

          {user.planType === "FREE" && (
            <Button
              onClick={() => (window.location.href = "/dashboard/subscription")}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
            >
              Passer à Pro
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
