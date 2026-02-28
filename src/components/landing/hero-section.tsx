"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import {
  LayoutDashboard, FileText, Image as LucideImage, Folder, Search,
  FileUp, ArrowLeftRight, Bot, CreditCard, Settings, LogOut,
  Bell, Upload, HardDrive, Crown, Clock, Eye, Download,
  Sparkles, ArrowUpRight,
} from "lucide-react";

// ─── Puff helper ──────────────────────────────────────────────────────────────
function Puff({ w, h, blur, opacity, ml = 0 }: {
  w: number; h: number; blur: number; opacity: number; ml?: number;
}) {
  return (
    <div
      style={{
        width: w, height: h, borderRadius: "50%", background: "white",
        filter: `blur(${blur}px)`, opacity, flexShrink: 0, marginLeft: ml,
      }}
    />
  );
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",      active: true  },
  { icon: FileText,        label: "Mes documents",  active: false },
  { icon: LucideImage,     label: "Mes photos",     active: false },
  { icon: Folder,          label: "Mes dossiers",   active: false },
  { icon: Search,          label: "Recherche",      active: false },
  { icon: FileUp,          label: "Demandes",       active: false },
  { icon: ArrowLeftRight,  label: "Triage",         active: false },
  { icon: Bot,             label: "DocuBot",        active: false },
];

const BOTTOM_NAV = [
  { icon: CreditCard, label: "Abonnement"  },
  { icon: Settings,   label: "Paramètres"  },
  { icon: LogOut,     label: "Déconnexion" },
];

const STAT_CARDS = [
  { label: "Documents", value: "23",     color: "from-blue-500 to-blue-600",     tint: "text-blue-100",    icon: FileText  },
  { label: "Dossiers",  value: "8",      color: "from-violet-500 to-purple-600", tint: "text-violet-100",  icon: Folder    },
  { label: "Stockage",  value: "2.4 Go", color: "from-emerald-500 to-teal-600",  tint: "text-emerald-100", icon: HardDrive },
  { label: "Plan",      value: "FREE",   color: "from-amber-500 to-orange-600",  tint: "text-amber-100",   icon: Crown     },
];

const RECENT_DOCS = [
  { name: "Contrat de bail 2024.pdf",   size: "2.1 Mo", time: "il y a 2h" },
  { name: "Facture EDF Mars.pdf",       size: "845 Ko", time: "il y a 5h" },
  { name: "Rapport médical annuel.pdf", size: "3.2 Mo", time: "il y a 1j" },
  { name: "Assurance habitation.pdf",   size: "1.1 Mo", time: "il y a 2j" },
];

function DashboardMockup() {
  return (
    <div className="flex h-full w-full bg-neutral-100/60 text-[10px] leading-none select-none">

      {/* ── Sidebar ── */}
      <aside className="flex w-[17%] flex-shrink-0 flex-col border-r border-black/5 bg-white/80">

        {/* Logo */}
        <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-black/5 px-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <Image src="/logo.png" alt="" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-[11px] font-semibold text-gray-900">DocuSafe</span>
        </div>

        {/* Upload button */}
        <div className="px-2 pt-2">
          <div className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-1.5 shadow-sm">
            <Upload className="h-2.5 w-2.5 text-white" />
            <span className="text-[9px] font-semibold text-white">Ajouter un document</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-hidden px-1.5 py-2">
          <p className="mb-1 px-1.5 text-[7px] font-semibold uppercase tracking-widest text-neutral-400">Menu</p>
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`mb-px flex items-center gap-1.5 rounded-lg px-1.5 py-[4px] ${
                active ? "bg-blue-50 text-blue-600" : "text-neutral-600"
              }`}
            >
              <Icon className={`h-3 w-3 shrink-0 ${active ? "text-blue-500" : ""}`} />
              <span className={`truncate ${active ? "font-semibold" : ""}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="shrink-0 border-t border-black/5 px-1.5 py-1.5">
          {BOTTOM_NAV.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 rounded-lg px-1.5 py-[4px] text-neutral-600">
              <Icon className="h-3 w-3 shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-black/5 bg-white/70 px-4">
          <div>
            <p className="text-[11px] font-semibold text-gray-900">Bonjour 👋</p>
            <p className="mt-0.5 text-[9px] text-neutral-400">Gérez facilement vos documents</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100">
              <Bell className="h-3 w-3 text-neutral-600" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-neutral-100/80 px-2 py-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-[7px] font-bold text-white">
                U
              </div>
              <span className="text-neutral-700">Utilisateur</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2 overflow-hidden p-2.5">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2">
            {STAT_CARDS.map(({ label, value, color, tint, icon: Icon }) => (
              <div
                key={label}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-3 shadow-md`}
              >
                <div className="pointer-events-none absolute -right-3 -top-3 h-12 w-12 rounded-full bg-white/10" />
                <div className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-xl bg-white/20">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-[17px] font-bold leading-none text-white">{value}</p>
                <p className={`mt-0.5 text-[8px] ${tint}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* DocuBot banner */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 shadow-md shadow-blue-500/20">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-white">DocuBot</span>
                <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[7px] font-semibold text-white">
                  <Sparkles className="h-2 w-2" /> IA
                </span>
              </div>
              <p className="text-[9px] text-blue-100">Ton assistant intelligent pour vos documents</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/70" />
          </div>

          {/* Recent documents */}
          <div className="rounded-2xl bg-white p-2.5 shadow-sm">
            <div className="mb-2 flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-[11px] font-semibold text-gray-900">Documents récents</span>
              <span className="ml-auto flex items-center gap-0.5 text-[9px] text-blue-500">
                Voir tout <ArrowUpRight className="h-2.5 w-2.5" />
              </span>
            </div>
            <div className="space-y-1">
              {RECENT_DOCS.map((doc) => (
                <div key={doc.name} className="flex items-center gap-2 rounded-xl bg-neutral-50 px-2.5 py-1.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-gray-900">{doc.name}</p>
                    <p className="text-[8px] text-neutral-400">{doc.size} · {doc.time}</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-100">
                      <Eye className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-neutral-100">
                      <Download className="h-2.5 w-2.5 text-neutral-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────
const STATS = [
  "10 000+ documents analysés",
  "Chiffrement bout en bout",
  "3 plans",
  "0 document perdu",
];

// ─── Hero Section ─────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-0 pt-16 text-center">

      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0c3d78 0%, #1260b8 18%, #2b82d0 42%, #5aaae6 68%, #a8d6f2 85%, #e4f3fb 100%)",
        }}
      />

      {/* Sun glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -120, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 560,
          background: "radial-gradient(ellipse at center top, rgba(255,245,160,0.38) 0%, rgba(255,210,80,0.14) 38%, transparent 68%)",
          borderRadius: "50%",
        }}
      />

      {/* Sky pulse */}
      <div
        className="hero-sky-pulse pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.18) 0%, transparent 58%)" }}
      />

      {/* Cloud A */}
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

      {/* Cloud B */}
      <div className="hero-cloud-b pointer-events-none absolute left-0" style={{ top: "45%" }}>
        <div className="scale-[0.52] origin-left md:scale-100">
          <div className="hero-float-fast" style={{ display: "flex", alignItems: "flex-end" }}>
            <Puff w={92}  h={60}  blur={20} opacity={0.60} />
            <Puff w={148} h={96}  blur={16} opacity={0.70} ml={-40} />
            <Puff w={105} h={68}  blur={20} opacity={0.60} ml={-52} />
          </div>
        </div>
      </div>

      {/* Cloud C */}
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

      {/* Cloud D */}
      <div className="hero-cloud-d pointer-events-none absolute right-0" style={{ top: "55%" }}>
        <div className="scale-[0.52] origin-right md:scale-100">
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Puff w={76}  h={46}  blur={22} opacity={0.42} />
            <Puff w={108} h={66}  blur={18} opacity={0.50} ml={-26} />
            <Puff w={76}  h={46}  blur={22} opacity={0.42} ml={-36} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center mx-auto">

        {/* Title */}
        <h1
          className="hero-anim-title mb-4 max-w-2xl text-[2rem] text-white sm:text-[2.5rem] md:text-[3rem] lg:text-[3.6rem]"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
            fontWeight: 800,
            letterSpacing: "-0.038em",
            lineHeight: 1.06,
            textShadow: "0 2px 32px rgba(0,0,0,0.22)",
          }}
        >
          Vos documents.<br />
          <span style={{ opacity: 0.88 }}>Triés et retrouvés</span><br />
          en quelques secondes.
        </h1>

        {/* Subtitle */}
        <p
          className="hero-anim-sub mb-8 max-w-lg text-base md:text-lg"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            fontWeight: 500,
            color: "rgba(255,255,255,0.80)",
            textShadow: "0 1px 8px rgba(0,0,0,0.14)",
            lineHeight: 1.6,
          }}
        >
          DocuSafe analyse, classe et protège tous vos documents — avec une IA qui comprend vraiment ce qu&apos;elle stocke.
        </p>

        {/* CTAs */}
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
        <div className="mt-12 w-full max-w-5xl">
          <div className="relative">
            {/* Lueur blanche sur les bords */}
            <div
              className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
              style={{ boxShadow: "inset 0 0 32px 6px rgba(255,255,255,0.14), 0 0 60px 16px rgba(255,255,255,0.08)" }}
            />
            {/* Mockup container — même ratio que le screenshot original 1903×1043 */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "1903/1043",
                boxShadow: "0 32px 80px rgba(0,0,0,0.40), 0 8px 24px rgba(0,0,0,0.20)",
              }}
            >
              <DashboardMockup />
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-20 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-10">
            {STATS.map((s, i) => (
              <div key={i} className="flex items-center gap-5">
                <span
                  className="text-[15px] font-semibold"
                  style={{ color: "rgba(255,255,255,0.95)", textShadow: "0 1px 6px rgba(0,0,0,0.30)" }}
                >{s}</span>
                {i < STATS.length - 1 && (
                  <span className="select-none text-white/40">·</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Horizon fog */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/80 to-transparent" />

      {/* Rolling hills */}
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
