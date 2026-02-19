import Link from "next/link";
import Image from "next/image";
import {
  FolderOpen,
  Shield,
  Upload,
  Bell,
  Bot,
  ChevronRight,
  Lock,
  FileText,
  Zap,
  CheckCircle2,
} from "lucide-react";
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

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">Fonctionnalités</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
              Une solution complète pour gérer vos documents sans effort.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Upload,
                gradient: "from-blue-500 to-blue-600",
                title: "Upload rapide",
                desc: "Glissez-déposez vos fichiers ou prenez une photo directement depuis votre mobile. Tout est indexé automatiquement.",
              },
              {
                icon: FolderOpen,
                gradient: "from-violet-500 to-purple-600",
                title: "Organisation intelligente",
                desc: "Créez des dossiers personnalisés par thème. Retrouvez n'importe quel document en quelques secondes grâce à la recherche.",
              },
              {
                icon: Bell,
                gradient: "from-amber-500 to-orange-500",
                title: "Alertes & rappels",
                desc: "Recevez des notifications avant l'expiration de vos documents importants. Ne ratez plus jamais une échéance.",
              },
              {
                icon: Bot,
                gradient: "from-emerald-500 to-teal-600",
                title: "Assistant IA (DocuBot)",
                desc: "Posez des questions en langage naturel sur vos documents. DocuBot retrouve et résume l'information pour vous.",
              },
              {
                icon: FileText,
                gradient: "from-rose-500 to-pink-600",
                title: "Aperçu instantané",
                desc: "Consultez vos PDF et images directement dans l'application, sans télécharger. Rapide et sécurisé.",
              },
              {
                icon: Zap,
                gradient: "from-indigo-500 to-blue-600",
                title: "Partage sécurisé",
                desc: "Partagez des documents avec un lien temporaire chiffré. Vous contrôlez qui accède à quoi et pendant combien de temps.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient}`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Security ─── */}
      <section id="security" className="px-4 pb-24 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 p-10 text-center md:p-16">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Sécurité</p>
              <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
                Vos données vous appartiennent.
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300">
                Chaque fichier est chiffré de bout en bout avant d&apos;être stocké. Même nous n&apos;y avons pas accès.
                Hébergé en Europe, conforme RGPD.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: Lock, label: "Chiffrement AES-256" },
                  { icon: CheckCircle2, label: "RGPD compliant" },
                  { icon: Shield, label: "Hébergé en Europe" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 backdrop-blur-sm"
                  >
                    <badge.icon className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="px-4 pb-28 text-center md:px-6">
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
              <a href="#features" className="text-gray-500 transition-colors hover:text-gray-900">
                Fonctionnalités
              </a>
              <a href="#security" className="text-gray-500 transition-colors hover:text-gray-900">
                Sécurité
              </a>
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
