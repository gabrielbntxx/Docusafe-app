"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1);   }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0);   }
          50%       { transform: translateY(-8px); }
        }
        @keyframes driftA {
          0%   { transform: translateX(-30vw); }
          100% { transform: translateX(110vw); }
        }
        @keyframes driftB {
          0%   { transform: translateX(110vw); }
          100% { transform: translateX(-30vw); }
        }
        .anim-logo  { animation: popIn  0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .anim-title { animation: fadeUp 0.7s ease 0.3s both; }
        .anim-sub   { animation: fadeUp 0.7s ease 0.48s both; }
        .anim-cta   { animation: fadeUp 0.7s ease 0.64s both; }
        .logo-float { animation: float 5s ease-in-out 1s infinite; }
        .cloud-a    { animation: driftA 70s linear 0s   infinite; }
        .cloud-b    { animation: driftA 95s linear 22s  infinite; }
        .cloud-c    { animation: driftB 85s linear 10s  infinite; }
      `}</style>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24 text-center">

        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3a8bd4] via-[#68aee8] to-[#b5d9f5]" />
        {/* Soft horizon glow */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/70 to-transparent" />

        {/* Clouds — clean SVG shapes */}
        <svg className="cloud-a absolute top-[18%] left-0 opacity-80" width="320" height="80" viewBox="0 0 320 80" fill="none">
          <ellipse cx="160" cy="55" rx="140" ry="25" fill="white"/>
          <ellipse cx="110" cy="45" rx="70" ry="30" fill="white"/>
          <ellipse cx="200" cy="42" rx="55" ry="26" fill="white"/>
          <ellipse cx="155" cy="38" rx="50" ry="24" fill="white"/>
        </svg>

        <svg className="cloud-b absolute top-[40%] left-0 opacity-60" width="220" height="60" viewBox="0 0 220 60" fill="none">
          <ellipse cx="110" cy="42" rx="95" ry="18" fill="white"/>
          <ellipse cx="80"  cy="34" rx="50" ry="22" fill="white"/>
          <ellipse cx="140" cy="32" rx="40" ry="20" fill="white"/>
        </svg>

        <svg className="cloud-c absolute top-[28%] right-0 opacity-70" width="260" height="70" viewBox="0 0 260 70" fill="none">
          <ellipse cx="130" cy="50" rx="115" ry="20" fill="white"/>
          <ellipse cx="90"  cy="40" rx="60" ry="28" fill="white"/>
          <ellipse cx="170" cy="38" rx="50" ry="24" fill="white"/>
          <ellipse cx="130" cy="34" rx="45" ry="22" fill="white"/>
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Logo */}
          <div className="anim-logo logo-float mb-8">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] md:h-28 md:w-28">
              <Image src="/logo.png" alt="DocuSafe" width={72} height={72} className="object-contain" />
            </div>
          </div>

          {/* Title */}
          <h1 className="anim-title mb-4 text-7xl font-bold tracking-tight text-white md:text-[8rem]"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.15)" }}>
            DocuSafe
          </h1>

          {/* Subtitle */}
          <p className="anim-sub mb-10 max-w-sm text-lg font-medium text-white/80 md:text-xl">
            Vos documents. Sécurisés. Partout.
          </p>

          {/* CTAs */}
          <div className="anim-cta flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-blue-600 shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)]"
            >
              Commencer gratuitement
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/50 bg-white/15 px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-white/25"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>
    </>
  );
}
