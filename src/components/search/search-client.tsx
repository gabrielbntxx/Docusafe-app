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
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t("searchTitle")}</h1>
          <p className="mt-2 text-neutral-500">
            {t("findDocuments")}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 pr-12 text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-4 text-sm text-neutral-500">
              {filteredDocuments.length} {t("resultsFound")}
            </div>
          )}
        </div>

        {searchQuery.trim() ? (
          filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-12 text-center">
              <Search className="h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-sm font-medium text-neutral-900">
                {t("noResultsFound")}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {t("tryDifferentKeywords")}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                {t("searchResults")}
              </h2>
              <div className="space-y-2">
                {filteredDocuments.map((doc) => {
                  const Icon = getFileIcon(doc.fileType);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:bg-white hover:shadow-soft"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-medium text-neutral-900">
                          {doc.displayName}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                          <span>{formatFileSize(doc.sizeBytes)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploadedAt)}</span>
                          {doc.folder && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Folder
                                  className="h-3 w-3"
                                  style={{ color: doc.folder.color || undefined }}
                                />
                                <span>{doc.folder.name}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
                        >
                          {t("view")}
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id, doc.originalName)}
                          className="rounded-lg bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-neutral-200"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.displayName)}
                          className="rounded-lg bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900">
                {t("recentFiles")}
              </h2>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-neutral-300" />
                <p className="mt-4 text-sm text-neutral-500">
                  {t("noDocuments")}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {t("startByAdding")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocuments.map((doc) => {
                  const Icon = getFileIcon(doc.fileType);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:bg-white hover:shadow-soft"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-medium text-neutral-900">
                          {doc.displayName}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                          <span>{formatFileSize(doc.sizeBytes)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploadedAt)}</span>
                          {doc.folder && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Folder
                                  className="h-3 w-3"
                                  style={{ color: doc.folder.color || undefined }}
                                />
                                <span>{doc.folder.name}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
                        >
                          {t("view")}
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id, doc.originalName)}
                          className="rounded-lg bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-neutral-200"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.displayName)}
                          className="rounded-lg bg-neutral-100 p-2 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
