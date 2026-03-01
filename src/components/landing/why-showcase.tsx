"use client";

import { useState } from "react";
import {
  Search, FileText, Users, Sparkles, Folder, Check,
  ArrowUpRight, Bot, Wand2, Star, Crown, Zap, TrendingUp,
} from "lucide-react";

// ─── Feature definitions ────────────────────────────────────────────────────
const FEATURES = [
  { id: "search",  accentBg: "bg-blue-50",    ring: "ring-blue-200",    dot: "bg-blue-500"   },
  { id: "collab",  accentBg: "bg-violet-50",  ring: "ring-violet-200",  dot: "bg-violet-500" },
  { id: "ai",      accentBg: "bg-amber-50",   ring: "ring-amber-200",   dot: "bg-amber-500"  },
  { id: "hub",     accentBg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500"},
];

// ─── Mini card visuals (no text) ────────────────────────────────────────────

function SearchMini({ on }: { on: boolean }) {
  return (
    <div className={`h-full rounded-2xl p-4 transition-colors duration-300 ${on ? "bg-blue-50" : "bg-gray-50"}`}>
      <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm ring-1 ${on ? "bg-white ring-blue-100" : "bg-white ring-gray-100"}`}>
        <Search className={`h-3.5 w-3.5 flex-shrink-0 ${on ? "text-blue-500" : "text-gray-300"}`} />
        <div className={`h-2 flex-1 rounded-full ${on ? "bg-blue-100" : "bg-gray-100"}`} />
      </div>
      <div className="space-y-2">
        {[true, false, false].map((hi, i) => (
          <div key={i} className={`flex items-center gap-2 rounded-xl p-2 ring-1 ${hi && on ? "bg-blue-50 ring-blue-100" : "bg-white ring-gray-50"}`}>
            <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${on ? "bg-blue-100" : "bg-gray-100"}`}>
              <FileText className={`h-3 w-3 ${on ? "text-blue-500" : "text-gray-300"}`} />
            </div>
            <div className="flex-1 space-y-1">
              <div className={`h-1.5 rounded-full ${on ? "bg-blue-200" : "bg-gray-100"}`} style={{ width: ["88%","72%","80%"][i] }} />
              <div className={`h-1 rounded-full ${on ? "bg-blue-100" : "bg-gray-50"}`} style={{ width: ["60%","50%","55%"][i] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollabMini({ on }: { on: boolean }) {
  const avatars = [
    { init: "SL", bg: "bg-amber-400" },
    { init: "TM", bg: "bg-blue-500" },
    { init: "AB", bg: "bg-emerald-400" },
    { init: "+4", bg: on ? "bg-violet-200 text-violet-700" : "bg-gray-200 text-gray-500" },
  ];
  return (
    <div className={`h-full rounded-2xl p-4 transition-colors duration-300 ${on ? "bg-violet-50" : "bg-gray-50"}`}>
      <div className="mb-3 flex">
        {avatars.map((a, i) => (
          <div
            key={i}
            style={{ marginLeft: i > 0 ? -8 : 0 }}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${a.bg}`}
          >
            {a.init}
          </div>
        ))}
        {on && (
          <div className="ml-2 flex items-center rounded-full bg-violet-100 px-2 py-0.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
          </div>
        )}
      </div>
      <div className={`rounded-xl p-3 shadow-sm ring-1 ${on ? "bg-white ring-violet-100" : "bg-white ring-gray-100"}`}>
        <div className="mb-2 flex items-center gap-1.5">
          <div className={`h-5 w-5 flex-shrink-0 rounded-md ${on ? "bg-violet-100" : "bg-gray-100"} flex items-center justify-center`}>
            <FileText className={`h-2.5 w-2.5 ${on ? "text-violet-500" : "text-gray-300"}`} />
          </div>
          <div className={`h-1.5 flex-1 rounded-full ${on ? "bg-violet-100" : "bg-gray-100"}`} />
        </div>
        <div className="space-y-1.5">
          {[80, 65, 75, 50].map((w, i) => (
            <div key={i} className={`h-1.5 rounded-full ${on ? "bg-violet-100" : "bg-gray-100"}`} style={{ width: `${w}%` }} />
          ))}
        </div>
        {on && (
          <div className="mt-2 flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-violet-500" />
            <div className="h-1 w-1/3 rounded-full bg-violet-200" />
          </div>
        )}
      </div>
    </div>
  );
}

function AIMini({ on }: { on: boolean }) {
  return (
    <div className={`h-full rounded-2xl p-4 transition-colors duration-300 ${on ? "bg-amber-50" : "bg-gray-50"}`}>
      <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 ${on ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gray-200"}`}>
        <Sparkles className={`h-3.5 w-3.5 ${on ? "text-white" : "text-gray-400"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${on ? "bg-white/30" : "bg-gray-300"}`} />
        {on && <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
      </div>
      <div className={`rounded-xl p-3 shadow-sm ring-1 ${on ? "bg-white ring-amber-100" : "bg-white ring-gray-100"}`}>
        <div className="space-y-2">
          {[90, 72, 85, 55, 78].map((w, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${on ? "bg-amber-100" : "bg-gray-100"}`} style={{ width: `${w}%` }} />
          ))}
        </div>
        {on && (
          <div className="mt-2 flex items-center gap-1">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-400" />
            <span className="text-[8px] font-semibold text-amber-500">Génération en cours…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function HubMini({ on }: { on: boolean }) {
  const tiles = [
    { bg: on ? "bg-blue-100" : "bg-gray-100", icon: on ? "text-blue-500" : "text-gray-300" },
    { bg: on ? "bg-emerald-100" : "bg-gray-100", icon: on ? "text-emerald-500" : "text-gray-300" },
    { bg: on ? "bg-violet-100" : "bg-gray-100", icon: on ? "text-violet-500" : "text-gray-300" },
    { bg: on ? "bg-amber-100" : "bg-gray-100", icon: on ? "text-amber-500" : "text-gray-300" },
  ];
  return (
    <div className={`h-full rounded-2xl p-4 transition-colors duration-300 ${on ? "bg-emerald-50" : "bg-gray-50"}`}>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((t, i) => (
          <div key={i} className={`flex flex-col items-center gap-1.5 rounded-xl p-3 ${t.bg}`}>
            <Folder className={`h-5 w-5 ${t.icon}`} />
            <div className={`h-1 w-full rounded-full ${on ? "bg-white/50" : "bg-gray-200"}`} />
            <div className={`h-1 w-2/3 rounded-full ${on ? "bg-white/30" : "bg-gray-100"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

const CARD_VISUALS = [SearchMini, CollabMini, AIMini, HubMini];

// ─── Big rectangle detail views ─────────────────────────────────────────────

function SearchDetail() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch">
      <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Recherche IA</p>
        <h3 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Retrouvez tout<br />en quelques secondes.
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">
          Posez n&apos;importe quelle question en langage naturel. DocuSafe retrouve, lit et répond en quelques secondes grâce à l&apos;IA.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-3 p-8 lg:flex-[6]" style={{ background: "#eff6ff" }}>
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-blue-100">
          <Search className="h-4 w-4 flex-shrink-0 text-blue-400" />
          <span className="text-sm font-medium text-gray-700">Contrat de bail 2024 résiliation</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-blue-100">
            <p className="text-sm leading-relaxed text-gray-700">
              Votre bail se termine le <span className="font-bold text-blue-600">30 juin 2024</span>. Le préavis légal est de 3 mois, soit une résiliation à notifier avant le <span className="font-bold">31 mars</span>.
            </p>
            <div className="mt-2 flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 w-fit">
              <FileText className="h-3 w-3 text-blue-500" />
              <span className="text-[10px] font-semibold text-blue-600">Contrat_bail_2024.pdf</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollabDetail() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch">
      <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">
        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5">
          <Crown className="h-3.5 w-3.5 text-violet-600" />
          <span className="text-xs font-bold text-violet-700">Business exclusif</span>
        </div>
        <h3 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Toute l&apos;équipe.<br />Un seul espace.
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">
          Invitez vos collaborateurs, définissez des rôles et travaillez ensemble sur les mêmes documents en temps réel.
        </p>
        <div className="mt-5 space-y-2">
          {["Permissions par rôle", "Historique des modifications", "Commentaires en temps réel"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
                <Check className="h-2.5 w-2.5 text-violet-600" />
              </div>
              <span className="text-sm text-gray-600">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-3 p-8 lg:flex-[6]" style={{ background: "#f5f3ff" }}>
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-violet-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-gray-800">Contrat_Prestataire_2024.pdf</span>
          </div>
          <div className="flex">
            {["SL","TM","AB"].map((init, i) => (
              <div key={i} style={{ marginLeft: i > 0 ? -6 : 0 }} className={`flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-white ${["bg-amber-400","bg-blue-500","bg-emerald-400"][i]}`}>{init}</div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-violet-100">
          <div className="space-y-2">
            {[85, 72, 90, 60, 78].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-violet-50" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 border-t border-violet-50 pt-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white">SL</div>
            <div className="rounded-xl rounded-tl-sm bg-violet-50 px-3 py-1.5">
              <p className="text-[11px] text-gray-700">Article 3 à revoir — le délai est de 30j pas 15j</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIDetail() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch">
      <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-600">Création IA</p>
        <h3 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          L&apos;IA génère.<br />Vous signez.
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">
          Contrats, devis, rapports, courriers — l&apos;IA connaît votre secteur et rédige des documents professionnels en quelques secondes.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-3 p-8 lg:flex-[6]" style={{ background: "#fffbeb" }}>
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 shadow-sm">
          <Sparkles className="h-4 w-4 flex-shrink-0 text-white" />
          <span className="text-sm font-semibold text-white">DocuBot génère votre contrat…</span>
          <div className="ml-auto flex gap-1">
            {[0,1,2].map(i => <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-gray-800">Contrat_Prestataire.pdf</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              <Sparkles className="h-2.5 w-2.5" /> Généré
            </span>
          </div>
          <div className="space-y-2">
            {[92, 78, 85, 65, 88, 55].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-amber-50" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HubDetail() {
  const folders = [
    { name: "Juridique", count: 18, bg: "bg-blue-50",    icon: "text-blue-500",    pill: "bg-blue-100 text-blue-600"    },
    { name: "Finances",  count: 34, bg: "bg-emerald-50", icon: "text-emerald-500", pill: "bg-emerald-100 text-emerald-600"},
    { name: "RH",        count: 12, bg: "bg-violet-50",  icon: "text-violet-500",  pill: "bg-violet-100 text-violet-600" },
    { name: "Clients",   count: 27, bg: "bg-amber-50",   icon: "text-amber-500",   pill: "bg-amber-100 text-amber-600"   },
  ];
  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch">
      <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">Hub centralisé</p>
        <h3 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Tout au même<br />endroit. Toujours.
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">
          Tous vos documents, toutes vos équipes, dans un seul hub organisé automatiquement par l&apos;IA.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-2.5 p-8 lg:flex-[6]" style={{ background: "#f0fdf4" }}>
        <div className="grid grid-cols-2 gap-2.5">
          {folders.map((f) => (
            <div key={f.name} className={`flex flex-col gap-2 rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 ${f.bg}`}>
              <div className="flex items-center justify-between">
                <Folder className={`h-5 w-5 ${f.icon}`} />
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${f.pill}`}>{f.count} docs</span>
              </div>
              <p className="text-xs font-bold text-gray-800">{f.name}</p>
              <div className="h-1 rounded-full bg-white/60" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-100">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-gray-500">91 documents ajoutés ce mois</span>
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-gray-300" />
        </div>
      </div>
    </div>
  );
}

const DETAIL_VIEWS = [SearchDetail, CollabDetail, AIDetail, HubDetail];

// ─── Main component ──────────────────────────────────────────────────────────

export function WhyShowcase() {
  const [active, setActive] = useState(0);
  const DetailView = DETAIL_VIEWS[active];
  const feat = FEATURES[active];
  const CardVisual = CARD_VISUALS[active];

  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-5xl">

        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-orange-500">Pourquoi DocuSafe Business</p>
          <h2
            className="text-3xl font-extrabold text-gray-900 md:text-4xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Essentiel pour votre organisation.
          </h2>
        </div>

        {/* 4 mini visual cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FEATURES.map(({ id, accentBg, ring }, i) => {
            const Mini = CARD_VISUALS[i];
            const isOn = active === i;
            return (
              <button
                key={id}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-3xl ring-2 transition-all duration-200 ${
                  isOn ? `${ring} shadow-md` : "ring-transparent shadow-sm hover:shadow-md"
                }`}
              >
                <Mini on={isOn} />
              </button>
            );
          })}
        </div>

        {/* Big rectangle — close to cards */}
        <div className="mt-3 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <DetailView />
        </div>

      </div>
    </section>
  );
}
