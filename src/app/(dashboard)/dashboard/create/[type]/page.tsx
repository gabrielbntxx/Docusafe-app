import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { DocumentForm, type DocType } from "@/components/create/document-form";
import { getProfessionDocConfig } from "@/lib/professions";

const VALID_TYPES: DocType[] = [
  // Généraux
  "facture", "devis", "contrat", "bon-de-commande", "lettre",
  // Santé
  "ordonnance", "certificat-medical", "compte-rendu-consultation", "fiche-patient",
  // Finance / Comptabilité
  "bilan-comptable", "declaration-fiscale", "rapport-financier",
  // Juridique
  "acte-juridique", "mise-en-demeure", "procuration",
  // Immobilier
  "bail", "compromis-de-vente", "mandat-immobilier",
  // Tech / IT
  "cahier-des-charges", "nda", "rapport-technique",
  // RH / Travail
  "contrat-de-travail", "fiche-de-paie", "avenant",
  // Formation
  "convention-de-stage", "attestation-de-formation", "programme-de-formation",
  // Commerce / Logistique
  "bon-de-livraison", "note-de-credit",
  // Créatif
  "brief-creatif", "cession-droits",
  // Admin général
  "compte-rendu-reunion", "rapport", "attestation",
];

export default async function CreateTypePage({
  params,
}: {
  params: { type: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { planType: true, profession: true },
  });

  if (!user || user.planType !== "BUSINESS") {
    redirect("/dashboard/subscription");
  }

  if (!VALID_TYPES.includes(params.type as DocType)) notFound();

  const docType = params.type as DocType;
  const config = getProfessionDocConfig(user.profession);
  const suggestedFolderName = config?.suggestedFolderName ?? null;
  const nameSuffix = config?.nameSuffix[docType] ?? null;

  return (
    <DocumentForm
      type={docType}
      profession={user.profession ?? null}
      suggestedFolderName={suggestedFolderName}
      nameSuffix={nameSuffix}
    />
  );
}
