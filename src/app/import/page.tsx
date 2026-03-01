import Link from "next/link";
import {
  Mail, ArrowRight, Paperclip, HardDrive, Cloud,
  Zap, Check, FolderOpen, AtSign, RefreshCw, History,
  FileText, ChevronRight, Upload,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

// ─── Visuals ───────────────────────────────────────────────────────────────────

function EmailVisual() {
  return (
    <div className="space-y-3">
      {/* Incoming email */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
              <span className="text-[10px] font-bold text-violet-600">AC</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">comptabilite@acme.fr</p>
              <p className="text-[10px] text-gray-400">À vous · via Transféré</p>
            </div>
          </div>
          <span className="text-[10px] text-gray-300">08:42</span>
        </div>
        <p className="mb-2 text-xs font-semibold text-gray-700">Facture avril 2025</p>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
          <Paperclip className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
          <span className="flex-1 truncate text-[11px] text-gray-500">Facture_042025.pdf · 184 Ko</span>
        </div>
      </div>

      {/* Arrow + auto-processing */}
      <div className="flex items-center justify-center gap-3 py-1">
        <div className="h-px flex-1 bg-blue-100" />
        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 ring-1 ring-blue-100">
          <Zap className="h-3 w-3 text-blue-500" />
          <span className="text-[10px] font-semibold text-blue-600">Traitement automatique</span>
        </div>
        <div className="h-px flex-1 bg-blue-100" />
      </div>

      {/* DocuSafe result */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
            <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <span className="text-xs font-semibold text-gray-700">Factures / 2025</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 ring-1 ring-green-100">
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span className="text-[11px] text-green-700 font-medium">Facture_042025.pdf · Classé · Indexé</span>
        </div>
      </div>
    </div>
  );
}

function DriveVisual({ name, color }: { name: string; color: string }) {
  const files = [
    "Contrat_prestataire_2025.pdf",
    "Bilan_annuel_2024.xlsx",
    "Présentation_Q1.pptx",
    "Attestation_fiscale.pdf",
  ];
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Cloud className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">{name}</p>
          <p className="text-[10px] text-gray-400">4 fichiers sélectionnés</p>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 ring-1 ring-green-100">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] font-semibold text-green-600">Connecté</span>
        </div>
      </div>

      {/* File list */}
      <ul className="space-y-1.5">
        {files.map((f) => (
          <li key={f} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
            <FileText className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" />
            <span className="flex-1 truncate text-[11px] text-gray-500">{f}</span>
            <Check className="h-3 w-3 flex-shrink-0 text-blue-500" />
          </li>
        ))}
      </ul>

      {/* Import btn */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 justify-center">
        <Upload className="h-3.5 w-3.5 text-white" />
        <span className="text-xs font-bold text-white">Importer dans DocuSafe</span>
      </div>
    </div>
  );
}

function StatsVisual() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { value: "72%", label: "des documents importants arrivent par email", accent: "text-blue-400" },
        { value: "6×", label: "clics en moyenne pour archiver manuellement un seul email", accent: "text-blue-300" },
        { value: "0", label: "action manuelle avec l'adresse email DocuSafe", accent: "text-white" },
      ].map((s) => (
        <div key={s.value} className="flex flex-col gap-2 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <span className={`text-4xl font-extrabold ${s.accent}`} style={{ letterSpacing: "-0.04em" }}>{s.value}</span>
          <p className="text-xs leading-relaxed text-gray-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Feature cards ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: AtSign,
    title: "Adresse email unique",
    desc: "Votre compte génère une adresse @import.docu.safe personnelle. Transférez n'importe quel email — les pièces jointes arrivent directement.",
  },
  {
    icon: Zap,
    title: "Classification instantanée",
    desc: "L'IA lit chaque document importé et le dépose dans le bon dossier automatiquement, sans aucune intervention de votre part.",
  },
  {
    icon: Cloud,
    title: "Google Drive & OneDrive",
    desc: "Connectez vos espaces cloud en un clic. Sélectionnez les fichiers à importer et DocuSafe s'occupe du reste.",
  },
  {
    icon: History,
    title: "Historique complet",
    desc: "Retrouvez l'origine de chaque document : quel email, quelle source, à quelle date — pour une traçabilité totale.",
  },
  {
    icon: RefreshCw,
    title: "Synchronisation continue",
    desc: "Activez la sync automatique : tout nouveau document ajouté à votre Drive connecté est importé sans action supplémentaire.",
  },
  {
    icon: HardDrive,
    title: "Import direct depuis l'appareil",
    desc: "Glissez-déposez ou sélectionnez un fichier depuis votre Mac, PC ou mobile. L'import est immédiat et sécurisé.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader solid />

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Import & Email</p>
          <div className="lg:max-w-2xl">
            <h1
              className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
              style={{ letterSpacing: "-0.04em", lineHeight: 1.03 }}
            >
              Vos documents<br />arrivent d&apos;eux-mêmes.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500">
              Transférez un email, connectez votre Drive, glissez un fichier — DocuSafe
              capte tout, classe tout, indexe tout. Vous ne perdez plus jamais un document.
            </p>
          </div>
        </div>
      </section>

      {/* ── Adresse email unique — full-width card ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
            <div className="flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:gap-16 lg:p-12">

              {/* Text */}
              <div className="lg:flex-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h2
                  className="mb-4 text-2xl font-extrabold text-gray-900 md:text-3xl"
                  style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
                >
                  Une adresse email<br />juste pour vous.
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-gray-500">
                  Chaque compte DocuSafe dispose d&apos;une adresse email unique et personnelle.
                  Transférez n&apos;importe quel email contenant une pièce jointe — la facture,
                  le contrat, l&apos;attestation — atterrit automatiquement dans votre espace,
                  classée et prête à être retrouvée.
                </p>
                <p className="text-sm leading-relaxed text-gray-500">
                  Plus besoin de télécharger, renommer, déplacer. Un simple &ldquo;Transférer&rdquo;
                  depuis votre messagerie, et c&apos;est fait.
                </p>
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100 w-fit">
                  <AtSign className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-mono font-bold text-blue-700">gabriel@import.docu.safe</span>
                </div>
              </div>

              {/* Visual */}
              <div className="lg:flex-1">
                <EmailVisual />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi c'est indispensable — dark card ── */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-gray-900 p-8 lg:p-12">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
            <h2
              className="mb-2 text-2xl font-extrabold text-white md:text-3xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              Pourquoi c&apos;est indispensable.
            </h2>
            <p className="mb-10 text-sm text-gray-400">
              La plupart de vos documents importants n&apos;arrivent pas depuis votre bureau — ils arrivent par email.
            </p>
            <StatsVisual />
          </div>
        </div>
      </section>

      {/* ── Google Drive & OneDrive ── */}
      <section className="border-y border-blue-100 bg-blue-50/40 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
              <Cloud className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                Vos clouds connectés.
              </h2>
              <p className="text-sm font-medium text-blue-500">
                Importez depuis Google Drive ou OneDrive en quelques clics.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <DriveVisual name="Google Drive" color="bg-[#4285F4]" />
            <DriveVisual name="Microsoft OneDrive" color="bg-[#0078D4]" />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Une connexion OAuth sécurisée — DocuSafe ne stocke jamais vos identifiants.
          </p>
        </div>
      </section>

      {/* ── 6 feature cards ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Tout ce qu&apos;il faut pour ne rien rater.
          </h2>
          <p className="mb-10 text-sm text-gray-400">
            Import par email, Drive, glisser-déposer ou depuis votre mobile — chaque source est prise en charge.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                  <feat.icon className="h-5 w-5 text-blue-600" strokeWidth={1.8} />
                </div>
                <p className="mb-1.5 text-sm font-bold text-gray-900">{feat.title}</p>
                <p className="text-xs leading-relaxed text-gray-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="border-t border-gray-100 px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2
            className="mb-8 text-4xl font-extrabold text-gray-900 md:text-5xl"
            style={{ letterSpacing: "-0.04em", lineHeight: 1.08 }}
          >
            Transférez votre prochaine facture.<br />
            <span className="text-gray-400">Elle sera classée en 3 secondes.</span>
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Essayer gratuitement <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
