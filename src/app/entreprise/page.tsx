import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Building2, Shield, Users, Zap,
  Lock, BarChart3, Clock, TrendingUp, Layers, ArrowRight,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { IntegrationsShowcase } from "@/components/landing/integrations-showcase";
import { WhyShowcase } from "@/components/landing/why-showcase";


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

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function EntreprisePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* ── Hero — sombre institutionnel ── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pb-0 pt-24 text-center">

        {/* Dark background */}
        <div className="absolute inset-0" style={{ background: "#0a0a0a" }} />

        {/* Dot grid */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
          style={{ opacity: 0.22 }}
        >
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#666" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>

        {/* Concentric rings */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "50%", left: "50%", transform: "translate(-50%, -56%)",
            width: 600, height: 600, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            top: "50%", left: "50%", transform: "translate(-50%, -56%)",
            width: 900, height: 900, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            top: "50%", left: "50%", transform: "translate(-50%, -56%)",
            width: 1200, height: 1200, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.025)",
          }}
        />

        {/* Subtle radial glow behind title */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "8%", left: "50%", transform: "translateX(-50%)",
            width: 900, height: 500,
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.055) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* Thin accent lines — top corners */}
        <svg
          className="pointer-events-none absolute top-0 left-0 w-64 h-64"
          aria-hidden="true"
          style={{ opacity: 0.12 }}
        >
          <line x1="0" y1="0" x2="200" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="160" y2="200" stroke="white" strokeWidth="0.5" />
        </svg>
        <svg
          className="pointer-events-none absolute top-0 right-0 w-64 h-64"
          aria-hidden="true"
          style={{ opacity: 0.12 }}
        >
          <line x1="256" y1="0" x2="56" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="256" y1="40" x2="96" y2="200" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">

          {/* Label pill */}
          <div className="hero-anim-title mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-white/70" />
            <span className="text-sm font-semibold tracking-widest uppercase text-white/70">
              DocuSafe pour les entreprises
            </span>
          </div>

          {/* Main title */}
          <h1
            className="hero-anim-sub mb-6 max-w-3xl text-[2.2rem] text-white sm:text-[2.8rem] md:text-[3.6rem] lg:text-[4.2rem]"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
              fontWeight: 800,
              letterSpacing: "-0.038em",
              lineHeight: 1.06,
              textShadow: "0 2px 32px rgba(0,0,0,0.22)",
            }}
          >
            Les documents<br />
            <span style={{ opacity: 0.90 }}>et les connaissances</span><br />
            connectés.
          </h1>

          {/* Description */}
          <p
            className="hero-anim-cta mb-10 max-w-xl text-base md:text-lg"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
            }}
          >
            Un seul espace pour gérer vos documents sécurisés, avec l&apos;IA qui permet aux équipes d&apos;entreprise de mieux collaborer et de créer plus rapidement ensemble.
          </p>

          {/* CTA — single button */}
          <div style={{ animation: "hero-fade-up 0.85s cubic-bezier(0.22,1,0.36,1) 0.58s both" }}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-gray-900 shadow-[0_4px_28px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(0,0,0,0.28)]"
            >
              Demander Business
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>

        {/* Transition wave dark → white */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,100 C260,68 520,136 780,104 C1040,72 1220,128 1440,108 L1440,160 L0,160 Z" fill="white" fillOpacity="0.06" />
          <path d="M0,118 C380,90 760,142 1140,120 C1300,110 1390,128 1440,130 L1440,160 L0,160 Z" fill="white" fillOpacity="0.14" />
          <path d="M0,134 C500,118 1000,148 1440,136 L1440,160 L0,160 Z" fill="white" fillOpacity="0.45" />
          <path d="M0,148 C480,138 960,156 1440,144 L1440,160 L0,160 Z" fill="white" />
        </svg>
      </section>

      {/* ── 4 visual cards + rectangle interactif ── */}
      <WhyShowcase />

      {/* ── Integrations interactive showcase ── */}
      <IntegrationsShowcase />

      {/* ── Features — grand rectangle ── */}
      <section className="bg-gray-50 px-4 py-20">
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
