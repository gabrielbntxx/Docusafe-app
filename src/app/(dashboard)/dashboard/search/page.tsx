import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SearchClient } from "@/components/search/search-client";

export default async function SearchPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Récupérer tous les documents pour la recherche
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
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  // Les 5 derniers documents uploadés
  const recentDocuments = documents.slice(0, 5);

  // Sérialiser pour JSON (incluant les données IA pour une recherche intelligente)
  const serializedDocuments = documents.map((doc) => ({
    id: doc.id,
    displayName: doc.displayName,
    originalName: doc.originalName,
    fileType: doc.fileType,
    mimeType: doc.mimeType,
    sizeBytes: Number(doc.sizeBytes),
    uploadedAt: doc.uploadedAt.toISOString(),
    folderId: doc.folderId,
    folder: doc.folder,
    tags: doc.tags,
    description: doc.description,
    // AI analysis data for smart search
    aiDocumentType: doc.aiDocumentType,
    aiCategory: doc.aiCategory,
    aiExtractedData: doc.aiExtractedData,
  }));

  const serializedRecentDocuments = recentDocuments.map((doc) => ({
    id: doc.id,
    displayName: doc.displayName,
    originalName: doc.originalName,
    fileType: doc.fileType,
    mimeType: doc.mimeType,
    sizeBytes: Number(doc.sizeBytes),
    uploadedAt: doc.uploadedAt.toISOString(),
    folderId: doc.folderId,
    folder: doc.folder,
  }));

  return (
    <SearchClient
      documents={serializedDocuments}
      recentDocuments={serializedRecentDocuments}
    />
  );
}
