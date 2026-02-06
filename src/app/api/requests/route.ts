import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

// GET - List user's document requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has PRO or BUSINESS plan
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true },
    });

    if (!user || (user.planType !== "PRO" && user.planType !== "BUSINESS")) {
      return NextResponse.json(
        { error: "This feature requires a Pro or Business plan" },
        { status: 403 }
      );
    }

    const requests = await db.documentRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { uploads: true },
        },
        uploads: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
            sizeBytes: true,
            uploaderName: true,
            uploaderEmail: true,
            note: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(
      requests.map((r) => ({
        id: r.id,
        token: r.token,
        title: r.title,
        description: r.description,
        recipientName: r.recipientName,
        recipientEmail: r.recipientEmail,
        expiresAt: r.expiresAt.toISOString(),
        status: r.status,
        filesReceived: r._count.uploads,
        maxFiles: r.maxFiles,
        viewCount: r.viewCount,
        hasPassword: !!r.password,
        createdAt: r.createdAt.toISOString(),
        uploads: r.uploads.map((u) => ({
          id: u.id,
          originalName: u.originalName,
          fileType: u.fileType,
          sizeBytes: u.sizeBytes.toString(),
          uploaderName: u.uploaderName,
          uploaderEmail: u.uploaderEmail,
          note: u.note,
          createdAt: u.createdAt.toISOString(),
        })),
      }))
    );
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Error fetching requests" },
      { status: 500 }
    );
  }
}

// POST - Create a new document request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has PRO or BUSINESS plan
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true },
    });

    if (!user || (user.planType !== "PRO" && user.planType !== "BUSINESS")) {
      return NextResponse.json(
        { error: "This feature requires a Pro or Business plan" },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      recipientName,
      recipientEmail,
      password,
      expiresInDays,
      maxFiles,
    } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = randomBytes(16).toString("hex");

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7));

    const request = await db.documentRequest.create({
      data: {
        userId: session.user.id,
        token,
        title: title.trim(),
        description: description?.trim() || null,
        recipientName: recipientName?.trim() || null,
        recipientEmail: recipientEmail?.trim() || null,
        password: hashedPassword,
        expiresAt,
        maxFiles: maxFiles || 5,
        maxFileSize: 1024, // 1GB max file size
      },
    });

    return NextResponse.json({
      id: request.id,
      token: request.token,
      title: request.title,
      description: request.description,
      recipientName: request.recipientName,
      recipientEmail: request.recipientEmail,
      expiresAt: request.expiresAt.toISOString(),
      status: request.status,
      filesReceived: 0,
      maxFiles: request.maxFiles,
      viewCount: 0,
      hasPassword: !!request.password,
      createdAt: request.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Error creating request" },
      { status: 500 }
    );
  }
}
