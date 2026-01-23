import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendWelcomeProEmail, sendCancellationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] No signature found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log("[Stripe Webhook] Received event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout - upgrade user to PRO
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log("[Stripe Webhook] Checkout completed for:", customerEmail);

  if (!customerEmail) {
    console.error("[Stripe Webhook] No customer email found in session");
    return;
  }

  // Find user by email
  const user = await db.user.findUnique({
    where: { email: customerEmail.toLowerCase() },
  });

  if (!user) {
    console.error("[Stripe Webhook] User not found for email:", customerEmail);
    return;
  }

  // Update user to PRO
  await db.user.update({
    where: { id: user.id },
    data: {
      planType: "PRO",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: "active",
    },
  });

  console.log("[Stripe Webhook] User upgraded to PRO:", user.email);

  // Send welcome email
  await sendWelcomeProEmail(user.email, user.name || undefined);
}

/**
 * Handle subscription updates (plan changes, renewals)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log("[Stripe Webhook] Subscription updated for customer:", customerId);

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("[Stripe Webhook] User not found for customer:", customerId);
    return;
  }

  // Map Stripe status to our status
  let status = subscription.status;
  if (status === "trialing") status = "active";

  // Update subscription status
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
  await db.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: status,
      subscriptionEndsAt: periodEnd
        ? new Date(periodEnd * 1000)
        : null,
    },
  });

  console.log("[Stripe Webhook] Subscription status updated:", status);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log("[Stripe Webhook] Subscription deleted for customer:", customerId);

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("[Stripe Webhook] User not found for customer:", customerId);
    return;
  }

  // Downgrade user to FREE
  await db.user.update({
    where: { id: user.id },
    data: {
      planType: "FREE",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
    },
  });

  console.log("[Stripe Webhook] User downgraded to FREE:", user.email);

  // Send cancellation email
  await sendCancellationEmail(user.email, user.name || undefined);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log("[Stripe Webhook] Payment failed for customer:", customerId);

  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("[Stripe Webhook] User not found for customer:", customerId);
    return;
  }

  // Update status to past_due
  await db.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "past_due",
    },
  });

  console.log("[Stripe Webhook] User marked as past_due:", user.email);
}
