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
  Plus,
} from "lucide-react";
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("myFolders")}
          </h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            {t("organizeFolders")}
          </p>
        </div>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 active:scale-[0.98]"
        >
          <FolderPlus className="h-4 w-4" />
          {t("newFolder")}
        </button>
      </div>

      {/* Create/Edit Folder Modal */}
      {(isCreatingFolder || editingFolder) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl">
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Folders Sidebar */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl bg-white p-5 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {t("folders")}
            </h2>

            {/* Uncategorized */}
            <button
              onClick={() => setSelectedFolder(null)}
              className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
                selectedFolder === null
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                selectedFolder === null
                  ? "bg-blue-100 dark:bg-blue-500/20"
                  : "bg-neutral-100 dark:bg-neutral-700/50"
              }`}>
                <FolderOpen className="h-5 w-5" />
              </div>
              <span className="flex-1 text-left font-medium">{t("uncategorized")}</span>
              <span className="text-sm text-neutral-400">
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
                      ? "bg-violet-50 dark:bg-violet-500/10"
                      : "hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => handleFolderClick(folder)}
                    className="flex flex-1 items-center gap-3 text-left min-w-0"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
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
                        <span className="text-xs text-neutral-400">
                          <Lock className="inline h-3 w-3 mr-1" />
                          {t("protected")}
                        </span>
                      )}
                    </div>
                  </button>

                  <span className="text-sm text-neutral-400">{folder.documentCount}</span>

                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => startEditFolder(folder)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-600 dark:hover:text-neutral-300"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id, folder.name)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
        <div className="lg:col-span-8">
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedFolder
                  ? folders.find((f) => f.id === selectedFolder)?.name
                  : t("uncategorized")}
              </h2>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? "document" : "documents"}
              </span>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                  <Folder className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {t("noDocumentsInFolder")}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
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
                      className="group flex items-center gap-4 rounded-2xl bg-neutral-50 p-4 transition-all hover:bg-neutral-100 dark:bg-neutral-700/30 dark:hover:bg-neutral-700/50"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-medium text-neutral-900 dark:text-white">
                          {doc.displayName}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-600 dark:hover:text-neutral-300"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {movingDocumentId === doc.id && (
                          <div className="absolute right-0 top-full z-10 mt-2 w-52 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                            <div className="mb-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
                              {t("moveTo")}
                            </div>
                            <button
                              onClick={() => handleMoveDocumentWithPinCheck(doc.id, null)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                              <FolderOpen className="h-4 w-4 text-neutral-400" />
                              {t("uncategorized")}
                            </button>
                            {folders.map((folder) => (
                              <button
                                key={folder.id}
                                onClick={() => handleMoveDocumentWithPinCheck(doc.id, folder.id)}
                                disabled={doc.folderId === folder.id}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                              >
                                <Folder className="h-4 w-4" style={{ color: folder.color }} />
                                <span className="flex-1 text-left">{folder.name}</span>
                                {folder.hasPin && <Lock className="h-3 w-3 text-neutral-400" />}
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
