import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE - Delete a document request
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if request exists and belongs to user
    const request = await db.documentRequest.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Delete the request (cascade will delete uploads)
    await db.documentRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Error deleting request" },
      { status: 500 }
    );
  }
}

// GET - Get a single request details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const request = await db.documentRequest.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        uploads: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: request.id,
      token: request.token,
      title: request.title,
      description: request.description,
      recipientName: request.recipientName,
      recipientEmail: request.recipientEmail,
      expiresAt: request.expiresAt.toISOString(),
      status: request.status,
      maxFiles: request.maxFiles,
      viewCount: request.viewCount,
      hasPassword: !!request.password,
      createdAt: request.createdAt.toISOString(),
      uploads: request.uploads.map((u) => ({
        id: u.id,
        originalName: u.originalName,
        fileType: u.fileType,
        sizeBytes: Number(u.sizeBytes),
        uploaderName: u.uploaderName,
        uploaderEmail: u.uploaderEmail,
        note: u.note,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json(
      { error: "Error fetching request" },
      { status: 500 }
    );
  }
}
