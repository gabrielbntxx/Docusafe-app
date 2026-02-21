import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFromR2, hasActiveSubscription } from "@/lib/storage";
import { decryptDocument, decryptUserKey, removeEncryptionMarker } from "@/lib/encryption";
import { analyzeDocumentWithAI, getOrCreateCategoryFolder } from "@/lib/ai-analysis";
import { getEffectiveUserId } from "@/lib/team";

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
// DOCUBOT SYSTEM PROMPTS (Bilingual FR/EN)
// ============================================================================
const DOCUBOT_SYSTEM_PROMPT_FR = `Tu es DocuBot, l'assistant IA de DocuSafe.

## RÈGLE ABSOLUE - JAMAIS D'ID OU DONNÉES TECHNIQUES
❌ NE JAMAIS afficher d'ID (ex: cml058i9x000f3k1iefea7lyv) dans tes réponses
❌ NE JAMAIS montrer de données brutes JSON
❌ NE JAMAIS dire "[ID:..." ou "(ID:..."
✅ Affiche UNIQUEMENT le nom du document, son dossier et sa date
✅ Formate joliment les listes avec des numéros ou des puces

## FORMAT DES RÉPONSES - DOCUMENTS
Quand tu listes des documents, utilise CE FORMAT :
📄 **Nom du document**
   └ Dossier : NomDuDossier | Ajouté : date

Exemple pour "documents récents" :
Voici tes 5 derniers documents 📚

1. **Facture EDF Mars 2024**
   └ Dossier : Factures | Ajouté : aujourd'hui

2. **Carte d'identité**
   └ Dossier : Documents officiels | Ajouté : hier

## RÈGLE CRITIQUE - EXÉCUTION
⚠️ APPELLE LA FONCTION IMMÉDIATEMENT, sans demander confirmation.
❌ NE DIS PAS "Je vais..." AVANT d'avoir appelé la fonction
✅ L'utilisateur dit "oui" ou "fait le" = EXÉCUTE IMMÉDIATEMENT

## COMPRENDRE LES DEMANDES
- "documents récents" / "derniers documents" = appelle getRecentDocuments
- "mon dernier document" = position 1 dans la liste
- "cherche facture" = appelle searchDocuments avec query="facture"
- "expirent" / "renouveler" / "expire bientôt" / "à surveiller" = appelle getExpiringDocuments
- "statistiques" / "combien de docs" / "espace utilisé" / "résumé de ma bibliothèque" = appelle getDocumentStats
- "voir les fichiers dans [dossier]" / "montre le contenu de [dossier]" / "liste [dossier]" = appelle listFolderContents avec l'ID du dossier
- "supprime tous les fichiers dans [dossier]" / "vide le dossier [X]" / "efface tout dans [dossier]" = appelle deleteFolderContents avec l'ID du dossier

## CONTEXTE (IDs pour TES appels de fonctions - NE PAS AFFICHER)
{context}

## STYLE
- Tutoie, sois amical et concis
- 1-2 emojis max par réponse
- Formate bien les listes pour qu'elles soient lisibles`;

const DOCUBOT_SYSTEM_PROMPT_EN = `You are DocuBot, DocuSafe's AI assistant.

## ABSOLUTE RULE - NEVER SHOW IDs OR TECHNICAL DATA
❌ NEVER display IDs (e.g., cml058i9x000f3k1iefea7lyv) in your responses
❌ NEVER show raw JSON data
❌ NEVER say "[ID:..." or "(ID:..."
✅ Show ONLY the document name, its folder and date
✅ Format lists nicely with numbers or bullet points

## RESPONSE FORMAT - DOCUMENTS
When listing documents, use THIS FORMAT:
📄 **Document name**
   └ Folder: FolderName | Added: date

Example for "recent documents":
Here are your 5 most recent documents 📚

1. **Electric Bill March 2024**
   └ Folder: Bills | Added: today

2. **ID Card**
   └ Folder: Official Documents | Added: yesterday

## CRITICAL RULE - EXECUTION
⚠️ CALL THE FUNCTION IMMEDIATELY, without asking for confirmation.
❌ DON'T SAY "I will..." BEFORE calling the function
✅ User says "yes" or "do it" = EXECUTE IMMEDIATELY

## UNDERSTANDING REQUESTS
- "recent documents" / "latest documents" = call getRecentDocuments
- "my latest document" = position 1 in the list
- "search invoice" = call searchDocuments with query="invoice"
- "expiring" / "renew" / "expires soon" / "to watch" = call getExpiringDocuments
- "statistics" / "how many docs" / "storage used" / "library summary" = call getDocumentStats
- "show files in [folder]" / "list [folder] contents" / "what's in [folder]" = call listFolderContents with the folder ID
- "delete all files in [folder]" / "empty [folder]" / "clear [folder]" = call deleteFolderContents with the folder ID

## CONTEXT (IDs for YOUR function calls - DO NOT DISPLAY)
{context}

## STYLE
- Be friendly and concise
- 1-2 emojis max per response
- Format lists nicely so they're readable`;

// ============================================================================
// FUNCTION DEFINITIONS FOR GEMINI
// ============================================================================
const FUNCTION_DECLARATIONS = [
  {
    name: "getRecentDocuments",
    description: "Obtient les documents les plus récents",
    parameters: {
      type: "object",
      properties: {
        count: { type: "number", description: "Nombre de documents (défaut: 5)" },
      },
    },
  },
  {
    name: "searchDocuments",
    description: "Recherche des documents par nom, type ou catégorie",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Terme de recherche" },
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
        documentId: { type: "string", description: "ID du document" },
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
        documentId: { type: "string", description: "ID du document" },
      },
      required: ["documentId"],
    },
  },
  {
    name: "moveDocument",
    description: "Déplace UN document vers un dossier",
    parameters: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "ID du document" },
        folderId: { type: "string", description: "ID du dossier destination" },
      },
      required: ["documentId", "folderId"],
    },
  },
  {
    name: "moveMultipleDocuments",
    description: "Déplace PLUSIEURS documents vers un dossier. Utilise cette fonction quand l'utilisateur veut déplacer plusieurs fichiers à la fois.",
    parameters: {
      type: "object",
      properties: {
        documentIds: {
          type: "array",
          items: { type: "string" },
          description: "Liste des IDs de documents à déplacer"
        },
        folderId: { type: "string", description: "ID du dossier destination" },
      },
      required: ["documentIds", "folderId"],
    },
  },
  {
    name: "deleteDocument",
    description: "Supprime un document définitivement",
    parameters: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "ID du document à supprimer" },
      },
      required: ["documentId"],
    },
  },
  {
    name: "deleteMultipleDocuments",
    description: "Supprime plusieurs documents définitivement",
    parameters: {
      type: "object",
      properties: {
        documentIds: {
          type: "array",
          items: { type: "string" },
          description: "Liste des IDs de documents à supprimer"
        },
      },
      required: ["documentIds"],
    },
  },
  {
    name: "renameDocument",
    description: "Renomme un document",
    parameters: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "ID du document" },
        newName: { type: "string", description: "Nouveau nom du document" },
      },
      required: ["documentId", "newName"],
    },
  },
  {
    name: "createFolder",
    description: "Crée un nouveau dossier",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nom du dossier" },
        color: { type: "string", description: "Couleur du dossier (blue, red, green, yellow, purple, orange). Par défaut: blue" },
      },
      required: ["name"],
    },
  },
  {
    name: "deleteFolder",
    description: "Supprime un dossier (les documents dedans seront déplacés vers 'Non classés')",
    parameters: {
      type: "object",
      properties: {
        folderId: { type: "string", description: "ID du dossier à supprimer" },
      },
      required: ["folderId"],
    },
  },
  {
    name: "renameFolder",
    description: "Renomme un dossier",
    parameters: {
      type: "object",
      properties: {
        folderId: { type: "string", description: "ID du dossier" },
        newName: { type: "string", description: "Nouveau nom du dossier" },
      },
      required: ["folderId", "newName"],
    },
  },
  {
    name: "reclassifyDocument",
    description: "Réanalyse et reclasse UN document avec l'IA",
    parameters: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "ID du document" },
      },
      required: ["documentId"],
    },
  },
  {
    name: "reclassifyMultipleDocuments",
    description: "Réanalyse et reclasse PLUSIEURS documents avec l'IA. Utilise cette fonction quand l'utilisateur dit 'classe tous', 'reclasse les', etc.",
    parameters: {
      type: "object",
      properties: {
        documentIds: {
          type: "array",
          items: { type: "string" },
          description: "Liste des IDs de documents à reclasser"
        },
      },
      required: ["documentIds"],
    },
  },
  {
    name: "listFolders",
    description: "Liste tous les dossiers disponibles",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "analyzeDocument",
    description: "Analyse en profondeur un document et extrait toutes les informations utiles (dates, montants, noms, etc.)",
    parameters: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "ID du document" },
      },
      required: ["documentId"],
    },
  },
  {
    name: "getExpiringDocuments",
    description: "Obtient les documents qui expirent bientôt ou qui sont déjà expirés. Utilise cette fonction pour les questions sur les renouvellements, expirations, documents à surveiller.",
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "Nombre de jours à vérifier (défaut: 60)" },
      },
    },
  },
  {
    name: "getDocumentStats",
    description: "Obtient les statistiques de la bibliothèque : nombre total de documents, répartition par catégorie, espace de stockage utilisé.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "listFolderContents",
    description: "Liste TOUS les documents à l'intérieur d'un dossier spécifique. Utilise cette fonction quand l'utilisateur veut voir, lister ou gérer les fichiers d'un dossier particulier.",
    parameters: {
      type: "object",
      properties: {
        folderId: { type: "string", description: "ID du dossier dont afficher le contenu" },
      },
      required: ["folderId"],
    },
  },
  {
    name: "deleteFolderContents",
    description: "Supprime TOUS les documents à l'intérieur d'un dossier. Utilise cette fonction quand l'utilisateur dit 'supprime tout dans [dossier]', 'vide le dossier', 'efface tous les fichiers de [dossier]'.",
    parameters: {
      type: "object",
      properties: {
        folderId: { type: "string", description: "ID du dossier dont supprimer tous les fichiers" },
      },
      required: ["folderId"],
    },
  },
];

// ============================================================================
// FUNCTION IMPLEMENTATIONS
// ============================================================================

// Helper: format date in friendly way (with language support)
function formatFriendlyDate(date: Date, lang: string = "fr"): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  const isEnglish = lang === "en";

  if (isEnglish) {
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  } else {
    if (diffDays === 0) return "aujourd'hui";
    if (diffDays === 1) return "hier";
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    return `le ${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
  }
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

    // Re-analyze with AI (with folder hierarchy context)
    const analysis = await analyzeDocumentWithAI(fileBuffer, document.displayName, document.mimeType);

    // Get or create folder with hierarchy-aware AI decision
    const folderId = await getOrCreateCategoryFolder(
      userId,
      analysis.category,
      analysis.suggestedFolder,
      analysis.folderAction,
      analysis.targetFolderId,
      analysis.parentFolderId
    );

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

// NEW: Move multiple documents
async function moveMultipleDocuments(userId: string, documentIds: string[], folderId: string) {
  const folder = await db.folder.findFirst({
    where: { id: folderId, userId },
  });

  if (!folder) {
    return { success: false, error: "Dossier non trouvé" };
  }

  const documents = await db.document.findMany({
    where: { id: { in: documentIds }, userId },
    select: { id: true, displayName: true },
  });

  if (documents.length === 0) {
    return { success: false, error: "Aucun document trouvé" };
  }

  await db.document.updateMany({
    where: { id: { in: documentIds }, userId },
    data: { folderId },
  });

  return {
    success: true,
    message: `${documents.length} document(s) déplacé(s) vers "${folder.name}"`,
    movedCount: documents.length,
    folderName: folder.name,
  };
}

// NEW: Delete document
async function deleteDocument(userId: string, documentId: string) {
  const document = await db.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, displayName: true, storageKey: true, sizeBytes: true },
  });

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  await db.document.delete({ where: { id: documentId } });

  // Update user stats
  await db.user.update({
    where: { id: userId },
    data: {
      documentsCount: { decrement: 1 },
      storageUsedBytes: { decrement: Number(document.sizeBytes) || 0 },
    },
  });

  return {
    success: true,
    message: `Document "${document.displayName}" supprimé`,
    deletedName: document.displayName,
  };
}

// NEW: Delete multiple documents
async function deleteMultipleDocuments(userId: string, documentIds: string[]) {
  const documents = await db.document.findMany({
    where: { id: { in: documentIds }, userId },
    select: { id: true, displayName: true, sizeBytes: true },
  });

  if (documents.length === 0) {
    return { success: false, error: "Aucun document trouvé" };
  }

  const totalBytes = documents.reduce((sum, d) => sum + Number(d.sizeBytes), 0);

  await db.document.deleteMany({
    where: { id: { in: documentIds }, userId },
  });

  // Update user stats
  await db.user.update({
    where: { id: userId },
    data: {
      documentsCount: { decrement: documents.length },
      storageUsedBytes: { decrement: totalBytes },
    },
  });

  return {
    success: true,
    message: `${documents.length} document(s) supprimé(s)`,
    deletedCount: documents.length,
  };
}

// NEW: Rename document
async function renameDocument(userId: string, documentId: string, newName: string) {
  const document = await db.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, displayName: true },
  });

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  const oldName = document.displayName;

  await db.document.update({
    where: { id: documentId },
    data: { displayName: newName },
  });

  return {
    success: true,
    message: `Document renommé de "${oldName}" en "${newName}"`,
    oldName,
    newName,
  };
}

// NEW: Create folder
async function createFolder(userId: string, name: string, color: string = "blue") {
  // Check if folder already exists
  const existing = await db.folder.findFirst({
    where: { userId, name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    return { success: false, error: `Un dossier "${name}" existe déjà` };
  }

  const folder = await db.folder.create({
    data: { userId, name, color },
  });

  return {
    success: true,
    message: `Dossier "${name}" créé`,
    folderId: folder.id,
    folderName: folder.name,
  };
}

// NEW: Delete folder
async function deleteFolder(userId: string, folderId: string) {
  const folder = await db.folder.findFirst({
    where: { id: folderId, userId },
    include: { _count: { select: { documents: true } } },
  });

  if (!folder) {
    return { success: false, error: "Dossier non trouvé" };
  }

  // Move documents to null (uncategorized)
  if (folder._count.documents > 0) {
    await db.document.updateMany({
      where: { folderId },
      data: { folderId: null },
    });
  }

  await db.folder.delete({ where: { id: folderId } });

  return {
    success: true,
    message: `Dossier "${folder.name}" supprimé${folder._count.documents > 0 ? ` (${folder._count.documents} documents déplacés vers Non classés)` : ""}`,
    folderName: folder.name,
    documentsMovedCount: folder._count.documents,
  };
}

// NEW: Rename folder
async function renameFolder(userId: string, folderId: string, newName: string) {
  const folder = await db.folder.findFirst({
    where: { id: folderId, userId },
  });

  if (!folder) {
    return { success: false, error: "Dossier non trouvé" };
  }

  const oldName = folder.name;

  await db.folder.update({
    where: { id: folderId },
    data: { name: newName },
  });

  return {
    success: true,
    message: `Dossier renommé de "${oldName}" en "${newName}"`,
    oldName,
    newName,
  };
}

// NEW: Reclassify multiple documents
async function reclassifyMultipleDocuments(userId: string, documentIds: string[]) {
  const results: { name: string; newCategory: string; success: boolean }[] = [];

  for (const documentId of documentIds) {
    try {
      const result = await reclassifyDocument(userId, documentId);
      if (result.success && result.newCategory) {
        results.push({
          name: "Document",
          newCategory: result.newCategory,
          success: true,
        });
      } else {
        results.push({ name: "Document", newCategory: "", success: false });
      }
    } catch {
      results.push({ name: "Document", newCategory: "", success: false });
    }
  }

  const successCount = results.filter(r => r.success).length;

  return {
    success: successCount > 0,
    message: `${successCount}/${documentIds.length} document(s) reclassé(s)`,
    reclassifiedCount: successCount,
    results,
  };
}

// NEW: Deep analyze document
async function analyzeDocument(userId: string, documentId: string) {
  const document = await db.document.findFirst({
    where: { id: documentId, userId },
    select: {
      id: true,
      displayName: true,
      storageKey: true,
      mimeType: true,
      isEncrypted: true,
      aiExtractedData: true,
      aiCategory: true,
      aiDocumentType: true,
    },
  });

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  try {
    const fileData = await getFromR2(document.storageKey);
    if (!fileData) {
      return { success: false, error: "Fichier non trouvé" };
    }

    let fileBuffer: Buffer;
    if (document.isEncrypted === 1) {
      const userKey = await getUserEncryptionKey(userId);
      if (!userKey) {
        return { success: false, error: "Clé de chiffrement non trouvée" };
      }
      const decryptableData = removeEncryptionMarker(fileData);
      fileBuffer = decryptDocument(decryptableData, userKey);
    } else {
      fileBuffer = fileData;
    }

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
          contents: [{
            parts: [
              {
                text: `Tu es un expert en analyse de documents. Examine ATTENTIVEMENT ce document et extrait ABSOLUMENT TOUTES les informations visibles.

IMPORTANT : Lis CHAQUE texte visible sur l'image/document, même les petits caractères, logos, titres en gros, etc.

Réponds en JSON avec cette structure :
{
  "type": "type précis (billet de concert, facture, carte d'identité, contrat, etc.)",
  "titre": "titre principal ou objet du document",
  "evenement": {
    "nom": "nom de l'événement, concert, spectacle, match (ex: 'Concert Jul', 'PSG vs OM')",
    "artiste": "nom de l'artiste, groupe, ou équipes si c'est un spectacle/concert/match",
    "lieu": "nom du lieu (Stade de France, Accor Arena, etc.)",
    "date": "date et heure de l'événement",
    "place": "numéro de place, rang, tribune, catégorie"
  },
  "dates": ["toutes les dates mentionnées"],
  "montants": ["tous les prix et montants avec devises"],
  "personnes": ["noms de personnes (acheteur, bénéficiaire, etc.)"],
  "organisations": ["entreprises, organisateurs, vendeurs"],
  "references": ["numéros de commande, référence, code-barres si visible"],
  "resumé": "résumé clair en 2-3 phrases incluant les infos PRINCIPALES (qui, quoi, où, quand, combien)",
  "pointsCles": ["5 informations les plus importantes à retenir"]
}

RÈGLES :
- Pour un billet : le nom de l'ARTISTE/ÉVÉNEMENT est L'INFO LA PLUS IMPORTANTE
- Cherche les gros titres, logos, noms en évidence
- Si tu vois un nom d'artiste (Jul, Beyoncé, etc.), mets-le dans "artiste"
- Ne laisse AUCUN champ vide si l'info est visible sur le document`,
              },
              {
                inline_data: {
                  mime_type: document.mimeType,
                  data: base64Data,
                },
              },
            ],
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
        }),
      }
    );

    if (!response.ok) {
      return { success: false, error: "Erreur d'analyse" };
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      return { success: false, error: "Pas de résultat d'analyse" };
    }

    // Try to parse JSON from response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { resumé: analysisText, pointsCles: [] };
      }
    } catch {
      analysis = { resumé: analysisText, pointsCles: [] };
    }

    // Update document with analysis
    await db.document.update({
      where: { id: documentId },
      data: { aiExtractedData: JSON.stringify(analysis) },
    });

    return {
      success: true,
      documentName: document.displayName,
      analysis,
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    return { success: false, error: "Erreur lors de l'analyse" };
  }
}

// NEW: Get expiring documents
async function getExpiringDocuments(userId: string, days: number = 60) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const documents = await db.document.findMany({
    where: { userId, expiryDate: { not: null, lte: futureDate } },
    select: {
      id: true,
      displayName: true,
      expiryDate: true,
      aiCategory: true,
      folder: { select: { name: true } },
    },
    orderBy: { expiryDate: "asc" },
    take: 20,
  });

  if (documents.length === 0) {
    return {
      success: true,
      message: `Aucun document n'expire dans les ${days} prochains jours.`,
      documents: [],
    };
  }

  const now = Date.now();
  return {
    success: true,
    message: `${documents.length} document(s) à surveiller`,
    documents: documents.map((d) => {
      const daysLeft = Math.floor((new Date(d.expiryDate!).getTime() - now) / 86400000);
      const isExpired = daysLeft < 0;
      return {
        id: d.id,
        name: d.displayName,
        folder: d.folder?.name || "non classé",
        category: d.aiCategory || "Document",
        expiryDate: d.expiryDate!.toISOString().split("T")[0],
        daysLeft: isExpired ? null : daysLeft,
        isExpired,
        status: isExpired ? "Expiré" : daysLeft <= 7 ? "Urgent" : daysLeft <= 30 ? "Bientôt" : "À surveiller",
      };
    }),
  };
}

// NEW: Get document stats
async function getDocumentStats(userId: string) {
  const [totalCount, byCategory, topFolders, storageAgg] = await Promise.all([
    db.document.count({ where: { userId } }),
    db.document.groupBy({
      by: ["aiCategory"],
      where: { userId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    db.folder.findMany({
      where: { userId },
      select: { name: true, _count: { select: { documents: true } } },
      orderBy: { documents: { _count: "desc" } },
      take: 5,
    }),
    db.document.aggregate({
      where: { userId },
      _sum: { sizeBytes: true },
    }),
  ]);

  const totalBytes = Number(storageAgg._sum.sizeBytes || 0);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
  const totalGB = (totalBytes / 1024 / 1024 / 1024).toFixed(2);
  const storageDisplay = totalBytes > 1024 * 1024 * 1024
    ? `${totalGB} GB`
    : totalBytes > 0
      ? `${totalMB} MB`
      : "non disponible (tailles non enregistrées)";

  return {
    success: true,
    totalDocuments: totalCount,
    storageUsed: storageDisplay,
    topCategories: byCategory.slice(0, 6).map((c) => ({
      category: c.aiCategory || "Non classé",
      count: c._count.id,
    })),
    topFolders: topFolders.map((f) => ({
      folder: f.name,
      count: f._count.documents,
    })),
  };
}

// Helper: collect a folder ID + all descendant folder IDs recursively
async function getAllDescendantFolderIds(userId: string, rootFolderId: string): Promise<string[]> {
  const allIds: string[] = [rootFolderId];
  const queue: string[] = [rootFolderId];

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const children = await db.folder.findMany({
      where: { userId, parentId },
      select: { id: true },
    });
    for (const child of children) {
      allIds.push(child.id);
      queue.push(child.id);
    }
  }

  return allIds;
}

// NEW: List all documents inside a specific folder (and its sub-folders)
async function listFolderContents(userId: string, folderId: string) {
  const folder = await db.folder.findFirst({
    where: { id: folderId, userId },
  });

  if (!folder) {
    return { success: false, error: "Dossier non trouvé" };
  }

  const allFolderIds = await getAllDescendantFolderIds(userId, folderId);

  const documents = await db.document.findMany({
    where: { userId, folderId: { in: allFolderIds } },
    select: {
      id: true,
      displayName: true,
      fileType: true,
      uploadedAt: true,
      folder: { select: { name: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  if (documents.length === 0) {
    return {
      success: true,
      folderName: folder.name,
      documentCount: 0,
      documents: [],
      message: `Le dossier "${folder.name}" (et ses sous-dossiers) est vide.`,
    };
  }

  return {
    success: true,
    folderName: folder.name,
    documentCount: documents.length,
    subFolderCount: allFolderIds.length - 1,
    documents: documents.map((d) => ({
      id: d.id,
      name: d.displayName,
      type: d.fileType,
      subfolder: d.folder?.name !== folder.name ? d.folder?.name : null,
      addedDate: formatFriendlyDate(new Date(d.uploadedAt)),
    })),
  };
}

// NEW: Delete ALL documents inside a folder AND its sub-folders
async function deleteFolderContents(userId: string, folderId: string) {
  const folder = await db.folder.findFirst({
    where: { id: folderId, userId },
  });

  if (!folder) {
    return { success: false, error: "Dossier non trouvé" };
  }

  // Collect this folder + all nested sub-folders
  const allFolderIds = await getAllDescendantFolderIds(userId, folderId);

  const documents = await db.document.findMany({
    where: { userId, folderId: { in: allFolderIds } },
    select: { id: true, sizeBytes: true },
  });

  if (documents.length === 0) {
    return {
      success: true,
      message: `Le dossier "${folder.name}" et ses sous-dossiers sont déjà vides.`,
      deletedCount: 0,
      folderName: folder.name,
    };
  }

  const totalBytes = documents.reduce((sum, d) => sum + Number(d.sizeBytes), 0);

  await db.document.deleteMany({ where: { userId, folderId: { in: allFolderIds } } });

  // Update user stats
  await db.user.update({
    where: { id: userId },
    data: {
      documentsCount: { decrement: documents.length },
      storageUsedBytes: { decrement: totalBytes },
    },
  });

  const subFolderCount = allFolderIds.length - 1;
  const subFolderInfo = subFolderCount > 0 ? ` (dont ${subFolderCount} sous-dossier(s))` : "";

  return {
    success: true,
    message: `${documents.length} fichier(s) supprimé(s) du dossier "${folder.name}"${subFolderInfo}`,
    deletedCount: documents.length,
    folderName: folder.name,
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
    case "moveMultipleDocuments":
      return moveMultipleDocuments(userId, args.documentIds, args.folderId);
    case "deleteDocument":
      return deleteDocument(userId, args.documentId);
    case "deleteMultipleDocuments":
      return deleteMultipleDocuments(userId, args.documentIds);
    case "renameDocument":
      return renameDocument(userId, args.documentId, args.newName);
    case "createFolder":
      return createFolder(userId, args.name, args.color);
    case "deleteFolder":
      return deleteFolder(userId, args.folderId);
    case "renameFolder":
      return renameFolder(userId, args.folderId, args.newName);
    case "reclassifyDocument":
      return reclassifyDocument(userId, args.documentId);
    case "reclassifyMultipleDocuments":
      return reclassifyMultipleDocuments(userId, args.documentIds);
    case "listFolders":
      return listFolders(userId);
    case "analyzeDocument":
      return analyzeDocument(userId, args.documentId);
    case "getExpiringDocuments":
      return getExpiringDocuments(userId, args.days || 60);
    case "getDocumentStats":
      return getDocumentStats(userId);
    case "listFolderContents":
      return listFolderContents(userId, args.folderId);
    case "deleteFolderContents":
      return deleteFolderContents(userId, args.folderId);
    default:
      return { error: "Fonction non reconnue" };
  }
}

// ============================================================================
// STREAMING HELPERS
// ============================================================================

// Remove markdown syntax so messages render as clean plain text in the chat UI.
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")   // **bold** → bold
    .replace(/\*([^*\n]+)\*/g, "$1")     // *italic* → italic
    .replace(/^#{1,6}\s+/gm, "")         // ## headings → plain
    .replace(/`([^`]+)`/g, "$1")         // `code` → code
    .replace(/~~([^~]+)~~/g, "$1")       // ~~strike~~ → text
    .replace(/^\s*[-*+]\s+/gm, "• ")     // - list → bullet
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [link](url) → link text
    .trim();
}

const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "X-Accel-Buffering": "no",   // Disable Nginx/Railway proxy buffering
  "Cache-Control": "no-cache, no-transform",
  "Connection": "keep-alive",
};

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    }),
    { headers: STREAM_HEADERS }
  );
}

// Streams text word-by-word with a small delay to produce a ChatGPT-like effect.
// Uses a regular generateContent call (not SSE) then simulates streaming server-side,
// which avoids all proxy-buffering issues with Railway/Nginx.
async function streamGeminiCall(contents: any[], apiKey: string): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const gemRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
  });

  if (!gemRes.ok) return streamText("Désolé, je n'ai pas pu répondre.");

  const data = await gemRes.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu répondre.";

  const cleaned = stripMarkdown(
    raw
      .replace(/\[ID:[^\]]+\]/g, "")
      .replace(/\(ID:[^)]+\)/g, "")
      .replace(/ID:\s*[a-z0-9]{20,}/gi, "")
      .replace(/[ \t]{2,}/g, " ")
  );

  return streamText(cleaned);
}

// ============================================================================
// KEYWORD EXTRACTION (Feature 5 — smarter context)
// ============================================================================
const STOP_WORDS = new Set([
  "pour", "dans", "avec", "les", "des", "que", "qui", "une", "est", "mon",
  "mes", "tes", "ton", "sur", "mais", "par", "pas", "plus", "aussi", "bien",
  "tout", "moi", "lui", "quoi", "comment", "quand", "quel", "quels", "quelles",
  "the", "and", "for", "with", "that", "this", "are", "have", "not", "from",
  "your", "what", "when", "how", "can", "show", "find", "get", "list",
]);

function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëîïôùûü]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 5);
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Non autorisé", { status: 401 });
    }

    // Check subscription - FREE users cannot use DocuBot (unless team member)
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true, teamOwnerId: true, subscriptionStatus: true },
    });
    if (!currentUser || (currentUser.planType === "FREE" && !currentUser.teamOwnerId)) {
      return new Response("Abonnement requis pour utiliser DocuBot", { status: 403 });
    }
    if (!hasActiveSubscription(currentUser)) {
      return new Response("Votre abonnement est expiré. Veuillez renouveler votre paiement.", { status: 403 });
    }

    // Use effective workspace userId for team members
    const userId = await getEffectiveUserId(session.user.id);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return streamText("Service temporairement indisponible.");
    }

    // ── Feature 4: File upload via drag & drop ──────────────────────────────
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) return streamText("Aucun fichier reçu.");

      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = file.type || "application/octet-stream";

      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: `Tu es DocuBot, l'assistant IA de DocuSafe. Analyse ce document en français et résume les informations importantes de façon claire et structurée. Extrait : type de document, dates clés, montants, personnes ou organisations mentionnées, et les 3-5 points essentiels à retenir. Sois concis et utile.` },
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ],
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
          }),
        }
      );

      if (!gemRes.ok) return streamText("Erreur lors de l'analyse du fichier.");
      const gemData = await gemRes.json();
      const raw = gemData.candidates?.[0]?.content?.parts?.[0]?.text || "Impossible d'analyser ce fichier.";
      return streamGeminiCall(
        [{ role: "user", parts: [{ text: `Reformule cette analyse de façon amicale et lisible, comme si tu étais DocuBot:\n\n${raw}` }] }],
        apiKey
      );
    }
    // ────────────────────────────────────────────────────────────────────────

    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response("Message requis", { status: 400 });
    }

    // Feature 5: extract keywords for smarter context injection
    const msgKeywords = extractKeywords(message);

    // Get user context and language preference
    const [folders, recentDocs, userSettings, expiringDocs, relevantDocs] = await Promise.all([
      db.folder.findMany({
        where: { userId },
        select: { id: true, name: true, parentId: true, _count: { select: { documents: true } } },
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
      db.user.findUnique({
        where: { id: userId },
        select: { language: true },
      }),
      db.document.findMany({
        where: { userId, expiryDate: { not: null, lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) } },
        select: { displayName: true, expiryDate: true },
        orderBy: { expiryDate: "asc" },
        take: 5,
      }),
      // Feature 5: semantic-ish search — docs relevant to this specific question
      msgKeywords.length > 0
        ? db.document.findMany({
            where: {
              userId,
              OR: msgKeywords.flatMap((k) => [
                { displayName: { contains: k, mode: "insensitive" } },
                { aiCategory: { contains: k, mode: "insensitive" } },
                { aiDocumentType: { contains: k, mode: "insensitive" } },
              ]),
            },
            select: {
              id: true,
              displayName: true,
              aiCategory: true,
              aiDocumentType: true,
              uploadedAt: true,
              folder: { select: { name: true } },
            },
            orderBy: { uploadedAt: "desc" },
            take: 8,
          })
        : Promise.resolve([]),
    ]);

    // Determine user language (default to French)
    const userLang = userSettings?.language || "fr";
    const isEnglish = userLang === "en";

    // Build hierarchical folder context (root folders with indented children)
    const folderById = new Map(folders.map((f) => [f.id, f]));
    const rootFolders = folders.filter((f) => !f.parentId);
    function buildFolderContextLines(fId: string, indent: string): string[] {
      const f = folderById.get(fId)!;
      const line = `${indent}• ${f.name} (${f._count.documents} docs) [ID:${f.id}]`;
      const children = folders.filter((c) => c.parentId === fId);
      return [line, ...children.flatMap((c) => buildFolderContextLines(c.id, indent + "  "))];
    }
    const foldersContext = folders.length
      ? rootFolders.flatMap((f) => buildFolderContextLines(f.id, "")).join("\n")
      : isEnglish ? "No folders" : "Aucun dossier";

    // Format date in friendly way based on language
    const formatSmartDate = (date: Date) => {
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (isEnglish) {
        if (diffDays === 0) return "today";
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
      } else {
        if (diffDays === 0) return "aujourd'hui";
        if (diffDays === 1) return "hier";
        if (diffDays < 7) return `il y a ${diffDays} jours`;
        return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      }
    };

    // Number documents (1 = most recent)
    const folderLabel = isEnglish ? "Folder" : "Dossier";
    const uncategorizedLabel = isEnglish ? "uncategorized" : "non classé";
    const docsContext = recentDocs.length
      ? recentDocs
          .map((d, index) => {
            const position = index + 1;
            const dateStr = formatSmartDate(new Date(d.uploadedAt));
            const category = d.aiCategory || "";
            const type = d.aiDocumentType || "";
            const keywords = [d.displayName.toLowerCase(), category.toLowerCase(), type.toLowerCase()].filter(Boolean).join(" ");
            return `${position}. "${d.displayName}" | ${category || type || "Document"} | ${folderLabel}: ${d.folder?.name || uncategorizedLabel} | ${dateStr} [ID:${d.id}] (keywords: ${keywords})`;
          })
          .join("\n")
      : isEnglish ? "No documents" : "Aucun document";

    const now = Date.now();
    const expiringContext = expiringDocs.length
      ? "\n\n" + (isEnglish ? "EXPIRING DOCUMENTS (use getExpiringDocuments for details):" : "DOCUMENTS EXPIRANTS (utilise getExpiringDocuments pour les détails):") + "\n" +
        expiringDocs.map((d) => {
          const daysLeft = Math.floor((new Date(d.expiryDate!).getTime() - now) / 86400000);
          return `⚠️ "${d.displayName}" — ${daysLeft < 0 ? (isEnglish ? "EXPIRED" : "EXPIRÉ") : (isEnglish ? `expires in ${daysLeft}d` : `expire dans ${daysLeft}j`)}`;
        }).join("\n")
      : "";

    // Feature 5: inject relevant docs if they differ from recentDocs
    const recentIds = new Set(recentDocs.map((d) => d.id));
    const extraRelevant = relevantDocs.filter((d) => !recentIds.has(d.id));
    const relevantContext = extraRelevant.length
      ? "\n\n" + (isEnglish ? "DOCUMENTS RELEVANT TO THIS QUESTION:" : "DOCUMENTS PERTINENTS À CETTE QUESTION:") + "\n" +
        extraRelevant.map((d) =>
          `• "${d.displayName}" | ${d.aiCategory || d.aiDocumentType || "Document"} | ${isEnglish ? "Folder" : "Dossier"}: ${d.folder?.name || (isEnglish ? "uncategorized" : "non classé")} [ID:${d.id}]`
        ).join("\n")
      : "";

    const context = isEnglish
      ? `AVAILABLE FOLDERS:\n${foldersContext}\n\nDOCUMENTS (1 = most recent = "latest document"):\n${docsContext}${expiringContext}${relevantContext}\n\nREMINDER: Position 1 = most recent document. When the user says "my latest document", use the one at position 1.`
      : `DOSSIERS DISPONIBLES:\n${foldersContext}\n\nDOCUMENTS (1 = le plus récent = "dernier document"):\n${docsContext}${expiringContext}${relevantContext}\n\nRAPPEL: Position 1 = document le plus récent. Quand l'utilisateur dit "mon dernier document", utilise celui en position 1.`;

    const basePrompt = isEnglish ? DOCUBOT_SYSTEM_PROMPT_EN : DOCUBOT_SYSTEM_PROMPT_FR;
    const systemPrompt = basePrompt.replace("{context}", context);

    // Build conversation
    const conversationHistory = (history || []).slice(-8).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Model acknowledgment message based on language
    const modelAck = isEnglish
      ? "Got it! I'm DocuBot, ready to help you with your documents."
      : "Compris ! Je suis DocuBot, prêt à t'aider avec tes documents.";

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const GEMINI_HEADERS = { "Content-Type": "application/json" };
    const generationConfig = { temperature: 0.7, maxOutputTokens: 1024 };

    // Build initial conversation
    const geminiContents: any[] = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: modelAck }] },
      ...conversationHistory,
      { role: "user", parts: [{ text: message }] },
    ];

    // First call to Gemini with function declarations
    let response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: GEMINI_HEADERS,
      body: JSON.stringify({
        contents: geminiContents,
        tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
        generationConfig,
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return streamText(isEnglish ? "Sorry, I couldn't process your request." : "Désolé, je n'ai pas pu traiter ta demande.");
    }

    let data = await response.json();
    let candidate = data.candidates?.[0];

    // Multi-turn function call loop — Gemini can chain up to 4 function calls per message
    const MAX_FUNCTION_CALLS = 4;
    let callCount = 0;

    while (callCount < MAX_FUNCTION_CALLS) {
      const functionCall = candidate?.content?.parts?.find((p: any) => p.functionCall)?.functionCall;
      if (!functionCall) break;

      callCount++;
      console.log(`[DocuBot] Function call ${callCount}:`, functionCall.name, functionCall.args);

      // Add model's turn (with the function call) to conversation
      geminiContents.push({ role: "model", parts: candidate.content.parts });

      // Execute the function
      const functionResult = await executeFunction(userId, functionCall.name, functionCall.args || {});
      console.log(`[DocuBot] Function result:`, functionResult);

      // Add function result to conversation
      geminiContents.push({
        role: "function",
        parts: [{ functionResponse: { name: functionCall.name, response: functionResult } }],
      });

      if (!functionResult.success) {
        const defaultError = isEnglish ? "Sorry, I couldn't do that. Try again?" : "Désolé, je n'ai pas réussi. Réessaie ?";
        return streamText(`❌ ${functionResult.error || defaultError}`);
      }

      // Next Gemini call with updated conversation
      const nextRes = await fetch(GEMINI_URL, {
        method: "POST",
        headers: GEMINI_HEADERS,
        body: JSON.stringify({
          contents: geminiContents,
          tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
          generationConfig,
        }),
      });

      if (!nextRes.ok) {
        return streamText(isEnglish ? "Sorry, I couldn't process your request." : "Désolé, je n'ai pas pu traiter ta demande.");
      }

      const nextData = await nextRes.json();
      candidate = nextData.candidates?.[0];
    }

    // Stream the final text response
    const fallbackMessage = isEnglish
      ? "I didn't understand. Can you rephrase?"
      : "Je n'ai pas compris. Peux-tu reformuler ?";

    const finalText = candidate?.content?.parts?.find((p: any) => p.text)?.text || fallbackMessage;
    const aiResponse = stripMarkdown(
      finalText
        .replace(/\[ID:[^\]]+\]/g, "")
        .replace(/\(ID:[^)]+\)/g, "")
        .replace(/ID:\s*[a-z0-9]{20,}/gi, "")
        .replace(/[ \t]{2,}/g, " ")
    );

    return streamText(aiResponse);
  } catch (error) {
    console.error("DocuBot error:", error);
    return streamText("Oups, une erreur s'est produite. Réessaie !");
  }
}
