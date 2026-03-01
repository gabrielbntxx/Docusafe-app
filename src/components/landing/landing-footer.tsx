import Link from "next/link";
import Image from "next/image";

const LINKS = [
  {
    heading: "Produit",
    items: [
      { label: "Stockage & Dossiers", href: "/stockage" },
      { label: "Sécurité",            href: "/securite" },
      { label: "Intelligence Artificielle", href: "/#ia" },
      { label: "Import & Email",      href: "/#import" },
      { label: "Partage & Collaboration", href: "/#partage" },
    ],
  },
  {
    heading: "DocuSafe",
    items: [
      { label: "Tarifs",     href: "/tarifs" },
      { label: "Entreprise", href: "/entreprise" },
    ],
  },
  {
    heading: "Légal",
    items: [
      { label: "Politique de confidentialité", href: "/privacy" },
      { label: "Conditions d'utilisation",     href: "/terms" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                <Image src="/logo.png" alt="DocuSafe" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-base font-bold text-gray-900">DocuSafe</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              Votre espace de gestion documentaire intelligent, sécurisé et accessible partout.
            </p>
          </div>

          {/* Link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} DocuSafe. Tous droits réservés.</p>
          <p className="text-xs text-gray-400">Hébergé en Europe · Données chiffrées · RGPD</p>
        </div>
      </div>
    </footer>
  );
}
