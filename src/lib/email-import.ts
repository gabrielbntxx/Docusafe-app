import crypto from "crypto";
import { db } from "@/lib/db";
import {
  uploadToR2,
  generateStorageKey,
  checkStorageLimit,
  checkFileSizeLimit,
  checkDocumentLimit,
} from "@/lib/storage";
import {
  encryptDocument,
  addEncryptionMarker,
  generateUserEncryptionKey,
  encryptUserKey,
  decryptUserKey,
} from "@/lib/encryption";
import { analyzeDocument, getOrCreateCategoryFolder } from "@/lib/ai-analysis";
import { createNotification } from "@/lib/notifications";
import { simpleParser } from "mailparser";

// Domain for import emails (Resend inbound)
export const IMPORT_EMAIL_DOMAIN = "import.docusafe.online";

// Allowed file types for email import
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Max file size for email import (10MB)
export const MAX_EMAIL_ATTACHMENT_SIZE = 10 * 1024 * 1024;

/**
 * Extract importEmailId from a full email address
 * e.g., "gabriel-abc123@import.docusafe.app" → "gabriel-abc123"
 */
export function parseImportEmailAddress(email: string): string | null {
  if (!email) return null;

  const normalizedEmail = email.toLowerCase().trim();

  // Check if it ends with our domain
  if (!normalizedEmail.endsWith(`@${IMPORT_EMAIL_DOMAIN}`)) {
    return null;
  }

  // Extract the local part (before @)
  const localPart = normalizedEmail.split("@")[0];

  if (!localPart || localPart.length < 3) {
    return null;
  }

  return localPart;
}

/**
 * Find user by their import email ID
 */
export async function findUserByImportEmailId(
  importEmailId: string
): Promise<{
  id: string;
  email: string;
  planType: string;
  documentsCount: number;
  storageUsedBytes: bigint;
  encryptionKey: string | null;
  aiSortingEnabled: number;
} | null> {
  const user = await db.user.findUnique({
    where: { importEmailId },
    select: {
      id: true,
      email: true,
      planType: true,
      documentsCount: true,
      storageUsedBytes: true,
      encryptionKey: true,
      aiSortingEnabled: true,
    },
  });

  return user;
}

/**
 * Verify Resend webhook signature (svix-based)
 * Resend uses svix for webhook delivery with HMAC SHA256
 */
export function verifyResendWebhook(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string
): boolean {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("[Email Import] RESEND_WEBHOOK_SECRET not set");
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  }

  try {
    // Resend/Svix signature: base64-encoded HMAC SHA256 of "msg_id.timestamp.body"
    // The secret is base64-encoded with "whsec_" prefix
    const secretBytes = Buffer.from(
      webhookSecret.startsWith("whsec_")
        ? webhookSecret.slice(6)
        : webhookSecret,
      "base64"
    );

    const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    // svix-signature can contain multiple signatures separated by spaces (v1,xxx)
    const signatures = svixSignature.split(" ");
    for (const sig of signatures) {
      const sigValue = sig.startsWith("v1,") ? sig.slice(3) : sig;
      try {
        if (
          crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(sigValue)
          )
        ) {
          return true;
        }
      } catch {
        // Length mismatch, try next signature
        continue;
      }
    }

    return false;
  } catch (error) {
    console.error("[Email Import] Webhook signature verification error:", error);
    return false;
  }
}

/**
 * Fetch full email content from Resend receiving API
 * Returns parsed attachments from the raw email
 */
export async function fetchResendEmailAttachments(
  emailId: string
): Promise<{
  from: string;
  to: string[];
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
} | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Email Import] RESEND_API_KEY not set");
    return null;
  }

  try {
    // Fetch email details from Resend API
    const response = await fetch(
      `https://api.resend.com/emails/receiving/${emailId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `[Email Import] Resend API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const emailData = await response.json();

    // Download the raw email from the signed URL
    if (!emailData.raw) {
      console.error("[Email Import] No raw email URL in Resend response");
      return null;
    }

    const rawResponse = await fetch(emailData.raw);
    if (!rawResponse.ok) {
      console.error("[Email Import] Failed to download raw email");
      return null;
    }

    const rawBuffer = Buffer.from(await rawResponse.arrayBuffer());

    // Parse the raw MIME email with mailparser
    const parsed = await simpleParser(rawBuffer);

    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }> = [];

    if (parsed.attachments) {
      for (const att of parsed.attachments) {
        attachments.push({
          filename: att.filename || `attachment_${attachments.length + 1}`,
          content: att.content,
          contentType: att.contentType || "application/octet-stream",
        });
      }
    }

    return {
      from: typeof parsed.from?.text === "string" ? parsed.from.text : emailData.from || "",
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to || ""],
      attachments,
    };
  } catch (error) {
    console.error("[Email Import] Error fetching email from Resend:", error);
    return null;
  }
}

/**
 * Get file extension from mime type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return mimeToExt[mimeType] || "bin";
}

/**
 * Process a single email attachment
 */
export async function processEmailAttachment(
  userId: string,
  user: {
    planType: string;
    documentsCount: number;
    storageUsedBytes: bigint;
    encryptionKey: string | null;
    aiSortingEnabled: number;
  },
  attachment: {
    filename: string;
    content: Buffer;
    contentType: string;
  }
): Promise<{
  success: boolean;
  documentId?: string;
  error?: string;
  skipped?: boolean;
}> {
  const { filename, content, contentType } = attachment;

  // 1. Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(contentType.toLowerCase())) {
    console.log(`[Email Import] Skipping unsupported file type: ${contentType}`);
    return { success: false, skipped: true, error: `Unsupported file type: ${contentType}` };
  }

  // 2. Check file size for email import (10MB max)
  if (content.length > MAX_EMAIL_ATTACHMENT_SIZE) {
    console.log(`[Email Import] Skipping oversized file: ${content.length} bytes`);
    return { success: false, skipped: true, error: "File too large (max 10MB for email import)" };
  }

  // 3. Check plan limits
  const fileSizeCheck = checkFileSizeLimit(user.planType, content.length);
  if (!fileSizeCheck.allowed) {
    return { success: false, error: fileSizeCheck.reason };
  }

  const storageCheck = checkStorageLimit(
    user.planType,
    Number(user.storageUsedBytes),
    content.length
  );
  if (!storageCheck.allowed) {
    return { success: false, error: storageCheck.reason };
  }

  const documentCheck = checkDocumentLimit(user.planType, user.documentsCount);
  if (!documentCheck.allowed) {
    return { success: false, error: documentCheck.reason };
  }

  // 4. Get or create user encryption key
  let userKey = user.encryptionKey;
  if (!userKey) {
    const newKey = generateUserEncryptionKey();
    userKey = encryptUserKey(newKey);
    await db.user.update({
      where: { id: userId },
      data: { encryptionKey: userKey },
    });
  }

  // 5. Encrypt the file
  const decryptedKey = decryptUserKey(userKey);
  const encryptedContent = encryptDocument(content, decryptedKey);
  const finalContent = addEncryptionMarker(encryptedContent);

  // 6. Generate storage key and upload
  const fileExtension = getExtensionFromMimeType(contentType);
  const storageKey = generateStorageKey(userId, `${filename}.${fileExtension}`);

  await uploadToR2(storageKey, finalContent, "application/octet-stream");

  // 7. Determine folder (AI analysis if enabled)
  let folderId: string | null = null;
  let aiData: {
    documentType?: string;
    category?: string;
    confidence?: number;
    extractedData?: string;
    suggestedName?: string;
  } = {};

  if (user.aiSortingEnabled === 1) {
    try {
      const analysisResult = await analyzeDocument(userId, content, filename, contentType);

      if (analysisResult.success && analysisResult.result) {
        const result = analysisResult.result;
        aiData = {
          documentType: result.documentType,
          category: result.category,
          confidence: result.confidence,
          extractedData: JSON.stringify(result.extractedData),
          suggestedName: result.suggestedName,
        };

        // Get or create folder for the category
        if (result.category) {
          folderId = await getOrCreateCategoryFolder(userId, result.category);
        }
      }
    } catch (aiError) {
      console.error("[Email Import] AI analysis error:", aiError);
      // Continue without AI analysis
    }
  }

  // 8. Create document in database
  const displayName = aiData.suggestedName || filename;

  // Determine file type category (same logic as upload route)
  let fileType = "other";
  if (contentType === "application/pdf") fileType = "pdf";
  else if (contentType.startsWith("image/")) fileType = "image";
  else if (contentType.startsWith("audio/")) fileType = "audio";
  else if (contentType.startsWith("video/")) fileType = "video";

  const document = await db.document.create({
    data: {
      userId,
      folderId,
      originalName: filename,
      displayName,
      fileType,
      mimeType: contentType,
      sizeBytes: BigInt(content.length),
      storageKey,
      isEncrypted: 1,
      aiAnalyzed: aiData.documentType ? 1 : 0,
      aiDocumentType: aiData.documentType,
      aiCategory: aiData.category,
      aiConfidence: aiData.confidence,
      aiExtractedData: aiData.extractedData,
    },
  });

  // 9. Update user stats
  await db.user.update({
    where: { id: userId },
    data: {
      documentsCount: { increment: 1 },
      storageUsedBytes: { increment: BigInt(content.length) },
    },
  });

  console.log(`[Email Import] Document created: ${document.id} (${filename})`);

  return { success: true, documentId: document.id };
}

/**
 * Process all attachments from an email
 */
export async function processEmailImport(
  importEmailId: string,
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>,
  senderEmail: string
): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}> {
  const result = {
    success: false,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Find user by import email ID
  const user = await findUserByImportEmailId(importEmailId);

  if (!user) {
    console.log(`[Email Import] User not found for importEmailId: ${importEmailId}`);
    // Silent fail - return success to avoid bounces
    return { ...result, success: true };
  }

  console.log(
    `[Email Import] Processing ${attachments.length} attachments for user ${user.id} from ${senderEmail}`
  );

  if (attachments.length === 0) {
    console.log("[Email Import] No attachments in email");
    return { ...result, success: true };
  }

  // Process each attachment
  for (const attachment of attachments) {
    try {
      const processResult = await processEmailAttachment(user.id, user, attachment);

      if (processResult.success) {
        result.imported++;
        // Update user object with new stats for next iteration
        user.documentsCount++;
        user.storageUsedBytes += BigInt(attachment.content.length);
      } else if (processResult.skipped) {
        result.skipped++;
      } else {
        result.failed++;
        if (processResult.error) {
          result.errors.push(`${attachment.filename}: ${processResult.error}`);
        }
      }
    } catch (error) {
      console.error(`[Email Import] Error processing ${attachment.filename}:`, error);
      result.failed++;
      result.errors.push(
        `${attachment.filename}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Create notification for user
  if (result.imported > 0) {
    const message =
      result.imported === 1
        ? `1 document importé depuis ${senderEmail}`
        : `${result.imported} documents importés depuis ${senderEmail}`;

    await createNotification(user.id, "email_import", "Import par email", message);
  }

  result.success = true;
  console.log(
    `[Email Import] Completed: ${result.imported} imported, ${result.skipped} skipped, ${result.failed} failed`
  );

  return result;
}
