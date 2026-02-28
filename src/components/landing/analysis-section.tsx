"use client";

import { useState, useEffect } from "react";
import {
  FileText, Calendar, Banknote, AlertCircle,
  FolderOpen, Sparkles, Users, Check, Loader2,
  ScanLine, Brain, Clock, ArrowRight,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ITEMS = [
  { icon: FileText,    label: "Type détecté",  value: "Contrat de bail",       color: "blue",    alert: false },
  { icon: Users,       label: "Parties",        value: "M. Dupont · SCI Alpha", color: "violet",  alert: false },
  { icon: Banknote,    label: "Montant",         value: "850 € / mois",          color: "emerald", alert: false },
  { icon: Calendar,    label: "Signé le",        value: "15 janvier 2024",       color: "blue",    alert: false },
  { icon: AlertCircle, label: "Expire le",       value: "31 mars 2025",          color: "orange",  alert: true  },
  { icon: FolderOpen,  label: "Classé dans",     value: "Logement → Contrats",   color: "indigo",  alert: false },
  { icon: Sparkles,    label: "Confiance IA",    value: "98 %",                  color: "emerald", alert: false },
] as const;

const COLORS: Record<string, { bg: string; icon: string }> = {
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600"    },
  violet:  { bg: "bg-violet-50",  icon: "text-violet-600"  },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  orange:  { bg: "bg-orange-50",  icon: "text-orange-600"  },
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-600"  },
};

const FEATURES = [
  { icon: ScanLine,   title: "Détection instantanée",  desc: "Type, langue, format — reconnus en millisecondes dès l'import." },
  { icon: Brain,      title: "Extraction des données", desc: "Dates, montants, parties prenantes — structurés sans aucune saisie." },
  { icon: Clock,      title: "Alertes d'expiration",   desc: "Rappels automatiques à 60, 30 et 7 jours avant chaque échéance." },
  { icon: FolderOpen, title: "Classement automatique", desc: "L'IA suggère le bon dossier et y dépose le document pour vous." },
];

// ─── Timing ───────────────────────────────────────────────────────────────────
const TICK_MS = 620;
const CYCLE   = 13; // 2 scan + 7 items + 4 done

// ─── Component ────────────────────────────────────────────────────────────────
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
    <section className="bg-gray-50 px-4 py-24 md:py-32">

      <style>{`
        @keyframes scanDown {
          0%   { top: 0%;   opacity: 0; }
          6%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line { animation: scanDown 1.35s linear infinite; }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-24">

          {/* ══ LEFT — Animation (prend ~60% de l'espace) ══ */}
          <div className="w-full lg:flex-[6]">
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100 md:p-8">

              {/* Status bar */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Analyse en direct
                  </span>
                </div>
                <div className="flex h-6 items-center">
                  {isScanning ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin" /> Lecture…
                    </span>
                  ) : isDone ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                      <Check className="h-3 w-3" strokeWidth={3} /> Terminé
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin" /> {visibleCount}/{ITEMS.length} extraits
                    </span>
                  )}
                </div>
              </div>

              {/* Main layout: document left | results right */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6">

                {/* Document card */}
                <div className="relative w-full flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-100 sm:w-52">

                  {/* Scan line */}
                  {isScanning && (
                    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
                      <div
                        className="scan-line absolute left-0 right-0"
                        style={{ height: 3, background: "linear-gradient(90deg, transparent, #3b82f6 40%, #6366f1 50%, #3b82f6 60%, transparent)" }}
                      />
                      <div
                        className="scan-line absolute left-0 right-0"
                        style={{ height: 56, background: "linear-gradient(180deg, rgba(59,130,246,0.09) 0%, transparent 100%)" }}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-blue-500/[0.02]" />
                    </div>
                  )}

                  {/* Done overlay */}
                  {isDone && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-emerald-500/[0.06]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                        <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  )}

                  {/* File info */}
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                      <FileText className="h-4.5 w-4.5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">PDF · 421 Ko</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold leading-snug text-gray-800">Contrat_bail_2024.pdf</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">Importé il y a 3s</p>

                  {/* Fake text lines */}
                  <div className="mt-5 space-y-2">
                    {[82, 68, 94, 58, 76, 44, 60].map((w, i) => (
                      <div key={i} className="h-1.5 rounded-full bg-gray-200/60" style={{ width: `${w}%` }} />
                    ))}
                  </div>

                  {/* Status badge */}
                  <div className="mt-4 flex items-center gap-1.5">
                    {isScanning ? (
                      <><ScanLine className="h-3 w-3 animate-pulse text-blue-500" /><span className="text-[10px] font-semibold text-blue-600">Lecture…</span></>
                    ) : isDone ? (
                      <><Check className="h-3 w-3 text-emerald-500" /><span className="text-[10px] font-semibold text-emerald-600">Analysé</span></>
                    ) : (
                      <><Loader2 className="h-3 w-3 animate-spin text-blue-500" /><span className="text-[10px] font-semibold text-blue-600">Extraction…</span></>
                    )}
                  </div>
                </div>

                {/* Results */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
                    {ITEMS.map((item, i) => {
                      const c = COLORS[item.color];
                      const visible = i < visibleCount;
                      return (
                        <div
                          key={i}
                          style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
                            transition: "opacity 0.32s ease, transform 0.32s ease",
                          }}
                          className={`flex items-center gap-3 rounded-xl border p-3 ${
                            visible
                              ? item.alert
                                ? "border-orange-200 bg-orange-50/40 shadow-sm"
                                : "border-gray-100 bg-white shadow-sm"
                              : "border-transparent bg-transparent"
                          }`}
                        >
                          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
                            <item.icon className={`h-3.5 w-3.5 ${c.icon}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
                            <p className={`mt-0.5 text-xs font-semibold leading-tight ${item.alert ? "text-orange-700" : "text-gray-800"}`}>
                              {item.value}
                            </p>
                          </div>
                          {visible && (
                            item.alert
                              ? <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-orange-500" />
                              : <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" strokeWidth={2.5} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom — IA signature */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">DocuSafe IA</span>
                </div>
                <span className="text-[11px] text-gray-400">Analyse automatique · Aucune saisie requise</span>
              </div>

            </div>
          </div>

          {/* ══ RIGHT — Texte éditorial (~40%) ══ */}
          <div className="w-full lg:flex-[4]">

            <h2
              className="text-4xl font-extrabold text-gray-900 md:text-5xl"
              style={{ letterSpacing: "-0.03em", lineHeight: 1.08 }}
            >
              L&apos;IA qui lit vos<br />documents<br />pour vous
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-gray-500">
              Chaque document importé est analysé en quelques secondes — type, données clés, expiration, classement. Tout est extrait automatiquement.
            </p>

            {/* Feature list — vertical, pas de grille */}
            <div className="mt-8 space-y-5">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                    <f.icon className="h-4 w-4 text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{f.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/register"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
            >
              Essayer l&apos;analyse IA <ArrowRight className="h-4 w-4" />
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}
