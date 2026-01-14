import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createNotification } from "@/lib/notifications";

// GET - List all folders for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const folders = await db.folder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert BigInt counts to numbers for JSON serialization
    const serializedFolders = folders.map((folder) => ({
      ...folder,
      isDefault: folder.isDefault === 1,
      documentCount: Number(folder._count.documents),
      hasPin: !!folder.pin,
      pin: undefined, // Don't send PIN hash to client
      _count: undefined,
    }));

    return NextResponse.json(serializedFolders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des dossiers" },
      { status: 500 }
    );
  }
}

// POST - Create a new folder
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, color, icon, pin } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Hash PIN if provided
    let hashedPin = null;
    if (pin && pin.trim().length > 0) {
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { error: "PIN must be exactly 4 digits" },
          { status: 400 }
        );
      }
      hashedPin = await bcrypt.hash(pin, 10);
    }

    const folder = await db.folder.create({
      data: {
        name: name.trim(),
        color: color || "#3B82F6",
        icon: icon || "folder",
        userId: session.user.id,
        pin: hashedPin,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    const serializedFolder = {
      ...folder,
      isDefault: folder.isDefault === 1,
      documentCount: Number(folder._count.documents),
      hasPin: !!folder.pin,
      pin: undefined, // Don't send PIN hash to client
      _count: undefined,
    };

    // Créer une notification
    await createNotification(
      session.user.id,
      "folder_created",
      folder.name
    );

    return NextResponse.json(serializedFolder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du dossier" },
      { status: 500 }
    );
  }
}
