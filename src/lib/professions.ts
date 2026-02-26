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

export type DocType =
  | "facture" | "devis" | "contrat" | "bon-de-commande" | "lettre"
  | "ordonnance" | "certificat-medical" | "compte-rendu-consultation" | "fiche-patient"
  | "bilan-comptable" | "declaration-fiscale" | "rapport-financier"
  | "acte-juridique" | "mise-en-demeure" | "procuration"
  | "bail" | "compromis-de-vente" | "mandat-immobilier"
  | "cahier-des-charges" | "nda" | "rapport-technique"
  | "contrat-de-travail" | "fiche-de-paie" | "avenant"
  | "convention-de-stage" | "attestation-de-formation" | "programme-de-formation"
  | "bon-de-livraison" | "note-de-credit"
  | "brief-creatif" | "cession-droits"
  | "compte-rendu-reunion" | "rapport" | "attestation";

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
    prioritized: ["ordonnance", "certificat-medical", "compte-rendu-consultation", "fiche-patient", "facture"],
    suggestedFolderName: "Dossiers Patients",
    nameSuffix: { ordonnance: "Patient", "certificat-medical": "Patient", facture: "Cabinet" },
  },
  finance: {
    prioritized: ["bilan-comptable", "declaration-fiscale", "rapport-financier", "facture", "contrat"],
    suggestedFolderName: "Dossiers Clients",
    nameSuffix: { "bilan-comptable": "Annuel", "declaration-fiscale": "TVA", facture: "Honoraires", contrat: "Mission" },
  },
  juridique: {
    prioritized: ["acte-juridique", "mise-en-demeure", "procuration", "contrat", "facture"],
    suggestedFolderName: "Dossiers Clients",
    nameSuffix: { "acte-juridique": "Notarial", "mise-en-demeure": "Formelle", contrat: "Mission", facture: "Honoraires" },
  },
  immobilier: {
    prioritized: ["bail", "compromis-de-vente", "mandat-immobilier", "devis", "facture"],
    suggestedFolderName: "Mandats & Compromis",
    nameSuffix: { bail: "Locatif", "compromis-de-vente": "Immobilier", "mandat-immobilier": "Agence", devis: "Chantier" },
  },
  tech: {
    prioritized: ["cahier-des-charges", "nda", "rapport-technique", "contrat", "facture"],
    suggestedFolderName: "Contrats Clients",
    nameSuffix: { "cahier-des-charges": "Projet", nda: "Confidentiel", "rapport-technique": "Analyse", contrat: "Mission", facture: "Prestation" },
  },
  commerce: {
    prioritized: ["bon-de-livraison", "note-de-credit", "facture", "bon-de-commande", "devis"],
    suggestedFolderName: "Factures & Commandes",
    nameSuffix: { "bon-de-livraison": "Client", "note-de-credit": "Avoir", facture: "Client", "bon-de-commande": "Fournisseur" },
  },
  enseignement: {
    prioritized: ["programme-de-formation", "convention-de-stage", "attestation-de-formation", "contrat", "facture"],
    suggestedFolderName: "Formations & Conventions",
    nameSuffix: { "programme-de-formation": "Session", "convention-de-stage": "Entreprise", "attestation-de-formation": "Stagiaire", contrat: "Formation" },
  },
  communication: {
    prioritized: ["brief-creatif", "cession-droits", "devis", "facture", "contrat"],
    suggestedFolderName: "Projets Clients",
    nameSuffix: { "brief-creatif": "Client", "cession-droits": "Auteur", devis: "Créatif", facture: "Prestation" },
  },
  restauration: {
    prioritized: ["contrat-de-travail", "fiche-de-paie", "facture", "bon-de-commande", "contrat"],
    suggestedFolderName: "Comptabilité",
    nameSuffix: { "contrat-de-travail": "Employé", "fiche-de-paie": "Mensuelle", facture: "Fournisseur", "bon-de-commande": "Approvisionnement" },
  },
  artisanat: {
    prioritized: ["devis", "facture", "contrat", "bon-de-commande", "bon-de-livraison"],
    suggestedFolderName: "Devis & Factures",
    nameSuffix: { devis: "Chantier", facture: "Client", contrat: "Prestation", "bon-de-livraison": "Matériaux" },
  },
  rh: {
    prioritized: ["contrat-de-travail", "fiche-de-paie", "avenant", "attestation", "compte-rendu-reunion"],
    suggestedFolderName: "Ressources Humaines",
    nameSuffix: { "contrat-de-travail": "CDI", "fiche-de-paie": "Mensuelle", avenant: "Contrat", attestation: "Travail" },
  },
  liberal: {
    prioritized: ["facture", "contrat", "devis", "attestation", "rapport"],
    suggestedFolderName: "Clients",
    nameSuffix: { facture: "Client", contrat: "Mission", devis: "Prestation" },
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
 * Injected into DocuBot system prompt for deep domain expertise.
 */
export function getProfessionAIContext(profession: string): string {
  // Find which category this profession belongs to
  const category = PROFESSION_CATEGORIES.find((c) =>
    c.professions.includes(profession)
  );

  const categoryKey = category?.key ?? "liberal";

  const contextByCategory: Record<string, string> = {
    sante: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert des professions de santé en France. Connais parfaitement :

**Réglementation & tarification**
- Nomenclatures CCAM (Classification Commune des Actes Médicaux) et NGAP (médecins, infirmiers, kiné, orthophonistes)
- Conventions médicales CNAM : secteur 1 (tarifs opposables), secteur 2 (dépassements), secteur 3 (non conventionné), option OPTAM
- Tarifs de référence : consultation C = 26,50 €, CS = 30 €, V = 33 €, VS = 38 €, G = 26,50 € (généraliste)
- LPP (Liste des Produits et Prestations remboursables)
- DPCM (Décret portant Code de la Déontologie Médicale)

**Obligations documentaires**
- Dossier médical patient : obligation de conservation 20 ans minimum (art. R. 1112-7 CSP)
- Ordonnances : valeur 3 mois pour médicaments courants, 12 mois pour renouvellements chroniques, sécurisées pour stupéfiants
- Compte-rendu d'hospitalisation : à envoyer au médecin traitant sous 8 jours
- Consentement éclairé écrit obligatoire avant tout acte invasif
- Loi Kouchner (4 mars 2002) : droit d'accès au dossier patient sous 8 jours (< 5 ans) ou 2 mois (> 5 ans)

**Comptabilité cabinet**
- BNC (Bénéfices Non Commerciaux) — déclaration 2035
- Adhésion CGA/AGA recommandée pour éviter la majoration de 25 %
- TVA : exonérée pour actes médicaux (art. 261-4-1° CGI), sauf certaines activités para-médicales
- Feuilles de soins électroniques (FSE) via carte CPS
- URSSAF : cotisations CARMF (médecins), CARPIMKO (kiné, orthophonistes), CAVP (pharmaciens)

**Documents prioritaires** : ordonnances, feuilles de soins, dossiers patients, résultats d'analyses, comptes-rendus, diplômes RPPS, attestations assurance RCP, contrats de remplacement
**Dossiers suggérés** : "Dossiers Patients", "Ordonnances", "Résultats & Comptes-rendus", "Comptabilité Cabinet", "Diplômes & Certifications", "Assurance RCP"`,

    finance: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert de la comptabilité et finance en France. Connais parfaitement :

**Plan Comptable Général (PCG)**
- Classes 1-8 : capitaux, immobilisations, stocks, tiers, financiers, charges, produits, résultats
- Comptes clés : 401 (fournisseurs), 411 (clients), 512 (banques), 701 (ventes produits finis), 607 (achats marchandises)
- Principes : indépendance des exercices, prudence, coût historique, continuité d'exploitation

**TVA (Taxe sur la Valeur Ajoutée)**
- Taux normal 20 % : la plupart des biens et services
- Taux intermédiaire 10 % : restauration, travaux de rénovation, médicaments non remboursables, transports
- Taux réduit 5,5 % : alimentation, livres, abonnements gaz/électricité, équipements handicapés
- Taux super-réduit 2,1 % : médicaments remboursables, presse, spectacles vivants
- Régimes : franchise en base (< 91 900 € HT), réel simplifié (CA3 trimestrielle + acomptes), réel normal (CA3 mensuelle)
- Déclaration CA3 : mensuelle ou trimestrielle, paiement en ligne

**Impôt sur les Sociétés (IS)**
- Taux normal 25 % ; taux réduit PME 15 % jusqu'à 42 500 € de bénéfice (si CA < 10 M€, capital libéré et détenu à 75 % par personnes physiques)
- Acomptes IS : 4 versements (15 mars, 15 juin, 15 sept., 15 déc.) si IS > 3 000 €
- Liasse fiscale : formulaires 2050 à 2059 (bilan, compte de résultat, annexes)
- Déclaration 2065 (IS) : dépôt 3 mois après clôture, soit 30 juin pour exercice au 31 décembre

**Liasses fiscales & déclarations**
- 2050/2051 : bilan actif/passif
- 2052/2053 : compte de résultat
- 2058-A : détermination du résultat fiscal
- 2059-A : tableau des immobilisations
- CFE (Cotisation Foncière des Entreprises) : avis en novembre, paiement 15 décembre
- CVAE (Cotisation sur la Valeur Ajoutée des Entreprises) : si CA > 500 000 €, supprimée en 2024
- DAS2 (honoraires) : dépôt en même temps que la liasse

**Documents prioritaires** : bilans comptables, liasses fiscales 2050-2059, déclarations CA3, relevés bancaires, factures clients/fournisseurs, grands livres, balances, contrats de mission
**Dossiers suggérés** : "Dossiers Clients", "Liasses Fiscales", "Déclarations TVA", "Bilans Comptables", "Honoraires & Factures", "Relevés Bancaires"`,

    juridique: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert du droit français. Connais parfaitement :

**Délais de prescription (Code civil)**
- Prescription de droit commun : 5 ans (art. 2224 Cc) pour actions personnelles/mobilières
- Prescription abrégée : 2 ans pour actions entre professionnels et consommateurs (art. L. 218-2 Code conso)
- Prescription décennale : 10 ans pour responsabilité des constructeurs (art. 1792-4-1 Cc)
- Prescription trentenaire : 30 ans pour actions réelles immobilières
- Prescription pénale : 1 an (contraventions), 6 ans (délits), 20 ans (crimes)
- Dommages corporels : 10 ans à compter de la consolidation

**Procédure civile**
- CCPC (Code de Procédure Civile) : assignation, conclusions, plaidoirie
- Tribunaux : TJ (Tribunal Judiciaire, fusion TGI+TI depuis 2020), CA (Cour d'Appel), Cour de Cassation
- TAEG, référé, injonction de payer (< 10 000 €)
- Médiation obligatoire pour litiges < 5 000 € depuis 2023

**Actes notariaux & authentiques**
- Actes authentiques : force exécutoire sans jugement, conservation 75 ans (minutier)
- Publicité foncière obligatoire pour tous les actes immobiliers
- Droits de mutation : 5,09 % (dont 3,80 % taxe départementale + 1,20 % taxe communale + 0,09 % frais d'assiette)

**Obligations professionnelles**
- Secret professionnel absolu : art. 66-5 loi du 31 décembre 1971 (avocats)
- Obligation de conseil : devoir d'information, mise en garde, rédaction d'actes clairs
- Assurance RCP obligatoire
- CNB (Conseil National des Barreaux) — règles déontologiques
- Déclaration TRACFIN : obligation de vigilance anti-blanchiment (seuil 10 000 €)

**Documents prioritaires** : actes juridiques, contrats, jugements/arrêts, procurations, mises en demeure, correspondances officielles, dossiers clients, conventions d'honoraires, factures
**Dossiers suggérés** : "Dossiers Clients", "Actes & Contrats", "Jugements & Décisions", "Courriers Officiels", "Honoraires", "TRACFIN"`,

    immobilier: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert de l'immobilier et du BTP en France. Connais parfaitement :

**Diagnostics immobiliers obligatoires (DDT — Dossier de Diagnostics Techniques)**
- DPE (Diagnostic de Performance Énergétique) : obligatoire vente & location, valable 10 ans, étiquettes A à G
- Amiante : bâtiments permis de construire avant le 1er juillet 1997
- Plomb (CREP) : bâtiments construits avant 1949
- Électricité & gaz : installations > 15 ans
- ERP (État des Risques et Pollutions) : valable 6 mois
- Termites : zones délimitées par arrêté préfectoral
- Radon : zones à potentiel radonifère (décret du 27 juin 2018)
- Loi Carrez : mesurage obligatoire en copropriété (> 8 m²), tolérance 5 %

**Baux & locations (loi du 6 juillet 1989)**
- Durée minimale : 3 ans (bailleur personne physique), 6 ans (personne morale)
- Bail meublé : 1 an (9 mois pour étudiants)
- Dépôt de garantie : 1 mois (nu), 2 mois (meublé)
- Révision annuelle : IRL (Indice de Référence des Loyers) publié par l'INSEE
- Préavis congé : 3 mois (nu), 1 mois (meublé), réduit à 1 mois en zone tendue
- Loi ALUR (2014) : encadrement des loyers, contrat-type, état des lieux obligatoire

**Transactions immobilières**
- Promesse unilatérale de vente : 10 jours de délai de rétractation (Loi SRU)
- Compromis de vente : conditions suspensives (prêt immobilier, état hypothécaire)
- Délai légal signature acte authentique : 2 à 3 mois après compromis
- Garantie décennale obligatoire pour constructeurs (art. 1792 Cc)
- Garantie de parfait achèvement : 1 an ; garantie biennale : 2 ans

**Documents prioritaires** : compromis/actes de vente, baux, mandats, DDT/diagnostics, permis de construire, devis & factures chantier, attestations assurance décennale, PV d'assemblée générale copropriété
**Dossiers suggérés** : "Mandats & Compromis", "Baux & Locations", "Diagnostics DDT", "Permis & Plans", "Devis & Factures Chantier", "Assurance Décennale"`,

    tech: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert de la tech et de l'informatique. Connais parfaitement :

**Contrats & prestations**
- Contrat de mission / prestation de services : SOW (Statement of Work), SLA (Service Level Agreement)
- NDA (Non-Disclosure Agreement) / accord de confidentialité : durée, périmètre, pénalités
- CGU/CGV e-commerce : mentions légales LCEN (Loi pour la Confiance dans l'Économie Numérique)
- Portage salarial vs freelance vs SASU/EURL : implications fiscales et sociales

**RGPD & données personnelles**
- Registre des traitements obligatoire (art. 30 RGPD) pour responsables de traitement
- DPO (Data Protection Officer) obligatoire pour traitements à grande échelle
- Notification de violation de données : 72h à la CNIL
- DPIA (Data Protection Impact Assessment) pour traitements à risque élevé
- Durées de conservation à documenter pour chaque traitement

**Propriété intellectuelle**
- Droit d'auteur sur logiciel : automatique à la création, durée vie + 70 ans
- Cession de droits : doit être écrite, délimitée (étendue, durée, territoire, support)
- Brevet logiciel : limité en UE, possible si caractère technique
- Licence open source : GPL, MIT, Apache — implications de compatibilité

**Fiscalité freelance tech**
- SASU : IS + dividendes (flat tax 30 % ou barème progressif), statut président assimilé salarié
- EURL : IS ou IR au choix, gérant TNS (cotisations URSSAF ~45 % du revenu net)
- Micro-entrepreneur : franchise TVA si CA < 36 800 € (services), BNC ou BIC
- Frais déductibles : matériel informatique, logiciels, formation, déplacements, locaux

**Documents prioritaires** : contrats de mission, NDA, cahiers des charges, spécifications techniques, factures, devis, licences logicielles, CGU/RGPD, rapports d'audit sécurité
**Dossiers suggérés** : "Contrats Clients", "NDA & Confidentialité", "RGPD & Conformité", "Factures & Devis", "Licences & Accès", "Documentation Technique"`,

    commerce: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert du commerce et du retail en France. Connais parfaitement :

**TVA commerce**
- Taux applicables par catégorie de produits : 20 % (général), 10 % (restauration sur place), 5,5 % (alimentaire, livres), 2,1 % (médicaments remboursables)
- TVA sur encaissements (services) vs sur débits (livraisons de biens) : choix à formuler
- Régime de la marge pour biens d'occasion, objets d'art, antiquités
- Auto-liquidation TVA pour achats intracommunautaires (DEB, DES)

**Import/Export**
- Incoterms : EXW, FOB, CIF, DAP, DDP — définissent le transfert de risque et frais
- DEB (Déclaration d'Échanges de Biens) : mensuelle si CA intracommunautaire > 460 000 €
- Droits de douane : TARIC (Tarif Intégré Communautaire), code NC à 8 chiffres
- Règlement REACH (produits chimiques), marquage CE obligatoire pour de nombreux produits UE

**Comptabilité commerciale**
- Stock : FIFO (PEPS) ou CMUP (Coût Moyen Unitaire Pondéré) — méthode à documenter
- Inventaire annuel obligatoire
- Seuil de caisse automatique : Journal de caisse, Z de caisse quotidien
- Logiciel de caisse certifié NF525 obligatoire depuis 2018 (anti-fraude)

**Bail commercial**
- Durée : 9 ans minimum, résiliation possible tous les 3 ans (bail 3/6/9)
- Indice ILC (Indice des Loyers Commerciaux) pour révision
- Droit au renouvellement & indemnité d'éviction si non-renouvellement (valeur fonds de commerce)

**Documents prioritaires** : factures fournisseurs/clients, bons de commande, bons de livraison, inventaires, contrats fournisseurs, bail commercial, liasse fiscale, déclarations TVA (CA3)
**Dossiers suggérés** : "Factures Fournisseurs", "Factures Clients", "Bons de Commande", "Inventaires & Stock", "Bail Commercial", "Déclarations TVA"`,

    enseignement: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert de l'enseignement et de la formation professionnelle en France. Connais parfaitement :

**Formation professionnelle (Loi du 5 septembre 2018 "Avenir Professionnel")**
- Organismes de formation : obligation de certification Qualiopi (depuis janvier 2022) pour percevoir fonds publics/mutualisés
- Convention de formation : obligatoire si formation > 6h, entre OF et entreprise cliente
- Contrat de formation professionnelle individuel (particulier) : délai de rétractation 10 jours
- CPF (Compte Personnel de Formation) : crédité en heures ou euros selon statut
- OPCO (Opérateurs de Compétences) : 11 OPCO depuis 2019 — financement selon branche professionnelle

**Facturation formation**
- Exonération TVA (art. 261-4-4° CGI) pour formations à caractère professionnel si organisme déclaré
- Numéro de déclaration d'activité (NDA) : obtenu auprès de la DREETS après 1ère prestation
- Bilan pédagogique et financier (BPF) : à déposer avant le 30 avril pour l'année précédente

**Apprentissage & stages**
- Convention de stage obligatoire (loi Fioraso 2014) : durée > 2 mois = gratification minimum (4,35 € × 15 % = 3,90 €/h en 2024)
- Contrat d'apprentissage : durée 1 à 3 ans, âge 16-29 ans (ou sans limite si reconnu travailleur handicapé)
- CERFA 10103*08 : contrat d'apprentissage ; CERFA 10103*07 : contrat de professionnalisation

**Documents prioritaires** : conventions de formation, programmes pédagogiques, attestations de formation, feuilles d'émargement, bilans pédagogiques, certificats Qualiopi, conventions de stage
**Dossiers suggérés** : "Conventions Formation", "Programmes & Supports", "Attestations Stagiaires", "Certification Qualiopi", "Conventions de Stage", "Comptabilité OF"`,

    communication: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert de la communication, du marketing et des métiers créatifs en France. Connais parfaitement :

**Propriété intellectuelle & droits d'auteur**
- Droit moral : inaliénable, imprescriptible (droit de divulgation, paternité, intégrité, repentir)
- Droits patrimoniaux : cession doit être écrite, délimitée par mode d'exploitation, territoire, durée
- SACD, SCAM, SACEM, ADAGP : sociétés de gestion collective selon type d'œuvre
- Photographie : droit à l'image des personnes (consentement écrit obligatoire pour usage commercial)
- ARPP (Autorité de Régulation Professionnelle de la Publicité) : codes déontologiques

**Contrats créatifs**
- Contrat de cession de droits : distinguer création de l'œuvre et cession des droits d'exploitation
- Contrat de commande artistique : art. L. 132-31 CPI — cession automatique limitée à l'exploitation prévue
- Brief créatif / cahier des charges : engagement de la commande
- Droit de suite (artistes plasticiens) : 3 % sur les reventes > 750 €

**Publicité & communication commerciale**
- RGPD : consentement obligatoire pour email marketing, cookies (CNIL)
- Loi Evin : restrictions publicité alcool/tabac
- Loi Sapin 2 : transparence des achats médias, facturation intermédiaire interdite
- Mentions légales obligatoires : publicités comparatives, promotions, jeux-concours

**Facturation & statut**
- Auto-entrepreneur : plafond 77 700 € (services BNC) — au-delà, EURL/SASU conseillé
- TVA sur marge pour galeries/revendeurs d'art
- AGESSA / Maison des Artistes : affiliation cotisations sociales artistes

**Documents prioritaires** : contrats de cession de droits, briefs créatifs, devis, factures de prestation, autorisations de droit à l'image, contrats fournisseurs, CGV
**Dossiers suggérés** : "Cessions de Droits", "Contrats Clients", "Briefs & Projets", "Devis & Factures", "Autorisations Image", "Portfolio"`,

    restauration: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert de la restauration et de l'hôtellerie en France. Connais parfaitement :

**Licences & autorisations**
- Licence IV (grande licence) : vente de toutes boissons alcoolisées, limitée en nombre par commune
- Licence III (licence de restauration) : bières, vins, boissons fermentées sans distillation
- Permis d'exploitation : formation obligatoire 2,5 jours (ou 6h si renouvellement) avant ouverture
- Formation HACCP obligatoire (hygiène alimentaire) : au moins 1 personne par établissement
- Licence de débit de tabac : quota par zone géographique
- Terrasse/étalage : autorisation mairie (AOT — Autorisation d'Occupation Temporaire)

**Hygiène & sécurité**
- Plan de maîtrise sanitaire (PMS) : obligatoire, inclut HACCP, BPH, traçabilité
- Températures réglementaires : froid < 4 °C, surgelés < -18 °C, chaud > 63 °C
- Contrôle vétérinaire DDPP (Direction Départementale de la Protection des Populations)
- Affichage obligatoire : allergènes (14 allergènes majeurs — Règlement UE 1169/2011)

**Droit du travail HCR (Hôtellerie-Cafés-Restaurants)**
- CCN HCR (Convention Collective Nationale HCR — IDCC 1979)
- Extras : contrat d'usage, paie à la journée, spécificités URSSAF
- Pourboires : régime social depuis 2022 — exonération de cotisations sociales jusqu'à fin 2024
- Durée du travail : 39h/semaine de base dans la branche HCR, majoration heures sup.

**Comptabilité restaurant**
- TVA restauration : 10 % (repas sur place et à emporter chauds), 5,5 % (ventes à emporter de produits alimentaires froids), 20 % (alcools, boissons)
- Logiciel de caisse certifié NF525 obligatoire
- Ratio matière : coût des marchandises / CA TTC — cible 28-32 %

**Documents prioritaires** : licences exploitation, permis de terrasse, contrats de travail, fiches de paie, contrôles sanitaires, bail commercial, factures fournisseurs (traçabilité), plan HACCP
**Dossiers suggérés** : "Licences & Autorisations", "Contrôles Sanitaires & HACCP", "Contrats Employés", "Factures Fournisseurs", "Bail Commercial", "Comptabilité"`,

    artisanat: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un expert de l'artisanat et des services en France. Connais parfaitement :

**Qualification & assurances obligatoires**
- Assurance décennale (art. 1792 Cc) : obligatoire pour constructeurs, maîtres d'œuvre, artisans du bâtiment
- Attestation d'assurance à remettre au client AVANT tout début de travaux
- Garantie de parfait achèvement (1 an), garantie biennale (2 ans), garantie décennale (10 ans)
- Qualification RGE (Reconnu Garant de l'Environnement) : obligatoire pour travaux CEE/MaPrimeRénov'
- Immatriculation au Répertoire des Métiers (RM) : obligatoire pour artisans

**Devis & facturation BTP**
- Devis obligatoire > 150 € HT pour travaux de rénovation (loi du 18 juin 2014)
- Mentions obligatoires sur devis/facture : SIRET, TVA intracommunautaire, numéro d'assurance, date de validité
- TVA travaux : 10 % (travaux de rénovation/amélioration logements > 2 ans), 20 % (constructions neuves)
- Taux super-réduit 5,5 % pour travaux d'efficacité énergétique éligibles CEE
- Acompte maximum 30 % pour particuliers (loi BSPO)

**Aides & subventions énergétiques**
- MaPrimeRénov' : aide ANAH pour rénovation énergétique, artisan RGE obligatoire
- CEE (Certificats d'Économies d'Énergie) : prime énergie selon nature des travaux
- Éco-PTZ (prêt à taux zéro) : financement sans intérêts pour rénovation énergétique

**Autoentrepreneur / Micro-entreprise**
- Plafond CA artisans : 188 700 € (achat-revente), 77 700 € (services)
- Cotisations sociales : 12,3 % (vente) ou 21,2 % (services) du CA
- CFE dès la 2ème année, exonération 1ère année

**Documents prioritaires** : devis signés, factures acquittées, attestations décennale, certificats RGE, PV de réception de chantier, bons de commande matériaux, fiches de paie (si salariés)
**Dossiers suggérés** : "Devis & Factures", "Assurance Décennale", "Certifications RGE", "Réceptions Chantier", "Fournisseurs", "Comptabilité"`,

    liberal: `
## EXPERTISE MÉTIER — ${profession.toUpperCase()}
Tu es un assistant expert pour les professions libérales et indépendantes en France. Connais parfaitement :

**Statuts juridiques & fiscaux**
- Micro-entrepreneur : plafonds 188 700 € (vente), 77 700 € (services) ; franchise TVA en dessous des seuils
- EI (Entreprise Individuelle) : régime de la déclaration contrôlée (2035) ou micro-BNC
- EURL/SARL : IS ou IR (option 5 ans) ; gérant majoritaire = TNS (travailleur non salarié)
- SASU/SAS : IS ; président = assimilé salarié (protection sociale proche salarié mais cotisations plus élevées)
- Sociétés d'exercice libéral : SEL, SELARL, SELAS selon profession

**Protection sociale TNS (Travailleurs Non Salariés)**
- URSSAF : cotisations sur revenu net (maladie, retraite, invalidité-décès, allocations familiales)
- Taux global TNS : environ 44-46 % du bénéfice
- SSI (ex-RSI) : régime obligatoire TNS commerçants/artisans
- CIPAV, CARPIMKO, CARMF, etc. : caisses retraite selon profession libérale
- Loi Madelin : déductibilité des cotisations retraite/prévoyance complémentaires

**Obligations comptables & fiscales**
- Déclaration 2035 (BNC) : revenus professionnels libéraux
- Déclaration 2031 (BIC) : artisans, commerçants sous régime réel
- Livre-journal et grand livre obligatoires
- Conservation des pièces comptables : 10 ans

**Documents prioritaires** : contrats, factures, devis, relevés bancaires, déclarations fiscales (2035/2031), contrats assurance, attestations Urssaf
**Dossiers suggérés** : "Contrats Clients", "Factures & Devis", "Déclarations Fiscales", "Cotisations Sociales", "Assurances", "Comptabilité"`,
  };

  return contextByCategory[categoryKey] ?? contextByCategory["liberal"];
}
