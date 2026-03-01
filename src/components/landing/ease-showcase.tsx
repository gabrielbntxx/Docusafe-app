"use client";

import { useEffect, useState } from "react";
import {
  Upload, Sparkles, Search, FileText, FolderOpen,
  Check, RefreshCw, ArrowRight, Clock,
} from "lucide-react";

// ─── 3 coded visuals ─────────────────────────────────────────────────────────

function UploadVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-3xl bg-gray-50 p-8">
      {/* Drop zone */}
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Glissez vos fichiers ici</p>
        <p className="text-xs text-gray-400">PDF, Word, Excel, images…</p>
        <div className="mt-1 flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2">
          <span className="text-xs font-semibold text-white">Parcourir</span>
        </div>
      </div>
      {/* File uploading */}
      <div className="w-full rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-800">Contrat_2024.pdf</p>
            <p className="text-[9px] text-gray-400">1.4 Mo · En cours…</p>
          </div>
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: "68%" }} />
        </div>
      </div>
    </div>
  );
}

function ClassifyVisual() {
  const tags = ["Juridique", "Contrat", "2024", "Fournisseur"];
  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-gray-50 p-8">
      {/* Document */}
      <div className="rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
            <FileText className="h-4 w-4 text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-800">Contrat_2024.pdf</p>
            <p className="text-[9px] text-gray-400">Importé à l&apos;instant</p>
          </div>
        </div>
      </div>
      {/* AI arrow */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-200" />
        <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
          <Sparkles className="h-3 w-3 text-blue-500" />
          <span className="text-[9px] font-semibold text-gray-600">IA en train de classifier…</span>
        </div>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      {/* Result */}
      <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
            <FolderOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Dossier détecté</p>
            <p className="text-[9px] text-gray-400">Juridique / Contrats</p>
          </div>
          <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
            <Check className="h-3 w-3 text-gray-600" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span
              key={t}
              className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold ${
                i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FindVisual() {
  const results = [
    { name: "Contrat_2024.pdf",       time: "À l'instant", match: true  },
    { name: "Contrat_Fournisseur.pdf",time: "3j",          match: false },
    { name: "Avenant_2023.pdf",       time: "12j",         match: false },
  ];
  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-gray-50 p-8">
      {/* Search bar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
        <Search className="h-4 w-4 flex-shrink-0 text-blue-500" />
        <span className="text-sm font-medium text-gray-700">contrat 2024</span>
        <div className="ml-auto rounded-full bg-blue-600 px-3 py-1">
          <span className="text-[9px] font-bold text-white">3 résultats</span>
        </div>
      </div>
      {/* Results */}
      <div className="flex flex-col gap-2">
        {results.map((r) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              r.match ? "bg-blue-600 shadow-md" : "bg-white ring-1 ring-gray-100"
            }`}
          >
            <FileText className={`h-4 w-4 flex-shrink-0 ${r.match ? "text-white" : "text-gray-400"}`} />
            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs font-semibold ${r.match ? "text-white" : "text-gray-700"}`}>{r.name}</p>
              <p className={`text-[9px] ${r.match ? "text-blue-200" : "text-gray-400"}`}>{r.time}</p>
            </div>
            {r.match && <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-white/70" />}
          </div>
        ))}
      </div>
      {/* Time tag */}
      <div className="flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-100">
        <Clock className="h-3 w-3 text-gray-400" />
        <span className="text-[9px] font-semibold text-gray-500">Trouvé en 0.3 s</span>
      </div>
    </div>
  );
}

const STEPS = [
  { label: "Importer",   Visual: UploadVisual   },
  { label: "Classifier", Visual: ClassifyVisual },
  { label: "Retrouver",  Visual: FindVisual     },
];

// ─── Main component ──────────────────────────────────────────────────────────

export function EaseShowcase() {
  const [active, setActive] = useState(0);

  // Auto-cycle every 3 s
  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % STEPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const { Visual } = STEPS[active];

  return (
    <section className="bg-white px-4 pt-16 pb-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

          {/* LEFT — title + description + step pills */}
          <div className="lg:flex-[5]">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Prise en main</p>
            <h2
              className="mb-5 text-4xl font-extrabold text-gray-900 md:text-5xl"
              style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
            >
              Facile à prendre<br />en main.
            </h2>
            <p className="mb-8 max-w-sm text-base leading-relaxed text-gray-500">
              En trois étapes, vos documents sont importés, classés automatiquement et retrouvables en quelques secondes — sans aucune formation.
            </p>

            {/* Step selectors */}
            <div className="flex flex-col gap-2">
              {STEPS.map(({ label }, i) => (
                <button
                  key={label}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                    active === i
                      ? "bg-gray-900 shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active === i ? "bg-white text-gray-900" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm font-semibold ${active === i ? "text-white" : "text-gray-600"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — changing visual */}
          <div className="lg:flex-[6]">
            <div
              className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-gray-200"
              style={{ height: 380 }}
            >
              <Visual />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
