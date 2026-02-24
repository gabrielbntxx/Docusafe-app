import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { DocumentForm, type DocType } from "@/components/create/document-form";
import { getProfessionDocConfig } from "@/lib/professions";

const VALID_TYPES: DocType[] = [
  "facture",
  "devis",
  "contrat",
  "bon-de-commande",
  "lettre",
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
