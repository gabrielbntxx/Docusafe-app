import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIdentifier } from "@/lib/security";
import { sendVerificationCodeEmail } from "@/lib/email";

/**
 * POST /api/auth/check-verification
 * Checks credentials and email verification status BEFORE signIn.
 * If credentials are valid but email is unverified, sends a new code.
 */
export async function POST(req: Request) {
  try {
    const clientId = await getClientIdentifier();
    const rateLimit = checkRateLimit(clientId, "login");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { status: "invalid_credentials" },
        { status: 401 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { status: "invalid_credentials" },
        { status: 401 }
      );
    }

    // User exists but has no password — registered via Google/Apple OAuth
    if (!user.password) {
      return NextResponse.json(
        { status: "google_account" },
        { status: 200 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { status: "invalid_credentials" },
        { status: 401 }
      );
    }

    // Credentials are valid — check verification
    if (!user.emailVerified) {
      // Auto-send a new verification code
      await db.emailVerificationToken.deleteMany({
        where: { email: normalizedEmail },
      });

      const code = crypto.randomInt(100000, 1000000).toString();
      const hashedCode = crypto
        .createHash("sha256")
        .update(code)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.emailVerificationToken.create({
        data: {
          email: normalizedEmail,
          token: hashedCode,
          expiresAt,
        },
      });

      await sendVerificationCodeEmail(
        normalizedEmail,
        code,
        user.name || undefined
      );

      return NextResponse.json({ status: "needs_verification" });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Check Verification] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
