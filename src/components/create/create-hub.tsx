"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  FileCheck,
  FileSignature,
  ShoppingCart,
  Mail,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  ShieldCheck,
  ClipboardList,
  UserCheck,
  BarChart2,
  Receipt,
  TrendingUp,
  Scale,
  AlertTriangle,
  Stamp,
  KeyRound,
  Handshake,
  Building2,
  FileCode2,
  Shield,
  Wrench,
  Briefcase,
  Banknote,
  FilePen,
  GraduationCap,
  Award,
  BookOpen,
  Package,
  CircleMinus,
  Lightbulb,
  Copyright,
  Users,
  FileBarChart,
  BadgeCheck,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getProfessionDocConfig, type DocType } from "@/lib/professions";
import { OfficeCreator } from "./office-creator";

const DOC_TYPES = [
  {
    key: "facture" as DocType,
    labelKey: "docInvoice" as const,
    description: "Facturez vos clients avec des factures professionnelles",
    descriptionEn: "Bill your clients with professional invoices",
    icon: FileText,
    color: "blue",
  },
  {
    key: "devis" as DocType,
    labelKey: "docQuote" as const,
    description: "Proposez un devis détaillé avant la commande",
    descriptionEn: "Send a detailed estimate before the order",
    icon: FileCheck,
    color: "violet",
  },
  {
    key: "contrat" as DocType,
    labelKey: "docContract" as const,
    description: "Formalisez vos missions avec un contrat de service",
    descriptionEn: "Formalize your projects with a service contract",
    icon: FileSignature,
    color: "amber",
  },
  {
    key: "bon-de-commande" as DocType,
    labelKey: "docPurchaseOrder" as const,
    description: "Passez des commandes auprès de vos fournisseurs",
    descriptionEn: "Place orders with your suppliers",
    icon: ShoppingCart,
    color: "emerald",
  },
  {
    key: "lettre" as DocType,
    labelKey: "docLetter" as const,
    description: "Rédigez des lettres professionnelles à la norme française",
    descriptionEn: "Write professional letters following French standards",
    icon: Mail,
    color: "rose",
  },
  // ─── Santé ───────────────────────────────────────────────────────────────────
  {
    key: "ordonnance" as DocType,
    labelKey: "docInvoice" as const,
    label: "Ordonnance",
    description: "Prescrivez médicaments ou examens médicaux",
    icon: ClipboardPlus,
    color: "teal",
  },
  {
    key: "certificat-medical" as DocType,
    labelKey: "docInvoice" as const,
    label: "Certificat médical",
    description: "Attestez de l'état de santé d'un patient",
    icon: ShieldCheck,
    color: "teal",
  },
  {
    key: "compte-rendu-consultation" as DocType,
    labelKey: "docInvoice" as const,
    label: "Compte-rendu de consultation",
    description: "Résumez une consultation médicale",
    icon: ClipboardList,
    color: "teal",
  },
  {
    key: "fiche-patient" as DocType,
    labelKey: "docInvoice" as const,
    label: "Fiche patient",
    description: "Créez ou mettez à jour un dossier médical",
    icon: UserCheck,
    color: "teal",
  },
  // ─── Finance / Comptabilité ───────────────────────────────────────────────────
  {
    key: "bilan-comptable" as DocType,
    labelKey: "docInvoice" as const,
    label: "Bilan comptable",
    description: "Établissez un bilan financier annuel",
    icon: BarChart2,
    color: "indigo",
  },
  {
    key: "declaration-fiscale" as DocType,
    labelKey: "docInvoice" as const,
    label: "Déclaration fiscale",
    description: "Préparez une déclaration de revenus ou TVA",
    icon: Receipt,
    color: "indigo",
  },
  {
    key: "rapport-financier" as DocType,
    labelKey: "docInvoice" as const,
    label: "Rapport financier",
    description: "Synthétisez les performances financières",
    icon: TrendingUp,
    color: "indigo",
  },
  // ─── Juridique ────────────────────────────────────────────────────────────────
  {
    key: "acte-juridique" as DocType,
    labelKey: "docInvoice" as const,
    label: "Acte juridique",
    description: "Rédigez un acte officiel ou notarial",
    icon: Scale,
    color: "slate",
  },
  {
    key: "mise-en-demeure" as DocType,
    labelKey: "docInvoice" as const,
    label: "Mise en demeure",
    description: "Envoyez une mise en demeure formelle",
    icon: AlertTriangle,
    color: "slate",
  },
  {
    key: "procuration" as DocType,
    labelKey: "docInvoice" as const,
    label: "Procuration",
    description: "Déléguez un pouvoir d'agir à un tiers",
    icon: Stamp,
    color: "slate",
  },
  // ─── Immobilier ───────────────────────────────────────────────────────────────
  {
    key: "bail" as DocType,
    labelKey: "docInvoice" as const,
    label: "Bail locatif",
    description: "Rédigez un contrat de location meublé ou vide",
    icon: KeyRound,
    color: "orange",
  },
  {
    key: "compromis-de-vente" as DocType,
    labelKey: "docInvoice" as const,
    label: "Compromis de vente",
    description: "Formalisez une promesse d'achat immobilier",
    icon: Handshake,
    color: "orange",
  },
  {
    key: "mandat-immobilier" as DocType,
    labelKey: "docInvoice" as const,
    label: "Mandat immobilier",
    description: "Établissez un mandat d'agence immobilière",
    icon: Building2,
    color: "orange",
  },
  // ─── Tech / IT ────────────────────────────────────────────────────────────────
  {
    key: "cahier-des-charges" as DocType,
    labelKey: "docInvoice" as const,
    label: "Cahier des charges",
    description: "Définissez les spécifications d'un projet",
    icon: FileCode2,
    color: "cyan",
  },
  {
    key: "nda" as DocType,
    labelKey: "docInvoice" as const,
    label: "NDA / Confidentialité",
    description: "Protégez vos informations confidentielles",
    icon: Shield,
    color: "cyan",
  },
  {
    key: "rapport-technique" as DocType,
    labelKey: "docInvoice" as const,
    label: "Rapport technique",
    description: "Documentez une analyse ou intervention technique",
    icon: Wrench,
    color: "cyan",
  },
  // ─── RH / Travail ─────────────────────────────────────────────────────────────
  {
    key: "contrat-de-travail" as DocType,
    labelKey: "docInvoice" as const,
    label: "Contrat de travail",
    description: "Formalisez une embauche en bonne et due forme",
    icon: Briefcase,
    color: "lime",
  },
  {
    key: "fiche-de-paie" as DocType,
    labelKey: "docInvoice" as const,
    label: "Fiche de paie",
    description: "Générez un bulletin de salaire",
    icon: Banknote,
    color: "lime",
  },
  {
    key: "avenant" as DocType,
    labelKey: "docInvoice" as const,
    label: "Avenant au contrat",
    description: "Modifiez un contrat de travail existant",
    icon: FilePen,
    color: "lime",
  },
  // ─── Formation / Éducation ───────────────────────────────────────────────────
  {
    key: "convention-de-stage" as DocType,
    labelKey: "docInvoice" as const,
    label: "Convention de stage",
    description: "Encadrez légalement un stage en entreprise",
    icon: GraduationCap,
    color: "sky",
  },
  {
    key: "attestation-de-formation" as DocType,
    labelKey: "docInvoice" as const,
    label: "Attestation de formation",
    description: "Certifiez la participation à une formation",
    icon: Award,
    color: "sky",
  },
  {
    key: "programme-de-formation" as DocType,
    labelKey: "docInvoice" as const,
    label: "Programme de formation",
    description: "Planifiez le contenu d'une session de formation",
    icon: BookOpen,
    color: "sky",
  },
  // ─── Commerce / Logistique ────────────────────────────────────────────────────
  {
    key: "bon-de-livraison" as DocType,
    labelKey: "docInvoice" as const,
    label: "Bon de livraison",
    description: "Attestez la livraison de marchandises",
    icon: Package,
    color: "green",
  },
  {
    key: "note-de-credit" as DocType,
    labelKey: "docInvoice" as const,
    label: "Note de crédit (avoir)",
    description: "Émettez un avoir pour un client",
    icon: CircleMinus,
    color: "green",
  },
  // ─── Créatif / Communication ──────────────────────────────────────────────────
  {
    key: "brief-creatif" as DocType,
    labelKey: "docInvoice" as const,
    label: "Brief créatif",
    description: "Cadrez un projet créatif avec le client",
    icon: Lightbulb,
    color: "fuchsia",
  },
  {
    key: "cession-droits" as DocType,
    labelKey: "docInvoice" as const,
    label: "Cession de droits",
    description: "Transférez des droits d'auteur ou d'image",
    icon: Copyright,
    color: "fuchsia",
  },
  // ─── Admin général ────────────────────────────────────────────────────────────
  {
    key: "compte-rendu-reunion" as DocType,
    labelKey: "docInvoice" as const,
    label: "Compte-rendu de réunion",
    description: "Formalisez les décisions d'une réunion",
    icon: Users,
    color: "gray",
  },
  {
    key: "rapport" as DocType,
    labelKey: "docInvoice" as const,
    label: "Rapport",
    description: "Rédigez un rapport d'activité ou d'expertise",
    icon: FileBarChart,
    color: "gray",
  },
  {
    key: "attestation" as DocType,
    labelKey: "docInvoice" as const,
    label: "Attestation",
    description: "Émettez une attestation officielle",
    icon: BadgeCheck,
    color: "gray",
  },
] as const;

const COLOR_MAP = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    icon: "text-blue-500",
    border: "hover:border-blue-300 dark:hover:border-blue-500/40",
    ring: "ring-blue-300 dark:ring-blue-500/40",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    icon: "text-violet-500",
    border: "hover:border-violet-300 dark:hover:border-violet-500/40",
    ring: "ring-violet-300 dark:ring-violet-500/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-500",
    border: "hover:border-amber-300 dark:hover:border-amber-500/40",
    ring: "ring-amber-300 dark:ring-amber-500/40",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-500",
    border: "hover:border-emerald-300 dark:hover:border-emerald-500/40",
    ring: "ring-emerald-300 dark:ring-emerald-500/40",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    icon: "text-rose-500",
    border: "hover:border-rose-300 dark:hover:border-rose-500/40",
    ring: "ring-rose-300 dark:ring-rose-500/40",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-500/10",
    icon: "text-teal-500",
    border: "hover:border-teal-300 dark:hover:border-teal-500/40",
    ring: "ring-teal-300 dark:ring-teal-500/40",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    icon: "text-indigo-500",
    border: "hover:border-indigo-300 dark:hover:border-indigo-500/40",
    ring: "ring-indigo-300 dark:ring-indigo-500/40",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-500/10",
    icon: "text-slate-500",
    border: "hover:border-slate-300 dark:hover:border-slate-500/40",
    ring: "ring-slate-300 dark:ring-slate-500/40",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    icon: "text-orange-500",
    border: "hover:border-orange-300 dark:hover:border-orange-500/40",
    ring: "ring-orange-300 dark:ring-orange-500/40",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    icon: "text-cyan-500",
    border: "hover:border-cyan-300 dark:hover:border-cyan-500/40",
    ring: "ring-cyan-300 dark:ring-cyan-500/40",
  },
  lime: {
    bg: "bg-lime-50 dark:bg-lime-500/10",
    icon: "text-lime-600",
    border: "hover:border-lime-300 dark:hover:border-lime-500/40",
    ring: "ring-lime-300 dark:ring-lime-500/40",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    icon: "text-sky-500",
    border: "hover:border-sky-300 dark:hover:border-sky-500/40",
    ring: "ring-sky-300 dark:ring-sky-500/40",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-500/10",
    icon: "text-green-600",
    border: "hover:border-green-300 dark:hover:border-green-500/40",
    ring: "ring-green-300 dark:ring-green-500/40",
  },
  fuchsia: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
    icon: "text-fuchsia-500",
    border: "hover:border-fuchsia-300 dark:hover:border-fuchsia-500/40",
    ring: "ring-fuchsia-300 dark:ring-fuchsia-500/40",
  },
  gray: {
    bg: "bg-neutral-100 dark:bg-neutral-500/10",
    icon: "text-neutral-500",
    border: "hover:border-neutral-300 dark:hover:border-neutral-500/40",
    ring: "ring-neutral-300 dark:ring-neutral-500/40",
  },
};

type Props = {
  profession?: string | null;
};

export function CreateHub({ profession }: Props) {
  const { t, language } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const config = getProfessionDocConfig(profession);
  const prioritizedKeys = config?.prioritized ?? [];

  // Split types: prioritized shown first, rest hidden behind "Voir tous"
  const prioritizedTypes = config
    ? DOC_TYPES.filter((d) => prioritizedKeys.includes(d.key))
        .sort((a, b) => prioritizedKeys.indexOf(a.key) - prioritizedKeys.indexOf(b.key))
    : DOC_TYPES;

  const secondaryTypes = config
    ? DOC_TYPES.filter((d) => !prioritizedKeys.includes(d.key))
    : [];

  const renderCard = (doc: (typeof DOC_TYPES)[number], recommended: boolean) => {
    const colors = COLOR_MAP[doc.color as keyof typeof COLOR_MAP];
    const docLabel = "label" in doc ? doc.label : t(doc.labelKey);
    const docDesc = "descriptionEn" in doc && language !== "fr" ? doc.descriptionEn : doc.description;
    return (
      <Link
        key={doc.key}
        href={`/dashboard/create/${doc.key}`}
        className={`group relative flex flex-col gap-4 rounded-2xl border bg-white p-5 transition-all hover:shadow-md dark:bg-neutral-900 ${
          recommended
            ? `border-transparent ring-2 ${colors.ring}`
            : `border-neutral-100 dark:border-neutral-800 ${colors.border}`
        }`}
      >
        {recommended && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            <Sparkles className="h-2.5 w-2.5" />
            Recommandé
          </span>
        )}
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg}`}>
          <doc.icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {docLabel}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {docDesc}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Office Creator (Word + Excel) — always at top ── */}
      <OfficeCreator />

      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {t("createDocuments")}
        </h1>
        {profession && config ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            Adapté pour{" "}
            <span className="font-medium text-violet-600 dark:text-violet-400">
              {profession}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-neutral-400">{t("chooseDocumentType")}</p>
        )}
      </div>

      {/* Prioritized / all types grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prioritizedTypes.map((doc) => renderCard(doc, !!config))}
      </div>

      {/* Secondary types (hidden by default when profession is set) */}
      {secondaryTypes.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Masquer les autres types
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Voir tous les types ({secondaryTypes.length} autres)
              </>
            )}
          </button>

          {showAll && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-80">
              {secondaryTypes.map((doc) => renderCard(doc, false))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
