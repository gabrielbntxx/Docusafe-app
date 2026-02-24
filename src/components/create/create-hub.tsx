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
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getProfessionDocConfig, type DocType } from "@/lib/professions";

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
    const colors = COLOR_MAP[doc.color];
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
            {t(doc.labelKey)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {language === "fr" ? doc.description : doc.descriptionEn}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
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
