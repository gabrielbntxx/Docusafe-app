"use client";

import { useState, useEffect } from "react";
import {
  FileText, Calendar, Banknote, AlertCircle,
  FolderOpen, Sparkles, Users, Check, Loader2,
  ScanLine, Brain, Clock,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const ITEMS = [
  { icon: FileText,     label: "Type détecté",   value: "Contrat de bail",     color: "blue",    alert: false },
  { icon: Users,        label: "Parties",         value: "M. Dupont · SCI Alpha", color: "violet", alert: false },
  { icon: Banknote,     label: "Montant",         value: "850 € / mois",        color: "emerald", alert: false },
  { icon: Calendar,     label: "Signé le",        value: "15 janvier 2024",     color: "blue",    alert: false },
  { icon: AlertCircle,  label: "Expire le",       value: "31 mars 2025",        color: "orange",  alert: true  },
  { icon: FolderOpen,   label: "Classé dans",     value: "Logement → Contrats", color: "indigo",  alert: false },
  { icon: Sparkles,     label: "Confiance IA",    value: "98 %",                color: "emerald", alert: false },
] as const;

const COLORS: Record<string, { bg: string; icon: string }> = {
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600"    },
  violet:  { bg: "bg-violet-50",  icon: "text-violet-600"  },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  orange:  { bg: "bg-orange-50",  icon: "text-orange-600"  },
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-600"  },
};

const FEATURES = [
  { icon: ScanLine, title: "Détection instantanée",  desc: "Type, langue, format — reconnus en millisecondes." },
  { icon: Brain,    title: "Extraction des données", desc: "Dates, montants, parties — structurés automatiquement." },
  { icon: Clock,    title: "Alertes d'expiration",   desc: "Rappels à 60, 30 et 7 jours avant la date limite." },
  { icon: FolderOpen, title: "Classement auto",      desc: "L'IA suggère le bon dossier selon le contenu." },
];

// ─── Timing ──────────────────────────────────────────────────────────────────
// tick 0-1 : scanning  |  tick 2-8 : items  |  tick 9-12 : done  → cycle 13
const TICK_MS = 620;
const CYCLE   = 13;

// ─── Component ───────────────────────────────────────────────────────────────
export function AnalysisSection() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % CYCLE), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const isScanning   = tick <= 1;
  const visibleCount = tick <= 1 ? 0 : Math.min(tick - 2, ITEMS.length);
  const isDone       = tick >= ITEMS.length + 2;

  return (
    <section className="bg-white px-4 py-24 md:py-32">

      {/* Keyframes */}
      <style>{`
        @keyframes scanDown {
          0%   { top: 0%;   opacity: 0; }
          6%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line { animation: scanDown 1.35s linear infinite; }
      `}</style>

      <div className="mx-auto max-w-6xl">

        {/* ── Section header ── */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <Brain className="h-4 w-4" />
            Intelligence artificielle
          </div>
          <h2
            className="text-4xl font-extrabold text-gray-900 md:text-5xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.08 }}
          >
            L&apos;IA qui lit vos<br />documents pour vous
          </h2>
          <p className="mt-5 text-lg text-gray-500 leading-relaxed">
            Chaque document importé est analysé en quelques secondes. Type, données clés, expiration, classement — tout est extrait automatiquement.
          </p>
        </div>

        {/* ── Main visual ── */}
        <div className="rounded-3xl bg-gray-50 p-6 ring-1 ring-gray-100 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">

            {/* ── Left — Document card ── */}
            <div className="flex-shrink-0 md:w-52">
              <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100">

                {/* Scanning line */}
                {isScanning && (
                  <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
                    <div
                      className="scan-line absolute left-0 right-0"
                      style={{ height: 3, background: "linear-gradient(90deg, transparent, #3b82f6 40%, #6366f1 50%, #3b82f6 60%, transparent)" }}
                    />
                    <div
                      className="scan-line absolute left-0 right-0"
                      style={{ height: 48, background: "linear-gradient(180deg, rgba(59,130,246,0.10) 0%, transparent 100%)" }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-blue-500/[0.03]" />
                  </div>
                )}

                {/* Done overlay */}
                {isDone && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-emerald-500/[0.07]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                      <Check className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                )}

                {/* File header */}
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">PDF</p>
                    <p className="text-[10px] text-gray-400">421 Ko</p>
                  </div>
                </div>

                <p className="text-sm font-semibold leading-snug text-gray-800">Contrat_bail_2024.pdf</p>
                <p className="mt-1 text-[11px] text-gray-400">Importé il y a 3s</p>

                {/* Fake document lines */}
                <div className="mt-5 space-y-2">
                  {[78, 62, 90, 55, 72, 40].map((w, i) => (
                    <div key={i} className="h-1.5 rounded-full bg-gray-100" style={{ width: `${w}%` }} />
                  ))}
                </div>

                {/* Status */}
                <div className="mt-5 flex items-center gap-1.5">
                  {isScanning ? (
                    <>
                      <ScanLine className="h-3.5 w-3.5 animate-pulse text-blue-500" />
                      <span className="text-[10px] font-semibold text-blue-600">Lecture…</span>
                    </>
                  ) : isDone ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] font-semibold text-emerald-600">Analysé</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                      <span className="text-[10px] font-semibold text-blue-600">Extraction en cours…</span>
                    </>
                  )}
                </div>
              </div>

              {/* IA badge */}
              <div className="mt-5 flex justify-center">
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 shadow-lg shadow-blue-500/25">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-semibold text-white">DocuSafe IA</span>
                </div>
              </div>
            </div>

            {/* ── Right — Extracted results ── */}
            <div className="flex-1">

              {/* Status header */}
              <div className="mb-5 flex h-8 items-center">
                {isScanning ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Lecture du document en cours…</span>
                  </div>
                ) : isDone ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      Analyse terminée — {ITEMS.length} données extraites
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">
                      Extraction des données… <span className="text-blue-600 font-semibold">{visibleCount}/{ITEMS.length}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {ITEMS.map((item, i) => {
                  const c = COLORS[item.color];
                  const visible = i < visibleCount;
                  return (
                    <div
                      key={i}
                      style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(10px)",
                        transition: "opacity 0.35s ease, transform 0.35s ease",
                      }}
                      className={`flex items-center gap-3 rounded-xl border bg-white p-3.5 ${
                        visible
                          ? item.alert
                            ? "border-orange-200 shadow-sm shadow-orange-100"
                            : "border-gray-100 shadow-sm"
                          : "border-transparent"
                      }`}
                    >
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
                        <item.icon className={`h-4 w-4 ${c.icon}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
                        <p className={`mt-0.5 text-sm font-semibold leading-tight ${item.alert ? "text-orange-700" : "text-gray-800"}`}>
                          {item.value}
                        </p>
                      </div>
                      {visible && (
                        item.alert
                          ? <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                          : <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" strokeWidth={2.5} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature bullets ── */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                <f.icon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
