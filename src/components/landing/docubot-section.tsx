import { Bot, FileText, Search, Mail, ArrowRight, Sparkles, FolderOpen, Wand2, Check } from "lucide-react";

export function DocubotSection() {
  return (
    <section className="bg-gray-50 px-4 pt-4 pb-16 md:pb-20">
      <div className="mx-auto max-w-5xl">

        {/* ── Rectangle DocuBot ── */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-stretch">

            {/* LEFT 1/3 — Label + Titre */}
            <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">

              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5">
                <Bot className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-violet-600">DocuBot</span>
              </div>

              <h3
                className="text-2xl font-extrabold text-gray-900 md:text-3xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Questions en<br />langage naturel
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Posez n&apos;importe quelle question sur vos documents. DocuBot trouve, lit et répond en quelques secondes.
              </p>

            </div>

            {/* RIGHT 2/3 — Démo statique */}
            <div
              className="flex flex-col justify-center gap-4 p-8 lg:flex-[8]"
              style={{ background: "#f0edff" }}
            >

              {/* Question utilisateur */}
              <div className="flex justify-end">
                <div className="max-w-xs rounded-2xl rounded-tr-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    Quel est le montant total de mes abonnements ce mois-ci ?
                  </p>
                </div>
              </div>

              {/* Réponse DocuBot */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-sm rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                  <p className="text-sm leading-relaxed text-gray-800">
                    Vos abonnements du mois totalisent{" "}
                    <span className="font-bold text-violet-700">147 €</span>.
                    Netflix (15 €), Freebox (40 €), assurance auto (92 €).
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Facture_Netflix.pdf", "Contrat_Freebox.pdf", "Assurance_auto.pdf"].map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700"
                      >
                        <FileText className="h-3 w-3" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input décoratif */}
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <Search className="h-4 w-4 flex-shrink-0 text-gray-300" />
                <span className="text-sm text-gray-300">Posez votre question…</span>
              </div>

            </div>

          </div>
        </div>

        {/* ── 2 cartes features ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Carte 1 — Email Transfer */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">

            <div className="p-7">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Email Transfer</span>
              </div>
              <h3
                className="text-xl font-extrabold text-gray-900 md:text-2xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Des documents<br />transférés en un instant
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Transférez vos emails avec leurs pièces jointes. DocuSafe les importe, les analyse et les classe automatiquement.
              </p>
            </div>

            {/* Visual — flux email → IA → classé */}
            <div className="px-7 pb-7">
              <div className="flex items-center gap-2 rounded-2xl p-5" style={{ background: "#eff6ff" }}>

                {/* Email reçu */}
                <div className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-blue-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500">Email reçu</p>
                  <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5">
                    <FileText className="h-2.5 w-2.5 text-blue-500" />
                    <span className="text-[9px] font-semibold text-blue-600">facture.pdf</span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />

                {/* Analyse IA */}
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-violet-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500">Analyse IA</p>
                </div>

                <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />

                {/* Classé */}
                <div className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-emerald-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                    <FolderOpen className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500">Classé auto.</p>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                    <span className="text-[9px] font-semibold text-emerald-600">Finances</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Carte 2 — Création de document */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">

            <div className="p-7">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
                <Wand2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Création IA</span>
              </div>
              <h3
                className="text-xl font-extrabold text-gray-900 md:text-2xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Documents sur mesure<br />selon votre métier
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Générez des contrats, devis ou courriers adaptés à votre activité. L&apos;IA connaît votre secteur et rédige à votre place.
              </p>
            </div>

            {/* Visual — sélecteur métier + doc généré */}
            <div className="px-7 pb-7">
              <div className="rounded-2xl p-5" style={{ background: "#f0fdf4" }}>

                {/* Profession chips */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { label: "Immobilier", active: true },
                    { label: "Médical", active: false },
                    { label: "Commerce", active: false },
                    { label: "Juridique", active: false },
                  ].map((p) => (
                    <span
                      key={p.label}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        p.active
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-white text-gray-500 ring-1 ring-gray-100"
                      }`}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>

                {/* Document généré */}
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-700">Contrat_location.pdf</span>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      <Sparkles className="h-2.5 w-2.5" /> Généré
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {[90, 72, 85, 55, 78].map((w, i) => (
                      <div key={i} className="h-1.5 rounded-full bg-gray-100" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
