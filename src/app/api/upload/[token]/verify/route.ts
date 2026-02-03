import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST - Verify password for a request
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const { password } = await req.json();

    // Find the request
    const request = await db.documentRequest.findUnique({
      where: { token },
      select: { password: true, expiresAt: true },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(request.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This request has expired" },
        { status: 410 }
      );
    }

    // No password required
    if (!request.password) {
      return NextResponse.json({ success: true });
    }

    // Verify password
    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, request.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Error verifying password" },
      { status: 500 }
    );
  }
}
