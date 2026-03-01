import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intelligence Artificielle",
  description:
    "DocuSafe classe vos documents automatiquement, extrait les données clés et répond à vos questions avec DocuBot. Découvrez une IA vraiment utile pour vos documents.",
  openGraph: {
    title: "Intelligence Artificielle — DocuSafe",
    description: "Classification auto, extraction de données, DocuBot. L'IA qui comprend vraiment vos documents.",
    url: "https://docusafe.fr/ia",
  },
};

export default function IALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
