"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24 text-center">

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
        <div className="hero-float-slow" style={{ display: "flex", alignItems: "flex-end" }}>
          <Puff w={148} h={98}  blur={18} opacity={0.80} />
          <Puff w={224} h={152} blur={13} opacity={0.96} ml={-80} />
          <Puff w={182} h={120} blur={15} opacity={0.88} ml={-92} />
          <Puff w={130} h={88}  blur={20} opacity={0.74} ml={-56} />
          <Puff w={200} h={132} blur={13} opacity={0.90} ml={-88} />
        </div>
      </div>

      {/* ══ CLOUD B — small, left→right slower, floats fast ══ */}
      <div className="hero-cloud-b pointer-events-none absolute left-0" style={{ top: "59%" }}>
        <div className="hero-float-fast" style={{ display: "flex", alignItems: "flex-end" }}>
          <Puff w={92}  h={60}  blur={20} opacity={0.60} />
          <Puff w={148} h={96}  blur={16} opacity={0.70} ml={-40} />
          <Puff w={105} h={68}  blur={20} opacity={0.60} ml={-52} />
        </div>
      </div>

      {/* ══ CLOUD C — medium, right→left, floats med ══ */}
      <div className="hero-cloud-c pointer-events-none absolute right-0" style={{ top: "19%" }}>
        <div className="hero-float-med" style={{ display: "flex", alignItems: "flex-end" }}>
          <Puff w={115} h={76}  blur={18} opacity={0.70} />
          <Puff w={190} h={130} blur={13} opacity={0.88} ml={-60} />
          <Puff w={155} h={104} blur={16} opacity={0.80} ml={-80} />
          <Puff w={96}  h={64}  blur={20} opacity={0.66} ml={-42} />
        </div>
      </div>

      {/* ══ CLOUD D — tiny, right→left very slow, background depth ══ */}
      <div className="hero-cloud-d pointer-events-none absolute right-0" style={{ top: "69%" }}>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <Puff w={76}  h={46}  blur={22} opacity={0.42} />
          <Puff w={108} h={66}  blur={18} opacity={0.50} ml={-26} />
          <Puff w={76}  h={46}  blur={22} opacity={0.42} ml={-36} />
        </div>
      </div>

      {/* ── Horizon fog ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-white/55 to-transparent" />

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

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center">

        <h1
          className="hero-anim-title mb-5 text-[5rem] text-white md:text-[8.5rem]"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
            fontWeight: 800,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            textShadow: "0 2px 32px rgba(0,0,0,0.24)",
          }}
        >
          DocuSafe
        </h1>

        <p
          className="hero-anim-sub mb-10 max-w-xs text-lg text-white/82 md:max-w-sm md:text-xl"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Vos documents. Sécurisés. Partout.
        </p>

        <div className="hero-anim-cta flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-blue-700 shadow-[0_4px_28px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_36px_rgba(0,0,0,0.28)]"
          >
            Commencer gratuitement
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/40 bg-white/12 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/22"
          >
            Se connecter
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 opacity-40">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
