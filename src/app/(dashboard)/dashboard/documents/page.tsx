import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DocumentsClient } from "@/components/documents/documents-client";
import { getEffectiveUserId, getTeamMemberMap, hasTeam } from "@/lib/team";

const DOCS_PER_PAGE = 50;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const effectiveUserId = await getEffectiveUserId(session.user.id);
  const isOwner = effectiveUserId === session.user.id;

  const page = Math.max(1, parseInt(searchParams.page as string) || 1);
  const search = (searchParams.search as string) || "";
  const folder = (searchParams.folder as string) || "";
  // Private space mode: owner-only view of their private documents
  const privateSpace = isOwner && searchParams.space === "private";

  const baseWhere = {
    // In private space, scope to owner's actual userId and private docs only
    userId: privateSpace ? session.user.id : effectiveUserId,
    deletedAt: null,
    ...(privateSpace ? { isPrivate: 1 } : isOwner ? {} : { isPrivate: 0 }),
  };

  const filterWhere = {
    ...baseWhere,
    ...(search ? { displayName: { contains: search, mode: "insensitive" as const } } : {}),
    ...(folder ? { folderId: folder } : {}),
  };

  const [documents, totalCount, folders] = await Promise.all([
    db.document.findMany({
      where: filterWhere,
      include: {
        folder: { select: { id: true, name: true, color: true, icon: true } },
      },
      orderBy: { uploadedAt: "desc" },
      skip: (page - 1) * DOCS_PER_PAGE,
      take: DOCS_PER_PAGE,
    }),
    db.document.count({ where: filterWhere }),
    db.folder.findMany({
      where: {
        userId: effectiveUserId,
        ...(isOwner ? {} : { isPrivate: 0 }),
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        _count: { select: { documents: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / DOCS_PER_PAGE));

  // Build team member map
  const isInTeam = !isOwner || (await hasTeam(effectiveUserId));
  const teamMemberMap = isInTeam ? await getTeamMemberMap(effectiveUserId) : {};

  const serializedDocuments = documents.map((doc) => ({
    ...doc,
    sizeBytes: Number(doc.sizeBytes),
    uploadedAt: doc.uploadedAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
    isPrivateDoc: isOwner && doc.isPrivate === 1,
    addedBy:
      doc.addedById && teamMemberMap[doc.addedById]
        ? teamMemberMap[doc.addedById]
        : null,
  }));

  return (
    <DocumentsClient
      documents={serializedDocuments}
      folders={folders}
      isTeam={isInTeam}
      isOwner={isOwner}
      initialTriageMode={searchParams?.triage === "1"}
      privateSpaceMode={privateSpace}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      initialSearch={search}
      initialFolder={folder}
    />
  );
}
