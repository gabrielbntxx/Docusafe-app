import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sécurité & Confidentialité",
  description:
    "Chiffrement AES-256 de bout en bout, accès protégé par PIN, gouvernance IA transparente et infrastructure fiable. Découvrez comment DocuSafe protège chaque document.",
  openGraph: {
    title: "Sécurité & Confidentialité — DocuSafe",
    description: "Vos documents chiffrés, vos accès contrôlés. Découvrez les garanties de sécurité DocuSafe.",
    url: "https://docusafe.fr/securite",
  },
};
import {
  Shield, Server, Settings, ShieldCheck,
  Lock, Database, FileText, Layers, ScrollText, Globe,
  Bot, Eye, SlidersHorizontal, BadgeCheck,
  Activity, Cloud, RefreshCw, Radio,
  ArrowUpRight,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "securite",
    icon: Shield,
    title: "Sécurité",
    items: [
      {
        icon: Server,
        title: "Infrastructure de sécurité",
        desc: "Hébergée sur AWS, notre infrastructure chiffre vos données en AES-256 au repos et en TLS 1.3 en transit. Les données sont isolées par compte et répliquées dans plusieurs zones de disponibilité.",
      },
      {
        icon: Settings,
        title: "Sécurité opérationnelle",
        desc: "Nos équipes suivent des procédures strictes : accès en moindre privilège, authentification multi-facteurs obligatoire et journalisation complète de toutes les opérations sensibles.",
      },
      {
        icon: ShieldCheck,
        title: "Sécurité du produit",
        desc: "DocuSafe intègre nativement l'authentification deux facteurs, des dossiers protégés par code PIN, des liens de partage à durée limitée et un contrôle granulaire des permissions par rôle.",
      },
    ],
  },
  {
    id: "confidentialite",
    icon: Lock,
    title: "Confidentialité",
    items: [
      {
        icon: Database,
        title: "Traitement des données",
        desc: "Vos documents sont traités uniquement pour vous fournir le service. Aucune donnée n'est vendue ou partagée à des tiers à des fins commerciales.",
      },
      {
        icon: FileText,
        title: "Contrats",
        desc: "Tous nos clients professionnels bénéficient d'un Accord de Traitement des Données (DPA) conforme au RGPD, inclus dans les plans Business ou disponible sur demande.",
      },
      {
        icon: Layers,
        title: "Gouvernance des données",
        desc: "Vous restez propriétaire de vos données à tout moment. Exportez-les ou supprimez-les définitivement depuis votre tableau de bord, sans délai.",
      },
      {
        icon: ScrollText,
        title: "Politique de confidentialité",
        desc: "Notre politique est rédigée en langage clair, sans jargon juridique, pour que vous compreniez exactement comment vos données sont utilisées.",
      },
      {
        icon: Globe,
        title: "RGPD",
        desc: "DocuSafe est entièrement conforme au RGPD. Nos serveurs sont hébergés en Europe et nous respectons scrupuleusement les droits des personnes concernées.",
      },
    ],
  },
  {
    id: "ia",
    icon: Bot,
    title: "Gouvernance de l'intelligence artificielle",
    items: [
      {
        icon: Eye,
        title: "Utilisation transparente",
        desc: "L'IA de DocuSafe est utilisée exclusivement pour améliorer votre expérience : classification automatique, analyses et réponses DocuBot. Aucune donnée n'entraîne des modèles tiers.",
      },
      {
        icon: SlidersHorizontal,
        title: "Contrôle utilisateur",
        desc: "Vous gardez le contrôle total sur l'utilisation des fonctionnalités IA. Les analyses automatiques peuvent être désactivées à tout moment depuis vos paramètres.",
      },
      {
        icon: BadgeCheck,
        title: "Modèles certifiés",
        desc: "Nous travaillons uniquement avec des fournisseurs IA certifiés SOC 2, dont les infrastructures sont hébergées en Europe ou offrent des garanties contractuelles équivalentes.",
      },
    ],
  },
  {
    id: "fiabilite",
    icon: Activity,
    title: "Fiabilité",
    items: [
      {
        icon: Cloud,
        title: "Infrastructure pensée pour l'entreprise",
        desc: "En partenariat avec AWS et Cloudflare, nous développons une architecture de très haut niveau pour donner à tous les utilisateurs DocuSafe les moyens d'un service stable et performant.",
      },
      {
        icon: RefreshCw,
        title: "Haute disponibilité et basculement",
        desc: "DocuSafe assure la sécurité de vos données grâce à un programme de sauvegarde complet sur plusieurs zones de redondance et un plan de reprise après sinistre régulièrement testé. Taux de disponibilité garanti : 99,9 %.",
      },
      {
        icon: Radio,
        title: "État du service",
        desc: "Consultez en temps réel l'état de nos services, les incidents en cours et l'historique de disponibilité sur notre page de statut dédiée.",
        link: { label: "Voir le statut", href: "#" },
      },
    ],
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SecuritePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader solid />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center px-4">
        <h1
          className="text-4xl font-extrabold text-gray-900 md:text-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          Sécurité et confidentialité
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-400">
          Votre sécurité et la confidentialité de vos données sont notre priorité absolue,
          et nous développons DocuSafe en conséquence.
        </p>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="h-px bg-gray-100" />
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-20">
        {SECTIONS.map((section) => (
          <div key={section.id}>
            {/* Section header */}
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                <section.icon className="h-6 w-6 text-gray-700" />
              </div>
              <h2
                className="text-2xl font-extrabold text-gray-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                {section.title}
              </h2>
            </div>

            {/* Items grid */}
            <div
              className={`grid gap-4 ${
                section.items.length === 5
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : section.items.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {section.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200 shadow-sm">
                    <item.icon className="h-4 w-4 text-gray-600" strokeWidth={1.8} />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
                  {"link" in item && item.link && (
                    <Link
                      href={item.link.href}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {item.link.label}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer strip */}
      <div className="border-t border-gray-100 py-10 text-center">
        <p className="text-sm text-gray-400">
          Des questions sur notre approche sécurité ?{" "}
          <Link href="/contact" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            Contactez notre équipe
          </Link>
        </p>
      </div>
    </div>
  );
}
