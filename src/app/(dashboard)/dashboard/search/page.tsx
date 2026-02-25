import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SearchClient } from "@/components/search/search-client";
import { getEffectiveUserId, getMemberFolderAccess } from "@/lib/team";

export default async function SearchPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const effectiveUserId = await getEffectiveUserId(session.user.id);
  const isOwner = effectiveUserId === session.user.id;

  // Folder access restriction for team members
  const memberFolderAccess = !isOwner ? await getMemberFolderAccess(session.user.id) : null;

  const folderFilter =
    memberFolderAccess !== null
      ? memberFolderAccess.length === 0
        ? { folderId: "__NONE__" as string }
        : { folderId: { in: memberFolderAccess } }
      : {};

  const documents = await db.document.findMany({
    where: {
      userId: effectiveUserId,
      deletedAt: null,
      ...(isOwner ? {} : { isPrivate: 0, ...folderFilter }),
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

  const recentDocuments = documents.slice(0, 5);

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
