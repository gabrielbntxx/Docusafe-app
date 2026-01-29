"use client";

import { useTranslation } from "@/hooks/useTranslation";
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  Users,
  FileText,
  HardDrive,
  Search,
  Tag,
  Crown,
  ArrowRight,
} from "lucide-react";

type SubscriptionProps = {
  currentPlan: "FREE" | "PRO";
  documentsCount: number;
  storageUsedBytes: number;
  userEmail: string;
};

export function SubscriptionClient({
  currentPlan,
  documentsCount,
  storageUsedBytes,
  userEmail,
}: SubscriptionProps) {
  const { t } = useTranslation();

  const formatStorage = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const freePlanFeatures = [
    { icon: FileText, text: `15 ${t("filesLimit")}`, included: true },
    { icon: HardDrive, text: `1 GB ${t("storageLimit")}`, included: true },
    { icon: Tag, text: t("smartTags"), included: true },
    { icon: Search, text: t("advancedSearch"), included: false },
    { icon: Zap, text: t("aiOcr"), included: false },
    { icon: Users, text: t("prioritySupport"), included: false },
  ];

  const proPlanFeatures = [
    { icon: FileText, text: t("unlimitedFiles"), included: true },
    { icon: HardDrive, text: "100 GB " + t("storageLimit"), included: true },
    { icon: Tag, text: t("smartTags"), included: true },
    { icon: Search, text: t("advancedSearch"), included: true },
    { icon: Zap, text: t("aiOcr"), included: true },
    { icon: Users, text: t("prioritySupport"), included: true },
  ];

  const maxDocs = currentPlan === "FREE" ? 5 : 999;
  const maxStorage = currentPlan === "FREE" ? 2 : 102400; // 100 GB in MB
  const docsPercentage = (documentsCount / maxDocs) * 100;
  const storagePercentage = (storageUsedBytes / (1024 * 1024)) / maxStorage * 100;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400">
          <Crown className="h-4 w-4" />
          {t("subscriptionTitle")}
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
          {t("chooseYourPlan")}
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
          Choisissez le plan qui correspond le mieux à vos besoins
        </p>
      </div>

      {/* Current Usage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("documents")}
              </p>
              <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                {documentsCount}
                <span className="text-lg font-normal text-neutral-400">
                  {" "}
                  / {currentPlan === "FREE" ? "15" : "∞"}
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

        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t("storage")}
              </p>
              <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                {formatStorage(storageUsedBytes)} MB
                <span className="text-lg font-normal text-neutral-400">
                  {" "}
                  / {currentPlan === "FREE" ? "1 GB" : "100 GB"}
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

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* FREE Plan */}
        <div
          className={`relative overflow-hidden rounded-3xl p-8 transition-all ${
            currentPlan === "FREE"
              ? "bg-white ring-2 ring-blue-500 shadow-xl shadow-blue-500/10 dark:bg-neutral-800 dark:ring-blue-400"
              : "bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none"
          }`}
        >
          {currentPlan === "FREE" && (
            <div className="absolute right-6 top-6">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3 w-3" />
                {t("currentPlanBadge")}
              </span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t("freePlan")}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-neutral-900 dark:text-white">
                  0€
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t("perMonth")}
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Pour commencer gratuitement
              </p>
            </div>

            <div className="space-y-3">
              {freePlanFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 ${
                    !feature.included ? "opacity-40" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      feature.included
                        ? "bg-blue-100 dark:bg-blue-500/20"
                        : "bg-neutral-100 dark:bg-neutral-700"
                    }`}
                  >
                    <feature.icon
                      className={`h-4 w-4 ${
                        feature.included
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-neutral-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      feature.included
                        ? "text-neutral-700 dark:text-neutral-300"
                        : "text-neutral-400 line-through"
                    }`}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {currentPlan === "FREE" ? (
              <button
                disabled
                className="w-full rounded-xl bg-neutral-100 py-3.5 text-sm font-semibold text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
              >
                {t("currentPlanBadge")}
              </button>
            ) : (
              <button
                disabled
                className="w-full rounded-xl bg-neutral-100 py-3.5 text-sm font-semibold text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
              >
                Plan actuel: Pro
              </button>
            )}
          </div>
        </div>

        {/* PRO Plan */}
        <div
          className={`relative overflow-hidden rounded-3xl p-8 transition-all ${
            currentPlan === "PRO"
              ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/25"
              : "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/25"
          }`}
        >
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />

          {currentPlan === "PRO" && (
            <div className="absolute right-6 top-6">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {t("currentPlanBadge")}
              </span>
            </div>
          )}

          <div className="relative space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{t("proPlan")}</h3>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                  Populaire
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold">5€</span>
                <span className="text-violet-200">{t("perMonth")}</span>
              </div>
              <p className="mt-2 text-sm text-violet-200">
                Pour les utilisateurs avancés
              </p>
            </div>

            <div className="space-y-3">
              {proPlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {currentPlan === "FREE" ? (
              <a
                href={`https://buy.stripe.com/eVq9AUaaE2DB3HtbFrgYU00?prefilled_email=${encodeURIComponent(userEmail)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-violet-600 shadow-lg transition-all hover:bg-violet-50 hover:shadow-xl active:scale-[0.98]"
              >
                {t("upgradeNow")}
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <button
                disabled
                className="w-full rounded-xl bg-white/20 py-3.5 text-sm font-semibold text-white backdrop-blur-sm"
              >
                {t("currentPlanBadge")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Shield className="h-4 w-4" />
        Paiement sécurisé par Stripe
      </div>

      {/* FAQ or Features comparison */}
      <div className="rounded-3xl bg-white p-8 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
        <h3 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">
          Pourquoi passer à Pro ?
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">
                Fichiers illimités
              </h4>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Stockez autant de documents que vous le souhaitez
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <HardDrive className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">
                100 GB de stockage
              </h4>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Espace de stockage étendu pour vos fichiers
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/20">
              <Zap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-white">
                OCR intelligent
              </h4>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Extraction automatique du texte de vos documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
