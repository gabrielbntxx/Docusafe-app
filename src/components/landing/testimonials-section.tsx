const TESTIMONIALS = [
  {
    name: "Dr. Benetrix",
    role: "Chirurgien-dentiste",
    initials: "DB",
    color: "bg-blue-100 text-blue-700",
    quote:
      "Depuis que j'utilise DocuSafe, j'ai perdu beaucoup moins de temps qu'avec mon ancien système de stockage. Cela me permet de me concentrer davantage sur mes patients.",
  },
  {
    name: "Dr. Sophie Marchand",
    role: "Psychologue",
    initials: "SM",
    color: "bg-violet-100 text-violet-700",
    quote:
      "DocuSafe m'a permis de gérer la masse d'informations liée à mon cabinet sans stress. Tout est rangé, retrouvable en quelques secondes. Un vrai soulagement au quotidien.",
  },
  {
    name: "Maxime Rzadkiewicz",
    role: "Étudiant à KEDGE Business School",
    initials: "MR",
    color: "bg-emerald-100 text-emerald-700",
    quote:
      "Je classe mieux mes cours et mes ressources. Cela me permet de vraiment mieux travailler et de gagner un temps précieux avant les examens.",
  },
  {
    name: "Cabinet Lefèvre & Fils",
    role: "Expertise comptable",
    initials: "LF",
    color: "bg-orange-100 text-orange-700",
    quote:
      "Nos documents clients sont enfin centralisés. L'IA détecte automatiquement les types de fichiers et les classe — c'est un gain de temps considérable pour toute l'équipe.",
  },
  {
    name: "Marie Fontaine",
    role: "Architecte indépendante",
    initials: "MF",
    color: "bg-rose-100 text-rose-700",
    quote:
      "Je gère des dizaines de chantiers avec des centaines de documents. DocuSafe m'évite de chercher partout. Plus jamais un contrat perdu ou une facture introuvable.",
  },
  {
    name: "Thomas Leblanc",
    role: "Avocat d'affaires",
    initials: "TL",
    color: "bg-indigo-100 text-indigo-700",
    quote:
      "La sécurité et le chiffrement de DocuSafe correspondent parfaitement aux exigences de confidentialité de mon métier. Je recommande à tout professionnel du droit.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="overflow-hidden bg-white pt-6 pb-20 md:pb-28">

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Titre */}
      <div className="mx-auto mb-12 max-w-5xl px-4">
        <h2
          className="text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.06 }}
        >
          Ils nous font confiance.
        </h2>
        <p className="mt-4 text-base text-gray-500">
          Des milliers d&apos;utilisateurs organisent déjà leurs documents avec DocuSafe.
        </p>
      </div>

      {/* Marquee */}
      <div className="flex">
        <div className="marquee-track flex gap-4 will-change-transform">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div
              key={i}
              className="flex w-72 flex-shrink-0 flex-col gap-4 rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100"
            >
              {/* Avatar + nom */}
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>

              {/* Citation */}
              <p className="text-sm leading-relaxed text-gray-600">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
