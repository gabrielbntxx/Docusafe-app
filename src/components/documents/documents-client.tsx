"use client";

import { useState, useEffect, useRef } from "react";
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
  Search,
  Filter,
  Plus,
  Music,
  Video,
  CheckSquare,
  Square,
  Loader2,
  CheckCheck,
  ArrowLeftRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DocumentPreviewModal } from "./document-preview-modal";
import { DocumentTriage } from "./document-triage";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Types ─────────────────────────────────────────────────────────────────────

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
  aiDocumentType?: string | null;
  aiConfidence?: number | null;
  aiExtractedData?: string | null;
  expiryDate?: string | null;
  uploadedAt: string;
  folder: { id: string; name: string; color: string | null; icon: string | null } | null;
  addedBy?: { name: string; color: string } | null;
};

type FolderType = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  _count: { documents: number };
};

// ─── File-type config ───────────────────────────────────────────────────────────

const FILE_TYPE_STYLE: Record<
  string,
  { gradientFrom: string; gradientTo: string; Icon: React.ElementType }
> = {
  pdf:   { gradientFrom: "from-red-500",    gradientTo: "to-red-600",     Icon: FileText },
  image: { gradientFrom: "from-pink-400",   gradientTo: "to-rose-500",    Icon: ImageIcon },
  audio: { gradientFrom: "from-violet-500", gradientTo: "to-purple-600",  Icon: Music },
  video: { gradientFrom: "from-blue-500",   gradientTo: "to-cyan-600",    Icon: Video },
};

function getFileStyle(fileType: string) {
  return FILE_TYPE_STYLE[fileType] ?? { gradientFrom: "from-neutral-500", gradientTo: "to-neutral-600", Icon: File };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateString));
}

function getExpiryStatus(expiryDate: string | null | undefined) {
  if (!expiryDate) return null;
  const daysLeft = Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0)   return { label: "Expiré", icon: AlertTriangle, bg: "bg-red-100 dark:bg-red-500/20",    text: "text-red-600 dark:text-red-400",    daysLeft };
  if (daysLeft <= 30) return { label: `${daysLeft}j`, icon: AlertTriangle, bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", daysLeft };
  if (daysLeft <= 90) return { label: `${daysLeft}j`, icon: Clock,         bg: "bg-yellow-100 dark:bg-yellow-500/20",  text: "text-yellow-600 dark:text-yellow-400", daysLeft };
  return { label: `${daysLeft}j`, icon: CheckCircle, bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", daysLeft };
}

// ─── DocCard component (extracted to avoid re-mount on each render) ─────────────

type CardProps = {
  doc: Document;
  isSelected: boolean;
  isSelectionMode: boolean;
  isTeam: boolean;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onToggleSelect: () => void;
};

function DocCard({ doc, isSelected, isSelectionMode, isTeam, onView, onDownload, onDelete, onToggleSelect }: CardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { gradientFrom, gradientTo, Icon } = getFileStyle(doc.fileType);
  const isImage = doc.fileType === "image";
  const expiry = getExpiryStatus(doc.expiryDate);

  return (
    <div
      onClick={() => isSelectionMode ? onToggleSelect() : onView()}
      className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-neutral-100 dark:bg-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className="absolute top-2 left-2 z-20"
        >
          {isSelected
            ? <CheckSquare className="h-5 w-5 text-blue-500 drop-shadow" />
            : <Square className="h-5 w-5 text-white/80 drop-shadow" />}
        </button>
      )}

      {/* Background */}
      {isImage && !imgError ? (
        <>
          {!imgLoaded && (
            <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
              <ImageIcon className="h-10 w-10 text-white/60 animate-pulse" />
            </div>
          )}
          <img
            src={`/api/documents/${doc.id}/view`}
            alt={doc.displayName}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </>
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
          <Icon className="h-12 w-12 text-white/90" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
        {/* Top: action buttons */}
        {!isSelectionMode && (
          <div className="flex justify-end gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
              title="Télécharger"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-red-500/80 transition"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Bottom: name + meta */}
        <div>
          <p className="text-white text-xs font-medium truncate leading-tight mb-0.5">
            {doc.displayName}
          </p>
          <div className="flex items-center gap-1.5 text-white/70 text-[10px]">
            <span>{formatFileSize(doc.sizeBytes)}</span>
            <span>·</span>
            <span suppressHydrationWarning>{formatDate(doc.uploadedAt)}</span>
          </div>
          {doc.folder && (
            <p className="text-white/60 text-[10px] truncate mt-0.5">📁 {doc.folder.name}</p>
          )}
          {isTeam && doc.addedBy && (
            <p className="flex items-center gap-1 text-white/60 text-[10px] mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: doc.addedBy.color }} />
              {doc.addedBy.name.split(" ")[0]}
            </p>
          )}
          {doc.aiCategory && doc.aiAnalyzed === 1 && (
            <span className="inline-block mt-1 rounded-full bg-white/20 backdrop-blur-sm px-1.5 py-0.5 text-[9px] text-white font-medium">
              {doc.aiCategory}
            </span>
          )}
        </div>
      </div>

      {/* View hint (center, hover only, non-interactive) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
          <Eye className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Expiry badge (always visible, bottom-right) */}
      {expiry && (() => {
        const ExpiryIcon = expiry.icon;
        return (
          <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${expiry.bg} ${expiry.text}`}>
              <ExpiryIcon className="h-2 w-2" />
              {expiry.label}
            </span>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function DocumentsClient({
  documents,
  folders,
  isTeam = false,
  initialTriageMode = false,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  initialSearch = "",
  initialFolder = "",
}: {
  documents: Document[];
  folders: FolderType[];
  isTeam?: boolean;
  initialTriageMode?: boolean;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  initialSearch?: string;
  initialFolder?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedFolder, setSelectedFolder] = useState(initialFolder);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [isTriageMode, setIsTriageMode] = useState(false);

  // Auto-activate triage mode
  useEffect(() => {
    if (initialTriageMode && documents.length > 0) setIsTriageMode(true);
  }, [initialTriageMode, documents.length]);

  // ── URL builder ───────────────────────────────────────────────────────────────
  const buildUrl = (overrides: { search?: string; folder?: string; page?: number }) => {
    const s = overrides.search !== undefined ? overrides.search : searchQuery;
    const f = overrides.folder !== undefined ? overrides.folder : selectedFolder;
    const p = overrides.page ?? 1;
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (f) params.set("folder", f);
    if (p > 1) params.set("page", String(p));
    return `/dashboard/documents${params.toString() ? `?${params}` : ""}`;
  };

  // ── Debounce search → URL ─────────────────────────────────────────────────────
  const isFirstSearchRender = useRef(true);
  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      router.replace(buildUrl({ search: searchQuery, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Folder filter → immediate URL ─────────────────────────────────────────────
  const handleFolderChange = (folderId: string) => {
    setSelectedFolder(folderId);
    router.replace(buildUrl({ folder: folderId, page: 1 }));
  };

  // ── Page navigation ───────────────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    router.push(buildUrl({ page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Document actions ──────────────────────────────────────────────────────────
  const handleView = (doc: Document) => setPreviewDocument(doc);

  const handleDownload = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = documents.find((d) => d.id === docId)?.originalName || "document";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch {
      alert(t("errorDownloading"));
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`${t("confirmDelete")} "${docName}" ?`)) return;
    try {
      const response = await fetch(`/api/documents/${docId}/delete`, { method: "DELETE" });
      if (response.ok) router.refresh();
      else alert(t("errorDeleting"));
    } catch {
      alert(t("errorDeleting"));
    }
  };

  // ── Selection ─────────────────────────────────────────────────────────────────
  const toggleDocumentSelection = (docId: string) => {
    const newSet = new Set(selectedDocuments);
    if (newSet.has(docId)) newSet.delete(docId);
    else newSet.add(docId);
    setSelectedDocuments(newSet);
    if (newSet.size === 0) setIsSelectionMode(false);
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedDocuments(new Set(documents.map((d) => d.id)));
    }
  };

  const cancelSelection = () => {
    setSelectedDocuments(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;
    const count = selectedDocuments.size;
    if (!confirm(`Supprimer ${count} document${count > 1 ? "s" : ""} ?`)) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedDocuments).map((id) =>
          fetch(`/api/documents/${id}/delete`, { method: "DELETE" })
        )
      );
      setSelectedDocuments(new Set());
      setIsSelectionMode(false);
      router.refresh();
    } catch {
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
    } catch {
      alert("Erreur lors du téléchargement");
    } finally {
      setIsBulkDownloading(false);
    }
  };

  // ── Pagination controls ────────────────────────────────────────────────────────
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-1.5 pt-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-sm text-neutral-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p as number)}
              className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl px-2 text-sm font-medium transition ${
                p === page
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      {isTriageMode ? (
        <DocumentTriage
          documents={documents}
          onExit={() => setIsTriageMode(false)}
          onDeleteComplete={() => router.refresh()}
        />
      ) : (
        <div className="mx-auto max-w-6xl space-y-2 lg:space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                {t("myDocuments")}
                <span className="ml-2 text-sm font-normal text-neutral-400">({totalCount})</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {totalCount > 0 && (
                <>
                  <button
                    onClick={() => setIsTriageMode(true)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600 transition-all"
                    title={t("triageMode")}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("triageMode")}</span>
                  </button>
                  <button
                    onClick={() => isSelectionMode ? cancelSelection() : setIsSelectionMode(true)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-medium transition-all ${
                      isSelectionMode
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                    }`}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">{isSelectionMode ? "Annuler" : "Sélectionner"}</span>
                  </button>
                </>
              )}
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t("addDocument")}</span>
              </Link>
            </div>
          </div>

          {/* Bulk selection toolbar */}
          {isSelectionMode && selectedDocuments.size > 0 && (
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 dark:bg-blue-500/10 p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                >
                  <CheckCheck className="h-4 w-4" />
                  {selectedDocuments.size === documents.length ? "Tout désélectionner" : "Tout sélectionner"}
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
                  {isBulkDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Télécharger ZIP
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                  value={selectedFolder}
                  onChange={(e) => handleFolderChange(e.target.value)}
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

          {/* Empty state */}
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                <FileText className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="font-medium text-neutral-900 dark:text-white">{t("noDocumentsFound")}</p>
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
            /* ── Photo-style grid ───────────────────────────────────────────── */
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {documents.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedDocuments.has(doc.id)}
                    isSelectionMode={isSelectionMode}
                    isTeam={isTeam}
                    onView={() => handleView(doc)}
                    onDownload={() => handleDownload(doc.id)}
                    onDelete={() => handleDelete(doc.id, doc.displayName)}
                    onToggleSelect={() => toggleDocumentSelection(doc.id)}
                  />
                ))}
              </div>
              {renderPagination()}
            </div>
          ) : (
            /* ── List view (unchanged) ──────────────────────────────────────── */
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
                <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
                  {documents.map((doc) => {
                    const { Icon } = getFileStyle(doc.fileType);
                    const isSelected = selectedDocuments.has(doc.id);
                    const expiry = getExpiryStatus(doc.expiryDate);
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
                        {isSelectionMode && (
                          <button onClick={(e) => { e.stopPropagation(); toggleDocumentSelection(doc.id); }} className="flex-shrink-0">
                            {isSelected
                              ? <CheckSquare className="h-5 w-5 text-blue-500" />
                              : <Square className="h-5 w-5 text-neutral-400" />}
                          </button>
                        )}

                        <div
                          onClick={(e) => { if (!isSelectionMode) { e.stopPropagation(); handleView(doc); } }}
                          className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 transition-transform hover:scale-105 dark:from-blue-500/10 dark:to-violet-500/10"
                        >
                          <Icon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-medium text-neutral-900 dark:text-white">{doc.displayName}</h3>
                            {expiry && (() => {
                              const ExpiryIcon = expiry.icon;
                              return (
                                <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${expiry.bg} ${expiry.text}`}>
                                  <ExpiryIcon className="h-2.5 w-2.5" />
                                  {expiry.label}
                                </span>
                              );
                            })()}
                            {doc.aiCategory && doc.aiAnalyzed === 1 && (
                              <span className="hidden sm:inline-flex shrink-0 items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                {doc.aiCategory}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{formatFileSize(doc.sizeBytes)}</span>
                            <span className="text-neutral-300 dark:text-neutral-600">•</span>
                            <span suppressHydrationWarning>{formatDate(doc.uploadedAt)}</span>
                            {doc.folder && (
                              <>
                                <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                                <div className="hidden items-center gap-1 sm:flex">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: doc.folder.color || "#6366f1" }} />
                                  <span>{doc.folder.name}</span>
                                </div>
                              </>
                            )}
                            {isTeam && doc.addedBy && (
                              <>
                                <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                                <span className="hidden items-center gap-1 sm:flex" title={`Ajouté par ${doc.addedBy.name}`}>
                                  <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: doc.addedBy.color }} />
                                  <span className="truncate max-w-[60px]">{doc.addedBy.name.split(" ")[0]}</span>
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
              {renderPagination()}
            </div>
          )}
        </div>
      )}
    </>
  );
}
