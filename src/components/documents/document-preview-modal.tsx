"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Document = {
  id: string;
  displayName: string;
  fileType: string;
  mimeType: string;
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
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white shadow-soft-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <h3 className="text-lg font-semibold text-neutral-900 truncate flex-1">
            {document.displayName}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-4 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="relative h-[calc(90vh-80px)] overflow-auto bg-neutral-50">
          {document.fileType === "pdf" ? (
            <iframe
              src={`/api/documents/${document.id}/view`}
              className="h-full w-full"
              title={document.displayName}
            />
          ) : document.fileType === "image" ? (
            <div className="flex items-center justify-center h-full p-8">
              <img
                src={`/api/documents/${document.id}/view`}
                alt={document.displayName}
                className="max-h-full max-w-full rounded-xl object-contain shadow-soft-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-neutral-600">
                Aperçu non disponible pour ce type de fichier
              </p>
              <Button
                asChild
                className="mt-4"
              >
                <a
                  href={`/api/documents/${document.id}/download`}
                  download
                >
                  Télécharger pour voir
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
