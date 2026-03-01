import Link from "next/link";
import {
  Bell, Mail, Clock, Check, ChevronRight,
  FileText, AlertTriangle, Users, Eye,
  RefreshCw, Zap, Shield, Calendar,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

// ─── Visuals ───────────────────────────────────────────────────────────────────

function ExpiryEmailVisual() {
  return (
    <div className="space-y-3">
      {/* Email notification */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100 shadow-sm">
        {/* Email header */}
        <div className="mb-4 flex items-center gap-3 border-b border-gray-50 pb-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Bell className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">DocuSafe · Rappel d&apos;expiration</p>
            <p className="text-[10px] text-gray-400">À gabriel@gmail.com</p>
          </div>
          <span className="text-[10px] text-gray-300 flex-shrink-0">Aujourd&apos;hui 09:00</span>
        </div>

        {/* Email body */}
        <p className="mb-3 text-xs font-bold text-gray-800">
          Votre document expire bientôt
        </p>

        {/* Document card */}
        <div className="mb-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">Carte_Nationale_Identite.pdf</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <p className="text-[10px] font-medium text-amber-600">Expire dans 30 jours · 12 avril 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 rounded-lg bg-gray-900 py-2 text-center text-[11px] font-bold text-white">
            Voir le document
          </button>
          <button className="flex-1 rounded-lg bg-gray-50 py-2 text-center text-[11px] font-medium text-gray-500 ring-1 ring-gray-100">
            Me rappeler
          </button>
        </div>
      </div>

      {/* Reminder timeline */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow-sm">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Rappels envoyés</p>
        {[
          { days: "J−90", label: "Premier rappel", done: true },
          { days: "J−30", label: "Rappel urgent", done: true },
          { days: "J−7",  label: "Dernier rappel", done: false },
        ].map((r) => (
          <div key={r.days} className="flex items-center gap-3 py-1.5">
            <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
              r.done ? "bg-green-100" : "bg-gray-100"
            }`}>
              {r.done
                ? <Check className="h-3 w-3 text-green-500" />
                : <Clock className="h-3 w-3 text-gray-400" />
              }
            </div>
            <span className="text-[11px] font-mono font-semibold text-gray-400 w-10 flex-shrink-0">{r.days}</span>
            <span className="text-[11px] text-gray-600">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PushNotifVisual() {
  const notifs = [
    { icon: AlertTriangle, color: "bg-amber-100 text-amber-600", title: "Passeport expire dans 7 jours", time: "À l'instant" },
    { icon: Check,         color: "bg-green-100 text-green-600", title: "Assurance habitation renouvelée", time: "Il y a 2h" },
    { icon: Bell,          color: "bg-blue-100 text-blue-600",   title: "3 documents à renouveler ce mois", time: "Hier" },
  ];
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100 shadow-sm space-y-2">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Notifications</p>
      {notifs.map((n) => (
        <div key={n.title} className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-3 ring-1 ring-gray-100">
          <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${n.color}`}>
            <n.icon className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 leading-snug">{n.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamActivityVisual() {
  const events = [
    { user: "Gabriel B.", action: "a partagé", doc: "Contrat_prestataire.pdf", time: "Il y a 5 min", color: "bg-blue-100 text-blue-600", initials: "GB" },
    { user: "Marie L.",   action: "a téléchargé", doc: "Facture_032025.pdf",   time: "Il y a 22 min", color: "bg-emerald-100 text-emerald-600", initials: "ML" },
    { user: "Thomas R.",  action: "a consulté",   doc: "Rapport_annuel.pdf",   time: "Il y a 1h",     color: "bg-violet-100 text-violet-600", initials: "TR" },
    { user: "Sophie M.",  action: "a ajouté",     doc: "Attestation_RH.pdf",   time: "Il y a 3h",     color: "bg-orange-100 text-orange-600", initials: "SM" },
  ];
  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div key={e.doc} className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${e.color}`}>
            <span className="text-[10px] font-bold">{e.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-300">
              <span className="font-semibold text-white">{e.user}</span>
              {" "}{e.action}{" "}
              <span className="font-medium text-gray-200 truncate">{e.doc}</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{e.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Feature cards ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Mail,
    title: "Emails automatiques",
    desc: "Recevez un email clair à J−90, J−30 et J−7 avant l'expiration d'un document, avec un lien direct pour agir.",
  },
  {
    icon: Bell,
    title: "Notifications push",
    desc: "Alertes en temps réel sur tous vos appareils — mobile et bureau — sans avoir besoin d'ouvrir l'application.",
  },
  {
    icon: Calendar,
    title: "Rappels personnalisés",
    desc: "Configurez vos propres intervalles de rappel pour chaque document selon vos besoins spécifiques.",
  },
  {
    icon: Eye,
    title: "Suivi des ouvertures",
    desc: "Voyez en temps réel qui a ouvert, téléchargé ou partagé chaque document dans votre espace.",
  },
  {
    icon: Shield,
    title: "Journal d'audit complet",
    desc: "Chaque action est horodatée et conservée — pour une traçabilité totale en cas de besoin légal ou RH.",
  },
  {
    icon: RefreshCw,
    title: "Renouvellement guidé",
    desc: "À l'expiration, DocuSafe vous guide pour remplacer le document en un clic et archiver l'ancienne version.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AlertesPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader solid />

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Alertes & Expiration</p>
          <div className="lg:max-w-2xl">
            <h1
              className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
              style={{ letterSpacing: "-0.04em", lineHeight: 1.03 }}
            >
              Ne laissez jamais un<br />document expirer<br />en silence.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500">
              DocuSafe surveille vos documents pour vous. Dès qu&apos;une échéance approche,
              vous recevez un email et une notification — bien avant qu&apos;il ne soit trop tard.
            </p>
          </div>
        </div>
      </section>

      {/* ── Grande carte — Alertes d'expiration ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
            <div className="flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:gap-16 lg:p-12">

              {/* Text */}
              <div className="lg:flex-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <h2
                  className="mb-4 text-2xl font-extrabold text-gray-900 md:text-3xl"
                  style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
                >
                  Alertes avant expiration,<br />à chaque étape.
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-gray-500">
                  Carte d&apos;identité, passeport, assurance, permis, contrat — tous vos documents
                  ont une durée de vie. DocuSafe les surveille en continu et vous envoie
                  un email à 90 jours, 30 jours et 7 jours avant l&apos;échéance.
                </p>
                <p className="text-sm leading-relaxed text-gray-500">
                  Plus de mauvaise surprise, plus de document périmé. Juste une alerte
                  claire, au bon moment, avec le bon document.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["J−90", "J−30", "J−7", "Rappel email", "Push mobile", "Personnalisable"].map((tag) => (
                    <span key={tag} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="lg:flex-1">
                <ExpiryEmailVisual />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 2 cartes côte à côte ── */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Notifications push */}
            <div className="overflow-hidden rounded-3xl bg-gray-50 ring-1 ring-gray-100 p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="mb-2 text-xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                Notifications push & in-app
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Recevez une alerte instantanée sur votre téléphone ou dans l&apos;application
                dès qu&apos;une échéance approche — sans avoir à surveiller votre boîte mail.
              </p>
              <PushNotifVisual />
            </div>

            {/* Suivi équipe */}
            <div className="overflow-hidden rounded-3xl bg-gray-50 ring-1 ring-gray-100 p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="mb-2 text-xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                Suivi de votre équipe
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Voyez en temps réel ce que font vos collaborateurs : qui a consulté quoi,
                qui a partagé un document, qui l&apos;a modifié — tout est visible et daté.
              </p>
              {/* Mini activity list */}
              <div className="space-y-2">
                {[
                  { initials: "GB", name: "Gabriel B.", action: "a partagé Contrat.pdf", time: "5 min", color: "bg-blue-100 text-blue-600" },
                  { initials: "ML", name: "Marie L.",   action: "a téléchargé Facture.pdf", time: "22 min", color: "bg-emerald-100 text-emerald-600" },
                  { initials: "TR", name: "Thomas R.",  action: "a consulté Rapport.pdf", time: "1h", color: "bg-violet-100 text-violet-600" },
                ].map((e) => (
                  <div key={e.name} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-gray-100">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${e.color}`}>
                      <span className="text-[10px] font-bold">{e.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 truncate">
                        <span className="font-semibold text-gray-900">{e.name}</span> {e.action}
                      </p>
                      <p className="text-[10px] text-gray-400">Il y a {e.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Journal d'activité — dark full-width ── */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl bg-gray-900 p-8 lg:p-12">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

              {/* Text */}
              <div className="lg:flex-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2
                  className="mb-4 text-2xl font-extrabold text-white md:text-3xl"
                  style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
                >
                  Journal d&apos;activité<br />complet.
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">
                  Chaque action réalisée sur votre espace est enregistrée et horodatée :
                  consultation, téléchargement, partage, modification, suppression.
                  Vous savez toujours exactement ce qu&apos;il s&apos;est passé, qui l&apos;a fait, et quand.
                </p>
                <p className="text-sm leading-relaxed text-gray-400">
                  Indispensable pour les équipes, les audits internes et la conformité RGPD.
                </p>
              </div>

              {/* Visual */}
              <div className="lg:flex-1">
                <TeamActivityVisual />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 6 feature cards ── */}
      <section className="border-t border-gray-100 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-extrabold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Tout pour rester informé.
          </h2>
          <p className="mb-10 text-sm text-gray-400">
            Emails, push, journal d&apos;audit — aucun document ne passe inaperçu.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                  <feat.icon className="h-5 w-5 text-amber-600" strokeWidth={1.8} />
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
            Ne ratez plus jamais<br />une échéance.
            <br /><span className="text-gray-400">Essayez gratuitement.</span>
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-700"
          >
            Créer mon espace <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
