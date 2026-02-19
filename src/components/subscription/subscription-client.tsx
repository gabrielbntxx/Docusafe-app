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
  Crown,
  ArrowRight,
  GraduationCap,
  Bot,
  Cloud,
  FileOutput,
  Bell,
  Lock,
  Share2,
  Building2,
  Palette,
  LayoutDashboard,
  FilePlus,
  X,
} from "lucide-react";

type PlanType = "FREE" | "STUDENT" | "PRO" | "BUSINESS";

type SubscriptionProps = {
  currentPlan: PlanType;
  documentsCount: number;
  storageUsedBytes: number;
  userId: string;
  userEmail: string;
};

export function SubscriptionClient({
  currentPlan,
  documentsCount,
  storageUsedBytes,
  userId,
  userEmail,
}: SubscriptionProps) {
  const { t } = useTranslation();

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} Go`;
    }
    return `${mb.toFixed(2)} Mo`;
  };

  // Returns max storage in MB for progress bar calculations
  const getMaxStorage = (plan: PlanType) => {
    switch (plan) {
      case "STUDENT": return 1 * 1024 * 1024;       // 1 TB in MB
      case "PRO":     return 2 * 1024 * 1024;       // 2 TB in MB
      case "BUSINESS": return 4 * 1024 * 1024;      // 4 TB in MB
      default: return 1024; // 1 GB fallback
    }
  };

  const getStorageLabel = (plan: PlanType) => {
    switch (plan) {
      case "STUDENT": return "1 To";
      case "PRO":     return "2 To";
      case "BUSINESS": return "4 To";
      default: return "1 Go";
    }
  };

  const getMaxDocs = (plan: PlanType) => {
    switch (plan) {
      case "STUDENT":
      case "PRO":
      case "BUSINESS":
        return Infinity;
      default: return 15;
    }
  };

  const maxDocs = getMaxDocs(currentPlan);
  const maxStorage = getMaxStorage(currentPlan);
  const docsPercentage = maxDocs === Infinity ? 10 : (documentsCount / maxDocs) * 100;
  const storagePercentage = maxStorage === Infinity ? 0 : (storageUsedBytes / (1024 * 1024)) / maxStorage * 100;

  const plans = [
    {
      id: "STUDENT" as PlanType,
      name: "Étudiant",
      price: "5",
      period: "/mois",
      description: "Pour les 18-25 ans",
      features: [
        { icon: HardDrive, text: "1 To de stockage", included: true },
        { icon: Zap, text: "Analyses IA illimitées", included: true },
        { icon: Cloud, text: "Import Drive & OneDrive", included: true },
        { icon: FileOutput, text: "Convertisseur PDF", included: true },
        { icon: Bot, text: "DocuBot (10 msg/jour)", included: true },
        { icon: Shield, text: "Sécurité avancée", included: true },
      ],
      stripeLink: "https://buy.stripe.com/eVq9AUaaE2DB3HtbFrgYU00",
      badge: "Populaire",
    },
    {
      id: "PRO" as PlanType,
      name: "Pro",
      price: "10",
      period: "/mois",
      description: "Pour les utilisateurs avancés",
      features: [
        { icon: HardDrive, text: "2 To de stockage", included: true },
        { icon: Zap, text: "IA illimitée", included: true },
        { icon: Bot, text: "DocuBot illimité", included: true },
        { icon: Cloud, text: "Import Drive & OneDrive", included: true },
        { icon: FileOutput, text: "Convertisseur PDF", included: true },
        { icon: Bell, text: "Notifications intelligentes", included: true },
        { icon: Lock, text: "Partage sécurisé", included: true },
        { icon: Share2, text: "Liens avec expiration", included: true },
      ],
      stripeLink: "https://buy.stripe.com/bJe28s5UoemjcdZ24RgYU06",
      badge: "Recommandé",
    },
    {
      id: "BUSINESS" as PlanType,
      name: "Business",
      price: "35",
      priceSuffix: ".90",
      period: "/mois",
      description: "Parfait pour les entreprises",
      features: [
        { icon: Users, text: "5 utilisateurs (+)", included: true },
        { icon: Palette, text: "IA personnalisée", included: true },
        { icon: HardDrive, text: "4 To de stockage", included: true },
        { icon: Share2, text: "Liens personnalisés", included: true },
        { icon: LayoutDashboard, text: "Dashboard partagé", included: true },
        { icon: FilePlus, text: "Création documents", included: true },
        { icon: Lock, text: "Validation équipe", included: true },
        { icon: Crown, text: "Support prioritaire", included: true },
      ],
      stripeLink: "https://buy.stripe.com/4gMcN62Icfqn4LxcJvgYU07",
      badge: "Entreprise",
    },
  ];

  const getPlanIndex = (planId: PlanType) => {
    return plans.findIndex(p => p.id === planId);
  };

  const canUpgrade = (targetPlan: PlanType) => {
    return getPlanIndex(targetPlan) > getPlanIndex(currentPlan);
  };

  // Helper to get styles based on plan
  const getPlanStyles = (planId: PlanType, isCurrentPlan: boolean) => {
    switch (planId) {
      case "STUDENT":
        return {
          card: isCurrentPlan
            ? "bg-white ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10 dark:bg-neutral-800 dark:ring-emerald-400"
            : "bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none",
          badge: isCurrentPlan ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
          featureIcon: "bg-emerald-100 dark:bg-emerald-500/20",
          featureIconColor: "text-emerald-600 dark:text-emerald-400",
          button: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600",
          isGradient: false,
        };
      case "PRO":
        return {
          card: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/25",
          badge: "bg-white/20 text-white backdrop-blur-sm",
          featureIcon: "bg-white/20",
          featureIconColor: "text-white",
          button: "bg-white text-violet-600 shadow-lg hover:bg-violet-50",
          isGradient: true,
        };
      case "BUSINESS":
        return {
          card: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/25",
          badge: "bg-white/20 text-white backdrop-blur-sm",
          featureIcon: "bg-white/20",
          featureIconColor: "text-white",
          button: "bg-white text-amber-600 shadow-lg hover:bg-amber-50",
          isGradient: true,
        };
      default:
        return {
          card: "bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50",
          badge: "bg-neutral-100 text-neutral-700",
          featureIcon: "bg-neutral-100 dark:bg-neutral-700",
          featureIconColor: "text-neutral-600 dark:text-neutral-400",
          button: "bg-neutral-500 text-white",
          isGradient: false,
        };
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="text-center">
        <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">
          <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Abonnements
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl lg:text-4xl">
          Choisissez votre plan
        </h1>
        <p className="mt-2 sm:mt-3 text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
          Trouvez la formule qui correspond à vos besoins
        </p>
      </div>

      {/* Current Usage */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <div className="rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Documents
              </p>
              <p className="mt-0.5 sm:mt-1 text-lg sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {documentsCount}
                <span className="text-xs sm:text-lg font-normal text-neutral-400">
                  {" "}/ {maxDocs === Infinity ? "∞" : maxDocs}
                </span>
              </p>
            </div>
            <div className="flex h-9 w-9 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-500/20">
              <FileText className="h-4 w-4 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 h-1 sm:h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${Math.min(docsPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Stockage
              </p>
              <p className="mt-0.5 sm:mt-1 text-lg sm:text-3xl font-bold text-neutral-900 dark:text-white truncate">
                <span className="text-sm sm:text-2xl">{formatStorage(storageUsedBytes)}</span>
                <span className="text-xs sm:text-lg font-normal text-neutral-400">
                  {" "}/ {maxStorage === Infinity ? "∞" : getStorageLabel(currentPlan)}
                </span>
              </p>
            </div>
            <div className="flex h-9 w-9 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <HardDrive className="h-4 w-4 sm:h-7 sm:w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 h-1 sm:h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
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

      {/* Pricing Cards - Horizontal Scroll on Mobile */}
      <div className="-mx-4 sm:mx-0">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto px-4 pb-4 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible snap-x snap-mandatory sm:snap-none scrollbar-hide">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const canUpgradeToPlan = canUpgrade(plan.id);
            const styles = getPlanStyles(plan.id, isCurrentPlan);

            return (
              <div
                key={plan.id}
                className={`flex-shrink-0 w-[260px] sm:w-auto snap-center relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all ${styles.card}`}
              >
                {/* Decorative circles for gradient cards */}
                {styles.isGradient && (
                  <>
                    <div className="absolute -right-8 -top-8 h-28 sm:h-32 w-28 sm:w-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-8 h-20 sm:h-24 w-20 sm:w-24 rounded-full bg-white/5" />
                  </>
                )}

                {/* Badge */}
                {(plan.badge || isCurrentPlan) && (
                  <div className="absolute right-3 sm:right-4 top-3 sm:top-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs font-semibold ${styles.badge}`}>
                      {isCurrentPlan ? (
                        <>
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Actuel
                        </>
                      ) : (
                        <>
                          {plan.id === "STUDENT" && <GraduationCap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                          {plan.id === "PRO" && <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                          {plan.id === "BUSINESS" && <Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                          {plan.badge}
                        </>
                      )}
                    </span>
                  </div>
                )}

                <div className="relative space-y-3 sm:space-y-5">
                  {/* Plan Name & Price */}
                  <div>
                    <h3 className={`text-base sm:text-xl font-bold ${styles.isGradient ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-2 sm:mt-3 flex items-baseline gap-0.5">
                      <span className={`text-2xl sm:text-4xl font-bold ${styles.isGradient ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                        {plan.price}€
                      </span>
                      {plan.priceSuffix && (
                        <span className={`text-lg sm:text-2xl font-bold ${styles.isGradient ? "text-white/80" : "text-neutral-700 dark:text-neutral-300"}`}>
                          {plan.priceSuffix}
                        </span>
                      )}
                      <span className={`text-xs sm:text-sm ${styles.isGradient ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`mt-1 text-[10px] sm:text-sm ${styles.isGradient ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5 sm:space-y-2.5">
                    {plan.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 ${!feature.included ? "opacity-40" : ""}`}
                      >
                        <div className={`flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-md sm:rounded-lg ${
                          feature.included ? styles.featureIcon : "bg-neutral-100 dark:bg-neutral-700"
                        }`}>
                          {feature.included ? (
                            <feature.icon className={`h-2.5 w-2.5 sm:h-4 sm:w-4 ${styles.featureIconColor}`} />
                          ) : (
                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-neutral-400" />
                          )}
                        </div>
                        <span className={`text-[10px] sm:text-sm font-medium ${
                          styles.isGradient
                            ? feature.included ? "text-white" : "text-white/50 line-through"
                            : feature.included
                            ? "text-neutral-700 dark:text-neutral-300"
                            : "text-neutral-400 line-through"
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className={`w-full rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-[10px] sm:text-sm font-semibold ${
                        styles.isGradient
                          ? "bg-white/20 text-white backdrop-blur-sm"
                          : "bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
                      }`}
                    >
                      Plan actuel
                    </button>
                  ) : canUpgradeToPlan && plan.stripeLink ? (
                    <a
                      href={`${plan.stripeLink}?client_reference_id=${encodeURIComponent(userId)}&prefilled_email=${encodeURIComponent(userEmail)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-[10px] sm:text-sm font-semibold transition-all active:scale-[0.98] hover:shadow-xl ${styles.button}`}
                    >
                      Passer à {plan.name}
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-lg sm:rounded-xl bg-neutral-100 py-2.5 sm:py-3 text-[10px] sm:text-sm font-semibold text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
                    >
                      {getPlanIndex(plan.id) < getPlanIndex(currentPlan) ? "Plan inférieur" : "Non disponible"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Hint - Mobile Only */}
      <div className="flex justify-center gap-1.5 sm:hidden">
        <p className="text-[10px] text-neutral-400">← Glissez pour voir les autres plans →</p>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-[10px] sm:text-sm text-neutral-500 dark:text-neutral-400">
        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Paiement sécurisé par Stripe - Annulation à tout moment
      </div>

      {/* Features Comparison */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-8 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
        <h3 className="mb-4 sm:mb-6 text-sm sm:text-lg font-semibold text-neutral-900 dark:text-white">
          Pourquoi passer à un plan supérieur ?
        </h3>
        <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <div className="flex gap-2 sm:gap-4">
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-2xl bg-blue-100 dark:bg-blue-500/20">
              <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-medium text-neutral-900 dark:text-white">
                IA Puissante
              </h4>
              <p className="mt-0.5 text-[10px] sm:text-sm text-neutral-500 dark:text-neutral-400">
                Analyse automatique
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <Cloud className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-medium text-neutral-900 dark:text-white">
                Import facile
              </h4>
              <p className="mt-0.5 text-[10px] sm:text-sm text-neutral-500 dark:text-neutral-400">
                Drive & OneDrive
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-2xl bg-violet-100 dark:bg-violet-500/20">
              <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-medium text-neutral-900 dark:text-white">
                DocuBot
              </h4>
              <p className="mt-0.5 text-[10px] sm:text-sm text-neutral-500 dark:text-neutral-400">
                Assistant IA
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-2xl bg-amber-100 dark:bg-amber-500/20">
              <Lock className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-medium text-neutral-900 dark:text-white">
                Partage sécurisé
              </h4>
              <p className="mt-0.5 text-[10px] sm:text-sm text-neutral-500 dark:text-neutral-400">
                Mot de passe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Verification Note */}
      <div className="rounded-2xl bg-emerald-50 p-3 sm:p-4 dark:bg-emerald-500/10">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Plan Étudiant
            </h4>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400">
              Réservé aux 18-25 ans. Vérification par email universitaire ou justificatif.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}
