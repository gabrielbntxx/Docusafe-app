import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Building2, Shield, Users, Zap,
  Lock, BarChart3, Clock, TrendingUp, Layers, ArrowRight,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { IntegrationsShowcase } from "@/components/landing/integrations-showcase";
import { WhyShowcase } from "@/components/landing/why-showcase";
import { EaseShowcase } from "@/components/landing/ease-showcase";


// ─── 4 "Why enterprise" cards ─────────────────────────────────────────────────
const WHY_CARDS = [
  {
    icon: Clock,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Retrouvez tout en secondes",
    desc: "L'IA classe et indexe chaque document. Vos équipes ne perdent plus de temps à chercher.",
  },
  {
    icon: Shield,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Sécurité niveau bancaire",
    desc: "Chiffrement AES-256, 2FA, RGPD natif et journaux d'audit pour chaque action.",
  },
  {
    icon: TrendingUp,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Productivité multipliée",
    desc: "Générez des contrats, devis et rapports en quelques secondes grâce à l'IA métier.",
  },
  {
    icon: Layers,
    color: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "Un seul espace centralisé",
    desc: "Tous vos documents, toutes vos équipes, dans un hub unique accessible partout.",
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Collaboration d'équipe",
    desc: "Partagez, annotez et co-éditez vos documents en temps réel avec tous vos collaborateurs.",
  },
  {
    icon: Shield,
    color: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "Sécurité enterprise",
    desc: "SSO, 2FA, journaux d'audit complets et conformité RGPD incluse dès le premier jour.",
  },
  {
    icon: Zap,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "IA adaptée à votre secteur",
    desc: "DocuBot comprend le contexte de votre métier et génère des documents sur-mesure.",
  },
  {
    icon: BarChart3,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Tableau de bord centralisé",
    desc: "Visualisez l'activité documentaire, les accès et les modifications en un coup d'œil.",
  },
  {
    icon: Lock,
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    title: "Contrôle des accès",
    desc: "Permissions granulaires par rôle, département ou projet. Vos données restent sous votre contrôle.",
  },
  {
    icon: Building2,
    color: "bg-sky-50",
    iconColor: "text-sky-600",
    title: "Déploiement sur mesure",
    desc: "Onboarding dédié, intégrations personnalisées et support prioritaire 7j/7.",
  },
];

// ─── Puff — nuage blanc/gris ──────────────────────────────────────────────────
function Puff({ w, h, blur, opacity, ml = 0 }: {
  w: number; h: number; blur: number; opacity: number; ml?: number;
}) {
  return (
    <div
      style={{
        width: w, height: h, borderRadius: "50%",
        background: "white",
        filter: `blur(${blur}px)`, opacity, flexShrink: 0, marginLeft: ml,
      }}
    />
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function EntreprisePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* ── Hero — ciel gris blanc ── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pb-0 pt-24 text-center">

        {/* Sky gradient — anthracite haut → gris moyen → blanc bas */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #9ba5af 0%, #b8c2cb 18%, #cdd4da 38%, #dde2e7 58%, #eceff2 76%, #f7f8f9 90%, #ffffff 100%)",
          }}
        />

        {/* Lueur douce derrière le titre */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "6%", left: "50%", transform: "translateX(-50%)",
            width: 900, height: 500,
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* Nuage gauche */}
        <div className="hero-cloud-a pointer-events-none absolute left-0" style={{ top: "14%" }}>
          <div className="scale-[0.52] origin-left md:scale-100">
            <div className="hero-float-slow" style={{ display: "flex", alignItems: "flex-end" }}>
              <Puff w={148} h={98}  blur={20} opacity={0.72} />
              <Puff w={230} h={152} blur={16} opacity={0.82} ml={-80} />
              <Puff w={162} h={110} blur={18} opacity={0.76} ml={-90} />
            </div>
          </div>
        </div>

        {/* Nuage gauche bas */}
        <div className="pointer-events-none absolute left-0" style={{ top: "44%" }}>
          <div className="scale-[0.40] origin-left md:scale-75">
            <div className="hero-float-med" style={{ display: "flex", alignItems: "flex-end" }}>
              <Puff w={120} h={78}  blur={18} opacity={0.55} />
              <Puff w={180} h={120} blur={14} opacity={0.62} ml={-60} />
            </div>
          </div>
        </div>

        {/* Nuage droit */}
        <div className="hero-cloud-c pointer-events-none absolute right-0" style={{ top: "18%" }}>
          <div className="scale-[0.52] origin-right md:scale-100">
            <div className="hero-float-med" style={{ display: "flex", alignItems: "flex-end" }}>
              <Puff w={112} h={74}  blur={18} opacity={0.65} />
              <Puff w={192} h={130} blur={14} opacity={0.78} ml={-60} />
              <Puff w={132} h={88}  blur={16} opacity={0.70} ml={-72} />
            </div>
          </div>
        </div>

        {/* Nuage droit bas */}
        <div className="pointer-events-none absolute right-0" style={{ top: "50%" }}>
          <div className="scale-[0.38] origin-right md:scale-[0.65]">
            <div className="hero-float-slow" style={{ display: "flex", alignItems: "flex-end" }}>
              <Puff w={100} h={64}  blur={16} opacity={0.50} />
              <Puff w={160} h={108} blur={12} opacity={0.58} ml={-50} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">

          {/* Label pill */}
          <div className="hero-anim-title mb-6 inline-flex items-center gap-2 rounded-full border border-gray-400/40 bg-white/55 px-4 py-2 backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">
              DocuSafe pour les entreprises
            </span>
          </div>

          {/* Main title */}
          <h1
            className="hero-anim-sub mb-6 max-w-3xl text-[2.2rem] text-gray-900 sm:text-[2.8rem] md:text-[3.6rem] lg:text-[4.2rem]"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
              fontWeight: 800,
              letterSpacing: "-0.038em",
              lineHeight: 1.06,
            }}
          >
            Les documents<br />
            <span style={{ color: "rgba(30,30,30,0.65)" }}>et les connaissances</span><br />
            connectés.
          </h1>

          {/* Description */}
          <p
            className="hero-anim-cta mb-10 max-w-xl text-base md:text-lg"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
              fontWeight: 400,
              color: "rgba(30,30,30,0.52)",
              lineHeight: 1.7,
            }}
          >
            Un seul espace pour gérer vos documents sécurisés, avec l&apos;IA qui permet aux équipes d&apos;entreprise de mieux collaborer et de créer plus rapidement ensemble.
          </p>

          {/* CTA */}
          <div style={{ animation: "hero-fade-up 0.85s cubic-bezier(0.22,1,0.36,1) 0.58s both" }}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-[15px] font-semibold text-white shadow-[0_4px_28px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-[0_8px_36px_rgba(0,0,0,0.22)]"
            >
              Demander Business
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>

        {/* Vagues de transition ciel → blanc */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,100 C260,68 520,136 780,104 C1040,72 1220,128 1440,108 L1440,160 L0,160 Z" fill="white" fillOpacity="0.28" />
          <path d="M0,118 C380,90 760,142 1140,120 C1300,110 1390,128 1440,130 L1440,160 L0,160 Z" fill="white" fillOpacity="0.55" />
          <path d="M0,134 C500,118 1000,148 1440,136 L1440,160 L0,160 Z" fill="white" fillOpacity="0.80" />
          <path d="M0,148 C480,138 960,156 1440,144 L1440,160 L0,160 Z" fill="white" />
        </svg>
      </section>

      {/* ── 4 visual cards + rectangle interactif ── */}
      <WhyShowcase />

      {/* ── Integrations interactive showcase ── */}
      <IntegrationsShowcase />

      {/* ── Features — grand rectangle ── */}
      <section className="bg-white px-4 pt-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">

            {/* Header */}
            <div className="border-b border-gray-100 p-8 md:p-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Fonctionnalités</p>
              <h2
                className="max-w-xl text-2xl font-extrabold text-gray-900 md:text-3xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Tout ce dont votre équipe a besoin, sans compromis.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
                DocuSafe Business centralise vos flux documentaires et les amplifie avec l&apos;intelligence artificielle.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, color, iconColor, title, desc }) => (
                <div key={title} className="bg-white p-6 transition-colors hover:bg-gray-50/60 md:p-8">
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-gray-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Ease of use ── */}
      <EaseShowcase />

      {/* ── Final CTA ── */}
      <section className="bg-white py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md mb-6">
            <Image src="/logo.png" alt="DocuSafe" width={56} height={56} className="object-contain" />
          </div>
          <h2
            className="mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Prêt à équiper votre équipe ?
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-gray-500">
            Démarrez votre essai Business dès aujourd&apos;hui. Onboarding dédié, migration de vos données incluse et support prioritaire dès le premier jour.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md"
            >
              Demander Business
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-gray-200 px-8 py-4 text-[15px] font-semibold text-gray-600 transition-all hover:bg-gray-50"
            >
              Se connecter
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">Sans carte bancaire · Déploiement en 24h · Résiliation à tout moment</p>
        </div>
      </section>

      {/* ── Footer minimal ── */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} DocuSafe · Tous droits réservés
      </footer>

    </div>
  );
}
