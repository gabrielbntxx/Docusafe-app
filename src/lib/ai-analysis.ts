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

  // Premium users have unlimited
  if (user.planType === "PREMIUM" || user.planType === "PRO") {
    return { allowed: true, remaining: -1, limit: -1 }; // -1 = unlimited
  }

  // Free users: check monthly limit
  const currentMonth = getCurrentMonth();
  const usage = await db.aIUsage.findUnique({
    where: {
      userId_month: { userId, month: currentMonth },
    },
  });

  const currentCount = usage?.count || 0;
  const remaining = Math.max(0, FREE_AI_LIMIT - currentCount);

  return {
    allowed: remaining > 0,
    remaining,
    limit: FREE_AI_LIMIT,
    reason: remaining === 0 ? "Monthly limit reached" : undefined,
  };
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

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Convert buffer to base64
  const base64Data = fileBuffer.toString("base64");

  // Prepare the prompt
  const prompt = `Analyse ce document et retourne un JSON avec les informations suivantes.
Tu dois identifier le type de document et extraire les métadonnées pertinentes.

Types de documents possibles:
- cv (curriculum vitae, CV, résumé, lettre de motivation)
- fiche_de_paie (bulletin de salaire, fiche de paie)
- diplome (diplôme, certificat, attestation de formation, relevé de notes)
- contrat (contrat de travail, bail, contrat de service)
- facture (facture, reçu, ticket de caisse, devis)
- impots (avis d'imposition, déclaration de revenus, taxe foncière, taxe d'habitation)
- assurance (contrat d'assurance, attestation d'assurance, carte verte)
- releve_bancaire (relevé de compte, RIB, relevé bancaire)
- attestation (attestation employeur, attestation de domicile, attestation Pôle Emploi)
- document_identite (carte d'identité, passeport, permis de conduire, titre de séjour)
- document_medical (ordonnance, compte-rendu médical, carte vitale, analyse médicale)
- correspondance (lettre administrative, courrier officiel)
- autre (si aucun type ne correspond)

Retourne UNIQUEMENT un JSON valide (sans markdown) avec cette structure:
{
  "documentType": "type_du_document",
  "confidence": 0.95,
  "suggestedName": "Nom suggéré pour le fichier",
  "extractedData": {
    "date": "2024-01-15",
    "amount": "150.00 EUR",
    "issuer": "Nom de l'émetteur",
    "recipient": "Nom du destinataire",
    "reference": "Numéro de référence si présent"
  }
}

Si une information n'est pas trouvée, mets null.
Le nom suggéré doit être descriptif et inclure la date si possible (ex: "Facture EDF Janvier 2024", "CV Jean Dupont 2024").`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                    mime_type: mimeType,
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

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract text from response
    const textResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = textResponse.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    // Map document type to category
    const documentType = parsed.documentType || "autre";
    const categoryKey = TYPE_TO_CATEGORY[documentType] || "AUTRE";
    const category = DOCUMENT_CATEGORIES[categoryKey].name;

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
    console.error("AI analysis error:", error);

    // Return default result on error
    return {
      documentType: "autre",
      category: DOCUMENT_CATEGORIES.AUTRE.name,
      confidence: 0,
      extractedData: {},
      rawResponse: error instanceof Error ? error.message : "Unknown error",
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
