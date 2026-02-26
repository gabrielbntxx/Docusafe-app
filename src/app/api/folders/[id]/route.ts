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

    // Move documents to null (uncategorized) before deleting folder
    if (folder._count.documents > 0) {
      await db.document.updateMany({
        where: { folderId: id },
        data: { folderId: null },
      });
    }

    // Delete the folder
    await db.folder.delete({
      where: { id },
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
