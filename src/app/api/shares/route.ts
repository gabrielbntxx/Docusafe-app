import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Generate a secure random token
function generateShareToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

// POST - Create a new share link
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, folderIds, documentIds, expiresIn, password } = body;

    // Validate that at least one item is being shared
    if (
      (!folderIds || folderIds.length === 0) &&
      (!documentIds || documentIds.length === 0)
    ) {
      return NextResponse.json(
        { error: "Sélectionnez au moins un dossier ou document à partager" },
        { status: 400 }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    switch (expiresIn) {
      case "24h":
        expiresAt.setHours(expiresAt.getHours() + 24);
        break;
      case "7d":
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case "30d":
        expiresAt.setDate(expiresAt.getDate() + 30);
        break;
      case "never":
        expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 years = "never"
        break;
      default:
        expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days
    }

    // Verify ownership of folders
    if (folderIds && folderIds.length > 0) {
      const folders = await db.folder.findMany({
        where: {
          id: { in: folderIds },
          userId: session.user.id,
        },
      });

      if (folders.length !== folderIds.length) {
        return NextResponse.json(
          { error: "Certains dossiers n'existent pas ou ne vous appartiennent pas" },
          { status: 403 }
        );
      }
    }

    // Verify ownership of documents
    if (documentIds && documentIds.length > 0) {
      const documents = await db.document.findMany({
        where: {
          id: { in: documentIds },
          userId: session.user.id,
        },
      });

      if (documents.length !== documentIds.length) {
        return NextResponse.json(
          { error: "Certains documents n'existent pas ou ne vous appartiennent pas" },
          { status: 403 }
        );
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    // Generate unique token
    const token = generateShareToken();

    // Create the share link with items
    const sharedLink = await db.sharedLink.create({
      data: {
        userId: session.user.id,
        token,
        name: name || null,
        password: hashedPassword,
        expiresAt,
        items: {
          create: [
            ...(folderIds || []).map((folderId: string) => ({
              folderId,
            })),
            ...(documentIds || []).map((documentId: string) => ({
              documentId,
            })),
          ],
        },
      },
      include: {
        items: true,
      },
    });

    // Generate the share URL
    const headers = new Headers(req.headers);
    const forwardedHost = headers.get("x-forwarded-host");
    const forwardedProto = headers.get("x-forwarded-proto") || "https";
    const host = forwardedHost || headers.get("host");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${forwardedProto}://${host}`;
    const shareUrl = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      success: true,
      share: {
        id: sharedLink.id,
        token: sharedLink.token,
        name: sharedLink.name,
        url: shareUrl,
        expiresAt: sharedLink.expiresAt,
        hasPassword: !!sharedLink.password,
        itemCount: sharedLink.items.length,
      },
    });
  } catch (error) {
    console.error("Create share error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du partage" },
      { status: 500 }
    );
  }
}

// GET - List user's share links
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Get base URL for share links
    const headers = new Headers(req.headers);
    const forwardedHost = headers.get("x-forwarded-host");
    const forwardedProto = headers.get("x-forwarded-proto") || "https";
    const host = forwardedHost || headers.get("host");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${forwardedProto}://${host}`;

    const shares = await db.sharedLink.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            // We can't directly include folder/document relations since they're not defined
            // We'll fetch them separately if needed
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get folder and document details for each share
    const sharesWithDetails = await Promise.all(
      shares.map(async (share) => {
        const folderIds = share.items
          .filter((item) => item.folderId)
          .map((item) => item.folderId as string);
        const documentIds = share.items
          .filter((item) => item.documentId)
          .map((item) => item.documentId as string);

        const [folders, documents] = await Promise.all([
          folderIds.length > 0
            ? db.folder.findMany({
                where: { id: { in: folderIds } },
                select: { id: true, name: true, color: true },
              })
            : [],
          documentIds.length > 0
            ? db.document.findMany({
                where: { id: { in: documentIds } },
                select: { id: true, displayName: true, fileType: true },
              })
            : [],
        ]);

        const isExpired = new Date() > share.expiresAt;

        return {
          id: share.id,
          token: share.token,
          name: share.name,
          url: `${baseUrl}/share/${share.token}`,
          expiresAt: share.expiresAt.toISOString(),
          isExpired,
          hasPassword: !!share.password,
          viewCount: share.viewCount,
          createdAt: share.createdAt.toISOString(),
          folders,
          documents,
        };
      })
    );

    return NextResponse.json({ shares: sharesWithDetails });
  } catch (error) {
    console.error("List shares error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des partages" },
      { status: 500 }
    );
  }
}
