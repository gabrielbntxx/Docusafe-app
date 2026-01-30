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
  suggestedFolder?: string; // Nom de dossier PRÉCIS suggéré par l'IA (ex: "Cours Informatique")
  extractedData: {
    date?: string;
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
  };
  rawResponse?: string;
};

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

{"documentType":"type_exact","confidence":0.95,"suggestedName":"Nom fichier descriptif","suggestedFolder":"Nom Dossier Ultra Précis","extractedData":{"date":"2024-01-15","amount":"150.00€","issuer":"Émetteur","recipient":"Destinataire","reference":"REF123","subject":"Sujet principal détaillé","topic":"Matière/Thème précis","location":"Lieu","people":"Personnes","language":"Langue","duration":"Durée si applicable","genre":"Genre si musique/vidéo","description":"Description détaillée du contenu"}}

## 🚨 RAPPELS CRITIQUES
1. suggestedFolder doit être PRÉCIS: "Cours Informatique" pas "Études"
2. Pour audio/vidéo: analyse le CONTENU, pas juste le format
3. Extrais TOUTES les infos pertinentes (date, matière, lieu, personnes...)
4. La confidence doit refléter ta certitude réelle
5. Si tu détectes plusieurs thèmes, choisis le principal`;

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
    // Gemini supports audio analysis - map to supported formats
    if (mimeType === "audio/mpeg" || mimeType === "audio/mp3") {
      geminiMimeType = "audio/mpeg";
    } else if (mimeType === "audio/wav" || mimeType === "audio/x-wav" || mimeType === "audio/wave") {
      geminiMimeType = "audio/wav";
    } else if (mimeType === "audio/ogg") {
      geminiMimeType = "audio/ogg";
    } else if (mimeType === "audio/flac") {
      geminiMimeType = "audio/flac";
    } else {
      geminiMimeType = "audio/mpeg"; // Default fallback for audio
    }
  } else if (mimeType.startsWith("video/")) {
    // Gemini 2.0 supports video analysis - map to supported formats
    if (mimeType === "video/mp4" || mimeType === "video/mpeg") {
      geminiMimeType = "video/mp4";
    } else if (mimeType === "video/quicktime") {
      geminiMimeType = "video/quicktime";
    } else if (mimeType === "video/webm") {
      geminiMimeType = "video/webm";
    } else if (mimeType === "video/x-msvideo" || mimeType === "video/avi") {
      geminiMimeType = "video/x-msvideo";
    } else {
      geminiMimeType = "video/mp4"; // Default fallback for video
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

    // Use the AI's suggested folder if provided, otherwise fall back to category
    const suggestedFolder = parsed.suggestedFolder || category;

    return {
      documentType,
      category,
      confidence: parsed.confidence || 0.5,
      suggestedName: parsed.suggestedName,
      suggestedFolder, // Nom de dossier PRÉCIS de l'IA
      extractedData: {
        date: parsed.extractedData?.date || undefined,
        amount: parsed.extractedData?.amount || undefined,
        issuer: parsed.extractedData?.issuer || undefined,
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
 * Get or create folder with INTELLIGENT matching
 * Uses AI's suggestedFolder for precise naming (e.g., "Cours Informatique" instead of "Études")
 */
export async function getOrCreateCategoryFolder(
  userId: string,
  category: string,
  suggestedFolder?: string
): Promise<string> {
  // Use the AI's precise folder name if available, otherwise fall back to category
  const targetFolderName = suggestedFolder || category;

  console.log(`[AI Smart Folder] Looking for folder: "${targetFolderName}" (category: ${category})`);

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

  const normalizedTarget = normalize(targetFolderName);

  // 1. Check EXACT match first (case insensitive)
  let matchingFolder = allFolders.find(
    (f) => normalize(f.name) === normalizedTarget
  );

  // 2. Check if any existing folder contains the target or vice versa
  // This helps group similar content (e.g., "Cours Informatique L1" goes into existing "Cours Informatique")
  if (!matchingFolder) {
    matchingFolder = allFolders.find((f) => {
      const normalizedFolderName = normalize(f.name);
      // Check if folder contains target or target contains folder
      return normalizedFolderName.includes(normalizedTarget) ||
             normalizedTarget.includes(normalizedFolderName);
    });
  }

  // 3. For generic category matches - if suggestedFolder is specific, prefer creating new
  // But if no suggestedFolder, fall back to category matching
  if (!matchingFolder && !suggestedFolder) {
    const normalizedCategory = normalize(category);
    matchingFolder = allFolders.find(
      (f) => normalize(f.name) === normalizedCategory ||
             normalize(f.name).includes(normalizedCategory)
    );
  }

  // 4. Check for common variations (singular/plural)
  if (!matchingFolder) {
    const targetBase = normalizedTarget.replace(/s$/, "");
    matchingFolder = allFolders.find((f) => {
      const folderBase = normalize(f.name).replace(/s$/, "");
      return folderBase === targetBase;
    });
  }

  // If found, return existing folder
  if (matchingFolder) {
    console.log(`[AI Smart Folder] ✓ Found existing folder: "${matchingFolder.name}"`);
    return matchingFolder.id;
  }

  // No existing folder found - CREATE with the PRECISE name from AI
  console.log(`[AI Smart Folder] ➕ Creating new folder: "${targetFolderName}"`);

  // Find category info for icon and color
  const categoryKey = Object.keys(DOCUMENT_CATEGORIES).find(
    (key) => DOCUMENT_CATEGORIES[key as keyof typeof DOCUMENT_CATEGORIES].name === category
  ) as keyof typeof DOCUMENT_CATEGORIES | undefined;

  const categoryInfo = categoryKey
    ? DOCUMENT_CATEGORIES[categoryKey]
    : DOCUMENT_CATEGORIES.AUTRE;

  const newFolder = await db.folder.create({
    data: {
      userId,
      name: targetFolderName, // Use the PRECISE name, not generic category
      icon: categoryInfo.icon,
      color: categoryInfo.color,
    },
  });

  console.log(`[AI Smart Folder] ✓ Created folder: "${newFolder.name}" with icon: ${categoryInfo.icon}`);
  return newFolder.id;
}
