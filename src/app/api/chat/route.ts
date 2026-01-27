import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFromR2 } from "@/lib/storage";
import { decryptDocument, decryptUserKey } from "@/lib/encryption";
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
const DOCUBOT_SYSTEM_PROMPT = `Tu es DocuBot, l'assistant intelligent de DocuSafe. Tu aides les utilisateurs à gérer leurs documents.

## TON RÔLE
- Répondre aux questions sur les documents de l'utilisateur
- Chercher des documents spécifiques
- Lire et analyser le contenu des documents
- Déplacer des documents dans des dossiers
- Résumer des documents
- Reclasser automatiquement des documents mal triés

## TON STYLE
- Tutoie l'utilisateur
- Sois concis et amical
- Utilise des emojis avec modération (1-2 max par message)
- Réponds en français

## CONTEXTE UTILISATEUR
{context}

## FONCTIONS DISPONIBLES
Tu peux utiliser ces fonctions pour aider l'utilisateur:

1. **searchDocuments(query)** - Chercher des documents par nom ou type
2. **getDocumentContent(documentId)** - Lire le contenu d'un document
3. **summarizeDocument(documentId)** - Résumer un document
4. **moveDocument(documentId, folderId)** - Déplacer un document
5. **reclassifyDocument(documentId)** - Reclasser un document avec l'IA
6. **listFolders()** - Lister tous les dossiers

## INSTRUCTIONS
1. Quand l'utilisateur demande une action, utilise la fonction appropriée
2. Confirme toujours avant de déplacer ou modifier un document
3. Donne des réponses concises mais complètes
4. Si tu ne trouves pas un document, suggère des alternatives`;

// ============================================================================
// FUNCTION DEFINITIONS FOR GEMINI
// ============================================================================
const FUNCTION_DECLARATIONS = [
  {
    name: "searchDocuments",
    description: "Recherche des documents par nom, type ou catégorie",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Terme de recherche (nom, type de document, catégorie)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "getDocumentContent",
    description: "Récupère et analyse le contenu d'un document spécifique",
    parameters: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "L'ID du document à lire",
        },
      },
      required: ["documentId"],
    },
  },
  {
    name: "summarizeDocument",
    description: "Génère un résumé d'un document",
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
      id: d.id,
      name: d.displayName,
      type: d.aiDocumentType || d.fileType,
      category: d.aiCategory || "Non classé",
      folder: d.folder?.name || "Aucun dossier",
      date: new Date(d.uploadedAt).toLocaleDateString("fr-FR"),
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
      fileBuffer = decryptDocument(encryptedData, userKey);
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
      fileBuffer = decryptDocument(encryptedData, userKey);
    } else {
      fileBuffer = encryptedData;
    }

    // Call Gemini for summary
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Service IA non disponible" };
    }

    const base64Data = fileBuffer.toString("base64");
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

    return {
      success: true,
      document: document.displayName,
      summary,
    };
  } catch (error) {
    console.error("Error summarizing document:", error);
    return { success: false, error: "Erreur lors du résumé" };
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
      fileBuffer = decryptDocument(encryptedData, userKey);
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

    // Build context
    const foldersContext = folders.length
      ? folders.map((f) => `- ${f.name} (${f._count.documents} docs) [ID: ${f.id}]`).join("\n")
      : "Aucun dossier";

    const docsContext = recentDocs.length
      ? recentDocs
          .map((d) => {
            const date = new Date(d.uploadedAt).toLocaleDateString("fr-FR");
            return `- "${d.displayName}" | Type: ${d.aiDocumentType || "inconnu"} | Dossier: ${d.folder?.name || "aucun"} | ${date} [ID: ${d.id}]`;
          })
          .join("\n")
      : "Aucun document";

    const context = `DOSSIERS:\n${foldersContext}\n\nDOCUMENTS RÉCENTS:\n${docsContext}`;
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
        // If second call fails, format result ourselves
        if (functionResult.success) {
          let formattedResponse = "";
          if (functionCall.name === "searchDocuments" && functionResult.documents) {
            formattedResponse = functionResult.documents.length
              ? `J'ai trouvé ${functionResult.documents.length} document(s) :\n\n${functionResult.documents.map((d: any) => `📄 **${d.name}**\n   Type: ${d.type} | Dossier: ${d.folder}`).join("\n\n")}`
              : "Je n'ai pas trouvé de documents correspondants.";
          } else if (functionCall.name === "summarizeDocument") {
            formattedResponse = `📋 **Résumé de "${functionResult.document}"**\n\n${functionResult.summary}`;
          } else if (functionCall.name === "moveDocument") {
            formattedResponse = `✅ ${functionResult.message}`;
          } else if (functionCall.name === "reclassifyDocument") {
            formattedResponse = `✅ ${functionResult.message}\n\nNouveau type: ${functionResult.newType}\nConfiance: ${functionResult.confidence}%`;
          } else if (functionCall.name === "listFolders") {
            formattedResponse = `📁 Tes dossiers :\n\n${functionResult.folders.map((f: any) => `• ${f.name} (${f.documentCount} documents)`).join("\n")}`;
          } else {
            formattedResponse = functionResult.message || "Action effectuée !";
          }
          return NextResponse.json({ response: formattedResponse });
        }
        return NextResponse.json({ response: functionResult.error || "Erreur lors de l'action." });
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
