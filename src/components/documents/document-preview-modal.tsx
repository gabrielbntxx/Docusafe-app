"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText, Image as ImageIcon, File, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

type Document = {
  id: string;
  displayName: string;
  fileType: string;
  mimeType: string;
  sizeBytes?: number;
};

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

  // Fetch document and create blob URL
  useEffect(() => {
    if (document && isOpen) {
      setIsLoading(true);
      setHasError(false);
      setBlobUrl(null);

      fetch(`/api/documents/${document.id}/view`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch document");
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setIsLoading(false);
        })
        .catch(() => {
          setHasError(true);
          setIsLoading(false);
        });
    }

    // Cleanup blob URL when component unmounts or document changes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [document?.id, isOpen]);

  if (!isOpen || !document) return null;

  const getFileIcon = () => {
    if (document.fileType === "pdf") return FileText;
    if (document.fileType === "image") return ImageIcon;
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
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

        {/* Content */}
        <div className="relative flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-950">
          {/* Loading indicator */}
          {isLoading && (document.fileType === "pdf" || document.fileType === "image") && (
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
          ) : document.fileType === "pdf" && blobUrl ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
