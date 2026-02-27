"use client";

import { useState } from "react";
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
  Mail,
  Inbox,
  GitBranch,
  ScanLine,
  FolderOpen,
  Download,
  Eye,
  Search,
  Star,
  Workflow,
  ChevronDown,
} from "lucide-react";

type PlanType = "FREE" | "STUDENT" | "PRO" | "BUSINESS";

type SubscriptionProps = {
  currentPlan: PlanType;
  documentsCount: number;
  storageUsedBytes: number;
  userId: string;
  userEmail: string;
};

const PLAN_ORDER: PlanType[] = ["FREE", "STUDENT", "PRO", "BUSINESS"];

// ─── Comparison table data ───────────────────────────────────────────────────
type FeatureRow = {
  label: string;
  free: string | boolean;
  student: string | boolean;
  pro: string | boolean;
  business: string | boolean;
  highlight?: boolean;
};

type FeatureGroup = {
  category: string;
  icon: React.ElementType;
  rows: FeatureRow[];
};

const COMPARISON: FeatureGroup[] = [
  {
    category: "Stockage & Documents",
    icon: HardDrive,
    rows: [
      { label: "Stockage cloud chiffré", free: "1 Go", student: "1 To", pro: "2 To", business: "4 To", highlight: true },
      { label: "Nombre de documents", free: "15 docs", student: "Illimité", pro: "Illimité", business: "Illimité", highlight: true },
      { label: "Types de fichiers", free: "PDF, images", student: "Tous formats", pro: "Tous formats", business: "Tous formats" },
      { label: "Aperçu inline (PDF, audio, vidéo)", free: true, student: true, pro: true, business: true },
      { label: "Téléchargement ZIP multi-fichiers", free: false, student: true, pro: true, business: true },
      { label: "Corbeille et récupération", free: true, student: true, pro: true, business: true },
    ],
  },
  {
    category: "IA & Analyse automatique",
    icon: Zap,
    rows: [
      { label: "Analyses IA par mois", free: "5 / mois", student: "Illimitées", pro: "Illimitées", business: "Illimitées", highlight: true },
      { label: "Détection type de document", free: "5/mois", student: true, pro: true, business: true },
      { label: "Extraction données clés (dates, montants…)", free: false, student: true, pro: true, business: true },
      { label: "Suggestion de nom IA", free: false, student: true, pro: true, business: true },
      { label: "Tri automatique dans les dossiers", free: false, student: false, pro: true, business: true, highlight: true },
      { label: "Règles de tri personnalisées par dossier", free: false, student: false, pro: true, business: true },
      { label: "Mode Triage (tri en masse)", free: false, student: false, pro: true, business: true },
      { label: "IA adaptée à votre métier", free: false, student: false, pro: false, business: true, highlight: true },
    ],
  },
  {
    category: "DocuBot — Assistant IA",
    icon: Bot,
    rows: [
      { label: "DocuBot conversationnel", free: false, student: "10 msg/jour", pro: "Illimité", business: "Illimité", highlight: true },
      { label: "Questions sur vos documents", free: false, student: true, pro: true, business: true },
      { label: "Analyse de fichier dans le chat", free: false, student: true, pro: true, business: true },
      { label: "Détection documents expirant", free: false, student: true, pro: true, business: true },
      { label: "Statistiques et résumés intelligents", free: false, student: true, pro: true, business: true },
    ],
  },
  {
    category: "Organisation & Dossiers",
    icon: FolderOpen,
    rows: [
      { label: "Création de dossiers colorés", free: false, student: true, pro: true, business: true, highlight: true },
      { label: "Sous-dossiers imbriqués", free: false, student: true, pro: true, business: true },
      { label: "Déplacer dossiers (glisser-déposer)", free: false, student: true, pro: true, business: true },
      { label: "Dossiers protégés par code PIN", free: false, student: false, pro: true, business: true },
      { label: "Règles IA par dossier", free: false, student: false, pro: true, business: true },
      { label: "Favoris et tri personnalisé", free: false, student: true, pro: true, business: true },
    ],
  },
  {
    category: "Partage & Collaboration",
    icon: Share2,
    rows: [
      { label: "Liens de partage publics", free: false, student: false, pro: true, business: true, highlight: true },
      { label: "Protection par mot de passe", free: false, student: false, pro: true, business: true },
      { label: "Expiration des liens (24h, 7j, 30j…)", free: false, student: false, pro: true, business: true },
      { label: "Partage récursif (sous-dossiers inclus)", free: false, student: false, pro: true, business: true },
      { label: "Demandes de documents externes", free: false, student: false, pro: true, business: true, highlight: true },
      { label: "Suivi des vues sur les partages", free: false, student: false, pro: true, business: true },
      { label: "Envoi de document par email", free: false, student: false, pro: true, business: true },
    ],
  },
  {
    category: "Import & Email",
    icon: Inbox,
    rows: [
      { label: "Adresse email d'import unique", free: false, student: true, pro: true, business: true, highlight: true },
      { label: "Import depuis Google Drive", free: false, student: true, pro: true, business: true },
      { label: "Import depuis OneDrive", free: false, student: true, pro: true, business: true },
      { label: "Glisser-déposer de dossiers entiers", free: false, student: true, pro: true, business: true },
    ],
  },
  {
    category: "Sécurité",
    icon: Shield,
    rows: [
      { label: "Chiffrement bout en bout", free: true, student: true, pro: true, business: true },
      { label: "Stockage Cloudflare R2 sécurisé", free: true, student: true, pro: true, business: true },
      { label: "Dossiers privés (invisibles à l'équipe)", free: false, student: false, pro: false, business: true },
      { label: "Documents privés par membre", free: false, student: false, pro: false, business: true },
    ],
  },
  {
    category: "Équipe & Entreprise",
    icon: Users,
    rows: [
      { label: "Membres de l'équipe", free: false, student: false, pro: false, business: "5 + extensible", highlight: true },
      { label: "Rôles (admin, éditeur, lecteur)", free: false, student: false, pro: false, business: true },
      { label: "Attribution des documents par membre", free: false, student: false, pro: false, business: true },
      { label: "Couleur unique par collaborateur", free: false, student: false, pro: false, business: true },
      { label: "Flux de validation (workflows)", free: false, student: false, pro: false, business: true, highlight: true },
      { label: "Étapes d'approbation multi-niveaux", free: false, student: false, pro: false, business: true },
      { label: "Commentaires et délais sur les étapes", free: false, student: false, pro: false, business: true },
    ],
  },
  {
    category: "Génération de documents",
    icon: FilePlus,
    rows: [
      { label: "Création de factures PDF", free: false, student: false, pro: false, business: true, highlight: true },
      { label: "Devis et bons de commande", free: false, student: false, pro: false, business: true },
      { label: "Contrats et lettres professionnelles", free: false, student: false, pro: false, business: true },
      { label: "Calcul TVA automatique", free: false, student: false, pro: false, business: true },
      { label: "Export PDF des documents générés", free: false, student: false, pro: false, business: true },
    ],
  },
  {
    category: "Notifications & Suivi",
    icon: Bell,
    rows: [
      { label: "Alertes documents expirants (60j, 30j, 7j)", free: false, student: true, pro: true, business: true },
      { label: "Centre de notifications", free: false, student: true, pro: true, business: true },
      { label: "Rappels automatiques workflows", free: false, student: false, pro: false, business: true },
    ],
  },
];

// ─── Plan cards data ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "STUDENT" as PlanType,
    name: "Étudiant",
    price: "7",
    period: "/mois",
    tagline: "Pour les 18-25 ans",
    badge: "Étudiant",
    color: "emerald",
    stripeLink: "https://buy.stripe.com/9B65kE5Uoba7b9V10NgYU0b",
    highlights: [
      "1 To de stockage sécurisé",
      "Analyses IA illimitées",
      "DocuBot (10 msg/jour)",
      "Import par email unique",
      "Dossiers et sous-dossiers",
      "Téléchargement ZIP",
      "Import Drive & OneDrive",
      "Alertes documents expirants",
    ],
  },
  {
    id: "PRO" as PlanType,
    name: "Pro",
    price: "19",
    period: "/mois",
    tagline: "Pour les professionnels",
    badge: "Recommandé",
    color: "violet",
    stripeLink: "https://buy.stripe.com/7sYaEYdmQba7fqb8tfgYU0a",
    highlights: [
      "2 To de stockage",
      "Tri automatique IA dans les dossiers",
      "DocuBot illimité",
      "Mode Triage (tri en masse)",
      "Règles de tri personnalisées",
      "Partage sécurisé avec mot de passe",
      "Demandes de documents externes",
      "Dossiers protégés par PIN",
      "Envoi de documents par email",
    ],
  },
  {
    id: "BUSINESS" as PlanType,
    name: "Business",
    price: "89",
    period: "/mois",
    tagline: "Pour les entreprises",
    badge: "Entreprise",
    color: "amber",
    stripeLink: "https://buy.stripe.com/6oU5kEaaEa631zl4cZgYU09",
    highlights: [
      "4 To de stockage",
      "5 membres d'équipe (extensible)",
      "Rôles et permissions granulaires",
      "Flux de validation multi-étapes",
      "Génération factures, devis, contrats PDF",
      "IA personnalisée selon votre métier",
      "Documents et dossiers privés par membre",
      "Attribution des documents",
      "Support prioritaire",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function SubscriptionClient({
  currentPlan,
  documentsCount,
  storageUsedBytes,
  userId,
  userEmail,
}: SubscriptionProps) {
  const { t } = useTranslation();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [billingYearly, setBillingYearly] = useState(false);

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} Go`;
    return `${mb.toFixed(2)} Mo`;
  };

  const getMaxStorage = (plan: PlanType) => {
    switch (plan) {
      case "STUDENT": return 1 * 1024 * 1024;
      case "PRO":     return 2 * 1024 * 1024;
      case "BUSINESS": return 4 * 1024 * 1024;
      default: return 1024;
    }
  };

  const getStorageLabel = (plan: PlanType) => {
    switch (plan) { case "STUDENT": return "1 To"; case "PRO": return "2 To"; case "BUSINESS": return "4 To"; default: return "1 Go"; }
  };

  const getMaxDocs = (plan: PlanType) => {
    if (plan !== "FREE") return Infinity;
    return 15;
  };

  const maxDocs = getMaxDocs(currentPlan);
  const maxStorage = getMaxStorage(currentPlan);
  const docsPercentage = maxDocs === Infinity ? 8 : (documentsCount / maxDocs) * 100;
  const storagePercentage = (storageUsedBytes / (1024 * 1024)) / maxStorage * 100;

  const canUpgrade = (targetPlan: PlanType) =>
    PLAN_ORDER.indexOf(targetPlan) > PLAN_ORDER.indexOf(currentPlan);

  const planColorMap: Record<string, { bg: string; ring: string; btn: string; badge: string; text: string }> = {
    emerald: {
      bg: "bg-white dark:bg-neutral-800",
      ring: "ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10",
      btn: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
      text: "text-emerald-500",
    },
    violet: {
      bg: "bg-gradient-to-br from-violet-500 to-purple-600",
      ring: "",
      btn: "bg-white text-violet-600 hover:bg-violet-50 shadow-lg",
      badge: "bg-white/20 text-white",
      text: "text-white/80",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-500 to-orange-600",
      ring: "",
      btn: "bg-white text-amber-600 hover:bg-amber-50 shadow-lg",
      badge: "bg-white/20 text-white",
      text: "text-white/80",
    },
  };

  const renderCell = (value: string | boolean, isGradient: boolean) => {
    if (value === true)
      return <Check className={`mx-auto h-5 w-5 ${isGradient ? "text-white" : "text-emerald-500"}`} />;
    if (value === false)
      return <X className={`mx-auto h-4 w-4 ${isGradient ? "text-white/30" : "text-neutral-300 dark:text-neutral-600"}`} />;
    return (
      <span className={`text-xs font-semibold ${isGradient ? "text-white" : "text-neutral-700 dark:text-neutral-300"}`}>
        {value}
      </span>
    );
  };

  const currentPlanLabel: Record<PlanType, string> = {
    FREE: "Gratuit",
    STUDENT: "Étudiant",
    PRO: "Pro",
    BUSINESS: "Business",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-0 pb-24 sm:pb-8">

      {/* ── Header ── */}
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400">
          <Crown className="h-4 w-4" />
          Abonnements
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl lg:text-4xl">
          Choisissez votre plan
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 sm:text-base max-w-xl mx-auto">
          {"Toute la puissance d'une GED intelligente — stockage chiffré, IA, workflows d'approbation et génération de documents."}
        </p>
      </div>

      {/* ── Current usage ── */}
      <div className="grid gap-4 grid-cols-2">
        <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">Documents</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {documentsCount}
                <span className="text-sm font-normal text-neutral-400"> / {maxDocs === Infinity ? "∞" : maxDocs}</span>
              </p>
              <p className="mt-0.5 text-[10px] sm:text-xs text-neutral-400">Plan {currentPlanLabel[currentPlan]}</p>
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all" style={{ width: `${Math.min(docsPercentage, 100)}%` }} />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">Stockage</p>
              <p className="mt-1 text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white truncate">
                {formatStorage(storageUsedBytes)}
                <span className="text-xs sm:text-sm font-normal text-neutral-400"> / {getStorageLabel(currentPlan)}</span>
              </p>
              <p className="mt-0.5 text-[10px] sm:text-xs text-neutral-400">Chiffré bout en bout</p>
            </div>
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <HardDrive className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div className={`h-full rounded-full transition-all ${storagePercentage > 80 ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-emerald-600"}`} style={{ width: `${Math.min(storagePercentage, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ── Billing toggle ── */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium transition-colors ${!billingYearly ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500"}`}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingYearly(!billingYearly)}
            className={`relative h-7 w-13 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${billingYearly ? "bg-violet-500" : "bg-neutral-200 dark:bg-neutral-700"}`}
            style={{ width: "52px" }}
            aria-label="Basculer facturation annuelle"
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${billingYearly ? "translate-x-7" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${billingYearly ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500"}`}>
            Annuel
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-300 ${billingYearly ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 scale-100 opacity-100" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500 scale-95 opacity-70"}`}>
            -10% · 1 mois offert
          </span>
        </div>
        {billingYearly && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Facturé en une fois — économisez jusqu&apos;à <span className="font-semibold text-emerald-600 dark:text-emerald-400">107€ par an</span> sur le plan Business
          </p>
        )}
      </div>

      {/* ── Plan cards ── */}
      <div className="-mx-4 sm:mx-0">
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 sm:overflow-visible snap-x snap-mandatory sm:snap-none">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const canUpgradeToPlan = canUpgrade(plan.id);
            const c = planColorMap[plan.color];
            const isGradient = plan.color !== "emerald";
            const monthlyPrice = parseFloat(plan.price);
            const annualTotal = (monthlyPrice * 12 * 0.9).toFixed(2).replace(".", ",");

            return (
              <div
                key={plan.id}
                className={`flex-shrink-0 w-[280px] sm:w-auto snap-center relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all ${c.bg} ${isCurrentPlan && !isGradient ? c.ring : isGradient ? "shadow-2xl" : "shadow-xl shadow-black/5 dark:shadow-none"}`}
              >
                {isGradient && (
                  <>
                    <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white/5" />
                  </>
                )}

                {/* Badge */}
                <div className="absolute right-4 top-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${c.badge}`}>
                    {isCurrentPlan ? <><Check className="h-3 w-3" />Actuel</> : plan.id === "STUDENT" ? <><GraduationCap className="h-3 w-3" />{plan.badge}</> : plan.id === "PRO" ? <><Sparkles className="h-3 w-3" />{plan.badge}</> : <><Building2 className="h-3 w-3" />{plan.badge}</>}
                  </span>
                </div>

                <div className="relative space-y-5">
                  {/* Price */}
                  <div>
                    <h3 className={`text-xl font-bold ${isGradient ? "text-white" : "text-neutral-900 dark:text-white"}`}>{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className={`text-4xl font-bold ${isGradient ? "text-white" : "text-neutral-900 dark:text-white"}`}>{plan.price}€</span>
                      <span className={`text-sm ${c.text}`}>/mois</span>
                    </div>
                    {billingYearly ? (
                      <p className={`mt-1 text-xs font-semibold ${isGradient ? "text-white/80" : "text-emerald-600 dark:text-emerald-400"}`}>
                        Soit {annualTotal}€/an — 1 mois offert
                      </p>
                    ) : (
                      <p className={`mt-1 text-xs ${c.text}`}>{plan.tagline}</p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.highlights.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ${isGradient ? "bg-white/20" : "bg-emerald-100 dark:bg-emerald-500/20"}`}>
                          <Check className={`h-3 w-3 ${isGradient ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                        </div>
                        <span className={`text-sm ${isGradient ? "text-white/90" : "text-neutral-700 dark:text-neutral-300"}`}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isCurrentPlan ? (
                    <button disabled className={`w-full rounded-xl py-3 text-sm font-semibold ${isGradient ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"}`}>
                      Plan actuel
                    </button>
                  ) : canUpgradeToPlan && plan.stripeLink ? (
                    <a
                      href={`${plan.stripeLink}?client_reference_id=${encodeURIComponent(userId)}&prefilled_email=${encodeURIComponent(userEmail)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] ${c.btn}`}
                    >
                      Passer à {plan.name} <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <button disabled className="w-full rounded-xl bg-neutral-100 py-3 text-sm font-semibold text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500">
                      Plan inférieur
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <div className="flex justify-center sm:hidden">
        <p className="text-[10px] text-neutral-400">← Glissez pour voir les autres plans →</p>
      </div>

      {/* ── Trust badge ── */}
      <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Shield className="h-4 w-4" />
        Paiement sécurisé par Stripe — Annulation à tout moment
      </div>

      {/* ── Feature highlights ── */}
      <div>
        <h2 className="mb-6 text-center text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
          Ce que vous obtenez vraiment
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: ScanLine,
              color: "blue",
              title: "Analyse IA complète",
              desc: "Détection du type, extraction des données clés (dates, montants, émetteur), score de confiance et suggestion de nom. Chaque document est compris, pas juste stocké.",
              plans: "Pro · Business",
            },
            {
              icon: GitBranch,
              color: "violet",
              title: "Tri automatique intelligent",
              desc: "Téléchargez, l'IA range. Règles personnalisées par dossier, hiérarchie parent/enfant, mode Triage pour les lots. Zéro organisation manuelle.",
              plans: "Pro · Business",
            },
            {
              icon: Bot,
              color: "purple",
              title: "DocuBot — votre assistant IA",
              desc: "Posez des questions sur vos documents en langage naturel. Trouvez des factures, résumez des contrats, détectez des expirations. Chat streaming en temps réel.",
              plans: "Étudiant · Pro · Business",
            },
            {
              icon: Share2,
              color: "emerald",
              title: "Partage sécurisé avancé",
              desc: "Liens avec mot de passe, date d'expiration, partage récursif (sous-dossiers inclus automatiquement), compteur de vues. Partagez sans jamais perdre le contrôle.",
              plans: "Pro · Business",
            },
            {
              icon: Inbox,
              color: "cyan",
              title: "Demandes de documents",
              desc: "Envoyez un lien à vos clients ou partenaires pour qu'ils déposent leurs fichiers directement dans vos dossiers. Protection par mot de passe, limite de taille, suivi en temps réel.",
              plans: "Pro · Business",
            },
            {
              icon: Workflow,
              color: "orange",
              title: "Flux de validation (workflows)",
              desc: "Définissez des étapes d'approbation multi-niveaux, assignez-les à votre équipe, suivez les validations et rejets avec commentaires. Idéal pour factures, contrats, RH.",
              plans: "Business",
            },
            {
              icon: FilePlus,
              color: "amber",
              title: "Génération de documents",
              desc: "Créez factures, devis, bons de commande, contrats et lettres en PDF directement dans l'app. Calcul TVA automatique, numérotation, zones de signature.",
              plans: "Business",
            },
            {
              icon: Users,
              color: "pink",
              title: "Espace équipe collaboratif",
              desc: "4 rôles (owner, admin, éditeur, lecteur), attribution des documents par collaborateur, couleur unique par membre, dossiers et documents privés. Tout reste sous contrôle.",
              plans: "Business",
            },
            {
              icon: Bell,
              color: "red",
              title: "Alertes et notifications",
              desc: "Alertes automatiques 60j, 30j et 7j avant expiration de vos documents (passeport, contrats, assurances…). Rappels workflows. Centre de notifications dédié.",
              plans: "Étudiant · Pro · Business",
            },
          ].map((item) => {
            const colorMap: Record<string, { bg: string; icon: string }> = {
              blue: { bg: "bg-blue-100 dark:bg-blue-500/20", icon: "text-blue-600 dark:text-blue-400" },
              violet: { bg: "bg-violet-100 dark:bg-violet-500/20", icon: "text-violet-600 dark:text-violet-400" },
              purple: { bg: "bg-purple-100 dark:bg-purple-500/20", icon: "text-purple-600 dark:text-purple-400" },
              emerald: { bg: "bg-emerald-100 dark:bg-emerald-500/20", icon: "text-emerald-600 dark:text-emerald-400" },
              cyan: { bg: "bg-cyan-100 dark:bg-cyan-500/20", icon: "text-cyan-600 dark:text-cyan-400" },
              orange: { bg: "bg-orange-100 dark:bg-orange-500/20", icon: "text-orange-600 dark:text-orange-400" },
              amber: { bg: "bg-amber-100 dark:bg-amber-500/20", icon: "text-amber-600 dark:text-amber-400" },
              pink: { bg: "bg-pink-100 dark:bg-pink-500/20", icon: "text-pink-600 dark:text-pink-400" },
              red: { bg: "bg-red-100 dark:bg-red-500/20", icon: "text-red-600 dark:text-red-400" },
            };
            const c = colorMap[item.color];
            return (
              <div key={item.title} className="rounded-2xl bg-white p-5 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${c.bg}`}>
                  <item.icon className={`h-5 w-5 ${c.icon}`} />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                <p className={`mt-3 text-xs font-medium ${c.icon}`}>{item.plans}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Comparison table (accordion by category) ── */}
      <div>
        <h2 className="mb-2 text-center text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
          Comparaison détaillée
        </h2>
        <p className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Toutes les fonctionnalités, plan par plan
        </p>

        {/* Sticky header */}
        <div className="rounded-2xl overflow-hidden bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          {/* Column headers */}
          <div className="grid grid-cols-4 border-b border-neutral-100 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-800">
            <div className="p-3 sm:p-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Fonctionnalité</div>
            {(["STUDENT", "PRO", "BUSINESS"] as PlanType[]).map((p) => {
              const isCurrent = currentPlan === p;
              const labels: Record<PlanType, string> = { FREE: "Gratuit", STUDENT: "Étudiant", PRO: "Pro", BUSINESS: "Business" };
              const colors: Record<PlanType, string> = { FREE: "text-neutral-500", STUDENT: "text-emerald-500", PRO: "text-violet-500", BUSINESS: "text-amber-500" };
              return (
                <div key={p} className={`p-3 sm:p-4 text-center ${isCurrent ? "bg-blue-50 dark:bg-blue-500/10" : p === "BUSINESS" ? "bg-amber-50/40 dark:bg-amber-500/5" : ""}`}>
                  <p className={`text-xs font-bold ${colors[p]}`}>{labels[p]}</p>
                  {isCurrent && <span className="mt-0.5 inline-block rounded-full bg-blue-500 px-2 py-0.5 text-[9px] font-semibold text-white">Actuel</span>}
                  {p === "BUSINESS" && !isCurrent && <span className="mt-0.5 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-semibold text-white">B2B</span>}
                </div>
              );
            })}
          </div>

          {/* Categories */}
          {COMPARISON.map((group) => {
            const isOpen = openCategory === group.category;
            return (
              <div key={group.category} className="border-b border-neutral-100 dark:border-neutral-700/50 last:border-b-0">
                {/* Category header */}
                <button
                  onClick={() => setOpenCategory(isOpen ? null : group.category)}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
                      <group.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{group.category}</span>
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">{group.rows.length}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Rows */}
                {isOpen && (
                  <div>
                    {group.rows.map((row, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-4 items-center border-t border-neutral-100 dark:border-neutral-700/30 hover:bg-neutral-50/70 dark:hover:bg-neutral-700/10 transition-colors ${row.highlight ? "bg-amber-50/30 dark:bg-amber-500/5" : ""}`}
                      >
                        <div className="px-3 sm:px-4 py-2.5 sm:py-3 pl-12 sm:pl-14">
                          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">{row.label}</span>
                          {row.highlight && <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400"><Star className="mr-0.5 h-2 w-2" />B2B</span>}
                        </div>
                        {(["student", "pro", "business"] as const).map((p) => {
                          const isCurrent = currentPlan === p.toUpperCase() as PlanType;
                          return (
                            <div key={p} className={`px-2 py-2.5 sm:py-3 text-center ${isCurrent ? "bg-blue-50/60 dark:bg-blue-500/10" : p === "pro" ? "bg-violet-50/30 dark:bg-violet-500/5" : p === "business" ? "bg-amber-50/40 dark:bg-amber-500/8" : ""}`}>
                              {renderCell(row[p], false)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-neutral-400">Cliquez sur une catégorie pour voir le détail des fonctionnalités</p>
      </div>

      {/* ── Student note ── */}
      <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Plan Étudiant — 7€/mois</h4>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              {"Réservé aux 18-25 ans. Accès complet aux fonctionnalités essentielles avec 1 To de stockage, analyses IA illimitées et DocuBot. Vérification par email universitaire ou justificatif d'étudiant."}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
