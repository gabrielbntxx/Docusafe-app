import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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

    // Get user with subscription info
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        planType: true,
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

    if (user.planType === "FREE") {
      return NextResponse.json(
        { error: "Vous n'avez pas d'abonnement actif" },
        { status: 400 }
      );
    }

    if (!user.stripeSubscriptionId || !stripe) {
      // If no subscription ID or Stripe not configured, just downgrade them
      await db.user.update({
        where: { id: user.id },
        data: {
          planType: "FREE",
          subscriptionStatus: "canceled",
        },
      });

      console.log("[Subscription] User downgraded without Stripe subscription:", user.id);

      return NextResponse.json({
        success: true,
        message: "Abonnement annulé avec succès",
      });
    }

    // Cancel the subscription in Stripe
    // This will cancel at the end of the billing period
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    console.log("[Subscription] Subscription set to cancel at period end:", user.id);

    // Update user status (they remain PRO until the period ends)
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "canceling",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Votre abonnement sera annulé à la fin de la période en cours",
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toLocaleDateString("fr-FR")
        : null,
    });
  } catch (error) {
    console.error("[Subscription] Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation de l'abonnement" },
      { status: 500 }
    );
  }
}
