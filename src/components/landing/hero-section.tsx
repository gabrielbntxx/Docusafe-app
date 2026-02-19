"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes driftA {
          0%   { transform: translateX(-50vw); }
          100% { transform: translateX(115vw); }
        }
        @keyframes driftB {
          0%   { transform: translateX(115vw); }
          100% { transform: translateX(-50vw); }
        }
        .anim-title { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .anim-sub   { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .anim-cta   { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.48s both; }
        .cloud-a    { animation: driftA  80s linear   0s infinite; }
        .cloud-b    { animation: driftA 115s linear  28s infinite; }
        .cloud-c    { animation: driftB  92s linear  14s infinite; }
        .cloud-d    { animation: driftB 130s linear  55s infinite; }
      `}</style>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24 text-center">

        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1565c0] via-[#3d8fd9] to-[#b8dcf5]" />
        {/* Horizon mist */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/50 to-transparent" />

        {/* ── Cloud A — large, slow, left→right ── */}
        <svg
          className="cloud-a pointer-events-none absolute top-[10%] left-0"
          style={{ filter: "blur(3px)" }}
          width="580" height="170" viewBox="0 0 580 170"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.90"
            d="
              M 0,148
              C 0,116 28,92 68,92
              C 68,56 100,28 148,28
              C 170,8 214,0 244,26
              C 270,6 318,10 340,42
              C 374,22 418,36 424,70
              C 460,62 500,82 498,114
              C 496,140 470,156 438,152
              Z
            "
          />
        </svg>

        {/* ── Cloud B — small wispy, left→right slower ── */}
        <svg
          className="cloud-b pointer-events-none absolute top-[58%] left-0"
          style={{ filter: "blur(2px)" }}
          width="300" height="95" viewBox="0 0 300 95"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.68"
            d="
              M 0,82
              C 0,62 18,48 44,48
              C 44,26 68,8 100,8
              C 118,0 148,0 162,20
              C 184,6 216,12 224,36
              C 252,26 278,44 274,66
              C 270,84 250,94 222,90
              Z
            "
          />
        </svg>

        {/* ── Cloud C — medium, right→left ── */}
        <svg
          className="cloud-c pointer-events-none absolute top-[26%] right-0"
          style={{ filter: "blur(2.5px)" }}
          width="460" height="138" viewBox="0 0 460 138"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.82"
            d="
              M 0,118
              C 0,88 22,68 58,68
              C 58,40 86,16 128,16
              C 150,2 192,0 216,24
              C 242,4 284,10 300,40
              C 336,22 378,38 382,68
              C 416,60 450,80 446,108
              C 442,130 416,142 384,136
              Z
            "
          />
        </svg>

        {/* ── Cloud D — tiny, background depth, right→left very slow ── */}
        <svg
          className="cloud-d pointer-events-none absolute top-[72%] right-0"
          style={{ filter: "blur(1.5px)" }}
          width="210" height="72" viewBox="0 0 210 72"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.52"
            d="
              M 0,62
              C 0,46 14,36 34,36
              C 34,18 54,4 78,4
              C 92,0 116,2 124,18
              C 140,6 164,12 168,32
              C 186,24 204,36 200,52
              C 196,64 182,70 160,68
              Z
            "
          />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Title — Apple SF Pro style */}
          <h1
            className="anim-title mb-5 text-[5.5rem] text-white md:text-[9rem]"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif',
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1,
              textShadow: "0 2px 28px rgba(0,0,0,0.22)",
            }}
          >
            DocuSafe
          </h1>

          {/* Subtitle */}
          <p
            className="anim-sub mb-10 max-w-xs text-lg text-white/80 md:max-w-sm md:text-xl"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Helvetica Neue", sans-serif',
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Vos documents. Sécurisés. Partout.
          </p>

          {/* CTAs */}
          <div className="anim-cta flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-blue-600 shadow-[0_4px_24px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.26)]"
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-35">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>
    </>
  );
}
