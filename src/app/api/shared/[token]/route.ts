import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET - Get shared content info (public)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const share = await db.sharedLink.findUnique({
      where: { token },
      include: {
        items: true,
      },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Partage non trouvé" },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: "Ce lien de partage a expiré" },
        { status: 410 }
      );
    }

    // Return basic info (without content if password protected)
    return NextResponse.json({
      name: share.name,
      hasPassword: !!share.password,
      expiresAt: share.expiresAt.toISOString(),
      itemCount: share.items.length,
    });
  } catch (error) {
    console.error("Get share info error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du partage" },
      { status: 500 }
    );
  }
}

// POST - Access shared content (with optional password verification)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    const share = await db.sharedLink.findUnique({
      where: { token },
      include: {
        items: true,
      },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Partage non trouvé" },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: "Ce lien de partage a expiré" },
        { status: 410 }
      );
    }

    // Check password if required
    if (share.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Mot de passe requis", requiresPassword: true },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, share.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Mot de passe incorrect" },
          { status: 401 }
        );
      }
    }

    // Increment view count
    await db.sharedLink.update({
      where: { id: share.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get folder and document details
    const folderIds = share.items
      .filter((item) => item.folderId)
      .map((item) => item.folderId as string);
    const documentIds = share.items
      .filter((item) => item.documentId)
      .map((item) => item.documentId as string);

    // Get folders with their documents (only if there are folder IDs)
    const folders = folderIds.length > 0
      ? await db.folder.findMany({
          where: { id: { in: folderIds } },
          select: {
            id: true,
            name: true,
            color: true,
            documents: {
              select: {
                id: true,
                displayName: true,
                fileType: true,
                mimeType: true,
                sizeBytes: true,
              },
            },
          },
        })
      : [];

    // Get individual shared documents (only if there are document IDs)
    const documents = documentIds.length > 0
      ? await db.document.findMany({
          where: { id: { in: documentIds } },
          select: {
            id: true,
            displayName: true,
            fileType: true,
            mimeType: true,
            sizeBytes: true,
          },
        })
      : [];

    // Serialize BigInt
    const serializedFolders = folders.map((folder) => ({
      ...folder,
      documents: folder.documents.map((doc) => ({
        ...doc,
        sizeBytes: Number(doc.sizeBytes),
      })),
    }));

    const serializedDocuments = documents.map((doc) => ({
      ...doc,
      sizeBytes: Number(doc.sizeBytes),
    }));

    return NextResponse.json({
      success: true,
      share: {
        name: share.name,
        expiresAt: share.expiresAt.toISOString(),
        folders: serializedFolders,
        documents: serializedDocuments,
      },
    });
  } catch (error) {
    console.error("Access share error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'accès au partage" },
      { status: 500 }
    );
  }
}
