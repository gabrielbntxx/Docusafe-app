"use client";

import { useState, useEffect, useMemo } from "react";
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
  Filter,
  FolderOpen,
  Calendar,
  Tag,
  ChevronDown,
  History,
  Brain,
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
  // AI analysis data
  aiDocumentType?: string | null;
  aiCategory?: string | null;
  aiExtractedData?: string | null;
};

type FolderType = {
  id: string;
  name: string;
  color: string | null;
};

type DateFilter = "all" | "today" | "week" | "month" | "year";
type FileTypeFilter = "all" | "pdf" | "image" | "audio" | "video" | "other";

const RECENT_SEARCHES_KEY = "docusafe_recent_searches";
const MAX_RECENT_SEARCHES = 5;

// Parse AI extracted data safely
const parseAIData = (data: string | null | undefined): Record<string, unknown> => {
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

// Calculate relevance score for a document
const calculateRelevance = (doc: DocumentType, query: string): number => {
  const q = query.toLowerCase();
  let score = 0;

  // Exact match in display name (highest priority)
  if (doc.displayName.toLowerCase() === q) score += 100;
  else if (doc.displayName.toLowerCase().includes(q)) score += 50;

  // Original name match
  if (doc.originalName.toLowerCase().includes(q)) score += 30;

  // Tags match
  if (doc.tags?.toLowerCase().includes(q)) score += 25;

  // AI document type match (e.g., "facture", "contrat")
  if (doc.aiDocumentType?.toLowerCase().includes(q)) score += 40;

  // AI category match
  if (doc.aiCategory?.toLowerCase().includes(q)) score += 35;

  // Description match
  if (doc.description?.toLowerCase().includes(q)) score += 20;

  // Search in AI extracted data (issuer, amounts, etc.)
  const aiData = parseAIData(doc.aiExtractedData);
  const aiDataStr = JSON.stringify(aiData).toLowerCase();
  if (aiDataStr.includes(q)) score += 15;

  return score;
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

  // Filters
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updated = [
      query,
      ...recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase())
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Get unique folders from documents
  const folders = useMemo(() => {
    const folderMap = new Map<string, FolderType>();
    documents.forEach(doc => {
      if (doc.folder) {
        folderMap.set(doc.folder.id, doc.folder);
      }
    });
    return Array.from(folderMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [documents]);

  // Get unique AI categories
  const aiCategories = useMemo(() => {
    const categories = new Set<string>();
    documents.forEach(doc => {
      if (doc.aiCategory) categories.add(doc.aiCategory);
    });
    return Array.from(categories).sort();
  }, [documents]);

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

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setShowRecentSearches(false);
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    setShowRecentSearches(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Check if date is within filter range
  const isWithinDateRange = (dateString: string, filter: DateFilter): boolean => {
    if (filter === "all") return true;

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    switch (filter) {
      case "today": return diffDays < 1;
      case "week": return diffDays < 7;
      case "month": return diffDays < 30;
      case "year": return diffDays < 365;
      default: return true;
    }
  };

  // Check if file type matches filter
  const matchesFileType = (fileType: string, filter: FileTypeFilter): boolean => {
    if (filter === "all") return true;
    if (filter === "other") return !["pdf", "image", "audio", "video"].includes(fileType);
    return fileType === filter;
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let results = documents;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      results = documents.filter(doc => {
        // Search in basic fields
        if (doc.displayName.toLowerCase().includes(query)) return true;
        if (doc.originalName.toLowerCase().includes(query)) return true;
        if (doc.tags?.toLowerCase().includes(query)) return true;
        if (doc.description?.toLowerCase().includes(query)) return true;

        // Search in AI analysis fields
        if (doc.aiDocumentType?.toLowerCase().includes(query)) return true;
        if (doc.aiCategory?.toLowerCase().includes(query)) return true;

        // Search in AI extracted data (JSON)
        const aiData = parseAIData(doc.aiExtractedData);
        const aiDataStr = JSON.stringify(aiData).toLowerCase();
        if (aiDataStr.includes(query)) return true;

        return false;
      });

      // Sort by relevance
      results = results.sort((a, b) => {
        const scoreA = calculateRelevance(a, query);
        const scoreB = calculateRelevance(b, query);
        return scoreB - scoreA;
      });
    }

    // Apply file type filter
    if (fileTypeFilter !== "all") {
      results = results.filter(doc => matchesFileType(doc.fileType, fileTypeFilter));
    }

    // Apply folder filter
    if (folderFilter !== "all") {
      results = results.filter(doc => doc.folderId === folderFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      results = results.filter(doc => isWithinDateRange(doc.uploadedAt, dateFilter));
    }

    return results;
  }, [documents, searchQuery, fileTypeFilter, folderFilter, dateFilter]);

  // Check if any filter is active
  const hasActiveFilters = fileTypeFilter !== "all" || folderFilter !== "all" || dateFilter !== "all";

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
      timeZone: "UTC",
    }).format(date);
  };

  // Get match info for highlighting
  const getMatchInfo = (doc: DocumentType, query: string): string | null => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    if (doc.aiDocumentType?.toLowerCase().includes(q)) {
      return `Type: ${doc.aiDocumentType}`;
    }
    if (doc.aiCategory?.toLowerCase().includes(q)) {
      return `Catégorie: ${doc.aiCategory}`;
    }

    const aiData = parseAIData(doc.aiExtractedData);
    if (aiData.issuer && String(aiData.issuer).toLowerCase().includes(q)) {
      return `Émetteur: ${aiData.issuer}`;
    }
    if (aiData.amount && String(aiData.amount).toLowerCase().includes(q)) {
      return `Montant: ${aiData.amount}`;
    }

    if (doc.tags?.toLowerCase().includes(q)) {
      return `Tags: ${doc.tags}`;
    }

    return null;
  };

  const DocumentCard = ({ doc }: { doc: DocumentType }) => {
    const Icon = getFileIcon(doc.fileType);
    const matchInfo = getMatchInfo(doc, searchQuery);

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
            {doc.folder && (
              <>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-3 w-3" />
                  {doc.folder.name}
                </span>
              </>
            )}
          </div>
          {matchInfo && (
            <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Brain className="h-3 w-3" />
              <span className="truncate">{matchInfo}</span>
            </div>
          )}
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

  const FileTypeChip = ({ type, label, icon: ChipIcon }: { type: FileTypeFilter; label: string; icon: React.ElementType }) => (
    <button
      onClick={() => setFileTypeFilter(fileTypeFilter === type ? "all" : type)}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        fileTypeFilter === type
          ? "bg-blue-600 text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
      }`}
    >
      <ChipIcon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

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
              onFocus={() => setShowRecentSearches(true)}
              onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
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

            {/* Recent Searches Dropdown */}
            {showRecentSearches && !searchQuery && recentSearches.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white p-2 shadow-lg dark:bg-neutral-800 z-50">
                <div className="flex items-center justify-between px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    Recherches récentes
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    Effacer
                  </button>
                </div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    {search}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FileTypeChip type="pdf" label="PDF" icon={FileText} />
            <FileTypeChip type="image" label="Images" icon={ImageIcon} />
            <FileTypeChip type="audio" label="Audio" icon={Music} />
            <FileTypeChip type="video" label="Vidéo" icon={Video} />

            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-600 mx-1" />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                hasActiveFilters
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Plus de filtres
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50">
              {/* Folder Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Dossier
                </label>
                <select
                  value={folderFilter}
                  onChange={(e) => setFolderFilter(e.target.value)}
                  className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-600 dark:text-white"
                >
                  <option value="all">Tous les dossiers</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Période
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-600 dark:text-white"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd&apos;hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>
              </div>
            </div>
          )}

          {/* Results count */}
          {(searchQuery || hasActiveFilters) && (
            <div className="mt-3 lg:mt-4 flex items-center gap-2 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
              <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              {filteredDocuments.length} {t("resultsFound")}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setFileTypeFilter("all");
                    setFolderFilter("all");
                    setDateFilter("all");
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Categories Quick Access */}
        {!searchQuery && !hasActiveFilters && aiCategories.length > 0 && (
          <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg lg:shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="mb-4 flex items-center gap-2 lg:gap-3">
              <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl lg:rounded-2xl bg-violet-100 dark:bg-violet-500/20">
                <Brain className="h-4 w-4 lg:h-5 lg:w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-white">
                Catégories IA
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results / Recent */}
        {searchQuery.trim() || hasActiveFilters ? (
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
