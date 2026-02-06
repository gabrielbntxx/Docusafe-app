import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST - Set or update folder PIN
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pin } = await req.json();

    // Validate PIN format
    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits" },
        { status: 400 }
      );
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 12);

    // Update user with hashed PIN
    await db.user.update({
      where: { id: session.user.id },
      data: { folderPin: hashedPin },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting PIN:", error);
    return NextResponse.json(
      { error: "Error setting PIN" },
      { status: 500 }
    );
  }
}

// DELETE - Remove folder PIN
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPin } = await req.json();

    // Get user's current PIN
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { folderPin: true },
    });

    if (!user?.folderPin) {
      return NextResponse.json(
        { error: "No PIN is currently set" },
        { status: 400 }
      );
    }

    // Verify current PIN
    const isValid = await bcrypt.compare(currentPin, user.folderPin);

    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect PIN" },
        { status: 401 }
      );
    }

    // Remove PIN
    await db.user.update({
      where: { id: session.user.id },
      data: { folderPin: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing PIN:", error);
    return NextResponse.json(
      { error: "Error removing PIN" },
      { status: 500 }
    );
  }
}
