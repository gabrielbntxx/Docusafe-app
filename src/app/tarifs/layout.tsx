import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Choisissez le plan DocuSafe adapté à vos besoins. Étudiant, Pro ou Business — 1 mois gratuit, sans carte bancaire. Stockage jusqu'à 4 To, IA incluse.",
  openGraph: {
    title: "Tarifs — DocuSafe",
    description: "1 mois gratuit · Étudiant, Pro, Business · Stockage jusqu'à 4 To.",
    url: "https://docusafe.fr/tarifs",
  },
};

export default function TarifsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
