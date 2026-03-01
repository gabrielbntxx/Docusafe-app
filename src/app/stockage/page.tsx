import {
  HardDrive, FileText, Image, CalendarDays,
  Folder, FolderOpen, Zap, Lock, Download, Search,
  ChevronRight, Plus,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";

// ─── Storage plans ─────────────────────────────────────────────────────────────

const PLANS = [
  {
    plan: "Étudiant",
    storage: "1 To",
    bytes: "1 000 Go",
    bar: 8,
    stats: [
      { icon: FileText, value: "2 000 000", label: "documents PDF" },
      { icon: Image,    value: "330 000",   label: "photos haute définition" },
      { icon: CalendarDays, value: "14 ans", label: "d'archivage quotidien" },
    ],
  },
  {
    plan: "Pro",
    storage: "2 To",
    bytes: "2 000 Go",
    bar: 16,
    featured: true,
    stats: [
      { icon: FileText, value: "4 000 000", label: "documents PDF" },
      { icon: Image,    value: "660 000",   label: "photos haute définition" },
      { icon: CalendarDays, value: "28 ans", label: "d'archivage quotidien" },
    ],
  },
  {
    plan: "Business",
    storage: "4 To",
    bytes: "4 000 Go",
    bar: 32,
    dark: true,
    stats: [
      { icon: FileText, value: "8 000 000", label: "documents PDF" },
      { icon: Image,    value: "1 300 000", label: "photos haute définition" },
      { icon: CalendarDays, value: "55 ans", label: "d'archivage quotidien" },
    ],
  },
];

// ─── Folder features ───────────────────────────────────────────────────────────

const FOLDER_FEATURES = [
  { icon: FolderOpen, title: "Dossiers & sous-dossiers",   desc: "Organisez vos documents en arborescence infinie, exactement comme sur votre ordinateur." },
  { icon: Zap,        title: "Tri automatique par IA",     desc: "DocuSafe détecte le type de document et le dépose dans le bon dossier automatiquement." },
  { icon: Lock,       title: "Dossiers protégés par PIN",  desc: "Verrouillez les dossiers sensibles avec un code à 4 chiffres pour un accès sécurisé." },
  { icon: Search,     title: "Recherche intelligente",     desc: "Retrouvez n'importe quel fichier en quelques mots, même dans des sous-dossiers profonds." },
  { icon: Download,   title: "Export ZIP en un clic",      desc: "Téléchargez un dossier entier avec son arborescence préservée en un seul téléchargement." },
  { icon: Plus,       title: "Création rapide",            desc: "Créez un dossier, renommez-le ou déplacez-le en quelques secondes depuis n'importe quel appareil." },
];

// ─── Folder mockup ─────────────────────────────────────────────────────────────

function FolderMockup() {
  return (
    <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-6 font-mono text-sm select-none">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-gray-200" />
        <div className="h-3 w-3 rounded-full bg-gray-200" />
        <div className="h-3 w-3 rounded-full bg-gray-200" />
        <span className="ml-2 text-xs text-gray-400">Mon espace DocuSafe</span>
      </div>

      <ul className="space-y-1.5 text-[13px]">
        {/* Root */}
        <FolderRow icon="open" name="Mon espace" depth={0} />

        {/* Contrats */}
        <FolderRow icon="open" name="Contrats" depth={1} />
        <FileRow name="Contrat_prestataire_2024.pdf" depth={2} />
        <FileRow name="Avenant_mars_2025.pdf" depth={2} />
        <FileRow name="CGV_version_finale.pdf" depth={2} />

        {/* Factures */}
        <FolderRow icon="open" name="Factures" depth={1} />
        <FolderRow icon="closed" name="2024" depth={2} />
        <FolderRow icon="open"   name="2025" depth={2} />
        <FileRow name="Facture_001_janvier.pdf" depth={3} />
        <FileRow name="Facture_002_fevrier.pdf" depth={3} />
        <FileRow name="Facture_003_mars.pdf" depth={3} />

        {/* RH */}
        <FolderRow icon="open" name="Documents RH" depth={1} locked />
        <FileRow name="Fiche_de_paie_fev_2025.pdf" depth={2} />
        <FileRow name="Contrat_de_travail.pdf" depth={2} />
        <FileRow name="Attestation_employeur.pdf" depth={2} />

        {/* Projets */}
        <FolderRow icon="open" name="Projets" depth={1} />
        <FolderRow icon="closed" name="Projet Alpha" depth={2} />
        <FolderRow icon="closed" name="Projet Beta" depth={2} />

        {/* Archives */}
        <FolderRow icon="closed" name="Archives" depth={1} />
      </ul>
    </div>
  );
}

function FolderRow({ name, depth, icon, locked }: { name: string; depth: number; icon: "open" | "closed"; locked?: boolean }) {
  return (
    <li className="flex items-center gap-1.5" style={{ paddingLeft: depth * 20 }}>
      <ChevronRight
        className={`h-3 w-3 flex-shrink-0 text-gray-300 transition-transform ${icon === "open" ? "rotate-90" : ""}`}
      />
      {icon === "open"
        ? <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-gray-600" />
        : <Folder     className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
      }
      <span className={`${icon === "open" ? "font-semibold text-gray-800" : "text-gray-500"}`}>{name}</span>
      {locked && <Lock className="h-3 w-3 text-gray-400 ml-0.5" />}
    </li>
  );
}

function FileRow({ name, depth }: { name: string; depth: number }) {
  return (
    <li className="flex items-center gap-1.5" style={{ paddingLeft: depth * 20 }}>
      <span className="w-3 flex-shrink-0" />
      <FileText className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" />
      <span className="text-gray-400 truncate">{name}</span>
    </li>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StockagePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader solid />

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Stockage & Dossiers</p>
          <div className="lg:max-w-2xl">
            <h1
              className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
              style={{ letterSpacing: "-0.04em", lineHeight: 1.03 }}
            >
              Tout votre espace,<br />rien que pour vous.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500">
              DocuSafe vous offre un espace de stockage massif, sécurisé et organisé
              intelligemment — pour que vous ne perdiez plus jamais un document.
            </p>
          </div>
        </div>
      </section>

      {/* ── Votre espace selon votre plan ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Votre espace de stockage
          </h2>
          <p className="mb-10 text-sm text-gray-400">Chaque plan inclut un espace généreux, disponible dès le premier jour.</p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.plan}
                className={`relative rounded-2xl p-7 ring-1 ${
                  p.dark
                    ? "bg-gray-900 ring-gray-800"
                    : p.featured
                    ? "bg-white ring-2 ring-blue-600 shadow-xl"
                    : "bg-white ring-gray-100 shadow-md"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white shadow">Recommandé</span>
                  </div>
                )}

                {/* Plan name */}
                <p className={`mb-1 text-xs font-bold uppercase tracking-widest ${p.dark ? "text-gray-500" : "text-gray-400"}`}>
                  {p.plan}
                </p>

                {/* Storage size */}
                <div className="mb-1 flex items-end gap-2">
                  <span className={`text-5xl font-extrabold ${p.dark ? "text-white" : "text-gray-900"}`} style={{ letterSpacing: "-0.04em" }}>
                    {p.storage}
                  </span>
                </div>
                <p className={`mb-6 text-xs ${p.dark ? "text-gray-500" : "text-gray-400"}`}>{p.bytes} de stockage sécurisé</p>

                {/* Storage bar */}
                <div className={`mb-6 h-2 w-full rounded-full ${p.dark ? "bg-white/10" : "bg-gray-100"}`}>
                  <div
                    className={`h-2 rounded-full ${p.dark ? "bg-white/40" : p.featured ? "bg-blue-500" : "bg-gray-400"}`}
                    style={{ width: `${p.bar}%` }}
                  />
                </div>

                {/* Stats */}
                <ul className="space-y-3">
                  {p.stats.map((s) => (
                    <li key={s.label} className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                        p.dark ? "bg-white/10" : "bg-gray-100"
                      }`}>
                        <s.icon className={`h-3.5 w-3.5 ${p.dark ? "text-white/70" : "text-gray-600"}`} strokeWidth={1.8} />
                      </div>
                      <div>
                        <span className={`text-sm font-bold ${p.dark ? "text-white" : "text-gray-900"}`}>{s.value}</span>
                        <span className={`ml-1.5 text-xs ${p.dark ? "text-gray-400" : "text-gray-400"}`}>{s.label}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Un stockage qui s'adapte ── */}
      <section className="border-y border-blue-100 bg-blue-50/40 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20">
            <div className="lg:flex-1">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <HardDrive className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="mb-3 text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                Et encore plus,<br />si vous en avez besoin.
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Chaque plan inclut un espace généreux pensé pour couvrir les usages les plus intensifs.
                Si votre activité grandit, vous pouvez étendre votre stockage avec des packs additionnels
                sans changer de plan — directement depuis vos paramètres.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Pour les équipes Business avec des besoins très élevés, notre équipe peut configurer
                un espace sur mesure. Contactez-nous pour en discuter.
              </p>
            </div>

            {/* Visual — storage breakdown */}
            <div className="lg:flex-1">
              <div className="rounded-2xl bg-white p-6 ring-1 ring-blue-100 shadow-sm">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-400">Espace utilisé</p>
                {[
                  { label: "Factures & comptabilité", pct: 38, color: "bg-blue-500" },
                  { label: "Contrats & juridique",    pct: 22, color: "bg-blue-300" },
                  { label: "Photos & médias",         pct: 18, color: "bg-gray-300" },
                  { label: "Documents RH",            pct: 14, color: "bg-gray-200" },
                  { label: "Autres",                  pct: 8,  color: "bg-gray-100" },
                ].map((row) => (
                  <div key={row.label} className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-gray-600">{row.label}</span>
                      <span className="text-xs font-semibold text-gray-500">{row.pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="mt-5 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                  <span className="text-xs text-gray-500">Espace libre restant</span>
                  <span className="text-sm font-bold text-blue-600">1,82 To</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dossiers & Organisation ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
              <Folder className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                Documents & Dossiers
              </h2>
              <p className="text-sm text-gray-400">Une organisation claire, accessible en quelques secondes.</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
            {/* Folder mockup */}
            <FolderMockup />

            {/* Feature cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FOLDER_FEATURES.map((feat) => (
                <div key={feat.title} className="rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-100">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200 shadow-sm">
                    <feat.icon className="h-4 w-4 text-gray-600" strokeWidth={1.8} />
                  </div>
                  <p className="mb-1 text-sm font-bold text-gray-900">{feat.title}</p>
                  <p className="text-xs leading-relaxed text-gray-500">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
