"use client";

import { useState } from "react";
import {
  Search, FileText, Users, Sparkles, Folder,
  Check, Eye, Download, Bot, Crown, TrendingUp,
  Clock, ArrowUpRight, RefreshCw, Layers,
} from "lucide-react";

// ─── Card definitions (icon + title + description) ───────────────────────────
const CARDS = [
  {
    id: "search",
    icon: Search,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    activeBg: "bg-blue-50",
    activeBorder: "ring-blue-300",
    title: "Retrouvez tout en secondes",
    desc: "L'IA classe et indexe chaque document. Vos équipes ne perdent plus de temps à chercher.",
  },
  {
    id: "collab",
    icon: Users,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    activeBg: "bg-violet-50",
    activeBorder: "ring-violet-300",
    title: "Toute l'équipe réunie",
    desc: "Invitez vos collaborateurs, partagez des espaces et travaillez ensemble en temps réel.",
  },
  {
    id: "ai",
    icon: Sparkles,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    activeBg: "bg-amber-50",
    activeBorder: "ring-amber-300",
    title: "L'IA génère à votre place",
    desc: "Contrats, devis, rapports — DocuBot rédige des documents professionnels en quelques secondes.",
  },
  {
    id: "hub",
    icon: Layers,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    activeBg: "bg-emerald-50",
    activeBorder: "ring-emerald-300",
    title: "Un seul hub centralisé",
    desc: "Tous vos documents organisés automatiquement dans un espace unique, accessible partout.",
  },
];

// ─── Full-width visuals (no text, pure app mockup) ───────────────────────────

function SearchVisual() {
  const results = [
    { name: "Contrat de bail 2024.pdf",    size: "2.1 Mo", time: "2h",  match: true  },
    { name: "Bail commercial Paris.pdf",   size: "1.8 Mo", time: "2j",  match: false },
    { name: "Renouvellement bail 2023.pdf",size: "940 Ko", time: "5j",  match: false },
    { name: "Bail résidentiel Bordeaux.pdf",size:"1.2 Mo", time: "12j", match: false },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-6" style={{ background: "#eff6ff" }}>
      {/* Search bar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-blue-100">
        <Search className="h-4 w-4 flex-shrink-0 text-blue-400" />
        <span className="text-sm font-medium text-gray-700">Contrat de bail 2024…</span>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1">
          <span className="text-[10px] font-semibold text-white">4 résultats</span>
        </div>
      </div>
      {/* Results */}
      <div className="flex flex-col gap-2">
        {results.map((r) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${
              r.match
                ? "bg-blue-50 ring-blue-200 shadow-sm"
                : "bg-white ring-gray-100"
            }`}
          >
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${r.match ? "bg-blue-600" : "bg-gray-100"}`}>
              <FileText className={`h-4 w-4 ${r.match ? "text-white" : "text-gray-400"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${r.match ? "text-blue-700" : "text-gray-700"}`}>{r.name}</p>
              <p className="text-xs text-gray-400">{r.size} · il y a {r.time}</p>
            </div>
            <div className="flex gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${r.match ? "bg-blue-100" : "bg-gray-50"}`}>
                <Eye className={`h-3.5 w-3.5 ${r.match ? "text-blue-600" : "text-gray-400"}`} />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50">
                <Download className="h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollabVisual() {
  const members = [
    { init: "SL", bg: "bg-amber-400",   active: true  },
    { init: "TM", bg: "bg-blue-500",    active: true  },
    { init: "AB", bg: "bg-emerald-400", active: false },
    { init: "LR", bg: "bg-rose-400",    active: false },
  ];
  return (
    <div className="flex h-full gap-4 p-6" style={{ background: "#f5f3ff" }}>
      {/* Left — team list */}
      <div className="flex w-44 flex-shrink-0 flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-violet-100">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-violet-400">Équipe</p>
        {members.map((m) => (
          <div key={m.init} className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${m.bg}`}>{m.init}</div>
            <div className="min-w-0 flex-1">
              <div className="h-2 w-3/4 rounded-full bg-gray-100" />
            </div>
            {m.active && <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />}
          </div>
        ))}
        <div className="mt-2 rounded-xl bg-violet-50 px-3 py-2 text-center">
          <p className="text-[9px] font-bold text-violet-600">+ Inviter</p>
        </div>
      </div>
      {/* Right — shared doc */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-violet-100">
          <FileText className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-semibold text-gray-800">Contrat_Prestataire_2024.pdf</span>
          <div className="ml-auto flex">
            {members.slice(0,3).map((m, i) => (
              <div key={m.init} style={{ marginLeft: i > 0 ? -6 : 0 }} className={`flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-white ${m.bg}`}>{m.init}</div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-violet-100">
          <div className="space-y-2.5">
            {[92, 78, 85, 65, 88, 55, 72].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-violet-50" style={{ width: `${w}%` }} />
            ))}
          </div>
          {/* Cursor */}
          <div className="relative mt-3">
            <div className="h-2 rounded-full bg-violet-50" style={{ width: "60%" }} />
            <div className="absolute -top-1 flex items-center gap-1" style={{ left: "60%" }}>
              <div className="h-4 w-0.5 bg-amber-400" />
              <span className="rounded-sm bg-amber-400 px-1 py-0.5 text-[7px] font-bold text-white">SL</span>
            </div>
          </div>
          {/* Comment */}
          <div className="mt-4 flex items-start gap-2 border-t border-violet-50 pt-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white">SL</div>
            <div className="rounded-xl rounded-tl-sm bg-violet-50 px-3 py-1.5">
              <p className="text-[11px] text-gray-700">Article 3 — délai de 30j pas 15j</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIVisual() {
  return (
    <div className="flex h-full gap-4 p-6" style={{ background: "#fffbeb" }}>
      {/* Left — DocuBot */}
      <div className="flex w-52 flex-shrink-0 flex-col gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-sm font-semibold text-white">DocuBot</span>
          <div className="ml-auto flex gap-0.5">
            {[0,1,2].map(i => <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
        {/* Chips */}
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-amber-100">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-amber-500">Secteur</p>
          <div className="flex flex-wrap gap-1.5">
            {[{l:"Immobilier",a:true},{l:"Médical",a:false},{l:"Juridique",a:false},{l:"Commerce",a:false}].map(c => (
              <span key={c.l} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${c.a ? "bg-amber-500 text-white" : "bg-gray-50 text-gray-500 ring-1 ring-gray-100"}`}>{c.l}</span>
            ))}
          </div>
        </div>
        {/* Type */}
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-amber-100">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-amber-500">Type</p>
          <div className="flex flex-col gap-1.5">
            {[{l:"Contrat",a:true},{l:"Devis",a:false},{l:"Courrier",a:false}].map(t => (
              <div key={t.l} className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 ${t.a ? "bg-amber-50 ring-1 ring-amber-200" : ""}`}>
                {t.a && <Check className="h-3 w-3 text-amber-600" />}
                <span className={`text-xs ${t.a ? "font-semibold text-amber-700" : "text-gray-500"}`}>{t.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right — generated doc */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-amber-100">
          <FileText className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-gray-800">Contrat_location_immo.pdf</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600">
            <Sparkles className="h-2.5 w-2.5" /> Généré
          </span>
        </div>
        <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-100">
          <div className="space-y-2.5">
            {[88, 72, 94, 60, 82, 55, 78, 90, 65].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-amber-50" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-400" />
            <span className="text-[9px] font-semibold text-amber-500">Rédaction en cours…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HubVisual() {
  const folders = [
    { name: "Juridique", count: 18, bg: "bg-blue-50",    icon: "text-blue-500",    num: "text-blue-600",    pill: "bg-blue-100" },
    { name: "Finances",  count: 34, bg: "bg-emerald-50", icon: "text-emerald-500", num: "text-emerald-600", pill: "bg-emerald-100" },
    { name: "RH",        count: 12, bg: "bg-violet-50",  icon: "text-violet-500",  num: "text-violet-600",  pill: "bg-violet-100" },
    { name: "Clients",   count: 27, bg: "bg-amber-50",   icon: "text-amber-500",   num: "text-amber-600",   pill: "bg-amber-100" },
    { name: "Projets",   count: 15, bg: "bg-rose-50",    icon: "text-rose-500",    num: "text-rose-600",    pill: "bg-rose-100" },
    { name: "Archives",  count:  8, bg: "bg-sky-50",     icon: "text-sky-500",     num: "text-sky-600",     pill: "bg-sky-100" },
  ];
  const recent = [
    { name: "Rapport_Q1_2024.pdf",  time: "2h",  color: "bg-blue-500"    },
    { name: "Devis_Client_12.pdf",  time: "5h",  color: "bg-amber-500"   },
    { name: "Contrat_RH_Mars.pdf",  time: "1j",  color: "bg-violet-500"  },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-6" style={{ background: "#f0fdf4" }}>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {folders.map((f) => (
          <div key={f.name} className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 shadow-sm ring-1 ring-white ${f.bg}`}>
            <Folder className={`h-6 w-6 ${f.icon}`} />
            <span className={`text-[10px] font-bold ${f.num}`}>{f.count}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-1 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <p className="text-xs font-semibold text-gray-500">Documents récents</p>
          <span className="ml-auto flex items-center gap-0.5 text-[10px] text-emerald-500">
            <TrendingUp className="h-3 w-3" /> 91 ce mois
          </span>
        </div>
        {recent.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${r.color}`}>
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">{r.name}</span>
            <span className="text-[10px] text-gray-400">il y a {r.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const VISUALS = [SearchVisual, CollabVisual, AIVisual, HubVisual];

// ─── Main component ──────────────────────────────────────────────────────────

export function WhyShowcase() {
  const [active, setActive] = useState(0);
  const Visual = VISUALS[active];

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

        {/* 4 cards with title + description */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CARDS.map(({ id, icon: Icon, iconBg, iconColor, activeBg, activeBorder, title, desc }, i) => {
            const isOn = active === i;
            return (
              <button
                key={id}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`flex flex-col rounded-3xl p-5 text-left ring-2 transition-all duration-200 ${
                  isOn
                    ? `${activeBg} ${activeBorder} shadow-md`
                    : "bg-gray-50 ring-transparent hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <p className="mb-1.5 text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs leading-relaxed text-gray-500">{desc}</p>
              </button>
            );
          })}
        </div>

        {/* Big rectangle — fixed height, no text, pure visual */}
        <div
          className="mt-3 overflow-hidden rounded-3xl shadow-xl ring-1 ring-gray-100"
          style={{ height: 340 }}
        >
          <Visual />
        </div>

      </div>
    </section>
  );
}
