import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { DocumentForm, type DocType } from "@/components/create/document-form";

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
    select: { planType: true },
  });

  if (!user || user.planType !== "BUSINESS") {
    redirect("/dashboard/subscription");
  }

  if (!VALID_TYPES.includes(params.type as DocType)) notFound();

  return <DocumentForm type={params.type as DocType} />;
}
