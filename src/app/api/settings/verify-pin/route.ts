import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST - Verify folder PIN
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "Invalid PIN format", valid: false },
        { status: 400 }
      );
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, user.folderPin);

    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect PIN", valid: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return NextResponse.json(
      { error: "Error verifying PIN", valid: false },
      { status: 500 }
    );
  }
}
