import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { FinalCta } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─── Header ─── */}
      <LandingHeader />

      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── Stats bar ─── */}
      <StatsBar />

      {/* ─── Final CTA ─── */}
      <FinalCta />

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 bg-white px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <Image src="/logo.png" alt="DocuSafe" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-bold text-gray-900">DocuSafe</span>
            </Link>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a
                href="https://www.docusafe.online/privacy"
                className="text-gray-500 transition-colors hover:text-gray-900"
              >
                Confidentialité
              </a>
              <a
                href="https://www.docusafe.online/terms"
                className="text-gray-500 transition-colors hover:text-gray-900"
              >
                CGU
              </a>
              <Link
                href="/dashboard/subscription"
                className="text-gray-500 transition-colors hover:text-gray-900"
              >
                Tarifs
              </Link>
            </div>

            <p className="text-sm text-gray-400">© 2025 DocuSafe. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
