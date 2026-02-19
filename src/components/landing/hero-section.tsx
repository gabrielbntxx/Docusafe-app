"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes driftA {
          0%   { transform: translateX(-40vw); }
          100% { transform: translateX(110vw); }
        }
        @keyframes driftB {
          0%   { transform: translateX(110vw); }
          100% { transform: translateX(-40vw); }
        }
        .anim-title { animation: fadeUp 0.75s ease 0.2s both; }
        .anim-sub   { animation: fadeUp 0.75s ease 0.38s both; }
        .anim-cta   { animation: fadeUp 0.75s ease 0.54s both; }
        .cloud-a    { animation: driftA 75s linear 0s   infinite; }
        .cloud-b    { animation: driftA 100s linear 25s  infinite; }
        .cloud-c    { animation: driftB 88s linear 12s  infinite; }
        .cloud-d    { animation: driftB 120s linear 40s  infinite; }
      `}</style>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24 text-center">

        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a6fc4] via-[#4e9de0] to-[#c2e4f7]" />
        {/* Horizon softness */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white/55 to-transparent" />

        {/* Cloud A — large, drifts left→right */}
        <svg
          className="cloud-a pointer-events-none absolute top-[12%] left-0"
          width="500" height="145" viewBox="0 0 500 145"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.93"
            d="M0,122 C0,97 20,80 50,80 C50,54 75,34 108,34
               C121,16 152,9 173,24 C189,11 220,8 238,26
               C256,11 292,13 306,34 C334,22 365,32 370,56
               C400,50 430,67 428,92 C426,114 406,128 378,128 Z"
          />
        </svg>

        {/* Cloud B — small wispy, drifts left→right slower */}
        <svg
          className="cloud-b pointer-events-none absolute top-[55%] left-0"
          width="260" height="85" viewBox="0 0 260 85"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.72"
            d="M0,72 C0,54 14,42 36,42 C36,24 56,10 80,10
               C94,2 118,2 128,18 C146,8 170,12 176,30
               C198,24 216,38 212,56 C208,72 192,80 168,80 Z"
          />
        </svg>

        {/* Cloud C — medium, drifts right→left */}
        <svg
          className="cloud-c pointer-events-none absolute top-[28%] right-0"
          width="420" height="120" viewBox="0 0 420 120"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.82"
            d="M0,100 C0,78 16,62 44,62 C44,38 68,20 100,20
               C115,6 146,2 164,18 C182,4 214,8 226,28
               C252,16 284,24 290,48 C318,40 348,56 344,80
               C340,102 318,114 288,110 Z"
          />
        </svg>

        {/* Cloud D — thin background cloud, drifts right→left very slowly */}
        <svg
          className="cloud-d pointer-events-none absolute top-[68%] right-0"
          width="200" height="65" viewBox="0 0 200 65"
          fill="none" aria-hidden="true"
        >
          <path
            fill="white" fillOpacity="0.55"
            d="M0,56 C0,42 10,32 26,32 C26,18 40,6 58,6
               C68,0 86,0 94,12 C106,4 126,8 130,22
               C148,16 164,28 160,46 C156,60 144,66 126,64 Z"
          />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Title */}
          <h1
            className="anim-title mb-5 text-7xl font-bold tracking-tight text-white md:text-[8.5rem]"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.20)" }}
          >
            DocuSafe
          </h1>

          {/* Subtitle */}
          <p className="anim-sub mb-10 max-w-xs text-lg font-medium text-white/85 md:max-w-sm md:text-xl">
            Vos documents. Sécurisés. Partout.
          </p>

          {/* CTAs */}
          <div className="anim-cta flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-blue-600 shadow-[0_4px_22px_rgba(0,0,0,0.20)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.24)]"
            >
              Commencer gratuitement
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/50 bg-white/15 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>
    </>
  );
}
