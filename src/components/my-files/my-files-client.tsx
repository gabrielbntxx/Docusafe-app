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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { PinModal } from "@/components/folders/pin-modal";

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

  // Auto-open create folder modal if create=true in URL
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
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFolderClick = (folder: FolderType) => {
    if (folder.hasPin && !unlockedFolders.has(folder.id)) {
      setPendingFolder(folder);
    } else {
      setSelectedFolder(folder.id);
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
    // Si on déplace vers un dossier protégé par PIN
    if (targetFolderId) {
      const targetFolder = folders.find(f => f.id === targetFolderId);
      if (targetFolder?.hasPin && !unlockedFolders.has(targetFolderId)) {
        setPendingFolder(targetFolder);
        // On garde en mémoire le document à déplacer
        (window as any).pendingMoveOperation = { documentId, targetFolderId };
        return;
      }
    }

    // Si pas de PIN ou déjà déverrouillé, on déplace directement
    await handleMoveDocument(documentId, targetFolderId);
  };

  const completePendingMove = async () => {
    const pendingMove = (window as any).pendingMoveOperation;
    if (pendingMove) {
      await handleMoveDocument(pendingMove.documentId, pendingMove.targetFolderId);
      delete (window as any).pendingMoveOperation;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">{t("myFolders")}</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t("organizeFolders")}
          </p>
        </div>
        <Button onClick={() => setIsCreatingFolder(true)} className="hidden sm:flex">
          <FolderPlus className="mr-2 h-4 w-4" />
          {t("newFolder")}
        </Button>
      </div>

      {/* Create/Edit Folder Modal */}
      {(isCreatingFolder || editingFolder) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-soft-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {editingFolder ? t("editFolder") : t("newFolder")}
              </h3>
              <button onClick={cancelEdit} className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t("folderName")}
                </label>
                <Input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={t("folderNamePlaceholder")}
                  autoFocus
                  className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
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
                      className={`flex h-12 items-center justify-center rounded-xl border-2 transition-all ${
                        newFolderColor === color
                          ? "border-neutral-900 dark:border-white scale-105"
                          : "border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      🔒 {t("pinProtection")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setEnablePin(!enablePin)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        enablePin ? "bg-primary-600" : "bg-neutral-300 dark:bg-neutral-600"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          enablePin ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  {enablePin && (
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={newFolderPin}
                      onChange={(e) => setNewFolderPin(e.target.value.replace(/\D/g, ""))}
                      placeholder={t("enterPin")}
                      className="text-center tracking-widest dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    />
                  )}
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {t("addPinToProtect")}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={cancelEdit} className="flex-1 dark:border-neutral-700 dark:text-neutral-300">
                  {t("cancel")}
                </Button>
                <Button
                  onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                  className="flex-1"
                  disabled={!newFolderName.trim()}
                >
                  {editingFolder ? t("save") : t("create")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Folders Sidebar */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {t("folders")}
            </h2>

            {/* Uncategorized */}
            <button
              onClick={() => setSelectedFolder(null)}
              className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
                selectedFolder === null
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                  : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              <FolderOpen className="h-5 w-5" />
              <span className="flex-1 text-left font-medium">{t("uncategorized")}</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {documents.filter((d) => !d.folderId).length}
              </span>
            </button>

            {/* User Folders */}
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group flex items-center gap-3 rounded-xl p-3 transition-all ${
                    selectedFolder === folder.id
                      ? "bg-primary-50 dark:bg-primary-900/40"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <button
                    onClick={() => handleFolderClick(folder)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <Folder className="h-5 w-5" style={{ color: folder.color }} />
                    <span className="flex-1 truncate font-medium text-neutral-700 dark:text-neutral-300">
                      {folder.name} {folder.hasPin && "🔒"}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {folder.documentCount}
                    </span>
                  </button>

                  {!folder.isDefault && (
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => startEditFolder(folder)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder.id, folder.name)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedFolder
                  ? folders.find((f) => f.id === selectedFolder)?.name
                  : t("uncategorized")}
              </h2>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {filteredDocuments.length} {t("documents").toLowerCase()}
              </span>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                <p className="mt-4 text-sm font-medium text-neutral-900 dark:text-white">
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
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-all hover:bg-white hover:shadow-soft dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-750"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/40 dark:to-secondary-900/40">
                        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {doc.displayName}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatFileSize(doc.sizeBytes)}
                        </p>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setMovingDocumentId(
                              movingDocumentId === doc.id ? null : doc.id
                            )
                          }
                          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {movingDocumentId === doc.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-neutral-200 bg-white py-2 shadow-soft-lg dark:border-neutral-700 dark:bg-neutral-800">
                            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                              {t("moveTo")}
                            </div>
                            <button
                              onClick={() => handleMoveDocumentWithPinCheck(doc.id, null)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                              <FolderOpen className="h-4 w-4" />
                              {t("uncategorized")}
                            </button>
                            {folders.map((folder) => (
                              <button
                                key={folder.id}
                                onClick={() => handleMoveDocumentWithPinCheck(doc.id, folder.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                disabled={doc.folderId === folder.id}
                              >
                                <Folder
                                  className="h-4 w-4"
                                  style={{ color: folder.color }}
                                />
                                {folder.name} {folder.hasPin && "🔒"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
    </div>
  );
}
