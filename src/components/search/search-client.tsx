"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Image as ImageIcon,
  File,
  Clock,
  Download,
  Eye,
  Trash2,
  X,
  Sparkles,
  Music,
  Video,
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
    if (fileType === "audio") return Music;
    if (fileType === "video") return Video;
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const DocumentCard = ({ doc }: { doc: DocumentType }) => {
    const Icon = getFileIcon(doc.fileType);
    return (
      <div className="group flex items-center gap-3 lg:gap-4 rounded-xl lg:rounded-2xl bg-neutral-50 p-3 lg:p-4 transition-all hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/50">
        <div
          onClick={() => handleView(doc)}
          className="flex h-10 w-10 lg:h-12 lg:w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20"
        >
          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm lg:text-base font-medium text-neutral-900 dark:text-white">
            {doc.displayName}
          </h3>
          <div className="mt-0.5 lg:mt-1 flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
            <span>{formatFileSize(doc.sizeBytes)}</span>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <span>{formatDate(doc.uploadedAt)}</span>
          </div>
        </div>

        <div className="flex gap-1.5 lg:gap-2 lg:opacity-0 transition-opacity lg:group-hover:opacity-100">
          <button
            onClick={() => handleView(doc)}
            className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg lg:rounded-xl bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
            title={t("preview")}
          >
            <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </button>
          <button
            onClick={() => handleDownload(doc.id, doc.originalName)}
            className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg lg:rounded-xl bg-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
            title={t("download")}
          >
            <Download className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </button>
          <button
            onClick={() => handleDelete(doc.id, doc.displayName)}
            className="hidden lg:flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg lg:rounded-xl bg-neutral-200 text-neutral-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
            title={t("delete")}
          >
            <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
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

      <div className="mx-auto max-w-4xl space-y-4 lg:space-y-6">
        {/* Search Box */}
        <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg lg:shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="relative">
            <Search className="absolute left-4 lg:left-5 top-1/2 h-4 w-4 lg:h-5 lg:w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 lg:h-14 w-full rounded-xl lg:rounded-2xl border-0 bg-neutral-100 pl-11 lg:pl-14 pr-11 lg:pr-14 text-base lg:text-lg text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:bg-neutral-50 focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-700/50 dark:text-white dark:placeholder-neutral-500 dark:focus:bg-neutral-700"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 lg:right-4 top-1/2 flex h-7 w-7 lg:h-8 lg:w-8 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 hover:bg-neutral-300 dark:bg-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-500"
              >
                <X className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-3 lg:mt-4 flex items-center gap-2 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
              <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              {filteredDocuments.length} {t("resultsFound")}
            </div>
          )}
        </div>

        {/* Results / Recent */}
        {searchQuery.trim() ? (
          filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl lg:rounded-3xl bg-white p-12 lg:p-16 text-center shadow-lg lg:shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
              <div className="mb-4 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                <Search className="h-7 w-7 lg:h-8 lg:w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="text-sm lg:text-base font-medium text-neutral-900 dark:text-white">
                {t("noResultsFound")}
              </p>
              <p className="mt-1 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
                {t("tryDifferentKeywords")}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg lg:shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
              <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
                <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl lg:rounded-2xl bg-blue-100 dark:bg-blue-500/20">
                  <Search className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-white">
                  {t("searchResults")}
                </h2>
              </div>
              <div className="space-y-2 lg:space-y-3">
                {filteredDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg lg:shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
              <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl lg:rounded-2xl bg-amber-100 dark:bg-amber-500/20">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-white">
                {t("recentFiles")}
              </h2>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 lg:py-16 text-center">
                <div className="mb-4 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                  <FileText className="h-7 w-7 lg:h-8 lg:w-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm lg:text-base font-medium text-neutral-900 dark:text-white">
                  {t("noDocuments")}
                </p>
                <p className="mt-1 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
                  {t("startByAdding")}
                </p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
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
