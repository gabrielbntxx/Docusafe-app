import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CreateHub } from "@/components/create/create-hub";

export const metadata = { title: "Créer un document – DocuSafe" };

export default async function CreatePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { planType: true, profession: true },
  });

  if (!user || user.planType !== "BUSINESS") {
    redirect("/dashboard/subscription");
  }

  return <CreateHub profession={user.profession ?? null} />;
}
