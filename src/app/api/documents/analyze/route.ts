import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFromR2 } from "@/lib/storage";
import {
  analyzeDocument,
  canUseAIAnalysis,
  getOrCreateCategoryFolder,
  calculateFileHash,
} from "@/lib/ai-analysis";
import {
  isEncrypted,
  removeEncryptionMarker,
  decryptDocument,
  decryptUserKey,
} from "@/lib/encryption";
import { getEffectiveUserId } from "@/lib/team";

/**
 * Decrypt file buffer if encrypted.
 * Uses the workspace OWNER's encryption key (effectiveUserId).
 */
async function getDecryptedBuffer(
  fileBuffer: Buffer,
  effectiveUserId: string
): Promise<Buffer> {
  // Check if document is encrypted
  if (!isEncrypted(fileBuffer)) {
    return fileBuffer;
  }

  // Get the workspace owner's encryption key
  const user = await db.user.findUnique({
    where: { id: effectiveUserId },
    select: { encryptionKey: true },
  });

  if (!user?.encryptionKey) {
    throw new Error("User encryption key not found");
  }

  // Decrypt the user's key first
  const userKey = decryptUserKey(user.encryptionKey);

  // Remove encryption marker and decrypt document
  const encryptedData = removeEncryptionMarker(fileBuffer);
  return decryptDocument(encryptedData, userKey);
}

// POST /api/documents/analyze - Analyze a document with AI
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "ID du document requis" },
        { status: 400 }
      );
    }

    // Get effective userId (team owner's ID if member)
    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // Get document
    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    // Check ownership against workspace (shared team or own)
    if (document.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Check if already analyzed
    if (document.aiAnalyzed === 1) {
      return NextResponse.json({
        success: true,
        alreadyAnalyzed: true,
        result: {
          documentType: document.aiDocumentType,
          category: document.aiCategory,
          confidence: document.aiConfidence,
          extractedData: document.aiExtractedData
            ? JSON.parse(document.aiExtractedData)
            : {},
        },
      });
    }

    // Get file from storage
    console.log("[Analyze POST] Fetching document from R2:", document.storageKey);
    const encryptedBuffer = await getFromR2(document.storageKey);
    console.log("[Analyze POST] Got encrypted buffer, size:", encryptedBuffer.length);

    // Decrypt the document using workspace owner's key
    const fileBuffer = await getDecryptedBuffer(encryptedBuffer, effectiveUserId);
    console.log("[Analyze POST] Decrypted buffer, size:", fileBuffer.length);

    // Analyze document (use effectiveUserId for folder tree context and usage tracking)
    console.log("[Analyze POST] Starting AI analysis for:", document.originalName, "mimeType:", document.mimeType);
    const analysis = await analyzeDocument(
      effectiveUserId,
      fileBuffer,
      document.originalName,
      document.mimeType
    );
    console.log("[Analyze POST] Analysis result:", analysis.success, "fromCache:", analysis.fromCache);

    if (!analysis.success) {
      console.error("[Analyze POST] Analysis failed:", analysis.error);
      return NextResponse.json(
        { error: analysis.error || "Analyse échouée" },
        { status: 400 }
      );
    }

    // Update document with analysis results
    await db.document.update({
      where: { id: documentId },
      data: {
        aiAnalyzed: 1,
        aiDocumentType: analysis.result!.documentType,
        aiCategory: analysis.result!.category,
        aiConfidence: analysis.result!.confidence,
        aiExtractedData: JSON.stringify(analysis.result!.extractedData),
        fileHash: calculateFileHash(fileBuffer),
        // Save expiry date if AI detected one
        ...(analysis.result!.extractedData.expiryDate && {
          expiryDate: new Date(analysis.result!.extractedData.expiryDate),
        }),
        // Update display name if suggested
        ...(analysis.result!.suggestedName && {
          displayName: analysis.result!.suggestedName,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      fromCache: analysis.fromCache,
      result: analysis.result,
    });
  } catch (error) {
    console.error("Document analysis error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse" },
      { status: 500 }
    );
  }
}

// PUT /api/documents/analyze - Analyze and auto-sort a document
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "ID du document requis" },
        { status: 400 }
      );
    }

    // Get effective userId (team owner's ID if member)
    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // Get document
    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    // Check ownership against workspace (shared team or own)
    if (document.userId !== effectiveUserId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Get file from storage
    console.log("[Analyze PUT] Fetching document from R2:", document.storageKey);
    const encryptedBuffer = await getFromR2(document.storageKey);
    console.log("[Analyze PUT] Got encrypted buffer, size:", encryptedBuffer.length);

    // Decrypt the document using workspace owner's key
    const fileBuffer = await getDecryptedBuffer(encryptedBuffer, effectiveUserId);
    console.log("[Analyze PUT] Decrypted buffer, size:", fileBuffer.length);

    // Analyze document — skip cache for auto-sort to get fresh folder decisions
    // (cache doesn't store suggestedFolder/folderAction, so cached results lose folder precision)
    console.log("[Analyze PUT] Starting AI analysis for:", document.originalName, "mimeType:", document.mimeType);
    const analysis = await analyzeDocument(
      effectiveUserId,
      fileBuffer,
      document.originalName,
      document.mimeType,
      true // skipCache — ensure fresh folder decision from AI
    );
    console.log("[Analyze PUT] Analysis result:", analysis.success, "fromCache:", analysis.fromCache);

    if (!analysis.success || !analysis.result) {
      console.error("[Analyze PUT] Analysis failed:", analysis.error);
      return NextResponse.json(
        { error: analysis.error || "Analyse échouée" },
        { status: 400 }
      );
    }

    // Get or create folder in the workspace owner's space
    let folderId: string | null = null;
    try {
      folderId = await getOrCreateCategoryFolder(
        effectiveUserId,
        analysis.result.category,
        analysis.result.suggestedFolder,
        analysis.result.folderAction,
        analysis.result.targetFolderId,
        analysis.result.parentFolderId
      );
    } catch (folderError) {
      console.error("[Analyze PUT] Folder creation failed:", folderError);
      // Continue without folder — document is still analyzed
    }

    // Update document with analysis results and move to folder
    await db.document.update({
      where: { id: documentId },
      data: {
        aiAnalyzed: 1,
        aiDocumentType: analysis.result.documentType,
        aiCategory: analysis.result.category,
        aiConfidence: analysis.result.confidence,
        aiExtractedData: JSON.stringify(analysis.result.extractedData),
        fileHash: calculateFileHash(fileBuffer),
        ...(folderId && { folderId }), // Move to folder only if we got one
        // Save expiry date if AI detected one
        ...(analysis.result.extractedData.expiryDate && {
          expiryDate: new Date(analysis.result.extractedData.expiryDate),
        }),
        // Update display name if suggested
        ...(analysis.result.suggestedName && {
          displayName: analysis.result.suggestedName,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      fromCache: analysis.fromCache,
      result: analysis.result,
      folderId,
      folderName: analysis.result.suggestedFolder || analysis.result.category,
    });
  } catch (error) {
    console.error("Document auto-sort error:", error);
    return NextResponse.json(
      { error: "Erreur lors du tri automatique" },
      { status: 500 }
    );
  }
}

// GET /api/documents/analyze/status - Get AI usage status for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const status = await canUseAIAnalysis(session.user.id);

    // Get user's AI sorting preference
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { aiSortingEnabled: true, planType: true, teamOwnerId: true },
    });

    return NextResponse.json({
      ...status,
      aiSortingEnabled: user?.aiSortingEnabled === 1,
      planType: user?.planType,
    });
  } catch (error) {
    console.error("AI status error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du statut" },
      { status: 500 }
    );
  }
}
