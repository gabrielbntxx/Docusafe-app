import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

// Use RESEND_INBOUND_DOMAIN env var (e.g. "cool-hedgehog.resend.app" for free plan)
const IMPORT_EMAIL_DOMAIN =
  process.env.RESEND_INBOUND_DOMAIN || "import.docusafe.online";

/**
 * Generate a unique, URL-safe import email ID
 * Format: first part of email + 6 random chars
 */
function generateImportEmailId(email: string): string {
  const emailPrefix = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomPart = crypto.randomBytes(3).toString("hex"); // 6 chars
  return `${emailPrefix}-${randomPart}`;
}

/**
 * GET - Get current import email address
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { importEmailId: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no importEmailId exists, generate one automatically
    if (!user.importEmailId) {
      const importEmailId = generateImportEmailId(user.email);

      await db.user.update({
        where: { id: session.user.id },
        data: { importEmailId },
      });

      return NextResponse.json({
        importEmail: `${importEmailId}@${IMPORT_EMAIL_DOMAIN}`,
        importEmailId,
      });
    }

    return NextResponse.json({
      importEmail: `${user.importEmailId}@${IMPORT_EMAIL_DOMAIN}`,
      importEmailId: user.importEmailId,
    });
  } catch (error) {
    console.error("Error getting import email:", error);
    return NextResponse.json(
      { error: "Error getting import email" },
      { status: 500 }
    );
  }
}

/**
 * POST - Regenerate import email address (get a new one)
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new unique import email ID
    const importEmailId = generateImportEmailId(user.email);

    await db.user.update({
      where: { id: session.user.id },
      data: { importEmailId },
    });

    return NextResponse.json({
      importEmail: `${importEmailId}@${IMPORT_EMAIL_DOMAIN}`,
      importEmailId,
      message: "Import email regenerated successfully",
    });
  } catch (error) {
    console.error("Error regenerating import email:", error);
    return NextResponse.json(
      { error: "Error regenerating import email" },
      { status: 500 }
    );
  }
}
