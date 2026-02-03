import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// POST - Upload a file to a request
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find the request
    const request = await db.documentRequest.findUnique({
      where: { token },
      include: {
        _count: {
          select: { uploads: true },
        },
      },
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

    // Check if max files reached
    if (request._count.uploads >= request.maxFiles) {
      return NextResponse.json(
        { error: "Maximum files limit reached" },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;
    const uploaderName = formData.get("uploaderName") as string;
    const uploaderEmail = formData.get("uploaderEmail") as string;
    const note = formData.get("note") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Verify password if required
    if (request.password) {
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
    }

    // Validate file
    const maxFileSize = (request.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${request.maxFileSize}MB` },
        { status: 400 }
      );
    }

    // Get file details
    const originalName = file.name;
    const fileType = originalName.split(".").pop()?.toLowerCase() || "unknown";
    const mimeType = file.type || "application/octet-stream";

    // Generate storage key
    const uniqueId = randomBytes(16).toString("hex");
    const storageKey = `requests/${request.id}/${uniqueId}.${fileType}`;

    // Upload to R2
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    );

    // Save upload record
    const upload = await db.requestUpload.create({
      data: {
        requestId: request.id,
        originalName,
        fileType,
        mimeType,
        sizeBytes: file.size,
        storageKey,
        uploaderName: uploaderName?.trim() || null,
        uploaderEmail: uploaderEmail?.trim() || null,
        note: note?.trim() || null,
      },
    });

    // Update request stats
    await db.documentRequest.update({
      where: { id: request.id },
      data: {
        filesReceived: { increment: 1 },
        status:
          request._count.uploads + 1 >= request.maxFiles ? "completed" : "pending",
      },
    });

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
