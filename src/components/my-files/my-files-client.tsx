"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  FileText,
  Image as ImageIcon,
  File,
  FolderOpen,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  Music,
  Video,
  Share2,
  CheckSquare,
  Square,
  Download,
  Loader2,
  CheckCheck,
  Home,
  Plus,
  GripVertical,
  Star,
  MoreVertical,
  Settings2,
  Send,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { PinModal } from "@/components/folders/pin-modal";
import { FolderRulesModal } from "@/components/folders/folder-rules-modal";
import { DocuBotWidget } from "@/components/docubot/docubot-widget";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { ShareModal } from "@/components/share/share-modal";

type MemberInfo = {
  name: string;
  color: string;
} | null;

type FolderType = {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  documentCount: number;
  childrenCount?: number;
  parentId: string | null;
  createdAt: string;
  hasPin?: boolean;
  addedBy?: MemberInfo;
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
  addedBy?: MemberInfo;
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
  folders: initialFolders,
  documents: initialDocuments,
  isTeam = false,
  initialCreateMode = false,
}: {
  folders: FolderType[];
  documents: DocumentType[];
  isTeam?: boolean;
  initialCreateMode?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Local state for optimistic updates
  const [localFolders, setLocalFolders] = useState<FolderType[]>(initialFolders);
  const [localDocuments, setLocalDocuments] = useState<DocumentType[]>(initialDocuments);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("folderFavorites");
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch {
        setFavorites(new Set());
      }
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = (folderId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(folderId)) {
        newFavorites.delete(folderId);
      } else {
        newFavorites.add(folderId);
      }
      localStorage.setItem("folderFavorites", JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  // Sync with props when they change
  useEffect(() => {
    setLocalFolders(initialFolders);
  }, [initialFolders]);

  useEffect(() => {
    setLocalDocuments(initialDocuments);
  }, [initialDocuments]);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6");
  const [newFolderPin, setNewFolderPin] = useState("");
  const [enablePin, setEnablePin] = useState(false);
  const [unlockedFolders, setUnlockedFolders] = useState<Set<string>>(new Set());
  const [pendingFolder, setPendingFolder] = useState<FolderType | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentType | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [rulesFolder, setRulesFolder] = useState<FolderType | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [creatingInParent, setCreatingInParent] = useState<string | null>(null);

  // Email send state
  const [emailDocId, setEmailDocId] = useState<string | null>(null);
  const [emailDocName, setEmailDocName] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Drag and drop state
  const [draggedDocument, setDraggedDocument] = useState<string | null>(null);
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null);

  // Mobile move menu
  const [movingDocumentId, setMovingDocumentId] = useState<string | null>(null);
  const [folderMenuId, setFolderMenuId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close all dropdown menus when navigating away (prevents z-index blocking)
  useEffect(() => {
    setFolderMenuId(null);
    setMovingDocumentId(null);
  }, [pathname]);

  // Navigation breadcrumb (for when viewing folder contents)
  const [folderPath, setFolderPath] = useState<FolderType[]>([]);

  useEffect(() => {
    if (initialCreateMode) {
      setIsCreatingFolder(true);
    }
  }, [initialCreateMode]);

  // Sort folders with favorites first
  const sortFoldersWithFavorites = useCallback((folders: FolderType[]) => {
    return [...folders].sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [favorites]);

  // Get subfolders of currently selected folder (sorted with favorites first)
  const getSubfolders = useCallback((parentId: string | null) => {
    const subfolders = localFolders.filter(f => f.parentId === parentId);
    return sortFoldersWithFavorites(subfolders);
  }, [localFolders, sortFoldersWithFavorites]);

  // Get documents in currently selected folder
  const getDocumentsInFolder = useCallback((folderId: string | null) => {
    if (folderId === null) {
      return localDocuments.filter(doc => !doc.folderId);
    }
    return localDocuments.filter(doc => doc.folderId === folderId);
  }, [localDocuments]);

  // Root level folders (no parent, sorted with favorites first)
  const rootFolders = sortFoldersWithFavorites(localFolders.filter(f => f.parentId === null));

  // Content of selected folder (subfolders + documents)
  const currentSubfolders = selectedFolder ? getSubfolders(selectedFolder) : [];
  const currentDocuments = getDocumentsInFolder(selectedFolder);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    if (enablePin && newFolderPin.length !== 4) {
      alert(t("pinMustBe4Digits"));
      return;
    }

    const parentId = creatingInParent || selectedFolder;

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          color: newFolderColor,
          pin: enablePin ? newFolderPin : undefined,
          parentId: parentId,
        }),
      });

      if (response.ok) {
        const newFolder = await response.json();
        // Optimistic update
        setLocalFolders(prev => [...prev, {
          ...newFolder,
          documentCount: 0,
          childrenCount: 0,
          hasPin: !!newFolderPin,
        }]);
        // Update parent's childrenCount
        if (parentId) {
          setLocalFolders(prev => prev.map(f =>
            f.id === parentId ? { ...f, childrenCount: (f.childrenCount || 0) + 1 } : f
          ));
        }
        setIsCreatingFolder(false);
        setNewFolderName("");
        setNewFolderColor("#3B82F6");
        setNewFolderPin("");
        setEnablePin(false);
        setCreatingInParent(null);
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
        // Optimistic update
        setLocalFolders(prev => prev.map(f =>
          f.id === editingFolder.id
            ? { ...f, name: newFolderName.trim(), color: newFolderColor }
            : f
        ));
        setEditingFolder(null);
        setNewFolderName("");
        setNewFolderColor("#3B82F6");
      } else {
        alert(t("errorUpdatingFolder"));
      }
    } catch (error) {
      console.error("Error updating folder:", error);
      alert(t("errorUpdatingFolder"));
    }
  };

  // Returns all descendant folder IDs (children, grandchildren, …)
  const getDescendantFolderIds = (folderId: string, folders: FolderType[]): string[] => {
    const children = folders.filter(f => f.parentId === folderId);
    return children.reduce<string[]>((acc, child) => [
      ...acc, child.id, ...getDescendantFolderIds(child.id, folders),
    ], []);
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
        const deletedFolder = localFolders.find(f => f.id === folderId);
        // Remove folder AND all its descendants to avoid orphan entries
        const descendantIds = getDescendantFolderIds(folderId, localFolders);
        const allRemovedIds = new Set([folderId, ...descendantIds]);
        setLocalFolders(prev => prev.filter(f => !allRemovedIds.has(f.id)));
        // Move documents to uncategorized
        setLocalDocuments(prev => prev.map(d =>
          d.folderId === folderId ? { ...d, folderId: null, folder: null } : d
        ));
        // Update parent's childrenCount
        if (deletedFolder?.parentId) {
          setLocalFolders(prev => prev.map(f =>
            f.id === deletedFolder.parentId
              ? { ...f, childrenCount: Math.max(0, (f.childrenCount || 0) - 1) }
              : f
          ));
        }
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
          setShowDocuments(false);
          setFolderPath([]);
        }
      } else {
        const data = await response.json();
        alert(data.error || t("errorDeletingFolder"));
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert(t("errorDeletingFolder"));
    }
  };

  // Move document with optimistic update
  const handleMoveDocument = async (documentId: string, targetFolderId: string | null) => {
    const document = localDocuments.find(d => d.id === documentId);
    if (!document) return;

    const oldFolderId = document.folderId;
    const targetFolder = targetFolderId ? localFolders.find(f => f.id === targetFolderId) : null;

    // Optimistic update
    setLocalDocuments(prev => prev.map(d =>
      d.id === documentId
        ? {
            ...d,
            folderId: targetFolderId,
            folder: targetFolder ? { id: targetFolder.id, name: targetFolder.name, color: targetFolder.color } : null
          }
        : d
    ));

    // Update folder counts
    if (oldFolderId) {
      setLocalFolders(prev => prev.map(f =>
        f.id === oldFolderId ? { ...f, documentCount: Math.max(0, f.documentCount - 1) } : f
      ));
    }
    if (targetFolderId) {
      setLocalFolders(prev => prev.map(f =>
        f.id === targetFolderId ? { ...f, documentCount: f.documentCount + 1 } : f
      ));
    }

    try {
      const response = await fetch(`/api/documents/${documentId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: targetFolderId }),
      });

      if (!response.ok) {
        // Revert on error
        setLocalDocuments(prev => prev.map(d =>
          d.id === documentId ? document : d
        ));
        if (oldFolderId) {
          setLocalFolders(prev => prev.map(f =>
            f.id === oldFolderId ? { ...f, documentCount: f.documentCount + 1 } : f
          ));
        }
        if (targetFolderId) {
          setLocalFolders(prev => prev.map(f =>
            f.id === targetFolderId ? { ...f, documentCount: Math.max(0, f.documentCount - 1) } : f
          ));
        }
        alert(t("errorMovingDocument"));
      }
    } catch (error) {
      console.error("Error moving document:", error);
      // Revert on error
      setLocalDocuments(prev => prev.map(d =>
        d.id === documentId ? document : d
      ));
      alert(t("errorMovingDocument"));
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, documentId: string) => {
    setDraggedDocument(documentId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", documentId);
  };

  const handleDragEnd = () => {
    setDraggedDocument(null);
    setDropTargetFolder(null);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetFolder(folderId);
  };

  const handleDragLeave = () => {
    setDropTargetFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const documentId = e.dataTransfer.getData("text/plain");

    if (documentId && draggedDocument) {
      // Check if target folder has PIN
      if (targetFolderId) {
        const targetFolder = localFolders.find(f => f.id === targetFolderId);
        if (targetFolder?.hasPin && !unlockedFolders.has(targetFolderId)) {
          setPendingFolder(targetFolder);
          (window as any).pendingMoveOperation = { documentId, targetFolderId };
          setDraggedDocument(null);
          setDropTargetFolder(null);
          return;
        }
      }
      await handleMoveDocument(documentId, targetFolderId);
    }

    setDraggedDocument(null);
    setDropTargetFolder(null);
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
    setCreatingInParent(null);
  };

  // Navigate into folder (select it and show contents)
  const openFolder = (folder: FolderType) => {
    if (folder.hasPin && !unlockedFolders.has(folder.id)) {
      setPendingFolder(folder);
      return;
    }
    setSelectedFolder(folder.id);
    setShowDocuments(true);
    // Update breadcrumb
    const parentPath = buildFolderPath(folder.parentId);
    setFolderPath([...parentPath, folder]);
  };

  // Build path from root to folder
  const buildFolderPath = (folderId: string | null): FolderType[] => {
    if (!folderId) return [];
    const folder = localFolders.find(f => f.id === folderId);
    if (!folder) return [];
    return [...buildFolderPath(folder.parentId), folder];
  };

  // Navigate to a specific level in breadcrumb
  const navigateToLevel = (index: number) => {
    if (index < 0) {
      setSelectedFolder(null);
      setFolderPath([]);
      setShowDocuments(false);
    } else {
      const folder = folderPath[index];
      setSelectedFolder(folder.id);
      setFolderPath(folderPath.slice(0, index + 1));
    }
  };

  // Navigate back
  const navigateBack = () => {
    if (folderPath.length <= 1) {
      setSelectedFolder(null);
      setFolderPath([]);
      setShowDocuments(false);
    } else {
      const newPath = folderPath.slice(0, -1);
      setSelectedFolder(newPath[newPath.length - 1].id);
      setFolderPath(newPath);
    }
  };

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
        // Check if there's a pending move or folder open
        const pendingMove = (window as any).pendingMoveOperation;
        if (pendingMove) {
          await handleMoveDocument(pendingMove.documentId, pendingMove.targetFolderId);
          delete (window as any).pendingMoveOperation;
        } else {
          // Open the folder
          setSelectedFolder(pendingFolder.id);
          setShowDocuments(true);
          const parentPath = buildFolderPath(pendingFolder.parentId);
          setFolderPath([...parentPath, pendingFolder]);
        }
        setPendingFolder(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying PIN:", error);
      return false;
    }
  };

  const currentFolderName = selectedFolder
    ? localFolders.find(f => f.id === selectedFolder)?.name
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
    if (newSet.size === 0 && selectedFolders.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const toggleFolderSelection = (folderId: string) => {
    const newSet = new Set(selectedFolders);
    if (newSet.has(folderId)) {
      newSet.delete(folderId);
    } else {
      newSet.add(folderId);
    }
    setSelectedFolders(newSet);
    if (newSet.size === 0 && selectedDocuments.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const toggleSelectAll = () => {
    const totalSelected = selectedDocuments.size + selectedFolders.size;
    const totalItems = currentDocuments.length + currentSubfolders.length;
    if (totalSelected === totalItems) {
      setSelectedDocuments(new Set());
      setSelectedFolders(new Set());
      setIsSelectionMode(false);
    } else {
      setSelectedDocuments(new Set(currentDocuments.map(d => d.id)));
      setSelectedFolders(new Set(currentSubfolders.map(f => f.id)));
    }
  };

  const cancelSelection = () => {
    setSelectedDocuments(new Set());
    setSelectedFolders(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    const docCount = selectedDocuments.size;
    const folderCount = selectedFolders.size;
    if (docCount === 0 && folderCount === 0) return;

    const parts: string[] = [];
    if (docCount > 0) parts.push(`${docCount} document${docCount > 1 ? "s" : ""}`);
    if (folderCount > 0) parts.push(`${folderCount} dossier${folderCount > 1 ? "s" : ""} (et leur contenu)`);
    if (!confirm(`Supprimer ${parts.join(" et ")} ?`)) return;

    setIsBulkDeleting(true);
    try {
      // Delete selected documents
      if (docCount > 0) {
        const docsToDelete = Array.from(selectedDocuments);
        const folderCountUpdates: Record<string, number> = {};
        docsToDelete.forEach(docId => {
          const doc = localDocuments.find(d => d.id === docId);
          if (doc?.folderId) {
            folderCountUpdates[doc.folderId] = (folderCountUpdates[doc.folderId] || 0) + 1;
          }
        });
        setLocalDocuments(prev => prev.filter(d => !docsToDelete.includes(d.id)));
        if (Object.keys(folderCountUpdates).length > 0) {
          setLocalFolders(prev => prev.map(f =>
            folderCountUpdates[f.id]
              ? { ...f, documentCount: Math.max(0, f.documentCount - folderCountUpdates[f.id]) }
              : f
          ));
        }
        await Promise.all(docsToDelete.map(docId =>
          fetch(`/api/documents/${docId}`, { method: "DELETE" })
        ));
      }

      // Delete selected folders (and all their descendants)
      if (folderCount > 0) {
        const foldersToDelete = Array.from(selectedFolders);
        const allRemovedIds = new Set<string>();
        foldersToDelete.forEach(fId => {
          allRemovedIds.add(fId);
          getDescendantFolderIds(fId, localFolders).forEach(id => allRemovedIds.add(id));
        });
        setLocalFolders(prev => prev.filter(f => !allRemovedIds.has(f.id)));
        setLocalDocuments(prev => prev.map(d =>
          d.folderId && allRemovedIds.has(d.folderId) ? { ...d, folderId: null, folder: null } : d
        ));
        await Promise.all(foldersToDelete.map(fId =>
          fetch(`/api/folders/${fId}`, { method: "DELETE" })
        ));
      }

      setSelectedDocuments(new Set());
      setSelectedFolders(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Erreur lors de la suppression");
      router.refresh();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocuments.size === 0 && selectedFolders.size === 0) return;

    setIsBulkDownloading(true);
    try {
      const response = await fetch("/api/documents/download-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: Array.from(selectedDocuments),
          folderIds: Array.from(selectedFolders),
        }),
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
              onClick={() => {
                setShowDocuments(false);
                setSelectedFolder(null);
                setFolderPath([]);
              }}
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
                {editingFolder ? t("editFolder") : (creatingInParent || selectedFolder) ? "Nouveau sous-dossier" : t("newFolder")}
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

      {/* Main Content */}
      <div className="lg:grid lg:gap-6 lg:grid-cols-12">
        {/* Folders Sidebar */}
        <div className={`lg:col-span-4 ${isMobileDocumentsView ? 'hidden lg:block' : ''}`}>
          <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-5 shadow-lg shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            {/* Sidebar header with Sélectionner toggle */}
            {rootFolders.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Dossiers</span>
                <button
                  onClick={() => isSelectionMode ? cancelSelection() : setIsSelectionMode(true)}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                    isSelectionMode
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-white/5 dark:hover:text-neutral-200"
                  }`}
                >
                  <CheckSquare className="h-3 w-3" />
                  {isSelectionMode ? "Annuler" : "Sélectionner"}
                </button>
              </div>
            )}

            {/* Sidebar selection toolbar */}
            {isSelectionMode && selectedFolders.size > 0 && (
              <div className="mb-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {selectedFolders.size} sélectionné{selectedFolders.size > 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleBulkDownload}
                      disabled={isBulkDownloading}
                      className="flex items-center gap-1 rounded-lg bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isBulkDownloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      ZIP
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="flex items-center gap-1 rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {isBulkDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Suppr.
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (selectedFolders.size === rootFolders.length) {
                      setSelectedFolders(new Set());
                    } else {
                      setSelectedFolders(new Set(rootFolders.map(f => f.id)));
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400"
                >
                  <CheckCheck className="h-3 w-3" />
                  {selectedFolders.size === rootFolders.length ? "Tout désélectionner" : "Tout sélectionner"}
                </button>
              </div>
            )}

            {/* Uncategorized - drop zone */}
            <div
              onDragOver={(e) => !isSelectionMode && handleDragOver(e, null)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => !isSelectionMode && handleDrop(e, null)}
              onClick={() => {
                if (isSelectionMode) return;
                setSelectedFolder(null);
                setShowDocuments(true);
                setFolderPath([]);
              }}
              className={`mb-3 flex w-full items-center gap-3 rounded-xl p-3 transition-all cursor-pointer ${
                dropTargetFolder === null && draggedDocument
                  ? "bg-violet-100 ring-2 ring-violet-500 dark:bg-violet-500/20"
                  : selectedFolder === null && showDocuments
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
                {localDocuments.filter((d) => !d.folderId).length}
              </span>
            </div>

            {/* Root Folders */}
            <div className="space-y-2">
              {rootFolders.map((folder) => {
                const isRootSelected = selectedFolders.has(folder.id);
                return (
                <div
                  key={folder.id}
                  onDragOver={(e) => !isSelectionMode && handleDragOver(e, folder.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => !isSelectionMode && handleDrop(e, folder.id)}
                  onClick={() => isSelectionMode && toggleFolderSelection(folder.id)}
                  className={`group flex items-center gap-2 lg:gap-3 rounded-xl p-2 lg:p-3 transition-all ${
                    dropTargetFolder === folder.id && draggedDocument
                      ? "bg-violet-100 ring-2 ring-violet-500 dark:bg-violet-500/20"
                      : isRootSelected
                      ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10"
                      : selectedFolder === folder.id
                      ? "bg-violet-50 dark:bg-violet-500/10"
                      : "hover:bg-neutral-100 dark:hover:bg-white/5"
                  } ${isSelectionMode ? "cursor-pointer" : ""}`}
                >
                  {/* Checkbox */}
                  {isSelectionMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFolderSelection(folder.id); }}
                      className="flex-shrink-0"
                    >
                      {isRootSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Square className="h-5 w-5 text-neutral-400" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!isSelectionMode) openFolder(folder); }}
                    className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl flex-shrink-0 hover:ring-2 hover:ring-violet-500/30"
                    style={{ backgroundColor: folder.color + "20" }}
                  >
                    <Folder className="h-4 w-4 lg:h-5 lg:w-5" style={{ color: folder.color }} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); if (!isSelectionMode) openFolder(folder); }}
                    className="flex flex-1 items-center gap-2 text-left min-w-0"
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`block truncate text-sm font-medium ${
                        selectedFolder === folder.id
                          ? "text-violet-700 dark:text-violet-400"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}>
                        {folder.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        {isTeam && folder.addedBy && (
                          <span className="flex items-center gap-1" title={`Ajouté par ${folder.addedBy.name}`}>
                            <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: folder.addedBy.color }} />
                            <span className="hidden sm:inline truncate max-w-[80px]">{folder.addedBy.name.split(' ')[0]}</span>
                          </span>
                        )}
                        {folder.hasPin && (
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            <span className="hidden sm:inline">{t("protected")}</span>
                          </span>
                        )}
                        {(folder.childrenCount ?? 0) > 0 && (
                          <span className="hidden sm:inline">{folder.childrenCount} sous-dossier{(folder.childrenCount ?? 0) > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Favorite star - always visible on mobile if favorited */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(folder.id);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                      favorites.has(folder.id)
                        ? "text-yellow-500"
                        : "text-neutral-300 lg:opacity-0 lg:group-hover:opacity-100 hover:text-yellow-500 dark:text-neutral-600"
                    }`}
                    title={favorites.has(folder.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Star className={`h-4 w-4 ${favorites.has(folder.id) ? "fill-current" : ""}`} />
                  </button>

                  <span className="text-xs lg:text-sm text-neutral-400 flex-shrink-0">{folder.documentCount}</span>

                  {/* Folder action menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderMenuId(folderMenuId === folder.id ? null : folder.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {folderMenuId === folder.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setFolderMenuId(null)}
                        />
                        <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreatingInParent(folder.id);
                              setIsCreatingFolder(true);
                              setFolderMenuId(null);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            <Plus className="h-4 w-4 text-violet-500" />
                            Sous-dossier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRulesFolder(folder);
                              setFolderMenuId(null);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            <Settings2 className="h-4 w-4 text-blue-500" />
                            {t("folderRules")}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditFolder(folder);
                              setFolderMenuId(null);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            <Edit2 className="h-4 w-4 text-neutral-500" />
                            {t("editFolder")}
                          </button>
                          <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id, folder.name);
                              setFolderMenuId(null);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("delete")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
              })}
            </div>

            {rootFolders.length === 0 && (
              <div className="mt-4 rounded-xl border-2 border-dashed border-neutral-200 p-6 text-center dark:border-neutral-700">
                <Folder className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {t("noFoldersYet")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Folder Contents (subfolders + documents) */}
        <div className={`lg:col-span-8 ${!isMobileDocumentsView ? 'hidden lg:block' : ''} mt-4 lg:mt-0`}>
          <div className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-lg shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
            {/* Breadcrumb */}
            {folderPath.length > 0 && (
              <div className="mb-4 flex items-center gap-1 text-sm overflow-x-auto pb-2">
                <button
                  onClick={() => navigateToLevel(-1)}
                  className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex-shrink-0"
                >
                  <Home className="h-4 w-4" />
                  <span>Accueil</span>
                </button>
                {folderPath.map((folder, index) => (
                  <div key={folder.id} className="flex items-center gap-1 flex-shrink-0">
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                    <button
                      onClick={() => navigateToLevel(index)}
                      className={`truncate max-w-[120px] ${
                        index === folderPath.length - 1
                          ? "font-medium text-violet-600 dark:text-violet-400"
                          : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                      }`}
                    >
                      {folder.name}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Header — 2 rows on mobile to avoid overflow */}
            <div className="mb-4 space-y-2">
              {/* Row 1 : back + title + count */}
              <div className="flex items-center gap-2">
                {selectedFolder && (
                  <button
                    onClick={navigateBack}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="flex-1 min-w-0 truncate text-base font-semibold text-neutral-900 dark:text-white lg:text-lg">
                  {currentFolderName || t("uncategorized")}
                </h2>
                <span className="flex-shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                  {currentSubfolders.length > 0 && `${currentSubfolders.length} · `}
                  {currentDocuments.length} doc{currentDocuments.length !== 1 ? "s" : ""}
                </span>
              </div>
              {/* Row 2 : action buttons (only when relevant) */}
              {(selectedFolder || currentDocuments.length > 0) && (
                <div className="flex items-center gap-2">
                  {selectedFolder && (
                    <button
                      onClick={() => {
                        setCreatingInParent(selectedFolder);
                        setIsCreatingFolder(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-400"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Sous-dossier
                    </button>
                  )}
                  {(currentDocuments.length > 0 || currentSubfolders.length > 0) && (
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
                </div>
              )}
            </div>

            {/* Selection toolbar */}
            {isSelectionMode && (selectedDocuments.size > 0 || selectedFolders.size > 0) && (
              <div className="mb-4 space-y-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {selectedDocuments.size + selectedFolders.size} sélectionné{selectedDocuments.size + selectedFolders.size > 1 ? "s" : ""}
                  </span>
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
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {selectedDocuments.size + selectedFolders.size === currentDocuments.length + currentSubfolders.length
                    ? "Tout désélectionner"
                    : "Tout sélectionner"}
                </button>
              </div>
            )}

            {/* Subfolders */}
            {currentSubfolders.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400 mb-2">Sous-dossiers</h3>
                <div className="space-y-2">
                  {currentSubfolders.map((subfolder) => {
                    const isFolderSelected = selectedFolders.has(subfolder.id);
                    return (
                    <div
                      key={subfolder.id}
                      onDragOver={(e) => !isSelectionMode && handleDragOver(e, subfolder.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => !isSelectionMode && handleDrop(e, subfolder.id)}
                      onClick={() => isSelectionMode && toggleFolderSelection(subfolder.id)}
                      className={`group flex items-center gap-2 lg:gap-3 rounded-xl p-2 lg:p-3 transition-all ${
                        dropTargetFolder === subfolder.id && draggedDocument
                          ? "bg-violet-100 ring-2 ring-violet-500 dark:bg-violet-500/20"
                          : isFolderSelected
                          ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10"
                          : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
                      } ${isSelectionMode ? "cursor-pointer" : ""}`}
                    >
                      {/* Checkbox */}
                      {isSelectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolderSelection(subfolder.id);
                          }}
                          className="flex-shrink-0"
                        >
                          {isFolderSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Square className="h-5 w-5 text-neutral-400" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); if (!isSelectionMode) openFolder(subfolder); }}
                        className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl flex-shrink-0 hover:ring-2 hover:ring-violet-500/30"
                        style={{ backgroundColor: subfolder.color + "20" }}
                      >
                        <Folder className="h-4 w-4 lg:h-5 lg:w-5" style={{ color: subfolder.color }} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (!isSelectionMode) openFolder(subfolder); }}
                        className="flex-1 min-w-0 text-left"
                      >
                        <span className="block truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {subfolder.name}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {subfolder.documentCount} doc{subfolder.documentCount !== 1 ? 's' : ''}
                          {(subfolder.childrenCount ?? 0) > 0 && ` · ${subfolder.childrenCount} sous-dossier${(subfolder.childrenCount ?? 0) > 1 ? 's' : ''}`}
                        </span>
                      </button>

                      {/* Favorite star - always visible on mobile if favorited */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(subfolder.id);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                          favorites.has(subfolder.id)
                            ? "text-yellow-500"
                            : "text-neutral-300 lg:opacity-0 lg:group-hover:opacity-100 hover:text-yellow-500 dark:text-neutral-600"
                        }`}
                        title={favorites.has(subfolder.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star className={`h-4 w-4 ${favorites.has(subfolder.id) ? "fill-current" : ""}`} />
                      </button>

                      {subfolder.hasPin && <Lock className="h-4 w-4 text-neutral-400 flex-shrink-0" />}

                      {/* Subfolder action menu */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderMenuId(folderMenuId === subfolder.id ? null : subfolder.id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {folderMenuId === subfolder.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setFolderMenuId(null)}
                            />
                            <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCreatingInParent(subfolder.id);
                                  setIsCreatingFolder(true);
                                  setFolderMenuId(null);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                              >
                                <Plus className="h-4 w-4 text-violet-500" />
                                Sous-dossier
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRulesFolder(subfolder);
                                  setFolderMenuId(null);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                              >
                                <Settings2 className="h-4 w-4 text-blue-500" />
                                {t("folderRules")}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditFolder(subfolder);
                                  setFolderMenuId(null);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                              >
                                <Edit2 className="h-4 w-4 text-neutral-500" />
                                {t("editFolder")}
                              </button>
                              <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder(subfolder.id, subfolder.name);
                                  setFolderMenuId(null);
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("delete")}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* Documents */}
            {currentDocuments.length === 0 && currentSubfolders.length === 0 ? (
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
            ) : currentDocuments.length > 0 && (
              <>
                {currentSubfolders.length > 0 && (
                  <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400 mb-2">Documents</h3>
                )}
                <div className="space-y-2">
                  {currentDocuments.map((doc) => {
                    const Icon = getFileIcon(doc.fileType);
                    const isSelected = selectedDocuments.has(doc.id);
                    const isDragging = draggedDocument === doc.id;
                    const isMoving = movingDocumentId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        draggable={!isSelectionMode && !isMobile}
                        onDragStart={(e) => !isMobile && handleDragStart(e, doc.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => isSelectionMode && toggleDocumentSelection(doc.id)}
                        className={`group flex items-center gap-2 lg:gap-3 rounded-xl p-2 lg:p-3 transition-all ${
                          isDragging
                            ? "opacity-50 ring-2 ring-violet-500"
                            : isSelected
                            ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10"
                            : "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
                        } ${isSelectionMode ? "cursor-pointer" : !isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
                      >
                        {/* Drag handle - desktop only */}
                        {!isSelectionMode && !isMobile && (
                          <div className="flex-shrink-0 text-neutral-300 dark:text-neutral-600">
                            <GripVertical className="h-4 w-4" />
                          </div>
                        )}

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

                        <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20 flex-shrink-0">
                          <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              if (isSelectionMode) {
                                e.stopPropagation();
                                toggleDocumentSelection(doc.id);
                              } else {
                                e.stopPropagation();
                                setPreviewDocument(doc);
                              }
                            }}
                            className="truncate text-sm font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                          >
                            {doc.displayName}
                          </button>
                          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{formatFileSize(doc.sizeBytes)}</span>
                            {isTeam && doc.addedBy && (
                              <span className="flex items-center gap-1" title={`Ajouté par ${doc.addedBy.name}`}>
                                <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: doc.addedBy.color }} />
                                <span className="hidden sm:inline truncate max-w-[60px]">{doc.addedBy.name.split(' ')[0]}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Move menu button - mobile only */}
                        {!isSelectionMode && (
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMovingDocumentId(isMoving ? null : doc.id);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Document actions dropdown menu */}
                            {isMoving && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setMovingDocumentId(null)}
                                />
                                <div className="absolute right-0 bottom-full z-50 mb-2 w-48 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
                                  {/* Send by email */}
                                  <button
                                    onClick={() => {
                                      setEmailDocId(doc.id);
                                      setEmailDocName(doc.displayName);
                                      setMovingDocumentId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-blue-50 dark:text-neutral-300 dark:hover:bg-blue-500/10"
                                  >
                                    <Send className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="truncate">{t("sendByEmail")}</span>
                                  </button>

                                  <div className="my-1.5 border-t border-neutral-100 dark:border-neutral-700" />

                                  <div className="mb-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
                                    {t("moveTo")}
                                  </div>
                                  <button
                                    onClick={() => {
                                      handleMoveDocument(doc.id, null);
                                      setMovingDocumentId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                  >
                                    <FolderOpen className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                                    <span className="truncate">{t("uncategorized")}</span>
                                  </button>
                                  {localFolders.filter(f => f.id !== doc.folderId).map((folder) => (
                                    <button
                                      key={folder.id}
                                      onClick={() => {
                                        if (folder.hasPin && !unlockedFolders.has(folder.id)) {
                                          setPendingFolder(folder);
                                          (window as any).pendingMoveOperation = { documentId: doc.id, targetFolderId: folder.id };
                                          setMovingDocumentId(null);
                                        } else {
                                          handleMoveDocument(doc.id, folder.id);
                                          setMovingDocumentId(null);
                                        }
                                      }}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {pendingFolder && (
        <PinModal
          folderName={pendingFolder.name}
          onVerify={verifyPin}
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
        folders={localFolders.map((f) => ({
          id: f.id,
          name: f.name,
          color: f.color,
          documentCount: f.documentCount,
        }))}
        documents={localDocuments.map((d) => ({
          id: d.id,
          displayName: d.displayName,
          fileType: d.fileType,
          folderId: d.folderId,
        }))}
        onShareCreated={() => router.refresh()}
      />

      {/* Folder Rules Modal */}
      {rulesFolder && (
        <FolderRulesModal
          folderId={rulesFolder.id}
          folderName={rulesFolder.name}
          isOpen={!!rulesFolder}
          onClose={() => setRulesFolder(null)}
          onSave={() => router.refresh()}
        />
      )}

      {/* Send by Email Modal */}
      {emailDocId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-[28px]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    {t("sendByEmail")}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                    {emailDocName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEmailDocId(null);
                  setEmailTo("");
                  setEmailMessage("");
                  setEmailError(null);
                  setEmailSent(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {emailSent ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <CheckCheck className="h-8 w-8 text-emerald-500" />
                </div>
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  {t("emailSent")}
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t("emailSentTo")} {emailTo}
                </p>
                <button
                  onClick={() => {
                    setEmailDocId(null);
                    setEmailTo("");
                    setEmailMessage("");
                    setEmailError(null);
                    setEmailSent(false);
                  }}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                >
                  {t("close")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {t("recipientEmail")} *
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => {
                      setEmailTo(e.target.value);
                      setEmailError(null);
                    }}
                    placeholder="exemple@email.com"
                    className="w-full rounded-xl border-0 bg-neutral-100 px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                    autoFocus
                  />
                  {emailTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo) && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {t("invalidEmail")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {t("emailMessage")}
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder={t("emailMessagePlaceholder")}
                    rows={3}
                    maxLength={1000}
                    className="w-full rounded-xl border-0 bg-neutral-100 px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500 resize-none"
                  />
                  <p className="mt-1 text-right text-xs text-neutral-400">
                    {emailMessage.length}/1000
                  </p>
                </div>

                {emailError && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {emailError}
                  </div>
                )}

                <button
                  onClick={async () => {
                    if (!emailTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
                      setEmailError(t("invalidEmail"));
                      return;
                    }
                    setEmailSending(true);
                    setEmailError(null);
                    try {
                      const response = await fetch(`/api/documents/${emailDocId}/send-email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          to: emailTo,
                          message: emailMessage || undefined,
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok) {
                        setEmailError(data.error || t("emailSendError"));
                      } else {
                        setEmailSent(true);
                      }
                    } catch {
                      setEmailError(t("emailSendError"));
                    } finally {
                      setEmailSending(false);
                    }
                  }}
                  disabled={emailSending || !emailTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {emailSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("sending")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("sendDocument")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
