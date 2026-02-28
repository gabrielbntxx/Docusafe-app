"use client";

import { useState } from "react";
import { HardDrive, Mail, MessageSquare, Code2, FileText, Folder, Check, ArrowRight, RefreshCw, Paperclip, Bot, Zap } from "lucide-react";

const INTEGRATIONS = [
  {
    id: "drive",
    icon: HardDrive,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    name: "Google Drive",
    desc: "Synchronisez vos fichiers Drive directement dans DocuSafe.",
  },
  {
    id: "outlook",
    icon: Mail,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    dot: "bg-sky-500",
    name: "Microsoft Outlook",
    desc: "Importez vos pièces jointes email en un clic.",
  },
  {
    id: "slack",
    icon: MessageSquare,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
    name: "Slack",
    desc: "Recevez des notifications et partagez des documents dans vos canaux.",
  },
  {
    id: "api",
    icon: Code2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    name: "API REST",
    desc: "Intégrez DocuSafe dans vos propres outils et workflows custom.",
  },
];

// ─── Visuals per integration ───────────────────────────────────────────────────

function DriveVisual() {
  const files = [
    { name: "Rapport_Q4_2024.pdf",  size: "3.2 Mo", status: "synced"  },
    { name: "Contrat_Fournisseur.docx", size: "1.8 Mo", status: "syncing" },
    { name: "Budget_Annuel.xlsx",   size: "940 Ko", status: "synced"  },
    { name: "Présentation_CA.pdf",  size: "5.1 Mo", status: "synced"  },
  ];
  return (
    <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-blue-100">
          <HardDrive className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Google Drive</p>
          <p className="text-[10px] text-gray-400">Synchronisation active</p>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-semibold text-emerald-600">En direct</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {files.map((f) => (
          <div key={f.name} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
            <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-gray-800">{f.name}</p>
              <p className="text-[9px] text-gray-400">{f.size}</p>
            </div>
            {f.status === "synced" ? (
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-2.5 w-2.5 text-emerald-600" />
              </div>
            ) : (
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <RefreshCw className="h-2.5 w-2.5 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-600 px-3 py-2">
        <span className="text-[10px] font-semibold text-white">4 fichiers synchronisés</span>
        <ArrowRight className="h-3 w-3 text-white/70" />
      </div>
    </div>
  );
}

function OutlookVisual() {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-5">
      {/* Email */}
      <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-2.5 flex items-center gap-2 border-b border-gray-50 pb-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">O</div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-800">DHL Express</p>
            <p className="truncate text-[9px] text-gray-400">noreply@dhl.com · Votre facture du mois</p>
          </div>
          <span className="text-[8px] text-gray-300">09:42</span>
        </div>
        <p className="text-[10px] leading-relaxed text-gray-600">
          Veuillez trouver ci-joint votre facture de services pour le mois de mars 2024.
        </p>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5">
          <Paperclip className="h-3 w-3 flex-shrink-0 text-sky-500" />
          <span className="text-[10px] font-semibold text-sky-700">facture_mars_2024.pdf</span>
          <span className="ml-auto text-[9px] text-gray-400">420 Ko</span>
        </div>
      </div>
      {/* Arrow + DocuSafe */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 shadow-sm ring-1 ring-gray-100">
            <Zap className="h-2.5 w-2.5 text-amber-500" />
            <span className="text-[8px] font-semibold text-gray-500">Importé automatiquement</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      </div>
      {/* DocuSafe result */}
      <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <FileText className="h-3 w-3 text-white" />
          </div>
          <p className="text-[11px] font-bold text-gray-800">facture_mars_2024.pdf</p>
          <span className="ml-auto flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-semibold text-emerald-600">
            <Check className="h-2 w-2" /> Classé
          </span>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5">
            <Folder className="h-2.5 w-2.5 text-blue-500" />
            <span className="text-[8px] font-semibold text-blue-600">Finances</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5">
            <span className="text-[8px] font-semibold text-violet-600">Facture · DHL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlackVisual() {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 shadow-sm">
          <MessageSquare className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">#juridique-contrats</p>
          <p className="text-[9px] text-gray-400">12 membres</p>
        </div>
      </div>
      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">SL</div>
          <div>
            <p className="mb-0.5 text-[9px] font-bold text-gray-700">Sophie L. <span className="font-normal text-gray-400">10:14</span></p>
            <div className="rounded-xl rounded-tl-sm bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
              <p className="text-[10px] text-gray-700">J&apos;ai partagé le contrat via DocuSafe 👇</p>
            </div>
          </div>
        </div>
        {/* DocuSafe bot card */}
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1">
            <p className="mb-0.5 text-[9px] font-bold text-violet-600">DocuSafe Bot <span className="font-normal text-gray-400">10:14</span></p>
            <div className="rounded-xl rounded-tl-sm bg-white px-3 py-2.5 shadow-sm ring-1 ring-violet-100">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <p className="text-[10px] font-bold text-gray-800">Contrat_Prestataire_2024.pdf</p>
              </div>
              <div className="flex gap-1.5">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-semibold text-blue-600">Juridique</span>
                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[8px] text-gray-500">Lien · expire 7j</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-white">TM</div>
          <div className="rounded-xl rounded-tl-sm bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
            <p className="text-[10px] text-gray-700">Reçu, merci ! 👍</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiVisual() {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl bg-gray-900 p-5">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-[10px] font-mono text-gray-400">API REST · DocuSafe</span>
      </div>
      {/* Request */}
      <div className="rounded-xl bg-gray-800 p-3.5">
        <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-widest text-gray-500">Requête</p>
        <p className="font-mono text-[10px] text-emerald-400">POST <span className="text-gray-200">/api/v1/documents</span></p>
        <p className="mt-1 font-mono text-[9px] text-gray-400">Authorization: <span className="text-amber-300">Bearer •••••••••</span></p>
        <div className="mt-2.5 rounded-lg bg-gray-900/60 p-2">
          <p className="font-mono text-[9px] text-gray-300">{"{"}</p>
          <p className="font-mono text-[9px] text-gray-300 pl-3">&quot;folder&quot;: <span className="text-sky-300">&quot;Juridique&quot;</span>,</p>
          <p className="font-mono text-[9px] text-gray-300 pl-3">&quot;auto_classify&quot;: <span className="text-violet-300">true</span>,</p>
          <p className="font-mono text-[9px] text-gray-300 pl-3">&quot;notify_team&quot;: <span className="text-violet-300">true</span></p>
          <p className="font-mono text-[9px] text-gray-300">{"}"}</p>
        </div>
      </div>
      {/* Response */}
      <div className="rounded-xl bg-gray-800 p-3.5">
        <div className="mb-1.5 flex items-center gap-2">
          <p className="text-[8px] font-semibold uppercase tracking-widest text-gray-500">Réponse</p>
          <span className="rounded-full bg-emerald-900/60 px-2 py-0.5 font-mono text-[8px] font-bold text-emerald-400">200 OK</span>
        </div>
        <div className="rounded-lg bg-gray-900/60 p-2">
          <p className="font-mono text-[9px] text-gray-300">{"{"}</p>
          <p className="font-mono text-[9px] text-gray-300 pl-3">&quot;id&quot;: <span className="text-sky-300">&quot;doc_7f3k…&quot;</span>,</p>
          <p className="font-mono text-[9px] text-gray-300 pl-3">&quot;classified&quot;: <span className="text-violet-300">true</span>,</p>
          <p className="font-mono text-[9px] text-gray-300 pl-3">&quot;folder&quot;: <span className="text-sky-300">&quot;Juridique&quot;</span></p>
          <p className="font-mono text-[9px] text-gray-300">{"}"}</p>
        </div>
      </div>
    </div>
  );
}

const VISUALS = [DriveVisual, OutlookVisual, SlackVisual, ApiVisual];

export function IntegrationsShowcase() {
  const [active, setActive] = useState(0);
  const Visual = VISUALS[active];

  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-stretch">

            {/* LEFT — list */}
            <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Intégrations</p>
              <h3
                className="mb-2 text-2xl font-extrabold text-gray-900 md:text-3xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                S&apos;intègre à<br />vos outils existants
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-gray-500">
                Connectez DocuSafe à votre écosystème en quelques minutes, sans configuration complexe.
              </p>

              <div className="flex flex-col gap-2">
                {INTEGRATIONS.map(({ id, icon: Icon, color, bg, border, dot, name, desc }, i) => (
                  <button
                    key={id}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                      active === i
                        ? `${bg} ${border} shadow-sm`
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                      active === i ? "bg-white shadow-sm" : "bg-gray-100"
                    }`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">{name}</p>
                        {active === i && (
                          <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-gray-400">{desc}</p>
                    </div>
                    <ArrowRight className={`h-4 w-4 flex-shrink-0 transition-all ${
                      active === i ? `${color} opacity-100` : "text-gray-200 opacity-0 group-hover:opacity-100"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT — visual */}
            <div className="flex flex-col justify-center bg-gray-50/60 p-6 lg:flex-[6]">
              <div className="h-[340px] lg:h-full lg:min-h-[380px]">
                <Visual />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
