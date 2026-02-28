import { Bot, FileText, Search } from "lucide-react";

export function DocubotSection() {
  return (
    <section className="bg-gray-50 px-4 pt-4 pb-16 md:pb-20">
      <div className="mx-auto max-w-5xl">

        {/* Rectangle */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-stretch">

            {/* ── LEFT 1/3 — Label + Titre ── */}
            <div className="flex flex-col justify-center p-8 lg:flex-[4] lg:border-r lg:border-gray-100">

              {/* Label DocuBot */}
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5">
                <Bot className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-violet-600">DocuBot</span>
              </div>

              {/* Titre */}
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

            {/* ── RIGHT 2/3 — Démo statique ── */}
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
                  {/* Sources */}
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

      </div>
    </section>
  );
}
