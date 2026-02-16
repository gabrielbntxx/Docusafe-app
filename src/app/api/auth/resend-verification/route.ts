import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIdentifier } from "@/lib/security";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = await getClientIdentifier();
    const rateLimit = checkRateLimit(clientId, "resendCode");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user (always return success to prevent email enumeration)
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({
        message: "Si un compte non vérifié existe, un nouveau code a été envoyé.",
      });
    }

    // Delete existing tokens
    await db.emailVerificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.emailVerificationToken.create({
      data: {
        email: normalizedEmail,
        token: hashedCode,
        expiresAt,
      },
    });

    // Send email (blocking)
    const emailResult = await sendVerificationCodeEmail(normalizedEmail, code, user.name || undefined);

    return NextResponse.json({
      message: "Si un compte non vérifié existe, un nouveau code a été envoyé.",
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
