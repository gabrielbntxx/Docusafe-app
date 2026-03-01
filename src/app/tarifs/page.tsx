"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ArrowRight, Zap, Users, Shield, Bot, FileText, HardDrive, Star } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";

// ─── Plans ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "STUDENT",
    name: "Étudiant",
    monthlyPrice: 7,
    annualPrice: 76,
    tagline: "Pour les 18–25 ans",
    desc: "L'essentiel pour ne plus perdre aucun document d'études. Stockage massif, analyses IA incluses et une boîte email pour importer automatiquement vos fichiers.",
    stripeMonthly: "https://buy.stripe.com/9B65kE5Uoba7b9V10NgYU0b",
    stripeAnnual:  "https://buy.stripe.com/4gM28sbeI91Z6TF5h3gYU0c",
    highlights: [
      "1 To de stockage sécurisé",
      "Analyses IA illimitées",
      "DocuBot (10 messages/jour)",
      "Import par email unique",
      "Dossiers & sous-dossiers",
      "Import Google Drive & OneDrive",
      "Alertes documents expirants",
      "Téléchargement ZIP",
    ],
    style: "normal" as const,
  },
  {
    id: "PRO",
    name: "Pro",
    monthlyPrice: 19,
    annualPrice: 205,
    tagline: "Pour les professionnels",
    desc: "Tout ce qu'il faut pour travailler sans friction. L'IA classe automatiquement, vous partagez en toute sécurité et DocuBot répond à toutes vos questions.",
    stripeMonthly: "https://buy.stripe.com/7sYaEYdmQba7fqb8tfgYU0a",
    stripeAnnual:  "https://buy.stripe.com/fZu00k4QkcebcdZbFrgYU0d",
    highlights: [
      "2 To de stockage",
      "Tri automatique IA dans les dossiers",
      "DocuBot illimité",
      "Mode Triage (tri en masse)",
      "Règles de tri personnalisées",
      "Partage sécurisé + mot de passe",
      "Demandes de documents externes",
      "Dossiers protégés par code PIN",
      "Envoi de documents par email",
    ],
    style: "featured" as const,
  },
  {
    id: "BUSINESS",
    name: "Business",
    monthlyPrice: 89,
    annualPrice: 961,
    tagline: "Pour les équipes & entreprises",
    desc: "Le niveau entreprise. Toute votre équipe dans un espace centralisé avec des workflows, des rôles précis et une IA adaptée à votre secteur d'activité.",
    stripeMonthly: "https://buy.stripe.com/6oU5kEaaEa631zl4cZgYU09",
    stripeAnnual:  "https://buy.stripe.com/00w6oIciMemj7XJdNzgYU0e",
    highlights: [
      "4 To de stockage équipe",
      "5 membres inclus (extensible)",
      "Rôles admin / éditeur / lecteur",
      "Flux de validation multi-étapes",
      "Génération factures, devis & contrats",
      "IA adaptée à votre métier",
      "Dossiers & documents privés par membre",
      "Attribution des documents",
      "Support prioritaire 7j/7",
    ],
    style: "dark" as const,
  },
];

// ─── Feature comparison rows (simplified) ────────────────────────────────────

const FEATURES = [
  { label: "Stockage",          student: "1 To",           pro: "2 To",          business: "4 To"              },
  { label: "Analyses IA",       student: "Illimitées",     pro: "Illimitées",    business: "Illimitées"        },
  { label: "DocuBot",           student: "10 msg/jour",    pro: "Illimité",      business: "Illimité"          },
  { label: "Tri automatique IA",student: "—",              pro: "✓",             business: "✓"                 },
  { label: "Partage sécurisé",  student: "—",              pro: "✓",             business: "✓"                 },
  { label: "Membres d'équipe",  student: "—",              pro: "—",             business: "5 + extensible"    },
  { label: "Workflows",         student: "—",              pro: "—",             business: "✓"                 },
  { label: "Génération docs IA",student: "—",              pro: "—",             business: "✓"                 },
  { label: "IA métier",         student: "—",              pro: "—",             business: "✓"                 },
  { label: "Support",           student: "Standard",       pro: "Standard",      business: "Prioritaire 7j/7"  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TarifsPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* ── Hero title ── */}
      <section className="bg-white px-4 pt-32 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            {/* Left — big title */}
            <div className="lg:max-w-2xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Tarifs</p>
              <h1
                className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
                style={{ letterSpacing: "-0.04em", lineHeight: 1.03 }}
              >
                Un seul outil pour<br />gérer tous vos documents.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500">
                Choisissez le plan qui correspond à votre usage. Pas de mauvaise surprise, pas d&apos;engagement — résiliable à tout moment.
              </p>
            </div>

            {/* Right — billing toggle */}
            <div className="flex items-center gap-3 self-start lg:self-auto">
              <span className={`text-sm font-semibold ${!annual ? "text-gray-900" : "text-gray-400"}`}>Mensuel</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${annual ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${annual ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-sm font-semibold ${annual ? "text-gray-900" : "text-gray-400"}`}>
                Annuel
                <span className="ml-1.5 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">−10%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Plan cards ── */}
      <section className="bg-white px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
            {PLANS.map((plan) => {
              const price = annual ? plan.annualPrice : plan.monthlyPrice;
              const stripeUrl = annual ? plan.stripeAnnual : plan.stripeMonthly;
              const isDark = plan.style === "dark";
              const isFeatured = plan.style === "featured";

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl p-8 ${
                    isDark
                      ? "bg-gray-900 shadow-2xl"
                      : isFeatured
                      ? "bg-white shadow-xl ring-2 ring-blue-600"
                      : "bg-white shadow-md ring-1 ring-gray-100"
                  }`}
                >
                  {/* Badge */}
                  {isFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white shadow">
                        <Star className="h-2.5 w-2.5" /> Recommandé
                      </span>
                    </div>
                  )}
                  {isDark && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-700 px-3 py-1 text-[10px] font-bold text-white shadow">
                        Entreprise
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                      {plan.tagline}
                    </p>
                    <h2 className={`mt-1 text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {plan.name}
                    </h2>
                    <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {plan.desc}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className={`text-5xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`} style={{ letterSpacing: "-0.04em" }}>
                        {price}€
                      </span>
                      <span className={`mb-2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {annual ? "/an" : "/mois"}
                      </span>
                    </div>
                    {annual && (
                      <p className={`mt-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        soit {Math.round(price / 12 * 10) / 10}€/mois · −10% vs mensuel
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={stripeUrl}
                    className={`mb-8 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                      isDark
                        ? "bg-white text-gray-900 hover:bg-gray-100 shadow-md"
                        : isFeatured
                        ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                    }`}
                  >
                    Commencer
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {/* Divider */}
                  <div className={`mb-6 h-px ${isDark ? "bg-white/10" : "bg-gray-100"}`} />

                  {/* Features */}
                  <ul className="flex flex-col gap-3">
                    {plan.highlights.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                          isDark ? "bg-white/15" : isFeatured ? "bg-blue-50" : "bg-gray-100"
                        }`}>
                          <Check className={`h-2.5 w-2.5 ${isDark ? "text-white" : isFeatured ? "text-blue-600" : "text-gray-600"}`} strokeWidth={2.5} />
                        </div>
                        <span className={`text-sm leading-snug ${isDark ? "text-gray-300" : "text-gray-600"}`}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">Sans carte bancaire pour démarrer · Résiliation à tout moment · Données hébergées en Europe</p>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2
            className="mb-10 text-3xl font-extrabold text-gray-900 md:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Comparer les plans
          </h2>
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
            {/* Table header */}
            <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              <div />
              {["Étudiant", "Pro", "Business"].map((n) => (
                <div key={n} className="text-center">
                  <span className={`text-sm font-bold ${n === "Business" ? "text-gray-900" : "text-gray-700"}`}>{n}</span>
                </div>
              ))}
            </div>
            {/* Rows */}
            {FEATURES.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 items-center border-b border-gray-50 px-6 py-3.5 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
              >
                <span className="text-sm font-medium text-gray-600">{row.label}</span>
                {[row.student, row.pro, row.business].map((val, j) => (
                  <div key={j} className="text-center">
                    <span className={`text-sm ${
                      val === "—" ? "text-gray-300" : j === 2 ? "font-semibold text-gray-900" : "text-gray-600"
                    }`}>
                      {val === "✓" ? (
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${j === 2 ? "bg-gray-900" : j === 1 ? "bg-blue-600" : "bg-gray-200"}`}>
                          <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                        </span>
                      ) : val}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-white px-4 py-24 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.03em" }}>
            Toujours un doute ?
          </h2>
          <p className="mb-8 text-base leading-relaxed text-gray-500">
            Commencez gratuitement et passez à un plan payant quand vous le souhaitez. Aucun engagement.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-700"
          >
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} DocuSafe · Tous droits réservés
      </footer>
    </div>
  );
}
