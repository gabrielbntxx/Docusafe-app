import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import {
  sendWelcomeProEmail,
  sendWelcomeBusinessEmail,
  sendCancellationEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Map Stripe Price IDs to plan types (server-side source of truth)
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_STUDENT || ""]: "STUDENT",
  [process.env.STRIPE_PRICE_PRO || ""]: "PRO",
  [process.env.STRIPE_PRICE_BUSINESS || ""]: "BUSINESS",
};

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const domainParts = domain.split(".");
  const tld = domainParts.pop() || "";
  return `${local[0]}***@${domainParts[0]?.[0] || ""}***.${tld}`;
}

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    console.error("[Stripe Webhook] Stripe not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

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
 * Resolve the app user from a Stripe checkout session.
 * Priority: client_reference_id (internal user ID) → stripeCustomerId → email (last resort)
 */
async function resolveUser(session: Stripe.Checkout.Session) {
  // 1. client_reference_id = internal user ID (most reliable — set by our payment links)
  const userId = session.client_reference_id;
  if (userId) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      console.log("[Stripe Webhook] User resolved via client_reference_id");
      return user;
    }
    console.warn("[Stripe Webhook] client_reference_id set but user not found:", userId);
  }

  // 2. stripeCustomerId — returning customers who paid before
  const customerId = session.customer as string | undefined;
  if (customerId) {
    const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } });
    if (user) {
      console.log("[Stripe Webhook] User resolved via stripeCustomerId");
      return user;
    }
  }

  // 3. email — last resort fallback (insecure if different email used at checkout)
  const customerEmail = session.customer_email || session.customer_details?.email;
  if (customerEmail) {
    const user = await db.user.findUnique({ where: { email: customerEmail.toLowerCase() } });
    if (user) {
      console.warn("[Stripe Webhook] User resolved via email fallback — consider fixing client_reference_id");
      return user;
    }
    console.error("[Stripe Webhook] User not found for email:", maskEmail(customerEmail));
  }

  return null;
}

/**
 * Resolve plan type from Stripe session line items (server-side source of truth).
 */
async function resolvePlanType(session: Stripe.Checkout.Session): Promise<string> {
  // Resolve from Stripe price ID (trusted, server-side)
  if (stripe && session.id) {
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const priceId = lineItems.data[0]?.price?.id;
      if (priceId && PRICE_TO_PLAN[priceId]) {
        console.log("[Stripe Webhook] Plan resolved from price ID:", PRICE_TO_PLAN[priceId]);
        return PRICE_TO_PLAN[priceId];
      }
      if (priceId) {
        console.warn("[Stripe Webhook] Unknown price ID:", priceId, "— check STRIPE_PRICE_* env vars");
      }
    } catch (err) {
      console.error("[Stripe Webhook] Failed to fetch line items:", err);
    }
  }

  return "PRO";
}

/**
 * Handle successful checkout - upgrade user to paid plan
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log("[Stripe Webhook] Checkout completed, resolving user...");

  const user = await resolveUser(session);

  if (!user) {
    console.error("[Stripe Webhook] Could not resolve user for session:", session.id);
    return;
  }

  // Resolve plan from Stripe price ID (not client_reference_id)
  const planType = await resolvePlanType(session);

  // Update user plan
  await db.user.update({
    where: { id: user.id },
    data: {
      planType,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: "active",
      onboardingCompleted: true,
    },
  });

  console.log(`[Stripe Webhook] User upgraded to ${planType}:`, maskEmail(user.email));

  // Send plan-specific welcome email
  if (planType === "BUSINESS") {
    await sendWelcomeBusinessEmail(user.email, user.name || undefined);
  } else {
    await sendWelcomeProEmail(user.email, user.name || undefined);
  }
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

  // Cascade downgrade: if this user was a team owner, downgrade all team members
  const teamMembers = await db.user.findMany({
    where: { teamOwnerId: user.id },
    select: { id: true, email: true },
  });

  if (teamMembers.length > 0) {
    await db.user.updateMany({
      where: { teamOwnerId: user.id },
      data: {
        planType: "FREE",
        teamOwnerId: null,
        teamRole: null,
      },
    });
    console.log(`[Stripe Webhook] ${teamMembers.length} team members downgraded for owner:`, maskEmail(user.email));
  }

  console.log("[Stripe Webhook] User downgraded to FREE:", maskEmail(user.email));

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

  console.log("[Stripe Webhook] User marked as past_due:", maskEmail(user.email));

  // Notify user of payment failure
  await sendPaymentFailedEmail(user.email, user.name || undefined);
}
