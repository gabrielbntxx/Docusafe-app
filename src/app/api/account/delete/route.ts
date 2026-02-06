import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFromR2 } from "@/lib/storage";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Get user with all needed info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log(`[AccountDelete] Starting account deletion for ${user.email}`);

    // 2. Cancel Stripe subscription if active
    if (stripe && user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        console.log(`[AccountDelete] Stripe subscription canceled for ${user.email}`);
      } catch (stripeError) {
        console.error("[AccountDelete] Stripe cancellation error (continuing):", stripeError);
      }
    }

    // 3. Delete all R2 files for this user's documents
    const documents = await db.document.findMany({
      where: { userId },
      select: { storageKey: true },
    });

    for (const doc of documents) {
      try {
        await deleteFromR2(doc.storageKey);
      } catch (r2Error) {
        console.error(`[AccountDelete] R2 delete failed for ${doc.storageKey}:`, r2Error);
      }
    }
    console.log(`[AccountDelete] Deleted ${documents.length} files from R2`);

    // 4. Delete R2 files for request uploads
    const requestUploads = await db.requestUpload.findMany({
      where: { request: { userId } },
      select: { storageKey: true },
    });

    for (const upload of requestUploads) {
      try {
        await deleteFromR2(upload.storageKey);
      } catch (r2Error) {
        console.error(`[AccountDelete] R2 delete failed for request upload ${upload.storageKey}:`, r2Error);
      }
    }

    // 5. Delete non-cascaded records
    await db.aIUsage.deleteMany({ where: { userId } });
    await db.passwordResetToken.deleteMany({ where: { email: user.email } });

    // Delete shared links (SharedItem cascades from SharedLink)
    await db.sharedLink.deleteMany({ where: { userId } });

    // Delete document requests (RequestUpload cascades from DocumentRequest)
    await db.documentRequest.deleteMany({ where: { userId } });

    // 6. Delete user (cascades: Account, Session, Folder, Document, Notification)
    await db.user.delete({
      where: { id: userId },
    });

    console.log(`[AccountDelete] Account deleted successfully for ${user.email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AccountDelete] Error deleting account:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    );
  }
}
