export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { sendExpiryAlertEmail } from "@/lib/email";

// Thresholds in days before expiry when we notify the user
const THRESHOLDS = [60, 30, 7, 1];

// GET /api/cron/expiry-check - Called daily by cron job (Railway cron / external service)
export async function GET(request: Request) {
  // Verify cron secret — accepts either Authorization header or ?secret= query param
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const url = new URL(request.url);
    const querySecret = url.searchParams.get("secret");
    const validHeader = authHeader === `Bearer ${cronSecret}`;
    const validQuery = querySecret === cronSecret;
    if (!validHeader && !validQuery) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  // Look ahead 61 days to catch all threshold windows
  const lookAhead = new Date(now);
  lookAhead.setDate(lookAhead.getDate() + 61);

  console.log("[ExpiryCheck] Starting expiry check at", now.toISOString());

  // Find all non-deleted documents with an expiry date within the look-ahead window
  const documents = await db.document.findMany({
    where: {
      deletedAt: null,
      expiryDate: {
        not: null,
        lte: lookAhead,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          notificationsEnabled: true,
        },
      },
    },
  });

  console.log("[ExpiryCheck] Found", documents.length, "documents with upcoming expiry");

  let notificationsSent = 0;
  let emailsSent = 0;

  for (const doc of documents) {
    if (!doc.expiryDate) continue;

    const expiryDate = new Date(doc.expiryDate);
    const msLeft = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    // Parse already-notified thresholds
    let notifiedThresholds: number[] = [];
    try {
      notifiedThresholds = doc.expiryNotified
        ? JSON.parse(doc.expiryNotified)
        : [];
    } catch {
      notifiedThresholds = [];
    }

    // Find thresholds that are now due and haven't been notified yet
    const dueThresholds = THRESHOLDS.filter(
      (t) => daysLeft <= t && !notifiedThresholds.includes(t)
    );

    if (dueThresholds.length === 0) continue;

    // Send notification for each due threshold (use the closest one for the message)
    for (const threshold of dueThresholds) {
      // Create in-app notification
      const title =
        daysLeft <= 0
          ? `Document expiré : ${doc.displayName}`
          : `Renouvellement J-${daysLeft} : ${doc.displayName}`;

      const message =
        daysLeft <= 0
          ? `Votre document "${doc.displayName}" a expiré. Pensez à le renouveler.`
          : `Votre document "${doc.displayName}" expire le ${expiryDate.toLocaleDateString("fr-FR")}. Il vous reste ${daysLeft} jour${daysLeft > 1 ? "s" : ""}.`;

      await createNotification(doc.userId, "document_expiry", title, message);
      notificationsSent++;

      // Send email alert if user has notifications enabled
      if (doc.user.notificationsEnabled === 1) {
        await sendExpiryAlertEmail(
          doc.user.email,
          doc.user.name ?? undefined,
          doc.displayName,
          expiryDate,
          daysLeft
        );
        emailsSent++;
      }
    }

    // Update expiryNotified to include all newly notified thresholds
    const updatedThresholds = [...notifiedThresholds, ...dueThresholds];
    await db.document.update({
      where: { id: doc.id },
      data: { expiryNotified: JSON.stringify(updatedThresholds) },
    });
  }

  console.log(
    `[ExpiryCheck] Done. Notifications: ${notificationsSent}, Emails: ${emailsSent}`
  );

  return NextResponse.json({
    success: true,
    documentsChecked: documents.length,
    notificationsSent,
    emailsSent,
    checkedAt: now.toISOString(),
  });
}
