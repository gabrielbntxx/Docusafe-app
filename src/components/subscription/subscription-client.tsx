"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Check, Sparkles, Zap, Shield, Users, Palette } from "lucide-react";

type SubscriptionProps = {
  currentPlan: "FREE" | "PRO";
  documentsCount: number;
  storageUsedBytes: number;
};

export function SubscriptionClient({ currentPlan, documentsCount, storageUsedBytes }: SubscriptionProps) {
  const { t } = useTranslation();

  const formatStorage = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const freePlanFeatures = [
    { icon: Check, text: `5 ${t("filesLimit")}` },
    { icon: Check, text: `2 MB ${t("storageLimit")}` },
    { icon: Check, text: t("smartTags") },
  ];

  const proPlanFeatures = [
    { icon: Sparkles, text: t("unlimitedFiles") },
    { icon: Zap, text: t("unlimitedStorage") },
    { icon: Shield, text: t("aiOcr") },
    { icon: Check, text: t("smartTags") },
    { icon: Check, text: t("advancedSearch") },
    { icon: Users, text: t("prioritySupport") },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100">
          {t("subscriptionTitle")}
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          {t("chooseYourPlan")}
        </p>
      </div>

      {/* Current Usage Stats */}
      <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{t("documents")}</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {documentsCount} <span className="text-lg text-neutral-500">/ {currentPlan === "FREE" ? "5" : "∞"}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{t("storage")}</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatStorage(storageUsedBytes)} MB <span className="text-lg text-neutral-500">/ {currentPlan === "FREE" ? "2" : "∞"}</span>
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto mt-12">
        {/* FREE Plan */}
        <div className="relative rounded-3xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-8 transition-all hover:shadow-2xl">
          {currentPlan === "FREE" && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                {t("currentPlanBadge")}
              </span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t("freePlan")}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-neutral-900 dark:text-neutral-100">0€</span>
                <span className="text-neutral-500 dark:text-neutral-400">{t("perMonth")}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">{t("features")}</p>
              {freePlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <feature.icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-300">{feature.text}</span>
                </div>
              ))}
            </div>

            {currentPlan === "FREE" && (
              <button
                disabled
                className="w-full rounded-xl bg-neutral-100 dark:bg-neutral-700 px-6 py-3.5 text-sm font-semibold text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
              >
                {t("currentPlanBadge")}
              </button>
            )}
          </div>
        </div>

        {/* PRO Plan */}
        <div className="relative rounded-3xl border-2 border-transparent bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 p-[2px] transition-all hover:shadow-2xl hover:shadow-primary-500/20">
          {currentPlan === "PRO" && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                {t("currentPlanBadge")}
              </span>
            </div>
          )}

          <div className="h-full rounded-[22px] bg-white dark:bg-neutral-800 p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t("proPlan")}</h3>
                  <span className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Popular
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                    5€
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">{t("perMonth")}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">{t("features")}</p>
                {proPlanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500">
                      <feature.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {currentPlan === "FREE" ? (
                <a
                  href="https://buy.stripe.com/eVq9AUaaE2DB3HtbFrgYU00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
                >
                  <span className="relative z-10">{t("upgradeNow")}</span>
                  <Zap className="relative z-10 h-4 w-4" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-secondary-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl bg-neutral-100 dark:bg-neutral-700 px-6 py-3.5 text-sm font-semibold text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                >
                  {t("currentPlanBadge")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="text-center mt-12">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          <Shield className="inline h-4 w-4 mr-1" />
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}
