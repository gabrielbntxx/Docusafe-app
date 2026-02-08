import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIdentifier } from "@/lib/security";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = await getClientIdentifier();
    const rateLimit = checkRateLimit(clientId, "emailVerify");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email et code requis" },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Le code doit contenir 6 chiffres" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    // Find the token
    const verificationToken = await db.emailVerificationToken.findFirst({
      where: {
        email: normalizedEmail,
        token: hashedCode,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Code de vérification invalide" },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > verificationToken.expiresAt) {
      await db.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      return NextResponse.json(
        { error: "Le code a expiré. Demandez un nouveau code." },
        { status: 400 }
      );
    }

    // Mark user email as verified
    await db.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    });

    // Clean up all tokens for this email
    await db.emailVerificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    return NextResponse.json({
      message: "Email vérifié avec succès",
      verified: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
