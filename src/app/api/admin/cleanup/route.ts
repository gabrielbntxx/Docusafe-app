import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// API pour nettoyer les anciens documents stockés localement
// Les documents R2 ont un storageUrl qui commence par "r2://"
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Trouver tous les documents de l'utilisateur qui ne sont PAS sur R2
    const oldDocuments = await db.document.findMany({
      where: {
        userId: session.user.id,
        NOT: {
          storageUrl: {
            startsWith: "r2://",
          },
        },
      },
    });

    if (oldDocuments.length === 0) {
      return NextResponse.json({
        message: "Aucun ancien document à nettoyer",
        deleted: 0,
      });
    }

    // Calculer la taille totale des anciens documents
    const totalSize = oldDocuments.reduce(
      (sum, doc) => sum + Number(doc.sizeBytes),
      0
    );

    // Supprimer les anciens documents
    await db.document.deleteMany({
      where: {
        userId: session.user.id,
        NOT: {
          storageUrl: {
            startsWith: "r2://",
          },
        },
      },
    });

    // Recalculer les vrais compteurs basés sur les documents R2 restants
    const remainingDocs = await db.document.findMany({
      where: { userId: session.user.id },
    });

    const newDocCount = remainingDocs.length;
    const newStorageUsed = remainingDocs.reduce(
      (sum, doc) => sum + Number(doc.sizeBytes),
      0
    );

    // Mettre à jour les statistiques utilisateur
    await db.user.update({
      where: { id: session.user.id },
      data: {
        documentsCount: newDocCount,
        storageUsedBytes: BigInt(newStorageUsed),
      },
    });

    return NextResponse.json({
      message: `${oldDocuments.length} ancien(s) document(s) supprimé(s)`,
      deleted: oldDocuments.length,
      freedBytes: totalSize,
      newDocCount,
      newStorageUsed,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Erreur lors du nettoyage" },
      { status: 500 }
    );
  }
}

// GET pour voir combien de documents sont à nettoyer
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const oldDocuments = await db.document.count({
      where: {
        userId: session.user.id,
        NOT: {
          storageUrl: {
            startsWith: "r2://",
          },
        },
      },
    });

    const r2Documents = await db.document.count({
      where: {
        userId: session.user.id,
        storageUrl: {
          startsWith: "r2://",
        },
      },
    });

    return NextResponse.json({
      oldDocuments,
      r2Documents,
      needsCleanup: oldDocuments > 0,
    });
  } catch (error) {
    console.error("Cleanup check error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
