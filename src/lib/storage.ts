import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Storage limits by plan (in bytes)
export const STORAGE_LIMITS: Record<string, number> = {
  STUDENT: 100 * 1024 * 1024 * 1024, // 100 GB
  PRO: 200 * 1024 * 1024 * 1024, // 200 GB
  BUSINESS: Infinity, // Unlimited
} as const;

const DEFAULT_STORAGE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB for non-subscribed users

// File size limits per upload (in bytes)
const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100 MB per file

// Document count limits
export const DOCUMENT_LIMITS: Record<string, number> = {
  STUDENT: Infinity,
  PRO: Infinity,
  BUSINESS: Infinity,
} as const;

const DEFAULT_DOCUMENT_LIMIT = 15;

// Initialize R2 client
const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "docu-safe";

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await R2.send(command);
}

/**
 * Get a file from R2
 */
export async function getFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await R2.send(command);

  if (!response.Body) {
    throw new Error("File not found");
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await R2.send(command);
}

/**
 * Get a signed URL for direct file access (for viewing)
 */
export async function getSignedViewUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(R2, command, { expiresIn });
}

/**
 * Generate a unique storage key for a file
 */
export function generateStorageKey(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "";
  return `${userId}/${timestamp}-${randomStr}.${extension}`;
}

/**
 * Check if user can upload based on their plan limits
 */
export function checkStorageLimit(
  planType: string,
  currentStorageBytes: number,
  newFileSizeBytes: number
): { allowed: boolean; reason?: string; limit: number; used: number } {
  const limit = STORAGE_LIMITS[planType] || DEFAULT_STORAGE_LIMIT;
  const used = currentStorageBytes;
  const afterUpload = used + newFileSizeBytes;

  if (afterUpload > limit) {
    const limitGB = (limit / (1024 * 1024 * 1024)).toFixed(0);
    const usedMB = (used / (1024 * 1024)).toFixed(2);
    return {
      allowed: false,
      reason: `Limite de stockage atteinte (${usedMB}MB / ${limitGB}GB). Passez à un plan supérieur pour plus d'espace.`,
      limit,
      used,
    };
  }

  return { allowed: true, limit, used };
}

/**
 * Check if file size is within plan limits
 */
export function checkFileSizeLimit(
  planType: string,
  fileSizeBytes: number
): { allowed: boolean; reason?: string } {
  if (fileSizeBytes > FILE_SIZE_LIMIT) {
    const limitMB = (FILE_SIZE_LIMIT / (1024 * 1024)).toFixed(0);
    return {
      allowed: false,
      reason: `Fichier trop volumineux. Limite: ${limitMB}MB par fichier.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can upload more documents based on their plan
 */
export function checkDocumentLimit(
  planType: string,
  currentDocumentCount: number
): { allowed: boolean; reason?: string } {
  const limit = DOCUMENT_LIMITS[planType] || DEFAULT_DOCUMENT_LIMIT;

  if (currentDocumentCount >= limit) {
    return {
      allowed: false,
      reason: `Limite de ${limit} documents atteinte. Passez à un plan supérieur pour des documents illimités.`,
    };
  }

  return { allowed: true };
}
