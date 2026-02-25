"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
  X,
  Eye,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DocType =
  // — Généraux —
  | "facture"
  | "devis"
  | "contrat"
  | "bon-de-commande"
  | "lettre"
  // — Santé —
  | "ordonnance"
  | "certificat-medical"
  | "compte-rendu-consultation"
  | "fiche-patient"
  // — Finance / Comptabilité —
  | "bilan-comptable"
  | "declaration-fiscale"
  | "rapport-financier"
  // — Juridique —
  | "acte-juridique"
  | "mise-en-demeure"
  | "procuration"
  // — Immobilier —
  | "bail"
  | "compromis-de-vente"
  | "mandat-immobilier"
  // — Tech / IT —
  | "cahier-des-charges"
  | "nda"
  | "rapport-technique"
  // — RH / Travail —
  | "contrat-de-travail"
  | "fiche-de-paie"
  | "avenant"
  // — Formation / Éducation —
  | "convention-de-stage"
  | "attestation-de-formation"
  | "programme-de-formation"
  // — Commerce / Logistique —
  | "bon-de-livraison"
  | "note-de-credit"
  // — Créatif / Communication —
  | "brief-creatif"
  | "cession-droits"
  // — Admin général —
  | "compte-rendu-reunion"
  | "rapport"
  | "attestation";

const TYPE_LABELS: Record<DocType, string> = {
  facture: "Facture",
  devis: "Devis",
  contrat: "Contrat de prestation",
  "bon-de-commande": "Bon de commande",
  lettre: "Lettre formelle",
  // Santé
  ordonnance: "Ordonnance",
  "certificat-medical": "Certificat médical",
  "compte-rendu-consultation": "Compte-rendu de consultation",
  "fiche-patient": "Fiche patient",
  // Finance / Comptabilité
  "bilan-comptable": "Bilan comptable",
  "declaration-fiscale": "Déclaration fiscale",
  "rapport-financier": "Rapport financier",
  // Juridique
  "acte-juridique": "Acte juridique",
  "mise-en-demeure": "Mise en demeure",
  procuration: "Procuration",
  // Immobilier
  bail: "Bail locatif",
  "compromis-de-vente": "Compromis de vente",
  "mandat-immobilier": "Mandat immobilier",
  // Tech / IT
  "cahier-des-charges": "Cahier des charges",
  nda: "NDA / Accord de confidentialité",
  "rapport-technique": "Rapport technique",
  // RH / Travail
  "contrat-de-travail": "Contrat de travail",
  "fiche-de-paie": "Fiche de paie",
  avenant: "Avenant au contrat",
  // Formation
  "convention-de-stage": "Convention de stage",
  "attestation-de-formation": "Attestation de formation",
  "programme-de-formation": "Programme de formation",
  // Commerce / Logistique
  "bon-de-livraison": "Bon de livraison",
  "note-de-credit": "Note de crédit (avoir)",
  // Créatif
  "brief-creatif": "Brief créatif",
  "cession-droits": "Cession de droits",
  // Admin
  "compte-rendu-reunion": "Compte-rendu de réunion",
  rapport: "Rapport",
  attestation: "Attestation",
};

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  reference?: string;
};

const today = () => new Date().toISOString().split("T")[0];

// ─── Field components — defined OUTSIDE to avoid remount on each keystroke ─────

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white";

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  optional = false,
  className = "",
}: FieldProps) {
  return (
    <div className={className}>
      <label className="mb-1 flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
        {required && <span className="text-red-400">*</span>}
        {optional && (
          <span className="font-normal text-neutral-400">(optionnel)</span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  optional?: boolean;
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  optional = false,
}: TextAreaProps) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
        {optional && (
          <span className="font-normal text-neutral-400">(optionnel)</span>
        )}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 border-b border-neutral-100 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 first:mt-0 dark:border-neutral-800 dark:text-neutral-500">
      {children}
    </h3>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface DocumentFormProps {
  type: DocType;
  profession?: string | null;
  suggestedFolderName?: string | null;
  nameSuffix?: string | null;
}

type FolderItem = { id: string; name: string; color: string | null };

export function DocumentForm({ type, profession, suggestedFolderName, nameSuffix }: DocumentFormProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    // Sender / Provider / Expéditeur
    senderName: "",
    senderAddress: "",
    senderCity: "",
    senderSiret: "",
    senderVatNumber: "", // Numéro TVA intracommunautaire
    senderEmail: "",
    senderPhone: "",
    // Client / Recipient
    clientName: "",
    clientAddress: "",
    clientCity: "",
    clientEmail: "",
    clientVatNumber: "", // TVA client (B2B)
    // Invoice
    invoiceNumber: "",
    invoiceDate: today(),
    dueDate: "",
    paymentTerms: "Virement bancaire sous 30 jours à compter de la date de facturation.",
    latePaymentPenalty:
      "En cas de retard de paiement, pénalités au taux légal en vigueur + indemnité forfaitaire pour frais de recouvrement : 40 €.",
    // Quote
    quoteNumber: "",
    quoteDate: today(),
    validUntil: "",
    // Contract
    missionTitle: "",
    missionDescription: "",
    startDate: "",
    endDate: "",
    rate: "",
    rateType: "fixed" as "fixed" | "daily" | "hourly",
    paymentSchedule: "",
    obligations: "",
    terminationClause: "",
    // Purchase order
    orderNumber: "",
    orderDate: today(),
    deliveryDate: "",
    buyerName: "",
    buyerAddress: "",
    buyerCity: "",
    buyerEmail: "",
    vendorName: "",
    vendorAddress: "",
    vendorCity: "",
    vendorEmail: "",
    deliveryTerms: "",
    // Letter
    recipientName: "",
    recipientTitle: "", // M. / Mme / Dr. etc.
    recipientAddress: "",
    recipientCity: "",
    city: "",
    date: today(),
    subject: "",
    body: "",
    closing:
      "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    // Shared
    notes: "",

    // ── Santé ──────────────────────────────────────────────────────────────
    prescriberName: "",
    prescriberSpecialty: "",
    prescriberRPPS: "",
    patientFullName: "",
    patientDOB: "",
    patientSSN: "",
    prescriptionDate: today(),
    prescriptionMedications: "",
    prescriptionRenewable: "Non",
    examDate: today(),
    certificatePurpose: "",
    medicalConclusion: "",
    leaveDuration: "",
    consultationDate: today(),
    consultationReason: "",
    clinicalExam: "",
    diagnosis: "",
    treatmentPlan: "",
    nextAppointment: "",
    patientFirstName: "",
    patientPhone: "",
    patientCurrentAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    bloodGroup: "",
    allergies: "",
    ongoingTreatments: "",
    pastHistory: "",

    // ── Finance / Comptabilité ─────────────────────────────────────────────
    fiscalYearStart: "",
    fiscalYearEnd: "",
    totalAssets: "",
    totalLiabilities: "",
    capitalReserves: "",
    fiscalNetResult: "",
    taxType: "TVA",
    taxPeriodStart: "",
    taxPeriodEnd: "",
    taxId: "",
    revenueHT: "",
    vatCollected: "",
    vatDeductible: "",
    vatDue: "",
    reportPeriodLabel: "",
    totalExpenses: "",
    cashflow: "",
    executiveSummaryFinance: "",
    financialPerspectives: "",

    // ── Juridique ──────────────────────────────────────────────────────────
    actDate: today(),
    actLocation: "",
    actContent: "",
    party1Name: "",
    party1Quality: "",
    party1Address: "",
    party2Name: "",
    party2Quality: "",
    party2Address: "",
    signerQuality: "",
    barOrRPPS: "",
    legalSuspensiveConditions: "",
    formalDemandFacts: "",
    formalDemandRequest: "",
    formalDemandDeadline: "",
    formalDemandConsequences: "",
    granterName: "",
    granterDOB: "",
    granterBirthPlace: "",
    granterIDNumber: "",
    granteeName: "",
    granteeDOB: "",
    granteeBirthPlace: "",
    granteeAddress2: "",
    powerObject: "",
    powerDuration: "",
    powerLocation: "",
    powerDate: today(),

    // ── Immobilier ─────────────────────────────────────────────────────────
    tenantName: "",
    tenantCurrentAddress: "",
    tenantPhone: "",
    propertyAddress: "",
    propertyType: "",
    propertySurface: "",
    propertyDPE: "",
    leaseType: "vide",
    leaseDurationMonths: "12",
    leaseStartDate: "",
    rentAmount: "",
    chargesAmount: "",
    depositAmount: "",
    irlIndex: "4,03",
    furnitureList: "",
    buyerNameImmo: "",
    buyerAddressImmo: "",
    buyerEmailImmo: "",
    sellerName: "",
    sellerAddress: "",
    sellerEmail: "",
    propertyDescription: "",
    propertyCadastral: "",
    salePrice: "",
    financingType: "prêt immobilier",
    loanAmount: "",
    loanDurationYears: "20",
    immoSuspensiveConditions: "",
    estimatedActDate: "",
    sequestPercentage: "5",
    notaryName: "",
    agencyName: "",
    agencyCardT: "",
    mandateType: "simple",
    mandatePrice: "",
    mandateFees: "",
    mandateFeesBearer: "vendeur",
    mandateDurationMonths: "3",
    mandateStartDate: "",

    // ── Tech / IT ──────────────────────────────────────────────────────────
    projectName: "",
    projectContext: "",
    functionalScope: "",
    technicalConstraints: "",
    projectTimeline: "",
    projectBudget: "",
    deliverables: "",
    acceptanceCriteria: "",
    projectStakeholders: "",
    ndaContext: "",
    confidentialInfoDef: "",
    ndaDurationYears: "3",
    ndaStartDate: today(),
    ndaExceptions: "",
    reportTitle: "",
    reportContext: "",
    reportMethodology: "",
    reportFindings: "",
    reportAnalysis: "",
    reportRecommendations: "",
    reportConclusion: "",

    // ── RH / Travail ───────────────────────────────────────────────────────
    employerRepresentativeName: "",
    employerSiretRH: "",
    employeeFirstName: "",
    employeeDOB: "",
    employeeBirthPlace: "",
    employeeSSNRH: "",
    contractTypeRH: "CDI",
    cddStartDate: "",
    cddEndDate: "",
    cddReason: "",
    jobTitle: "",
    ccn: "",
    workLocation: "",
    workingHoursWeek: "35",
    grossSalary: "",
    benefitsText: "",
    trialPeriodWeeks: "",
    noticePeriodWeeks: "",
    payPeriodLabel: "",
    workingDays: "",
    overtimeHours: "0",
    grossBase: "",
    socialContributions: "",
    netTaxable: "",
    csgCrds: "",
    netToPay: "",
    paymentDatePay: today(),
    paidLeaveBalance: "",
    contractOriginalDate: "",
    contractModifications: "",
    amendmentEffectDate: "",
    amendmentReason: "",

    // ── Formation / Éducation ──────────────────────────────────────────────
    stagiaireFirstName: "",
    stagiaireSchool: "",
    stagiaireCourse: "",
    stagiaireLevel: "",
    companyTutorName: "",
    schoolSupervisorName: "",
    stageObject: "",
    stageStartDate: "",
    stageEndDate: "",
    stageWeeklyHours: "35",
    stageGratification: "4,35",
    stageSkills: "",
    organizationNDA: "",
    organizationName: "",
    traineeName: "",
    trainingTitle: "",
    trainingObjectives: "",
    trainingStartDate: "",
    trainingEndDate: "",
    trainingHours: "",
    trainingModality: "présentiel",
    trainingLocation: "",
    trainingResult: "",
    certificationObtained: "",
    trainingAudience: "",
    prerequisites: "",
    trainingContent: "",
    trainingMethods: "",
    trainingEvaluation: "",
    trainingPrice: "",
    trainerName: "",

    // ── Commerce / Logistique ──────────────────────────────────────────────
    deliveryNumber: "",
    deliveryDate2: today(),
    relatedOrderNumber: "",
    carrierName: "",
    deliveryItemsList: "",
    deliveryStatus: "Conforme",
    deliveryObservations: "",
    creditNoteNumber: "",
    creditNoteDate: today(),
    relatedInvoiceNumber: "",
    creditReason: "",
    creditItemsList: "",

    // ── Créatif / Communication ────────────────────────────────────────────
    projectManagerName: "",
    briefContext: "",
    campaignObjectives: "",
    targetAudience: "",
    keyMessage: "",
    toneStyle: "",
    formatsAndSupports: "",
    briefBudget: "",
    briefTimeline: "",
    kpis: "",
    graphicConstraints: "",
    workTitle: "",
    workDescription: "",
    workCreationDate: "",
    cedantQuality: "",
    rightsGranted: "",
    rightsTerritories: "France entière",
    rightsDuration: "5 ans",
    compensationAmount: "",

    // ── Admin général ──────────────────────────────────────────────────────
    organizationName2: "",
    meetingTitle: "",
    meetingDate: today(),
    meetingTime: "",
    meetingLocation: "",
    facilitatorName: "",
    attendeesList: "",
    absenteesList: "",
    agendaItems: "",
    minutesContent: "",
    nextMeetingDate: "",
    report2Title: "",
    reportRecipient: "",
    report2Executive: "",
    report2Introduction: "",
    report2Results: "",
    report2Analysis: "",
    report2Recommendations: "",
    report2Conclusion: "",
    attestationIssuerName: "",
    attestationIssuerQuality: "",
    attestationIssuerAddress: "",
    attestationIssuerSiret: "",
    beneficiaryFirstName: "",
    attestationObject: "",
    attestationDateField: today(),
    attestationLocation2: "",
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, vatRate: 20 },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI assist state
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Profession-based folder + filename
  const defaultFileName = nameSuffix
    ? `${TYPE_LABELS[type]}_${nameSuffix}`
    : TYPE_LABELS[type].replace(/ /g, "_");
  const [fileName, setFileName] = useState(defaultFileName);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (!profession) return;
    fetch("/api/folders")
      .then((r) => r.json())
      .then((data: FolderItem[]) => {
        const list = Array.isArray(data) ? data : [];
        setFolders(list);
        if (suggestedFolderName) {
          const match = list.find(
            (f) => f.name.toLowerCase() === suggestedFolderName.toLowerCase()
          );
          if (match) setSelectedFolderId(match.id);
        }
      })
      .catch(() => {});
  }, [profession, suggestedFolderName]);

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ─── Build request payload ─────────────────────────────────────────────────

  function buildData() {
    switch (type) {
      case "facture":
        return {
          invoiceNumber: form.invoiceNumber,
          invoiceDate: form.invoiceDate,
          dueDate: form.dueDate,
          senderName: form.senderName,
          senderAddress: form.senderAddress,
          senderCity: form.senderCity,
          senderSiret: form.senderSiret || undefined,
          senderEmail: form.senderEmail || undefined,
          senderPhone: form.senderPhone || undefined,
          clientName: form.clientName,
          clientAddress: form.clientAddress,
          clientCity: form.clientCity,
          clientEmail: form.clientEmail || undefined,
          items,
          notes: form.notes || undefined,
          paymentTerms: [form.paymentTerms, form.latePaymentPenalty]
            .filter(Boolean)
            .join("\n"),
        };
      case "devis":
        return {
          quoteNumber: form.quoteNumber,
          quoteDate: form.quoteDate,
          validUntil: form.validUntil,
          senderName: form.senderName,
          senderAddress: form.senderAddress,
          senderCity: form.senderCity,
          senderSiret: form.senderSiret || undefined,
          senderEmail: form.senderEmail || undefined,
          senderPhone: form.senderPhone || undefined,
          clientName: form.clientName,
          clientAddress: form.clientAddress,
          clientCity: form.clientCity,
          clientEmail: form.clientEmail || undefined,
          items,
          notes: form.notes || undefined,
        };
      case "contrat":
        return {
          providerName: form.senderName,
          providerAddress: form.senderAddress,
          providerCity: form.senderCity,
          providerSiret: form.senderSiret || undefined,
          providerEmail: form.senderEmail || undefined,
          clientName: form.clientName,
          clientAddress: form.clientAddress,
          clientCity: form.clientCity,
          clientEmail: form.clientEmail || undefined,
          missionTitle: form.missionTitle,
          missionDescription: form.missionDescription || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          rate: form.rate,
          rateType: form.rateType,
          paymentSchedule: form.paymentSchedule || undefined,
          obligations: form.obligations || undefined,
          terminationClause: form.terminationClause || undefined,
        };
      case "bon-de-commande":
        return {
          orderNumber: form.orderNumber,
          orderDate: form.orderDate,
          deliveryDate: form.deliveryDate || undefined,
          buyerName: form.buyerName,
          buyerAddress: form.buyerAddress,
          buyerCity: form.buyerCity,
          buyerEmail: form.buyerEmail || undefined,
          vendorName: form.vendorName,
          vendorAddress: form.vendorAddress,
          vendorCity: form.vendorCity,
          vendorEmail: form.vendorEmail || undefined,
          items,
          deliveryTerms: form.deliveryTerms || undefined,
          notes: form.notes || undefined,
        };
      case "lettre":
        return {
          senderName: form.senderName,
          senderAddress: form.senderAddress,
          senderCity: form.senderCity,
          recipientName: form.recipientName,
          recipientAddress: form.recipientAddress,
          recipientCity: form.recipientCity,
          city: form.city,
          date: form.date,
          subject: form.subject,
          body: form.body,
          closing: form.closing,
        };

      // ── Santé ──────────────────────────────────────────────────────────────
      case "ordonnance":
        return {
          title: "ORDONNANCE MÉDICALE",
          subtitle: `Dr ${form.prescriberName}${form.prescriberSpecialty ? " – " + form.prescriberSpecialty : ""} • ${form.prescriptionDate}`,
          parties: [
            { label: "Médecin prescripteur", lines: [`Dr ${form.prescriberName}`, form.prescriberSpecialty, form.senderAddress, form.senderCity, form.prescriberRPPS ? `N° RPPS : ${form.prescriberRPPS}` : "", form.senderEmail, form.senderPhone] },
            { label: "Patient", lines: [form.patientFullName, form.patientDOB ? `Né(e) le : ${form.patientDOB}` : "", form.patientSSN ? `N° Séc. soc. : ${form.patientSSN}` : ""] },
          ],
          sections: [
            { type: "text" as const, title: "Prescriptions (médicament – posologie – durée)", content: form.prescriptionMedications || "—" },
            { type: "keyval" as const, title: "Informations", pairs: [{ label: "Date", value: form.prescriptionDate }, { label: "Renouvellement autorisé", value: form.prescriptionRenewable }] },
            ...(form.notes ? [{ type: "text" as const, title: "Notes / Recommandations", content: form.notes }] : []),
          ],
          signatures: [{ label: "Signature et cachet du médecin" }],
        };

      case "certificat-medical":
        return {
          title: "CERTIFICAT MÉDICAL",
          subtitle: `Dr ${form.prescriberName}${form.prescriberSpecialty ? " – " + form.prescriberSpecialty : ""} • ${form.examDate}`,
          parties: [
            { label: "Praticien", lines: [`Dr ${form.prescriberName}`, form.prescriberSpecialty, form.senderAddress, form.senderCity, form.prescriberRPPS ? `N° RPPS : ${form.prescriberRPPS}` : "", form.senderEmail] },
            { label: "Concernant", lines: [form.patientFullName, form.patientDOB ? `Né(e) le : ${form.patientDOB}` : ""] },
          ],
          sections: [
            { type: "keyval" as const, title: "Références", pairs: [{ label: "Date d'examen", value: form.examDate }, { label: "Objet du certificat", value: form.certificatePurpose }] },
            { type: "text" as const, title: "Conclusion médicale", content: form.medicalConclusion || "—" },
            ...(form.leaveDuration ? [{ type: "keyval" as const, title: "Arrêt / Restriction", pairs: [{ label: "Durée", value: form.leaveDuration }] }] : []),
            ...(form.notes ? [{ type: "text" as const, title: "Notes", content: form.notes }] : []),
          ],
          signatures: [{ label: "Signature et cachet du médecin" }],
        };

      case "compte-rendu-consultation":
        return {
          title: "COMPTE-RENDU DE CONSULTATION",
          subtitle: `Dr ${form.prescriberName}${form.prescriberSpecialty ? " – " + form.prescriberSpecialty : ""} • ${form.consultationDate}`,
          parties: [
            { label: "Praticien", lines: [`Dr ${form.prescriberName}`, form.prescriberSpecialty, form.senderAddress, form.senderCity, form.prescriberRPPS ? `N° RPPS : ${form.prescriberRPPS}` : ""] },
            { label: "Patient", lines: [form.patientFullName, form.patientDOB ? `Né(e) le : ${form.patientDOB}` : "", form.patientSSN ? `N° SS : ${form.patientSSN}` : ""] },
          ],
          sections: [
            { type: "keyval" as const, title: "Références", pairs: [{ label: "Date de consultation", value: form.consultationDate }, { label: "Motif", value: form.consultationReason }] },
            ...(form.pastHistory ? [{ type: "text" as const, title: "Antécédents", content: form.pastHistory }] : []),
            { type: "text" as const, title: "Examen clinique", content: form.clinicalExam || "—" },
            { type: "text" as const, title: "Diagnostic", content: form.diagnosis || "—" },
            { type: "text" as const, title: "Conduite à tenir / Traitement", content: form.treatmentPlan || "—" },
            ...(form.nextAppointment ? [{ type: "keyval" as const, title: "Suivi", pairs: [{ label: "Prochain rendez-vous", value: form.nextAppointment }] }] : []),
          ],
          signatures: [{ label: "Signature du praticien" }],
        };

      case "fiche-patient":
        return {
          title: "DOSSIER PATIENT",
          subtitle: `${form.patientFullName} ${form.patientFirstName ? form.patientFirstName : ""}`,
          sections: [
            { type: "grid" as const, title: "Informations administratives", items: [{ label: "Nom", value: form.patientFullName }, { label: "Prénom", value: form.patientFirstName }, { label: "Date de naissance", value: form.patientDOB }, { label: "N° Séc. soc.", value: form.patientSSN }, { label: "Adresse", value: form.patientCurrentAddress }, { label: "Téléphone", value: form.patientPhone }, { label: "Email", value: form.senderEmail }, { label: "Groupe sanguin", value: form.bloodGroup }] },
            { type: "keyval" as const, title: "Contact d&apos;urgence", pairs: [{ label: "Nom", value: form.emergencyContactName }, { label: "Téléphone", value: form.emergencyContactPhone }] },
            ...(form.pastHistory ? [{ type: "text" as const, title: "Antécédents médicaux", content: form.pastHistory }] : []),
            ...(form.allergies ? [{ type: "text" as const, title: "Allergies", content: form.allergies }] : []),
            ...(form.ongoingTreatments ? [{ type: "text" as const, title: "Traitements en cours", content: form.ongoingTreatments }] : []),
            ...(form.notes ? [{ type: "text" as const, title: "Notes", content: form.notes }] : []),
          ],
        };

      // ── Finance / Comptabilité ──────────────────────────────────────────────
      case "bilan-comptable":
        return {
          title: "BILAN COMPTABLE",
          subtitle: `${form.senderName} • Exercice ${form.fiscalYearStart} – ${form.fiscalYearEnd}`,
          parties: [{ label: "Entreprise", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : ""] }],
          sections: [
            { type: "keyval" as const, title: "Exercice fiscal", pairs: [{ label: "Début d'exercice", value: form.fiscalYearStart }, { label: "Fin d'exercice", value: form.fiscalYearEnd }] },
            { type: "grid" as const, title: "ACTIF", items: [{ label: "Immobilisations nettes", value: form.totalAssets ? form.totalAssets + " €" : "" }, { label: "Stocks & encours", value: "" }, { label: "Créances clients", value: "" }, { label: "Trésorerie", value: form.cashflow ? form.cashflow + " €" : "" }] },
            { type: "grid" as const, title: "PASSIF", items: [{ label: "Capital & réserves", value: form.capitalReserves ? form.capitalReserves + " €" : "" }, { label: "Résultat de l'exercice", value: form.fiscalNetResult ? form.fiscalNetResult + " €" : "" }, { label: "Dettes fournisseurs", value: form.totalLiabilities ? form.totalLiabilities + " €" : "" }, { label: "Emprunts bancaires", value: "" }] },
            ...(form.notes ? [{ type: "text" as const, title: "Notes de l'expert-comptable", content: form.notes }] : []),
          ],
          signatures: [{ label: "Expert-comptable" }, { label: "Dirigeant(e)" }],
        };

      case "declaration-fiscale":
        return {
          title: `DÉCLARATION ${form.taxType.toUpperCase()}`,
          subtitle: `${form.senderName} • Période : ${form.taxPeriodStart} – ${form.taxPeriodEnd}`,
          parties: [{ label: "Déclarant", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : "", form.taxId ? `N° fiscal : ${form.taxId}` : ""] }],
          sections: [
            { type: "keyval" as const, title: "Références", pairs: [{ label: "Type de déclaration", value: form.taxType }, { label: "Période du", value: form.taxPeriodStart }, { label: "au", value: form.taxPeriodEnd }] },
            { type: "grid" as const, title: "Éléments déclarés", items: [{ label: "Chiffre d'affaires HT", value: form.revenueHT ? form.revenueHT + " €" : "" }, { label: "TVA collectée", value: form.vatCollected ? form.vatCollected + " €" : "" }, { label: "TVA déductible", value: form.vatDeductible ? form.vatDeductible + " €" : "" }, { label: "TVA à payer / à rembourser", value: form.vatDue ? form.vatDue + " €" : "" }] },
            ...(form.notes ? [{ type: "text" as const, title: "Observations", content: form.notes }] : []),
          ],
          signatures: [{ label: "Signature du déclarant" }],
        };

      case "rapport-financier":
        return {
          title: "RAPPORT FINANCIER",
          subtitle: `${form.senderName} • ${form.reportPeriodLabel || "Période non renseignée"}`,
          parties: [{ label: "Entreprise", lines: [form.senderName, form.senderAddress, form.senderCity] }],
          sections: [
            ...(form.executiveSummaryFinance ? [{ type: "text" as const, title: "Résumé exécutif", content: form.executiveSummaryFinance }] : []),
            { type: "grid" as const, title: "Indicateurs clés", items: [{ label: "Chiffre d'affaires HT", value: form.revenueHT ? form.revenueHT + " €" : "" }, { label: "Total charges", value: form.totalExpenses ? form.totalExpenses + " €" : "" }, { label: "Résultat net", value: form.fiscalNetResult ? form.fiscalNetResult + " €" : "" }, { label: "Trésorerie disponible", value: form.cashflow ? form.cashflow + " €" : "" }] },
            ...(form.financialPerspectives ? [{ type: "text" as const, title: "Perspectives et analyse", content: form.financialPerspectives }] : []),
            ...(form.notes ? [{ type: "text" as const, title: "Notes", content: form.notes }] : []),
          ],
          signatures: [{ label: "Directeur financier / DAF" }, { label: "Dirigeant(e)" }],
        };

      // ── Juridique ──────────────────────────────────────────────────────────
      case "acte-juridique":
        return {
          title: "ACTE JURIDIQUE",
          subtitle: `${form.signerQuality || "Officier ministériel"} • ${form.actDate}`,
          parties: [
            { label: form.party1Quality || "Première partie", lines: [form.party1Name, form.party1Address] },
            { label: form.party2Quality || "Seconde partie", lines: [form.party2Name, form.party2Address] },
          ],
          sections: [
            { type: "keyval" as const, title: "Références de l'acte", pairs: [{ label: "Rédacteur", value: `${form.senderName}${form.signerQuality ? ", " + form.signerQuality : ""}` }, { label: "N° inscription / Barreau", value: form.barOrRPPS }, { label: "Date", value: form.actDate }, { label: "Lieu", value: form.actLocation }] },
            { type: "text" as const, title: "Objet et contenu de l'acte", content: form.actContent || "—" },
            ...(form.legalSuspensiveConditions ? [{ type: "text" as const, title: "Conditions suspensives", content: form.legalSuspensiveConditions }] : []),
            ...(form.notes ? [{ type: "text" as const, title: "Mentions légales", content: form.notes }] : []),
          ],
          signatures: [{ label: `Signature – ${form.party1Name || "Partie 1"}` }, { label: `Signature – ${form.party2Name || "Partie 2"}` }, { label: form.signerQuality || "Officier ministériel" }],
        };

      case "mise-en-demeure":
        return {
          title: "MISE EN DEMEURE",
          subtitle: `${form.senderName} → ${form.recipientName} • ${form.date}`,
          parties: [
            { label: "Expéditeur", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderEmail] },
            { label: "Destinataire", lines: [form.recipientName, form.recipientAddress, form.recipientCity] },
          ],
          sections: [
            { type: "keyval" as const, title: "En-tête", pairs: [{ label: "Lieu", value: form.city }, { label: "Date", value: form.date }, { label: "Objet", value: form.subject || "Mise en demeure" }] },
            { type: "text" as const, title: "Rappel des faits", content: form.formalDemandFacts || "—" },
            { type: "text" as const, title: "Demande formelle", content: form.formalDemandRequest || "—" },
            { type: "keyval" as const, title: "Délai et conséquences", pairs: [{ label: "Délai accordé", value: form.formalDemandDeadline }, { label: "Conséquences en cas de non-exécution", value: form.formalDemandConsequences || "Saisine des juridictions compétentes" }] },
            { type: "text" as const, title: "Formule de clôture", content: "À défaut d'exécution dans le délai imparti, je me verrai dans l'obligation d'engager toutes les procédures judiciaires et/ou amiables nécessaires à la défense de mes intérêts.\n\nJe vous prie de recevoir, Madame, Monsieur, l'expression de mes salutations distinguées." },
          ],
          signatures: [{ label: "Signature de l'expéditeur" }],
        };

      case "procuration":
        return {
          title: "PROCURATION",
          subtitle: `${form.granterName} → ${form.granteeName} • ${form.powerDate}`,
          parties: [
            { label: "Mandant (donne pouvoir)", lines: [form.granterName, form.granterDOB ? `Né(e) le : ${form.granterDOB}` : "", form.granterBirthPlace ? `à ${form.granterBirthPlace}` : "", form.senderAddress, form.senderCity, form.granterIDNumber ? `Pièce d'identité : ${form.granterIDNumber}` : ""] },
            { label: "Mandataire (reçoit pouvoir)", lines: [form.granteeName, form.granteeDOB ? `Né(e) le : ${form.granteeDOB}` : "", form.granteeBirthPlace ? `à ${form.granteeBirthPlace}` : "", form.granteeAddress2] },
          ],
          sections: [
            { type: "text" as const, title: "Objet de la procuration", content: form.powerObject || "—" },
            { type: "keyval" as const, title: "Conditions", pairs: [{ label: "Durée / validité", value: form.powerDuration || "Non limitée" }, { label: "Lieu", value: form.powerLocation }, { label: "Date", value: form.powerDate }] },
            { type: "text" as const, title: "Déclaration", content: `Je soussigné(e) ${form.granterName}, donne par la présente procuration tous pouvoirs à ${form.granteeName} pour agir en mon nom et pour mon compte dans le cadre défini ci-dessus.\n\nCette procuration est établie de bonne foi et en toute connaissance de cause.` },
          ],
          signatures: [{ label: `Signature du mandant – ${form.granterName}` }, { label: `Signature du mandataire – ${form.granteeName}` }],
        };

      // ── Immobilier ──────────────────────────────────────────────────────────
      case "bail":
        return {
          title: form.leaseType === "meublé" ? "CONTRAT DE LOCATION MEUBLÉE" : form.leaseType === "commercial" ? "BAIL COMMERCIAL" : "CONTRAT DE LOCATION VIDE",
          subtitle: `${form.senderName} → ${form.tenantName} • Début : ${form.leaseStartDate}`,
          parties: [
            { label: "Bailleur", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : "", form.senderEmail, form.senderPhone] },
            { label: "Locataire(s)", lines: [form.tenantName, form.tenantCurrentAddress, form.tenantPhone, form.clientEmail] },
          ],
          sections: [
            { type: "keyval" as const, title: "Bien loué", pairs: [{ label: "Adresse", value: form.propertyAddress }, { label: "Type / Description", value: form.propertyType }, { label: "Surface habitable", value: form.propertySurface ? form.propertySurface + " m²" : "" }, { label: "Classe DPE", value: form.propertyDPE }] },
            { type: "grid" as const, title: "Conditions financières", items: [{ label: "Type de bail", value: form.leaseType }, { label: "Durée", value: form.leaseDurationMonths + " mois" }, { label: "Date de début", value: form.leaseStartDate }, { label: "Loyer mensuel HC", value: form.rentAmount ? form.rentAmount + " €" : "" }, { label: "Provisions sur charges", value: form.chargesAmount ? form.chargesAmount + " €" : "" }, { label: "Dépôt de garantie", value: form.depositAmount ? form.depositAmount + " €" : "" }] },
            ...(form.leaseType === "meublé" && form.furnitureList ? [{ type: "text" as const, title: "Inventaire du mobilier", content: form.furnitureList }] : []),
            { type: "text" as const, title: "Révision du loyer", content: `Le loyer est révisable annuellement selon l'Indice de Référence des Loyers (IRL). Dernier IRL connu : ${form.irlIndex}.` },
            ...(form.notes ? [{ type: "text" as const, title: "Clauses particulières", content: form.notes }] : []),
          ],
          signatures: [{ label: "Signature du bailleur" }, { label: "Signature du locataire" }],
        };

      case "compromis-de-vente":
        return {
          title: "COMPROMIS DE VENTE",
          subtitle: `${form.sellerName} → ${form.buyerNameImmo} • ${form.actDate}`,
          parties: [
            { label: "Vendeur", lines: [form.sellerName, form.sellerAddress, form.sellerEmail] },
            { label: "Acquéreur", lines: [form.buyerNameImmo, form.buyerAddressImmo, form.buyerEmailImmo] },
          ],
          sections: [
            { type: "text" as const, title: "Bien immobilier", content: `${form.propertyDescription || "—"}\nAdresse : ${form.propertyAddress}\nRéférence cadastrale : ${form.propertyCadastral || "À compléter"}` },
            { type: "grid" as const, title: "Conditions financières", items: [{ label: "Prix de vente", value: form.salePrice ? form.salePrice + " €" : "" }, { label: "Financement", value: form.financingType }, { label: "Montant emprunté", value: form.loanAmount ? form.loanAmount + " €" : "" }, { label: "Durée du prêt", value: form.loanDurationYears ? form.loanDurationYears + " ans" : "" }, { label: "Séquestre (dépôt de garantie)", value: form.sequestPercentage ? form.sequestPercentage + "% du prix" : "" }, { label: "Notaire", value: form.notaryName }] },
            { type: "text" as const, title: "Conditions suspensives", content: form.immoSuspensiveConditions || "Obtention du prêt immobilier dans un délai de 45 jours. Absence de servitudes non déclarées." },
            { type: "keyval" as const, title: "Calendrier", pairs: [{ label: "Date de signature de l'acte authentique prévue", value: form.estimatedActDate }] },
            ...(form.notes ? [{ type: "text" as const, title: "Clauses particulières", content: form.notes }] : []),
          ],
          signatures: [{ label: `Vendeur – ${form.sellerName}` }, { label: `Acquéreur – ${form.buyerNameImmo}` }],
        };

      case "mandat-immobilier":
        return {
          title: form.mandateType === "exclusif" ? "MANDAT EXCLUSIF DE VENTE" : "MANDAT SIMPLE DE VENTE",
          subtitle: `${form.agencyName} • Début : ${form.mandateStartDate}`,
          parties: [
            { label: "Mandant (propriétaire)", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderEmail] },
            { label: "Mandataire (agence)", lines: [form.agencyName, form.senderAddress, form.senderCity, form.agencyCardT ? `Carte T : ${form.agencyCardT}` : ""] },
          ],
          sections: [
            { type: "keyval" as const, title: "Bien concerné", pairs: [{ label: "Adresse", value: form.propertyAddress }, { label: "Description", value: form.propertyType }, { label: "Surface", value: form.propertySurface ? form.propertySurface + " m²" : "" }] },
            { type: "grid" as const, title: "Conditions du mandat", items: [{ label: "Type de mandat", value: form.mandateType }, { label: "Prix de vente souhaité", value: form.mandatePrice ? form.mandatePrice + " €" : "" }, { label: "Honoraires TTC", value: form.mandateFees ? form.mandateFees + " €" : "" }, { label: "À la charge de", value: form.mandateFeesBearer }, { label: "Durée du mandat", value: form.mandateDurationMonths + " mois" }, { label: "Date de début", value: form.mandateStartDate }] },
            { type: "text" as const, title: "Obligations du mandataire", content: "L'agence s'engage à effectuer toutes les démarches nécessaires à la vente du bien, conformément aux dispositions de la loi Hoguet et de son décret d'application." },
            ...(form.notes ? [{ type: "text" as const, title: "Clauses particulières", content: form.notes }] : []),
          ],
          signatures: [{ label: "Signature du mandant" }, { label: "Signature du mandataire" }],
        };

      // ── Tech / IT ──────────────────────────────────────────────────────────
      case "cahier-des-charges":
        return {
          title: "CAHIER DES CHARGES",
          subtitle: `${form.projectName || "Projet"} • ${form.senderName} → ${form.clientName}`,
          parties: [
            { label: "Maître d&apos;ouvrage (client)", lines: [form.clientName, form.clientAddress, form.clientCity, form.clientEmail] },
            { label: "Maître d&apos;œuvre (prestataire)", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderEmail] },
          ],
          sections: [
            { type: "text" as const, title: "Contexte et objectifs", content: form.projectContext || "—" },
            { type: "text" as const, title: "Périmètre fonctionnel", content: form.functionalScope || "—" },
            { type: "text" as const, title: "Contraintes techniques", content: form.technicalConstraints || "—" },
            { type: "text" as const, title: "Livrables attendus", content: form.deliverables || "—" },
            { type: "text" as const, title: "Critères d'acceptation", content: form.acceptanceCriteria || "—" },
            { type: "grid" as const, title: "Cadrage", items: [{ label: "Nom du projet", value: form.projectName }, { label: "Budget indicatif HT", value: form.projectBudget ? form.projectBudget + " €" : "" }, { label: "Planning prévisionnel", value: form.projectTimeline }, { label: "Interlocuteurs clés", value: form.projectStakeholders }] },
            ...(form.notes ? [{ type: "text" as const, title: "Notes complémentaires", content: form.notes }] : []),
          ],
          signatures: [{ label: "Validation client" }, { label: "Validation prestataire" }],
        };

      case "nda":
        return {
          title: "ACCORD DE CONFIDENTIALITÉ (NDA)",
          subtitle: `${form.senderName} ↔ ${form.clientName} • ${form.ndaStartDate}`,
          parties: [
            { label: "Partie divulgatrice", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : "", form.senderEmail] },
            { label: "Partie réceptrice", lines: [form.clientName, form.clientAddress, form.clientCity, form.clientEmail] },
          ],
          sections: [
            { type: "text" as const, title: "Contexte", content: form.ndaContext || "Dans le cadre d'un projet de collaboration, les parties sont amenées à échanger des informations confidentielles." },
            { type: "text" as const, title: "Définition des informations confidentielles", content: form.confidentialInfoDef || "Toute information technique, commerciale, financière ou stratégique, quelle que soit la forme de sa divulgation (écrite, orale, électronique)." },
            { type: "keyval" as const, title: "Conditions de l'accord", pairs: [{ label: "Date de début", value: form.ndaStartDate }, { label: "Durée de l'obligation de confidentialité", value: form.ndaDurationYears + " ans" }] },
            ...(form.ndaExceptions ? [{ type: "text" as const, title: "Exceptions à la confidentialité", content: form.ndaExceptions }] : []),
            { type: "text" as const, title: "Obligations des parties", content: "Chaque partie s'engage à ne pas divulguer les informations confidentielles à des tiers sans accord préalable écrit de l'autre partie, et à les utiliser uniquement dans le cadre du projet défini ci-dessus." },
            { type: "text" as const, title: "Droit applicable", content: "Le présent accord est soumis au droit français. Tout litige sera soumis aux juridictions compétentes de Paris." },
          ],
          signatures: [{ label: "Partie divulgatrice" }, { label: "Partie réceptrice" }],
        };

      case "rapport-technique":
        return {
          title: "RAPPORT TECHNIQUE",
          subtitle: `${form.reportTitle || "Rapport"} • ${form.senderName}`,
          parties: [
            { label: "Auteur", lines: [form.senderName, form.senderEmail] },
            { label: "Commanditaire / Client", lines: [form.clientName, form.clientEmail] },
          ],
          sections: [
            { type: "text" as const, title: "Contexte et objectif", content: form.reportContext || "—" },
            { type: "text" as const, title: "Méthodologie", content: form.reportMethodology || "—" },
            { type: "text" as const, title: "Constats et résultats", content: form.reportFindings || "—" },
            { type: "text" as const, title: "Analyse", content: form.reportAnalysis || "—" },
            { type: "text" as const, title: "Recommandations", content: form.reportRecommendations || "—" },
            { type: "text" as const, title: "Conclusion", content: form.reportConclusion || "—" },
            ...(form.notes ? [{ type: "text" as const, title: "Annexes", content: form.notes }] : []),
          ],
          signatures: [{ label: "Auteur du rapport" }],
        };

      // ── RH / Travail ────────────────────────────────────────────────────────
      case "contrat-de-travail":
        return {
          title: form.contractTypeRH === "CDD" ? "CONTRAT À DURÉE DÉTERMINÉE (CDD)" : "CONTRAT À DURÉE INDÉTERMINÉE (CDI)",
          subtitle: `${form.senderName} → ${form.employeeFirstName} ${form.clientName}`,
          parties: [
            { label: "Employeur", lines: [form.senderName, form.senderAddress, form.senderCity, form.employerSiretRH ? `SIRET : ${form.employerSiretRH}` : "", `Représenté par : ${form.employerRepresentativeName}`] },
            { label: "Salarié(e)", lines: [`${form.employeeFirstName} ${form.clientName}`, form.employeeDOB ? `Né(e) le : ${form.employeeDOB} à ${form.employeeBirthPlace}` : "", form.clientAddress, form.employeeSSNRH ? `N° SS : ${form.employeeSSNRH}` : ""] },
          ],
          sections: [
            { type: "grid" as const, title: "Poste et conditions de travail", items: [{ label: "Intitulé du poste", value: form.jobTitle }, { label: "Convention collective (CCN)", value: form.ccn }, { label: "Lieu de travail", value: form.workLocation }, { label: "Durée hebdomadaire", value: form.workingHoursWeek + "h" }, { label: "Salaire brut mensuel", value: form.grossSalary ? form.grossSalary + " €" : "" }, { label: "Type de contrat", value: form.contractTypeRH }] },
            ...(form.contractTypeRH === "CDD" ? [{ type: "keyval" as const, title: "Détails CDD", pairs: [{ label: "Date de début", value: form.cddStartDate }, { label: "Date de fin", value: form.cddEndDate }, { label: "Motif de recours au CDD", value: form.cddReason }] }] : []),
            { type: "keyval" as const, title: "Période d'essai et préavis", pairs: [{ label: "Période d'essai", value: form.trialPeriodWeeks ? form.trialPeriodWeeks + " semaines" : "Non applicable" }, { label: "Durée du préavis", value: form.noticePeriodWeeks ? form.noticePeriodWeeks + " semaines" : "Selon CCN" }] },
            ...(form.benefitsText ? [{ type: "text" as const, title: "Avantages et compléments", content: form.benefitsText }] : []),
            { type: "text" as const, title: "Dispositions légales", content: "Le présent contrat est soumis aux dispositions du Code du travail français" + (form.ccn ? ` et à la convention collective ${form.ccn}` : "") + ". Le salarié s'engage à respecter le règlement intérieur de l'entreprise." },
            ...(form.notes ? [{ type: "text" as const, title: "Clauses particulières", content: form.notes }] : []),
          ],
          signatures: [{ label: "L'employeur" }, { label: "Le/La salarié(e)" }],
        };

      case "fiche-de-paie":
        return {
          title: "BULLETIN DE PAIE",
          subtitle: `${form.senderName} • ${form.payPeriodLabel}`,
          parties: [
            { label: "Employeur", lines: [form.senderName, form.senderAddress, form.senderCity, form.employerSiretRH ? `SIRET : ${form.employerSiretRH}` : ""] },
            { label: "Salarié(e)", lines: [`${form.employeeFirstName} ${form.clientName}`, form.jobTitle, form.employeeSSNRH ? `N° SS : ${form.employeeSSNRH}` : ""] },
          ],
          sections: [
            { type: "keyval" as const, title: "Période", pairs: [{ label: "Période de paie", value: form.payPeriodLabel }, { label: "Jours travaillés", value: form.workingDays }, { label: "Heures supplémentaires", value: form.overtimeHours + "h" }] },
            { type: "grid" as const, title: "Éléments de rémunération", items: [{ label: "Salaire brut de base", value: form.grossBase ? form.grossBase + " €" : "" }, { label: "Cotisations salariales", value: form.socialContributions ? form.socialContributions + " €" : "" }, { label: "Net imposable", value: form.netTaxable ? form.netTaxable + " €" : "" }, { label: "CSG/CRDS", value: form.csgCrds ? form.csgCrds + " €" : "" }, { label: "NET À PAYER", value: form.netToPay ? form.netToPay + " €" : "" }, { label: "Date de virement", value: form.paymentDatePay }] },
            { type: "keyval" as const, title: "Congés payés", pairs: [{ label: "Solde de congés", value: form.paidLeaveBalance }] },
            { type: "text" as const, title: "Mention légale", content: "À conserver sans limitation de durée (article L. 3243-4 du Code du travail)." },
          ],
        };

      case "avenant":
        return {
          title: "AVENANT AU CONTRAT DE TRAVAIL",
          subtitle: `${form.senderName} → ${form.employeeFirstName} ${form.clientName}`,
          parties: [
            { label: "Employeur", lines: [form.senderName, form.senderAddress, form.senderCity, `Représenté par : ${form.employerRepresentativeName}`] },
            { label: "Salarié(e)", lines: [`${form.employeeFirstName} ${form.clientName}`, form.jobTitle] },
          ],
          sections: [
            { type: "keyval" as const, title: "Références", pairs: [{ label: "Contrat initial du", value: form.contractOriginalDate }, { label: "Prise d'effet de l'avenant", value: form.amendmentEffectDate }, { label: "Motif", value: form.amendmentReason }] },
            { type: "text" as const, title: "Modifications apportées", content: form.contractModifications || "—" },
            { type: "text" as const, title: "Dispositions inchangées", content: "Toutes les autres clauses et conditions du contrat de travail initial demeurent inchangées et continuent à s'appliquer." },
          ],
          signatures: [{ label: "L'employeur" }, { label: "Le/La salarié(e) (Lu et approuvé)" }],
        };

      // ── Formation ───────────────────────────────────────────────────────────
      case "convention-de-stage":
        return {
          title: "CONVENTION DE STAGE",
          subtitle: `${form.stagiaireFirstName} ${form.clientName} • ${form.stageStartDate} – ${form.stageEndDate}`,
          sections: [
            { type: "grid" as const, title: "Parties à la convention", items: [{ label: "Établissement d'enseignement", value: form.stagiaireSchool }, { label: "Responsable pédagogique", value: form.schoolSupervisorName }, { label: "Entreprise d'accueil", value: form.senderName }, { label: "Tuteur entreprise", value: form.companyTutorName }, { label: "SIRET de l'entreprise", value: form.senderSiret }, { label: "Stagiaire", value: `${form.stagiaireFirstName} ${form.clientName}` }] },
            { type: "keyval" as const, title: "Détails du stage", pairs: [{ label: "Objet du stage", value: form.stageObject }, { label: "Filière / Niveau", value: `${form.stagiaireCourse} – ${form.stagiaireLevel}` }, { label: "Adresse du lieu de stage", value: form.workLocation || form.senderAddress }, { label: "Date de début", value: form.stageStartDate }, { label: "Date de fin", value: form.stageEndDate }, { label: "Durée hebdomadaire", value: form.stageWeeklyHours + "h" }] },
            { type: "keyval" as const, title: "Gratification (art. L. 124-6 du Code de l'éducation)", pairs: [{ label: "Montant horaire", value: form.stageGratification ? form.stageGratification + " €/h (min. légal)" : "Inférieure ou égale à 2 mois – exonérée" }] },
            ...(form.stageSkills ? [{ type: "text" as const, title: "Compétences à acquérir", content: form.stageSkills }] : []),
            ...(form.notes ? [{ type: "text" as const, title: "Clauses particulières", content: form.notes }] : []),
          ],
          signatures: [{ label: "L'établissement d'enseignement" }, { label: "L'entreprise d'accueil" }, { label: "Le/La stagiaire" }],
        };

      case "attestation-de-formation":
        return {
          title: "ATTESTATION DE FORMATION",
          subtitle: `${form.organizationName} • ${form.trainingStartDate} – ${form.trainingEndDate}`,
          parties: [
            { label: "Organisme de formation", lines: [form.organizationName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : "", form.organizationNDA ? `N° déclaration d'activité : ${form.organizationNDA}` : ""] },
            { label: "Bénéficiaire", lines: [form.traineeName] },
          ],
          sections: [
            { type: "keyval" as const, title: "Formation suivie", pairs: [{ label: "Intitulé", value: form.trainingTitle }, { label: "Objectifs pédagogiques", value: form.trainingObjectives }, { label: "Dates", value: `${form.trainingStartDate} au ${form.trainingEndDate}` }, { label: "Durée totale", value: form.trainingHours ? form.trainingHours + " heures" : "" }, { label: "Modalité", value: form.trainingModality }, { label: "Lieu", value: form.trainingLocation }] },
            ...(form.trainingResult ? [{ type: "keyval" as const, title: "Résultats", pairs: [{ label: "Évaluation / Résultat", value: form.trainingResult }, { label: "Certification obtenue", value: form.certificationObtained || "Non certifiante" }] }] : []),
            { type: "text" as const, title: "Attestation", content: `L'organisme de formation ${form.organizationName} atteste que ${form.traineeName} a suivi la formation « ${form.trainingTitle} » dans son intégralité.` },
          ],
          signatures: [{ label: "Le/La responsable pédagogique" }],
        };

      case "programme-de-formation":
        return {
          title: "PROGRAMME DE FORMATION",
          subtitle: `${form.trainingTitle} • ${form.organizationName}`,
          parties: [
            { label: "Organisme de formation", lines: [form.organizationName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : "", form.organizationNDA ? `N° DA : ${form.organizationNDA}` : ""] },
          ],
          sections: [
            { type: "grid" as const, title: "Informations générales", items: [{ label: "Intitulé", value: form.trainingTitle }, { label: "Public cible", value: form.trainingAudience }, { label: "Prérequis", value: form.prerequisites || "Aucun" }, { label: "Durée totale", value: form.trainingHours ? form.trainingHours + " heures" : "" }, { label: "Modalité", value: form.trainingModality }, { label: "Prix HT", value: form.trainingPrice ? form.trainingPrice + " €" : "" }] },
            { type: "text" as const, title: "Objectifs pédagogiques", content: form.trainingObjectives || "—" },
            { type: "text" as const, title: "Contenu et programme", content: form.trainingContent || "—" },
            { type: "keyval" as const, title: "Méthodes et évaluation", pairs: [{ label: "Méthodes pédagogiques", value: form.trainingMethods }, { label: "Modalités d'évaluation", value: form.trainingEvaluation }, { label: "Formateur(trice)", value: form.trainerName }] },
          ],
        };

      // ── Commerce / Logistique ───────────────────────────────────────────────
      case "bon-de-livraison":
        return {
          title: "BON DE LIVRAISON",
          subtitle: `N° ${form.deliveryNumber} • ${form.deliveryDate2}`,
          parties: [
            { label: "Expéditeur / Vendeur", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderEmail] },
            { label: "Destinataire / Réceptionnaire", lines: [form.clientName, form.clientAddress, form.clientCity, form.clientEmail] },
          ],
          sections: [
            { type: "keyval" as const, title: "Références", pairs: [{ label: "N° bon de livraison", value: form.deliveryNumber }, { label: "Date de livraison", value: form.deliveryDate2 }, { label: "N° commande associé", value: form.relatedOrderNumber }, { label: "Transporteur", value: form.carrierName }] },
            { type: "text" as const, title: "Articles livrés (désignation – qté commandée – qté livrée)", content: form.deliveryItemsList || "—" },
            { type: "keyval" as const, title: "État de la livraison", pairs: [{ label: "Livraison", value: form.deliveryStatus }, { label: "Observations / Réserves", value: form.deliveryObservations || "Néant" }] },
          ],
          signatures: [{ label: "Émetteur" }, { label: "Signature du réceptionnaire" }],
        };

      case "note-de-credit":
        return {
          title: "NOTE DE CRÉDIT (AVOIR)",
          subtitle: `N° ${form.creditNoteNumber} • ${form.creditNoteDate}`,
          parties: [
            { label: "Émetteur", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : "", form.senderEmail] },
            { label: "Client", lines: [form.clientName, form.clientAddress, form.clientCity, form.clientEmail] },
          ],
          sections: [
            { type: "keyval" as const, title: "Références", pairs: [{ label: "N° d'avoir", value: form.creditNoteNumber }, { label: "Date", value: form.creditNoteDate }, { label: "Réf. facture d'origine", value: form.relatedInvoiceNumber }, { label: "Motif de l'avoir", value: form.creditReason }] },
            { type: "text" as const, title: "Articles / Prestations crédités (désignation – qté – PU HT – TVA)", content: form.creditItemsList || "—" },
            ...(form.notes ? [{ type: "text" as const, title: "Notes", content: form.notes }] : []),
          ],
          signatures: [{ label: "Signature de l'émetteur" }],
        };

      // ── Créatif / Communication ─────────────────────────────────────────────
      case "brief-creatif":
        return {
          title: "BRIEF CRÉATIF",
          subtitle: `${form.senderName} → ${form.clientName} • ${form.date}`,
          parties: [
            { label: "Annonceur / Client", lines: [form.clientName, form.clientAddress, form.clientEmail] },
            { label: "Agence / Prestataire créatif", lines: [form.senderName, form.senderEmail] },
          ],
          sections: [
            { type: "text" as const, title: "Contexte et problématique", content: form.briefContext || "—" },
            { type: "text" as const, title: "Objectifs de la campagne", content: form.campaignObjectives || "—" },
            { type: "text" as const, title: "Cible et audience", content: form.targetAudience || "—" },
            { type: "text" as const, title: "Message clé et promesse", content: form.keyMessage || "—" },
            { type: "text" as const, title: "Ton, style et références", content: form.toneStyle || "—" },
            { type: "keyval" as const, title: "Cadrage", pairs: [{ label: "Formats et supports", value: form.formatsAndSupports }, { label: "Budget", value: form.briefBudget ? form.briefBudget + " €" : "" }, { label: "Planning / Délais", value: form.briefTimeline }, { label: "KPIs attendus", value: form.kpis }, { label: "Contraintes graphiques", value: form.graphicConstraints }] },
            ...(form.notes ? [{ type: "text" as const, title: "Notes complémentaires", content: form.notes }] : []),
          ],
          signatures: [{ label: "Validation client" }, { label: "Chargé(e) de projet" }],
        };

      case "cession-droits":
        return {
          title: "CONTRAT DE CESSION DE DROITS",
          subtitle: `${form.senderName} → ${form.clientName} • ${form.date}`,
          parties: [
            { label: "Cédant (auteur / créateur)", lines: [form.senderName, form.senderAddress, form.senderCity, form.senderSiret ? `SIRET : ${form.senderSiret}` : "", `Qualité : ${form.cedantQuality || "Auteur"}`] },
            { label: "Cessionnaire (bénéficiaire)", lines: [form.clientName, form.clientAddress, form.clientCity, form.clientEmail] },
          ],
          sections: [
            { type: "keyval" as const, title: "Œuvre concernée", pairs: [{ label: "Titre / Dénomination", value: form.workTitle }, { label: "Nature de l'œuvre", value: form.workDescription }, { label: "Date de création", value: form.workCreationDate }] },
            { type: "grid" as const, title: "Droits cédés", items: [{ label: "Droits cédés", value: form.rightsGranted || "Reproduction, représentation" }, { label: "Territoire", value: form.rightsTerritories }, { label: "Durée", value: form.rightsDuration }, { label: "Contrepartie", value: form.compensationAmount ? form.compensationAmount + " € TTC" : "Gratuit" }] },
            { type: "text" as const, title: "Droit moral", content: "Conformément au Code de la Propriété Intellectuelle (CPI), le cédant conserve son droit moral sur l'œuvre. Le cessionnaire s'engage à mentionner le nom de l'auteur à chaque exploitation de l'œuvre." },
            { type: "text" as const, title: "Droit applicable", content: "Le présent contrat est soumis au droit français et notamment aux dispositions du Code de la Propriété Intellectuelle. Tout litige sera soumis aux juridictions compétentes françaises." },
            ...(form.notes ? [{ type: "text" as const, title: "Clauses particulières", content: form.notes }] : []),
          ],
          signatures: [{ label: "Le cédant" }, { label: "Le cessionnaire" }],
        };

      // ── Admin général ───────────────────────────────────────────────────────
      case "compte-rendu-reunion":
        return {
          title: "COMPTE-RENDU DE RÉUNION",
          subtitle: `${form.meetingTitle || "Réunion"} • ${form.meetingDate}`,
          parties: [{ label: "Organisation", lines: [form.organizationName2] }],
          sections: [
            { type: "grid" as const, title: "Informations générales", items: [{ label: "Titre de la réunion", value: form.meetingTitle }, { label: "Date", value: form.meetingDate }, { label: "Heure", value: form.meetingTime }, { label: "Lieu / Lien", value: form.meetingLocation }, { label: "Animateur(trice)", value: form.facilitatorName }] },
            { type: "keyval" as const, title: "Participants", pairs: [{ label: "Présents", value: form.attendeesList }, { label: "Excusés", value: form.absenteesList || "Néant" }] },
            ...(form.agendaItems ? [{ type: "text" as const, title: "Ordre du jour", content: form.agendaItems }] : []),
            { type: "text" as const, title: "Points discutés, décisions et actions", content: form.minutesContent || "—" },
            ...(form.nextMeetingDate ? [{ type: "keyval" as const, title: "Prochaine réunion", pairs: [{ label: "Date prévue", value: form.nextMeetingDate }] }] : []),
          ],
          signatures: [{ label: "Animateur(trice) de séance" }, { label: "Approbation" }],
        };

      case "rapport":
        return {
          title: form.report2Title ? form.report2Title.toUpperCase() : "RAPPORT",
          subtitle: `${form.senderName} → ${form.reportRecipient}`,
          parties: [
            { label: "Auteur(s)", lines: [form.senderName, form.senderEmail] },
            { label: "Destinataire(s)", lines: [form.reportRecipient] },
          ],
          sections: [
            ...(form.report2Executive ? [{ type: "text" as const, title: "Résumé exécutif", content: form.report2Executive }] : []),
            { type: "text" as const, title: "Introduction / Contexte", content: form.report2Introduction || "—" },
            { type: "text" as const, title: "Résultats et constats", content: form.report2Results || "—" },
            { type: "text" as const, title: "Analyse", content: form.report2Analysis || "—" },
            { type: "text" as const, title: "Recommandations", content: form.report2Recommendations || "—" },
            { type: "text" as const, title: "Conclusion", content: form.report2Conclusion || "—" },
            ...(form.notes ? [{ type: "text" as const, title: "Annexes", content: form.notes }] : []),
          ],
          signatures: [{ label: "Auteur du rapport" }],
        };

      case "attestation":
        return {
          title: "ATTESTATION",
          subtitle: `${form.attestationIssuerName} • ${form.attestationDateField}`,
          parties: [
            { label: "Émetteur", lines: [form.attestationIssuerName, form.attestationIssuerQuality, form.attestationIssuerAddress, form.attestationIssuerSiret ? `SIRET : ${form.attestationIssuerSiret}` : ""] },
            { label: "Bénéficiaire", lines: [`${form.beneficiaryFirstName} ${form.clientName}`] },
          ],
          sections: [
            { type: "text" as const, title: "Objet de l'attestation", content: `Je soussigné(e) ${form.attestationIssuerName}${form.attestationIssuerQuality ? ", " + form.attestationIssuerQuality : ""}, atteste que :\n\n${form.attestationObject || "—"}` },
            { type: "keyval" as const, title: "Établie à", pairs: [{ label: "Lieu", value: form.attestationLocation2 }, { label: "Date", value: form.attestationDateField }] },
            { type: "text" as const, title: "Mention légale", content: "La présente attestation est établie pour servir et valoir ce que de droit." },
          ],
          signatures: [{ label: `Signature – ${form.attestationIssuerName}` }],
        };
    }
  }

  // ─── Generate PDF ──────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: buildData() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la génération");
      }
      const blob = await res.blob();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(url);
      setSavedSuccess(false);
      setShowPreview(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Download ──────────────────────────────────────────────────────────────

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${TYPE_LABELS[type].replace(/ /g, "_")}_${Date.now()}.pdf`;
    a.click();
  };

  // ─── Save to DocuSafe ──────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!pdfBlob) return;
    setIsSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      const safeName = (fileName.trim() || TYPE_LABELS[type].replace(/ /g, "_"))
        .replace(/\.pdf$/i, "");
      fd.append("file", pdfBlob, `${safeName}.pdf`);
      if (selectedFolderId) fd.append("folderId", selectedFolderId);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la sauvegarde");
      }
      setSavedSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── AI assist ─────────────────────────────────────────────────────────────

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/documents/generate/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, prompt: aiPrompt }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur IA");
      }
      const { fields, items: aiItems } = await res.json();
      setForm((f) => ({ ...f, ...fields }));
      if (aiItems && aiItems.length > 0) setItems(aiItems);
      setShowAiHelper(false);
      setAiPrompt("");
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ─── Line items ────────────────────────────────────────────────────────────

  const showItems =
    type === "facture" || type === "devis" || type === "bon-de-commande";
  const showReference = type === "bon-de-commande";
  const showVat = type !== "bon-de-commande";

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, vatRate: 20 },
    ]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof LineItem, value: string | number) =>
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );

  const cellClass =
    "rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white w-full";

  // ─── Shared section renderers ──────────────────────────────────────────────

  const renderSenderSection = (title: string) => (
    <>
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Nom / Raison sociale"
          value={form.senderName}
          onChange={(v) => set("senderName", v)}
          required
          className="sm:col-span-2"
          placeholder="Ex : Jean Dupont ou SAS MonEntreprise"
        />
        <Field
          label="Adresse"
          value={form.senderAddress}
          onChange={(v) => set("senderAddress", v)}
          required
          placeholder="12 rue de la Paix"
        />
        <Field
          label="Code postal et ville"
          value={form.senderCity}
          onChange={(v) => set("senderCity", v)}
          required
          placeholder="75001 Paris"
        />
        <Field
          label="N° SIRET"
          value={form.senderSiret}
          onChange={(v) => set("senderSiret", v)}
          optional
          placeholder="123 456 789 00012"
        />
        <Field
          label="N° TVA intracommunautaire"
          value={form.senderVatNumber}
          onChange={(v) => set("senderVatNumber", v)}
          optional
          placeholder="FR 12 345678901"
        />
        <Field
          label="Email"
          value={form.senderEmail}
          onChange={(v) => set("senderEmail", v)}
          type="email"
          optional
          placeholder="contact@entreprise.fr"
        />
        <Field
          label="Téléphone"
          value={form.senderPhone}
          onChange={(v) => set("senderPhone", v)}
          optional
          placeholder="+33 1 23 45 67 89"
        />
      </div>
    </>
  );

  const renderClientSection = (title: string) => (
    <>
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Nom / Raison sociale"
          value={form.clientName}
          onChange={(v) => set("clientName", v)}
          required
          className="sm:col-span-2"
          placeholder="Ex : ACME SAS"
        />
        <Field
          label="Adresse"
          value={form.clientAddress}
          onChange={(v) => set("clientAddress", v)}
          required
          placeholder="5 avenue des Champs-Élysées"
        />
        <Field
          label="Code postal et ville"
          value={form.clientCity}
          onChange={(v) => set("clientCity", v)}
          required
          placeholder="75008 Paris"
        />
        <Field
          label="Email"
          value={form.clientEmail}
          onChange={(v) => set("clientEmail", v)}
          type="email"
          optional
          placeholder="compta@client.fr"
        />
        <Field
          label="N° TVA intracommunautaire"
          value={form.clientVatNumber}
          onChange={(v) => set("clientVatNumber", v)}
          optional
          placeholder="FR 98 765432109"
        />
      </div>
    </>
  );

  const renderLineItems = () => (
    <>
      <SectionTitle>{t("lineItems")}</SectionTitle>
      <div className="space-y-2">
        {/* Column headers */}
        <div className={`hidden gap-2 text-xs font-medium text-neutral-400 sm:grid ${showVat ? "grid-cols-[1fr_60px_90px_70px_28px]" : "grid-cols-[1fr_60px_90px_28px]"}`}>
          <span>Description</span>
          <span className="text-center">Qté</span>
          <span className="text-right">P.U. HT (€)</span>
          {showVat && <span className="text-center">TVA %</span>}
          <span />
        </div>

        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-800/60"
          >
            <div className={`grid flex-1 gap-2 ${showVat ? "grid-cols-2 sm:grid-cols-[1fr_60px_90px_70px]" : "grid-cols-2 sm:grid-cols-[1fr_60px_90px]"}`}>
              {showReference && (
                <input
                  value={item.reference ?? ""}
                  onChange={(e) => updateItem(i, "reference", e.target.value)}
                  placeholder="Référence"
                  className={`col-span-2 sm:col-span-1 ${cellClass}`}
                />
              )}
              <input
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                placeholder="Désignation / prestation"
                className={`${showReference ? "col-span-2 sm:col-span-3" : "col-span-2 sm:col-span-1"} ${cellClass}`}
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                placeholder="Qté"
                className={cellClass}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                placeholder="Prix HT"
                className={cellClass}
              />
              {showVat && (
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={item.vatRate}
                  onChange={(e) => updateItem(i, "vatRate", Number(e.target.value))}
                  placeholder="TVA %"
                  className={cellClass}
                />
              )}
            </div>
            <button
              onClick={() => removeItem(i)}
              disabled={items.length === 1}
              className="mt-0.5 rounded-lg p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          onClick={addItem}
          className="flex items-center gap-2 text-sm font-medium text-blue-500 transition hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          {t("addLine")}
        </button>
      </div>
    </>
  );

  // ─── Type-specific form fields ─────────────────────────────────────────────

  const renderForm = () => {
    switch (type) {
      // ── Facture ──────────────────────────────────────────────────────────
      case "facture":
        return (
          <>
            <SectionTitle>Références de la facture</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="N° de facture"
                value={form.invoiceNumber}
                onChange={(v) => set("invoiceNumber", v)}
                placeholder="FAC-2024-001"
                required
              />
              <Field
                label="Date d'émission"
                value={form.invoiceDate}
                onChange={(v) => set("invoiceDate", v)}
                type="date"
                required
              />
              <Field
                label="Date d'échéance"
                value={form.dueDate}
                onChange={(v) => set("dueDate", v)}
                type="date"
                required
              />
            </div>
            {renderSenderSection("Émetteur (vendeur / prestataire)")}
            {renderClientSection("Destinataire (acheteur / client)")}
            {renderLineItems()}
            <SectionTitle>Conditions de règlement</SectionTitle>
            <div className="grid gap-3">
              <Field
                label="Modalités de paiement"
                value={form.paymentTerms}
                onChange={(v) => set("paymentTerms", v)}
                placeholder="Virement bancaire sous 30 jours..."
              />
              <Field
                label="Clause de pénalités de retard"
                value={form.latePaymentPenalty}
                onChange={(v) => set("latePaymentPenalty", v)}
                optional
                placeholder="En cas de retard, pénalités au taux légal + 40 € forfaitaire..."
              />
              <TextArea
                label="Notes / Mentions légales"
                value={form.notes}
                onChange={(v) => set("notes", v)}
                optional
                placeholder="Ex : TVA non applicable, art. 293 B du CGI (auto-entrepreneur)"
              />
            </div>
          </>
        );

      // ── Devis ─────────────────────────────────────────────────────────────
      case "devis":
        return (
          <>
            <SectionTitle>Références du devis</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="N° de devis"
                value={form.quoteNumber}
                onChange={(v) => set("quoteNumber", v)}
                placeholder="DEV-2024-001"
                required
              />
              <Field
                label="Date d'émission"
                value={form.quoteDate}
                onChange={(v) => set("quoteDate", v)}
                type="date"
                required
              />
              <Field
                label="Valable jusqu'au"
                value={form.validUntil}
                onChange={(v) => set("validUntil", v)}
                type="date"
                required
              />
            </div>
            {renderSenderSection("Prestataire / Émetteur")}
            {renderClientSection("Client / Prospect")}
            {renderLineItems()}
            <SectionTitle>Conditions particulières</SectionTitle>
            <TextArea
              label="Notes et conditions"
              value={form.notes}
              onChange={(v) => set("notes", v)}
              optional
              placeholder="Ex : Délai d'exécution, conditions de révision du prix, acompte requis..."
            />
          </>
        );

      // ── Contrat ───────────────────────────────────────────────────────────
      case "contrat":
        return (
          <>
            {renderSenderSection("Le prestataire")}
            {renderClientSection("Le client / donneur d'ordre")}

            <SectionTitle>Objet de la mission</SectionTitle>
            <div className="grid gap-3">
              <Field
                label="Intitulé de la mission"
                value={form.missionTitle}
                onChange={(v) => set("missionTitle", v)}
                placeholder="Ex : Développement d'une application web"
                required
              />
              <TextArea
                label="Description et livrables attendus"
                value={form.missionDescription}
                onChange={(v) => set("missionDescription", v)}
                optional
                placeholder="Décrire précisément les prestations, les livrables, les modalités d'exécution..."
                rows={4}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Date de début"
                  value={form.startDate}
                  onChange={(v) => set("startDate", v)}
                  type="date"
                  required
                />
                <Field
                  label="Date de fin prévue"
                  value={form.endDate}
                  onChange={(v) => set("endDate", v)}
                  type="date"
                  required
                />
              </div>
            </div>

            <SectionTitle>Rémunération</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="Montant HT (€)"
                value={form.rate}
                onChange={(v) => set("rate", v)}
                placeholder="5 000"
                required
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Type de tarif
                </label>
                <select
                  value={form.rateType}
                  onChange={(e) => set("rateType", e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="fixed">Forfait global</option>
                  <option value="daily">Taux journalier (TJM)</option>
                  <option value="hourly">Taux horaire</option>
                </select>
              </div>
              <Field
                label="Modalités de paiement"
                value={form.paymentSchedule}
                onChange={(v) => set("paymentSchedule", v)}
                optional
                placeholder="50% à la commande, 50% à la livraison"
              />
            </div>

            <SectionTitle>Clauses contractuelles</SectionTitle>
            <div className="grid gap-3">
              <TextArea
                label="Obligations des parties"
                value={form.obligations}
                onChange={(v) => set("obligations", v)}
                optional
                placeholder="Préciser les obligations respectives du prestataire et du client..."
              />
              <TextArea
                label="Clause de résiliation"
                value={form.terminationClause}
                onChange={(v) => set("terminationClause", v)}
                optional
                placeholder="Laisser vide pour appliquer la clause par défaut (préavis 30 jours)."
              />
            </div>
          </>
        );

      // ── Bon de commande ───────────────────────────────────────────────────
      case "bon-de-commande":
        return (
          <>
            <SectionTitle>Références de la commande</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="N° de commande"
                value={form.orderNumber}
                onChange={(v) => set("orderNumber", v)}
                placeholder="CMD-2024-001"
                required
              />
              <Field
                label="Date de commande"
                value={form.orderDate}
                onChange={(v) => set("orderDate", v)}
                type="date"
                required
              />
              <Field
                label="Livraison souhaitée le"
                value={form.deliveryDate}
                onChange={(v) => set("deliveryDate", v)}
                type="date"
                optional
              />
            </div>

            <SectionTitle>Acheteur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nom / Raison sociale"
                value={form.buyerName}
                onChange={(v) => set("buyerName", v)}
                required
                className="sm:col-span-2"
              />
              <Field
                label="Adresse"
                value={form.buyerAddress}
                onChange={(v) => set("buyerAddress", v)}
                required
              />
              <Field
                label="Code postal et ville"
                value={form.buyerCity}
                onChange={(v) => set("buyerCity", v)}
                required
              />
              <Field
                label="Email"
                value={form.buyerEmail}
                onChange={(v) => set("buyerEmail", v)}
                type="email"
                optional
              />
            </div>

            <SectionTitle>Fournisseur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nom / Raison sociale"
                value={form.vendorName}
                onChange={(v) => set("vendorName", v)}
                required
                className="sm:col-span-2"
              />
              <Field
                label="Adresse"
                value={form.vendorAddress}
                onChange={(v) => set("vendorAddress", v)}
                required
              />
              <Field
                label="Code postal et ville"
                value={form.vendorCity}
                onChange={(v) => set("vendorCity", v)}
                required
              />
              <Field
                label="Email"
                value={form.vendorEmail}
                onChange={(v) => set("vendorEmail", v)}
                type="email"
                optional
              />
            </div>

            {renderLineItems()}

            <SectionTitle>Conditions</SectionTitle>
            <div className="grid gap-3">
              <Field
                label="Conditions de livraison (Incoterms)"
                value={form.deliveryTerms}
                onChange={(v) => set("deliveryTerms", v)}
                optional
                placeholder="Ex : DAP – Livraison à l'adresse de l'acheteur, port inclus"
              />
              <TextArea
                label="Notes"
                value={form.notes}
                onChange={(v) => set("notes", v)}
                optional
                placeholder="Conditions générales d'achat, références contractuelles..."
              />
            </div>
          </>
        );

      // ── Santé ─────────────────────────────────────────────────────────────
      case "ordonnance":
        return (
          <>
            <SectionTitle>Médecin prescripteur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom du médecin" value={form.prescriberName} onChange={(v) => set("prescriberName", v)} required placeholder="Dr. Marie Dubois" />
              <Field label="Spécialité" value={form.prescriberSpecialty} onChange={(v) => set("prescriberSpecialty", v)} placeholder="Médecin généraliste" />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required placeholder="12 rue de la Paix" />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required placeholder="75001 Paris" />
              <Field label="N° RPPS" value={form.prescriberRPPS} onChange={(v) => set("prescriberRPPS", v)} optional placeholder="10 chiffres" />
              <Field label="Email" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} type="email" optional />
              <Field label="Téléphone" value={form.senderPhone} onChange={(v) => set("senderPhone", v)} optional />
              <Field label="Date de prescription" value={form.prescriptionDate} onChange={(v) => set("prescriptionDate", v)} type="date" required />
            </div>
            <SectionTitle>Patient</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom complet du patient" value={form.patientFullName} onChange={(v) => set("patientFullName", v)} required placeholder="MARTIN Paul" className="sm:col-span-2" />
              <Field label="Date de naissance" value={form.patientDOB} onChange={(v) => set("patientDOB", v)} type="date" optional />
              <Field label="N° Sécurité sociale" value={form.patientSSN} onChange={(v) => set("patientSSN", v)} optional placeholder="1 85 07 75 115 042 06" />
            </div>
            <SectionTitle>Prescriptions</SectionTitle>
            <TextArea label="Médicaments, posologie et durée (un par ligne)" value={form.prescriptionMedications} onChange={(v) => set("prescriptionMedications", v)} rows={6} placeholder={"Ex :\n- Amoxicilline 500mg – 1 cp 3x/jour – 7 jours\n- Ibuprofène 400mg – 1 cp si douleur (max 3/j) – 5 jours"} />
            <div>
              <Field label="Renouvellement autorisé" value={form.prescriptionRenewable} onChange={(v) => set("prescriptionRenewable", v)} placeholder="Non / 1 fois / 2 fois" />
            </div>
            <TextArea label="Notes / Recommandations" value={form.notes} onChange={(v) => set("notes", v)} optional placeholder="Prendre avec les repas. Éviter l'alcool..." rows={2} />
          </>
        );

      case "certificat-medical":
        return (
          <>
            <SectionTitle>Praticien</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom du médecin" value={form.prescriberName} onChange={(v) => set("prescriberName", v)} required placeholder="Dr. Marie Dubois" />
              <Field label="Spécialité" value={form.prescriberSpecialty} onChange={(v) => set("prescriberSpecialty", v)} placeholder="Médecin généraliste" />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="N° RPPS" value={form.prescriberRPPS} onChange={(v) => set("prescriberRPPS", v)} optional placeholder="10 chiffres" />
              <Field label="Date de l'examen" value={form.examDate} onChange={(v) => set("examDate", v)} type="date" required />
            </div>
            <SectionTitle>Patient</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom complet" value={form.patientFullName} onChange={(v) => set("patientFullName", v)} required className="sm:col-span-2" />
              <Field label="Date de naissance" value={form.patientDOB} onChange={(v) => set("patientDOB", v)} type="date" optional />
            </div>
            <SectionTitle>Certificat</SectionTitle>
            <Field label="Objet du certificat" value={form.certificatePurpose} onChange={(v) => set("certificatePurpose", v)} required placeholder="Ex : Aptitude à la pratique sportive / Arrêt de travail / Aptitude au travail" />
            <div>
              <TextArea label="Conclusion médicale" value={form.medicalConclusion} onChange={(v) => set("medicalConclusion", v)} rows={5} placeholder="Ex : Je soussigné(e) Dr Dubois, certifie avoir examiné M. MARTIN Paul en date du jour et l'avoir trouvé apte à..." />
            </div>
            <Field label="Durée (si arrêt de travail)" value={form.leaveDuration} onChange={(v) => set("leaveDuration", v)} optional placeholder="Ex : 5 jours du 01/02 au 05/02/2025" />
          </>
        );

      case "compte-rendu-consultation":
        return (
          <>
            <SectionTitle>Praticien</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom du médecin" value={form.prescriberName} onChange={(v) => set("prescriberName", v)} required placeholder="Dr. Marie Dubois" />
              <Field label="Spécialité" value={form.prescriberSpecialty} onChange={(v) => set("prescriberSpecialty", v)} placeholder="Cardiologue" />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="N° RPPS" value={form.prescriberRPPS} onChange={(v) => set("prescriberRPPS", v)} optional />
              <Field label="Date de consultation" value={form.consultationDate} onChange={(v) => set("consultationDate", v)} type="date" required />
            </div>
            <SectionTitle>Patient</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom complet" value={form.patientFullName} onChange={(v) => set("patientFullName", v)} required className="sm:col-span-2" />
              <Field label="Date de naissance" value={form.patientDOB} onChange={(v) => set("patientDOB", v)} type="date" optional />
              <Field label="N° Sécurité sociale" value={form.patientSSN} onChange={(v) => set("patientSSN", v)} optional />
            </div>
            <SectionTitle>Consultation</SectionTitle>
            <Field label="Motif de consultation" value={form.consultationReason} onChange={(v) => set("consultationReason", v)} required placeholder="Ex : Bilan de suivi, douleurs thoraciques, renouvellement traitement..." />
            <div className="mt-3 space-y-3">
              <TextArea label="Antécédents (optionnel)" value={form.pastHistory} onChange={(v) => set("pastHistory", v)} optional rows={2} placeholder="HTA, diabète T2, antécédent chirurgical..." />
              <TextArea label="Examen clinique" value={form.clinicalExam} onChange={(v) => set("clinicalExam", v)} rows={3} placeholder="PA 130/80, auscultation cardio-pulmonaire normale, abdomen souple..." />
              <TextArea label="Diagnostic" value={form.diagnosis} onChange={(v) => set("diagnosis", v)} rows={2} placeholder="Ex : Rhinopharyngite aiguë – CIM-10 : J06.9" />
              <TextArea label="Conduite à tenir / Traitement prescrit" value={form.treatmentPlan} onChange={(v) => set("treatmentPlan", v)} rows={3} placeholder="Repos, hydratation. Prescription ci-jointe..." />
              <Field label="Prochain rendez-vous" value={form.nextAppointment} onChange={(v) => set("nextAppointment", v)} optional placeholder="Dans 3 mois" />
            </div>
          </>
        );

      case "fiche-patient":
        return (
          <>
            <SectionTitle>Identité du patient</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom" value={form.patientFullName} onChange={(v) => set("patientFullName", v)} required placeholder="MARTIN" />
              <Field label="Prénom" value={form.patientFirstName} onChange={(v) => set("patientFirstName", v)} required placeholder="Paul" />
              <Field label="Date de naissance" value={form.patientDOB} onChange={(v) => set("patientDOB", v)} type="date" required />
              <Field label="N° Sécurité sociale" value={form.patientSSN} onChange={(v) => set("patientSSN", v)} optional placeholder="1 85 07 75 115 042 06" />
              <Field label="Adresse" value={form.patientCurrentAddress} onChange={(v) => set("patientCurrentAddress", v)} required />
              <Field label="Téléphone" value={form.patientPhone} onChange={(v) => set("patientPhone", v)} optional />
              <Field label="Email" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} type="email" optional />
              <Field label="Groupe sanguin" value={form.bloodGroup} onChange={(v) => set("bloodGroup", v)} optional placeholder="A+, O-, B+..." />
            </div>
            <SectionTitle>Contact d&apos;urgence</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom du contact" value={form.emergencyContactName} onChange={(v) => set("emergencyContactName", v)} optional />
              <Field label="Téléphone" value={form.emergencyContactPhone} onChange={(v) => set("emergencyContactPhone", v)} optional />
            </div>
            <SectionTitle>Informations médicales</SectionTitle>
            <div className="space-y-3">
              <TextArea label="Antécédents médicaux" value={form.pastHistory} onChange={(v) => set("pastHistory", v)} optional placeholder="HTA, diabète, chirurgies passées..." rows={3} />
              <TextArea label="Allergies" value={form.allergies} onChange={(v) => set("allergies", v)} optional placeholder="Pénicilline, aspirine, arachides..." rows={2} />
              <TextArea label="Traitements en cours" value={form.ongoingTreatments} onChange={(v) => set("ongoingTreatments", v)} optional placeholder="Metformine 850mg 2x/j, Ramipril 5mg/j..." rows={3} />
            </div>
          </>
        );

      // ── Finance / Comptabilité ─────────────────────────────────────────────
      case "bilan-comptable":
        return (
          <>
            {renderSenderSection("Entreprise")}
            <SectionTitle>Exercice fiscal</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Début d'exercice" value={form.fiscalYearStart} onChange={(v) => set("fiscalYearStart", v)} type="date" required />
              <Field label="Fin d'exercice" value={form.fiscalYearEnd} onChange={(v) => set("fiscalYearEnd", v)} type="date" required />
            </div>
            <SectionTitle>Actif</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Immobilisations nettes (€)" value={form.totalAssets} onChange={(v) => set("totalAssets", v)} placeholder="0" optional />
              <Field label="Trésorerie disponible (€)" value={form.cashflow} onChange={(v) => set("cashflow", v)} placeholder="0" optional />
            </div>
            <SectionTitle>Passif</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Capitaux propres & réserves (€)" value={form.capitalReserves} onChange={(v) => set("capitalReserves", v)} placeholder="0" optional />
              <Field label="Résultat de l'exercice (€)" value={form.fiscalNetResult} onChange={(v) => set("fiscalNetResult", v)} placeholder="0" optional />
              <Field label="Total dettes (€)" value={form.totalLiabilities} onChange={(v) => set("totalLiabilities", v)} placeholder="0" optional />
            </div>
            <TextArea label="Notes de l'expert-comptable" value={form.notes} onChange={(v) => set("notes", v)} optional rows={4} />
          </>
        );

      case "declaration-fiscale":
        return (
          <>
            {renderSenderSection("Déclarant")}
            <SectionTitle>Références de la déclaration</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Type de déclaration *</label>
                <select value={form.taxType} onChange={(e) => set("taxType", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option>TVA</option><option>IS (Impôt sur les Sociétés)</option><option>IR (Impôt sur le Revenu)</option><option>CFE</option><option>CVAE</option>
                </select>
              </div>
              <Field label="Période du" value={form.taxPeriodStart} onChange={(v) => set("taxPeriodStart", v)} type="date" required />
              <Field label="au" value={form.taxPeriodEnd} onChange={(v) => set("taxPeriodEnd", v)} type="date" required />
              <Field label="N° fiscal / SPI" value={form.taxId} onChange={(v) => set("taxId", v)} optional placeholder="0 12 34 567 890" className="sm:col-span-3" />
            </div>
            <SectionTitle>Éléments à déclarer</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Chiffre d'affaires HT (€)" value={form.revenueHT} onChange={(v) => set("revenueHT", v)} optional placeholder="0" />
              <Field label="TVA collectée (€)" value={form.vatCollected} onChange={(v) => set("vatCollected", v)} optional placeholder="0" />
              <Field label="TVA déductible (€)" value={form.vatDeductible} onChange={(v) => set("vatDeductible", v)} optional placeholder="0" />
              <Field label="TVA nette à payer (€)" value={form.vatDue} onChange={(v) => set("vatDue", v)} optional placeholder="0" />
            </div>
            <TextArea label="Observations" value={form.notes} onChange={(v) => set("notes", v)} optional rows={3} />
          </>
        );

      case "rapport-financier":
        return (
          <>
            {renderSenderSection("Entreprise")}
            <SectionTitle>Période et indicateurs</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Période du rapport" value={form.reportPeriodLabel} onChange={(v) => set("reportPeriodLabel", v)} required placeholder="Ex : Exercice 2024 / T1 2025" className="sm:col-span-2" />
              <Field label="Chiffre d'affaires HT (€)" value={form.revenueHT} onChange={(v) => set("revenueHT", v)} optional placeholder="0" />
              <Field label="Total charges (€)" value={form.totalExpenses} onChange={(v) => set("totalExpenses", v)} optional placeholder="0" />
              <Field label="Résultat net (€)" value={form.fiscalNetResult} onChange={(v) => set("fiscalNetResult", v)} optional placeholder="0" />
              <Field label="Trésorerie disponible (€)" value={form.cashflow} onChange={(v) => set("cashflow", v)} optional placeholder="0" />
            </div>
            <TextArea label="Résumé exécutif" value={form.executiveSummaryFinance} onChange={(v) => set("executiveSummaryFinance", v)} rows={4} optional placeholder="Synthèse des résultats clés..." />
            <TextArea label="Perspectives et analyse" value={form.financialPerspectives} onChange={(v) => set("financialPerspectives", v)} rows={4} optional placeholder="Tendances, risques, projections..." />
          </>
        );

      // ── Juridique ──────────────────────────────────────────────────────────
      case "acte-juridique":
        return (
          <>
            <SectionTitle>Rédacteur de l&apos;acte</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Qualité (Notaire, Huissier, Avocat...)" value={form.signerQuality} onChange={(v) => set("signerQuality", v)} required placeholder="Notaire" />
              <Field label="N° Chambre / Barreau / RPPS" value={form.barOrRPPS} onChange={(v) => set("barOrRPPS", v)} optional />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="Date de l'acte" value={form.actDate} onChange={(v) => set("actDate", v)} type="date" required />
              <Field label="Lieu de signature" value={form.actLocation} onChange={(v) => set("actLocation", v)} required placeholder="Paris" />
            </div>
            <SectionTitle>Première partie</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.party1Name} onChange={(v) => set("party1Name", v)} required className="sm:col-span-2" />
              <Field label="Qualité" value={form.party1Quality} onChange={(v) => set("party1Quality", v)} optional placeholder="Vendeur / Créancier..." />
              <Field label="Adresse" value={form.party1Address} onChange={(v) => set("party1Address", v)} optional />
            </div>
            <SectionTitle>Seconde partie</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.party2Name} onChange={(v) => set("party2Name", v)} required className="sm:col-span-2" />
              <Field label="Qualité" value={form.party2Quality} onChange={(v) => set("party2Quality", v)} optional placeholder="Acquéreur / Débiteur..." />
              <Field label="Adresse" value={form.party2Address} onChange={(v) => set("party2Address", v)} optional />
            </div>
            <SectionTitle>Contenu de l&apos;acte</SectionTitle>
            <TextArea label="Objet et contenu" value={form.actContent} onChange={(v) => set("actContent", v)} rows={8} placeholder="Décrire précisément l'objet et les dispositions de l'acte..." />
            <TextArea label="Conditions suspensives (optionnel)" value={form.legalSuspensiveConditions} onChange={(v) => set("legalSuspensiveConditions", v)} optional rows={3} />
            <TextArea label="Mentions légales obligatoires" value={form.notes} onChange={(v) => set("notes", v)} optional rows={3} placeholder="Obligations d'information, mentions réglementaires..." />
          </>
        );

      case "mise-en-demeure":
        return (
          <>
            {renderSenderSection("Expéditeur")}
            <SectionTitle>Destinataire</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.recipientName} onChange={(v) => set("recipientName", v)} required className="sm:col-span-2" />
              <Field label="Adresse" value={form.recipientAddress} onChange={(v) => set("recipientAddress", v)} required />
              <Field label="Code postal et ville" value={form.recipientCity} onChange={(v) => set("recipientCity", v)} required />
            </div>
            <SectionTitle>En-tête</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Lieu d'émission" value={form.city} onChange={(v) => set("city", v)} required placeholder="Paris" />
              <Field label="Date" value={form.date} onChange={(v) => set("date", v)} type="date" required />
              <Field label="Objet" value={form.subject} onChange={(v) => set("subject", v)} required placeholder="Mise en demeure – [sujet]" className="sm:col-span-2" />
            </div>
            <SectionTitle>Corps de la mise en demeure</SectionTitle>
            <div className="space-y-3">
              <TextArea label="Rappel des faits" value={form.formalDemandFacts} onChange={(v) => set("formalDemandFacts", v)} rows={4} placeholder="Décrire les faits justifiant la mise en demeure (contrat non respecté, paiement impayé...)" />
              <TextArea label="Demande formelle" value={form.formalDemandRequest} onChange={(v) => set("formalDemandRequest", v)} rows={3} placeholder="Ce que vous exigez précisément de la partie adverse..." />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Délai accordé" value={form.formalDemandDeadline} onChange={(v) => set("formalDemandDeadline", v)} required placeholder="8 jours / 30 jours" />
                <Field label="Conséquences en cas de non-respect" value={form.formalDemandConsequences} onChange={(v) => set("formalDemandConsequences", v)} optional placeholder="Saisine du tribunal, huissier..." />
              </div>
            </div>
          </>
        );

      case "procuration":
        return (
          <>
            <SectionTitle>Mandant (celui qui donne pouvoir)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom et prénom" value={form.granterName} onChange={(v) => set("granterName", v)} required className="sm:col-span-2" />
              <Field label="Date de naissance" value={form.granterDOB} onChange={(v) => set("granterDOB", v)} type="date" optional />
              <Field label="Lieu de naissance" value={form.granterBirthPlace} onChange={(v) => set("granterBirthPlace", v)} optional />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="N° pièce d'identité" value={form.granterIDNumber} onChange={(v) => set("granterIDNumber", v)} optional placeholder="CNI / Passeport n°..." />
            </div>
            <SectionTitle>Mandataire (celui qui reçoit le pouvoir)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom et prénom" value={form.granteeName} onChange={(v) => set("granteeName", v)} required className="sm:col-span-2" />
              <Field label="Date de naissance" value={form.granteeDOB} onChange={(v) => set("granteeDOB", v)} type="date" optional />
              <Field label="Lieu de naissance" value={form.granteeBirthPlace} onChange={(v) => set("granteeBirthPlace", v)} optional />
              <Field label="Adresse" value={form.granteeAddress2} onChange={(v) => set("granteeAddress2", v)} optional />
            </div>
            <SectionTitle>Pouvoirs délégués</SectionTitle>
            <TextArea label="Objet de la procuration" value={form.powerObject} onChange={(v) => set("powerObject", v)} rows={5} placeholder="Ex : Représenter le mandant lors de la signature de l'acte de vente du bien situé au... / Effectuer toutes démarches auprès de..." />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Durée / Date d'expiration" value={form.powerDuration} onChange={(v) => set("powerDuration", v)} optional placeholder="6 mois / Illimitée" />
              <Field label="Lieu de signature" value={form.powerLocation} onChange={(v) => set("powerLocation", v)} required placeholder="Paris" />
              <Field label="Date" value={form.powerDate} onChange={(v) => set("powerDate", v)} type="date" required />
            </div>
          </>
        );

      // ── Immobilier ──────────────────────────────────────────────────────────
      case "bail":
        return (
          <>
            {renderSenderSection("Bailleur")}
            <SectionTitle>Locataire(s)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom complet du locataire" value={form.tenantName} onChange={(v) => set("tenantName", v)} required className="sm:col-span-2" />
              <Field label="Adresse actuelle" value={form.tenantCurrentAddress} onChange={(v) => set("tenantCurrentAddress", v)} optional />
              <Field label="Téléphone" value={form.tenantPhone} onChange={(v) => set("tenantPhone", v)} optional />
              <Field label="Email" value={form.clientEmail} onChange={(v) => set("clientEmail", v)} type="email" optional />
            </div>
            <SectionTitle>Bien loué</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Adresse du bien" value={form.propertyAddress} onChange={(v) => set("propertyAddress", v)} required className="sm:col-span-2" />
              <Field label="Type de bien" value={form.propertyType} onChange={(v) => set("propertyType", v)} required placeholder="Ex : T3 meublé, Studio, Appartement 2 pièces" />
              <Field label="Surface habitable (m²)" value={form.propertySurface} onChange={(v) => set("propertySurface", v)} optional placeholder="45" />
              <Field label="Classe DPE" value={form.propertyDPE} onChange={(v) => set("propertyDPE", v)} optional placeholder="D" />
            </div>
            <SectionTitle>Conditions financières et durée</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Type de bail *</label>
                <select value={form.leaseType} onChange={(e) => set("leaseType", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option value="vide">Vide (3 ans)</option><option value="meublé">Meublé (1 an)</option><option value="commercial">Commercial (9 ans)</option>
                </select>
              </div>
              <Field label="Date de début" value={form.leaseStartDate} onChange={(v) => set("leaseStartDate", v)} type="date" required />
              <Field label="Loyer mensuel HC (€)" value={form.rentAmount} onChange={(v) => set("rentAmount", v)} required placeholder="800" />
              <Field label="Provisions sur charges (€)" value={form.chargesAmount} onChange={(v) => set("chargesAmount", v)} optional placeholder="50" />
              <Field label="Dépôt de garantie (€)" value={form.depositAmount} onChange={(v) => set("depositAmount", v)} optional placeholder="800 (1 mois vide / 2 mois meublé)" />
              <Field label="Indice IRL de référence" value={form.irlIndex} onChange={(v) => set("irlIndex", v)} optional placeholder="4,03" />
            </div>
            {form.leaseType === "meublé" && (
              <>
                <SectionTitle>Inventaire du mobilier</SectionTitle>
                <TextArea label="Liste du mobilier (obligatoire pour bail meublé – décret 2015-981)" value={form.furnitureList} onChange={(v) => set("furnitureList", v)} rows={5} placeholder="Lit 140cm + matelas, table + 4 chaises, réfrigérateur, cuisinière, machine à laver..." />
              </>
            )}
            <TextArea label="Clauses particulières" value={form.notes} onChange={(v) => set("notes", v)} optional rows={3} />
          </>
        );

      case "compromis-de-vente":
        return (
          <>
            <SectionTitle>Vendeur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.sellerName} onChange={(v) => set("sellerName", v)} required className="sm:col-span-2" />
              <Field label="Adresse" value={form.sellerAddress} onChange={(v) => set("sellerAddress", v)} optional />
              <Field label="Email" value={form.sellerEmail} onChange={(v) => set("sellerEmail", v)} type="email" optional />
            </div>
            <SectionTitle>Acquéreur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.buyerNameImmo} onChange={(v) => set("buyerNameImmo", v)} required className="sm:col-span-2" />
              <Field label="Adresse" value={form.buyerAddressImmo} onChange={(v) => set("buyerAddressImmo", v)} optional />
              <Field label="Email" value={form.buyerEmailImmo} onChange={(v) => set("buyerEmailImmo", v)} type="email" optional />
            </div>
            <SectionTitle>Bien immobilier</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Adresse du bien" value={form.propertyAddress} onChange={(v) => set("propertyAddress", v)} required className="sm:col-span-2" />
              <TextArea label="Description (type, surface, état)" value={form.propertyDescription} onChange={(v) => set("propertyDescription", v)} rows={2} optional />
              <Field label="Référence cadastrale" value={form.propertyCadastral} onChange={(v) => set("propertyCadastral", v)} optional placeholder="Section AB – N° 0042" />
            </div>
            <SectionTitle>Conditions financières</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prix de vente (€)" value={form.salePrice} onChange={(v) => set("salePrice", v)} required />
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Financement</label>
                <select value={form.financingType} onChange={(e) => set("financingType", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option>Comptant</option><option>Prêt immobilier</option><option>Mix comptant / prêt</option>
                </select>
              </div>
              <Field label="Montant emprunté (€)" value={form.loanAmount} onChange={(v) => set("loanAmount", v)} optional />
              <Field label="Durée du prêt (ans)" value={form.loanDurationYears} onChange={(v) => set("loanDurationYears", v)} optional placeholder="20" />
              <Field label="Séquestre / dépôt de garantie (%)" value={form.sequestPercentage} onChange={(v) => set("sequestPercentage", v)} optional placeholder="5" />
              <Field label="Notaire chargé de l'acte" value={form.notaryName} onChange={(v) => set("notaryName", v)} optional />
              <Field label="Date acte authentique prévue" value={form.estimatedActDate} onChange={(v) => set("estimatedActDate", v)} type="date" optional />
              <Field label="Date du compromis" value={form.actDate} onChange={(v) => set("actDate", v)} type="date" required />
            </div>
            <TextArea label="Conditions suspensives" value={form.immoSuspensiveConditions} onChange={(v) => set("immoSuspensiveConditions", v)} optional rows={3} placeholder="Obtention du prêt sous 45 jours, absence de servitudes non déclarées..." />
            <TextArea label="Clauses particulières" value={form.notes} onChange={(v) => set("notes", v)} optional rows={3} />
          </>
        );

      case "mandat-immobilier":
        return (
          <>
            <SectionTitle>Mandant (propriétaire)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Email" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} type="email" optional />
            </div>
            <SectionTitle>Mandataire (agence immobilière)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom de l'agence" value={form.agencyName} onChange={(v) => set("agencyName", v)} required className="sm:col-span-2" />
              <Field label="N° Carte Professionnelle T" value={form.agencyCardT} onChange={(v) => set("agencyCardT", v)} required placeholder="CPI 75012 2013 000 000 123" />
              <Field label="Email" value={form.clientEmail} onChange={(v) => set("clientEmail", v)} type="email" optional />
            </div>
            <SectionTitle>Bien et conditions</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Adresse du bien" value={form.propertyAddress} onChange={(v) => set("propertyAddress", v)} required className="sm:col-span-2" />
              <Field label="Type de bien" value={form.propertyType} onChange={(v) => set("propertyType", v)} optional placeholder="Appartement T3, Maison..." />
              <Field label="Surface (m²)" value={form.propertySurface} onChange={(v) => set("propertySurface", v)} optional />
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Type de mandat *</label>
                <select value={form.mandateType} onChange={(e) => set("mandateType", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option value="simple">Simple</option><option value="exclusif">Exclusif</option>
                </select>
              </div>
              <Field label="Prix de vente souhaité (€)" value={form.mandatePrice} onChange={(v) => set("mandatePrice", v)} required />
              <Field label="Honoraires TTC (€ ou %)" value={form.mandateFees} onChange={(v) => set("mandateFees", v)} optional placeholder="5% TTC ou 15 000 €" />
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Honoraires à la charge du</label>
                <select value={form.mandateFeesBearer} onChange={(e) => set("mandateFeesBearer", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option value="vendeur">Vendeur</option><option value="acquéreur">Acquéreur</option><option value="les deux">Les deux (partagés)</option>
                </select>
              </div>
              <Field label="Durée du mandat (mois)" value={form.mandateDurationMonths} onChange={(v) => set("mandateDurationMonths", v)} optional placeholder="3" />
              <Field label="Date de début" value={form.mandateStartDate} onChange={(v) => set("mandateStartDate", v)} type="date" required />
            </div>
            <TextArea label="Clauses particulières" value={form.notes} onChange={(v) => set("notes", v)} optional rows={3} />
          </>
        );

      // ── Tech / IT ──────────────────────────────────────────────────────────
      case "cahier-des-charges":
        return (
          <>
            <SectionTitle>Maître d&apos;ouvrage (client)</SectionTitle>
            {renderClientSection("Client / Commanditaire")}
            <SectionTitle>Maître d&apos;œuvre (prestataire)</SectionTitle>
            {renderSenderSection("Prestataire / Agence")}
            <SectionTitle>Projet</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom du projet" value={form.projectName} onChange={(v) => set("projectName", v)} required className="sm:col-span-2" placeholder="Refonte site e-commerce" />
              <Field label="Budget indicatif HT (€)" value={form.projectBudget} onChange={(v) => set("projectBudget", v)} optional />
              <Field label="Planning prévisionnel" value={form.projectTimeline} onChange={(v) => set("projectTimeline", v)} optional placeholder="6 mois – livraison Q3 2025" />
              <Field label="Interlocuteurs clés" value={form.projectStakeholders} onChange={(v) => set("projectStakeholders", v)} optional placeholder="Chef de projet, Directeur Technique..." className="sm:col-span-2" />
            </div>
            <div className="mt-3 space-y-3">
              <TextArea label="Contexte et objectifs" value={form.projectContext} onChange={(v) => set("projectContext", v)} rows={4} placeholder="Décrivez le contexte, les enjeux et les objectifs principaux..." />
              <TextArea label="Périmètre fonctionnel" value={form.functionalScope} onChange={(v) => set("functionalScope", v)} rows={5} placeholder="- Authentification utilisateurs&#10;- Catalogue produits&#10;- Tunnel de paiement&#10;- Espace client..." />
              <TextArea label="Contraintes techniques" value={form.technicalConstraints} onChange={(v) => set("technicalConstraints", v)} rows={3} optional placeholder="Stack imposée, hébergement, conformité RGPD, accessibilité WCAG..." />
              <TextArea label="Livrables attendus" value={form.deliverables} onChange={(v) => set("deliverables", v)} rows={3} placeholder="Code source, documentation, tests, formation..." />
              <TextArea label="Critères d'acceptation" value={form.acceptanceCriteria} onChange={(v) => set("acceptanceCriteria", v)} rows={3} optional placeholder="Temps de chargement < 2s, 0 bug bloquant, tests automatisés à 80%..." />
            </div>
          </>
        );

      case "nda":
        return (
          <>
            {renderSenderSection("Partie divulgatrice")}
            {renderClientSection("Partie réceptrice")}
            <SectionTitle>Accord de confidentialité</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Date de prise d'effet" value={form.ndaStartDate} onChange={(v) => set("ndaStartDate", v)} type="date" required />
              <Field label="Durée de l'obligation (années)" value={form.ndaDurationYears} onChange={(v) => set("ndaDurationYears", v)} optional placeholder="3" />
            </div>
            <div className="mt-3 space-y-3">
              <TextArea label="Contexte de la collaboration" value={form.ndaContext} onChange={(v) => set("ndaContext", v)} rows={3} placeholder="Projet de partenariat commercial, audit technique, évaluation d'acquisition..." />
              <TextArea label="Définition des informations confidentielles" value={form.confidentialInfoDef} onChange={(v) => set("confidentialInfoDef", v)} rows={3} optional placeholder="Données techniques, financières, commerciales, brevets, code source, données clients..." />
              <TextArea label="Exceptions à la confidentialité" value={form.ndaExceptions} onChange={(v) => set("ndaExceptions", v)} rows={2} optional placeholder="Informations déjà publiques, obligation légale de divulgation..." />
            </div>
          </>
        );

      case "rapport-technique":
        return (
          <>
            <SectionTitle>Auteur et commanditaire</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Auteur(s) du rapport" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Email" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} type="email" optional />
              <Field label="Commanditaire / Client" value={form.clientName} onChange={(v) => set("clientName", v)} required />
              <Field label="Email client" value={form.clientEmail} onChange={(v) => set("clientEmail", v)} type="email" optional />
            </div>
            <SectionTitle>Rapport</SectionTitle>
            <Field label="Titre du rapport" value={form.reportTitle} onChange={(v) => set("reportTitle", v)} required placeholder="Ex : Audit de sécurité, Rapport d'analyse de performance..." className="mb-3" />
            <div className="space-y-3">
              <TextArea label="Contexte et objectif" value={form.reportContext} onChange={(v) => set("reportContext", v)} rows={3} />
              <TextArea label="Méthodologie" value={form.reportMethodology} onChange={(v) => set("reportMethodology", v)} rows={3} optional />
              <TextArea label="Constats et résultats" value={form.reportFindings} onChange={(v) => set("reportFindings", v)} rows={4} />
              <TextArea label="Analyse" value={form.reportAnalysis} onChange={(v) => set("reportAnalysis", v)} rows={3} optional />
              <TextArea label="Recommandations" value={form.reportRecommendations} onChange={(v) => set("reportRecommendations", v)} rows={4} />
              <TextArea label="Conclusion" value={form.reportConclusion} onChange={(v) => set("reportConclusion", v)} rows={3} optional />
              <TextArea label="Annexes (optionnel)" value={form.notes} onChange={(v) => set("notes", v)} rows={2} optional />
            </div>
          </>
        );

      // ── RH / Travail ────────────────────────────────────────────────────────
      case "contrat-de-travail":
        return (
          <>
            <SectionTitle>Employeur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Raison sociale" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="SIRET" value={form.employerSiretRH} onChange={(v) => set("employerSiretRH", v)} optional />
              <Field label="Représenté par" value={form.employerRepresentativeName} onChange={(v) => set("employerRepresentativeName", v)} optional placeholder="Prénom Nom – Titre" />
            </div>
            <SectionTitle>Salarié(e)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={form.employeeFirstName} onChange={(v) => set("employeeFirstName", v)} required />
              <Field label="Nom" value={form.clientName} onChange={(v) => set("clientName", v)} required />
              <Field label="Date de naissance" value={form.employeeDOB} onChange={(v) => set("employeeDOB", v)} type="date" optional />
              <Field label="Lieu de naissance" value={form.employeeBirthPlace} onChange={(v) => set("employeeBirthPlace", v)} optional />
              <Field label="Adresse" value={form.clientAddress} onChange={(v) => set("clientAddress", v)} optional className="sm:col-span-2" />
              <Field label="N° Sécurité sociale" value={form.employeeSSNRH} onChange={(v) => set("employeeSSNRH", v)} optional />
            </div>
            <SectionTitle>Poste</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Type de contrat *</label>
                <select value={form.contractTypeRH} onChange={(e) => set("contractTypeRH", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="CTT">CTT (Intérim)</option>
                </select>
              </div>
              <Field label="Intitulé du poste" value={form.jobTitle} onChange={(v) => set("jobTitle", v)} required />
              <Field label="Convention collective (CCN)" value={form.ccn} onChange={(v) => set("ccn", v)} optional placeholder="Ex : Syntec, Bâtiment, Commerce de détail..." />
              <Field label="Lieu de travail" value={form.workLocation} onChange={(v) => set("workLocation", v)} optional />
              <Field label="Durée hebdomadaire (heures)" value={form.workingHoursWeek} onChange={(v) => set("workingHoursWeek", v)} optional placeholder="35" />
              <Field label="Salaire brut mensuel (€)" value={form.grossSalary} onChange={(v) => set("grossSalary", v)} required />
            </div>
            {form.contractTypeRH === "CDD" && (
              <>
                <SectionTitle>Détails CDD</SectionTitle>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Date de début" value={form.cddStartDate} onChange={(v) => set("cddStartDate", v)} type="date" required />
                  <Field label="Date de fin" value={form.cddEndDate} onChange={(v) => set("cddEndDate", v)} type="date" required />
                  <Field label="Motif du CDD" value={form.cddReason} onChange={(v) => set("cddReason", v)} required placeholder="Remplacement / Accroissement d'activité..." />
                </div>
              </>
            )}
            <SectionTitle>Conditions d&apos;exécution</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Période d'essai (semaines)" value={form.trialPeriodWeeks} onChange={(v) => set("trialPeriodWeeks", v)} optional placeholder="Ex : 8 (CDI cadre)" />
              <Field label="Préavis (semaines)" value={form.noticePeriodWeeks} onChange={(v) => set("noticePeriodWeeks", v)} optional placeholder="Selon CCN" />
            </div>
            <TextArea label="Avantages et compléments (mutuelle, ticket-restaurant, véhicule...)" value={form.benefitsText} onChange={(v) => set("benefitsText", v)} optional rows={3} />
            <TextArea label="Clauses particulières" value={form.notes} onChange={(v) => set("notes", v)} optional rows={3} />
          </>
        );

      case "fiche-de-paie":
        return (
          <>
            <SectionTitle>Employeur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Raison sociale" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="SIRET" value={form.employerSiretRH} onChange={(v) => set("employerSiretRH", v)} optional />
            </div>
            <SectionTitle>Salarié(e)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={form.employeeFirstName} onChange={(v) => set("employeeFirstName", v)} required />
              <Field label="Nom" value={form.clientName} onChange={(v) => set("clientName", v)} required />
              <Field label="Poste / Qualification" value={form.jobTitle} onChange={(v) => set("jobTitle", v)} optional />
              <Field label="N° Sécurité sociale" value={form.employeeSSNRH} onChange={(v) => set("employeeSSNRH", v)} optional />
              <Field label="Convention collective (CCN)" value={form.ccn} onChange={(v) => set("ccn", v)} optional className="sm:col-span-2" />
            </div>
            <SectionTitle>Bulletin de paie</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Période de paie" value={form.payPeriodLabel} onChange={(v) => set("payPeriodLabel", v)} required placeholder="Janvier 2025" className="sm:col-span-2" />
              <Field label="Jours travaillés" value={form.workingDays} onChange={(v) => set("workingDays", v)} optional placeholder="22" />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Salaire brut de base (€)" value={form.grossBase} onChange={(v) => set("grossBase", v)} required />
              <Field label="Cotisations salariales (€)" value={form.socialContributions} onChange={(v) => set("socialContributions", v)} optional />
              <Field label="Net imposable (€)" value={form.netTaxable} onChange={(v) => set("netTaxable", v)} optional />
              <Field label="CSG/CRDS non déductible (€)" value={form.csgCrds} onChange={(v) => set("csgCrds", v)} optional />
              <Field label="NET À PAYER (€)" value={form.netToPay} onChange={(v) => set("netToPay", v)} required />
              <Field label="Date de virement" value={form.paymentDatePay} onChange={(v) => set("paymentDatePay", v)} type="date" required />
              <Field label="Solde congés payés (jours)" value={form.paidLeaveBalance} onChange={(v) => set("paidLeaveBalance", v)} optional className="sm:col-span-2" />
            </div>
          </>
        );

      case "avenant":
        return (
          <>
            <SectionTitle>Employeur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Raison sociale" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Représenté par" value={form.employerRepresentativeName} onChange={(v) => set("employerRepresentativeName", v)} optional />
            </div>
            <SectionTitle>Salarié(e)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={form.employeeFirstName} onChange={(v) => set("employeeFirstName", v)} required />
              <Field label="Nom" value={form.clientName} onChange={(v) => set("clientName", v)} required />
              <Field label="Poste actuel" value={form.jobTitle} onChange={(v) => set("jobTitle", v)} optional />
            </div>
            <SectionTitle>Références et modifications</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Date du contrat original" value={form.contractOriginalDate} onChange={(v) => set("contractOriginalDate", v)} type="date" required />
              <Field label="Prise d'effet de l'avenant" value={form.amendmentEffectDate} onChange={(v) => set("amendmentEffectDate", v)} type="date" required />
              <Field label="Motif de l'avenant" value={form.amendmentReason} onChange={(v) => set("amendmentReason", v)} optional placeholder="Augmentation, changement de poste, télétravail..." />
            </div>
            <TextArea label="Modifications apportées" value={form.contractModifications} onChange={(v) => set("contractModifications", v)} rows={6} placeholder="Ex :\n- Salaire brut : passe de 2 500 € à 2 800 € brut mensuel\n- Titre : passe de Développeur Junior à Développeur Senior\n- Lieu : télétravail 2 jours/semaine autorisé" />
          </>
        );

      // ── Formation ───────────────────────────────────────────────────────────
      case "convention-de-stage":
        return (
          <>
            <SectionTitle>Stagiaire</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={form.stagiaireFirstName} onChange={(v) => set("stagiaireFirstName", v)} required />
              <Field label="Nom" value={form.clientName} onChange={(v) => set("clientName", v)} required />
              <Field label="Établissement scolaire / universitaire" value={form.stagiaireSchool} onChange={(v) => set("stagiaireSchool", v)} required className="sm:col-span-2" />
              <Field label="Filière / Formation" value={form.stagiaireCourse} onChange={(v) => set("stagiaireCourse", v)} optional placeholder="Master 2 Informatique" />
              <Field label="Niveau d'études" value={form.stagiaireLevel} onChange={(v) => set("stagiaireLevel", v)} optional placeholder="Bac+4, Bac+5..." />
              <Field label="Enseignant référent" value={form.schoolSupervisorName} onChange={(v) => set("schoolSupervisorName", v)} optional />
            </div>
            {renderSenderSection("Entreprise d'accueil")}
            <SectionTitle>Détails du stage</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Objet du stage" value={form.stageObject} onChange={(v) => set("stageObject", v)} required className="sm:col-span-2" placeholder="Développement d'une application mobile..." />
              <Field label="Tuteur entreprise" value={form.companyTutorName} onChange={(v) => set("companyTutorName", v)} optional />
              <Field label="Lieu du stage" value={form.workLocation} onChange={(v) => set("workLocation", v)} optional placeholder="Siège ou télétravail" />
              <Field label="Date de début" value={form.stageStartDate} onChange={(v) => set("stageStartDate", v)} type="date" required />
              <Field label="Date de fin" value={form.stageEndDate} onChange={(v) => set("stageEndDate", v)} type="date" required />
              <Field label="Durée hebdomadaire (h)" value={form.stageWeeklyHours} onChange={(v) => set("stageWeeklyHours", v)} optional placeholder="35" />
              <Field label="Gratification horaire (€/h)" value={form.stageGratification} onChange={(v) => set("stageGratification", v)} optional placeholder="4,35 (min. légal 2025)" />
            </div>
            <TextArea label="Compétences à acquérir" value={form.stageSkills} onChange={(v) => set("stageSkills", v)} optional rows={3} />
            <TextArea label="Clauses particulières" value={form.notes} onChange={(v) => set("notes", v)} optional rows={2} />
          </>
        );

      case "attestation-de-formation":
        return (
          <>
            <SectionTitle>Organisme de formation</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom de l'organisme" value={form.organizationName} onChange={(v) => set("organizationName", v)} required className="sm:col-span-2" />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="SIRET" value={form.senderSiret} onChange={(v) => set("senderSiret", v)} optional />
              <Field label="N° Déclaration d'activité (NDA)" value={form.organizationNDA} onChange={(v) => set("organizationNDA", v)} optional placeholder="11 75 XXXXX 75" />
            </div>
            <SectionTitle>Bénéficiaire</SectionTitle>
            <Field label="Nom et prénom du bénéficiaire" value={form.traineeName} onChange={(v) => set("traineeName", v)} required className="mb-3" />
            <SectionTitle>Formation</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Intitulé de la formation" value={form.trainingTitle} onChange={(v) => set("trainingTitle", v)} required className="sm:col-span-2" />
              <Field label="Date de début" value={form.trainingStartDate} onChange={(v) => set("trainingStartDate", v)} type="date" required />
              <Field label="Date de fin" value={form.trainingEndDate} onChange={(v) => set("trainingEndDate", v)} type="date" required />
              <Field label="Durée totale (heures)" value={form.trainingHours} onChange={(v) => set("trainingHours", v)} optional placeholder="14" />
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Modalité</label>
                <select value={form.trainingModality} onChange={(e) => set("trainingModality", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option>Présentiel</option><option>Distanciel</option><option>Hybride</option>
                </select>
              </div>
              <Field label="Lieu" value={form.trainingLocation} onChange={(v) => set("trainingLocation", v)} optional className="sm:col-span-2" />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Résultat / Évaluation" value={form.trainingResult} onChange={(v) => set("trainingResult", v)} optional placeholder="Acquis / À approfondir / Excellent..." />
              <Field label="Certification obtenue" value={form.certificationObtained} onChange={(v) => set("certificationObtained", v)} optional placeholder="Ou laisser vide si non certifiante" />
            </div>
            <TextArea label="Objectifs pédagogiques" value={form.trainingObjectives} onChange={(v) => set("trainingObjectives", v)} optional rows={3} />
          </>
        );

      case "programme-de-formation":
        return (
          <>
            <SectionTitle>Organisme de formation</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom de l'organisme" value={form.organizationName} onChange={(v) => set("organizationName", v)} required className="sm:col-span-2" />
              <Field label="SIRET" value={form.senderSiret} onChange={(v) => set("senderSiret", v)} optional />
              <Field label="N° Déclaration d'activité (NDA)" value={form.organizationNDA} onChange={(v) => set("organizationNDA", v)} optional placeholder="11 75 XXXXX 75" />
            </div>
            <SectionTitle>Contenu de la formation</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Intitulé de la formation" value={form.trainingTitle} onChange={(v) => set("trainingTitle", v)} required className="sm:col-span-2" />
              <Field label="Public cible" value={form.trainingAudience} onChange={(v) => set("trainingAudience", v)} optional className="sm:col-span-2" placeholder="Managers, développeurs junior, toute personne..." />
              <Field label="Prérequis" value={form.prerequisites} onChange={(v) => set("prerequisites", v)} optional placeholder="Aucun / Bac+2 minimum..." />
              <Field label="Durée totale (heures)" value={form.trainingHours} onChange={(v) => set("trainingHours", v)} optional placeholder="21" />
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Modalité</label>
                <select value={form.trainingModality} onChange={(e) => set("trainingModality", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option>Présentiel</option><option>Distanciel</option><option>Hybride</option>
                </select>
              </div>
              <Field label="Prix HT" value={form.trainingPrice} onChange={(v) => set("trainingPrice", v)} optional placeholder="1 200" />
            </div>
            <div className="mt-3 space-y-3">
              <TextArea label="Objectifs pédagogiques" value={form.trainingObjectives} onChange={(v) => set("trainingObjectives", v)} rows={3} />
              <TextArea label="Contenu et programme (module par module)" value={form.trainingContent} onChange={(v) => set("trainingContent", v)} rows={6} placeholder={"Module 1 – Introduction (3h)\nModule 2 – Pratique (9h)\nModule 3 – Cas pratiques (6h)\nModule 4 – Évaluation (3h)"} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Méthodes pédagogiques" value={form.trainingMethods} onChange={(v) => set("trainingMethods", v)} optional placeholder="Cours magistral, ateliers pratiques, e-learning..." />
                <Field label="Modalités d'évaluation" value={form.trainingEvaluation} onChange={(v) => set("trainingEvaluation", v)} optional placeholder="QCM, mise en situation, grille d'évaluation..." />
                <Field label="Formateur(trice)" value={form.trainerName} onChange={(v) => set("trainerName", v)} optional className="sm:col-span-2" />
              </div>
            </div>
          </>
        );

      // ── Commerce / Logistique ───────────────────────────────────────────────
      case "bon-de-livraison":
        return (
          <>
            {renderSenderSection("Expéditeur / Vendeur")}
            {renderClientSection("Destinataire / Réceptionnaire")}
            <SectionTitle>Références de la livraison</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="N° bon de livraison" value={form.deliveryNumber} onChange={(v) => set("deliveryNumber", v)} required placeholder="BL-2025-001" />
              <Field label="Date de livraison" value={form.deliveryDate2} onChange={(v) => set("deliveryDate2", v)} type="date" required />
              <Field label="N° commande associé" value={form.relatedOrderNumber} onChange={(v) => set("relatedOrderNumber", v)} optional placeholder="CMD-2025-042" />
              <Field label="Transporteur" value={form.carrierName} onChange={(v) => set("carrierName", v)} optional className="sm:col-span-3" placeholder="Chronopost, Colissimo, DHL, propre transport..." />
            </div>
            <SectionTitle>Articles livrés</SectionTitle>
            <TextArea label="Désignation – Qté commandée – Qté livrée (un article par ligne)" value={form.deliveryItemsList} onChange={(v) => set("deliveryItemsList", v)} rows={6} placeholder={"Chemise Oxford bleue T42 – Cde: 10 – Livré: 10\nPantalon chino noir T40 – Cde: 5 – Livré: 4 (rupture)\nCeinture cuir marron – Cde: 3 – Livré: 3"} />
            <SectionTitle>État de la livraison</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Statut de la livraison</label>
                <select value={form.deliveryStatus} onChange={(e) => set("deliveryStatus", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                  <option>Conforme</option><option>Partielle</option><option>Non conforme</option>
                </select>
              </div>
              <Field label="Observations / Réserves" value={form.deliveryObservations} onChange={(v) => set("deliveryObservations", v)} optional placeholder="Colis endommagé, article manquant n°..." />
            </div>
          </>
        );

      case "note-de-credit":
        return (
          <>
            {renderSenderSection("Émetteur")}
            {renderClientSection("Client")}
            <SectionTitle>Références de l&apos;avoir</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="N° note de crédit" value={form.creditNoteNumber} onChange={(v) => set("creditNoteNumber", v)} required placeholder="AV-2025-001" />
              <Field label="Date" value={form.creditNoteDate} onChange={(v) => set("creditNoteDate", v)} type="date" required />
              <Field label="N° facture d'origine" value={form.relatedInvoiceNumber} onChange={(v) => set("relatedInvoiceNumber", v)} optional placeholder="FAC-2025-042" />
              <Field label="Motif de l'avoir" value={form.creditReason} onChange={(v) => set("creditReason", v)} required placeholder="Retour marchandise / Erreur de facturation / Geste commercial..." className="sm:col-span-3" />
            </div>
            <SectionTitle>Articles / Prestations crédités</SectionTitle>
            <TextArea label="Désignation – Qté – PU HT – TVA (un article par ligne)" value={form.creditItemsList} onChange={(v) => set("creditItemsList", v)} rows={5} placeholder={"Chemise Oxford bleue T42 – 2 – 25,00 € – 20%\nFrais de port – 1 – 8,50 € – 20%"} />
            <TextArea label="Notes" value={form.notes} onChange={(v) => set("notes", v)} optional rows={2} />
          </>
        );

      // ── Créatif / Communication ─────────────────────────────────────────────
      case "brief-creatif":
        return (
          <>
            <SectionTitle>Client et agence</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Annonceur / Entreprise cliente" value={form.clientName} onChange={(v) => set("clientName", v)} required className="sm:col-span-2" />
              <Field label="Email client" value={form.clientEmail} onChange={(v) => set("clientEmail", v)} type="email" optional />
              <Field label="Agence / Prestataire créatif" value={form.senderName} onChange={(v) => set("senderName", v)} required />
              <Field label="Chargé(e) de projet" value={form.projectManagerName} onChange={(v) => set("projectManagerName", v)} optional />
              <Field label="Date" value={form.date} onChange={(v) => set("date", v)} type="date" required />
            </div>
            <SectionTitle>Stratégie</SectionTitle>
            <div className="space-y-3">
              <TextArea label="Contexte et problématique" value={form.briefContext} onChange={(v) => set("briefContext", v)} rows={3} placeholder="Situation actuelle, pourquoi ce projet est nécessaire..." />
              <TextArea label="Objectifs de la campagne" value={form.campaignObjectives} onChange={(v) => set("campaignObjectives", v)} rows={3} placeholder="Notoriété, conversion, rétention, lancement produit..." />
              <TextArea label="Cible et audience" value={form.targetAudience} onChange={(v) => set("targetAudience", v)} rows={3} placeholder="25-40 ans, CSP+, urbains, intéressés par..." />
              <TextArea label="Message clé / Promesse" value={form.keyMessage} onChange={(v) => set("keyMessage", v)} rows={2} />
              <TextArea label="Ton et style (avec références)" value={form.toneStyle} onChange={(v) => set("toneStyle", v)} rows={3} optional placeholder="Moderne, épuré, inspirant. Références visuelles : Brand X, Y..." />
            </div>
            <SectionTitle>Cadrage</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Formats et supports" value={form.formatsAndSupports} onChange={(v) => set("formatsAndSupports", v)} optional placeholder="Instagram, Display, Affiche A3, Email HTML..." />
              <Field label="Budget (€ HT)" value={form.briefBudget} onChange={(v) => set("briefBudget", v)} optional />
              <Field label="Planning / Délais" value={form.briefTimeline} onChange={(v) => set("briefTimeline", v)} optional placeholder="Maquettes le 15/02, finale le 28/02" />
              <Field label="KPIs attendus" value={form.kpis} onChange={(v) => set("kpis", v)} optional placeholder="CTR >2%, 10K impressions, 500 leads..." />
              <Field label="Contraintes graphiques" value={form.graphicConstraints} onChange={(v) => set("graphicConstraints", v)} optional className="sm:col-span-2" placeholder="Charte couleurs, typographie imposée, logo obligatoire..." />
            </div>
          </>
        );

      case "cession-droits":
        return (
          <>
            <SectionTitle>Cédant (auteur / créateur)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Qualité" value={form.cedantQuality} onChange={(v) => set("cedantQuality", v)} optional placeholder="Photographe / Illustrateur / Compositeur..." />
              <Field label="Adresse" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} required />
              <Field label="Code postal et ville" value={form.senderCity} onChange={(v) => set("senderCity", v)} required />
              <Field label="SIRET (si société)" value={form.senderSiret} onChange={(v) => set("senderSiret", v)} optional />
              <Field label="Email" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} type="email" optional />
            </div>
            {renderClientSection("Cessionnaire (bénéficiaire)")}
            <SectionTitle>Œuvre concernée</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Titre / Dénomination de l'œuvre" value={form.workTitle} onChange={(v) => set("workTitle", v)} required className="sm:col-span-2" />
              <Field label="Nature de l'œuvre" value={form.workDescription} onChange={(v) => set("workDescription", v)} optional placeholder="Photographie / Illustration / Texte / Logiciel / Musique..." />
              <Field label="Date de création" value={form.workCreationDate} onChange={(v) => set("workCreationDate", v)} type="date" optional />
            </div>
            <SectionTitle>Droits cédés</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Droits cédés" value={form.rightsGranted} onChange={(v) => set("rightsGranted", v)} optional placeholder="Reproduction, représentation, adaptation..." className="sm:col-span-2" />
              <Field label="Territoire" value={form.rightsTerritories} onChange={(v) => set("rightsTerritories", v)} optional placeholder="France entière / Monde entier" />
              <Field label="Durée" value={form.rightsDuration} onChange={(v) => set("rightsDuration", v)} optional placeholder="5 ans / Perpétuelle" />
              <Field label="Contrepartie financière (€)" value={form.compensationAmount} onChange={(v) => set("compensationAmount", v)} optional placeholder="0 (gratuit) ou montant" />
              <Field label="Date du contrat" value={form.date} onChange={(v) => set("date", v)} type="date" required />
            </div>
            <TextArea label="Clauses particulières" value={form.notes} onChange={(v) => set("notes", v)} optional rows={3} />
          </>
        );

      // ── Admin général ───────────────────────────────────────────────────────
      case "compte-rendu-reunion":
        return (
          <>
            <SectionTitle>Informations générales</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Organisation / Entreprise" value={form.organizationName2} onChange={(v) => set("organizationName2", v)} optional className="sm:col-span-2" />
              <Field label="Titre de la réunion" value={form.meetingTitle} onChange={(v) => set("meetingTitle", v)} required className="sm:col-span-2" placeholder="Réunion de suivi projet / Comité de direction..." />
              <Field label="Date" value={form.meetingDate} onChange={(v) => set("meetingDate", v)} type="date" required />
              <Field label="Heure" value={form.meetingTime} onChange={(v) => set("meetingTime", v)} optional placeholder="14h00 – 16h00" />
              <Field label="Lieu / Lien visio" value={form.meetingLocation} onChange={(v) => set("meetingLocation", v)} optional className="sm:col-span-2" placeholder="Salle de réunion 2 / Teams..." />
              <Field label="Animateur(trice) / Secrétaire de séance" value={form.facilitatorName} onChange={(v) => set("facilitatorName", v)} optional className="sm:col-span-2" />
            </div>
            <SectionTitle>Participants</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextArea label="Présents" value={form.attendeesList} onChange={(v) => set("attendeesList", v)} rows={3} placeholder="Jean Dupont (CEO), Marie Martin (CTO)..." />
              <TextArea label="Excusés" value={form.absenteesList} onChange={(v) => set("absenteesList", v)} rows={3} optional placeholder="Paul Durand (Commercial)..." />
            </div>
            <SectionTitle>Contenu</SectionTitle>
            <div className="space-y-3">
              <TextArea label="Ordre du jour" value={form.agendaItems} onChange={(v) => set("agendaItems", v)} optional rows={3} placeholder={"1. Point sur le projet X\n2. Budget Q2\n3. Ressources humaines"} />
              <TextArea label="Points discutés, décisions et actions" value={form.minutesContent} onChange={(v) => set("minutesContent", v)} rows={8} placeholder={"Point 1 – Projet X :\n- Avancement : 60% du développement terminé\n- Décision : Replanification livraison au 15/03\n- Action : Jean envoie le plan révisé avant le 28/02\n\nPoint 2 – Budget Q2 :\n- Constat : dépassement de 10%\n- Décision : gel des recrutements jusqu'en avril"} />
              <Field label="Prochaine réunion" value={form.nextMeetingDate} onChange={(v) => set("nextMeetingDate", v)} type="date" optional />
            </div>
          </>
        );

      case "rapport":
        return (
          <>
            <SectionTitle>Auteur et destinataire</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Auteur(s)" value={form.senderName} onChange={(v) => set("senderName", v)} required className="sm:col-span-2" />
              <Field label="Email" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} type="email" optional />
              <Field label="Destinataire(s)" value={form.reportRecipient} onChange={(v) => set("reportRecipient", v)} required className="sm:col-span-2" />
            </div>
            <SectionTitle>Rapport</SectionTitle>
            <Field label="Titre du rapport" value={form.report2Title} onChange={(v) => set("report2Title", v)} required placeholder="Ex : Rapport annuel d'activité / Rapport d'audit..." className="mb-3" />
            <div className="space-y-3">
              <TextArea label="Résumé exécutif" value={form.report2Executive} onChange={(v) => set("report2Executive", v)} rows={3} optional placeholder="Synthèse en quelques lignes des points clés..." />
              <TextArea label="Introduction / Contexte" value={form.report2Introduction} onChange={(v) => set("report2Introduction", v)} rows={3} />
              <TextArea label="Résultats et constats" value={form.report2Results} onChange={(v) => set("report2Results", v)} rows={4} />
              <TextArea label="Analyse" value={form.report2Analysis} onChange={(v) => set("report2Analysis", v)} rows={3} optional />
              <TextArea label="Recommandations" value={form.report2Recommendations} onChange={(v) => set("report2Recommendations", v)} rows={4} />
              <TextArea label="Conclusion" value={form.report2Conclusion} onChange={(v) => set("report2Conclusion", v)} rows={2} optional />
              <TextArea label="Annexes (optionnel)" value={form.notes} onChange={(v) => set("notes", v)} rows={2} optional />
            </div>
          </>
        );

      case "attestation":
        return (
          <>
            <SectionTitle>Émetteur de l&apos;attestation</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom / Raison sociale" value={form.attestationIssuerName} onChange={(v) => set("attestationIssuerName", v)} required className="sm:col-span-2" />
              <Field label="Qualité / Titre" value={form.attestationIssuerQuality} onChange={(v) => set("attestationIssuerQuality", v)} optional placeholder="DRH, Directeur, Notaire, Employeur..." />
              <Field label="SIRET" value={form.attestationIssuerSiret} onChange={(v) => set("attestationIssuerSiret", v)} optional />
              <Field label="Adresse" value={form.attestationIssuerAddress} onChange={(v) => set("attestationIssuerAddress", v)} optional className="sm:col-span-2" />
            </div>
            <SectionTitle>Bénéficiaire</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prénom du bénéficiaire" value={form.beneficiaryFirstName} onChange={(v) => set("beneficiaryFirstName", v)} optional />
              <Field label="Nom du bénéficiaire" value={form.clientName} onChange={(v) => set("clientName", v)} required />
            </div>
            <SectionTitle>Objet et date</SectionTitle>
            <TextArea label="Objet de l'attestation" value={form.attestationObject} onChange={(v) => set("attestationObject", v)} rows={5} placeholder="Ex : M. MARTIN Paul est salarié de l'entreprise XYZ SAS depuis le 01/01/2022 au poste de Développeur Senior, CDI, à temps plein.\n\nLe salaire brut mensuel est de 3 500 €." />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Lieu" value={form.attestationLocation2} onChange={(v) => set("attestationLocation2", v)} required placeholder="Paris" />
              <Field label="Date" value={form.attestationDateField} onChange={(v) => set("attestationDateField", v)} type="date" required />
            </div>
          </>
        );

      // ── Lettre formelle ───────────────────────────────────────────────────
      case "lettre":
        return (
          <>
            {renderSenderSection("Expéditeur")}

            <SectionTitle>Destinataire</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Civilité"
                value={form.recipientTitle}
                onChange={(v) => set("recipientTitle", v)}
                optional
                placeholder="M. / Mme / Dr. / Me"
              />
              <Field
                label="Nom / Raison sociale"
                value={form.recipientName}
                onChange={(v) => set("recipientName", v)}
                required
                placeholder="Ex : Madame Martin ou Direction des Ressources Humaines"
              />
              <Field
                label="Adresse"
                value={form.recipientAddress}
                onChange={(v) => set("recipientAddress", v)}
                required
                placeholder="10 place Vendôme"
              />
              <Field
                label="Code postal et ville"
                value={form.recipientCity}
                onChange={(v) => set("recipientCity", v)}
                required
                placeholder="75001 Paris"
              />
            </div>

            <SectionTitle>En-tête de la lettre</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Lieu d'émission"
                value={form.city}
                onChange={(v) => set("city", v)}
                required
                placeholder="Paris"
              />
              <Field
                label="Date"
                value={form.date}
                onChange={(v) => set("date", v)}
                type="date"
                required
              />
              <Field
                label="Objet"
                value={form.subject}
                onChange={(v) => set("subject", v)}
                required
                className="sm:col-span-2"
                placeholder="Ex : Résiliation de contrat / Candidature au poste de... / Demande de..."
              />
            </div>

            <SectionTitle>Corps de la lettre</SectionTitle>
            <TextArea
              label="Contenu"
              value={form.body}
              onChange={(v) => set("body", v)}
              rows={10}
              placeholder={"Madame, Monsieur,\n\nJe me permets de vous contacter au sujet de..."}
            />
            <div>
              <Field
                label="Formule de politesse"
                value={form.closing}
                onChange={(v) => set("closing", v)}
              />
            </div>
          </>
        );
    }
  };

  // ─── Shared action buttons (download + save) ───────────────────────────────

  const renderActions = () => (
    <div className="flex flex-col gap-3">
      {/* Profession suggestion panel */}
      {profession && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10 space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-400">
            <Sparkles className="h-3.5 w-3.5" />
            Suggestions pour {profession}
          </p>

          {/* Filename */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Nom du fichier
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none dark:border-violet-500/30 dark:bg-neutral-800 dark:text-white"
              placeholder={TYPE_LABELS[type]}
            />
          </div>

          {/* Folder */}
          {folders.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Dossier de destination
              </label>
              <select
                value={selectedFolderId ?? ""}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-400 focus:outline-none dark:border-violet-500/30 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Sans dossier</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {suggestedFolderName && !selectedFolderId && (
                <p className="mt-1 text-xs text-violet-500">
                  💡 Dossier suggéré : &ldquo;{suggestedFolderName}&rdquo; — créez-le d&apos;abord si besoin
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row">
        <button
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
        >
          <Download className="h-4 w-4" />
          {t("downloadPdf")}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || savedSuccess}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition disabled:cursor-not-allowed ${
            savedSuccess
              ? "border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle className="h-4 w-4" /> {t("savedToDocuSafe")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> {t("saveToDocuSafe")}
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/create")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {TYPE_LABELS[type]}
          </h1>
          <p className="text-xs text-neutral-400">
            Remplissez les champs puis générez votre document
          </p>
        </div>
        <button
          onClick={() => {
            setShowAiHelper((v) => !v);
            setAiError(null);
          }}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
            showAiHelper
              ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
              : "border border-neutral-200 bg-white text-neutral-600 hover:border-violet-300 hover:text-violet-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-violet-400"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Aide IA</span>
        </button>
      </div>

      {/* Two-column layout on desktop when PDF exists, single column otherwise */}
      <div className={pdfUrl ? "lg:grid lg:grid-cols-2 lg:gap-5 lg:items-start" : undefined}>

        {/* ── Left column: form + generate ────────────────────────────────── */}
        <div className="space-y-5">
          {/* AI Helper panel */}
          {showAiHelper && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-semibold text-violet-700 dark:text-violet-400">
                  Aide IA — décris ce que tu veux créer
                </span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    handleAiAssist();
                }}
                placeholder={
                  type === "facture"
                    ? "Ex : Je facture Acme Corp pour 3 jours de développement à 800 € /jour, TVA 20%, paiement sous 30 jours."
                    : type === "devis"
                    ? "Ex : Devis pour la création d'un logo pour la startup TechNow, 1 500 € HT, valable 1 mois."
                    : type === "contrat"
                    ? "Ex : Contrat avec Dupont SAS pour une mission de conseil en marketing du 1er mars au 30 juin 2024, forfait 8 000 €."
                    : type === "bon-de-commande"
                    ? "Ex : Commander 10 licences logicielles à 200 €/unité au fournisseur SoftCo, livraison le 15 mars."
                    : "Ex : Lettre de résiliation de contrat d'abonnement adressée à Orange, pour le contrat n°123456."
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition dark:border-violet-500/30 dark:bg-neutral-800 dark:text-white"
              />
              {aiError && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {aiError}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleAiAssist}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Remplir le formulaire
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAiHelper(false);
                    setAiPrompt("");
                    setAiError(null);
                  }}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-neutral-500 transition hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  <X className="h-3.5 w-3.5" />
                  Fermer
                </button>
                <span className="ml-auto hidden text-xs text-neutral-400 sm:block">
                  ⌘↵ pour envoyer
                </span>
              </div>
            </div>
          )}

          {/* Form card */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            {renderForm()}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                {t("generatePdf")}
              </>
            )}
          </button>

          {/* Actions on mobile (below generate button) */}
          {pdfUrl && <div className="lg:hidden">{renderActions()}</div>}
        </div>

        {/* ── Right column: sticky preview (desktop only) ──────────────────── */}
        {pdfUrl && (
          <div className="mt-5 lg:mt-0 lg:sticky lg:top-5 space-y-3">
            {/* Actions on desktop (top of right column) */}
            <div className="hidden lg:block">{renderActions()}</div>

            {/* PDF Preview */}
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-neutral-400" />
                  Aperçu du document
                </span>
                <span className="text-xs text-neutral-400">
                  {showPreview ? "Masquer" : "Afficher"}
                </span>
              </button>
              {showPreview && (
                <iframe
                  src={pdfUrl}
                  title="Aperçu PDF"
                  className="w-full border-t border-neutral-100 dark:border-neutral-800"
                  style={{ height: "75vh", minHeight: "500px" }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
