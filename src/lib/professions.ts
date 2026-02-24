// ============================================================================
// PROFESSIONS — Liste complète pour la personnalisation IA (plan BUSINESS)
// ============================================================================

export type ProfessionCategory = {
  key: string;
  label: string;
  emoji: string;
  professions: string[];
};

export const PROFESSION_CATEGORIES: ProfessionCategory[] = [
  {
    key: "sante",
    label: "Santé & Médical",
    emoji: "🏥",
    professions: [
      "Médecin généraliste",
      "Chirurgien-dentiste",
      "Infirmier(e)",
      "Pharmacien(ne)",
      "Kinésithérapeute",
      "Ostéopathe",
      "Vétérinaire",
      "Cardiologue",
      "Dermatologue",
      "Radiologue",
      "Sage-femme",
      "Psychologue / Psychothérapeute",
      "Orthophoniste",
      "Podologue / Pédicure",
      "Opticien(ne)",
      "Chirurgien(ne)",
    ],
  },
  {
    key: "finance",
    label: "Finance & Comptabilité",
    emoji: "💼",
    professions: [
      "Expert-comptable",
      "Commissaire aux comptes",
      "Conseiller en gestion de patrimoine",
      "Conseiller financier",
      "Analyste financier",
      "Courtier en assurance",
      "Courtier en crédit",
      "Gestionnaire de paie",
      "Banquier(ère)",
    ],
  },
  {
    key: "juridique",
    label: "Juridique",
    emoji: "⚖️",
    professions: [
      "Avocat(e)",
      "Notaire",
      "Huissier de justice",
      "Juriste d'entreprise",
      "Mandataire judiciaire",
      "Conseiller juridique",
    ],
  },
  {
    key: "immobilier",
    label: "Immobilier & BTP",
    emoji: "🏗️",
    professions: [
      "Agent immobilier",
      "Administrateur de biens",
      "Promoteur immobilier",
      "Architecte",
      "Maître d'œuvre",
      "Géomètre-expert",
      "Artisan (plombier, électricien, maçon...)",
      "Entrepreneur BTP",
      "Diagnostiqueur immobilier",
    ],
  },
  {
    key: "tech",
    label: "Tech & Informatique",
    emoji: "💻",
    professions: [
      "Développeur / Ingénieur logiciel",
      "Freelance tech",
      "DSI / CTO",
      "Consultant IT",
      "Data scientist / Ingénieur data",
      "Responsable cybersécurité",
      "Chef de projet digital",
      "Designer UX/UI",
    ],
  },
  {
    key: "commerce",
    label: "Commerce & Retail",
    emoji: "🛍️",
    professions: [
      "Commerçant / Gérant de boutique",
      "E-commerçant",
      "Responsable commercial",
      "Représentant / Agent commercial",
      "Grossiste / Distributeur",
      "Import-export",
      "Franchisé",
    ],
  },
  {
    key: "enseignement",
    label: "Enseignement & Formation",
    emoji: "🎓",
    professions: [
      "Enseignant(e) / Professeur(e)",
      "Formateur / Formatrice",
      "Coach professionnel",
      "Directeur(trice) d'établissement",
      "Chercheur(se) / Universitaire",
      "Tuteur(trice) / Répétiteur(trice)",
    ],
  },
  {
    key: "communication",
    label: "Communication & Créatif",
    emoji: "🎨",
    professions: [
      "Responsable marketing / Communication",
      "Graphiste / Directeur artistique",
      "Photographe",
      "Vidéaste / Réalisateur",
      "Rédacteur / Copywriter",
      "Community manager",
      "Journaliste",
      "Attaché(e) de presse",
      "Agence de publicité",
    ],
  },
  {
    key: "restauration",
    label: "Restauration & Hôtellerie",
    emoji: "🍽️",
    professions: [
      "Restaurateur / Gérant de restaurant",
      "Chef cuisinier / Traiteur",
      "Hôtelier / Gérant d'hébergement",
      "Gérant de bar / Café",
      "Gérant d'épicerie / Alimentation",
    ],
  },
  {
    key: "artisanat",
    label: "Artisanat & Services",
    emoji: "🔧",
    professions: [
      "Coiffeur(se) / Esthéticien(ne)",
      "Mécanicien(ne)",
      "Fleuriste",
      "Boulanger(ère) / Pâtissier(ère)",
      "Pressing / Laverie",
      "Déménageur",
      "Jardinier / Paysagiste",
      "Photographe d'art",
    ],
  },
  {
    key: "liberal",
    label: "Professions libérales & Autres",
    emoji: "🌐",
    professions: [
      "Consultant(e) indépendant(e)",
      "Auto-entrepreneur / Micro-entrepreneur",
      "Agriculteur / Exploitant agricole",
      "Artiste / Auteur",
      "Sportif(ve) professionnel(le)",
      "Assistant(e) maternel(le)",
      "Aide à domicile / Auxiliaire de vie",
      "Association / ONG",
    ],
  },
];

/** Flat list of all profession strings */
export const ALL_PROFESSIONS: string[] = PROFESSION_CATEGORIES.flatMap((c) => c.professions);

// ============================================================================
// PROFESSION → DOC TYPES CONFIG (page Créer)
// ============================================================================

export type DocType = "facture" | "devis" | "contrat" | "bon-de-commande" | "lettre";

export type ProfessionDocConfig = {
  /** Doc types shown by default (in order), with a "Recommandé" badge. */
  prioritized: DocType[];
  /** Suggested folder name to pre-select when saving the generated document. */
  suggestedFolderName: string;
  /** Optional suffix per doc type for the suggested filename (appended after the type label). */
  nameSuffix: Partial<Record<DocType, string>>;
};

export const PROFESSION_CATEGORY_DOC_CONFIG: Record<string, ProfessionDocConfig> = {
  sante: {
    prioritized: ["lettre", "facture", "contrat"],
    suggestedFolderName: "Comptabilité Cabinet",
    nameSuffix: { facture: "Cabinet", lettre: "Médicale", contrat: "Prestataire" },
  },
  finance: {
    prioritized: ["facture", "devis", "contrat"],
    suggestedFolderName: "Honoraires & Factures",
    nameSuffix: { facture: "Honoraires", devis: "Prestation", contrat: "Mission" },
  },
  juridique: {
    prioritized: ["contrat", "lettre", "facture"],
    suggestedFolderName: "Honoraires",
    nameSuffix: { contrat: "Mission", lettre: "Officielle", facture: "Honoraires" },
  },
  immobilier: {
    prioritized: ["devis", "contrat", "bon-de-commande"],
    suggestedFolderName: "Devis & Factures Chantier",
    nameSuffix: { devis: "Chantier", contrat: "Prestation", "bon-de-commande": "Fournisseur" },
  },
  tech: {
    prioritized: ["facture", "devis", "contrat"],
    suggestedFolderName: "Contrats Clients",
    nameSuffix: { facture: "Prestation", devis: "Projet", contrat: "Mission" },
  },
  commerce: {
    prioritized: ["facture", "bon-de-commande", "devis"],
    suggestedFolderName: "Factures Fournisseurs",
    nameSuffix: { facture: "Client", "bon-de-commande": "Fournisseur", devis: "Commercial" },
  },
  enseignement: {
    prioritized: ["contrat", "lettre", "devis"],
    suggestedFolderName: "Contrats Formation",
    nameSuffix: { contrat: "Formation", lettre: "Pédagogique", devis: "Formation" },
  },
  communication: {
    prioritized: ["devis", "facture", "contrat"],
    suggestedFolderName: "Devis & Factures",
    nameSuffix: { devis: "Créatif", facture: "Prestation", contrat: "Droits" },
  },
  restauration: {
    prioritized: ["facture", "bon-de-commande", "contrat"],
    suggestedFolderName: "Factures Fournisseurs",
    nameSuffix: { facture: "Fournisseur", "bon-de-commande": "Approvisionnement", contrat: "Employé" },
  },
  artisanat: {
    prioritized: ["devis", "facture", "contrat"],
    suggestedFolderName: "Devis & Factures",
    nameSuffix: { devis: "Chantier", facture: "Client", contrat: "Prestation" },
  },
  liberal: {
    prioritized: ["facture", "devis", "contrat"],
    suggestedFolderName: "Factures & Devis",
    nameSuffix: { facture: "Client", devis: "Prestation", contrat: "Mission" },
  },
};

/** Returns the ProfessionDocConfig for a given profession string, or null if no profession. */
export function getProfessionDocConfig(profession: string | null | undefined): ProfessionDocConfig | null {
  if (!profession) return null;
  const category = PROFESSION_CATEGORIES.find((c) => c.professions.includes(profession));
  const key = category?.key ?? "liberal";
  return PROFESSION_CATEGORY_DOC_CONFIG[key] ?? null;
}

/**
 * Get the AI context string for a given profession.
 * Injected into Gemini prompts to personalize folder naming and document prioritization.
 */
export function getProfessionAIContext(profession: string): string {
  // Find which category this profession belongs to
  const category = PROFESSION_CATEGORIES.find((c) =>
    c.professions.includes(profession)
  );

  const categoryKey = category?.key ?? "liberal";

  const contextByCategory: Record<string, string> = {
    sante: `L'utilisateur est un professionnel de santé (${profession}). Priorité aux: ordonnances, dossiers patients, résultats d'analyses, comptes-rendus médicaux, factures de matériel médical, contrats fournisseurs santé, diplômes et certifications médicales. Noms de dossiers suggérés: "Dossiers Patients", "Ordonnances", "Résultats Analyses", "Fournisseurs Médicaux", "Diplômes & Certifications", "Comptabilité Cabinet".`,

    finance: `L'utilisateur est un professionnel de la finance/comptabilité (${profession}). Priorité aux: bilans comptables, liasses fiscales, déclarations de revenus, relevés bancaires, contrats clients, mandats, factures honoraires. Noms de dossiers suggérés: "Dossiers Clients", "Déclarations Fiscales", "Bilans Comptables", "Honoraires & Factures", "Contrats Missions", "Relevés Bancaires".`,

    juridique: `L'utilisateur est un professionnel du droit (${profession}). Priorité aux: actes juridiques, contrats, jugements, procurations, courriers officiels, dossiers clients, honoraires. Noms de dossiers suggérés: "Dossiers Clients", "Actes & Contrats", "Jugements & Décisions", "Courriers Officiels", "Honoraires", "Correspondances".`,

    immobilier: `L'utilisateur travaille dans l'immobilier ou le BTP (${profession}). Priorité aux: compromis de vente, baux, plans, devis, factures chantier, permis de construire, diagnostics immobiliers, mandats. Noms de dossiers suggérés: "Mandats & Compromis", "Plans & Permis", "Devis & Factures Chantier", "Diagnostics", "Baux & Locations", "Fournisseurs BTP".`,

    tech: `L'utilisateur est un professionnel de la tech/informatique (${profession}). Priorité aux: contrats de mission, factures, devis, spécifications techniques, documentation, licences logicielles, NDA. Noms de dossiers suggérés: "Contrats Clients", "Factures & Devis", "Documentation Technique", "Licences & Accès", "NDA & Contrats", "Code & Projets".`,

    commerce: `L'utilisateur est dans le commerce/retail (${profession}). Priorité aux: factures fournisseurs, bons de commande, inventaires, contrats commerciaux, relevés de caisse, documents douaniers. Noms de dossiers suggérés: "Factures Fournisseurs", "Bons de Commande", "Contrats Commerciaux", "Inventaires & Stock", "Comptabilité", "Documents Douane".`,

    enseignement: `L'utilisateur est dans l'enseignement/formation (${profession}). Priorité aux: programmes de cours, supports pédagogiques, contrats de formation, conventions, certificats, diplômes. Noms de dossiers suggérés: "Supports de Cours", "Contrats Formation", "Conventions", "Certifications", "Notes & Évaluations", "Planning".`,

    communication: `L'utilisateur est dans la communication/créatif (${profession}). Priorité aux: briefs créatifs, devis, contrats de prestation, droits d'auteur, factures, portfolios. Noms de dossiers suggérés: "Briefs & Projets", "Contrats Clients", "Devis & Factures", "Droits d'Auteur", "Portfolio", "Contrats Fournisseurs".`,

    restauration: `L'utilisateur est dans la restauration/hôtellerie (${profession}). Priorité aux: factures fournisseurs, contrats de travail, licences, fiches de paie, contrôles sanitaires, baux commerciaux. Noms de dossiers suggérés: "Factures Fournisseurs", "Contrats Employés", "Licences & Autorisations", "Contrôles Sanitaires", "Baux & Loyers", "Comptabilité".`,

    artisanat: `L'utilisateur est artisan ou dans les services (${profession}). Priorité aux: devis, factures, contrats, attestations d'assurance, diplômes professionnels, licences. Noms de dossiers suggérés: "Devis & Factures", "Contrats Clients", "Assurances", "Diplômes & Qualifications", "Fournisseurs", "Comptabilité".`,

    liberal: `L'utilisateur est ${profession}. Priorité aux: contrats, factures, devis, documents administratifs, comptabilité. Noms de dossiers suggérés: "Contrats", "Factures & Devis", "Documents Administratifs", "Comptabilité", "Clients".`,
  };

  return contextByCategory[categoryKey] ?? contextByCategory["liberal"];
}
