import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH - Move a document to a different folder
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
    const { folderId } = await req.json();

    // Check if document exists and belongs to user
    const document = await db.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // If folderId is provided, verify it exists and belongs to user
    if (folderId) {
      const folder = await db.folder.findUnique({
        where: { id: folderId },
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
    }

    // Update the document's folder
    const updatedDocument = await db.document.update({
      where: { id },
      data: {
        folderId: folderId || null,
      },
    });

    // Convert BigInt to Number for JSON serialization
    const serializedDocument = {
      ...updatedDocument,
      sizeBytes: Number(updatedDocument.sizeBytes),
    };

    return NextResponse.json(serializedDocument);
  } catch (error) {
    console.error("Error moving document:", error);
    return NextResponse.json(
      { error: "Erreur lors du déplacement du document" },
      { status: 500 }
    );
  }
}
