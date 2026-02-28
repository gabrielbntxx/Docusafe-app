import {
  Shield, Lock, Link2, Clock, Database, Users,
  Check, ShieldCheck, FileText, EyeOff,
} from "lucide-react";

export function StorageSection() {
  return (
    <section className="bg-gray-50 px-4 pt-16 pb-20 md:pt-20 md:pb-28">
      <div className="mx-auto max-w-5xl">

        {/* Titre */}
        <h2
          className="mb-10 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.06 }}
        >
          Tout vos documents<br />au même endroit.
        </h2>

        {/* ── 2 petites cartes ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Carte — Partage sécurisé */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
            <div className="p-7">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5">
                <Link2 className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Partage sécurisé</span>
              </div>
              <h3
                className="text-xl font-extrabold text-gray-900 md:text-2xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Partagez en<br />toute confiance
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Envoyez vos documents via un lien chiffré avec une date d&apos;expiration automatique. Aucun compte requis pour le destinataire.
              </p>
            </div>

            {/* Visual */}
            <div className="px-7 pb-7">
              <div className="space-y-3 rounded-2xl p-5" style={{ background: "#eef2ff" }}>

                {/* Doc partagé */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-indigo-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-800">Contrat_bail_2024.pdf</p>
                    <p className="text-[10px] text-gray-400">421 Ko · PDF</p>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">
                    <Lock className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>

                {/* Lien */}
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-indigo-100">
                  <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                  <span className="flex-1 truncate font-mono text-[11px] text-gray-500">docu.safe/s/8fx2k9p...</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Copier</span>
                </div>

                {/* Expiration */}
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-600">Expire dans 47h 23min</span>
                </div>

              </div>
            </div>
          </div>

          {/* Carte — Stockage */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
            <div className="p-7">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
                <Database className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Stockage</span>
              </div>
              <h3
                className="text-xl font-extrabold text-gray-900 md:text-2xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Un espace à la<br />hauteur de vos besoins
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                1 To pour les étudiants, 2 To pour les professionnels, 4 To pour toute une équipe. Évoluez sans contrainte.
              </p>
            </div>

            {/* Visual — 3 tiers */}
            <div className="px-7 pb-7">
              <div className="space-y-3 rounded-2xl p-5" style={{ background: "#eff6ff" }}>
                {[
                  { label: "Étudiant",       storage: "1 To", used: "234 Go",  pct: 23, color: "bg-blue-400"   },
                  { label: "Professionnel",  storage: "2 To", used: "876 Go",  pct: 43, color: "bg-indigo-500" },
                  { label: "Équipe",         storage: "4 To", used: "1,2 To",  pct: 30, color: "bg-violet-500" },
                ].map((tier) => (
                  <div key={tier.label} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-blue-100">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">{tier.label}</span>
                      <span className="text-xs font-extrabold text-gray-900">{tier.storage}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100">
                      <div className={`h-1.5 rounded-full ${tier.color}`} style={{ width: `${tier.pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-[10px] text-gray-400">{tier.used} utilisés</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Grand rectangle — Sécurité ── */}
        <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-stretch">

            {/* LEFT 1/3 */}
            <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Sécurité</span>
              </div>
              <h3
                className="text-2xl font-extrabold text-gray-900 md:text-3xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Sécurité<br />niveau bancaire
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Chiffrement AES-256, authentification à deux facteurs, zéro accès tiers. Vos documents n&apos;appartiennent qu&apos;à vous.
              </p>
            </div>

            {/* RIGHT 2/3 — dark visual */}
            <div
              className="flex items-center justify-center rounded-b-3xl p-8 lg:flex-[8] lg:rounded-b-none lg:rounded-r-3xl"
              style={{ background: "#0f172a" }}
            >
              <div className="flex flex-col items-center gap-7">

                {/* Bouclier central */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/40">
                  <ShieldCheck className="h-10 w-10 text-white" />
                  <div className="absolute -inset-2 rounded-2xl bg-blue-500/15 blur-lg" />
                </div>

                {/* 4 badges */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Lock,     label: "AES-256",  sub: "Chiffrement"  },
                    { icon: Shield,   label: "2FA",      sub: "Auth. forte"  },
                    { icon: Check,    label: "RGPD",     sub: "Certifié"     },
                    { icon: EyeOff,   label: "0 tiers",  sub: "Accès privé"  },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                        <b.icon className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{b.label}</p>
                        <p className="text-[10px] text-white/50">{b.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
