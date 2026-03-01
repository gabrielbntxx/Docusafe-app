"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, FileText, FolderOpen, Check, Send } from "lucide-react";

// ─── DocuBot chat ───────────────────────────────────────────────────────────────

const MESSAGES = [
  { from: "user", text: "Où est ma facture d'avril ?" },
  { from: "bot",  text: "Votre facture d'avril 2025 est dans Factures / 2025. Reçue le 3 avril par email — total : 1 847 € HT.", delay: 800 },
  { from: "user", text: "Résume mon contrat de travail." },
  { from: "bot",  text: "CDI signé le 12/01/2023 · Salaire brut 3 200 €/mois · Période d'essai expirée · Clause de non-concurrence : 12 mois.", delay: 900 },
];

export function DocuBotChat() {
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
  { name: "Facture_EDF_mars.pdf",  folder: "Factures / 2025",      color: "bg-blue-100 text-blue-600" },
  { name: "Passeport_Gabriel.pdf", folder: "Identité / Documents",  color: "bg-emerald-100 text-emerald-600" },
  { name: "Bail_Appartement.pdf",  folder: "Logement / Contrats",   color: "bg-orange-100 text-orange-600" },
  { name: "Contrat_CDI_2023.pdf",  folder: "RH / Contrats",         color: "bg-violet-100 text-violet-600" },
];

export function ClassifyVisual() {
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
              ? "bg-white ring-gray-100 shadow-sm opacity-100"
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

// ─── Counter ────────────────────────────────────────────────────────────────────

export function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
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
