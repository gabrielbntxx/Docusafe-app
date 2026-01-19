"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Image as ImageIcon,
  File,
  Folder,
  Clock,
  Download,
  Eye,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { useTranslation } from "@/hooks/useTranslation";

type DocumentType = {
  id: string;
  displayName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  folderId: string | null;
  folder: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  tags?: string;
  description?: string | null;
};

export function SearchClient({
  documents,
  recentDocuments,
}: {
  documents: DocumentType[];
  recentDocuments: DocumentType[];
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDocument, setPreviewDocument] = useState<DocumentType | null>(null);

  const handleView = (doc: DocumentType) => {
    setPreviewDocument(doc);
  };

  const handleDownload = async (docId: string, originalName: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(t("errorDownloading"));
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`${t("confirmDelete")} "${docName}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${docId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert(t("errorDeleting"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(t("errorDeleting"));
    }
  };

  const filteredDocuments = searchQuery.trim()
    ? documents.filter((doc) =>
        doc.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags && doc.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return FileText;
    if (fileType === "image") return ImageIcon;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const DocumentCard = ({ doc }: { doc: DocumentType }) => {
    const Icon = getFileIcon(doc.fileType);
    return (
      <div className="group flex items-center gap-4 rounded-2xl bg-neutral-50 p-4 transition-all hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50">
        <div
          onClick={() => handleView(doc)}
          className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 transition-transform hover:scale-105 dark:from-blue-500/10 dark:to-violet-500/10"
        >
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-neutral-900 dark:text-white">
            {doc.displayName}
          </h3>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span>{formatFileSize(doc.sizeBytes)}</span>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <span>{formatDate(doc.uploadedAt)}</span>
            {doc.folder && (
              <>
                <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                <div className="hidden items-center gap-1 sm:flex">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: doc.folder.color || "#6366f1" }}
                  />
                  <span>{doc.folder.name}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => handleView(doc)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("view")}
          </button>
          <button
            onClick={() => handleDownload(doc.id, doc.originalName)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(doc.id, doc.displayName)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("searchTitle")}
          </h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            {t("findDocuments")}
          </p>
        </div>

        {/* Search Box */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-2xl border-0 bg-neutral-100 pl-14 pr-14 text-lg text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:bg-neutral-50 focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-700/50 dark:text-white dark:placeholder-neutral-500 dark:focus:bg-neutral-700"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 hover:bg-neutral-300 dark:bg-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Sparkles className="h-4 w-4" />
              {filteredDocuments.length} {t("resultsFound")}
            </div>
          )}
        </div>

        {/* Results / Recent */}
        {searchQuery.trim() ? (
          filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 text-center shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                <Search className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="font-medium text-neutral-900 dark:text-white">
                {t("noResultsFound")}
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {t("tryDifferentKeywords")}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                {t("searchResults")}
              </h2>
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t("recentFiles")}
              </h2>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                  <FileText className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {t("noDocuments")}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {t("startByAdding")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
