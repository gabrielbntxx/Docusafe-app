import crypto from "crypto";

const SHARE_ACCESS_TTL = 60 * 60 * 1000; // 1 hour

function getSecret(): string {
  // Use the existing encryption master key as HMAC secret
  const key = process.env.ENCRYPTION_MASTER_KEY;
  if (!key) throw new Error("ENCRYPTION_MASTER_KEY is required");
  return key;
}

/**
 * Generate a time-limited access token after successful password verification.
 * Token = timestamp.hmac(token:timestamp)
 */
export function generateShareAccessToken(shareToken: string): string {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(`${shareToken}:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

/**
 * Verify a share access token is valid and not expired.
 */
export function verifyShareAccessToken(
  shareToken: string,
  accessToken: string
): boolean {
  const parts = accessToken.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, providedHmac] = parts;
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;

  // Check expiration
  if (Date.now() - ts > SHARE_ACCESS_TTL) return false;

  // Verify HMAC
  const expectedHmac = crypto
    .createHmac("sha256", getSecret())
    .update(`${shareToken}:${timestamp}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(providedHmac, "hex"),
    Buffer.from(expectedHmac, "hex")
  );
}
