"use client";

import Link from "next/link";
import { ChevronRight, Search, Shield, Sparkles, Bell } from "lucide-react";

// Cloud puff helper — a single blurred circle
function Puff({ w, h, blur, opacity, ml = 0 }: {
  w: number; h: number; blur: number; opacity: number; ml?: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: "50%",
        background: "white",
        filter: `blur(${blur}px)`,
        opacity,
        flexShrink: 0,
        marginLeft: ml,
      }}
    />
  );
}

const FOLDERS = [
  { name: "Contrats", color: "#6366f1", count: 12, active: true },
  { name: "Finances", color: "#10b981", count: 8, active: false },
  { name: "Études",   color: "#f59e0b", count: 24, active: false },
  { name: "RH",       color: "#ef4444", count: 5,  active: false },
  { name: "Personnel",color: "#06b6d4", count: 3,  active: false },
];

const DOCUMENTS = [
  { name: "Contrat de bail 2024.pdf",    type: "Contrat",  date: "12 jan.", badge: "IA analysé",     badgeClass: "bg-emerald-100 text-emerald-700" },
  { name: "Facture EDF Janvier.pdf",     type: "Facture",  date: "3 jan.",  badge: "Classé auto",    badgeClass: "bg-blue-100 text-blue-700" },
  { name: "Relevé bancaire Déc.pdf",     type: "Relevé",   date: "28 déc.", badge: null,             badgeClass: "" },
  { name: "Carte nationale d'identité", type: "Identité", date: "1 jan.",  badge: "Expire bientôt", badgeClass: "bg-orange-100 text-orange-700" },
];

function FolderIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fillOpacity="0.9" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-0 pt-24 text-center">

      {/* ── Sky gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0c3d78 0%, #1260b8 18%, #2b82d0 42%, #5aaae6 68%, #a8d6f2 85%, #e4f3fb 100%)",
        }}
      />

      {/* ── Sun glow ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 560,
          background:
            "radial-gradient(ellipse at center top, rgba(255,245,160,0.38) 0%, rgba(255,210,80,0.14) 38%, transparent 68%)",
          borderRadius: "50%",
        }}
      />

      {/* ── Sky pulse (breathing light) ── */}
      <div
        className="hero-sky-pulse pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.18) 0%, transparent 58%)",
        }}
      />

      {/* ══ CLOUD A — large, left→right, floats slow ══ */}
      <div className="hero-cloud-a pointer-events-none absolute left-0" style={{ top: "7%" }}>
        <div className="scale-[0.52] origin-left md:scale-100">
          <div className="hero-float-slow" style={{ display: "flex", alignItems: "flex-end" }}>
            <Puff w={148} h={98}  blur={18} opacity={0.80} />
            <Puff w={224} h={152} blur={13} opacity={0.96} ml={-80} />
            <Puff w={182} h={120} blur={15} opacity={0.88} ml={-92} />
            <Puff w={130} h={88}  blur={20} opacity={0.74} ml={-56} />
            <Puff w={200} h={132} blur={13} opacity={0.90} ml={-88} />
          </div>
        </div>
      </div>

      {/* ══ CLOUD B — small, left→right slower, floats fast ══ */}
      <div className="hero-cloud-b pointer-events-none absolute left-0" style={{ top: "45%" }}>
        <div className="scale-[0.52] origin-left md:scale-100">
          <div className="hero-float-fast" style={{ display: "flex", alignItems: "flex-end" }}>
            <Puff w={92}  h={60}  blur={20} opacity={0.60} />
            <Puff w={148} h={96}  blur={16} opacity={0.70} ml={-40} />
            <Puff w={105} h={68}  blur={20} opacity={0.60} ml={-52} />
          </div>
        </div>
      </div>

      {/* ══ CLOUD C — medium, right→left, floats med ══ */}
      <div className="hero-cloud-c pointer-events-none absolute right-0" style={{ top: "19%" }}>
        <div className="scale-[0.52] origin-right md:scale-100">
          <div className="hero-float-med" style={{ display: "flex", alignItems: "flex-end" }}>
            <Puff w={115} h={76}  blur={18} opacity={0.70} />
            <Puff w={190} h={130} blur={13} opacity={0.88} ml={-60} />
            <Puff w={155} h={104} blur={16} opacity={0.80} ml={-80} />
            <Puff w={96}  h={64}  blur={20} opacity={0.66} ml={-42} />
          </div>
        </div>
      </div>

      {/* ══ CLOUD D — tiny, right→left very slow, background depth ══ */}
      <div className="hero-cloud-d pointer-events-none absolute right-0" style={{ top: "55%" }}>
        <div className="scale-[0.52] origin-right md:scale-100">
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Puff w={76}  h={46}  blur={22} opacity={0.42} />
            <Puff w={108} h={66}  blur={18} opacity={0.50} ml={-26} />
            <Puff w={76}  h={46}  blur={22} opacity={0.42} ml={-36} />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto">

        {/* Badge */}
        <div className="hero-anim-title mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/25">
          <Sparkles className="h-3.5 w-3.5" />
          Propulsé par l&apos;intelligence artificielle
        </div>

        <h1
          className="hero-anim-title mb-5 max-w-3xl text-[3.2rem] text-white md:text-[5.5rem] lg:text-[6.5rem]"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            textShadow: "0 2px 32px rgba(0,0,0,0.24)",
          }}
        >
          Vos documents.<br />
          <span style={{ opacity: 0.85 }}>Triés et retrouvés</span><br />
          en secondes.
        </h1>

        <p
          className="hero-anim-sub mb-10 max-w-lg text-lg md:text-xl"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            fontWeight: 500,
            color: "rgba(255,255,255,0.82)",
            textShadow: "0 1px 8px rgba(0,0,0,0.16)",
            lineHeight: 1.55,
          }}
        >
          DocuSafe analyse, classe et protège tous vos documents — avec une IA qui comprend vraiment ce qu&apos;elle stocke.
        </p>

        <div className="hero-anim-cta flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-blue-700 shadow-[0_4px_28px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(0,0,0,0.28)]"
          >
            Commencer gratuitement
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Se connecter
          </Link>
        </div>

        {/* ── Dashboard mockup ── */}
        <div className="mt-14 w-full max-w-4xl">
          <div
            className="overflow-hidden rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.35)] ring-1 ring-white/20"
            style={{ transform: "perspective(1200px) rotateX(3deg)" }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-4 flex flex-1 items-center gap-2 rounded-md bg-[#2d2d2d] px-3 py-1.5">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span className="text-[11px] text-gray-400">app.docusafe.online/dashboard</span>
              </div>
            </div>

            {/* Dashboard UI */}
            <div className="flex bg-white" style={{ height: 340 }}>

              {/* Sidebar */}
              <div className="hidden sm:flex w-44 flex-shrink-0 flex-col gap-0.5 border-r border-gray-100 bg-gray-50/60 p-3">
                <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">Mes dossiers</p>
                {FOLDERS.map((f) => (
                  <div
                    key={f.name}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                      f.active ? "bg-indigo-50 ring-1 ring-indigo-100" : "hover:bg-gray-100"
                    }`}
                  >
                    <FolderIcon color={f.color} />
                    <span className="flex-1 truncate text-[11px] font-medium text-gray-700">{f.name}</span>
                    <span className="text-[10px] text-gray-400">{f.count}</span>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
                    <Search className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Rechercher dans vos documents…</span>
                  </div>
                  <Bell className="h-4 w-4 text-gray-400" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                    <span className="text-[10px] font-bold text-white">G</span>
                  </div>
                </div>

                {/* Section title */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Contrats</p>
                    <p className="text-[10px] text-gray-400">12 documents · analysés par IA</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    Tous analysés
                  </span>
                </div>

                {/* Documents list */}
                <div className="flex-1 space-y-1.5 overflow-hidden px-4 pb-3">
                  {DOCUMENTS.map((doc, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        i === 0
                          ? "bg-indigo-50/80 ring-1 ring-indigo-100"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className={`rounded-lg p-1.5 ${i === 0 ? "bg-indigo-100" : "bg-white shadow-sm ring-1 ring-gray-100"}`}>
                        <FileIcon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-gray-800">{doc.name}</p>
                        <p className="text-[10px] text-gray-400">{doc.type} · {doc.date}</p>
                      </div>
                      {doc.badge && (
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${doc.badgeClass}`}>
                          {doc.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Horizon fog ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/80 to-transparent" />

      {/* ── Rolling hills ── */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,128 C220,88 440,162 660,118 C880,74 1100,158 1320,108 C1400,88 1430,110 1440,118 L1440,200 L0,200 Z" fill="white" fillOpacity="0.18" />
        <path d="M0,146 C260,106 520,170 780,138 C1040,106 1220,164 1440,144 L1440,200 L0,200 Z" fill="white" fillOpacity="0.36" />
        <path d="M0,160 C380,130 760,176 1140,154 C1300,144 1390,160 1440,162 L1440,200 L0,200 Z" fill="white" fillOpacity="0.56" />
        <path d="M0,173 C500,152 1000,182 1440,169 L1440,200 L0,200 Z" fill="white" fillOpacity="0.78" />
        <path d="M0,184 C360,174 760,188 1440,179 L1440,200 L0,200 Z" fill="white" fillOpacity="0.92" />
        <path d="M0,194 C480,187 960,197 1440,190 L1440,200 L0,200 Z" fill="white" />
      </svg>

    </section>
  );
}
