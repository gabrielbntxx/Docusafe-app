import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type DocType =
  | "facture"
  | "devis"
  | "contrat"
  | "bon-de-commande"
  | "lettre";

// ─── Field schemas per doc type ───────────────────────────────────────────────

const FIELD_SCHEMAS: Record<DocType, string> = {
  facture: `{
  "invoiceNumber": "string — numéro de facture (ex: FAC-2024-001)",
  "invoiceDate": "string — date au format YYYY-MM-DD",
  "dueDate": "string — date d'échéance YYYY-MM-DD (défaut: 30 jours après invoiceDate)",
  "senderName": "string — nom ou entreprise de l'émetteur",
  "senderAddress": "string — adresse de l'émetteur",
  "senderCity": "string — ville et code postal de l'émetteur",
  "senderSiret": "string — SIRET si mentionné",
  "senderEmail": "string — email de l'émetteur",
  "senderPhone": "string — téléphone de l'émetteur",
  "clientName": "string — nom ou entreprise du client",
  "clientAddress": "string — adresse du client",
  "clientCity": "string — ville et code postal du client",
  "clientEmail": "string — email du client",
  "notes": "string — notes supplémentaires",
  "paymentTerms": "string — conditions de paiement",
  "items": [{"description": "string", "quantity": "number", "unitPrice": "number", "vatRate": "number (défaut 20)"}]
}`,
  devis: `{
  "quoteNumber": "string — numéro de devis (ex: DEV-2024-001)",
  "quoteDate": "string — date YYYY-MM-DD",
  "validUntil": "string — valable jusqu'au YYYY-MM-DD (défaut: 30 jours)",
  "senderName": "string — prestataire",
  "senderAddress": "string",
  "senderCity": "string",
  "senderSiret": "string",
  "senderEmail": "string",
  "senderPhone": "string",
  "clientName": "string — client",
  "clientAddress": "string",
  "clientCity": "string",
  "clientEmail": "string",
  "notes": "string",
  "items": [{"description": "string", "quantity": "number", "unitPrice": "number", "vatRate": "number (défaut 20)"}]
}`,
  contrat: `{
  "senderName": "string — nom du prestataire",
  "senderAddress": "string — adresse du prestataire",
  "senderCity": "string",
  "senderSiret": "string",
  "senderEmail": "string",
  "clientName": "string — nom du client",
  "clientAddress": "string",
  "clientCity": "string",
  "clientEmail": "string",
  "missionTitle": "string — titre de la mission",
  "missionDescription": "string — description détaillée",
  "startDate": "string — YYYY-MM-DD",
  "endDate": "string — YYYY-MM-DD",
  "rate": "string — montant en chiffres seulement (ex: 5000)",
  "rateType": "string — 'fixed', 'daily' ou 'hourly'",
  "paymentSchedule": "string — modalités de paiement",
  "obligations": "string — obligations des parties",
  "terminationClause": "string — clause de résiliation si spécifique"
}`,
  "bon-de-commande": `{
  "orderNumber": "string — numéro de commande (ex: CMD-2024-001)",
  "orderDate": "string — YYYY-MM-DD",
  "deliveryDate": "string — YYYY-MM-DD si mentionnée",
  "buyerName": "string — acheteur",
  "buyerAddress": "string",
  "buyerCity": "string",
  "buyerEmail": "string",
  "vendorName": "string — fournisseur",
  "vendorAddress": "string",
  "vendorCity": "string",
  "vendorEmail": "string",
  "deliveryTerms": "string — conditions de livraison",
  "notes": "string",
  "items": [{"description": "string", "reference": "string", "quantity": "number", "unitPrice": "number", "vatRate": "number (défaut 20)"}]
}`,
  lettre: `{
  "senderName": "string — expéditeur",
  "senderAddress": "string",
  "senderCity": "string",
  "recipientName": "string — destinataire",
  "recipientAddress": "string",
  "recipientCity": "string",
  "city": "string — lieu d'envoi",
  "date": "string — YYYY-MM-DD",
  "subject": "string — objet de la lettre",
  "body": "string — corps complet de la lettre (commencer par 'Madame, Monsieur,' si non précisé)",
  "closing": "string — formule de politesse"
}`,
};

const TYPE_LABELS: Record<DocType, string> = {
  facture: "Facture",
  devis: "Devis",
  contrat: "Contrat de prestation de service",
  "bon-de-commande": "Bon de commande",
  lettre: "Lettre formelle",
};

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true },
    });

    if (!user || user.planType !== "BUSINESS") {
      return NextResponse.json(
        { error: "Fonctionnalité réservée au plan Business" },
        { status: 403 }
      );
    }

    const { type, prompt } = await req.json();

    if (!type || !prompt) {
      return NextResponse.json(
        { error: "Type et description requis" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Service IA non disponible" },
        { status: 503 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const year = new Date().getFullYear();

    const systemPrompt = `Tu es un assistant expert en documents professionnels français.
L'utilisateur veut créer un(e) ${TYPE_LABELS[type as DocType]}.
La date d'aujourd'hui est ${today}.

Analyse la description et extrais les informations pour remplir le formulaire.
Retourne UNIQUEMENT un objet JSON valide correspondant exactement à ce schéma :
${FIELD_SCHEMAS[type as DocType]}

Règles importantes :
- Dates au format YYYY-MM-DD uniquement
- Montants en chiffres sans symbole (ex: 800 et non 800€)
- N'inclus que les champs pour lesquels tu as de l'information (omets les autres)
- Pour les numéros (facture, devis, commande) : si non mentionné, génère ${year}-001
- Pour items : si des prestations sont mentionnées, crée les lignes correspondantes
- Si c'est une lettre et que le corps n'est pas précisé, rédige un corps professionnel adapté à l'objet
- Retourne du JSON pur, sans markdown ni commentaires`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `Description : ${prompt}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur du service IA" },
        { status: 502 }
      );
    }

    const geminiData = await response.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // Parse JSON (Gemini returns clean JSON with responseMimeType)
    let fields: Record<string, any> = {};
    try {
      fields = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: "Réponse IA invalide, réessayez" },
        { status: 502 }
      );
    }

    // Separate items from flat fields
    const { items, ...formFields } = fields;

    return NextResponse.json({ fields: formFields, items: items ?? null });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'assistance IA" },
      { status: 500 }
    );
  }
}
