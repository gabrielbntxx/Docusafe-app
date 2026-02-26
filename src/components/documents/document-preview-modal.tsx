"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText, Image as ImageIcon, File, AlertCircle, Loader2, Music, Video, FileCode, Sparkles, Calendar, Tag, User, DollarSign, Hash, AlertTriangle, Clock, CheckCircle, Building2, Briefcase, Home, Heart, GraduationCap, Scale, Car, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

type Document = {
  id: string;
  displayName: string;
  fileType: string;
  mimeType: string;
  sizeBytes?: number;
  aiAnalyzed?: number;
  aiDocumentType?: string | null;
  aiCategory?: string | null;
  aiConfidence?: number | null;
  aiExtractedData?: string | null;
  expiryDate?: string | null;
};

// MIME types that can be displayed as text
const TEXT_MIME_TYPES = new Set([
  "text/plain", "text/csv", "text/markdown", "text/html", "text/xml",
  "application/json", "application/xml", "application/javascript",
  "text/css", "text/javascript", "application/x-yaml", "text/yaml",
]);

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function isTextPreviewable(mimeType: string): boolean {
  return TEXT_MIME_TYPES.has(mimeType) || mimeType.startsWith("text/");
}

type DocumentPreviewModalProps = {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
};

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
}: DocumentPreviewModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blobMimeType, setBlobMimeType] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [xlsxSheets, setXlsxSheets] = useState<{ name: string; data: string[][] }[] | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);

  // Fetch document and create blob URL
  useEffect(() => {
    let currentBlobUrl: string | null = null;

    if (document && isOpen) {
      setIsLoading(true);
      setHasError(false);
      setBlobUrl(null);
      setBlobMimeType(null);
      setTextContent(null);
      setDocxHtml(null);
      setXlsxSheets(null);
      setActiveSheet(0);

      fetch(`/api/documents/${document.id}/view`)
        .then(async (response) => {
          if (!response.ok) throw new Error("Failed to fetch document");

          // .docx → convert to HTML using mammoth
          if (document.mimeType === DOCX_MIME) {
            const arrayBuffer = await response.arrayBuffer();
            const mammoth = await import("mammoth");
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setDocxHtml(result.value || "<p><em>Document vide</em></p>");
            setIsLoading(false);
            return;
          }

          // .xlsx → parse with SheetJS
          if (document.mimeType === XLSX_MIME) {
            const arrayBuffer = await response.arrayBuffer();
            const XLSX = await import("xlsx");
            const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
            const sheets = workbook.SheetNames.map((name) => ({
              name,
              data: (XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "" }) as string[][]),
            }));
            setXlsxSheets(sheets.length > 0 ? sheets : null);
            setIsLoading(false);
            return;
          }

          // For text-previewable files, read as text
          if (isTextPreviewable(document.mimeType)) {
            const text = await response.text();
            setTextContent(text);
            setIsLoading(false);
            return;
          }

          // Default: create blob URL (PDF, image, audio, video)
          const blob = await response.blob();
          currentBlobUrl = URL.createObjectURL(blob);
          setBlobUrl(currentBlobUrl);
          setBlobMimeType(blob.type || document.mimeType);
          setIsLoading(false);
        })
        .catch(() => {
          setHasError(true);
          setIsLoading(false);
        });
    }

    // Cleanup blob URL when component unmounts or document changes
    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [document?.id, isOpen]);

  if (!isOpen || !document) return null;

  const getFileIcon = () => {
    if (document.fileType === "pdf") return FileText;
    if (document.fileType === "image") return ImageIcon;
    if (document.fileType === "audio") return Music;
    if (document.fileType === "video") return Video;
    return File;
  };

  const Icon = getFileIcon();

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = document.displayName;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error("Download error:", error);
      setHasError(true);
    }
  };

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 lg:pl-72"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-6xl rounded-t-3xl sm:rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 p-4 flex-shrink-0 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/50 dark:to-secondary-900/50 flex-shrink-0">
              <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                {document.displayName}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {document.fileType.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="hidden sm:flex border-neutral-300 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("download")}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              className="sm:hidden border-neutral-300 dark:border-neutral-600 dark:text-neutral-200"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* AI Metadata Strip */}
        {document.aiAnalyzed === 1 && (() => {
          let extracted: Record<string, string> = {};
          if (document.aiExtractedData) {
            try { extracted = JSON.parse(document.aiExtractedData); } catch {}
          }
          const daysLeft = document.expiryDate
            ? Math.floor((new Date(document.expiryDate).getTime() - Date.now()) / 86400000)
            : null;
          const expiryLabel = daysLeft === null ? null
            : daysLeft < 0 ? { text: "Expiré", cls: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400", Icon: AlertTriangle }
            : daysLeft <= 30 ? { text: `Expire dans ${daysLeft}j`, cls: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400", Icon: AlertTriangle }
            : daysLeft <= 90 ? { text: `${daysLeft}j restants`, cls: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400", Icon: Clock }
            : { text: `Valide ${daysLeft}j`, cls: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400", Icon: CheckCircle };

          const chips: { Icon: React.ElementType; label: string; value: string }[] = [];
          if (document.aiCategory) chips.push({ Icon: Tag, label: "Catégorie", value: document.aiCategory });
          if (extracted.issuer || extracted.fournisseur) chips.push({ Icon: Building2, label: "Émetteur", value: extracted.issuer || extracted.fournisseur });
          if (extracted.montantTTC || extracted.amount) chips.push({ Icon: DollarSign, label: "Montant", value: extracted.montantTTC || extracted.amount });
          if (extracted.date) chips.push({ Icon: Calendar, label: "Date", value: extracted.date });
          if (extracted.reference || extracted.numeroFacture) chips.push({ Icon: Hash, label: "Réf.", value: extracted.reference || extracted.numeroFacture });
          if (extracted.subject) chips.push({ Icon: FileText, label: "Sujet", value: extracted.subject });

          // Pass 2 enriched fields — Finance
          if (extracted.montantHT) chips.push({ Icon: DollarSign, label: "HT", value: extracted.montantHT });
          if (extracted.tva) chips.push({ Icon: DollarSign, label: "TVA", value: extracted.tva });
          if (extracted.iban) chips.push({ Icon: CreditCard, label: "IBAN", value: extracted.iban });

          // Pass 2 enriched fields — Identity
          if (extracted.nom && extracted.prenom) chips.push({ Icon: User, label: "Identité", value: `${extracted.prenom} ${extracted.nom}` });
          else if (extracted.nom) chips.push({ Icon: User, label: "Nom", value: extracted.nom });
          if (extracted.numeroDocument) chips.push({ Icon: Hash, label: "N° doc", value: extracted.numeroDocument });
          if (extracted.dateNaissance) chips.push({ Icon: Calendar, label: "Naissance", value: extracted.dateNaissance });
          if (extracted.nationalite) chips.push({ Icon: User, label: "Nationalité", value: extracted.nationalite });

          // Pass 2 enriched fields — Employment
          if (extracted.employeur) chips.push({ Icon: Briefcase, label: "Employeur", value: extracted.employeur });
          if (extracted.poste) chips.push({ Icon: Briefcase, label: "Poste", value: extracted.poste });
          if (extracted.salaireNet) chips.push({ Icon: DollarSign, label: "Net", value: extracted.salaireNet });
          if (extracted.salaireBrut && !extracted.salaireNet) chips.push({ Icon: DollarSign, label: "Brut", value: extracted.salaireBrut });
          if (extracted.contratType) chips.push({ Icon: FileText, label: "Contrat", value: extracted.contratType });

          // Pass 2 enriched fields — Housing
          if (extracted.adresseBien) chips.push({ Icon: Home, label: "Adresse", value: extracted.adresseBien });
          if (extracted.loyer) chips.push({ Icon: DollarSign, label: "Loyer", value: extracted.loyer });
          if (extracted.surface) chips.push({ Icon: Home, label: "Surface", value: extracted.surface });
          if (extracted.proprietaire) chips.push({ Icon: User, label: "Propriétaire", value: extracted.proprietaire });

          // Pass 2 enriched fields — Health
          if (extracted.medecin) chips.push({ Icon: Heart, label: "Médecin", value: extracted.medecin });
          if (extracted.patient) chips.push({ Icon: User, label: "Patient", value: extracted.patient });
          if (extracted.traitement) chips.push({ Icon: Heart, label: "Traitement", value: extracted.traitement });

          // Pass 2 enriched fields — Education
          if (extracted.etablissement) chips.push({ Icon: GraduationCap, label: "Établissement", value: extracted.etablissement });
          if (extracted.diplome) chips.push({ Icon: GraduationCap, label: "Diplôme", value: extracted.diplome });
          if (extracted.mention) chips.push({ Icon: GraduationCap, label: "Mention", value: extracted.mention });

          // Pass 2 enriched fields — Legal
          if (extracted.parties) chips.push({ Icon: Scale, label: "Parties", value: extracted.parties });
          if (extracted.typeActe) chips.push({ Icon: Scale, label: "Acte", value: extracted.typeActe });
          if (extracted.notaire) chips.push({ Icon: User, label: "Notaire", value: extracted.notaire });

          // Pass 2 enriched fields — Vehicle
          if (extracted.immatriculation) chips.push({ Icon: Car, label: "Immat.", value: extracted.immatriculation });
          if (extracted.marque && extracted.modele) chips.push({ Icon: Car, label: "Véhicule", value: `${extracted.marque} ${extracted.modele}` });
          else if (extracted.marque) chips.push({ Icon: Car, label: "Marque", value: extracted.marque });

          // Pass 2 enriched fields — Insurance
          if (extracted.dateDebut && extracted.dateFin) chips.push({ Icon: Shield, label: "Validité", value: `${extracted.dateDebut} → ${extracted.dateFin}` });

          if (chips.length === 0 && !expiryLabel) return null;

          // Limit displayed chips to avoid overflow, show rest in a collapsible section
          const mainChips = chips.slice(0, 6);
          const extraChips = chips.slice(6);

          return (
            <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mr-1">
                  <Sparkles className="h-3 w-3" />
                  IA
                </span>
                {expiryLabel && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${expiryLabel.cls}`}>
                    <expiryLabel.Icon className="h-3 w-3" />
                    {expiryLabel.text}
                  </span>
                )}
                {mainChips.map((chip) => (
                  <span key={chip.label} className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 shadow-sm">
                    <chip.Icon className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                    <span className="font-medium text-neutral-500 dark:text-neutral-400">{chip.label}:</span>
                    <span className="truncate max-w-[150px]">{chip.value}</span>
                  </span>
                ))}
                {document.aiConfidence != null && (
                  <span className="ml-auto text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                    {Math.round(document.aiConfidence * 100)}% confiance
                  </span>
                )}
              </div>
              {extraChips.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {extraChips.map((chip) => (
                    <span key={chip.label} className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 shadow-sm">
                      <chip.Icon className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                      <span className="font-medium text-neutral-500 dark:text-neutral-400">{chip.label}:</span>
                      <span className="truncate max-w-[150px]">{chip.value}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Content */}
        <div className="relative flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-950">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-950 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("loading") || "Chargement..."}</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {hasError ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-lg font-medium text-neutral-900 dark:text-white">
                {t("fileNotAvailable") || "Fichier non disponible"}
              </p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                {t("fileNotAvailableDesc") || "Le fichier n'est pas accessible actuellement. Veuillez réessayer plus tard ou contacter le support."}
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="mt-6 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {t("close") || "Fermer"}
              </Button>
            </div>
          ) : (document.fileType === "pdf" || blobMimeType === "application/pdf") && blobUrl ? (
            <iframe
              src={blobUrl}
              className="h-full w-full min-h-[60vh]"
              title={document.displayName}
            />
          ) : document.fileType === "image" && blobUrl ? (
            <div className="flex items-center justify-center h-full min-h-[60vh] p-4 sm:p-8">
              <img
                src={blobUrl}
                alt={document.displayName}
                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          ) : document.fileType === "audio" && blobUrl ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-4 sm:p-8">
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl">
                <Music className="h-16 w-16 text-white" />
              </div>
              <p className="mb-6 text-lg font-medium text-neutral-900 dark:text-white text-center">
                {document.displayName}
              </p>
              <audio
                src={blobUrl}
                controls
                autoPlay={false}
                className="w-full max-w-md rounded-xl shadow-lg"
                style={{ outline: 'none' }}
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          ) : document.fileType === "video" && blobUrl ? (
            <div className="flex items-center justify-center h-full min-h-[60vh] p-4 sm:p-8">
              <video
                src={blobUrl}
                controls
                autoPlay={false}
                className="max-h-full max-w-full rounded-xl shadow-2xl"
                style={{ outline: 'none' }}
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          ) : docxHtml !== null ? (
            <div className="h-full min-h-[60vh] overflow-auto p-4 sm:p-8">
              <div className="mx-auto max-w-3xl rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-t-xl">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Word · .docx</span>
                </div>
                <div
                  className="docx-preview p-6 text-sm leading-relaxed text-neutral-900 dark:text-neutral-100 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-neutral-900 dark:[&_h1]:text-white [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_td]:border [&_td]:border-neutral-200 dark:[&_td]:border-neutral-700 [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-neutral-200 dark:[&_th]:border-neutral-700 [&_th]:px-3 [&_th]:py-1.5 [&_th]:font-semibold [&_th]:bg-neutral-50 dark:[&_th]:bg-neutral-800"
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              </div>
            </div>
          ) : xlsxSheets !== null ? (
            <div className="flex h-full min-h-[60vh] flex-col overflow-hidden">
              {/* Sheet tabs */}
              {xlsxSheets.length > 1 && (
                <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 pt-3 flex-shrink-0">
                  {xlsxSheets.map((sheet, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSheet(i)}
                      className={`flex-shrink-0 rounded-t-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                        i === activeSheet
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-x border-t border-neutral-200 dark:border-neutral-700"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              )}
              {/* Table */}
              <div className="flex-1 overflow-auto p-4">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-auto bg-white dark:bg-neutral-900 shadow-sm">
                  {xlsxSheets[activeSheet]?.data.length > 0 ? (
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-emerald-50 dark:bg-emerald-500/10">
                          {(xlsxSheets[activeSheet].data[0] || []).map((cell, ci) => (
                            <th
                              key={ci}
                              className="px-3 py-2 text-left font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap border-r border-neutral-200 dark:border-neutral-700 last:border-0"
                            >
                              {String(cell ?? "")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {xlsxSheets[activeSheet].data.slice(1).map((row, ri) => (
                          <tr
                            key={ri}
                            className={`border-b border-neutral-100 dark:border-neutral-800 last:border-0 ${
                              ri % 2 === 0 ? "" : "bg-neutral-50 dark:bg-neutral-800/30"
                            }`}
                          >
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="px-3 py-1.5 text-neutral-800 dark:text-neutral-200 whitespace-nowrap border-r border-neutral-100 dark:border-neutral-800 last:border-0"
                              >
                                {String(cell ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-6 text-sm text-neutral-400 text-center">Feuille vide</p>
                  )}
                </div>
              </div>
            </div>
          ) : textContent !== null ? (
            <div className="h-full min-h-[60vh] p-4 sm:p-8">
              <div className="h-full rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg overflow-auto">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-t-xl">
                  <FileCode className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{document.mimeType.split("/").pop()}</span>
                </div>
                <pre className="p-4 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words font-mono leading-relaxed overflow-auto max-h-[calc(90vh-200px)]">
                  {textContent}
                </pre>
              </div>
            </div>
          ) : !isLoading && !hasError ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-neutral-200 dark:bg-neutral-800">
                <Icon className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="text-lg font-medium text-neutral-900 dark:text-white">
                {t("previewNotAvailable")}
              </p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {t("downloadToView")}
              </p>
              <Button
                onClick={handleDownload}
                className="mt-6"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {t("download")}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
