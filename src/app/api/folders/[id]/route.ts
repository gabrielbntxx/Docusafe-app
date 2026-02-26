import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { parseFolderRules, stringifyFolderRules, FolderRules } from "@/types/folder-rules";

// GET - Get a single folder with rules
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const folder = await db.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Dossier non trouvé" },
        { status: 404 }
      );
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      icon: folder.icon,
      isDefault: folder.isDefault === 1,
      parentId: folder.parentId,
      rules: parseFolderRules(folder.rules),
      documentCount: folder._count.documents,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    });
  } catch (error) {
    console.error("Error getting folder:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du dossier" },
      { status: 500 }
    );
  }
}

// Recursively collect all descendant folder IDs for a given parent
async function getAllDescendantFolderIds(parentId: string, userId: string): Promise<string[]> {
  const children = await db.folder.findMany({
    where: { parentId, userId },
    select: { id: true },
  });
  if (children.length === 0) return [];
  const childIds = children.map(c => c.id);
  const grandChildIds = await Promise.all(childIds.map(id => getAllDescendantFolderIds(id, userId)));
  return [...childIds, ...grandChildIds.flat()];
}

// DELETE - Delete a folder
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Check if folder exists and belongs to user
    const folder = await db.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Dossier non trouvé" },
        { status: 404 }
      );
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Prevent deletion of default folder
    if (folder.isDefault === 1) {
      return NextResponse.json(
        { error: "Impossible de supprimer le dossier par défaut" },
        { status: 400 }
      );
    }

    // Collect this folder + all descendants
    const descendantIds = await getAllDescendantFolderIds(id, session.user.id);
    const allFolderIds = [id, ...descendantIds];

    // Move all documents in the tree to null (uncategorized)
    await db.document.updateMany({
      where: { folderId: { in: allFolderIds } },
      data: { folderId: null },
    });

    // Nullify parentId on all folders in the set to break FK self-references
    // before bulk delete (avoids constraint violations regardless of DB engine)
    await db.folder.updateMany({
      where: { id: { in: allFolderIds } },
      data: { parentId: null },
    });

    // Delete the entire tree at once
    await db.folder.deleteMany({
      where: { id: { in: allFolderIds } },
    });

    // Créer une notification
    await createNotification(
      session.user.id,
      "folder_deleted",
      folder.name
    );

    // Revalider les pages qui affichent les compteurs de dossiers/documents
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/my-files");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du dossier" },
      { status: 500 }
    );
  }
}

// PATCH - Update a folder
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const { name, color, icon, rules } = await req.json();

    // Check if folder exists and belongs to user
    const folder = await db.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Dossier non trouvé" },
        { status: 404 }
      );
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Update the folder
    const updatedFolder = await db.folder.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(icon && { icon }),
        ...(rules !== undefined && { rules: stringifyFolderRules(rules as FolderRules) }),
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    const serializedFolder = {
      id: updatedFolder.id,
      name: updatedFolder.name,
      color: updatedFolder.color,
      icon: updatedFolder.icon,
      isDefault: updatedFolder.isDefault === 1,
      parentId: updatedFolder.parentId,
      rules: parseFolderRules(updatedFolder.rules),
      documentCount: Number(updatedFolder._count.documents),
      createdAt: updatedFolder.createdAt,
      updatedAt: updatedFolder.updatedAt,
    };

    // Créer une notification
    await createNotification(
      session.user.id,
      "folder_updated",
      updatedFolder.name
    );

    return NextResponse.json(serializedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du dossier" },
      { status: 500 }
    );
  }
}
