import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MyFilesClient } from "@/components/my-files/my-files-client";
import { getEffectiveUserId, getTeamMemberMap, hasTeam } from "@/lib/team";

export default async function MyFilesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const effectiveUserId = await getEffectiveUserId(session.user.id);
  const isOwner = effectiveUserId === session.user.id;

  // Récupérer tous les dossiers (shared workspace aware)
  const folders = await db.folder.findMany({
    where: {
      userId: effectiveUserId,
      ...(isOwner ? {} : { isPrivate: 0 }),
    },
    include: {
      _count: {
        select: {
          documents: {
            where: { deletedAt: null },
          },
          children: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Récupérer tous les documents (shared workspace aware)
  const documents = await db.document.findMany({
    where: {
      userId: effectiveUserId,
      deletedAt: null,
      ...(isOwner ? {} : { isPrivate: 0 }),
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

  // Build team member map for color indicators (only if in a team)
  const isInTeam = !isOwner || await hasTeam(effectiveUserId);
  const teamMemberMap = isInTeam ? await getTeamMemberMap(effectiveUserId) : {};

  // Serialize for JSON - filter out default folders
  const serializedFolders = folders
    .filter((folder) => folder.isDefault !== 1)
    .map((folder) => ({
      id: folder.id,
      name: folder.name,
      color: folder.color || "#3B82F6",
      icon: folder.icon || "folder",
      isDefault: false,
      documentCount: Number(folder._count.documents),
      childrenCount: Number(folder._count.children),
      parentId: folder.parentId,
      createdAt: folder.createdAt.toISOString(),
      hasPin: !!folder.pin,
      addedBy: folder.addedById && teamMemberMap[folder.addedById]
        ? teamMemberMap[folder.addedById]
        : null,
    }));

  const serializedDocuments = documents.map((doc) => ({
    id: doc.id,
    displayName: doc.displayName,
    fileType: doc.fileType,
    mimeType: doc.mimeType,
    sizeBytes: Number(doc.sizeBytes),
    uploadedAt: doc.uploadedAt.toISOString(),
    folderId: doc.folderId,
    folder: doc.folder,
    addedBy: doc.addedById && teamMemberMap[doc.addedById]
      ? teamMemberMap[doc.addedById]
      : null,
  }));

  return (
    <MyFilesClient
      folders={serializedFolders}
      documents={serializedDocuments}
      isTeam={isInTeam}
      initialCreateMode={searchParams?.create === "true"}
    />
  );
}
