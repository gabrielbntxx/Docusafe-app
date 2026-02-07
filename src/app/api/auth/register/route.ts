import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  checkRateLimit,
  getClientIdentifier,
  validateEmail,
  validatePassword,
  validateName,
} from "@/lib/security";
import { generateUserEncryptionKey, encryptUserKey } from "@/lib/encryption";

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

    const { name, email, password } = await req.json();

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
        encryptionKey: encryptedKey,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
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
