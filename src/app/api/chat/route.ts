import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFromR2 } from "@/lib/storage";
import { decryptDocument, decryptUserKey, removeEncryptionMarker } from "@/lib/encryption";
import { analyzeDocumentWithAI, getOrCreateCategoryFolder } from "@/lib/ai-analysis";

// Helper to get user encryption key
async function getUserEncryptionKey(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { encryptionKey: true },
  });
  if (!user?.encryptionKey) return null;
  return decryptUserKey(user.encryptionKey);
}

// ============================================================================
// DOCUBOT SYSTEM PROMPT
// ============================================================================
const DOCUBOT_SYSTEM_PROMPT = `Tu es DocuBot, l'assistant de DocuSafe. Tu aides les utilisateurs à gérer leurs documents.

## RÈGLES DE COMMUNICATION
- Parle simplement, comme à un ami
- Tutoie l'utilisateur
- 1-2 emojis max par message
- Phrases courtes en français
- JAMAIS d'ID, de termes techniques ou de jargon

## INTELLIGENCE - COMPRENDRE LES DEMANDES
Tu dois être INTELLIGENT et comprendre ce que l'utilisateur veut même s'il ne donne pas tous les détails :

### Expressions courantes et leur signification :
- "mon dernier document" / "le dernier" → Le document le plus récent (position 1 dans la liste)
- "ma facture" / "une facture" → Chercher dans les documents de type facture
- "mon CV" / "le CV" → Chercher un document contenant "CV" dans le nom
- "mes impôts" / "déclaration" → Documents liés aux impôts
- "quittance" / "loyer" → Documents de loyer
- "carte d'identité" / "pièce d'identité" → Documents d'identité
- "le document dont on parlait" → Utiliser le contexte de la conversation

### Comment trouver le bon document :
1. Si l'utilisateur dit "mon dernier" → Prends le PREMIER document de la liste (le plus récent)
2. Si l'utilisateur mentionne un type (facture, CV, etc.) → Cherche par ce mot-clé
3. Si l'utilisateur donne un nom partiel → Cherche le document qui contient ce mot
4. En cas de doute → Propose les 2-3 documents les plus probables

## CONTEXTE UTILISATEUR
{context}

## RÈGLE CRITIQUE - EXÉCUTION IMMÉDIATE
⚠️ TRÈS IMPORTANT : Quand l'utilisateur demande une action, tu dois APPELER LA FONCTION IMMÉDIATEMENT.

❌ NE JAMAIS DIRE : "Je vais résumer...", "Voici le résumé...", "Le résumé est prêt..."
❌ NE JAMAIS ANNONCER ce que tu vas faire
❌ NE JAMAIS répondre sans avoir appelé la fonction

✅ TOUJOURS : Appeler la fonction PUIS donner le résultat

### Exemples :
- "Résume mon dernier document" → APPELLE summarizeDocument() avec l'ID du document en position 1
- "Cherche mes factures" → APPELLE searchDocuments("facture")
- "Montre mes documents" → APPELLE getRecentDocuments()

Si tu réponds SANS appeler de fonction quand une action est demandée, c'est une ERREUR.

## RÉPONSES
Après avoir appelé une fonction, présente le résultat simplement :
✅ "Voici le résumé : [contenu du résumé]"
✅ "J'ai trouvé 3 factures : [liste]"
❌ Ne jamais montrer d'ID ou termes techniques`;

// ============================================================================
// FUNCTION DEFINITIONS FOR GEMINI
// ============================================================================
const FUNCTION_DECLARATIONS = [
  {
    name: "getRecentDocuments",
    description: "Obtient les documents les plus récents. Utilise cette fonction quand l'utilisateur dit 'mes documents récents', 'mon dernier document', 'mes derniers fichiers', etc.",
    parameters: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Nombre de documents à récupérer (1 pour le dernier, 5 pour les 5 derniers, etc.). Par défaut: 5",
        },
      },
    },
  },
  {
    name: "searchDocuments",
    description: "Recherche des documents par nom, type ou catégorie. Utilise cette fonction quand l'utilisateur cherche un document spécifique par mot-clé (facture, CV, impôts, etc.)",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Terme de recherche (nom partiel, type comme 'facture', 'CV', 'impôts', etc.)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "getDocumentContent",
    description: "Récupère et analyse le contenu d'un document",
    parameters: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "L'ID du document",
        },
      },
      required: ["documentId"],
    },
  },
  {
    name: "summarizeDocument",
    description: "Génère un résumé d'un document. Pour 'résume mon dernier document', utilise d'abord getRecentDocuments(1) pour avoir l'ID",
    parameters: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "L'ID du document à résumer",
        },
      },
      required: ["documentId"],
    },
  },
  {
    name: "moveDocument",
    description: "Déplace un document vers un dossier",
    parameters: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "L'ID du document à déplacer",
        },
        folderId: {
          type: "string",
          description: "L'ID du dossier de destination",
        },
      },
      required: ["documentId", "folderId"],
    },
  },
  {
    name: "reclassifyDocument",
    description: "Réanalyse et reclasse un document avec l'IA",
    parameters: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "L'ID du document à reclasser",
        },
      },
      required: ["documentId"],
    },
  },
  {
    name: "listFolders",
    description: "Liste tous les dossiers disponibles",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];

// ============================================================================
// FUNCTION IMPLEMENTATIONS
// ============================================================================

// Helper: format date in friendly way
function formatFriendlyDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return `le ${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
}

async function getRecentDocuments(userId: string, count: number = 5) {
  const documents = await db.document.findMany({
    where: { userId },
    select: {
      id: true,
      displayName: true,
      aiCategory: true,
      uploadedAt: true,
      folder: { select: { name: true } },
    },
    orderBy: { uploadedAt: "desc" },
    take: Math.min(count, 10),
  });

  if (documents.length === 0) {
    return { success: true, message: "Tu n'as pas encore de documents.", documents: [] };
  }

  return {
    success: true,
    message: count === 1
      ? `Ton dernier document est "${documents[0].displayName}"`
      : `Tes ${documents.length} derniers documents`,
    documents: documents.map((d, index) => ({
      id: d.id,
      name: d.displayName,
      folder: d.folder?.name || "non classé",
      addedDate: formatFriendlyDate(new Date(d.uploadedAt)),
      isLatest: index === 0,
    })),
  };
}

async function searchDocuments(userId: string, query: string) {
  const documents = await db.document.findMany({
    where: {
      userId,
      OR: [
        { displayName: { contains: query, mode: "insensitive" } },
        { aiDocumentType: { contains: query, mode: "insensitive" } },
        { aiCategory: { contains: query, mode: "insensitive" } },
        { fileType: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      displayName: true,
      fileType: true,
      aiDocumentType: true,
      aiCategory: true,
      uploadedAt: true,
      folder: { select: { id: true, name: true } },
    },
    orderBy: { uploadedAt: "desc" },
    take: 10,
  });

  if (documents.length === 0) {
    return { success: true, message: "Aucun document trouvé pour cette recherche.", documents: [] };
  }

  return {
    success: true,
    message: `${documents.length} document(s) trouvé(s)`,
    documents: documents.map((d) => ({
      id: d.id, // Needed for internal operations, but DocuBot won't show this
      name: d.displayName,
      folder: d.folder?.name || "non classé",
      addedDate: formatFriendlyDate(new Date(d.uploadedAt)),
    })),
  };
}

async function getDocumentContent(userId: string, documentId: string) {
  const document = await db.document.findFirst({
    where: { id: documentId, userId },
    select: {
      id: true,
      displayName: true,
      storageKey: true,
      mimeType: true,
      fileType: true,
      isEncrypted: true,
      aiDocumentType: true,
      aiCategory: true,
      aiExtractedData: true,
    },
  });

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  // Si on a déjà des données extraites par l'IA, les retourner
  if (document.aiExtractedData) {
    try {
      const extractedData = JSON.parse(document.aiExtractedData);
      return {
        success: true,
        document: {
          name: document.displayName,
          type: document.aiDocumentType || document.fileType,
          category: document.aiCategory,
          extractedData,
        },
      };
    } catch (e) {
      // Continue to fetch and analyze
    }
  }

  // Sinon, récupérer le fichier et l'analyser
  try {
    const encryptedData = await getFromR2(document.storageKey);
    if (!encryptedData) {
      return { success: false, error: "Fichier non trouvé dans le stockage" };
    }

    let fileBuffer: Buffer;
    if (document.isEncrypted === 1) {
      const userKey = await getUserEncryptionKey(userId);
      if (!userKey) {
        return { success: false, error: "Clé de chiffrement non trouvée" };
      }
      const decryptableData = removeEncryptionMarker(encryptedData);
      fileBuffer = decryptDocument(decryptableData, userKey);
    } else {
      fileBuffer = encryptedData;
    }

    // Analyser avec l'IA
    const analysis = await analyzeDocumentWithAI(fileBuffer, document.displayName, document.mimeType);

    return {
      success: true,
      document: {
        name: document.displayName,
        type: analysis.documentType,
        category: analysis.category,
        extractedData: analysis.extractedData,
        suggestedName: analysis.suggestedName,
      },
    };
  } catch (error) {
    console.error("Error reading document:", error);
    return { success: false, error: "Erreur lors de la lecture du document" };
  }
}

async function summarizeDocument(userId: string, documentId: string) {
  console.log("[DocuBot] summarizeDocument called with:", { userId, documentId });

  const document = await db.document.findFirst({
    where: { id: documentId, userId },
    select: {
      id: true,
      displayName: true,
      storageKey: true,
      mimeType: true,
      isEncrypted: true,
    },
  });

  console.log("[DocuBot] Document found:", document);

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  try {
    console.log("[DocuBot] Fetching from R2:", document.storageKey);
    const fileData = await getFromR2(document.storageKey);
    console.log("[DocuBot] File fetched, size:", fileData?.length || 0, "bytes");

    let fileBuffer: Buffer;
    console.log("[DocuBot] isEncrypted value:", document.isEncrypted, "type:", typeof document.isEncrypted);

    if (document.isEncrypted === 1) {
      console.log("[DocuBot] Document is encrypted, getting user key...");
      const userKey = await getUserEncryptionKey(userId);
      if (!userKey) {
        console.error("[DocuBot] No encryption key found");
        return { success: false, error: "Clé de chiffrement non trouvée" };
      }
      console.log("[DocuBot] Removing encryption marker and decrypting...");
      const decryptableData = removeEncryptionMarker(fileData);
      fileBuffer = decryptDocument(decryptableData, userKey);
      console.log("[DocuBot] Decrypted, size:", fileBuffer.length, "bytes");
    } else {
      console.log("[DocuBot] Document is not encrypted");
      fileBuffer = fileData;
    }

    // Call Gemini for summary
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[DocuBot] No GEMINI_API_KEY");
      return { success: false, error: "Service IA non disponible" };
    }

    const base64Data = fileBuffer.toString("base64");
    console.log("[DocuBot] Calling Gemini API, mime:", document.mimeType, "base64 length:", base64Data.length);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Résume ce document en français en 3-5 points clés. Sois concis et précis. Si c'est une photo, décris ce qu'elle montre.`,
                },
                {
                  inline_data: {
                    mime_type: document.mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      }
    );

    console.log("[DocuBot] Gemini response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DocuBot] Summarize API error:", response.status, errorText);
      return { success: false, error: `Erreur API: ${response.status}` };
    }

    const data = await response.json();
    console.log("[DocuBot] Summarize response:", JSON.stringify(data, null, 2));

    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      return { success: false, error: "Document bloqué par les filtres de sécurité" };
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      console.error("[DocuBot] No summary in response:", data);
      return { success: false, error: "Pas de résumé généré" };
    }

    console.log("[DocuBot] Summary generated successfully");
    return {
      success: true,
      document: document.displayName,
      summary,
    };
  } catch (error) {
    console.error("[DocuBot] Error summarizing document:", error);
    return { success: false, error: `Erreur: ${error instanceof Error ? error.message : 'inconnu'}` };
  }
}

async function moveDocument(userId: string, documentId: string, folderId: string) {
  const document = await db.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  const folder = await db.folder.findFirst({
    where: { id: folderId, userId },
  });

  if (!folder) {
    return { success: false, error: "Dossier non trouvé" };
  }

  await db.document.update({
    where: { id: documentId },
    data: { folderId },
  });

  return {
    success: true,
    message: `Document "${document.displayName}" déplacé vers "${folder.name}"`,
  };
}

async function reclassifyDocument(userId: string, documentId: string) {
  const document = await db.document.findFirst({
    where: { id: documentId, userId },
    select: {
      id: true,
      displayName: true,
      storageKey: true,
      mimeType: true,
      isEncrypted: true,
      aiCategory: true,
    },
  });

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  try {
    const encryptedData = await getFromR2(document.storageKey);
    if (!encryptedData) {
      return { success: false, error: "Fichier non trouvé" };
    }

    let fileBuffer: Buffer;
    if (document.isEncrypted === 1) {
      const userKey = await getUserEncryptionKey(userId);
      if (!userKey) {
        return { success: false, error: "Clé de chiffrement non trouvée" };
      }
      const decryptableData = removeEncryptionMarker(encryptedData);
      fileBuffer = decryptDocument(decryptableData, userKey);
    } else {
      fileBuffer = encryptedData;
    }

    // Re-analyze with AI
    const analysis = await analyzeDocumentWithAI(fileBuffer, document.displayName, document.mimeType);

    // Get or create folder for category
    const folderId = await getOrCreateCategoryFolder(userId, analysis.category);

    // Update document
    await db.document.update({
      where: { id: documentId },
      data: {
        aiAnalyzed: 1,
        aiDocumentType: analysis.documentType,
        aiCategory: analysis.category,
        aiConfidence: analysis.confidence,
        aiExtractedData: JSON.stringify(analysis.extractedData),
        folderId,
      },
    });

    const oldCategory = document.aiCategory || "Non classé";

    return {
      success: true,
      message: `Document reclassé de "${oldCategory}" vers "${analysis.category}"`,
      newType: analysis.documentType,
      newCategory: analysis.category,
      confidence: Math.round(analysis.confidence * 100),
    };
  } catch (error) {
    console.error("Error reclassifying document:", error);
    return { success: false, error: "Erreur lors du reclassement" };
  }
}

async function listFolders(userId: string) {
  const folders = await db.folder.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      color: true,
      _count: { select: { documents: true } },
    },
    orderBy: { name: "asc" },
  });

  return {
    success: true,
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      documentCount: f._count.documents,
    })),
  };
}

// ============================================================================
// EXECUTE FUNCTION
// ============================================================================
async function executeFunction(
  userId: string,
  functionName: string,
  args: Record<string, any>
): Promise<any> {
  switch (functionName) {
    case "getRecentDocuments":
      return getRecentDocuments(userId, args.count || 5);
    case "searchDocuments":
      return searchDocuments(userId, args.query);
    case "getDocumentContent":
      return getDocumentContent(userId, args.documentId);
    case "summarizeDocument":
      return summarizeDocument(userId, args.documentId);
    case "moveDocument":
      return moveDocument(userId, args.documentId, args.folderId);
    case "reclassifyDocument":
      return reclassifyDocument(userId, args.documentId);
    case "listFolders":
      return listFolders(userId);
    default:
      return { error: "Fonction non reconnue" };
  }
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    const userId = session.user.id;

    // Get user context
    const [folders, recentDocs] = await Promise.all([
      db.folder.findMany({
        where: { userId },
        select: { id: true, name: true, _count: { select: { documents: true } } },
        orderBy: { name: "asc" },
      }),
      db.document.findMany({
        where: { userId },
        select: {
          id: true,
          displayName: true,
          aiDocumentType: true,
          aiCategory: true,
          uploadedAt: true,
          folder: { select: { name: true } },
        },
        orderBy: { uploadedAt: "desc" },
        take: 15,
      }),
    ]);

    // Build smart context with numbered documents and helpful info
    const foldersContext = folders.length
      ? folders.map((f) => `• ${f.name} (${f._count.documents} docs) [ID:${f.id}]`).join("\n")
      : "Aucun dossier";

    // Format date in friendly way
    const formatSmartDate = (date: Date) => {
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "aujourd'hui";
      if (diffDays === 1) return "hier";
      if (diffDays < 7) return `il y a ${diffDays} jours`;
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    };

    // Number documents (1 = most recent = "dernier document")
    const docsContext = recentDocs.length
      ? recentDocs
          .map((d, index) => {
            const position = index + 1;
            const dateStr = formatSmartDate(new Date(d.uploadedAt));
            const category = d.aiCategory || "";
            const type = d.aiDocumentType || "";
            // Build searchable keywords
            const keywords = [d.displayName.toLowerCase(), category.toLowerCase(), type.toLowerCase()].filter(Boolean).join(" ");
            return `${position}. "${d.displayName}" | ${category || type || "Document"} | Dossier: ${d.folder?.name || "non classé"} | ${dateStr} [ID:${d.id}] (mots-clés: ${keywords})`;
          })
          .join("\n")
      : "Aucun document";

    const context = `DOSSIERS DISPONIBLES:\n${foldersContext}\n\nDOCUMENTS (1 = le plus récent = "dernier document"):\n${docsContext}\n\nRAPPEL: Position 1 = document le plus récent. Quand l'utilisateur dit "mon dernier document", utilise celui en position 1.`;
    const systemPrompt = DOCUBOT_SYSTEM_PROMPT.replace("{context}", context);

    // Build conversation
    const conversationHistory = (history || []).slice(-8).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { response: "Service temporairement indisponible." },
        { status: 200 }
      );
    }

    // First call to Gemini with function declarations
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Compris ! Je suis DocuBot, prêt à t'aider avec tes documents." }] },
            ...conversationHistory,
            { role: "user", parts: [{ text: message }] },
          ],
          tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return NextResponse.json(
        { response: "Désolé, je n'ai pas pu traiter ta demande." },
        { status: 200 }
      );
    }

    let data = await response.json();
    let candidate = data.candidates?.[0];

    // Check if there's a function call
    const functionCall = candidate?.content?.parts?.[0]?.functionCall;

    if (functionCall) {
      console.log("[DocuBot] Function call:", functionCall.name, functionCall.args);

      // Execute the function
      const functionResult = await executeFunction(userId, functionCall.name, functionCall.args || {});

      console.log("[DocuBot] Function result:", functionResult);

      // Second call to Gemini with function result
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemPrompt }] },
              { role: "model", parts: [{ text: "Compris ! Je suis DocuBot." }] },
              ...conversationHistory,
              { role: "user", parts: [{ text: message }] },
              { role: "model", parts: [{ functionCall }] },
              {
                role: "function",
                parts: [
                  {
                    functionResponse: {
                      name: functionCall.name,
                      response: functionResult,
                    },
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      if (!response.ok) {
        // If second call fails, format result ourselves (simple, human-friendly)
        if (functionResult.success) {
          let formattedResponse = "";
          if (functionCall.name === "searchDocuments" && functionResult.documents) {
            if (functionResult.documents.length === 0) {
              formattedResponse = "Je n'ai pas trouvé de documents correspondants. Tu veux que je cherche autre chose ?";
            } else if (functionResult.documents.length === 1) {
              const d = functionResult.documents[0];
              formattedResponse = `J'ai trouvé "${d.name}" dans le dossier ${d.folder || "non classé"}.`;
            } else {
              formattedResponse = `J'ai trouvé ${functionResult.documents.length} documents :\n\n${functionResult.documents.map((d: any) => `• ${d.name}`).join("\n")}`;
            }
          } else if (functionCall.name === "summarizeDocument") {
            formattedResponse = `Voici le résumé de "${functionResult.document}" :\n\n${functionResult.summary}`;
          } else if (functionCall.name === "moveDocument") {
            formattedResponse = `C'est fait ! J'ai bien déplacé ton document.`;
          } else if (functionCall.name === "reclassifyDocument") {
            formattedResponse = `J'ai reclassé ton document. Il est maintenant dans le bon dossier !`;
          } else if (functionCall.name === "listFolders") {
            formattedResponse = `Tu as ${functionResult.folders.length} dossier(s) :\n\n${functionResult.folders.map((f: any) => `• ${f.name} (${f.documentCount} document${f.documentCount > 1 ? 's' : ''})`).join("\n")}`;
          } else {
            formattedResponse = "C'est fait !";
          }
          return NextResponse.json({ response: formattedResponse });
        }
        return NextResponse.json({ response: "Désolé, je n'ai pas réussi à faire ça. Tu peux réessayer ?" });
      }

      data = await response.json();
      candidate = data.candidates?.[0];
    }

    const aiResponse =
      candidate?.content?.parts?.[0]?.text ||
      "Je n'ai pas compris. Peux-tu reformuler ?";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("DocuBot error:", error);
    return NextResponse.json(
      { response: "Oups, une erreur s'est produite. Réessaie !" },
      { status: 200 }
    );
  }
}
