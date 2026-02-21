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
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
    senderEmail: "",
    senderPhone: "",
    // Client / Recipient
    clientName: "",
    clientAddress: "",
    clientCity: "",
    clientEmail: "",
    // Invoice
    invoiceNumber: "",
    invoiceDate: today(),
    dueDate: "",
    paymentTerms: "Virement bancaire sous 30 jours",
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
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          paymentTerms: form.paymentTerms || undefined,
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

  // ─── Reusable field components ─────────────────────────────────────────────

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white";

  const Field = ({
    label,
    field,
    type: inputType = "text",
    placeholder = "",
    required = false,
    className = "",
  }: {
    label: string;
    field: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
  }) => (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <input
        type={inputType}
        value={(form as any)[field]}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  const TextArea = ({
    label,
    field,
    placeholder = "",
    rows = 3,
  }: {
    label: string;
    field: string;
    placeholder?: string;
    rows?: number;
  }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </label>
      <textarea
        value={(form as any)[field]}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-none`}
      />
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-neutral-400 first:mt-0 dark:text-neutral-500">
      {children}
    </h3>
  );

  // ─── Line items ────────────────────────────────────────────────────────────

  const showItems =
    type === "facture" || type === "devis" || type === "bon-de-commande";
  const showReference = type === "bon-de-commande";
  const showVat = type !== "bon-de-commande";

  const addItem = () =>
    setItems([
      ...items,
      { description: "", quantity: 1, unitPrice: 0, vatRate: 20 },
    ]);
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string | number) =>
    setItems(
      items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );

  const cellClass =
    "rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-white w-full";

  // ─── Shared section renderers ──────────────────────────────────────────────

  const renderSenderSection = (title: string) => (
    <>
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Nom / Entreprise"
          field="senderName"
          required
          className="sm:col-span-2"
        />
        <Field label="Adresse" field="senderAddress" required />
        <Field label="Ville, Code postal" field="senderCity" required />
        <Field label="SIRET" field="senderSiret" placeholder="123 456 789 00012" />
        <Field label="Email" field="senderEmail" type="email" />
        <Field
          label="Téléphone"
          field="senderPhone"
          placeholder="+33 6 00 00 00 00"
        />
      </div>
    </>
  );

  const renderClientSection = (title: string) => (
    <>
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Nom / Entreprise"
          field="clientName"
          required
          className="sm:col-span-2"
        />
        <Field label="Adresse" field="clientAddress" required />
        <Field label="Ville, Code postal" field="clientCity" required />
        <Field label="Email" field="clientEmail" type="email" />
      </div>
    </>
  );

  const renderLineItems = () => (
    <>
      <SectionTitle>{t("lineItems")}</SectionTitle>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60"
          >
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
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
                placeholder="Description"
                className={`${showReference ? "col-span-2 sm:col-span-3" : "col-span-2"} ${cellClass}`}
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", Number(e.target.value))
                }
                placeholder="Qté"
                className={cellClass}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(i, "unitPrice", Number(e.target.value))
                }
                placeholder="P.U. HT (€)"
                className={cellClass}
              />
              {showVat && (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.vatRate}
                  onChange={(e) =>
                    updateItem(i, "vatRate", Number(e.target.value))
                  }
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
      case "facture":
        return (
          <>
            <SectionTitle>Détails de la facture</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="N° Facture"
                field="invoiceNumber"
                placeholder="FAC-2024-001"
                required
              />
              <Field label="Date" field="invoiceDate" type="date" required />
              <Field
                label="Date d'échéance"
                field="dueDate"
                type="date"
                required
              />
            </div>
            {renderSenderSection("De")}
            {renderClientSection("Facturé à")}
            {renderLineItems()}
            <SectionTitle>Notes</SectionTitle>
            <div className="grid gap-3">
              <TextArea
                label="Notes"
                field="notes"
                placeholder="Informations complémentaires..."
              />
              <Field
                label="Conditions de paiement"
                field="paymentTerms"
                placeholder="Virement bancaire sous 30 jours"
              />
            </div>
          </>
        );

      case "devis":
        return (
          <>
            <SectionTitle>Détails du devis</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="N° Devis"
                field="quoteNumber"
                placeholder="DEV-2024-001"
                required
              />
              <Field label="Date" field="quoteDate" type="date" required />
              <Field
                label="Valable jusqu'au"
                field="validUntil"
                type="date"
                required
              />
            </div>
            {renderSenderSection("Prestataire")}
            {renderClientSection("Client")}
            {renderLineItems()}
            <SectionTitle>Notes</SectionTitle>
            <TextArea
              label="Notes"
              field="notes"
              placeholder="Conditions particulières..."
            />
          </>
        );

      case "contrat":
        return (
          <>
            {renderSenderSection("Prestataire")}
            {renderClientSection("Client")}
            <SectionTitle>Mission</SectionTitle>
            <div className="grid gap-3">
              <Field
                label="Titre de la mission"
                field="missionTitle"
                placeholder="Développement d'une application web"
                required
              />
              <TextArea
                label="Description"
                field="missionDescription"
                placeholder="Décrire les livrables attendus..."
                rows={4}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date de début" field="startDate" type="date" required />
                <Field label="Date de fin" field="endDate" type="date" required />
              </div>
            </div>
            <SectionTitle>Rémunération</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="Montant (€)"
                field="rate"
                placeholder="5000"
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
                  <option value="fixed">Forfait</option>
                  <option value="daily">Journalier (TJM)</option>
                  <option value="hourly">Horaire</option>
                </select>
              </div>
              <Field
                label="Modalités de paiement"
                field="paymentSchedule"
                placeholder="50% à la commande, 50% à la livraison"
              />
            </div>
            <SectionTitle>Clauses optionnelles</SectionTitle>
            <div className="grid gap-3">
              <TextArea
                label="Obligations des parties"
                field="obligations"
                placeholder="Décrire les obligations de chaque partie..."
              />
              <TextArea
                label="Clause de résiliation (vide = clause par défaut)"
                field="terminationClause"
                placeholder="Chaque partie peut résilier..."
              />
            </div>
          </>
        );

      case "bon-de-commande":
        return (
          <>
            <SectionTitle>Détails de la commande</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field
                label="N° Commande"
                field="orderNumber"
                placeholder="CMD-2024-001"
                required
              />
              <Field label="Date" field="orderDate" type="date" required />
              <Field
                label="Date de livraison souhaitée"
                field="deliveryDate"
                type="date"
              />
            </div>
            <SectionTitle>Acheteur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nom / Entreprise"
                field="buyerName"
                required
                className="sm:col-span-2"
              />
              <Field label="Adresse" field="buyerAddress" required />
              <Field label="Ville, Code postal" field="buyerCity" required />
              <Field label="Email" field="buyerEmail" type="email" />
            </div>
            <SectionTitle>Fournisseur</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nom / Entreprise"
                field="vendorName"
                required
                className="sm:col-span-2"
              />
              <Field label="Adresse" field="vendorAddress" required />
              <Field label="Ville, Code postal" field="vendorCity" required />
              <Field label="Email" field="vendorEmail" type="email" />
            </div>
            {renderLineItems()}
            <SectionTitle>Informations complémentaires</SectionTitle>
            <div className="grid gap-3">
              <Field
                label="Conditions de livraison"
                field="deliveryTerms"
                placeholder="Franco de port à l'adresse de l'acheteur"
              />
              <TextArea
                label="Notes"
                field="notes"
                placeholder="Informations complémentaires..."
              />
            </div>
          </>
        );

      case "lettre":
        return (
          <>
            {renderSenderSection("Expéditeur")}
            <SectionTitle>Destinataire</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nom / Entreprise"
                field="recipientName"
                required
                className="sm:col-span-2"
              />
              <Field label="Adresse" field="recipientAddress" required />
              <Field label="Ville, Code postal" field="recipientCity" required />
            </div>
            <SectionTitle>En-tête</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Lieu" field="city" placeholder="Paris" required />
              <Field label="Date" field="date" type="date" required />
              <Field
                label="Objet"
                field="subject"
                required
                className="sm:col-span-2"
                placeholder="Candidature / Résiliation / Demande de..."
              />
            </div>
            <SectionTitle>Corps de la lettre</SectionTitle>
            <TextArea
              label="Contenu"
              field="body"
              rows={10}
              placeholder={"Madame, Monsieur,\n\nJe me permets de vous contacter au sujet de..."}
            />
            <div className="mt-3">
              <Field label="Formule de politesse" field="closing" />
            </div>
          </>
        );
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/create")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {TYPE_LABELS[type]}
          </h1>
          <p className="text-xs text-neutral-400">
            Remplissez les champs puis générez votre document
          </p>
        </div>
      </div>

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

      {/* Post-generation actions */}
      {pdfUrl && (
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
                <Loader2 className="h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                {t("savedToDocuSafe")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("saveToDocuSafe")}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
