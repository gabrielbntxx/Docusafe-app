import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DocumentsClient } from "@/components/documents/documents-client";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Récupérer tous les documents de l'utilisateur
  const documents = await db.document.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  // Récupérer les dossiers pour les filtres
  const folders = await db.folder.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      _count: {
        select: {
          documents: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Convertir BigInt en Number pour le JSON
  const serializedDocuments = documents.map(doc => ({
    ...doc,
    sizeBytes: Number(doc.sizeBytes),
    uploadedAt: doc.uploadedAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));

  return (
    <DocumentsClient
      documents={serializedDocuments}
      folders={folders}
    />
  );
}
