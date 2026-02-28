import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { AnalysisSection } from "@/components/landing/analysis-section";
import { DocubotSection } from "@/components/landing/docubot-section";
import { StorageSection } from "@/components/landing/storage-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FinalCta } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─── Header ─── */}
      <LandingHeader />

      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── IA Analysis ─── */}
      <AnalysisSection />

      {/* ─── DocuBot ─── */}
      <DocubotSection />

      {/* ─── Storage & Sécurité ─── */}
      <StorageSection />

      {/* ─── Témoignages ─── */}
      <TestimonialsSection />

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

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter,   href: "#", label: "X"         },
                { icon: Linkedin,  href: "#", label: "LinkedIn"  },
                { icon: Facebook,  href: "#", label: "Facebook"  },
                { icon: Youtube,   href: "#", label: "YouTube"   },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <p className="text-sm text-gray-400">© 2025 DocuSafe. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
