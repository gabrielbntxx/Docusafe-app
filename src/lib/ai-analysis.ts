import { db } from "@/lib/db";
import crypto from "crypto";

// Document types that AI can detect
export const DOCUMENT_TYPES = {
  FACTURE: "facture",
  FICHE_DE_PAIE: "fiche_de_paie",
  CV: "cv",
  CONTRAT: "contrat",
  ATTESTATION: "attestation",
  RELEVE_BANCAIRE: "releve_bancaire",
  DOCUMENT_IDENTITE: "document_identite",
  DOCUMENT_MEDICAL: "document_medical",
  CORRESPONDANCE: "correspondance",
  DIPLOME: "diplome",
  ASSURANCE: "assurance",
  IMPOTS: "impots",
  AUTRE: "autre",
} as const;

// Categories for folder organization
export const DOCUMENT_CATEGORIES = {
  FINANCES: { name: "Finances", icon: "wallet", color: "#10B981" },
  EMPLOI: { name: "Emploi", icon: "briefcase", color: "#6366F1" },
  ADMINISTRATIF: { name: "Administratif", icon: "file-text", color: "#F59E0B" },
  SANTE: { name: "Santé", icon: "heart", color: "#EF4444" },
  IDENTITE: { name: "Identité", icon: "user", color: "#8B5CF6" },
  BANQUE: { name: "Banque", icon: "landmark", color: "#3B82F6" },
  AUTRE: { name: "Autres documents", icon: "folder", color: "#6B7280" },
} as const;

// Map document types to categories
export const TYPE_TO_CATEGORY: Record<string, keyof typeof DOCUMENT_CATEGORIES> = {
  facture: "FINANCES",
  fiche_de_paie: "EMPLOI",
  cv: "EMPLOI",
  contrat: "ADMINISTRATIF",
  attestation: "ADMINISTRATIF",
  releve_bancaire: "BANQUE",
  document_identite: "IDENTITE",
  document_medical: "SANTE",
  correspondance: "ADMINISTRATIF",
  diplome: "EMPLOI",
  assurance: "FINANCES",
  impots: "FINANCES",
  autre: "AUTRE",
};

// AI Analysis result type
export type AIAnalysisResult = {
  documentType: string;
  category: string;
  confidence: number;
  suggestedName?: string;
  suggestedFolder?: string;
  extractedData: {
    date?: string;
    amount?: string;
    issuer?: string;
    recipient?: string;
    reference?: string;
  };
  rawResponse?: string;
};

// Free tier limit
const FREE_AI_LIMIT = 10;

/**
 * Calculate SHA-256 hash of file content
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Get current month string (for usage tracking)
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Check if user can use AI analysis (based on plan and usage)
 */
export async function canUseAIAnalysis(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}> {
  // Get user plan
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { planType: true, aiSortingEnabled: true },
  });

  if (!user) {
    return { allowed: false, remaining: 0, limit: 0, reason: "User not found" };
  }

  // Check if user has disabled AI sorting
  if (user.aiSortingEnabled === 0) {
    return { allowed: false, remaining: 0, limit: 0, reason: "AI sorting disabled" };
  }

  // TEMPORARILY UNLIMITED FOR ALL USERS (for testing)
  return { allowed: true, remaining: -1, limit: -1 };
}

/**
 * Increment AI usage count for user
 */
export async function incrementAIUsage(userId: string): Promise<void> {
  const currentMonth = getCurrentMonth();

  await db.aIUsage.upsert({
    where: {
      userId_month: { userId, month: currentMonth },
    },
    create: {
      userId,
      month: currentMonth,
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
  });
}

/**
 * Check cache for existing analysis
 */
export async function getCachedAnalysis(
  fileHash: string
): Promise<AIAnalysisResult | null> {
  const cached = await db.documentAnalysisCache.findUnique({
    where: { fileHash },
  });

  if (!cached) return null;

  return {
    documentType: cached.documentType,
    category: cached.category,
    confidence: cached.confidence,
    suggestedName: cached.suggestedName || undefined,
    extractedData: {
      date: cached.extractedDate || undefined,
      amount: cached.extractedAmount || undefined,
      issuer: cached.extractedIssuer || undefined,
    },
    rawResponse: cached.rawResponse || undefined,
  };
}

/**
 * Save analysis to cache
 */
export async function cacheAnalysis(
  fileHash: string,
  result: AIAnalysisResult
): Promise<void> {
  await db.documentAnalysisCache.upsert({
    where: { fileHash },
    create: {
      fileHash,
      documentType: result.documentType,
      category: result.category,
      confidence: result.confidence,
      suggestedName: result.suggestedName,
      extractedDate: result.extractedData.date,
      extractedAmount: result.extractedData.amount,
      extractedIssuer: result.extractedData.issuer,
      rawResponse: result.rawResponse,
    },
    update: {
      documentType: result.documentType,
      category: result.category,
      confidence: result.confidence,
      suggestedName: result.suggestedName,
      extractedDate: result.extractedData.date,
      extractedAmount: result.extractedData.amount,
      extractedIssuer: result.extractedData.issuer,
      rawResponse: result.rawResponse,
    },
  });
}

/**
 * Analyze document with Gemini AI
 */
export async function analyzeDocumentWithAI(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("[AI Analysis] Starting analysis for:", fileName, "mimeType:", mimeType, "size:", fileBuffer.length);

  if (!apiKey) {
    console.error("[AI Analysis] GEMINI_API_KEY not configured!");
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Convert buffer to base64
  const base64Data = fileBuffer.toString("base64");
  console.log("[AI Analysis] Base64 data length:", base64Data.length);

  // Determine the correct mime type for Gemini
  let geminiMimeType = mimeType;
  if (mimeType === "application/pdf") {
    geminiMimeType = "application/pdf";
  } else if (mimeType.startsWith("image/")) {
    geminiMimeType = mimeType;
  } else {
    // Default to PDF if unknown
    geminiMimeType = "application/pdf";
  }
  console.log("[AI Analysis] Using mimeType for Gemini:", geminiMimeType);

  // Prepare the prompt - more explicit and directive
  const prompt = `Tu es un expert en classification de documents. Analyse attentivement le CONTENU VISUEL de ce document.

REGARDE LE DOCUMENT ET IDENTIFIE:
1. De quel type de document s'agit-il en lisant son contenu
2. Extrait les informations clés visibles

TYPES DE DOCUMENTS (choisis UN seul):
- cv : Si tu vois un curriculum vitae, CV, profil professionnel, expériences professionnelles, compétences, formation d'une personne
- fiche_de_paie : Bulletin de salaire avec salaire brut/net, cotisations
- diplome : Diplôme, certificat, attestation de formation, relevé de notes
- contrat : Contrat de travail, bail, contrat de service avec signatures
- facture : Facture, reçu, ticket de caisse, devis avec montants
- impots : Avis d'imposition, déclaration de revenus, taxes
- assurance : Contrat ou attestation d'assurance
- releve_bancaire : Relevé de compte bancaire, RIB
- attestation : Attestation employeur, domicile, Pôle Emploi
- document_identite : Carte d'identité, passeport, permis de conduire
- document_medical : Ordonnance, compte-rendu médical, carte vitale
- correspondance : Lettre administrative, courrier officiel
- autre : UNIQUEMENT si aucun autre type ne correspond

IMPORTANT:
- Lis le texte visible dans le document
- Si tu vois "CV", "Curriculum Vitae", "Expérience professionnelle", "Compétences", c'est un CV
- Si tu vois "Facture", "Total", "TVA", c'est une facture
- Ne réponds PAS "autre" si tu peux identifier le document

Retourne UNIQUEMENT ce JSON (sans markdown, sans \`\`\`):
{"documentType":"type_choisi","confidence":0.95,"suggestedName":"Nom descriptif","extractedData":{"date":null,"amount":null,"issuer":null,"recipient":null,"reference":null}}`;

  try {
    console.log("[AI Analysis] Calling Gemini API...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: geminiMimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    console.log("[AI Analysis] Gemini response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI Analysis] Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[AI Analysis] Gemini raw response:", JSON.stringify(data, null, 2));

    // Check for blocked content or errors
    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      console.error("[AI Analysis] Content blocked by safety filters");
      throw new Error("Content blocked by safety filters");
    }

    // Extract text from response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("[AI Analysis] Extracted text response:", textResponse);

    if (!textResponse) {
      console.error("[AI Analysis] Empty response from Gemini");
      throw new Error("Empty response from Gemini");
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = textResponse.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    // Clean up any extra whitespace
    jsonStr = jsonStr.trim();
    console.log("[AI Analysis] Cleaned JSON string:", jsonStr);

    const parsed = JSON.parse(jsonStr);
    console.log("[AI Analysis] Parsed result:", parsed);

    // Map document type to category
    const documentType = parsed.documentType || "autre";
    const categoryKey = TYPE_TO_CATEGORY[documentType] || "AUTRE";
    const category = DOCUMENT_CATEGORIES[categoryKey].name;

    console.log("[AI Analysis] Final classification:", documentType, "->", category);

    return {
      documentType,
      category,
      confidence: parsed.confidence || 0.5,
      suggestedName: parsed.suggestedName,
      suggestedFolder: category,
      extractedData: {
        date: parsed.extractedData?.date || undefined,
        amount: parsed.extractedData?.amount || undefined,
        issuer: parsed.extractedData?.issuer || undefined,
        recipient: parsed.extractedData?.recipient || undefined,
        reference: parsed.extractedData?.reference || undefined,
      },
      rawResponse: textResponse,
    };
  } catch (error) {
    console.error("[AI Analysis] CRITICAL ERROR:", error);

    // Return default result on error - BUT log it clearly
    return {
      documentType: "autre",
      category: DOCUMENT_CATEGORIES.AUTRE.name,
      confidence: 0,
      extractedData: {},
      rawResponse: `ERROR: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Main function: Analyze document (with cache and usage tracking)
 */
export async function analyzeDocument(
  userId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{
  success: boolean;
  result?: AIAnalysisResult;
  fromCache?: boolean;
  error?: string;
}> {
  // Calculate file hash
  const fileHash = calculateFileHash(fileBuffer);

  // Check cache first
  const cached = await getCachedAnalysis(fileHash);
  if (cached) {
    return { success: true, result: cached, fromCache: true };
  }

  // Check usage limits
  const canUse = await canUseAIAnalysis(userId);
  if (!canUse.allowed) {
    return { success: false, error: canUse.reason };
  }

  // Analyze with AI
  const result = await analyzeDocumentWithAI(fileBuffer, fileName, mimeType);

  // Cache the result
  await cacheAnalysis(fileHash, result);

  // Increment usage (only for non-cached results)
  await incrementAIUsage(userId);

  return { success: true, result, fromCache: false };
}

/**
 * Get or create folder for category
 */
export async function getOrCreateCategoryFolder(
  userId: string,
  category: string
): Promise<string> {
  // Find existing folder with this name
  const existingFolder = await db.folder.findFirst({
    where: {
      userId,
      name: category,
      parentId: null, // Root level
    },
  });

  if (existingFolder) {
    return existingFolder.id;
  }

  // Create new folder
  const categoryKey = Object.keys(DOCUMENT_CATEGORIES).find(
    (key) => DOCUMENT_CATEGORIES[key as keyof typeof DOCUMENT_CATEGORIES].name === category
  ) as keyof typeof DOCUMENT_CATEGORIES | undefined;

  const categoryInfo = categoryKey
    ? DOCUMENT_CATEGORIES[categoryKey]
    : DOCUMENT_CATEGORIES.AUTRE;

  const newFolder = await db.folder.create({
    data: {
      userId,
      name: category,
      icon: categoryInfo.icon,
      color: categoryInfo.color,
    },
  });

  return newFolder.id;
}
