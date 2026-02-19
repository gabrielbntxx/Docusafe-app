import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
              <Image src="/logo.png" alt="DocuSafe" width={36} height={36} className="object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900">DocuSafe</span>
          </Link>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:block"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-700 hover:shadow-md"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── Final CTA ─── */}
      <section className="px-4 py-28 text-center md:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Prêt à passer à l&apos;action ?
          </h2>
          <p className="mb-10 text-xl text-gray-500">
            Créez votre compte gratuitement en moins d&apos;une minute. Aucune carte bancaire requise.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-blue-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-xl"
            >
              Créer mon compte gratuit
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm"
            >
              Me connecter
            </Link>
          </div>
        </div>
      </section>

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
