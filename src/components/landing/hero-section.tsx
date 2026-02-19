"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes heroScale {
          from { opacity: 0; transform: scale(0.72) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px);  }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0px);  }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-10px); }
        }
        @keyframes cloudDrift {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(120vw); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0) translateX(-50%); opacity: .5; }
          50%       { transform: translateY(6px) translateX(-50%); opacity: 1; }
        }

        .hero-logo  { animation: heroScale 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.15s both; }
        .hero-title { animation: heroFadeUp 0.85s ease 0.38s both; }
        .hero-sub   { animation: heroFadeUp 0.85s ease 0.58s both; }
        .hero-badge { animation: heroFadeUp 0.85s ease 0.1s  both; }
        .hero-cta   { animation: heroFadeUp 0.85s ease 0.78s both; }
        .logo-float { animation: heroFloat 5.5s ease-in-out 1.2s infinite; }

        .cloud { position: absolute; border-radius: 9999px; background: white; pointer-events: none; }
        .cloud-a { animation: cloudDrift 90s  linear 0s   infinite; }
        .cloud-b { animation: cloudDrift 120s linear 18s  infinite; }
        .cloud-c { animation: cloudDrift 75s  linear 36s  infinite; }
        .cloud-d { animation: cloudDrift 105s linear 55s  infinite; }

        .scroll-hint { animation: scrollBounce 2s ease-in-out infinite; }
      `}</style>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-32 pt-24 text-center">

        {/* ── Sky gradient ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d3d8c] via-[#1460c8] via-45% to-[#7ec8e8]" />

        {/* Sun glow */}
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-white/10 blur-[100px]" />

        {/* ── Clouds ── */}
        {/* back layer — large, very blurry */}
        <div className="cloud cloud-a" style={{ top: "22%", left: 0, height: 80, width: 520, opacity: 0.30, filter: "blur(36px)" }} />
        <div className="cloud cloud-b" style={{ top: "38%", left: 0, height: 60, width: 380, opacity: 0.25, filter: "blur(40px)" }} />

        {/* mid layer */}
        <div className="cloud cloud-c" style={{ top: "18%", left: 0, height: 44, width: 280, opacity: 0.45, filter: "blur(18px)" }} />
        <div className="cloud cloud-d" style={{ top: "50%", left: 0, height: 36, width: 220, opacity: 0.35, filter: "blur(22px)" }} />

        {/* Horizon fade to white */}
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-white via-[#cde9f7]/60 to-transparent" />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Badge */}
          <div className="hero-badge mb-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-5 py-2 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
              100 % Sécurisé · Hébergé en Europe
            </span>
          </div>

          {/* Logo */}
          <div className="hero-logo mb-7">
            <div className="logo-float mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[30px] border border-white/25 bg-white/18 shadow-[0_32px_64px_rgba(0,0,0,0.3)] backdrop-blur-2xl md:h-28 md:w-28">
              <Image
                src="/logo.png"
                alt="DocuSafe"
                width={72}
                height={72}
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="hero-title mb-5 bg-gradient-to-b from-white to-white/80 bg-clip-text text-7xl font-bold tracking-tight text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)] md:text-[7.5rem]">
            DocuSafe
          </h1>

          {/* Subtitle */}
          <p className="hero-sub mb-12 max-w-md text-lg text-white/70 leading-relaxed md:text-xl">
            Centralisez, protégez et retrouvez tous vos documents
            administratifs en quelques secondes.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-blue-700 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.30)]"
            >
              Commencer gratuitement
              <ChevronRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint absolute bottom-10 left-1/2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>
    </>
  );
}
