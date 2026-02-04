import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MyFilesClient } from "@/components/my-files/my-files-client";

export default async function MyFilesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Récupérer tous les dossiers avec le nombre de documents et sous-dossiers
  const folders = await db.folder.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          documents: true,
          children: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Récupérer tous les documents
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
  }));

  return (
    <MyFilesClient
      folders={serializedFolders}
      documents={serializedDocuments}
    />
  );
}
