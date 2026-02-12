import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { validateFile, checkRateLimit, getClientIdentifier } from "@/lib/security";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Maximum file size: 1GB
const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024;

// POST - Upload a file to a request
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Rate limit password attempts per IP + token
    const clientId = await getClientIdentifier();
    const rateLimit = checkRateLimit(`${clientId}_upload_${token}`, "sharedAccess");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    // Find the request with user info
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

    // Validate file size (max 1GB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 1GB" },
        { status: 400 }
      );
    }

    // Read file buffer for validation
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Validate file type, extension, magic bytes
    const validation = await validateFile(file, fileBuffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(". ") },
        { status: 400 }
      );
    }

    // Get file details using sanitized name
    const originalName = validation.sanitizedName;
    const fileType = originalName.split(".").pop()?.toLowerCase() || "unknown";
    const mimeType = file.type || "application/octet-stream";

    // Generate storage key
    const uniqueId = randomBytes(32).toString("hex");
    const storageKey = `requests/${request.id}/${uniqueId}.${fileType}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    );

    // Calculate file hash for potential AI caching
    const fileHash = createHash("sha256").update(fileBuffer).digest("hex");

    // Find or create "Demandés" folder for the user
    let demandesFolder = await db.folder.findFirst({
      where: {
        userId: request.userId,
        name: "Demandés",
      },
    });

    if (!demandesFolder) {
      demandesFolder = await db.folder.create({
        data: {
          userId: request.userId,
          name: "Demandés",
          color: "#8B5CF6", // Purple color
          icon: "inbox",
          isDefault: 0,
        },
      });
    }

    // Create Document record for the user
    const document = await db.document.create({
      data: {
        userId: request.userId,
        folderId: demandesFolder.id,
        originalName,
        displayName: originalName,
        fileType,
        mimeType,
        sizeBytes: file.size,
        storageKey,
        isEncrypted: 0,
        aiAnalyzed: 0,
        fileHash,
        description: note?.trim() || (uploaderName ? `Envoyé par ${uploaderName}` : null),
        tags: request.title || "",
      },
    });

    // Update user storage stats
    await db.user.update({
      where: { id: request.userId },
      data: {
        documentsCount: { increment: 1 },
        storageUsedBytes: { increment: file.size },
      },
    });

    // Save upload record with document link
    const upload = await db.requestUpload.create({
      data: {
        requestId: request.id,
        documentId: document.id,
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

    // Create notification for the user
    await db.notification.create({
      data: {
        userId: request.userId,
        type: "document_received",
        title: "Document reçu",
        message: `${uploaderName || "Quelqu'un"} vous a envoyé "${originalName}" via votre demande "${request.title}"`,
      },
    });

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      documentId: document.id,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
