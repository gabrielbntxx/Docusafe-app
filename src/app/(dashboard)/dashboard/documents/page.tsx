export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DocumentsClient } from "@/components/documents/documents-client";
import { getEffectiveUserId, getTeamMemberMap, hasTeam } from "@/lib/team";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const effectiveUserId = await getEffectiveUserId(session.user.id);
  const isOwner = effectiveUserId === session.user.id;

  // Récupérer tous les documents (shared workspace aware)
  const documents = await db.document.findMany({
    where: {
      userId: effectiveUserId,
      ...(isOwner ? {} : { isPrivate: 0 }),
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
      userId: effectiveUserId,
      ...(isOwner ? {} : { isPrivate: 0 }),
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

  // Build team member map for color indicators
  const isInTeam = !isOwner || await hasTeam(effectiveUserId);
  const teamMemberMap = isInTeam ? await getTeamMemberMap(effectiveUserId) : {};

  // Convertir BigInt en Number pour le JSON
  const serializedDocuments = documents.map(doc => ({
    ...doc,
    sizeBytes: Number(doc.sizeBytes),
    uploadedAt: doc.uploadedAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    addedBy: doc.addedById && teamMemberMap[doc.addedById]
      ? teamMemberMap[doc.addedById]
      : null,
  }));

  return (
    <DocumentsClient
      documents={serializedDocuments}
      folders={folders}
      isTeam={isInTeam}
    />
  );
}
