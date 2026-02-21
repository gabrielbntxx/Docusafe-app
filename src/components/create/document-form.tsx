"use client";

import { useState } from "react";
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
  | "facture"
  | "devis"
  | "contrat"
  | "bon-de-commande"
  | "lettre";

const TYPE_LABELS: Record<DocType, string> = {
  facture: "Facture",
  devis: "Devis",
  contrat: "Contrat de prestation",
  "bon-de-commande": "Bon de commande",
  lettre: "Lettre formelle",
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
}

export function DocumentForm({ type }: DocumentFormProps) {
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
      fd.append(
        "file",
        pdfBlob,
        `${TYPE_LABELS[type].replace(/ /g, "_")}_${Date.now()}.pdf`
      );
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
            <div className="mt-3">
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
