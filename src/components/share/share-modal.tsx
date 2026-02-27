"use client";

import { useState } from "react";
import {
  X,
  Share2,
  Folder,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  File,
  Lock,
  Clock,
  Copy,
  Check,
  Loader2,
  Music,
  Video,
  Link2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type FolderType = {
  id: string;
  name: string;
  color: string;
  documentCount: number;
  parentId: string | null;
};

type DocumentType = {
  id: string;
  displayName: string;
  fileType: string;
  folderId: string | null;
};

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderType[];
  documents: DocumentType[];
  onShareCreated?: () => void;
};

const EXPIRATION_OPTIONS = [
  { value: "24h", label: "24 heures" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "never", label: "Jamais" },
];

export function ShareModal({
  isOpen,
  onClose,
  folders,
  documents,
  onShareCreated,
}: ShareModalProps) {
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [expiresIn, setExpiresIn] = useState("7d");
  const [password, setPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const uncategorizedDocuments = documents.filter((doc) => !doc.folderId);

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return FileText;
    if (fileType === "image") return ImageIcon;
    if (fileType === "audio") return Music;
    if (fileType === "video") return Video;
    return File;
  };

  const toggleFolder = (folderId: string) => {
    const newSet = new Set(selectedFolders);
    if (newSet.has(folderId)) {
      newSet.delete(folderId);
    } else {
      newSet.add(folderId);
    }
    setSelectedFolders(newSet);
  };

  const toggleExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId); else next.add(folderId);
      return next;
    });
  };

  const toggleDocument = (docId: string) => {
    const newSet = new Set(selectedDocuments);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedDocuments(newSet);
  };

  // Render folders as a collapsible tree (like the Mes Dossiers sidebar)
  const renderFolderTree = (parentId: string | null, depth: number): React.ReactNode => {
    const children = folders.filter(f => f.parentId === parentId);
    if (children.length === 0) return null;
    return children.map(folder => {
      const hasChildren = folders.some(f => f.parentId === folder.id);
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolders.has(folder.id);
      return (
        <div key={folder.id}>
          <div
            style={{ paddingLeft: `${8 + depth * 20}px` }}
            className={`group flex items-center gap-2 rounded-xl pr-2 py-2 transition-all ${
              isSelected
                ? "bg-blue-50 ring-1 ring-blue-400 dark:bg-blue-500/10"
                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            }`}
          >
            {/* Expand chevron */}
            <button
              onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(folder.id); }}
              className={`flex h-5 w-5 items-center justify-center flex-shrink-0 rounded text-neutral-400 ${hasChildren ? "hover:bg-neutral-200 dark:hover:bg-neutral-700" : ""}`}
            >
              {hasChildren
                ? (isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)
                : <span className="h-3 w-3 block" />}
            </button>

            {/* Folder icon */}
            <button
              onClick={() => toggleFolder(folder.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
              style={{ backgroundColor: folder.color + "20" }}
            >
              {isExpanded
                ? <FolderOpen className="h-4 w-4" style={{ color: folder.color }} />
                : <Folder className="h-4 w-4" style={{ color: folder.color }} />}
            </button>

            {/* Name + count */}
            <button
              onClick={() => { toggleFolder(folder.id); if (hasChildren && !isExpanded) toggleExpand(folder.id); }}
              className="flex-1 min-w-0 text-left"
            >
              <p className={`truncate text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-neutral-800 dark:text-neutral-200"}`}>
                {folder.name}
              </p>
              <p className="text-xs text-neutral-400">
                {folder.documentCount} doc{folder.documentCount !== 1 ? "s" : ""}
                {hasChildren && ` · contient des sous-dossiers`}
              </p>
            </button>

            {/* Checkbox */}
            <button
              onClick={() => toggleFolder(folder.id)}
              className={`h-5 w-5 rounded-full border-2 transition-colors flex-shrink-0 ${
                isSelected
                  ? "border-blue-500 bg-blue-500"
                  : "border-neutral-300 dark:border-neutral-600"
              }`}
            >
              {isSelected && <Check className="h-full w-full text-white p-0.5" />}
            </button>
          </div>

          {/* Children */}
          {isExpanded && renderFolderTree(folder.id, depth + 1)}
        </div>
      );
    });
  };

  const handleCreateShare = async () => {
    if (selectedFolders.size === 0 && selectedDocuments.size === 0) {
      setError("Sélectionnez au moins un élément à partager");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderIds: Array.from(selectedFolders),
          documentIds: Array.from(selectedDocuments),
          expiresIn,
          password: enablePassword ? password : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShareUrl(data.share.url);
        onShareCreated?.();
      } else {
        setError(data.error || "Erreur lors de la création du partage");
      }
    } catch (err) {
      console.error("Share creation error:", err);
      setError("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  const handleClose = () => {
    setSelectedFolders(new Set());
    setSelectedDocuments(new Set());
    setExpandedFolders(new Set());
    setExpiresIn("7d");
    setPassword("");
    setEnablePassword(false);
    setShareUrl(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 p-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Partager
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Créer un lien de partage
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {shareUrl ? (
            /* Success state - show share URL */
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Lien de partage créé !
                </h4>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Copiez ce lien pour le partager
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-3">
                <Link2 className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white outline-none truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    copied
                      ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {enablePassword && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                  <Lock className="inline h-4 w-4 mr-2" />
                  {"N'oubliez pas de communiquer le mot de passe séparément"}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl"
              >
                Terminé
              </button>
            </div>
          ) : (
            /* Selection state */
            <>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Folders — hierarchical tree */}
              {folders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Dossiers
                    </h4>
                    {selectedFolders.size > 0 && (
                      <span className="text-xs text-blue-500 font-medium">
                        {selectedFolders.size} sélectionné{selectedFolders.size > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 p-2">
                    {renderFolderTree(null, 0)}
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                    Sélectionner un dossier inclut automatiquement tous ses sous-dossiers et fichiers.
                  </p>
                </div>
              )}

              {/* Uncategorized Documents */}
              {uncategorizedDocuments.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Documents non classés
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 p-2">
                    {uncategorizedDocuments.map((doc) => {
                      const Icon = getFileIcon(doc.fileType);
                      const isSelected = selectedDocuments.has(doc.id);
                      return (
                        <button
                          key={doc.id}
                          onClick={() => toggleDocument(doc.id)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                            isSelected
                              ? "bg-blue-50 ring-1 ring-blue-400 dark:bg-blue-500/10"
                              : "hover:bg-white dark:hover:bg-neutral-800"
                          }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20 flex-shrink-0">
                            <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {doc.displayName}
                          </p>
                          <div
                            className={`h-5 w-5 rounded-full border-2 transition-colors flex-shrink-0 ${
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-neutral-300 dark:border-neutral-600"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-full w-full text-white p-0.5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expiration */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Expiration
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {EXPIRATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExpiresIn(option.value)}
                      className={`rounded-xl py-2 px-3 text-sm font-medium transition-all ${
                        expiresIn === option.value
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Protéger par mot de passe
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnablePassword(!enablePassword)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      enablePassword ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        enablePassword ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                {enablePassword && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez un mot de passe"
                    className="mt-3 w-full rounded-xl border-0 bg-white dark:bg-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!shareUrl && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-5 flex-shrink-0">
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateShare}
                disabled={isLoading || (selectedFolders.size === 0 && selectedDocuments.size === 0)}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Créer le lien
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
