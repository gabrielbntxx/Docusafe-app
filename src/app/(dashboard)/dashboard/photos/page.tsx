import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PhotosClient } from "@/components/documents/photos-client";
import { getEffectiveUserId, getMemberFolderAccess } from "@/lib/team";

export default async function PhotosPage() {
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

  const photos = await db.document.findMany({
    where: {
      userId: effectiveUserId,
      deletedAt: null,
      fileType: "image",
      ...(isOwner ? {} : { isPrivate: 0, ...folderFilter }),
    },
    select: {
      id: true,
      displayName: true,
      originalName: true,
      mimeType: true,
      fileType: true,
      sizeBytes: true,
      uploadedAt: true,
      aiAnalyzed: true,
      aiCategory: true,
      aiDocumentType: true,
      aiConfidence: true,
      aiExtractedData: true,
      expiryDate: true,
      folder: {
        select: { id: true, name: true, color: true, icon: true },
      },
    },
    orderBy: { uploadedAt: "desc" },
  });

  const serialized = photos.map((p) => ({
    ...p,
    sizeBytes: Number(p.sizeBytes),
    uploadedAt: p.uploadedAt.toISOString(),
    expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
  }));

  return <PhotosClient photos={serialized} />;
}
