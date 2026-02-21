"use client";

import Link from "next/link";
import {
  FileText,
  FileCheck,
  FileSignature,
  ShoppingCart,
  Mail,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const DOC_TYPES = [
  {
    key: "facture",
    labelKey: "docInvoice" as const,
    description: "Facturez vos clients avec des factures professionnelles",
    descriptionEn: "Bill your clients with professional invoices",
    icon: FileText,
    color: "blue",
  },
  {
    key: "devis",
    labelKey: "docQuote" as const,
    description: "Proposez un devis détaillé avant la commande",
    descriptionEn: "Send a detailed estimate before the order",
    icon: FileCheck,
    color: "violet",
  },
  {
    key: "contrat",
    labelKey: "docContract" as const,
    description: "Formalisez vos missions avec un contrat de service",
    descriptionEn: "Formalize your projects with a service contract",
    icon: FileSignature,
    color: "amber",
  },
  {
    key: "bon-de-commande",
    labelKey: "docPurchaseOrder" as const,
    description: "Passez des commandes auprès de vos fournisseurs",
    descriptionEn: "Place orders with your suppliers",
    icon: ShoppingCart,
    color: "emerald",
  },
  {
    key: "lettre",
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
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    icon: "text-violet-500",
    border: "hover:border-violet-300 dark:hover:border-violet-500/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-500",
    border: "hover:border-amber-300 dark:hover:border-amber-500/40",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-500",
    border: "hover:border-emerald-300 dark:hover:border-emerald-500/40",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    icon: "text-rose-500",
    border: "hover:border-rose-300 dark:hover:border-rose-500/40",
  },
};

export function CreateHub() {
  const { t, language } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {t("createDocuments")}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{t("chooseDocumentType")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOC_TYPES.map((doc) => {
          const colors = COLOR_MAP[doc.color];
          return (
            <Link
              key={doc.key}
              href={`/dashboard/create/${doc.key}`}
              className={`group flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 ${colors.border}`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg}`}
              >
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
        })}
      </div>
    </div>
  );
}
