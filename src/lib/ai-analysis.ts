import { db } from "@/lib/db";
import crypto from "crypto";

// ============================================================================
// DOCUMENT TYPES - Beaucoup plus de types pour une classification précise
// ============================================================================
export const DOCUMENT_TYPES = {
  // --- PHOTOS & IMAGES ---
  PHOTO_PERSONNELLE: "photo_personnelle",
  PHOTO_FAMILLE: "photo_famille",
  PHOTO_VOYAGE: "photo_voyage",
  PHOTO_EVENEMENT: "photo_evenement",
  PHOTO_PROFIL: "photo_profil",
  SCREENSHOT: "screenshot",
  IMAGE_ARTISTIQUE: "image_artistique",
  MEME_IMAGE: "meme_image",

  // --- EDUCATION & ETUDES ---
  COURS: "cours",
  NOTES_DE_COURS: "notes_de_cours",
  DISSERTATION: "dissertation",
  MEMOIRE_THESE: "memoire_these",
  EXERCICES: "exercices",
  EXAMEN: "examen",
  DIPLOME: "diplome",
  RELEVE_NOTES: "releve_notes",
  CERTIFICAT_FORMATION: "certificat_formation",
  ATTESTATION_SCOLARITE: "attestation_scolarite",
  CARTE_ETUDIANT: "carte_etudiant",

  // --- EMPLOI & CARRIERE ---
  CV: "cv",
  LETTRE_MOTIVATION: "lettre_motivation",
  CONTRAT_TRAVAIL: "contrat_travail",
  FICHE_DE_PAIE: "fiche_de_paie",
  ATTESTATION_EMPLOYEUR: "attestation_employeur",
  CERTIFICAT_TRAVAIL: "certificat_travail",
  SOLDE_TOUT_COMPTE: "solde_tout_compte",
  ATTESTATION_POLE_EMPLOI: "attestation_pole_emploi",
  OFFRE_EMPLOI: "offre_emploi",

  // --- ASSURANCE ---
  CONTRAT_ASSURANCE: "contrat_assurance",
  ATTESTATION_ASSURANCE: "attestation_assurance",
  CARTE_ASSURANCE: "carte_assurance",
  CONSTAT_AMIABLE: "constat_amiable",
  DECLARATION_SINISTRE: "declaration_sinistre",
  ASSURANCE_AUTO: "assurance_auto",
  ASSURANCE_HABITATION: "assurance_habitation",
  ASSURANCE_VIE: "assurance_vie",
  MUTUELLE: "mutuelle",

  // --- BANQUE & FINANCE ---
  RELEVE_BANCAIRE: "releve_bancaire",
  RIB: "rib",
  CHEQUE: "cheque",
  VIREMENT: "virement",
  PRET_BANCAIRE: "pret_bancaire",
  ECHEANCIER: "echeancier",
  CARTE_BANCAIRE: "carte_bancaire",

  // --- IMPOTS & TAXES ---
  AVIS_IMPOSITION: "avis_imposition",
  DECLARATION_REVENUS: "declaration_revenus",
  TAXE_HABITATION: "taxe_habitation",
  TAXE_FONCIERE: "taxe_fonciere",
  AVIS_CFE: "avis_cfe",

  // --- LOGEMENT ---
  BAIL: "bail",
  QUITTANCE_LOYER: "quittance_loyer",
  ETAT_DES_LIEUX: "etat_des_lieux",
  ATTESTATION_HEBERGEMENT: "attestation_hebergement",
  TITRE_PROPRIETE: "titre_propriete",
  FACTURE_ENERGIE: "facture_energie",
  FACTURE_EAU: "facture_eau",
  FACTURE_INTERNET: "facture_internet",

  // --- VEHICULE ---
  CARTE_GRISE: "carte_grise",
  PERMIS_CONDUIRE: "permis_conduire",
  CONTROLE_TECHNIQUE: "controle_technique",
  FACTURE_ENTRETIEN_AUTO: "facture_entretien_auto",
  PV_AMENDE: "pv_amende",
  ASSURANCE_VEHICULE: "assurance_vehicule",

  // --- SANTE ---
  ORDONNANCE: "ordonnance",
  COMPTE_RENDU_MEDICAL: "compte_rendu_medical",
  ANALYSE_MEDICALE: "analyse_medicale",
  RADIOGRAPHIE: "radiographie",
  CARTE_VITALE: "carte_vitale",
  CARNET_VACCINATION: "carnet_vaccination",
  FACTURE_MEDICALE: "facture_medicale",
  REMBOURSEMENT_SECU: "remboursement_secu",

  // --- IDENTITE ---
  CARTE_IDENTITE: "carte_identite",
  PASSEPORT: "passeport",
  ACTE_NAISSANCE: "acte_naissance",
  LIVRET_FAMILLE: "livret_famille",
  JUSTIFICATIF_DOMICILE: "justificatif_domicile",
  CARTE_SEJOUR: "carte_sejour",

  // --- FACTURES & ACHATS ---
  FACTURE: "facture",
  TICKET_CAISSE: "ticket_caisse",
  BON_COMMANDE: "bon_commande",
  DEVIS: "devis",
  BON_LIVRAISON: "bon_livraison",
  GARANTIE: "garantie",
  FACTURE_TELEPHONE: "facture_telephone",
  ABONNEMENT: "abonnement",

  // --- JURIDIQUE ---
  CONTRAT: "contrat",
  JUGEMENT: "jugement",
  ACTE_NOTARIE: "acte_notarie",
  PROCES_VERBAL: "proces_verbal",
  PLAINTE: "plainte",
  PROCURATION: "procuration",

  // --- CORRESPONDANCE ---
  LETTRE_ADMINISTRATIVE: "lettre_administrative",
  COURRIER_OFFICIEL: "courrier_officiel",
  EMAIL_IMPORTANT: "email_important",
  CONVOCATION: "convocation",
  NOTIFICATION: "notification",

  // --- VOYAGE ---
  BILLET_AVION: "billet_avion",
  BILLET_TRAIN: "billet_train",
  RESERVATION_HOTEL: "reservation_hotel",
  VISA: "visa",

  // --- AUDIO ---
  AUDIO_MUSIQUE: "audio_musique",
  AUDIO_PODCAST: "audio_podcast",
  AUDIO_MEMO_VOCAL: "audio_memo_vocal",
  AUDIO_INTERVIEW: "audio_interview",
  AUDIO_COURS: "audio_cours",
  AUDIO_REUNION: "audio_reunion",
  AUDIO_AUTRE: "audio_autre",

  // --- AUTRE ---
  RECETTE_CUISINE: "recette_cuisine",
  LISTE: "liste",
  NOTE_PERSONNELLE: "note_personnelle",
  DOCUMENT_PROFESSIONNEL: "document_professionnel",
  AUTRE: "autre",
} as const;

// ============================================================================
// CATEGORIES - Plus de catégories pour un tri ultra précis
// ============================================================================
export const DOCUMENT_CATEGORIES = {
  PHOTOS: {
    name: "Photos",
    icon: "camera",
    color: "#EC4899",
    description: "Photos personnelles, famille, voyages, événements"
  },
  ETUDES: {
    name: "Études",
    icon: "graduation-cap",
    color: "#8B5CF6",
    description: "Cours, diplômes, notes, formations"
  },
  EMPLOI: {
    name: "Emploi",
    icon: "briefcase",
    color: "#6366F1",
    description: "CV, contrats de travail, fiches de paie"
  },
  ASSURANCE: {
    name: "Assurance",
    icon: "shield-check",
    color: "#14B8A6",
    description: "Contrats et attestations d'assurance"
  },
  BANQUE: {
    name: "Banque",
    icon: "landmark",
    color: "#3B82F6",
    description: "Relevés bancaires, RIB, prêts"
  },
  IMPOTS: {
    name: "Impôts",
    icon: "receipt",
    color: "#F97316",
    description: "Avis d'imposition, taxes, déclarations"
  },
  LOGEMENT: {
    name: "Logement",
    icon: "home",
    color: "#EAB308",
    description: "Bail, quittances, factures énergie"
  },
  VEHICULE: {
    name: "Véhicule",
    icon: "car",
    color: "#64748B",
    description: "Carte grise, permis, contrôle technique"
  },
  SANTE: {
    name: "Santé",
    icon: "heart-pulse",
    color: "#EF4444",
    description: "Ordonnances, analyses, carte vitale"
  },
  IDENTITE: {
    name: "Identité",
    icon: "user-check",
    color: "#A855F7",
    description: "Carte d'identité, passeport, actes"
  },
  FACTURES: {
    name: "Factures",
    icon: "file-text",
    color: "#10B981",
    description: "Factures, tickets, achats"
  },
  JURIDIQUE: {
    name: "Juridique",
    icon: "scale",
    color: "#78716C",
    description: "Contrats, actes notariés, jugements"
  },
  VOYAGE: {
    name: "Voyage",
    icon: "plane",
    color: "#06B6D4",
    description: "Billets, réservations, visas"
  },
  ADMINISTRATIF: {
    name: "Administratif",
    icon: "folder-open",
    color: "#F59E0B",
    description: "Courriers officiels, attestations"
  },
  AUDIO: {
    name: "Audio",
    icon: "music",
    color: "#F472B6",
    description: "Fichiers audio, musique, podcasts, mémos vocaux"
  },
  AUTRE: {
    name: "Autres",
    icon: "folder",
    color: "#6B7280",
    description: "Documents non classés"
  },
} as const;

// ============================================================================
// MAPPING TYPE -> CATEGORIE (Ultra précis)
// ============================================================================
export const TYPE_TO_CATEGORY: Record<string, keyof typeof DOCUMENT_CATEGORIES> = {
  // Photos
  photo_personnelle: "PHOTOS",
  photo_famille: "PHOTOS",
  photo_voyage: "PHOTOS",
  photo_evenement: "PHOTOS",
  photo_profil: "PHOTOS",
  screenshot: "PHOTOS",
  image_artistique: "PHOTOS",
  meme_image: "PHOTOS",

  // Études
  cours: "ETUDES",
  notes_de_cours: "ETUDES",
  dissertation: "ETUDES",
  memoire_these: "ETUDES",
  exercices: "ETUDES",
  examen: "ETUDES",
  diplome: "ETUDES",
  releve_notes: "ETUDES",
  certificat_formation: "ETUDES",
  attestation_scolarite: "ETUDES",
  carte_etudiant: "ETUDES",

  // Emploi
  cv: "EMPLOI",
  lettre_motivation: "EMPLOI",
  contrat_travail: "EMPLOI",
  fiche_de_paie: "EMPLOI",
  attestation_employeur: "EMPLOI",
  certificat_travail: "EMPLOI",
  solde_tout_compte: "EMPLOI",
  attestation_pole_emploi: "EMPLOI",
  offre_emploi: "EMPLOI",

  // Assurance (SEPARATE - pas dans Finance!)
  contrat_assurance: "ASSURANCE",
  attestation_assurance: "ASSURANCE",
  carte_assurance: "ASSURANCE",
  constat_amiable: "ASSURANCE",
  declaration_sinistre: "ASSURANCE",
  assurance_auto: "ASSURANCE",
  assurance_habitation: "ASSURANCE",
  assurance_vie: "ASSURANCE",
  mutuelle: "ASSURANCE",

  // Banque
  releve_bancaire: "BANQUE",
  rib: "BANQUE",
  cheque: "BANQUE",
  virement: "BANQUE",
  pret_bancaire: "BANQUE",
  echeancier: "BANQUE",
  carte_bancaire: "BANQUE",

  // Impôts (SEPARATE - pas dans Finance!)
  avis_imposition: "IMPOTS",
  declaration_revenus: "IMPOTS",
  taxe_habitation: "IMPOTS",
  taxe_fonciere: "IMPOTS",
  avis_cfe: "IMPOTS",

  // Logement
  bail: "LOGEMENT",
  quittance_loyer: "LOGEMENT",
  etat_des_lieux: "LOGEMENT",
  attestation_hebergement: "LOGEMENT",
  titre_propriete: "LOGEMENT",
  facture_energie: "LOGEMENT",
  facture_eau: "LOGEMENT",
  facture_internet: "LOGEMENT",

  // Véhicule
  carte_grise: "VEHICULE",
  permis_conduire: "VEHICULE",
  controle_technique: "VEHICULE",
  facture_entretien_auto: "VEHICULE",
  pv_amende: "VEHICULE",
  assurance_vehicule: "VEHICULE",

  // Santé
  ordonnance: "SANTE",
  compte_rendu_medical: "SANTE",
  analyse_medicale: "SANTE",
  radiographie: "SANTE",
  carte_vitale: "SANTE",
  carnet_vaccination: "SANTE",
  facture_medicale: "SANTE",
  remboursement_secu: "SANTE",

  // Identité
  carte_identite: "IDENTITE",
  passeport: "IDENTITE",
  acte_naissance: "IDENTITE",
  livret_famille: "IDENTITE",
  justificatif_domicile: "IDENTITE",
  carte_sejour: "IDENTITE",

  // Factures & Achats
  facture: "FACTURES",
  ticket_caisse: "FACTURES",
  bon_commande: "FACTURES",
  devis: "FACTURES",
  bon_livraison: "FACTURES",
  garantie: "FACTURES",
  facture_telephone: "FACTURES",
  abonnement: "FACTURES",

  // Juridique
  contrat: "JURIDIQUE",
  jugement: "JURIDIQUE",
  acte_notarie: "JURIDIQUE",
  proces_verbal: "JURIDIQUE",
  plainte: "JURIDIQUE",
  procuration: "JURIDIQUE",

  // Voyage
  billet_avion: "VOYAGE",
  billet_train: "VOYAGE",
  reservation_hotel: "VOYAGE",
  visa: "VOYAGE",

  // Administratif
  lettre_administrative: "ADMINISTRATIF",
  courrier_officiel: "ADMINISTRATIF",
  email_important: "ADMINISTRATIF",
  convocation: "ADMINISTRATIF",
  notification: "ADMINISTRATIF",

  // Audio
  audio_musique: "AUDIO",
  audio_podcast: "AUDIO",
  audio_memo_vocal: "AUDIO",
  audio_interview: "AUDIO",
  audio_cours: "AUDIO",
  audio_reunion: "AUDIO",
  audio_autre: "AUDIO",

  // Autre
  recette_cuisine: "AUTRE",
  liste: "AUTRE",
  note_personnelle: "AUTRE",
  document_professionnel: "AUTRE",
  autre: "AUTRE",
};

// ============================================================================
// TYPES
// ============================================================================
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
    subject?: string;
    location?: string;
    people?: string;
    description?: string;
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
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { planType: true, aiSortingEnabled: true },
  });

  if (!user) {
    return { allowed: false, remaining: 0, limit: 0, reason: "User not found" };
  }

  if (user.aiSortingEnabled === 0) {
    return { allowed: false, remaining: 0, limit: 0, reason: "AI sorting disabled" };
  }

  // TEMPORARILY UNLIMITED FOR ALL USERS
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

// ============================================================================
// LE PROMPT ULTIME - Machine de guerre pour classifier les documents
// ============================================================================
const AI_CLASSIFICATION_PROMPT = `Tu es DocuSafe AI, un système expert ultra-précis de classification de documents. Tu dois analyser ce fichier en PROFONDEUR.

## TA MISSION
Analyse le contenu visuel, textuel OU AUDIO de ce fichier pour déterminer EXACTEMENT ce qu'il est.

## RÈGLES CRITIQUES
1. PHOTOS: Si c'est une photo de personnes, paysages, événements, selfies, vacances → C'est une PHOTO, pas un document!
2. ASSURANCE ≠ FINANCE: Les documents d'assurance vont dans "assurance", PAS dans "finance"
3. IMPÔTS ≠ FINANCE: Les avis d'imposition vont dans "impots", PAS dans "finance"
4. COURS/ÉTUDES: PDF de cours, notes, exercices, examens → catégorie "études"
5. AUDIO: Pour les fichiers audio, écoute attentivement le contenu pour classifier (musique, podcast, mémo vocal, cours audio, etc.)
6. Sois PRÉCIS: "cours de droit" → cours, "photo à la plage" → photo_voyage, "musique pop" → audio_musique

## TYPES DE DOCUMENTS DISPONIBLES

### PHOTOS & IMAGES
- photo_personnelle: Selfie, portrait personnel
- photo_famille: Photo de famille, réunion familiale
- photo_voyage: Photo de vacances, plage, montagne, voyage, tourisme
- photo_evenement: Mariage, anniversaire, fête, concert
- photo_profil: Photo CV, LinkedIn, professionnelle
- screenshot: Capture d'écran de téléphone/ordinateur
- image_artistique: Art, dessin, illustration
- meme_image: Mème internet, image humoristique

### ÉTUDES & ÉDUCATION
- cours: Support de cours, polycopié, slides de cours
- notes_de_cours: Notes manuscrites ou tapées de cours
- dissertation: Dissertation, composition, essai
- memoire_these: Mémoire, thèse, rapport de stage
- exercices: TD, TP, exercices, corrections
- examen: Sujet d'examen, partiel, concours
- diplome: Diplôme officiel (bac, licence, master, etc.)
- releve_notes: Relevé de notes, bulletin scolaire
- certificat_formation: Certificat de formation, MOOC
- attestation_scolarite: Attestation d'inscription, certificat scolarité
- carte_etudiant: Carte étudiante

### EMPLOI & CARRIÈRE
- cv: Curriculum vitae, CV, résumé professionnel
- lettre_motivation: Lettre de motivation, candidature
- contrat_travail: CDI, CDD, contrat de travail
- fiche_de_paie: Bulletin de salaire, fiche de paie
- attestation_employeur: Attestation de l'employeur
- certificat_travail: Certificat de travail
- solde_tout_compte: Solde de tout compte
- attestation_pole_emploi: Attestation Pôle Emploi, ARE

### ASSURANCE (PAS FINANCE!)
- contrat_assurance: Contrat d'assurance générique
- attestation_assurance: Attestation d'assurance
- carte_assurance: Carte d'assuré
- constat_amiable: Constat accident
- declaration_sinistre: Déclaration de sinistre
- assurance_auto: Assurance voiture/moto
- assurance_habitation: Assurance logement
- assurance_vie: Assurance vie, épargne
- mutuelle: Mutuelle santé, complémentaire

### BANQUE
- releve_bancaire: Relevé de compte
- rib: RIB, IBAN
- cheque: Chèque
- pret_bancaire: Offre de prêt, crédit
- echeancier: Échéancier de remboursement

### IMPÔTS (PAS FINANCE!)
- avis_imposition: Avis d'imposition sur le revenu
- declaration_revenus: Déclaration de revenus
- taxe_habitation: Taxe d'habitation
- taxe_fonciere: Taxe foncière

### LOGEMENT
- bail: Contrat de location, bail
- quittance_loyer: Quittance de loyer
- etat_des_lieux: État des lieux entrée/sortie
- attestation_hebergement: Attestation d'hébergement
- facture_energie: Facture EDF, Engie, gaz, électricité
- facture_eau: Facture d'eau
- facture_internet: Facture internet, box, fibre

### VÉHICULE
- carte_grise: Certificat d'immatriculation
- permis_conduire: Permis de conduire
- controle_technique: Contrôle technique
- facture_entretien_auto: Facture garage, entretien
- pv_amende: PV, contravention, amende

### SANTÉ
- ordonnance: Ordonnance médicale
- compte_rendu_medical: Compte-rendu de consultation
- analyse_medicale: Résultats d'analyses, bilan sanguin
- radiographie: Radio, scanner, IRM
- carte_vitale: Carte vitale, attestation droits
- carnet_vaccination: Carnet de vaccination, pass sanitaire
- facture_medicale: Facture médecin, hôpital

### IDENTITÉ
- carte_identite: Carte nationale d'identité
- passeport: Passeport
- acte_naissance: Acte de naissance
- livret_famille: Livret de famille
- justificatif_domicile: Justificatif de domicile

### FACTURES & ACHATS
- facture: Facture d'achat générique
- ticket_caisse: Ticket de caisse, reçu
- devis: Devis
- garantie: Certificat de garantie

### JURIDIQUE
- contrat: Contrat générique (pas travail/bail)
- acte_notarie: Acte notarié
- jugement: Jugement, décision de justice
- procuration: Procuration

### VOYAGE
- billet_avion: Billet d'avion, boarding pass
- billet_train: Billet de train SNCF
- reservation_hotel: Réservation hôtel
- visa: Visa

### ADMINISTRATIF
- lettre_administrative: Lettre d'administration
- courrier_officiel: Courrier CAF, CPAM, mairie
- convocation: Convocation

### AUDIO (fichiers audio MP3, WAV, etc.)
- audio_musique: Musique, chanson, morceau musical
- audio_podcast: Épisode de podcast, émission audio
- audio_memo_vocal: Mémo vocal, note vocale, enregistrement personnel
- audio_interview: Interview, entretien enregistré
- audio_cours: Cours audio, conférence enregistrée, audiobook éducatif
- audio_reunion: Enregistrement de réunion, meeting
- audio_autre: Autre fichier audio non classifié

### AUTRE
- recette_cuisine: Recette de cuisine
- note_personnelle: Note, mémo personnel
- autre: Vraiment inclassable

## EXEMPLES DE CLASSIFICATION CORRECTE

| Ce que tu vois | Type | Catégorie |
|----------------|------|-----------|
| Photo de plage avec personnes | photo_voyage | Photos |
| PDF "Droit constitutionnel L2" | cours | Études |
| Selfie | photo_personnelle | Photos |
| Document MAIF/MATMUT | contrat_assurance | Assurance |
| Avis impôt 2024 | avis_imposition | Impôts |
| Screenshot iPhone | screenshot | Photos |
| "CV - Jean Dupont" | cv | Emploi |
| Facture Amazon | facture | Factures |
| Bulletin de notes université | releve_notes | Études |
| MP3 avec musique/chanson | audio_musique | Audio |
| Enregistrement vocal personnel | audio_memo_vocal | Audio |
| Épisode podcast/discussion | audio_podcast | Audio |
| Cours enregistré/conférence | audio_cours | Audio |

## FORMAT DE RÉPONSE
Réponds UNIQUEMENT avec ce JSON (sans \`\`\`, sans markdown):

{"documentType":"type_exact","confidence":0.95,"suggestedName":"Nom descriptif en français","extractedData":{"date":"2024-01-15","amount":"150.00€","issuer":"Émetteur","recipient":"Destinataire","reference":"REF123","subject":"Sujet principal","location":"Lieu si visible","people":"Personnes identifiées","description":"Description courte du contenu"}}

IMPORTANT: Remplis tous les champs extractedData pertinents. Pour les photos, décris ce que tu vois (lieu, personnes, contexte). Pour les audios, décris ce que tu entends (type de contenu, sujet, langue, ambiance).`;

/**
 * Analyze document with Gemini AI - VERSION ULTRA
 */
export async function analyzeDocumentWithAI(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("[AI Analysis] Starting ULTRA analysis for:", fileName, "mimeType:", mimeType, "size:", fileBuffer.length);

  if (!apiKey) {
    console.error("[AI Analysis] GEMINI_API_KEY not configured!");
    throw new Error("GEMINI_API_KEY not configured");
  }

  const base64Data = fileBuffer.toString("base64");
  console.log("[AI Analysis] Base64 data length:", base64Data.length);

  let geminiMimeType = mimeType;
  if (mimeType === "application/pdf") {
    geminiMimeType = "application/pdf";
  } else if (mimeType.startsWith("image/")) {
    geminiMimeType = mimeType;
  } else if (mimeType.startsWith("audio/")) {
    // Gemini supports audio analysis
    // Map common audio types to Gemini-supported formats
    if (mimeType === "audio/mpeg" || mimeType === "audio/mp3") {
      geminiMimeType = "audio/mpeg";
    } else if (mimeType === "audio/wav" || mimeType === "audio/x-wav" || mimeType === "audio/wave") {
      geminiMimeType = "audio/wav";
    } else {
      geminiMimeType = "audio/mpeg"; // Default fallback for audio
    }
  } else {
    geminiMimeType = "application/pdf";
  }
  console.log("[AI Analysis] Using mimeType for Gemini:", geminiMimeType);

  try {
    console.log("[AI Analysis] Calling Gemini API with ULTRA prompt...");

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
                { text: AI_CLASSIFICATION_PROMPT },
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
            maxOutputTokens: 2048,
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

    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      console.error("[AI Analysis] Content blocked by safety filters");
      throw new Error("Content blocked by safety filters");
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("[AI Analysis] Extracted text response:", textResponse);

    if (!textResponse) {
      console.error("[AI Analysis] Empty response from Gemini");
      throw new Error("Empty response from Gemini");
    }

    // Parse JSON from response
    let jsonStr = textResponse.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }
    jsonStr = jsonStr.trim();
    console.log("[AI Analysis] Cleaned JSON string:", jsonStr);

    const parsed = JSON.parse(jsonStr);
    console.log("[AI Analysis] Parsed result:", parsed);

    // Map document type to category
    const documentType = parsed.documentType || "autre";
    const categoryKey = TYPE_TO_CATEGORY[documentType] || "AUTRE";
    const category = DOCUMENT_CATEGORIES[categoryKey].name;

    console.log("[AI Analysis] ULTRA classification:", documentType, "->", category, "(", categoryKey, ")");

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
        subject: parsed.extractedData?.subject || undefined,
        location: parsed.extractedData?.location || undefined,
        people: parsed.extractedData?.people || undefined,
        description: parsed.extractedData?.description || undefined,
      },
      rawResponse: textResponse,
    };
  } catch (error) {
    console.error("[AI Analysis] CRITICAL ERROR:", error);

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

  // Increment usage
  await incrementAIUsage(userId);

  return { success: true, result, fromCache: false };
}

/**
 * Get or create folder for category
 * Searches intelligently for existing folders that match the category
 */
export async function getOrCreateCategoryFolder(
  userId: string,
  category: string
): Promise<string> {
  // Get all user folders
  const allFolders = await db.folder.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  // Normalize for comparison (lowercase, no accents)
  const normalize = (str: string) =>
    str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const normalizedCategory = normalize(category);

  // 1. Check exact match (case insensitive)
  let matchingFolder = allFolders.find(
    (f) => normalize(f.name) === normalizedCategory
  );

  // 2. Check if any folder name contains the category or vice versa
  if (!matchingFolder) {
    matchingFolder = allFolders.find(
      (f) => normalize(f.name).includes(normalizedCategory) ||
             normalizedCategory.includes(normalize(f.name))
    );
  }

  // 3. Check for common variations (e.g., "Factures" matches "Facture", "Photos" matches "Photo")
  if (!matchingFolder) {
    const categoryBase = normalizedCategory.replace(/s$/, ""); // Remove trailing 's'
    matchingFolder = allFolders.find((f) => {
      const folderBase = normalize(f.name).replace(/s$/, "");
      return folderBase === categoryBase;
    });
  }

  // If found, return existing folder
  if (matchingFolder) {
    console.log(`[AI Analysis] Found existing folder "${matchingFolder.name}" for category "${category}"`);
    return matchingFolder.id;
  }

  // No existing folder found, create a new one
  console.log(`[AI Analysis] Creating new folder for category "${category}"`);

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
