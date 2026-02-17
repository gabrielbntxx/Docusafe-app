"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  File,
  Grid3x3,
  List,
  Download,
  Trash2,
  Eye,
  Folder,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Music,
  Video,
  CheckSquare,
  Square,
  Loader2,
  CheckCheck,
  ArrowLeftRight,
} from "lucide-react";
import { DocumentPreviewModal } from "./document-preview-modal";
import { DocumentTriage } from "./document-triage";
import { useTranslation } from "@/hooks/useTranslation";

type Document = {
  id: string;
  originalName: string;
  displayName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string | null;
  aiAnalyzed?: number;
  aiCategory?: string | null;
  uploadedAt: string;
  folder: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  addedBy?: { name: string; color: string } | null;
};

type FolderType = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  _count: {
    documents: number;
  };
};

export function DocumentsClient({
  documents,
  folders,
  isTeam = false,
}: {
  documents: Document[];
  folders: FolderType[];
  isTeam?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [isTriageMode, setIsTriageMode] = useState(false);

  // Auto-activate triage mode from URL query param (?triage=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("triage") === "1" && documents.length > 0) {
      setIsTriageMode(true);
    }
  }, [documents.length]);

  const handleView = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const handleDownload = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = documents.find(d => d.id === docId)?.originalName || "document";
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || doc.folder?.id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

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
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Selection functions
  const toggleDocumentSelection = (docId: string) => {
    const newSet = new Set(selectedDocuments);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedDocuments(newSet);
    if (newSet.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)));
    }
  };

  const cancelSelection = () => {
    setSelectedDocuments(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;

    const count = selectedDocuments.size;
    if (!confirm(`Supprimer ${count} document${count > 1 ? 's' : ''} ?`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedDocuments).map(docId =>
        fetch(`/api/documents/${docId}/delete`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      setSelectedDocuments(new Set());
      setIsSelectionMode(false);
      router.refresh();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocuments.size === 0) return;

    setIsBulkDownloading(true);
    try {
      const response = await fetch("/api/documents/download-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: Array.from(selectedDocuments) }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "documents.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Bulk download error:", error);
      alert("Erreur lors du téléchargement");
    } finally {
      setIsBulkDownloading(false);
    }
  };

  return (
    <>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      {isTriageMode ? (
        <DocumentTriage
          documents={filteredDocuments}
          onExit={() => setIsTriageMode(false)}
          onDeleteComplete={() => router.refresh()}
        />
      ) : (
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t("myDocuments")}
            </h1>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              {documents.length} {documents.length === 1 ? "document" : "documents"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {documents.length > 0 && (
              <>
                <button
                  onClick={() => setIsTriageMode(true)}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600 transition-all"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {t("triageMode")}
                </button>
                <button
                  onClick={() => {
                    if (isSelectionMode) {
                      cancelSelection();
                    } else {
                      setIsSelectionMode(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isSelectionMode
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                  }`}
                >
                  <CheckSquare className="h-4 w-4" />
                  {isSelectionMode ? "Annuler" : "Sélectionner"}
                </button>
              </>
            )}
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              {t("addDocument")}
            </Link>
          </div>
        </div>

        {/* Selection toolbar */}
        {isSelectionMode && selectedDocuments.size > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-blue-50 dark:bg-blue-500/10 p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                <CheckCheck className="h-4 w-4" />
                {selectedDocuments.size === filteredDocuments.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {selectedDocuments.size} sélectionné{selectedDocuments.size > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDownload}
                disabled={isBulkDownloading}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
              >
                {isBulkDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Télécharger ZIP
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={t("searchDocuments")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-0 bg-neutral-100 py-2.5 pl-11 pr-4 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:bg-neutral-50 focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-700/50 dark:text-white dark:placeholder-neutral-500 dark:focus:bg-neutral-700"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <select
                value={selectedFolder || ""}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="appearance-none rounded-xl border-0 bg-neutral-100 py-2.5 pl-10 pr-8 text-sm text-neutral-700 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-700/50 dark:text-neutral-200"
              >
                <option value="">{t("allFolders")}</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name} ({folder._count.documents})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-700/50">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-neutral-600 dark:text-blue-400"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-neutral-600 dark:text-blue-400"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents */}
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 text-center shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
              <FileText className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="font-medium text-neutral-900 dark:text-white">
              {t("noDocumentsFound")}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {searchQuery || selectedFolder ? t("tryModifyFilters") : t("startByAdding")}
            </p>
            {!searchQuery && !selectedFolder && (
              <Link
                href="/dashboard/upload"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                {t("addDocument")}
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc) => {
              const Icon = getFileIcon(doc.fileType);
              const isSelected = selectedDocuments.has(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => isSelectionMode && toggleDocumentSelection(doc.id)}
                  className={`group relative overflow-hidden rounded-2xl bg-white p-4 shadow-xl shadow-black/5 transition-all hover:shadow-2xl dark:bg-neutral-800/50 dark:shadow-none ${
                    isSelected ? "ring-2 ring-blue-500" : ""
                  } ${isSelectionMode ? "cursor-pointer" : ""}`}
                >
                  {/* Checkbox */}
                  {isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDocumentSelection(doc.id);
                      }}
                      className="absolute top-3 left-3 z-10"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Square className="h-5 w-5 text-neutral-400" />
                      )}
                    </button>
                  )}

                  {/* Preview Area */}
                  <div
                    onClick={(e) => {
                      if (isSelectionMode) {
                        e.stopPropagation();
                        toggleDocumentSelection(doc.id);
                      } else {
                        handleView(doc);
                      }
                    }}
                    className="mb-4 flex h-36 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 transition-transform group-hover:scale-[1.02] dark:from-blue-500/10 dark:to-violet-500/10"
                  >
                    <Icon className="h-14 w-14 text-blue-500 dark:text-blue-400" />
                  </div>

                  {/* Info */}
                  <h3 className="truncate font-medium text-neutral-900 dark:text-white">
                    {doc.displayName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{formatFileSize(doc.sizeBytes)}</span>
                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                    {isTeam && doc.addedBy && (
                      <>
                        <span className="text-neutral-300 dark:text-neutral-600">•</span>
                        <span className="flex items-center gap-1" title={`Ajouté par ${doc.addedBy.name}`}>
                          <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: doc.addedBy.color }} />
                          <span className="truncate max-w-[60px]">{doc.addedBy.name.split(' ')[0]}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {doc.folder && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: doc.folder.color || "#6366f1" }}
                      />
                      <span className="truncate text-neutral-500 dark:text-neutral-400">
                        {doc.folder.name}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  {!isSelectionMode && (
                    <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-700/50">
                      <button
                        onClick={() => handleView(doc)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("view")}
                      </button>
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.displayName)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
              {filteredDocuments.map((doc) => {
                const Icon = getFileIcon(doc.fileType);
                const isSelected = selectedDocuments.has(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => isSelectionMode && toggleDocumentSelection(doc.id)}
                    className={`group flex items-center gap-4 p-4 transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                    } ${isSelectionMode ? "cursor-pointer" : ""}`}
                  >
                    {/* Checkbox */}
                    {isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDocumentSelection(doc.id);
                        }}
                        className="flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Square className="h-5 w-5 text-neutral-400" />
                        )}
                      </button>
                    )}

                    <div
                      onClick={(e) => {
                        if (isSelectionMode) {
                          e.stopPropagation();
                          toggleDocumentSelection(doc.id);
                        } else {
                          handleView(doc);
                        }
                      }}
                      className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 transition-transform hover:scale-105 dark:from-blue-500/10 dark:to-violet-500/10"
                    >
                      <Icon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-neutral-900 dark:text-white">
                        {doc.displayName}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
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
                        {isTeam && doc.addedBy && (
                          <>
                            <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                            <span className="hidden items-center gap-1 sm:flex" title={`Ajouté par ${doc.addedBy.name}`}>
                              <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: doc.addedBy.color }} />
                              <span className="truncate max-w-[60px]">{doc.addedBy.name.split(' ')[0]}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {!isSelectionMode && (
                      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleView(doc)}
                          className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("view")}
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id)}
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}
    </>
  );
}
