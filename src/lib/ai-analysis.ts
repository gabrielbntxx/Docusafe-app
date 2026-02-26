import { db } from "@/lib/db";
import crypto from "crypto";
import { extractAppleQuickLookPdf, APPLE_IWORK_MIME_TYPES } from "@/lib/pdf-converter";
import { getProfessionAIContext } from "@/lib/professions";
import * as XLSX from "xlsx";

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
  AUDIO_LIVRE: "audio_livre",
  AUDIO_AUTRE: "audio_autre",

  // --- VIDÉO ---
  VIDEO_COURS: "video_cours",
  VIDEO_TUTORIAL: "video_tutorial",
  VIDEO_CONFERENCE: "video_conference",
  VIDEO_PERSONNELLE: "video_personnelle",
  VIDEO_VOYAGE: "video_voyage",
  VIDEO_EVENEMENT: "video_evenement",
  VIDEO_MUSIQUE: "video_musique",
  VIDEO_GAMING: "video_gaming",
  VIDEO_PRESENTATION: "video_presentation",
  VIDEO_REUNION: "video_reunion",
  VIDEO_AUTRE: "video_autre",

  // --- CODE & DÉVELOPPEMENT ---
  CODE_SOURCE: "code_source",
  CODE_PYTHON: "code_python",
  CODE_JAVASCRIPT: "code_javascript",
  CODE_JAVA: "code_java",
  CODE_CPP: "code_cpp",
  CODE_WEB: "code_web",
  CONFIG_FILE: "config_file",
  DATA_FILE: "data_file",
  DOCUMENTATION_TECHNIQUE: "documentation_technique",
  SCRIPT: "script",

  // --- DOCUMENTS OFFICE ---
  DOCUMENT_WORD: "document_word",
  TABLEUR_EXCEL: "tableur_excel",
  PRESENTATION_POWERPOINT: "presentation_powerpoint",
  DOCUMENT_APPLE: "document_apple",

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
  VIDEO: {
    name: "Vidéo",
    icon: "video",
    color: "#EF4444",
    description: "Fichiers vidéo, tutoriels, cours, clips"
  },
  DEVELOPPEMENT: {
    name: "Développement",
    icon: "code",
    color: "#22C55E",
    description: "Fichiers de code, scripts, configurations"
  },
  OFFICE: {
    name: "Documents Office",
    icon: "file-spreadsheet",
    color: "#2563EB",
    description: "Word, Excel, PowerPoint, Pages, Numbers, Keynote"
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
  audio_livre: "AUDIO",
  audio_autre: "AUDIO",

  // Vidéo
  video_cours: "VIDEO",
  video_tutorial: "VIDEO",
  video_conference: "VIDEO",
  video_personnelle: "VIDEO",
  video_voyage: "VIDEO",
  video_evenement: "VIDEO",
  video_musique: "VIDEO",
  video_gaming: "VIDEO",
  video_presentation: "VIDEO",
  video_reunion: "VIDEO",
  video_autre: "VIDEO",

  // Code & Développement
  code_source: "DEVELOPPEMENT",
  code_python: "DEVELOPPEMENT",
  code_javascript: "DEVELOPPEMENT",
  code_java: "DEVELOPPEMENT",
  code_cpp: "DEVELOPPEMENT",
  code_web: "DEVELOPPEMENT",
  config_file: "DEVELOPPEMENT",
  data_file: "DEVELOPPEMENT",
  documentation_technique: "DEVELOPPEMENT",
  script: "DEVELOPPEMENT",

  // Documents Office
  document_word: "OFFICE",
  tableur_excel: "OFFICE",
  presentation_powerpoint: "OFFICE",
  document_apple: "OFFICE",

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
export type ExtractedData = {
  // Common fields (pass 1)
  date?: string;
  expiryDate?: string; // Date d'expiration/renouvellement (YYYY-MM-DD)
  amount?: string;
  issuer?: string;
  recipient?: string;
  reference?: string;
  subject?: string;
  topic?: string; // Matière/thème précis (ex: "Informatique", "Droit")
  location?: string;
  people?: string;
  language?: string;
  duration?: string;
  genre?: string; // Genre pour musique/vidéo
  description?: string;
  // Finance-specific (pass 2)
  montantHT?: string;
  montantTTC?: string;
  tva?: string;
  devise?: string;
  iban?: string;
  bic?: string;
  modeReglement?: string;
  dateEcheance?: string;
  numeroFacture?: string;
  fournisseur?: string;
  // Identity-specific (pass 2)
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  numeroDocument?: string;
  dateDelivrance?: string;
  dateExpiration?: string;
  adresse?: string;
  // Employment-specific (pass 2)
  employeur?: string;
  poste?: string;
  salaireBrut?: string;
  salaireNet?: string;
  primes?: string;
  conges?: string;
  periode?: string;
  contratType?: string;
  dateDebut?: string;
  // Housing-specific (pass 2)
  adresseBien?: string;
  typeBien?: string;
  surface?: string;
  loyer?: string;
  charges?: string;
  proprietaire?: string;
  locataire?: string;
  dateFin?: string;
  depotGarantie?: string;
  // Health-specific (pass 2)
  medecin?: string;
  specialite?: string;
  patient?: string;
  diagnostic?: string;
  traitement?: string;
  posologie?: string;
  dateConsultation?: string;
  numeroSS?: string;
  // Education-specific (pass 2)
  etablissement?: string;
  diplome?: string;
  mention?: string;
  annee?: string;
  matiere?: string;
  note?: string;
  niveau?: string;
  // Legal-specific (pass 2)
  parties?: string;
  typeActe?: string;
  notaire?: string;
  dateSignature?: string;
  clausesParticulieres?: string;
  // Vehicle-specific (pass 2)
  marque?: string;
  modele?: string;
  immatriculation?: string;
  vin?: string;
  dateCirculation?: string;
  puissanceFiscale?: string;
};

export type AIAnalysisResult = {
  documentType: string;
  category: string;
  confidence: number;
  suggestedName?: string;
  suggestedFolder?: string; // Nom de dossier PRÉCIS suggéré par l'IA (ex: "Cours Informatique")
  folderAction?: "use_existing" | "create_new" | "create_subfolder";
  targetFolderId?: string;   // ID du dossier existant si use_existing
  parentFolderId?: string;   // ID du parent si create_subfolder
  extractedData: ExtractedData;
  rawResponse?: string;
};

// ============================================================================
// FOLDER TREE - Fetch and serialize user's folder hierarchy for AI context
// ============================================================================
type FolderNode = {
  id: string;
  name: string;
  children: FolderNode[];
};

async function getUserFolderTree(userId: string): Promise<FolderNode[]> {
  const allFolders = await db.folder.findMany({
    where: { userId },
    select: { id: true, name: true, parentId: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50, // Limit to avoid overloading the prompt
  });

  // Build tree from flat list
  const folderMap = new Map<string, FolderNode>();
  for (const f of allFolders) {
    folderMap.set(f.id, { id: f.id, name: f.name, children: [] });
  }

  const roots: FolderNode[] = [];
  for (const f of allFolders) {
    const node = folderMap.get(f.id)!;
    if (f.parentId && folderMap.has(f.parentId)) {
      folderMap.get(f.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function serializeFolderTree(tree: FolderNode[], indent = 0): string {
  if (tree.length === 0) return "(aucun dossier)";

  let result = "";
  for (const node of tree) {
    const prefix = "  ".repeat(indent);
    result += `${prefix}- "${node.name}" (id: ${node.id})\n`;
    if (node.children.length > 0) {
      result += serializeFolderTree(node.children, indent + 1);
    }
  }
  return result;
}

// Free tier limit (currently unlimited for all users)
const _FREE_AI_LIMIT = 10; // Reserved for future use

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

  // Re-parse rawResponse to recover the full extractedData (expiryDate, subject, topic, etc.)
  // The DB schema only stores 3 fields, but rawResponse contains the complete Gemini JSON.
  // Supports both legacy (single-pass) and multi-pass format ({"pass1":"...","pass2":{...}})
  if (cached.rawResponse && !cached.rawResponse.startsWith("FALLBACK") && !cached.rawResponse.startsWith("ERROR")) {
    try {
      const rawParsed = JSON.parse(cached.rawResponse);

      // Multi-pass format: {"pass1": "json string", "pass2": {...}}
      if (rawParsed.pass1 && rawParsed.pass2) {
        const pass1 = typeof rawParsed.pass1 === "string" ? parseGeminiJson(rawParsed.pass1) : rawParsed.pass1;
        const pass2Data: ExtractedData = rawParsed.pass2;

        const documentType = pass1.documentType || cached.documentType;
        const categoryKey = TYPE_TO_CATEGORY[documentType] || "AUTRE";
        const category = DOCUMENT_CATEGORIES[categoryKey].name;

        // Merge pass1 extractedData + pass2 deep data
        const extractedData: ExtractedData = {
          date: pass1.extractedData?.date || cached.extractedDate || undefined,
          expiryDate: pass1.extractedData?.expiryDate || undefined,
          description: pass1.extractedData?.description || undefined,
          ...pass2Data,
        };

        return {
          documentType,
          category,
          confidence: pass1.confidence ?? cached.confidence,
          suggestedName: pass1.suggestedName || cached.suggestedName || undefined,
          suggestedFolder: pass1.suggestedFolder || undefined,
          folderAction: pass1.folderAction || undefined,
          targetFolderId: pass1.targetFolderId || undefined,
          parentFolderId: pass1.parentFolderId || undefined,
          extractedData,
          rawResponse: cached.rawResponse,
        };
      }

      // Legacy single-pass format
      const parsed = rawParsed.documentType ? rawParsed : parseGeminiJson(cached.rawResponse);
      const documentType = parsed.documentType || cached.documentType;
      const categoryKey = TYPE_TO_CATEGORY[documentType] || "AUTRE";
      const category = DOCUMENT_CATEGORIES[categoryKey].name;

      return {
        documentType,
        category,
        confidence: parsed.confidence ?? cached.confidence,
        suggestedName: parsed.suggestedName || cached.suggestedName || undefined,
        suggestedFolder: parsed.suggestedFolder || undefined,
        folderAction: parsed.folderAction || undefined,
        targetFolderId: parsed.targetFolderId || undefined,
        parentFolderId: parsed.parentFolderId || undefined,
        extractedData: {
          date: parsed.extractedData?.date || cached.extractedDate || undefined,
          expiryDate: parsed.extractedData?.expiryDate || undefined,
          amount: parsed.extractedData?.amount || cached.extractedAmount || undefined,
          issuer: parsed.extractedData?.issuer || cached.extractedIssuer || undefined,
          recipient: parsed.extractedData?.recipient || undefined,
          reference: parsed.extractedData?.reference || undefined,
          subject: parsed.extractedData?.subject || undefined,
          topic: parsed.extractedData?.topic || undefined,
          location: parsed.extractedData?.location || undefined,
          people: parsed.extractedData?.people || undefined,
          language: parsed.extractedData?.language || undefined,
          duration: parsed.extractedData?.duration || undefined,
          genre: parsed.extractedData?.genre || undefined,
          description: parsed.extractedData?.description || undefined,
        },
        rawResponse: cached.rawResponse,
      };
    } catch {
      // rawResponse malformed — fall through to basic cached result
    }
  }

  // Fallback: return the 3 fields the DB schema stores
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
// LE PROMPT ULTIME V2 - IA Ultra-Précise avec Dossiers Intelligents
// ============================================================================
const AI_CLASSIFICATION_PROMPT = `Tu es DocuSafe AI, le système de classification de documents le plus avancé au monde. Tu analyses TOUT: documents, images, photos, vidéos et fichiers audio avec une précision chirurgicale.

## 🎯 TA MISSION PRINCIPALE
Analyse ce fichier en profondeur et génère:
1. Le TYPE PRÉCIS du document
2. Un NOM DE DOSSIER ULTRA-SPÉCIFIQUE (PAS générique!)
3. Un nom de fichier descriptif
4. Toutes les métadonnées extractibles

## ⚠️ RÈGLE CRITIQUE: NOMMAGE DES DOSSIERS
Tu dois créer des noms de dossiers PRÉCIS et CONTEXTUELS, jamais génériques!

### ❌ MAUVAIS (trop générique)
- "Études" → TROP VAGUE
- "Photos" → TROP VAGUE
- "Audio" → TROP VAGUE
- "Vidéos" → TROP VAGUE

### ✅ BON (précis et contextuel)
- "Cours Informatique" ou "Cours Droit L2" ou "Cours Marketing"
- "Exercices Mathématiques" ou "TD Physique" ou "TP Chimie"
- "Photos Vacances Espagne 2024" ou "Photos Anniversaire Marie"
- "Fiches de Paie 2024" ou "Factures Amazon"
- "Musique Pop" ou "Podcasts Tech" ou "Mémos Vocaux"
- "Tutoriels Python" ou "Cours Vidéo Excel"

## 📋 TYPES DE DOCUMENTS

### 📸 PHOTOS & IMAGES
- photo_personnelle, photo_famille, photo_voyage, photo_evenement
- photo_profil, screenshot, image_artistique, meme_image

### 📚 ÉTUDES (sois PRÉCIS sur la matière!)
- cours, notes_de_cours, dissertation, memoire_these
- exercices, examen, diplome, releve_notes
- certificat_formation, attestation_scolarite, carte_etudiant

### 💼 EMPLOI
- cv, lettre_motivation, contrat_travail, fiche_de_paie
- attestation_employeur, certificat_travail, offre_emploi

### 🛡️ ASSURANCE (PAS finance!)
- contrat_assurance, attestation_assurance, mutuelle
- assurance_auto, assurance_habitation, constat_amiable

### 🏦 BANQUE
- releve_bancaire, rib, pret_bancaire, echeancier

### 📊 IMPÔTS (PAS finance!)
- avis_imposition, declaration_revenus, taxe_habitation, taxe_fonciere

### 🏠 LOGEMENT
- bail, quittance_loyer, etat_des_lieux
- facture_energie, facture_eau, facture_internet

### 🚗 VÉHICULE
- carte_grise, permis_conduire, controle_technique, pv_amende

### 🏥 SANTÉ
- ordonnance, compte_rendu_medical, analyse_medicale
- carte_vitale, carnet_vaccination, facture_medicale

### 🪪 IDENTITÉ
- carte_identite, passeport, acte_naissance, livret_famille

### 🧾 FACTURES
- facture, ticket_caisse, devis, garantie

### ⚖️ JURIDIQUE
- contrat, acte_notarie, jugement, procuration

### ✈️ VOYAGE
- billet_avion, billet_train, reservation_hotel, visa

### 🎵 AUDIO (analyse le CONTENU audio!)
- audio_musique: Musique, chanson → Dossier: "Musique [Genre]"
- audio_podcast: Podcast, émission → Dossier: "Podcasts [Thème]"
- audio_memo_vocal: Mémo personnel → Dossier: "Mémos Vocaux"
- audio_interview: Interview → Dossier: "Interviews [Sujet]"
- audio_cours: Cours/conférence → Dossier: "Cours Audio [Matière]"
- audio_reunion: Réunion enregistrée → Dossier: "Réunions [Projet]"
- audio_livre: Audiobook → Dossier: "Audiobooks [Genre]"
- audio_autre: Autre audio → Dossier selon contenu détecté

### 🎬 VIDÉO (analyse le CONTENU vidéo!)
- video_cours: Cours/tutoriel → Dossier: "Cours Vidéo [Matière]" ou "Tutoriels [Sujet]"
- video_conference: Conférence/webinar → Dossier: "Conférences [Thème]"
- video_personnelle: Vidéo perso → Dossier: "Vidéos Personnelles [Contexte]"
- video_voyage: Vidéo vacances → Dossier: "Vidéos [Lieu] [Année]"
- video_evenement: Mariage, fête → Dossier: "Vidéos [Événement]"
- video_musique: Clip, concert → Dossier: "Clips Musicaux" ou "Concerts"
- video_gaming: Gaming, stream → Dossier: "Gaming [Jeu]"
- video_tutorial: How-to → Dossier: "Tutoriels [Sujet]"
- video_presentation: PowerPoint filmé → Dossier: "Présentations [Sujet]"
- video_reunion: Réunion Zoom/Teams → Dossier: "Réunions Vidéo"
- video_autre: Autre vidéo → Dossier selon contenu

### 💻 CODE & DÉVELOPPEMENT (analyse le CONTENU du code!)
- code_source: Code générique → Dossier: "Code [Langage]"
- code_python: Script Python → Dossier: "Code Python" ou "Scripts Python"
- code_javascript: JS/TS/React/Vue → Dossier: "Code JavaScript" ou "Projets React"
- code_java: Code Java → Dossier: "Code Java"
- code_cpp: C/C++/C# → Dossier: "Code C++"
- code_web: HTML/CSS → Dossier: "Code Web" ou "Sites Web"
- config_file: Config (json, yaml, env, ini) → Dossier: "Configurations"
- data_file: Données (csv, json data) → Dossier: "Données [Sujet]"
- documentation_technique: README, docs tech → Dossier: "Documentation"
- script: Shell scripts, automation → Dossier: "Scripts"

### 📄 DOCUMENTS OFFICE
- document_word: Word, Pages → Dossier selon contenu (ex: "Rapports", "Lettres")
- tableur_excel: Excel, Numbers → Dossier: "Tableaux [Sujet]" ou "Budget"
- presentation_powerpoint: PowerPoint, Keynote → Dossier: "Présentations [Sujet]"
- document_apple: Documents Apple spécifiques → Dossier selon contenu

### 📁 AUTRE
- recette_cuisine, note_personnelle, document_professionnel, autre

## 🎓 EXEMPLES DE CLASSIFICATION PARFAITE

| Contenu détecté | Type | suggestedFolder |
|-----------------|------|-----------------|
| PDF cours de programmation Java | cours | "Cours Informatique" |
| PDF exercices de maths niveau L1 | exercices | "Exercices Mathématiques" |
| Photo de plage au Portugal | photo_voyage | "Photos Vacances Portugal" |
| Vidéo tutoriel Excel formules | video_tutorial | "Tutoriels Excel" |
| Audio podcast tech/startup | audio_podcast | "Podcasts Tech" |
| Cours vidéo Python débutant | video_cours | "Cours Vidéo Python" |
| Fiche de paie janvier 2024 | fiche_de_paie | "Fiches de Paie 2024" |
| Facture Amazon livre | facture | "Factures Amazon" |
| Vidéo mariage de Julie | video_evenement | "Vidéos Mariage Julie" |
| Mémo vocal idées projet | audio_memo_vocal | "Mémos Vocaux Projets" |
| Screenshot conversation WhatsApp | screenshot | "Screenshots Conversations" |
| Dissertation philosophie Kant | dissertation | "Dissertations Philosophie" |
| Enregistrement cours de droit | audio_cours | "Cours Audio Droit" |
| Clip YouTube musique rock | video_musique | "Clips Rock" |
| Réunion Zoom projet Alpha | video_reunion | "Réunions Projet Alpha" |
| Script Python analyse données | code_python | "Scripts Python" |
| Fichier main.js React app | code_javascript | "Code React" |
| Classe Java UserService | code_java | "Code Java" |
| fichier config.yaml | config_file | "Configurations" |
| données_ventes.csv | data_file | "Données Ventes" |
| README.md projet | documentation_technique | "Documentation Projets" |
| script_backup.sh | script | "Scripts Système" |
| Rapport annuel.docx | document_word | "Rapports" |
| Budget_2024.xlsx | tableur_excel | "Budget 2024" |
| Présentation_projet.pptx | presentation_powerpoint | "Présentations Projets" |

## 💻 INSTRUCTIONS CODE & DOCUMENTS

### Pour les fichiers CODE:
- ANALYSE le contenu du code, pas juste l'extension
- Identifie: langage, framework, type de projet, fonctionnalité principale
- Exemples: "React component", "API endpoint", "Database model", "Unit test"
- Suggère un dossier basé sur le projet ou la fonctionnalité

### Pour les fichiers OFFICE (Word, Excel, PowerPoint):
- ANALYSE le contenu textuel si possible
- Pour Word: identifie le type (rapport, lettre, CV, contrat, etc.)
- Pour Excel: identifie l'usage (budget, inventaire, planning, données)
- Pour PowerPoint: identifie le sujet de la présentation

## 🔊 INSTRUCTIONS AUDIO/VIDÉO

### Pour les fichiers AUDIO:
- ÉCOUTE attentivement le contenu
- Identifie: langue, type de contenu, sujet, ambiance
- Si c'est de la musique: identifie le genre (pop, rock, classique, rap, etc.)
- Si c'est parlé: identifie le sujet (cours de quoi? podcast sur quoi? interview de qui?)

### Pour les fichiers VIDÉO:
- REGARDE attentivement les images ET écoute l'audio
- Identifie: type de contenu, sujet, personnes, lieu, contexte
- Si c'est un tutoriel: de quel logiciel/sujet?
- Si c'est un cours: quelle matière?
- Si c'est personnel: quel événement/lieu?

## 📤 FORMAT DE RÉPONSE

Réponds UNIQUEMENT avec ce JSON (PAS de \`\`\`, PAS de markdown):

{"documentType":"type_exact","confidence":0.95,"suggestedName":"Nom fichier descriptif","suggestedFolder":"Nom Dossier Ultra Précis","folderAction":"use_existing|create_new|create_subfolder","targetFolderId":"id_du_dossier_existant_ou_null","parentFolderId":"id_du_parent_pour_sous_dossier_ou_null","extractedData":{"date":"2024-01-15","expiryDate":"2034-01-15","amount":"150.00€","issuer":"Émetteur","recipient":"Destinataire","reference":"REF123","subject":"Sujet principal détaillé","topic":"Matière/Thème précis","location":"Lieu","people":"Personnes","language":"Langue","duration":"Durée si applicable","genre":"Genre si musique/vidéo","description":"Description détaillée du contenu"}}

## 🚨 RAPPELS CRITIQUES
1. suggestedFolder doit être PRÉCIS: "Cours Informatique" pas "Études"
2. Pour audio/vidéo: analyse le CONTENU, pas juste le format
3. Extrais TOUTES les infos pertinentes (date, matière, lieu, personnes...)
4. La confidence doit refléter ta certitude réelle
5. Si tu détectes plusieurs thèmes, choisis le principal`;

// ============================================================================
// PASS 1 - Slim classification prompt (no deep extraction)
// ============================================================================
const CLASSIFICATION_PROMPT = `Tu es DocuSafe AI. Analyse ce fichier et classifie-le rapidement.

## MISSION
1. Identifie le TYPE PRÉCIS du document
2. Suggère un NOM DE DOSSIER SPÉCIFIQUE (pas générique!)
3. Donne un nom de fichier descriptif
4. Extrais les infos basiques (date, description)

## TYPES DE DOCUMENTS
### PHOTOS: photo_personnelle, photo_famille, photo_voyage, photo_evenement, photo_profil, screenshot, image_artistique, meme_image
### ÉTUDES: cours, notes_de_cours, dissertation, memoire_these, exercices, examen, diplome, releve_notes, certificat_formation, attestation_scolarite, carte_etudiant
### EMPLOI: cv, lettre_motivation, contrat_travail, fiche_de_paie, attestation_employeur, certificat_travail, offre_emploi
### ASSURANCE: contrat_assurance, attestation_assurance, mutuelle, assurance_auto, assurance_habitation, constat_amiable
### BANQUE: releve_bancaire, rib, pret_bancaire, echeancier
### IMPÔTS: avis_imposition, declaration_revenus, taxe_habitation, taxe_fonciere
### LOGEMENT: bail, quittance_loyer, etat_des_lieux, facture_energie, facture_eau, facture_internet
### VÉHICULE: carte_grise, permis_conduire, controle_technique, pv_amende
### SANTÉ: ordonnance, compte_rendu_medical, analyse_medicale, carte_vitale, carnet_vaccination, facture_medicale
### IDENTITÉ: carte_identite, passeport, acte_naissance, livret_famille
### FACTURES: facture, ticket_caisse, devis, garantie
### JURIDIQUE: contrat, acte_notarie, jugement, procuration
### VOYAGE: billet_avion, billet_train, reservation_hotel, visa
### AUDIO: audio_musique, audio_podcast, audio_memo_vocal, audio_interview, audio_cours, audio_reunion, audio_livre, audio_autre
### VIDÉO: video_cours, video_conference, video_personnelle, video_voyage, video_evenement, video_musique, video_gaming, video_tutorial, video_presentation, video_reunion, video_autre
### CODE: code_source, code_python, code_javascript, code_java, code_cpp, code_web, config_file, data_file, documentation_technique, script
### OFFICE: document_word, tableur_excel, presentation_powerpoint, document_apple
### AUTRE: recette_cuisine, note_personnelle, document_professionnel, autre

## NOMMAGE DOSSIERS
- PRÉCIS: "Cours Informatique", "Factures Amazon", "Photos Vacances Portugal"
- PAS générique: "Études", "Photos", "Documents"

## FORMAT DE RÉPONSE (JSON uniquement, pas de markdown)
{"documentType":"type_exact","confidence":0.95,"suggestedName":"Nom descriptif","suggestedFolder":"Dossier Précis","folderAction":"use_existing|create_new|create_subfolder","targetFolderId":"id_ou_null","parentFolderId":"id_ou_null","extractedData":{"date":"2024-01-15","description":"Description courte du contenu"}}`;

// ============================================================================
// PASS 2 - Type-specific deep extraction prompts
// ============================================================================
const EXTRACTION_PROMPTS: Record<string, string> = {
  ADMINISTRATIF: `Tu analyses un document d'IDENTITÉ. Extrais TOUTES ces informations avec précision:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"nom":"","prenom":"","dateNaissance":"YYYY-MM-DD","lieuNaissance":"","nationalite":"","numeroDocument":"","dateDelivrance":"YYYY-MM-DD","dateExpiration":"YYYY-MM-DD","adresse":"","expiryDate":"YYYY-MM-DD","description":""}

- nom/prenom: Tels qu'écrits sur le document
- numeroDocument: Numéro de carte, passeport, etc.
- dateExpiration et expiryDate: MÊME valeur (date de fin de validité)
- Si un champ n'est pas visible, mets null`,

  FINANCE: `Tu analyses un document FINANCIER (facture, devis, ticket, relevé bancaire, RIB). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"montantHT":"","montantTTC":"","tva":"","devise":"EUR","iban":"","bic":"","modeReglement":"","dateEcheance":"YYYY-MM-DD","numeroFacture":"","fournisseur":"","amount":"","issuer":"","recipient":"","reference":"","date":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","description":""}

- montantHT/montantTTC: Avec le symbole € (ex: "150.00€")
- tva: Montant OU pourcentage (ex: "20%" ou "30.00€")
- iban: Format complet (ex: FR76 3000 1000 ...)
- amount = montantTTC si disponible
- issuer = fournisseur
- Si c'est un RIB: extrais IBAN, BIC, titulaire
- Si un champ n'est pas visible, mets null`,

  EMPLOI: `Tu analyses un document d'EMPLOI (contrat, fiche de paie, attestation, CV). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"employeur":"","poste":"","salaireBrut":"","salaireNet":"","primes":"","conges":"","periode":"","contratType":"","dateDebut":"YYYY-MM-DD","date":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","issuer":"","recipient":"","reference":"","description":""}

- salaireBrut/salaireNet: Avec € (ex: "2500.00€")
- contratType: CDI, CDD, Intérim, Stage, Alternance
- periode: Pour fiche de paie (ex: "Janvier 2024")
- primes: Liste des primes si présentes
- conges: Solde de congés si visible
- amount = salaireNet
- issuer = employeur
- Si un champ n'est pas visible, mets null`,

  LOGEMENT: `Tu analyses un document de LOGEMENT (bail, quittance, état des lieux, facture énergie/eau/internet). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"adresseBien":"","typeBien":"","surface":"","loyer":"","charges":"","proprietaire":"","locataire":"","dateDebut":"YYYY-MM-DD","dateFin":"YYYY-MM-DD","depotGarantie":"","date":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","issuer":"","reference":"","description":""}

- loyer/charges/depotGarantie: Avec € (ex: "750.00€")
- typeBien: Appartement, Maison, Studio, etc.
- surface: En m² (ex: "45 m²")
- amount = loyer ou montant facture
- expiryDate = dateFin du bail
- Si c'est une facture énergie/eau: extrais montant, fournisseur, référence client
- Si un champ n'est pas visible, mets null`,

  SANTE: `Tu analyses un document de SANTÉ (ordonnance, compte-rendu, analyse, carte vitale). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"medecin":"","specialite":"","patient":"","diagnostic":"","traitement":"","posologie":"","dateConsultation":"YYYY-MM-DD","numeroSS":"","date":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","description":""}

- medecin: Nom complet avec titre (Dr., Pr.)
- posologie: Dosage et fréquence (ex: "1 comprimé matin et soir pendant 7 jours")
- traitement: Noms des médicaments
- numeroSS: Numéro de sécurité sociale si visible
- Si un champ n'est pas visible, mets null`,

  EDUCATION: `Tu analyses un document d'ÉDUCATION (diplôme, relevé de notes, attestation, carte étudiant). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"etablissement":"","diplome":"","mention":"","annee":"","matiere":"","note":"","niveau":"","date":"YYYY-MM-DD","topic":"","description":""}

- etablissement: Nom complet de l'école/université
- diplome: Intitulé exact (ex: "Licence Informatique", "Baccalauréat S")
- mention: Passable, Assez Bien, Bien, Très Bien
- note: Note ou moyenne si visible (ex: "14.5/20")
- niveau: L1, L2, L3, M1, M2, Terminale, etc.
- matiere = topic
- Si un champ n'est pas visible, mets null`,

  JURIDIQUE: `Tu analyses un document JURIDIQUE (contrat, acte notarié, jugement, procuration). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"parties":"","typeActe":"","notaire":"","dateSignature":"YYYY-MM-DD","duree":"","montant":"","clausesParticulieres":"","date":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","reference":"","description":""}

- parties: Toutes les parties prenantes séparées par " / "
- typeActe: Vente, Donation, Bail notarié, Testament, etc.
- clausesParticulieres: Résumé des clauses importantes
- montant/amount: Montant de la transaction si applicable
- Si un champ n'est pas visible, mets null`,

  VEHICULE: `Tu analyses un document de VÉHICULE (carte grise, permis, contrôle technique, PV). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"marque":"","modele":"","immatriculation":"","vin":"","dateCirculation":"YYYY-MM-DD","puissanceFiscale":"","date":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","reference":"","description":""}

- immatriculation: Format AA-123-BB
- vin: Numéro VIN si visible (17 caractères)
- puissanceFiscale: En CV (ex: "5 CV")
- Si c'est un PV/amende: extrais montant, référence, date
- Si c'est un contrôle technique: extrais date validité (expiryDate)
- Si un champ n'est pas visible, mets null`,

  IMPOTS: `Tu analyses un document d'IMPÔTS (avis d'imposition, déclaration, taxe). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"montantTTC":"","reference":"","annee":"","date":"YYYY-MM-DD","dateEcheance":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","issuer":"","recipient":"","description":""}

- montantTTC/amount: Montant total à payer
- reference: Numéro fiscal ou référence avis
- annee: Année fiscale concernée
- dateEcheance/expiryDate: Date limite de paiement
- issuer: "Direction Générale des Finances Publiques" ou similaire
- Si un champ n'est pas visible, mets null`,

  ASSURANCE: `Tu analyses un document d'ASSURANCE (contrat, attestation, mutuelle, constat). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"issuer":"","reference":"","montantTTC":"","dateDebut":"YYYY-MM-DD","dateFin":"YYYY-MM-DD","date":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","recipient":"","description":""}

- issuer: Nom de la compagnie d'assurance
- reference: Numéro de contrat/police
- montantTTC/amount: Prime ou cotisation
- dateFin/expiryDate: Fin de couverture
- recipient: Assuré(e)
- Si c'est un constat: extrais date, lieu, véhicules impliqués dans description
- Si un champ n'est pas visible, mets null`,

  BANQUE: `Tu analyses un document BANCAIRE (relevé, RIB, prêt, échéancier). Extrais TOUTES ces informations:

Réponds UNIQUEMENT en JSON (pas de markdown):
{"iban":"","bic":"","issuer":"","reference":"","montantTTC":"","date":"YYYY-MM-DD","dateEcheance":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","amount":"","recipient":"","description":""}

- iban: IBAN complet
- bic: Code BIC/SWIFT
- issuer: Nom de la banque
- reference: Numéro de compte ou de prêt
- Pour un relevé: montant = solde final, période dans description
- Pour un prêt: montant = mensualité, expiryDate = fin du prêt
- Si un champ n'est pas visible, mets null`,
};

// Map category keys to extraction prompt keys
const CATEGORY_TO_EXTRACTION: Record<string, string> = {
  ADMINISTRATIF: "ADMINISTRATIF",
  FINANCE: "FINANCE",
  EMPLOI: "EMPLOI",
  LOGEMENT: "LOGEMENT",
  SANTE: "SANTE",
  EDUCATION: "EDUCATION",
  JURIDIQUE: "JURIDIQUE",
  VEHICULE: "VEHICULE",
  IMPOTS: "IMPOTS",
  ASSURANCE: "ASSURANCE",
  BANQUE: "BANQUE",
};

/**
 * Classify media files based on filename when AI analysis fails or file is too large
 */
function classifyMediaByFilename(
  fileName: string,
  mimeType: string
): AIAnalysisResult {
  const lowerName = fileName.toLowerCase();
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");

  console.log("[AI Fallback] Classifying by filename:", fileName, "isVideo:", isVideo, "isAudio:", isAudio);

  // Keywords for classification
  const keywords = {
    cours: ["cours", "lecture", "lesson", "class", "chapter", "chapitre", "module", "formation", "tutorial", "tuto"],
    reunion: ["reunion", "meeting", "zoom", "teams", "call", "conference", "webinar"],
    musique: ["music", "musique", "song", "chanson", "track", "album", "clip", "concert"],
    podcast: ["podcast", "episode", "ep", "emission"],
    voyage: ["vacances", "vacation", "trip", "voyage", "travel", "holiday"],
    gaming: ["game", "gaming", "stream", "twitch", "gameplay", "playthrough"],
    evenement: ["mariage", "wedding", "anniversaire", "birthday", "fete", "party", "noel", "christmas"],
    memo: ["memo", "note", "voice", "vocal", "enregistrement", "recording"],
    presentation: ["presentation", "powerpoint", "slides", "ppt", "keynote"],
    interview: ["interview", "entretien", "discussion"],
  };

  let documentType = isVideo ? "video_autre" : "audio_autre";
  let suggestedFolder = isVideo ? "Vidéos" : "Audio";
  let topic = "";

  // Check each keyword category
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lowerName.includes(word))) {
      switch (category) {
        case "cours":
          documentType = isVideo ? "video_cours" : "audio_cours";
          // Try to extract subject from filename
          const subjects = ["informatique", "math", "physique", "chimie", "droit", "economie", "anglais", "francais", "histoire", "geo", "python", "java", "javascript", "excel", "word"];
          const foundSubject = subjects.find(s => lowerName.includes(s));
          topic = foundSubject ? foundSubject.charAt(0).toUpperCase() + foundSubject.slice(1) : "";
          suggestedFolder = isVideo
            ? (topic ? `Cours Vidéo ${topic}` : "Cours Vidéo")
            : (topic ? `Cours Audio ${topic}` : "Cours Audio");
          break;
        case "reunion":
          documentType = isVideo ? "video_reunion" : "audio_reunion";
          suggestedFolder = isVideo ? "Réunions Vidéo" : "Réunions Audio";
          break;
        case "musique":
          documentType = isVideo ? "video_musique" : "audio_musique";
          suggestedFolder = isVideo ? "Clips Musicaux" : "Musique";
          break;
        case "podcast":
          documentType = isVideo ? "video_autre" : "audio_podcast";
          suggestedFolder = "Podcasts";
          break;
        case "voyage":
          documentType = isVideo ? "video_voyage" : "audio_autre";
          suggestedFolder = isVideo ? "Vidéos Voyages" : "Audio Voyages";
          break;
        case "gaming":
          documentType = isVideo ? "video_gaming" : "audio_autre";
          suggestedFolder = "Gaming";
          break;
        case "evenement":
          documentType = isVideo ? "video_evenement" : "audio_autre";
          suggestedFolder = isVideo ? "Vidéos Événements" : "Audio Événements";
          break;
        case "memo":
          documentType = isVideo ? "video_personnelle" : "audio_memo_vocal";
          suggestedFolder = isVideo ? "Vidéos Personnelles" : "Mémos Vocaux";
          break;
        case "presentation":
          documentType = isVideo ? "video_presentation" : "audio_autre";
          suggestedFolder = "Présentations";
          break;
        case "interview":
          documentType = isVideo ? "video_autre" : "audio_interview";
          suggestedFolder = "Interviews";
          break;
      }
      break; // Stop at first match
    }
  }

  // Map to category
  const categoryKey = TYPE_TO_CATEGORY[documentType] || "AUTRE";
  const category = DOCUMENT_CATEGORIES[categoryKey].name;

  console.log("[AI Fallback] Result:", documentType, "->", suggestedFolder);

  return {
    documentType,
    category,
    confidence: 0.6, // Lower confidence for filename-based classification
    suggestedName: fileName,
    suggestedFolder,
    extractedData: {
      topic: topic || undefined,
      description: `Classifié automatiquement basé sur le nom du fichier`,
    },
  };
}

/**
 * Robustly extract and parse a JSON object from a Gemini text response.
 * Handles markdown code fences and text before/after the JSON.
 */
function parseGeminiJson(text: string): Record<string, any> {
  let s = text.trim();

  // Strip ```json ... ``` or ``` ... ``` fences
  if (s.startsWith("```json")) {
    s = s.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  } else if (s.startsWith("```")) {
    s = s.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
  }

  // Try direct parse first
  try {
    return JSON.parse(s);
  } catch {
    // Fallback: extract the first {...} block in the response
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("No JSON object found in response");
  }
}

// Maximum file size for inline base64 analysis (20MB)
const MAX_INLINE_SIZE = 20 * 1024 * 1024;
// Maximum file size for File API upload (2GB)
const MAX_FILE_API_SIZE = 2 * 1024 * 1024 * 1024;

// Text-based file types that should be sent as plain text to AI
const TEXT_BASED_MIME_TYPES = new Set([
  // Code files
  "text/plain",
  "text/x-python",
  "text/x-java",
  "text/x-c",
  "text/x-c++",
  "text/javascript",
  "application/javascript",
  "text/typescript",
  "application/typescript",
  "text/x-ruby",
  "text/x-php",
  "text/x-swift",
  "text/x-kotlin",
  "text/x-go",
  "text/x-rust",
  "text/x-scala",
  "text/x-perl",
  "text/x-lua",
  "text/x-shellscript",
  "application/x-sh",
  "text/x-sql",
  "application/sql",
  "text/css",
  "text/html",
  "application/xhtml+xml",
  "text/xml",
  "application/xml",
  "application/json",
  "text/yaml",
  "application/x-yaml",
  "text/markdown",
  "text/x-markdown",
  // Document formats that contain plain text
  "text/csv",
  "text/tab-separated-values",
  "text/rtf",
]);

// Office document types that Gemini might analyze
const OFFICE_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.apple.pages",
  "application/vnd.apple.numbers",
  "application/vnd.apple.keynote",
]);

// Spreadsheet MIME types — Gemini cannot read Excel binary; we extract text instead
const SPREADSHEET_MIME_TYPES = new Set([
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.apple.numbers",
]);

/**
 * Upload file to Gemini File API for large files
 * Returns the file URI to use in generateContent
 */
async function uploadToGeminiFileAPI(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  apiKey: string
): Promise<string> {
  console.log("[Gemini File API] Uploading file:", fileName, "size:", fileBuffer.length);

  // Step 1: Start resumable upload
  const startResponse = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(fileBuffer.length),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: {
          display_name: fileName,
        },
      }),
    }
  );

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    console.error("[Gemini File API] Start upload failed:", errorText);
    throw new Error(`Failed to start upload: ${startResponse.status}`);
  }

  const uploadUrl = startResponse.headers.get("X-Goog-Upload-URL");
  if (!uploadUrl) {
    throw new Error("No upload URL returned from Gemini File API");
  }

  console.log("[Gemini File API] Got upload URL, uploading data...");

  // Step 2: Upload the file data
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Command": "upload, finalize",
      "X-Goog-Upload-Offset": "0",
      "Content-Type": mimeType,
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("[Gemini File API] Upload failed:", errorText);
    throw new Error(`Failed to upload file: ${uploadResponse.status}`);
  }

  const uploadResult = await uploadResponse.json();
  console.log("[Gemini File API] Upload complete:", uploadResult);

  const fileUri = uploadResult.file?.uri;
  if (!fileUri) {
    throw new Error("No file URI returned from upload");
  }

  // Step 3: Wait for file to be processed (videos take time)
  let fileState = uploadResult.file?.state;
  const fileName2 = uploadResult.file?.name;

  if (fileState === "PROCESSING") {
    console.log("[Gemini File API] File is processing, waiting...");

    // Poll for completion (max 2 minutes for videos)
    for (let i = 0; i < 24; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${fileName2}?key=${apiKey}`
      );

      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        fileState = statusResult.state;
        console.log("[Gemini File API] File state:", fileState);

        if (fileState === "ACTIVE") {
          console.log("[Gemini File API] File is ready!");
          break;
        } else if (fileState === "FAILED") {
          throw new Error("File processing failed");
        }
      }
    }

    if (fileState !== "ACTIVE") {
      throw new Error("File processing timeout");
    }
  }

  return fileUri;
}

/**
 * Analyze document with Gemini AI - VERSION ULTRA
 * Uses File API for large files (videos/audio > 20MB)
 */
// ============================================================================
// SHARED: Prepare file content parts for Gemini API calls
// ============================================================================
type ContentPart = { text: string } | { inline_data: { mime_type: string; data: string } } | { file_data: { mime_type: string; file_uri: string } };

function resolveGeminiMimeType(mimeType: string, isTextBased: boolean, isOfficeDoc: boolean): string {
  if (mimeType === "application/pdf") return "application/pdf";
  if (mimeType.startsWith("image/")) return mimeType;
  if (mimeType.startsWith("audio/")) {
    if (mimeType === "audio/mpeg" || mimeType === "audio/mp3") return "audio/mpeg";
    if (mimeType === "audio/wav" || mimeType === "audio/x-wav" || mimeType === "audio/wave") return "audio/wav";
    if (mimeType === "audio/ogg") return "audio/ogg";
    if (mimeType === "audio/flac") return "audio/flac";
    return "audio/mpeg";
  }
  if (mimeType.startsWith("video/")) {
    if (mimeType === "video/mp4" || mimeType === "video/mpeg") return "video/mp4";
    if (mimeType === "video/quicktime") return "video/quicktime";
    if (mimeType === "video/webm") return "video/webm";
    if (mimeType === "video/x-msvideo" || mimeType === "video/avi") return "video/x-msvideo";
    return "video/mp4";
  }
  if (isTextBased) return "text/plain";
  if (isOfficeDoc) return mimeType;
  return "application/pdf";
}

/**
 * Build file content parts for Gemini (shared between pass 1 and pass 2).
 * Returns null if file should fall back to filename classification.
 */
async function buildFileContentParts(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  geminiMimeType: string,
  apiKey: string,
): Promise<ContentPart[] | null> {
  const fileSize = fileBuffer.length;
  const isLargeFile = fileSize > MAX_INLINE_SIZE;
  const isMediaFile = mimeType.startsWith("video/") || mimeType.startsWith("audio/");
  const isTextBased = TEXT_BASED_MIME_TYPES.has(mimeType) ||
                      mimeType.startsWith("text/") ||
                      !!fileName.match(/\.(py|js|ts|jsx|tsx|java|c|cpp|h|hpp|cs|rb|php|swift|kt|go|rs|scala|pl|lua|sh|bash|sql|css|html|htm|xml|json|yaml|yml|md|txt|csv|tsv|ini|cfg|conf|log|rtf)$/i);

  const parts: ContentPart[] = [];

  if (isTextBased) {
    const textContent = fileBuffer.toString("utf-8");
    const truncated = textContent.length > 100000 ? textContent.substring(0, 100000) + "\n\n[... contenu tronqué ...]" : textContent;
    parts.push({ text: `\n\n=== CONTENU DU FICHIER "${fileName}" ===\n\`\`\`\n${truncated}\n\`\`\`` });
  } else if (isLargeFile && isMediaFile) {
    try {
      const fileUri = await uploadToGeminiFileAPI(fileBuffer, fileName, geminiMimeType, apiKey);
      parts.push({ file_data: { mime_type: geminiMimeType, file_uri: fileUri } });
    } catch (uploadError) {
      console.error("[AI] File API upload failed:", uploadError);
      return null; // Signal to fall back to filename classification
    }
  } else if (APPLE_IWORK_MIME_TYPES.has(mimeType) && !SPREADSHEET_MIME_TYPES.has(mimeType)) {
    const quickLookPdf = await extractAppleQuickLookPdf(fileBuffer);
    if (quickLookPdf) {
      parts.push({ inline_data: { mime_type: "application/pdf", data: quickLookPdf.toString("base64") } });
    } else {
      return null; // Signal to fall back
    }
  } else if (SPREADSHEET_MIME_TYPES.has(mimeType) || !!fileName.match(/\.(xls|xlsx|ods)$/i)) {
    // Gemini cannot parse Excel binaries — extract sheet content as text instead
    try {
      const workbook = XLSX.read(fileBuffer, { type: "buffer", cellText: true, cellNF: false });
      const sheetTexts: string[] = [];
      for (const sheetName of workbook.SheetNames.slice(0, 5)) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet, { FS: "\t", blankrows: false });
        const trimmed = csv.trim().substring(0, 10000);
        if (trimmed.length > 0) {
          sheetTexts.push(`=== Feuille : ${sheetName} ===\n${trimmed}`);
        }
      }
      const fullText = sheetTexts.join("\n\n").substring(0, 50000);
      parts.push({ text: `\n\n=== CONTENU DU FICHIER EXCEL "${fileName}" ===\n${fullText || "(fichier vide)"}` });
      console.log("[AI] Excel extracted:", sheetTexts.length, "sheet(s),", fullText.length, "chars");
    } catch (xlsxErr) {
      console.error("[AI] Excel extraction failed, falling back to filename:", xlsxErr);
      return null; // Signal to fall back to filename classification
    }
  } else {
    parts.push({ inline_data: { mime_type: geminiMimeType, data: fileBuffer.toString("base64") } });
  }

  return parts;
}

/**
 * Call Gemini API with given content parts and return parsed JSON
 */
async function callGemini(
  contentParts: ContentPart[],
  apiKey: string,
  maxOutputTokens = 1024,
): Promise<Record<string, any>> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: contentParts }],
        generationConfig: { temperature: 0.1, maxOutputTokens },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.candidates?.[0]?.finishReason === "SAFETY") {
    throw new Error("Content blocked by safety filters");
  }

  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!textResponse) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = parseGeminiJson(textResponse);
  (parsed as any).__rawText = textResponse;
  return parsed;
}

// ============================================================================
// PASS 1 - Classification (type, category, folder placement)
// ============================================================================
async function classifyDocument(
  fileContentParts: ContentPart[],
  fileName: string,
  apiKey: string,
  folderContext?: string,
  professionContext?: string,
  sortingRuleContext?: string,
): Promise<AIAnalysisResult> {
  const today = new Date().toISOString().split("T")[0];
  let fullPrompt = CLASSIFICATION_PROMPT + `\n\n## 📅 DATE ACTUELLE: ${today}`;

  if (professionContext) {
    fullPrompt += `\n\n## 👤 CONTEXTE MÉTIER DE L'UTILISATEUR\n${professionContext}`;
  }

  if (sortingRuleContext) {
    fullPrompt += `\n\n## 📋 RÈGLES DE TRI PERSONNALISÉES DE L'UTILISATEUR
${sortingRuleContext}

⚠️ Ces règles sont PRIORITAIRES sur toute autre logique de classement.
Traduis-les OBLIGATOIREMENT dans ton JSON :
- Si la règle demande de regrouper dans un même dossier avec des sous-dossiers par type :
  → Cherche d'abord un dossier parent existant dans l'arborescence.
  → Si ce parent existe : utilise folderAction="create_subfolder" avec parentFolderId=son ID et suggestedFolder=nom du type de document.
  → Si aucun parent n'existe : utilise folderAction="create_new" et nomme suggestedFolder selon la règle (ex: "Documents", "Fichiers Reçus").
- Si la règle donne un nom précis de dossier : utilise ce nom exact dans suggestedFolder.
- Si la règle mentionne un critère de nommage (patient, fournisseur, date…) : inclus ce critère dans suggestedFolder.`;
  }

  if (folderContext) {
    fullPrompt += `\n\n## 📂 DOSSIERS EXISTANTS
Choisis parmi ces actions :
- "use_existing": Utiliser un dossier existant (donne targetFolderId)
- "create_subfolder": Sous-dossier dans un parent (donne parentFolderId + suggestedFolder)
- "create_new": Nouveau dossier racine (donne suggestedFolder)

⚠️ PRIORITÉ: utilise un dossier existant si possible !

ARBORESCENCE :
${folderContext}`;
  }

  const contentParts: ContentPart[] = [{ text: fullPrompt }, ...fileContentParts];

  console.log("[Pass 1] Classifying:", fileName);
  const parsed = await callGemini(contentParts, apiKey, 1024);
  const rawText = (parsed as any).__rawText;
  delete (parsed as any).__rawText;

  const documentType = parsed.documentType || "autre";
  const categoryKey = TYPE_TO_CATEGORY[documentType] || "AUTRE";
  const category = DOCUMENT_CATEGORIES[categoryKey].name;

  console.log("[Pass 1] Result:", documentType, "->", category, "confidence:", parsed.confidence);

  return {
    documentType,
    category,
    confidence: parsed.confidence || 0.5,
    suggestedName: parsed.suggestedName,
    suggestedFolder: parsed.suggestedFolder || category,
    folderAction: parsed.folderAction || "create_new",
    targetFolderId: parsed.targetFolderId || undefined,
    parentFolderId: parsed.parentFolderId || undefined,
    extractedData: {
      date: parsed.extractedData?.date || undefined,
      expiryDate: parsed.extractedData?.expiryDate || undefined,
      description: parsed.extractedData?.description || undefined,
    },
    rawResponse: rawText,
  };
}

// ============================================================================
// PASS 2 - Deep extraction (type-specific fields)
// ============================================================================
async function extractDocumentData(
  fileContentParts: ContentPart[],
  fileName: string,
  documentType: string,
  categoryKey: string,
  apiKey: string,
): Promise<ExtractedData | null> {
  const extractionKey = CATEGORY_TO_EXTRACTION[categoryKey];
  if (!extractionKey) return null;

  const extractionPrompt = EXTRACTION_PROMPTS[extractionKey];
  if (!extractionPrompt) return null;

  console.log("[Pass 2] Deep extraction for:", fileName, "category:", categoryKey);

  const prompt = `${extractionPrompt}\n\nLe document est de type "${documentType}". Analyse le fichier ci-joint et extrais les informations demandées.`;
  const contentParts: ContentPart[] = [{ text: prompt }, ...fileContentParts];

  try {
    const parsed = await callGemini(contentParts, apiKey, 1024);
    delete (parsed as any).__rawText;

    console.log("[Pass 2] Extracted fields:", Object.keys(parsed).filter(k => parsed[k] != null).join(", "));

    // Build ExtractedData from parsed response — all fields are optional
    const extracted: ExtractedData = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value != null && value !== "" && value !== "null") {
        (extracted as any)[key] = String(value);
      }
    }
    return extracted;
  } catch (error) {
    console.error("[Pass 2] Deep extraction failed, continuing with pass 1 data:", error);
    return null;
  }
}

// ============================================================================
// ORCHESTRATOR - Multi-pass analysis
// ============================================================================

/**
 * Analyze document with Gemini AI - MULTI-PASS VERSION
 * Pass 1: Quick classification (type, category, folder placement)
 * Pass 2: Deep extraction with type-specific prompt (if applicable)
 */
export async function analyzeDocumentWithAI(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderContext?: string,
  professionContext?: string,
  sortingRuleContext?: string,
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fileSize = fileBuffer.length;

  console.log("[AI Analysis] Starting multi-pass analysis for:", fileName, "mimeType:", mimeType, "size:", fileSize);

  if (!apiKey) {
    console.error("[AI Analysis] GEMINI_API_KEY not configured!");
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Check if file is too large even for File API
  if (fileSize > MAX_FILE_API_SIZE) {
    console.log("[AI Analysis] File too large even for File API, using filename classification");
    if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
      return classifyMediaByFilename(fileName, mimeType);
    }
  }

  const isTextBased = TEXT_BASED_MIME_TYPES.has(mimeType) ||
                      mimeType.startsWith("text/") ||
                      !!fileName.match(/\.(py|js|ts|jsx|tsx|java|c|cpp|h|hpp|cs|rb|php|swift|kt|go|rs|scala|pl|lua|sh|bash|sql|css|html|htm|xml|json|yaml|yml|md|txt|csv|tsv|ini|cfg|conf|log|rtf)$/i);
  const isOfficeDoc = OFFICE_MIME_TYPES.has(mimeType) ||
                      !!fileName.match(/\.(doc|docx|xls|xlsx|ppt|pptx|pages|numbers|key|odt|ods|odp)$/i);
  const geminiMimeType = resolveGeminiMimeType(mimeType, isTextBased, isOfficeDoc);

  console.log("[AI Analysis] Gemini mimeType:", geminiMimeType);

  try {
    // Build file content parts (shared between passes)
    const fileContentParts = await buildFileContentParts(fileBuffer, fileName, mimeType, geminiMimeType, apiKey);
    if (!fileContentParts) {
      // File API upload failed or no QuickLook PDF
      if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
        return classifyMediaByFilename(fileName, mimeType);
      }
      return classifyMediaByFilename(fileName, mimeType);
    }

    // ── PASS 1: Classification ──
    const result = await classifyDocument(fileContentParts, fileName, apiKey, folderContext, professionContext, sortingRuleContext);

    // ── PASS 2: Deep extraction (only for categories with specialized prompts) ──
    const categoryKey = TYPE_TO_CATEGORY[result.documentType] || "AUTRE";
    if (result.confidence >= 0.5 && CATEGORY_TO_EXTRACTION[categoryKey]) {
      const deepData = await extractDocumentData(
        fileContentParts,
        fileName,
        result.documentType,
        categoryKey,
        apiKey,
      );

      if (deepData) {
        // Merge pass 2 data into pass 1 result (pass 2 wins on conflicts)
        result.extractedData = { ...result.extractedData, ...deepData };
        result.rawResponse = JSON.stringify({
          pass1: result.rawResponse,
          pass2: deepData,
        });
        console.log("[AI Analysis] Multi-pass merge complete. Fields:", Object.keys(result.extractedData).filter(k => (result.extractedData as any)[k] != null).join(", "));
      }
    } else {
      console.log("[AI Analysis] Skipping pass 2 (confidence:", result.confidence, "category:", categoryKey, ")");
    }

    return result;
  } catch (error) {
    console.error("[AI Analysis] CRITICAL ERROR:", error);

    // For audio/video files, try to classify based on filename
    if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
      console.log("[AI Analysis] Falling back to filename classification for media file");
      const fallbackResult = classifyMediaByFilename(fileName, mimeType);
      fallbackResult.rawResponse = `FALLBACK: ${error instanceof Error ? error.message : "Unknown error"}`;
      return fallbackResult;
    }

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
  mimeType: string,
  skipCache = false
): Promise<{
  success: boolean;
  result?: AIAnalysisResult;
  fromCache?: boolean;
  error?: string;
}> {
  console.log("[analyzeDocument] START - file:", fileName, "mimeType:", mimeType, "size:", fileBuffer.length, "skipCache:", skipCache);

  const fileHash = calculateFileHash(fileBuffer);
  console.log("[analyzeDocument] File hash:", fileHash.substring(0, 16) + "...");

  // Check cache first (skip for auto-sort to get fresh folder decisions)
  if (!skipCache) {
    const cached = await getCachedAnalysis(fileHash);
    if (cached) {
      console.log("[analyzeDocument] Found in cache, returning cached result");
      return { success: true, result: cached, fromCache: true };
    }
  }

  // Check usage limits
  const canUse = await canUseAIAnalysis(userId);
  console.log("[analyzeDocument] canUseAI:", canUse.allowed, "reason:", canUse.reason || "OK");
  if (!canUse.allowed) {
    return { success: false, error: canUse.reason };
  }

  // Fetch user's folder tree + profession + sorting rule for AI context
  const [folderTree, userProfile] = await Promise.all([
    getUserFolderTree(userId),
    db.user.findUnique({
      where: { id: userId },
      select: { profession: true, planType: true, sortingRule: true, sortingRuleEnabled: true },
    }),
  ]);
  const folderContext = serializeFolderTree(folderTree);
  console.log("[analyzeDocument] Folder context for AI:", folderTree.length, "root folders");

  // Build profession context (BUSINESS plan only)
  const professionContext =
    userProfile?.planType === "BUSINESS" && userProfile?.profession
      ? getProfessionAIContext(userProfile.profession)
      : undefined;

  if (professionContext) {
    console.log("[analyzeDocument] Using profession context for:", userProfile!.profession);
  }

  // Build sorting rule context (all plans, if enabled)
  const sortingRuleContext =
    userProfile?.sortingRuleEnabled === 1 && userProfile?.sortingRule
      ? userProfile.sortingRule
      : undefined;

  if (sortingRuleContext) {
    console.log("[analyzeDocument] Using sorting rule:", sortingRuleContext.substring(0, 60));
  }

  // Analyze with AI (with folder hierarchy + profession context + sorting rule)
  console.log("[analyzeDocument] Calling analyzeDocumentWithAI...");
  const result = await analyzeDocumentWithAI(fileBuffer, fileName, mimeType, folderContext, professionContext, sortingRuleContext);
  console.log("[analyzeDocument] AI result:", result.documentType, "confidence:", result.confidence, "suggestedFolder:", result.suggestedFolder, "folderAction:", result.folderAction);

  // Cache the result
  await cacheAnalysis(fileHash, result);
  console.log("[analyzeDocument] Cached result");

  // Increment usage
  await incrementAIUsage(userId);

  console.log("[analyzeDocument] END - success");
  return { success: true, result, fromCache: false };
}

/**
 * Get or create folder with INTELLIGENT hierarchy-aware matching
 * The AI sees the user's folder tree and decides: use_existing, create_subfolder, or create_new
 */
export async function getOrCreateCategoryFolder(
  userId: string,
  category: string,
  suggestedFolder?: string,
  folderAction?: string,
  targetFolderId?: string,
  parentFolderId?: string
): Promise<string> {
  const targetFolderName = suggestedFolder || category;

  console.log(`[AI Smart Folder] Action: "${folderAction}" | folder: "${targetFolderName}" | targetId: ${targetFolderId} | parentId: ${parentFolderId}`);

  // Helper: get category icon/color
  const getCategoryInfo = () => {
    const categoryKey = Object.keys(DOCUMENT_CATEGORIES).find(
      (key) => DOCUMENT_CATEGORIES[key as keyof typeof DOCUMENT_CATEGORIES].name === category
    ) as keyof typeof DOCUMENT_CATEGORIES | undefined;
    return categoryKey ? DOCUMENT_CATEGORIES[categoryKey] : DOCUMENT_CATEGORIES.AUTRE;
  };

  // PATH 1: Use existing folder (AI gave us a direct folder ID)
  if (folderAction === "use_existing" && targetFolderId) {
    const existing = await db.folder.findFirst({
      where: { id: targetFolderId, userId },
      select: { id: true, name: true },
    });
    if (existing) {
      console.log(`[AI Smart Folder] ✓ Using existing folder: "${existing.name}"`);
      return existing.id;
    }
    console.log(`[AI Smart Folder] ⚠ targetFolderId "${targetFolderId}" not found, falling back to name matching`);
  }

  // PATH 2: Create subfolder under an existing parent
  if (folderAction === "create_subfolder" && parentFolderId) {
    const parent = await db.folder.findFirst({
      where: { id: parentFolderId, userId },
      select: { id: true, name: true },
    });
    if (parent) {
      // Check if subfolder already exists under this parent
      const existingSub = await db.folder.findFirst({
        where: {
          userId,
          parentId: parent.id,
          name: { equals: targetFolderName, mode: "insensitive" as const },
        },
        select: { id: true, name: true },
      });
      if (existingSub) {
        console.log(`[AI Smart Folder] ✓ Subfolder already exists: "${existingSub.name}" under "${parent.name}"`);
        return existingSub.id;
      }

      const categoryInfo = getCategoryInfo();
      const newSub = await db.folder.create({
        data: {
          userId,
          name: targetFolderName,
          parentId: parent.id,
          icon: categoryInfo.icon,
          color: categoryInfo.color,
        },
      });
      console.log(`[AI Smart Folder] ✓ Created subfolder: "${newSub.name}" under "${parent.name}"`);
      return newSub.id;
    }
    console.log(`[AI Smart Folder] ⚠ parentFolderId "${parentFolderId}" not found, falling back to name matching`);
  }

  // PATH 3: Create new at root OR fallback name-based matching
  // This also handles cases where the AI's folder IDs were invalid
  const allFolders = await db.folder.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  const normalize = (str: string) =>
    str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const normalizedTarget = normalize(targetFolderName);

  // Fuzzy matching as safety net
  let matchingFolder = allFolders.find(
    (f) => normalize(f.name) === normalizedTarget
  );

  if (!matchingFolder) {
    matchingFolder = allFolders.find((f) => {
      const normalizedFolderName = normalize(f.name);
      return normalizedFolderName.includes(normalizedTarget) ||
             normalizedTarget.includes(normalizedFolderName);
    });
  }

  if (!matchingFolder && !suggestedFolder) {
    const normalizedCategory = normalize(category);
    matchingFolder = allFolders.find(
      (f) => normalize(f.name) === normalizedCategory ||
             normalize(f.name).includes(normalizedCategory)
    );
  }

  if (!matchingFolder) {
    const targetBase = normalizedTarget.replace(/s$/, "");
    matchingFolder = allFolders.find((f) => {
      const folderBase = normalize(f.name).replace(/s$/, "");
      return folderBase === targetBase;
    });
  }

  if (matchingFolder) {
    console.log(`[AI Smart Folder] ✓ Found existing folder by name: "${matchingFolder.name}"`);
    return matchingFolder.id;
  }

  // Create new folder at root
  console.log(`[AI Smart Folder] ➕ Creating new root folder: "${targetFolderName}"`);
  const categoryInfo = getCategoryInfo();

  const newFolder = await db.folder.create({
    data: {
      userId,
      name: targetFolderName,
      icon: categoryInfo.icon,
      color: categoryInfo.color,
    },
  });

  console.log(`[AI Smart Folder] ✓ Created folder: "${newFolder.name}" with icon: ${categoryInfo.icon}`);
  return newFolder.id;
}
