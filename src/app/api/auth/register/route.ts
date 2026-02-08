import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  checkRateLimit,
  getClientIdentifier,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
} from "@/lib/security";
import { generateUserEncryptionKey, encryptUserKey } from "@/lib/encryption";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientId = await getClientIdentifier();
    const rateLimit = checkRateLimit(clientId, "register");

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
          },
        }
      );
    }

    const { name, email, password, phone } = await req.json();

    // Validation du nom
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validation du téléphone (optionnel)
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: phoneValidation.error },
          { status: 400 }
        );
      }
    }

    // Normaliser l'email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    // Hash password avec un coût plus élevé
    const hashedPassword = await bcrypt.hash(password, 12);

    // Générer et chiffrer la clé de chiffrement utilisateur
    const userKey = generateUserEncryptionKey();
    const encryptedKey = encryptUserKey(userKey);

    // Create user with encryption key
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        encryptionKey: encryptedKey,
      },
    });

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing tokens for this email
    await db.emailVerificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Store hashed code
    await db.emailVerificationToken.create({
      data: {
        email: normalizedEmail,
        token: hashedCode,
        expiresAt,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationCodeEmail(normalizedEmail, code, name.trim()).catch(
      (err) => console.error("[Register] Failed to send verification email:", err)
    );

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
