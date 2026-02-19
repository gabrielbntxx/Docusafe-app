import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/20 backdrop-blur-sm shadow-md ring-1 ring-white/30">
              <Image src="/logo.png" alt="DocuSafe" width={36} height={36} className="object-contain" />
            </div>
            <span className="text-lg font-bold text-white drop-shadow-sm">DocuSafe</span>
          </Link>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white md:block"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm ring-1 ring-white/30 transition-all hover:bg-white/30"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 bg-white py-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <Image src="/logo.png" alt="DocuSafe" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-bold text-gray-900">DocuSafe</span>
            </Link>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="https://www.docusafe.online/privacy" className="text-gray-500 transition-colors hover:text-gray-900">
                Confidentialité
              </a>
              <a href="https://www.docusafe.online/terms" className="text-gray-500 transition-colors hover:text-gray-900">
                CGU
              </a>
            </div>

            <p className="text-sm text-gray-400">© 2025 DocuSafe. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
