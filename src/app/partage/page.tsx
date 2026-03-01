import Link from "next/link";
import {
  Link2, Mail, Lock, Clock, UserCheck, Send,
  Check, Copy, Eye, EyeOff, ChevronRight, ArrowRight,
  FileText, User, AtSign,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

// ─── Visuals ───────────────────────────────────────────────────────────────────

function ShareLinkVisual() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 text-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <FileText className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">Contrat_prestataire.pdf</p>
          <p className="text-[10px] text-gray-400">1,2 Mo</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
        <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
        <span className="flex-1 truncate text-[11px] text-gray-500">docu.safe/s/k8xQ2p…</span>
        <button className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5">
          <Copy className="h-2.5 w-2.5 text-white" />
          <span className="text-[10px] font-bold text-white">Copier</span>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
          <p className="mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mot de passe</p>
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-widest text-gray-700">••••••</span>
            <EyeOff className="h-3 w-3 text-gray-300" />
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
          <p className="mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Expire le</p>
          <p className="text-xs text-gray-700">30 mars 2025</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
        <Check className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[11px] text-blue-600 font-medium">Lien sécurisé actif · 3 consultations</span>
      </div>
    </div>
  );
}

function RequestVisual() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 text-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-800">Demande de document</p>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">En attente</span>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-100">
        <div className="mb-2 flex items-center gap-2">
          <AtSign className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-600">marie.dupont@example.com</span>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-500">
          &ldquo;Merci de déposer votre justificatif d&apos;identité pour finaliser le dossier.&rdquo;
        </p>
      </div>

      <div className="space-y-1.5">
        {[
          { label: "Pièce d'identité",      done: true },
          { label: "Justificatif domicile",  done: false },
          { label: "RIB",                    done: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className={`flex h-4 w-4 items-center justify-center rounded-full flex-shrink-0 ${item.done ? "bg-blue-600" : "bg-gray-100 ring-1 ring-gray-200"}`}>
              {item.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </div>
            <span className={`text-[11px] ${item.done ? "text-gray-800 font-medium" : "text-gray-400"}`}>{item.label}</span>
            {item.done && <span className="ml-auto text-[10px] text-blue-500">Reçu</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PinVisual() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 text-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Lock className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Documents RH</p>
          <p className="text-[10px] text-gray-400">Dossier protégé par PIN</p>
        </div>
      </div>
      <div className="mb-3 flex justify-center gap-3">
        {["•", "•", "•", " "].map((d, i) => (
          <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${i < 3 ? "bg-gray-900 text-white" : "bg-gray-100 ring-1 ring-gray-200 text-gray-300"}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <div key={n} className="flex h-9 items-center justify-center rounded-lg bg-gray-50 text-sm font-semibold text-gray-600 ring-1 ring-gray-100">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailVisual() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 text-sm space-y-3">
      <p className="text-xs font-bold text-gray-800">Envoi par email</p>
      <div className="rounded-lg bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 w-6">À :</span>
          <span className="text-[11px] text-gray-600">client@entreprise.com</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 w-6">Obj :</span>
          <span className="text-[11px] text-gray-600">Devis Q1 2025</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3 py-2.5 ring-1 ring-blue-100">
        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-blue-700 truncate">Devis_Q1_2025.pdf</p>
          <p className="text-[10px] text-blue-400">2,4 Mo</p>
        </div>
        <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
      </div>
      <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5">
        <Send className="h-3.5 w-3.5 text-white" />
        <span className="text-[11px] font-bold text-white">Envoyer</span>
      </button>
    </div>
  );
}

// ─── Small feature cards ────────────────────────────────────────────────────────

const SMALL_FEATURES = [
  { icon: Clock,      title: "Liens à durée limitée",   desc: "Définissez une date d'expiration sur vos liens de partage. Passé ce délai, le lien devient inaccessible automatiquement." },
  { icon: Eye,        title: "Lecture seule",            desc: "Partagez un document en consultation uniquement — aucun téléchargement, aucune modification possible." },
  { icon: UserCheck,  title: "Attribution de documents", desc: "Assignez un document ou une tâche à un membre de votre équipe directement depuis votre espace." },
  { icon: Mail,       title: "Notifications de partage", desc: "Recevez une alerte dès qu'un destinataire ouvre votre document partagé ou dépose un fichier demandé." },
];

// ─── Handshake illustration ────────────────────────────────────────────────────

function HandshakeIllustration() {
  return (
    <svg viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Left forearm — bold, tapering */}
      <path d="M 12 222 C 38 188 66 158 88 128" stroke="#0f172a" strokeWidth="17" strokeLinecap="round" />
      {/* Right forearm — bold, tapering */}
      <path d="M 188 222 C 162 188 134 158 112 128" stroke="#0f172a" strokeWidth="17" strokeLinecap="round" />

      {/* Left wrist → hand body */}
      <path d="M 86 130 C 90 120 95 112 100 108" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />
      {/* Right wrist → hand body */}
      <path d="M 114 130 C 110 120 105 112 100 108" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />

      {/* Left thumb — arcs up from wrist */}
      <path d="M 87 128 C 74 112 70 94 76 76" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
      {/* Right thumb — arcs up from wrist */}
      <path d="M 113 128 C 126 112 130 94 124 76" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />

      {/* 4 fingers rising from knuckles */}
      <path d="M  90 104 C  88  90  88  76  90  64" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M  97 101 C  96  87  96  73  98  61" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 103 101 C 104  87 104  73 102  61" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 110 104 C 112  90 112  76 110  64" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />

      {/* Small knuckle accent line */}
      <path d="M 88 106 C 94 102 106 102 112 106" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PartagePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader solid />

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Partage & Collaboration</p>
          <div className="flex items-center justify-between gap-8">
            <div className="lg:max-w-2xl">
              <h1
                className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
                style={{ letterSpacing: "-0.04em", lineHeight: 1.03 }}
              >
                Partagez.<br />Collaborez.<br />En toute sécurité.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500">
                Envoyez un document en un lien, demandez des fichiers à vos contacts externes,
                et gardez le contrôle total sur qui voit quoi — et jusqu&apos;à quand.
              </p>
            </div>
            <div className="hidden lg:block w-[200px] flex-shrink-0 opacity-90">
              <HandshakeIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── Grandes cartes features ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Card 1 — Lien de partage (pleine largeur) */}
          <div className="overflow-hidden rounded-3xl bg-gray-50 ring-1 ring-gray-100">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="flex flex-col justify-center p-10 lg:p-12">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                  <Link2 className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="mb-3 text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.03em" }}>
                  Lien de partage sécurisé
                </h2>
                <p className="text-sm leading-relaxed text-gray-500">
                  Générez un lien unique pour chaque document. Protégez-le par mot de passe,
                  limitez sa durée de vie et voyez en temps réel combien de fois il a été consulté —
                  sans jamais perdre la maîtrise de vos fichiers.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Mot de passe", "Date d'expiration", "Compteur de vues", "Révocation instantanée"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center bg-white p-8 lg:border-l lg:border-gray-100">
                <div className="w-full max-w-sm">
                  <ShareLinkVisual />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 + Card 3 — côte à côte */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Demande de documents */}
            <div className="overflow-hidden rounded-3xl bg-gray-50 ring-1 ring-gray-100">
              <div className="p-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="mb-3 text-xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.03em" }}>
                  Demande de documents
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-gray-500">
                  Envoyez une demande à n&apos;importe quelle adresse email. Votre contact dépose
                  ses fichiers via un portail simple — sans compte DocuSafe nécessaire.
                </p>
                <RequestVisual />
              </div>
            </div>

            {/* Envoi par email */}
            <div className="overflow-hidden rounded-3xl bg-gray-50 ring-1 ring-gray-100">
              <div className="p-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-200">
                  <Send className="h-5 w-5 text-gray-700" />
                </div>
                <h2 className="mb-3 text-xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.03em" }}>
                  Envoi par email
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-gray-500">
                  Envoyez directement un document par email depuis DocuSafe, sans passer
                  par votre boîte mail. Vos fichiers restent hébergés sur vos serveurs.
                </p>
                <EmailVisual />
              </div>
            </div>
          </div>

          {/* Card 4 — PIN (fond sombre) + texte */}
          <div className="overflow-hidden rounded-3xl bg-gray-900 ring-1 ring-gray-800">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="flex items-center justify-center p-8 lg:border-r lg:border-white/10">
                <div className="w-full max-w-xs">
                  <PinVisual />
                </div>
              </div>
              <div className="flex flex-col justify-center p-10 lg:p-12">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <h2 className="mb-3 text-2xl font-extrabold text-white" style={{ letterSpacing: "-0.03em" }}>
                  Dossiers protégés par PIN
                </h2>
                <p className="text-sm leading-relaxed text-gray-400">
                  Certains dossiers méritent une protection supplémentaire. Verrouillez-les
                  avec un code PIN à 4 chiffres — même si quelqu&apos;un accède à votre compte,
                  vos documents sensibles restent hors de portée.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Code à 4 chiffres", "Par dossier", "Indépendant du mot de passe"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300 ring-1 ring-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4 petites fonctionnalités ── */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Et aussi…
          </h2>
          <p className="mb-10 text-sm text-gray-400">Des fonctionnalités complémentaires pour un contrôle total.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SMALL_FEATURES.map((feat) => (
              <div key={feat.title} className="rounded-2xl bg-white p-6 ring-1 ring-gray-100 shadow-sm">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                  <feat.icon className="h-4 w-4 text-blue-600" strokeWidth={1.8} />
                </div>
                <p className="mb-2 text-sm font-bold text-gray-900">{feat.title}</p>
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
            Partagez votre premier document<br />
            <span className="text-gray-400">en moins de 30 secondes.</span>
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Essayer maintenant
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
