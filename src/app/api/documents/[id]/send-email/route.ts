import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendDocumentEmail } from "@/lib/email";
import { checkRateLimit, getClientIdentifier, validateEmail } from "@/lib/security";
import { getEffectiveUserId } from "@/lib/team";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Rate limiting
    const clientId = await getClientIdentifier(session.user.id);
    const rateLimit = checkRateLimit(clientId, "api");

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { to, message } = body;

    // Validate email
    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { error: "Adresse email requise" },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(to);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate message length
    if (message && typeof message === "string" && message.length > 1000) {
      return NextResponse.json(
        { error: "Le message ne peut pas dépasser 1000 caractères" },
        { status: 400 }
      );
    }

    // Find document and verify ownership
    const effectiveUserId = await getEffectiveUserId(session.user.id);
    const document = await db.document.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        displayName: true,
        folderId: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    if (document.userId !== effectiveUserId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Get sender name
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    const senderName = user?.name || user?.email || "Un utilisateur";

    // Create a temporary share link (48h)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const share = await db.sharedLink.create({
      data: {
        userId: session.user.id,
        token,
        name: `Envoi par email - ${document.displayName}`,
        expiresAt,
        items: {
          create: {
            documentId: document.id,
          },
        },
      },
    });

    // Build download URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://docusafe.online";
    const downloadUrl = `${baseUrl}/share/${token}`;

    // Send email
    const result = await sendDocumentEmail(
      to.trim().toLowerCase(),
      senderName,
      document.displayName,
      downloadUrl,
      message?.trim() || undefined
    );

    if (!result.success) {
      // Clean up the share link if email fails
      await db.sharedLink.delete({ where: { id: share.id } }).catch(() => {});

      const errorMsg = typeof result.error === "string"
        ? result.error
        : "Erreur lors de l'envoi de l'email. Réessayez plus tard.";

      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
