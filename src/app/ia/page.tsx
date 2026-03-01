import Link from "next/link";
import {
  Sparkles, ChevronRight, FileCheck, Brain, Layers,
  Zap, Search, MessageSquare,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { DocuBotChat, ClassifyVisual, Counter } from "./ia-animations";

// ─── Static data ────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Brain,         title: "Compréhension du contenu",   desc: "L'IA lit et comprend le contenu de vos documents, pas seulement leur nom ou leur extension." },
  { icon: Layers,        title: "Classification automatique", desc: "Chaque document importé est analysé et rangé dans le bon dossier sans aucune action de votre part." },
  { icon: Search,        title: "Recherche sémantique",       desc: "Trouvez un document en posant une question naturelle. Pas besoin du nom exact — l'IA comprend l'intention." },
  { icon: FileCheck,     title: "Extraction de données",      desc: "Montant, date, parties, référence — DocuSafe extrait les champs clés de chaque document automatiquement." },
  { icon: MessageSquare, title: "DocuBot",                    desc: "Posez n'importe quelle question sur vos documents. DocuBot les lit pour vous et vous répond en langage naturel." },
  { icon: Zap,           title: "Traitement instantané",      desc: "En moins de 3 secondes après l'import, votre document est analysé, classé et prêt à être retrouvé." },
];

const STATS = [
  { value: 3,       suffix: "s",  label: "pour analyser et classer un document après import" },
  { value: 98,      suffix: "%",  label: "de précision sur la classification automatique" },
  { value: 2000000, suffix: "+",  label: "documents traités par l'IA DocuSafe chaque mois" },
];

const EXTRACTION_FIELDS = [
  { label: "Type",       value: "Facture" },
  { label: "Émetteur",   value: "EDF SA" },
  { label: "Date",       value: "03/04/2025" },
  { label: "Montant HT", value: "1 847,00 €" },
  { label: "Échéance",   value: "30/04/2025" },
  { label: "Référence",  value: "FAC-2025-04-0981" },
];

// ─── Page (server component) ────────────────────────────────────────────────────

export default function IAPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader solid />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-gray-100 px-4 pb-20 pt-32">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #3b82f6 50%, transparent 75%)", filter: "blur(60px)" }}
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 ring-1 ring-violet-100">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs font-bold text-violet-600">Intelligence Artificielle</span>
          </div>
          <div className="lg:max-w-3xl">
            <h1 className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl" style={{ letterSpacing: "-0.04em", lineHeight: 1.03 }}>
              L&apos;IA qui comprend<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                vraiment
              </span>{" "}
              vos documents.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500">
              DocuSafe ne stocke pas juste vos fichiers — il les lit, les comprend, les classe
              et répond à vos questions. Comme un assistant personnel qui ne dort jamais.
            </p>
          </div>
        </div>
      </section>

      {/* ── DocuBot ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-gray-950 shadow-2xl ring-1 ring-white/10">
            <div className="flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:gap-16 lg:p-12">
              <div className="lg:flex-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/30">
                  <MessageSquare className="h-6 w-6 text-violet-400" />
                </div>
                <h2 className="mb-4 text-2xl font-extrabold text-white md:text-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  DocuBot répond à<br />toutes vos questions.
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">
                  Posez une question en langage naturel — &ldquo;Où est ma dernière facture EDF ?&rdquo;,
                  &ldquo;Quel est mon salaire dans mon contrat ?&rdquo;, &ldquo;Résume ce bail&rdquo; —
                  et DocuBot lit vos documents pour vous répondre en quelques secondes.
                </p>
                <p className="text-sm leading-relaxed text-gray-400">
                  Plus besoin d&apos;ouvrir chaque fichier un par un. L&apos;IA fait le travail.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Langage naturel", "Lecture des PDF", "Résumé auto", "Recherche contextuelle"].map((tag) => (
                    <span key={tag} className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:flex-1">
                <DocuBotChat />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Classification ── */}
      <section className="border-y border-violet-100 bg-violet-50/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="lg:flex-1">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-violet-100">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">Analyse en cours…</span>
                  <div className="ml-auto flex h-5 items-center gap-1">
                    <span className="h-1 w-4 rounded-full bg-violet-200 animate-pulse" />
                    <span className="h-1 w-3 rounded-full bg-violet-300 animate-pulse" style={{ animationDelay: "200ms" }} />
                    <span className="h-1 w-5 rounded-full bg-violet-200 animate-pulse" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
                <ClassifyVisual />
              </div>
            </div>
            <div className="lg:flex-1">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                <Layers className="h-6 w-6 text-violet-600" />
              </div>
              <h2 className="mb-4 text-2xl font-extrabold text-gray-900 md:text-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Classé automatiquement.<br />Dès l&apos;import.
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-gray-500">
                DocuSafe analyse chaque document à la seconde où il arrive — nom, contenu,
                date, type — et le dépose dans le bon dossier sans que vous n&apos;ayez rien à faire.
              </p>
              <p className="text-sm leading-relaxed text-gray-500">
                Vous pouvez aussi définir vos propres règles : si l&apos;émetteur est &ldquo;EDF&rdquo;,
                classer dans &ldquo;Énergie&rdquo;. L&apos;IA applique vos règles en priorité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Extraction ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-gray-900 p-8 lg:p-12">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
              <div className="lg:flex-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <h2 className="mb-4 text-2xl font-extrabold text-white md:text-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  Extraction intelligente<br />des données clés.
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">
                  Montant, date d&apos;échéance, émetteur, référence — DocuSafe lit le contenu
                  de chaque document et en extrait les informations essentielles automatiquement.
                </p>
                <p className="text-sm leading-relaxed text-gray-400">
                  Ces données deviennent cherchables, triables, et exportables.
                  Retrouvez toutes vos factures de plus de 1 000 € en un seul filtre.
                </p>
              </div>
              <div className="lg:flex-1">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Données extraites automatiquement</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EXTRACTION_FIELDS.map((f) => (
                      <div key={f.label} className="rounded-xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
                        <p className="text-[10px] text-white/40 mb-0.5">{f.label}</p>
                        <p className="text-xs font-bold text-white">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-5xl font-extrabold text-gray-900 md:text-6xl" style={{ letterSpacing: "-0.04em" }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Une IA conçue pour les documents.
          </h2>
          <p className="mb-10 text-sm text-gray-400">
            Pas un gadget — un vrai assistant qui travaille à votre place, en permanence.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="group rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-violet-100">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100 transition-colors group-hover:bg-violet-100">
                  <feat.icon className="h-5 w-5 text-violet-600" strokeWidth={1.8} />
                </div>
                <p className="mb-1.5 text-sm font-bold text-gray-900">{feat.title}</p>
                <p className="text-xs leading-relaxed text-gray-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-gray-100 px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 shadow-lg ring-1 ring-violet-200">
              <Sparkles className="h-8 w-8 text-violet-600" />
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl" style={{ letterSpacing: "-0.04em", lineHeight: 1.08 }}>
            Laissez l&apos;IA travailler<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              à votre place.
            </span>
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-gray-500">
            Essayez DocuSafe gratuitement pendant 1 mois. Aucune carte bancaire requise.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            Essayer gratuitement <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
