"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  FileText,
  Image as ImageIcon,
  File,
  MoreVertical,
  FolderOpen,
  X,
  Lock,
  ChevronLeft,
  Music,
  Video,
  Share2,
  CheckSquare,
  Square,
  Download,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { PinModal } from "@/components/folders/pin-modal";
import { DocuBotWidget } from "@/components/docubot/docubot-widget";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { ShareModal } from "@/components/share/share-modal";

type FolderType = {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  documentCount: number;
  createdAt: string;
  hasPin?: boolean;
};

type DocumentType = {
  id: string;
  displayName: string;
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
};

const FOLDER_COLORS = [
  { color: "#3B82F6", name: "Bleu" },
  { color: "#10B981", name: "Vert" },
  { color: "#F59E0B", name: "Orange" },
  { color: "#EF4444", name: "Rouge" },
  { color: "#8B5CF6", name: "Violet" },
  { color: "#EC4899", name: "Rose" },
  { color: "#06B6D4", name: "Cyan" },
  { color: "#84CC16", name: "Lime" },
];

export function MyFilesClient({
  folders,
  documents,
}: {
  folders: FolderType[];
  documents: DocumentType[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6");
  const [newFolderPin, setNewFolderPin] = useState("");
  const [enablePin, setEnablePin] = useState(false);
  const [movingDocumentId, setMovingDocumentId] = useState<string | null>(null);
  const [unlockedFolders, setUnlockedFolders] = useState<Set<string>>(new Set());
  const [pendingFolder, setPendingFolder] = useState<FolderType | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentType | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreatingFolder(true);
    }
  }, [searchParams]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    if (enablePin && newFolderPin.length !== 4) {
      alert(t("pinMustBe4Digits"));
      return;
    }

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          color: newFolderColor,
          pin: enablePin ? newFolderPin : undefined,
        }),
      });

      if (response.ok) {
        setIsCreatingFolder(false);
        setNewFolderName("");
        setNewFolderColor("#3B82F6");
        setNewFolderPin("");
        setEnablePin(false);
        router.refresh();
      } else {
        alert(t("errorCreatingFolder"));
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert(t("errorCreatingFolder"));
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    try {
      const response = await fetch(`/api/folders/${editingFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          color: newFolderColor,
        }),
      });

      if (response.ok) {
        setEditingFolder(null);
        setNewFolderName("");
        setNewFolderColor("#3B82F6");
        router.refresh();
      } else {
        alert(t("errorUpdatingFolder"));
      }
    } catch (error) {
      console.error("Error updating folder:", error);
      alert(t("errorUpdatingFolder"));
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`${t("confirmDeleteFolder")} "${folderName}" ? ${t("documentsMovedToUncategorized")}.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
          setShowDocuments(false);
        }
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || t("errorDeletingFolder"));
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert(t("errorDeletingFolder"));
    }
  };

  const handleMoveDocument = async (documentId: string, targetFolderId: string | null) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: targetFolderId }),
      });

      if (response.ok) {
        setMovingDocumentId(null);
        router.refresh();
      } else {
        alert(t("errorMovingDocument"));
      }
    } catch (error) {
      console.error("Error moving document:", error);
      alert(t("errorMovingDocument"));
    }
  };

  const startEditFolder = (folder: FolderType) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
  };

  const cancelEdit = () => {
    setEditingFolder(null);
    setIsCreatingFolder(false);
    setNewFolderName("");
    setNewFolderColor("#3B82F6");
    setNewFolderPin("");
    setEnablePin(false);
  };

  const filteredDocuments = selectedFolder
    ? documents.filter((doc) => doc.folderId === selectedFolder)
    : documents.filter((doc) => !doc.folderId);

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

  const handleFolderClick = (folder: FolderType | null) => {
    if (folder === null) {
      setSelectedFolder(null);
      setShowDocuments(true);
      return;
    }

    if (folder.hasPin && !unlockedFolders.has(folder.id)) {
      setPendingFolder(folder);
    } else {
      setSelectedFolder(folder.id);
      setShowDocuments(true);
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    if (!pendingFolder) return false;

    try {
      const response = await fetch("/api/folders/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: pendingFolder.id, pin }),
      });

      const data = await response.json();

      if (data.valid) {
        setUnlockedFolders(prev => new Set(prev).add(pendingFolder.id));
        setSelectedFolder(pendingFolder.id);
        setShowDocuments(true);
        setPendingFolder(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying PIN:", error);
      return false;
    }
  };

  const handleMoveDocumentWithPinCheck = async (documentId: string, targetFolderId: string | null) => {
    if (targetFolderId) {
      const targetFolder = folders.find(f => f.id === targetFolderId);
      if (targetFolder?.hasPin && !unlockedFolders.has(targetFolderId)) {
        setPendingFolder(targetFolder);
        (window as any).pendingMoveOperation = { documentId, targetFolderId };
        return;
      }
    }
    await handleMoveDocument(documentId, targetFolderId);
  };

  const completePendingMove = async () => {
    const pendingMove = (window as any).pendingMoveOperation;
    if (pendingMove) {
      await handleMoveDocument(pendingMove.documentId, pendingMove.targetFolderId);
      delete (window as any).pendingMoveOperation;
    }
  };

  const currentFolderName = selectedFolder
    ? folders.find(f => f.id === selectedFolder)?.name
    : t("uncategorized");

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
        fetch(`/api/documents/${docId}`, { method: "DELETE" })
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

  // Mobile: show documents view
  const isMobileDocumentsView = showDocuments;

  return (
    <div className="mx-auto max-w-6xl space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isMobileDocumentsView ? (
            <button
              onClick={() => setShowDocuments(false)}
              className="lg:hidden flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Retour</span>
            </button>
          ) : null}
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white truncate">
            {isMobileDocumentsView ? (
              <span className="lg:hidden">{currentFolderName}</span>
            ) : null}
            <span className={isMobileDocumentsView ? "hidden lg:inline" : ""}>{t("myFolders")}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 lg:px-4 py-2 lg:py-2.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Partager</span>
          </button>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 lg:px-5 py-2 lg:py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <FolderPlus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("newFolder")}</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Folder Modal */}
      {(isCreatingFolder || editingFolder) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {editingFolder ? t("editFolder") : t("newFolder")}
              </h3>
              <button
                onClick={cancelEdit}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t("folderName")}
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={t("folderNamePlaceholder")}
                  autoFocus
                  className="w-full rounded-xl border-0 bg-neutral-100 px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-violet-500/20 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      editingFolder ? handleUpdateFolder() : handleCreateFolder();
                    }
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t("color")}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {FOLDER_COLORS.map(({ color, name }) => (
                    <button
                      key={color}
                      onClick={() => setNewFolderColor(color)}
                      className={`flex h-12 items-center justify-center rounded-xl transition-all ${
                        newFolderColor === color
                          ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-900"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color + "20" }}
                      title={name}
                    >
                      <Folder className="h-6 w-6" style={{ color }} />
                    </button>
                  ))}
                </div>
              </div>

              {!editingFolder && (
                <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {t("pinProtection")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnablePin(!enablePin)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        enablePin ? "bg-violet-500" : "bg-neutral-300 dark:bg-neutral-600"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          enablePin ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  {enablePin && (
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={newFolderPin}
                      onChange={(e) => setNewFolderPin(e.target.value.replace(/\D/g, ""))}
                      placeholder={t("enterPin")}
                      className="mt-3 w-full rounded-xl border-0 bg-white px-4 py-2.5 text-center text-lg tracking-[0.5em] text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-violet-500/20 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
                    />
                  )}
                  <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {t("addPinToProtect")}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={cancelEdit}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
                >
                  {editingFolder ? t("save") : t("create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Desktop: side by side, Mobile: toggle between folders and documents */}
      <div className="lg:grid lg:gap-6 lg:grid-cols-12">
        {/* Folders List */}
        <div className={`lg:col-span-4 ${isMobileDocumentsView ? 'hidden lg:block' : ''}`}>
          <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-5 shadow-lg shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            {/* Uncategorized */}
            <button
              onClick={() => handleFolderClick(null)}
              className={`mb-3 flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
                selectedFolder === null && showDocuments
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                selectedFolder === null && showDocuments
                  ? "bg-blue-100 dark:bg-blue-500/20"
                  : "bg-neutral-100 dark:bg-neutral-700/50"
              }`}>
                <FolderOpen className="h-5 w-5" />
              </div>
              <span className="flex-1 text-left font-medium truncate">{t("uncategorized")}</span>
              <span className="text-sm text-neutral-400 flex-shrink-0">
                {documents.filter((d) => !d.folderId).length}
              </span>
            </button>

            {/* User Folders */}
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group flex items-center gap-3 rounded-xl p-3 transition-all ${
                    selectedFolder === folder.id
                      ? "bg-violet-50 dark:bg-violet-500/10"
                      : "hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => handleFolderClick(folder)}
                    className="flex flex-1 items-center gap-3 text-left min-w-0"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                      style={{ backgroundColor: folder.color + "20" }}
                    >
                      <Folder className="h-5 w-5" style={{ color: folder.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`block truncate font-medium ${
                        selectedFolder === folder.id
                          ? "text-violet-700 dark:text-violet-400"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}>
                        {folder.name}
                      </span>
                      {folder.hasPin && (
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          {t("protected")}
                        </span>
                      )}
                    </div>
                  </button>

                  <span className="text-sm text-neutral-400 flex-shrink-0">{folder.documentCount}</span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditFolder(folder)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-600 dark:hover:text-neutral-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id, folder.name)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {folders.length === 0 && (
              <div className="mt-4 rounded-xl border-2 border-dashed border-neutral-200 p-6 text-center dark:border-neutral-700">
                <Folder className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {t("noFoldersYet")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documents Grid */}
        <div className={`lg:col-span-8 ${!isMobileDocumentsView ? 'hidden lg:block' : ''} mt-4 lg:mt-0`}>
          <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-white truncate">
                {currentFolderName}
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                {filteredDocuments.length > 0 && (
                  <button
                    onClick={() => {
                      if (isSelectionMode) {
                        cancelSelection();
                      } else {
                        setIsSelectionMode(true);
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isSelectionMode
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                    }`}
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    {isSelectionMode ? "Annuler" : "Sélectionner"}
                  </button>
                )}
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs lg:text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                  {filteredDocuments.length} doc{filteredDocuments.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Selection toolbar */}
            {isSelectionMode && selectedDocuments.size > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
                <div className="flex items-center gap-3">
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
                    className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isBulkDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    ZIP
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
                  >
                    {isBulkDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Supprimer
                  </button>
                </div>
              </div>
            )}

            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                  <Folder className="h-7 w-7 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {t("noDocumentsInFolder")}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {t("documentsWillAppear")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => {
                  const Icon = getFileIcon(doc.fileType);
                  const isSelected = selectedDocuments.has(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => isSelectionMode && toggleDocumentSelection(doc.id)}
                      className={`group flex items-center gap-3 rounded-xl p-3 transition-all ${
                        isSelected
                          ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10"
                          : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
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

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20 flex-shrink-0">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <button
                          onClick={(e) => {
                            if (isSelectionMode) {
                              e.stopPropagation();
                              toggleDocumentSelection(doc.id);
                            } else {
                              setPreviewDocument(doc);
                            }
                          }}
                          className="truncate text-sm font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                        >
                          {doc.displayName}
                        </button>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatFileSize(doc.sizeBytes)}
                        </p>
                      </div>

                      {!isSelectionMode && (
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() =>
                              setMovingDocumentId(
                                movingDocumentId === doc.id ? null : doc.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-neutral-500 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {movingDocumentId === doc.id && (
                            <>
                              {/* Backdrop to close menu */}
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setMovingDocumentId(null)}
                              />
                              <div className="absolute right-0 bottom-full z-50 mb-2 w-52 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
                                <div className="mb-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
                                  {t("moveTo")}
                                </div>
                                <button
                                  onClick={() => handleMoveDocumentWithPinCheck(doc.id, null)}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                >
                                  <FolderOpen className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                                  <span className="truncate">{t("uncategorized")}</span>
                                </button>
                                {folders.map((folder) => (
                                  <button
                                    key={folder.id}
                                    onClick={() => handleMoveDocumentWithPinCheck(doc.id, folder.id)}
                                    disabled={doc.folderId === folder.id}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                  >
                                    <Folder className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
                                    <span className="flex-1 text-left truncate">{folder.name}</span>
                                    {folder.hasPin && <Lock className="h-3 w-3 text-neutral-400 flex-shrink-0" />}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {pendingFolder && (
        <PinModal
          folderName={pendingFolder.name}
          onVerify={async (pin) => {
            const isValid = await verifyPin(pin);
            if (isValid) {
              await completePendingMove();
            }
            return isValid;
          }}
          onClose={() => {
            setPendingFolder(null);
            delete (window as any).pendingMoveOperation;
          }}
        />
      )}

      {/* DocuBot Assistant */}
      <DocuBotWidget />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        folders={folders.map((f) => ({
          id: f.id,
          name: f.name,
          color: f.color,
          documentCount: f.documentCount,
        }))}
        documents={documents.map((d) => ({
          id: d.id,
          displayName: d.displayName,
          fileType: d.fileType,
          folderId: d.folderId,
        }))}
        onShareCreated={() => router.refresh()}
      />
    </div>
  );
}
