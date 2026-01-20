import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  checkRateLimit,
  getClientIdentifier,
  resetRateLimit,
  validatePin,
} from "@/lib/security";

// POST - Verify folder PIN
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting pour les tentatives de PIN
    const clientId = await getClientIdentifier(session.user.id);
    const rateLimit = checkRateLimit(clientId, "pinVerify");

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.error,
          valid: false,
          blocked: true,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetIn),
          },
        }
      );
    }

    const { pin } = await req.json();

    // Get user's PIN
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { folderPin: true },
    });

    if (!user?.folderPin) {
      // No PIN set, allow access
      return NextResponse.json({ valid: true });
    }

    // Validate PIN format
    const pinValidation = validatePin(pin);
    if (!pinValidation.valid) {
      return NextResponse.json(
        { error: pinValidation.error, valid: false },
        { status: 400 }
      );
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, user.folderPin);

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Code PIN incorrect",
          valid: false,
          attemptsRemaining: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    // Reset rate limit on successful verification
    resetRateLimit(clientId, "pinVerify");

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return NextResponse.json(
      { error: "Error verifying PIN", valid: false },
      { status: 500 }
    );
  }
}
