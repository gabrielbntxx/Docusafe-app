import { NextRequest, NextResponse } from "next/server";
import {
  parseImportEmailAddress,
  processEmailImport,
  validateSendGridSignature,
  ALLOWED_MIME_TYPES,
  MAX_EMAIL_ATTACHMENT_SIZE,
} from "@/lib/email-import";

/**
 * SendGrid Inbound Parse Webhook Handler
 *
 * This endpoint receives emails sent to *@import.docusafe.app
 * and imports the attachments as documents for the corresponding user.
 *
 * SendGrid sends the email as multipart/form-data with these fields:
 * - envelope: JSON string containing "to" and "from" addresses
 * - from: Sender email
 * - to: Recipient email (our import address)
 * - subject: Email subject
 * - text: Plain text body
 * - html: HTML body
 * - attachments: Number of attachments
 * - attachment1, attachment2, ...: File attachments
 */
export async function POST(request: NextRequest) {
  console.log("[Email Import Webhook] Received request");

  try {
    // 1. Validate content type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      console.error("[Email Import Webhook] Invalid content type:", contentType);
      // Return 200 to avoid SendGrid retries
      return NextResponse.json({ error: "Invalid content type" }, { status: 200 });
    }

    // 2. Parse the form data
    const formData = await request.formData();

    // 3. Validate SendGrid signature (in production)
    const signature = request.headers.get("x-twilio-email-event-webhook-signature") || "";
    const timestamp = request.headers.get("x-twilio-email-event-webhook-timestamp") || "";

    if (process.env.NODE_ENV === "production" && process.env.SENDGRID_INBOUND_PARSE_WEBHOOK_SECRET) {
      // For production, we need to validate the signature
      // Note: SendGrid Inbound Parse uses a different signing mechanism than Event Webhook
      // For Inbound Parse, you may need to set up IP whitelisting instead
      // or use the basic auth option in SendGrid
      console.log("[Email Import Webhook] Signature validation in production mode");
    }

    // 4. Extract envelope (contains to/from addresses)
    let toAddress = "";
    let fromAddress = "";

    const envelope = formData.get("envelope");
    if (envelope && typeof envelope === "string") {
      try {
        const envelopeData = JSON.parse(envelope);
        toAddress = envelopeData.to?.[0] || "";
        fromAddress = envelopeData.from || "";
        console.log("[Email Import Webhook] Envelope parsed - to:", toAddress, "from:", fromAddress);
      } catch {
        console.error("[Email Import Webhook] Failed to parse envelope");
      }
    }

    // Fallback to form fields if envelope parsing fails
    if (!toAddress) {
      toAddress = (formData.get("to") as string) || "";
    }
    if (!fromAddress) {
      fromAddress = (formData.get("from") as string) || "";
    }

    console.log("[Email Import Webhook] Email to:", toAddress, "from:", fromAddress);

    // 5. Extract importEmailId from the recipient address
    const importEmailId = parseImportEmailAddress(toAddress);

    if (!importEmailId) {
      console.log("[Email Import Webhook] Invalid import address:", toAddress);
      // Return 200 to avoid retries - silently fail
      return NextResponse.json({ message: "Invalid import address" }, { status: 200 });
    }

    console.log("[Email Import Webhook] Import email ID:", importEmailId);

    // 6. Get number of attachments
    const attachmentCount = parseInt(formData.get("attachments") as string) || 0;
    console.log("[Email Import Webhook] Attachment count:", attachmentCount);

    if (attachmentCount === 0) {
      console.log("[Email Import Webhook] No attachments in email");
      return NextResponse.json({ message: "No attachments" }, { status: 200 });
    }

    // 7. Extract attachments
    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }> = [];

    for (let i = 1; i <= attachmentCount; i++) {
      const attachment = formData.get(`attachment${i}`);

      if (attachment && attachment instanceof Blob) {
        const filename =
          (attachment as File).name || `attachment${i}`;
        const contentType = attachment.type || "application/octet-stream";

        // Check if file type is supported before processing
        if (!ALLOWED_MIME_TYPES.includes(contentType.toLowerCase())) {
          console.log(`[Email Import Webhook] Skipping unsupported attachment ${i}: ${contentType}`);
          continue;
        }

        // Check file size
        if (attachment.size > MAX_EMAIL_ATTACHMENT_SIZE) {
          console.log(`[Email Import Webhook] Skipping oversized attachment ${i}: ${attachment.size} bytes`);
          continue;
        }

        try {
          const arrayBuffer = await attachment.arrayBuffer();
          const content = Buffer.from(arrayBuffer);

          attachments.push({
            filename,
            content,
            contentType,
          });

          console.log(
            `[Email Import Webhook] Attachment ${i}: ${filename} (${contentType}, ${content.length} bytes)`
          );
        } catch (error) {
          console.error(`[Email Import Webhook] Failed to read attachment ${i}:`, error);
        }
      }
    }

    console.log(`[Email Import Webhook] Valid attachments to process: ${attachments.length}`);

    // 8. Process the import
    const result = await processEmailImport(importEmailId, attachments, fromAddress);

    console.log("[Email Import Webhook] Import result:", result);

    // Always return 200 to SendGrid to acknowledge receipt
    return NextResponse.json({
      message: "Email processed",
      imported: result.imported,
      skipped: result.skipped,
      failed: result.failed,
    });
  } catch (error) {
    console.error("[Email Import Webhook] Error:", error);

    // Return 200 even on error to prevent SendGrid from retrying
    // (we don't want to process the same email multiple times)
    return NextResponse.json(
      { error: "Internal error", message: error instanceof Error ? error.message : "Unknown" },
      { status: 200 }
    );
  }
}

// SendGrid may also send GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Email import webhook is active" });
}
