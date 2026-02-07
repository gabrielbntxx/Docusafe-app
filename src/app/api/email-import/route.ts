import { NextRequest, NextResponse } from "next/server";
import {
  parseImportEmailAddress,
  processEmailImport,
  verifyResendWebhook,
  fetchResendEmailAttachments,
} from "@/lib/email-import";

/**
 * Resend Inbound Webhook Handler
 *
 * This endpoint receives webhook events from Resend when emails
 * are sent to *@import.docusafe.online.
 *
 * Resend sends a JSON payload with type "email.received" containing:
 * - data.email_id: Unique email identifier
 * - data.from: Sender email
 * - data.to: Array of recipient emails
 * - data.subject: Email subject
 * - data.attachments: Array of attachment metadata
 *
 * We then fetch the full email content via Resend API
 * and parse the raw MIME to extract attachment data.
 */
export async function POST(request: NextRequest) {
  console.log("[Email Import Webhook] Received Resend webhook");

  try {
    // 1. Read the raw body for signature verification
    const rawBody = await request.text();

    // 2. Verify Resend webhook signature (svix-based)
    const svixId = request.headers.get("svix-id") || "";
    const svixTimestamp = request.headers.get("svix-timestamp") || "";
    const svixSignature = request.headers.get("svix-signature") || "";

    if (process.env.NODE_ENV === "production") {
      const isValid = verifyResendWebhook(
        rawBody,
        svixId,
        svixTimestamp,
        svixSignature
      );

      if (!isValid) {
        console.error("[Email Import Webhook] Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // 3. Parse the JSON payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error("[Email Import Webhook] Invalid JSON payload");
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // 4. Only handle email.received events
    if (payload.type !== "email.received") {
      console.log(`[Email Import Webhook] Ignoring event type: ${payload.type}`);
      return NextResponse.json({ message: "Event type ignored" });
    }

    const emailData = payload.data;
    if (!emailData?.email_id) {
      console.error("[Email Import Webhook] Missing email_id in payload");
      return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
    }

    console.log(
      `[Email Import Webhook] Email received - id: ${emailData.email_id}, from: ${emailData.from}, to: ${JSON.stringify(emailData.to)}`
    );

    // 5. Check if there are attachments in the metadata
    if (!emailData.attachments || emailData.attachments.length === 0) {
      console.log("[Email Import Webhook] No attachments in email");
      return NextResponse.json({ message: "No attachments" });
    }

    // 6. Find the import email address from recipients
    const toAddresses: string[] = Array.isArray(emailData.to)
      ? emailData.to
      : [emailData.to];

    let importEmailId: string | null = null;
    for (const addr of toAddresses) {
      importEmailId = parseImportEmailAddress(addr);
      if (importEmailId) break;
    }

    if (!importEmailId) {
      console.log(
        `[Email Import Webhook] No valid import address found in: ${toAddresses.join(", ")}`
      );
      return NextResponse.json({ message: "Invalid import address" });
    }

    console.log(`[Email Import Webhook] Import email ID: ${importEmailId}`);

    // 7. Fetch full email content from Resend API (including attachment data)
    const emailContent = await fetchResendEmailAttachments(emailData.email_id);

    if (!emailContent) {
      console.error("[Email Import Webhook] Failed to fetch email content from Resend API");
      return NextResponse.json(
        { error: "Failed to fetch email content" },
        { status: 500 }
      );
    }

    if (emailContent.attachments.length === 0) {
      console.log("[Email Import Webhook] No valid attachments in parsed email");
      return NextResponse.json({ message: "No valid attachments" });
    }

    console.log(
      `[Email Import Webhook] Fetched ${emailContent.attachments.length} attachments from Resend`
    );

    // 8. Process the import
    const result = await processEmailImport(
      importEmailId,
      emailContent.attachments,
      emailData.from || emailContent.from || "unknown"
    );

    console.log("[Email Import Webhook] Import result:", result);

    return NextResponse.json({
      message: "Email processed",
      imported: result.imported,
      skipped: result.skipped,
      failed: result.failed,
    });
  } catch (error) {
    console.error("[Email Import Webhook] Error:", error);

    // Return 200 to prevent Resend from retrying
    return NextResponse.json(
      {
        error: "Internal error",
        message: error instanceof Error ? error.message : "Unknown",
      },
      { status: 200 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Resend inbound email webhook is active",
  });
}
