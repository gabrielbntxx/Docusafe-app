"use client";

import { useEffect, useRef, useState } from "react"; // useRef used by Counter
import Link from "next/link";
import {
  Sparkles, ChevronRight, FileText, FolderOpen,
  Zap, Search, FileCheck, Brain, Layers,
  MessageSquare, Send, Check, Clock,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

// ─── DocuBot chat ───────────────────────────────────────────────────────────────

const MESSAGES = [
  { from: "user", text: "Où est ma facture d'avril ?" },
  { from: "bot",  text: "Votre facture d'avril 2025 est dans Factures / 2025. Reçue le 3 avril par email — total : 1 847 € HT.", delay: 800 },
  { from: "user", text: "Résume mon contrat de travail." },
  { from: "bot",  text: "CDI signé le 12/01/2023 · Salaire brut 3 200 €/mois · Période d'essai expirée · Clause de non-concurrence : 12 mois.", delay: 900 },
];

function DocuBotChat() {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping]   = useState(false);

  useEffect(() => {
    if (visible >= MESSAGES.length) return;
    const msg = MESSAGES[visible];
    const wait = msg.from === "bot" ? (msg.delay ?? 600) : 400;
    if (msg.from === "bot") setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setVisible((v) => v + 1);
    }, wait);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="flex flex-col rounded-2xl bg-gray-950 ring-1 ring-white/10 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2.5 border-b border-white/8 px-5 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20">
            <Sparkles className="h-3 w-3 text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-white/60">DocuBot</span>
          <span className="relative flex h-1.5 w-1.5 rounded-full bg-green-400">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 p-5 min-h-[220px]">
        {MESSAGES.slice(0, visible).map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "bot" && (
              <div className="mr-2 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                <Sparkles className="h-3 w-3 text-violet-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
              m.from === "user"
                ? "rounded-tr-sm bg-white/10 text-white"
                : "rounded-tl-sm bg-violet-600/20 text-violet-100 ring-1 ring-violet-500/20"
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20">
              <Sparkles className="h-3 w-3 text-violet-400" />
            </div>
            <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-violet-600/20 px-4 py-3 ring-1 ring-violet-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 border-t border-white/8 px-4 py-3">
        <input
          readOnly
          value="Demandez n'importe quoi sur vos documents…"
          className="flex-1 bg-transparent text-xs text-white/30 outline-none cursor-default"
        />
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600">
          <Send className="h-3.5 w-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Classification visual ──────────────────────────────────────────────────────

const CLASSIFY_DOCS = [
  { name: "Facture_EDF_mars.pdf",     folder: "Factures / 2025",       color: "bg-blue-100 text-blue-600",    delay: 0   },
  { name: "Passeport_Gabriel.pdf",    folder: "Identité / Documents",   color: "bg-emerald-100 text-emerald-600", delay: 600 },
  { name: "Bail_Appartement.pdf",     folder: "Logement / Contrats",    color: "bg-orange-100 text-orange-600",delay: 1200 },
  { name: "Contrat_CDI_2023.pdf",     folder: "RH / Contrats",          color: "bg-violet-100 text-violet-600",delay: 1800 },
];

function ClassifyVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (CLASSIFY_DOCS.length + 2)), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2">
      {CLASSIFY_DOCS.map((doc, i) => (
        <div
          key={doc.name}
          className={`flex items-center gap-3 rounded-xl p-3 ring-1 transition-all duration-500 ${
            i < step
              ? "bg-white ring-gray-100 shadow-sm opacity-100 translate-y-0"
              : "bg-gray-50 ring-gray-100 opacity-30"
          }`}
        >
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${doc.color}`}>
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{doc.name}</p>
            {i < step && (
              <div className="flex items-center gap-1 mt-0.5">
                <FolderOpen className="h-3 w-3 text-blue-500" />
                <p className="text-[10px] text-blue-600 font-medium">{doc.folder}</p>
              </div>
            )}
          </div>
          {i < step && (
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <Check className="h-3 w-3 text-green-600" />
            </div>
          )}
          {i === step && (
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
              <Sparkles className="h-3 w-3 text-violet-500 animate-pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Extraction visual ──────────────────────────────────────────────────────────

function ExtractionVisual() {
  const fields = [
    { label: "Type",        value: "Facture",           color: "bg-blue-50 text-blue-700 ring-blue-100" },
    { label: "Émetteur",    value: "EDF SA",             color: "bg-violet-50 text-violet-700 ring-violet-100" },
    { label: "Date",        value: "03/04/2025",         color: "bg-orange-50 text-orange-700 ring-orange-100" },
    { label: "Montant HT",  value: "1 847,00 €",         color: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
    { label: "Échéance",    value: "30/04/2025",         color: "bg-red-50 text-red-700 ring-red-100" },
    { label: "Référence",   value: "FAC-2025-04-0981",   color: "bg-gray-50 text-gray-700 ring-gray-200" },
  ];
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 space-y-2">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Données extraites automatiquement</p>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => (
          <div key={f.label} className="rounded-xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
            <p className="text-[10px] text-white/40 mb-0.5">{f.label}</p>
            <p className="text-xs font-bold text-white">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Counter ────────────────────────────────────────────────────────────────────

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(t); }
          else setCount(start);
        }, 16);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString("fr-FR")}{suffix}</span>;
}

// ─── Feature cards ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Brain,       title: "Compréhension du contenu",  desc: "L'IA lit et comprend le contenu de vos documents, pas seulement leur nom ou leur extension." },
  { icon: Layers,      title: "Classification automatique", desc: "Chaque document importé est analysé et rangé dans le bon dossier sans aucune action de votre part." },
  { icon: Search,      title: "Recherche sémantique",       desc: "Trouvez un document en posant une question naturelle. Pas besoin du nom exact — l'IA comprend l'intention." },
  { icon: FileCheck,   title: "Extraction de données",      desc: "Montant, date, parties, référence — DocuSafe extrait les champs clés de chaque document automatiquement." },
  { icon: MessageSquare, title: "DocuBot",                  desc: "Posez n'importe quelle question sur vos documents. DocuBot les lit pour vous et vous répond en langage naturel." },
  { icon: Zap,         title: "Traitement instantané",      desc: "En moins de 3 secondes après l'import, votre document est analysé, classé et prêt à être retrouvé." },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IAPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader solid />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-gray-100 px-4 pb-20 pt-32">
        {/* Animated glow background */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(ellipse, #7c3aed 0%, #3b82f6 50%, transparent 75%)",
            filter: "blur(60px)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 ring-1 ring-violet-100">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs font-bold text-violet-600">Intelligence Artificielle</span>
          </div>

          <div className="lg:max-w-3xl">
            <h1
              className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
              style={{ letterSpacing: "-0.04em", lineHeight: 1.03 }}
            >
              L&apos;IA qui comprend<br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
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

      {/* ── DocuBot — grande carte ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-gray-950 shadow-2xl ring-1 ring-white/10">
            <div className="flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:gap-16 lg:p-12">

              {/* Text */}
              <div className="lg:flex-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/30">
                  <MessageSquare className="h-6 w-6 text-violet-400" />
                </div>
                <h2
                  className="mb-4 text-2xl font-extrabold text-white md:text-3xl"
                  style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
                >
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

              {/* Chat visual */}
              <div className="lg:flex-1">
                <DocuBotChat />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Classification automatique — section bleue ── */}
      <section className="border-y border-violet-100 bg-violet-50/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

            {/* Visual */}
            <div className="lg:flex-1">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-violet-100">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">Analyse en cours…</span>
                  <div className="ml-auto flex h-5 items-center gap-1">
                    <span className="h-1 w-4 rounded-full bg-violet-200 animate-pulse" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-3 rounded-full bg-violet-300 animate-pulse" style={{ animationDelay: "200ms" }} />
                    <span className="h-1 w-5 rounded-full bg-violet-200 animate-pulse" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
                <ClassifyVisual />
              </div>
            </div>

            {/* Text */}
            <div className="lg:flex-1">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                <Layers className="h-6 w-6 text-violet-600" />
              </div>
              <h2
                className="mb-4 text-2xl font-extrabold text-gray-900 md:text-3xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Classé automatiquement.<br />Dès l&apos;import.
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-gray-500">
                DocuSafe analyse chaque document à la seconde où il arrive — nom, contenu,
                date, type — et le dépose dans le bon dossier sans que vous n&apos;ayez rien à faire.
                Factures dans Factures. Contrats dans Contrats. Toujours.
              </p>
              <p className="text-sm leading-relaxed text-gray-500">
                Vous pouvez aussi définir vos propres règles : si l&apos;émetteur est &ldquo;EDF&rdquo;,
                classer dans &ldquo;Énergie&rdquo;. L&apos;IA applique vos règles en priorité.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Extraction intelligente — dark card ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-gray-900 p-8 lg:p-12">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

              {/* Text */}
              <div className="lg:flex-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <h2
                  className="mb-4 text-2xl font-extrabold text-white md:text-3xl"
                  style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
                >
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

              {/* Visual */}
              <div className="lg:flex-1">
                <ExtractionVisual />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { value: 3,    suffix: "s",   label: "pour analyser et classer un document après import" },
              { value: 98,   suffix: "%",   label: "de précision sur la classification automatique" },
              { value: 2000000, suffix: "+", label: "documents traités par l'IA DocuSafe chaque mois" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p
                  className="text-5xl font-extrabold text-gray-900 md:text-6xl"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 feature cards ── */}
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
              <div
                key={feat.title}
                className="group rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-violet-100"
              >
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

      {/* ── CTA final ── */}
      <section className="border-t border-gray-100 px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 shadow-lg ring-1 ring-violet-200">
              <Sparkles className="h-8 w-8 text-violet-600" />
            </div>
          </div>
          <h2
            className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl"
            style={{ letterSpacing: "-0.04em", lineHeight: 1.08 }}
          >
            Laissez l&apos;IA travailler<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
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
