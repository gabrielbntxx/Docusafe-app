"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, FileText, File, Image as ImageIcon, FileCheck, Cloud, Sparkles, Wand2, FolderOpen, Loader2, Music, Video, FolderUp, Folder, FileCode, FileSpreadsheet, Presentation, Archive, CloudCog, Lock, CreditCard } from "lucide-react";
import { CloudPicker } from "@/components/cloud-picker/cloud-picker";
import { useSubscription } from "@/components/providers/subscription-provider";

type AIStatus = {
  allowed: boolean;
  remaining: number;
  limit: number;
  aiSortingEnabled: boolean;
  planType: string;
};

type FileWithPath = {
  file: File;
  relativePath: string;
  folderName: string | null;
  subfolderPath: string | null;
};

type FolderStructure = {
  [folderPath: string]: string;
};

type FolderPreviewItem = {
  file: File;
  name: string;
  size: number;
  subfolderPath: string | null;
};

export default function UploadPage() {
  const router = useRouter();
  const { isRestricted } = useSubscription();
  const [files, setFiles] = useState<File[]>([]);

  // Folder upload: heavy data in ref, only lightweight state for display
  const folderDataRef = useRef<FileWithPath[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [folderTotalCount, setFolderTotalCount] = useState(0);
  const [folderPreview, setFolderPreview] = useState<FolderPreviewItem[]>([]);
  const [folderProgress, setFolderProgress] = useState(0); // 0-100
  const [folderFailedCount, setFolderFailedCount] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const folderInputRef = useRef<HTMLInputElement>(null);

  // AI sorting state
  const [aiSortingEnabled, setAiSortingEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiResults, setAiResults] = useState<{ [key: string]: { category: string; type: string } }>({});
  const [uploadedCount, setUploadedCount] = useState(0);

  // Destination folder selector (for individual file uploads)
  const [availableFolders, setAvailableFolders] = useState<Array<{ id: string; name: string; color: string | null }>>([]);
  const [selectedDestinationFolderId, setSelectedDestinationFolderId] = useState<string | null>(null);

  // Cloud picker state
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);

  // Private upload state
  const [isPrivateUpload, setIsPrivateUpload] = useState(false);

  // Fetch AI status on mount
  useEffect(() => {
    fetch("/api/documents/analyze")
      .then((res) => res.json())
      .then((data) => {
        setAiStatus(data);
        setAiSortingEnabled(data.aiSortingEnabled && data.allowed);
      })
      .catch(console.error);
  }, []);

  // Fetch available folders for destination selector
  useEffect(() => {
    fetch("/api/folders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableFolders(data);
      })
      .catch(console.error);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const blockedExtensions = ['.exe', '.bat', '.cmd', '.msi', '.dll', '.scr', '.com'];
    const validFiles = droppedFiles.filter(file => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      return !blockedExtensions.includes(ext);
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      clearFolder();
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const blockedExtensions = ['.exe', '.bat', '.cmd', '.msi', '.dll', '.scr', '.com'];
    const firstPath = (fileList[0] as any).webkitRelativePath || "";
    const rootFolderName = firstPath.split("/")[0] || "Dossier importé";

    // Build metadata array — single pass, no DOM allocation, no React state for each file
    const allMeta: FileWithPath[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const path = (file as any).webkitRelativePath || file.name;
      if (path.includes("/.") || path.startsWith(".")) continue;
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (blockedExtensions.includes(ext)) continue;

      const parts = path.split("/");
      parts.pop();
      const subfolderPath = parts.length > 0 ? parts.join("/") : null;

      allMeta.push({ file, relativePath: path, folderName: rootFolderName, subfolderPath });
    }

    if (allMeta.length === 0) return;

    // Store everything in ref — zero React re-renders for the bulk data
    folderDataRef.current = allMeta;
    setFolderName(rootFolderName);
    setFolderTotalCount(allMeta.length);
    // Only first 8 items stored in state for display
    setFolderPreview(allMeta.slice(0, 8).map(f => ({
      file: f.file,
      name: f.file.name,
      size: f.file.size,
      subfolderPath: f.subfolderPath,
    })));
    setFiles([]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFolder = () => {
    folderDataRef.current = [];
    setFolderName(null);
    setFolderTotalCount(0);
    setFolderPreview([]);
    setFolderProgress(0);
    setFolderFailedCount(0);
    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  // Handle files from cloud picker
  const handleCloudFilesSelected = (cloudFiles: File[]) => {
    setFiles(prev => [...prev, ...cloudFiles]);
    clearFolder();
  };

  // Helper function to create or get a folder
  const createOrGetFolder = async (
    name: string,
    parentId: string | null = null
  ): Promise<string | null> => {
    try {
      const folderResponse = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color: "#3B82F6",
          icon: "folder",
          parentId,
        }),
      });

      if (folderResponse.ok) {
        const folderData = await folderResponse.json();
        return folderData.id;
      } else {
        const queryParam = parentId ? `?parentId=${parentId}` : "?parentId=root";
        const listResponse = await fetch(`/api/folders${queryParam}`);
        if (listResponse.ok) {
          const folders = await listResponse.json();
          const existingFolder = folders.find((f: any) => f.name === name);
          if (existingFolder) {
            return existingFolder.id;
          }
        }
      }
    } catch (err) {
      console.error("Error creating folder:", err);
    }
    return null;
  };

  const handleUpload = async () => {
    const hasFiles = files.length > 0;
    const hasFolderFiles = folderTotalCount > 0;

    if (!hasFiles && !hasFolderFiles) return;

    setIsUploading(true);
    setError(null);
    setFileErrors({});
    setAiResults({});
    setUploadedCount(0);
    setFolderProgress(0);
    setFolderFailedCount(0);

    let hasError = false;
    const folderIdMap: FolderStructure = {};

    // Build folder structure — parallelized by depth level
    if (hasFolderFiles && folderName) {
      const allFolderData = folderDataRef.current;
      const allFolderPaths = new Set<string>();
      for (const f of allFolderData) {
        if (f.subfolderPath) {
          const parts = f.subfolderPath.split("/");
          let currentPath = "";
          for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            allFolderPaths.add(currentPath);
          }
        }
      }

      // Group by depth level, create all folders at same depth in parallel
      const byDepth = new Map<number, string[]>();
      for (const p of allFolderPaths) {
        const depth = p.split("/").length;
        const arr = byDepth.get(depth) ?? [];
        arr.push(p);
        byDepth.set(depth, arr);
      }

      const depths = Array.from(byDepth.keys()).sort((a, b) => a - b);
      for (const depth of depths) {
        const paths = byDepth.get(depth)!;
        await Promise.all(paths.map(async (folderPath) => {
          const parts = folderPath.split("/");
          const name = parts[parts.length - 1];
          const parentPath = parts.slice(0, -1).join("/") || null;
          const parentId = parentPath ? (folderIdMap[parentPath] ?? null) : null;
          const folderId = await createOrGetFolder(name, parentId);
          if (folderId) folderIdMap[folderPath] = folderId;
        }));
      }
    }

    // Counters (plain variables, not state, for hot-path updates)
    let completedCount = 0;
    let failedCount = 0;
    let fatalError = false;

    // Higher concurrency for folder uploads
    const CONCURRENCY = hasFolderFiles ? 10 : 4;
    const MAX_RETRIES = 2;

    // For folder uploads: fixed interval updates every 300ms — no debounce that
    // blocks updates when files complete faster than the debounce window.
    if (hasFolderFiles) {
      const totalCount = folderDataRef.current.length;
      progressIntervalRef.current = setInterval(() => {
        setUploadedCount(completedCount);
        setFolderProgress(Math.round((completedCount / totalCount) * 100));
        setFolderFailedCount(failedCount);
      }, 300);
    }

    const uploadOne = async ({
      file,
      name,
      folderId,
      isFolder,
    }: {
      file: File;
      name: string;
      folderId: string | null;
      isFolder: boolean;
    }) => {
      if (fatalError) return;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (fatalError) return;

        const fd = new FormData();
        fd.append("file", file);
        if (folderId) fd.append("folderId", folderId);
        if (isPrivateUpload) fd.append("isPrivate", "1");

        try {
          const res = await fetch("/api/documents/upload", {
            method: "POST",
            body: fd,
            signal: AbortSignal.timeout(120_000),
          });

          if (res.ok) {
            const data = await res.json();

            if (!isFolder) {
              setUploadProgress(prev => ({ ...prev, [name]: aiSortingEnabled && !folderId ? 50 : 100 }));
            }

            // AI sorting (individual files only)
            if (!isFolder && aiSortingEnabled && !folderId && data.document?.id) {
              try {
                const ar = await fetch("/api/documents/analyze", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ documentId: data.document.id }),
                });
                const ad = await ar.json();
                setAiResults(prev => ({
                  ...prev,
                  [name]: ar.ok && ad.success
                    ? { category: ad.result?.category || "Autres", type: ad.result?.documentType || "autre" }
                    : { category: "Analyse échouée", type: ad.error || "Erreur" },
                }));
              } catch {
                setAiResults(prev => ({ ...prev, [name]: { category: "Erreur", type: "Erreur réseau" } }));
              }
            }

            if (!isFolder) {
              setUploadProgress(prev => ({ ...prev, [name]: 100 }));
              setUploadedCount(++completedCount);
            } else {
              completedCount++;
            }
            return;
          }

          const errData = await res.json().catch(() => ({}));
          const errMsg = (errData as { error?: string }).error || "Erreur lors de l'upload";

          if (res.status === 403) {
            fatalError = true;
            hasError = true;
            setError(errMsg);
            if (!isFolder) setFileErrors(prev => ({ ...prev, [name]: errMsg }));
            return;
          }

          if (res.status === 400) {
            hasError = true;
            if (!isFolder) setFileErrors(prev => ({ ...prev, [name]: errMsg }));
            else failedCount++;
            return;
          }

          // 429 / 5xx: retryable
          if (attempt < MAX_RETRIES) {
            await new Promise<void>(r => setTimeout(r, 1500 * (attempt + 1)));
            continue;
          }

          hasError = true;
          if (!isFolder) setFileErrors(prev => ({ ...prev, [name]: errMsg }));
          else failedCount++;
        } catch {
          if (attempt < MAX_RETRIES) {
            await new Promise<void>(r => setTimeout(r, 1500 * (attempt + 1)));
            continue;
          }
          hasError = true;
          if (!isFolder) setFileErrors(prev => ({ ...prev, [name]: "Erreur réseau" }));
          else failedCount++;
        }
        break;
      }
    };

    // Worker pool — shared index into folderDataRef (no 90k array copy)
    if (hasFolderFiles) {
      const allFiles = folderDataRef.current;
      let queueIndex = 0;
      const workers = Array.from({ length: Math.min(CONCURRENCY, allFiles.length) }, async () => {
        while (queueIndex < allFiles.length && !fatalError) {
          const f = allFiles[queueIndex++];
          await uploadOne({
            file: f.file,
            name: f.file.name,
            folderId: f.subfolderPath ? (folderIdMap[f.subfolderPath] ?? null) : null,
            isFolder: true,
          });
        }
      });
      await Promise.all(workers);
    } else {
      const uploadQueue = [...files.map(f => ({ file: f, name: f.name, folderId: selectedDestinationFolderId, isFolder: false }))];
      const workers = Array.from({ length: Math.min(CONCURRENCY, uploadQueue.length) }, async () => {
        while (uploadQueue.length > 0 && !fatalError) {
          const item = uploadQueue.shift();
          if (item) await uploadOne(item);
        }
      });
      await Promise.all(workers);
    }

    // Stop interval and do final flush
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (hasFolderFiles) {
      setUploadedCount(completedCount);
      setFolderProgress(100);
      setFolderFailedCount(failedCount);
    }

    setIsUploading(false);

    if (!hasError) {
      setTimeout(() => {
        router.push(
          isPrivateUpload
            ? "/dashboard/documents?space=private"
            : "/dashboard/documents"
        );
      }, 1500);
    }
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (file.type.startsWith("image/") || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.heic'].includes(ext)) {
      return ImageIcon;
    }
    if (file.type === "application/pdf" || ext === '.pdf') return FileText;
    if (file.type.startsWith("audio/") || ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'].includes(ext)) {
      return Music;
    }
    if (file.type.startsWith("video/") || ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext)) {
      return Video;
    }
    if (['.xls', '.xlsx', '.numbers', '.csv'].includes(ext)) return FileSpreadsheet;
    if (['.ppt', '.pptx', '.key'].includes(ext)) return Presentation;
    if (['.py', '.js', '.ts', '.tsx', '.c', '.cpp', '.h', '.java', '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.html', '.css', '.scss', '.json', '.xml', '.yaml', '.yml', '.sh', '.sql', '.md'].includes(ext)) {
      return FileCode;
    }
    if (['.zip', '.rar', '.7z', '.gz', '.tar'].includes(ext)) return Archive;
    if (['.doc', '.docx', '.pages', '.rtf', '.txt'].includes(ext)) return FileText;

    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const hasSelection = files.length > 0 || folderTotalCount > 0;

  if (isRestricted) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-xl shadow-blue-500/25">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Fonctionnalité réservée aux abonnés
          </h1>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            L&apos;ajout de documents nécessite un abonnement actif. Choisissez le plan qui vous convient pour commencer à stocker vos fichiers.
          </p>
          <Link
            href="/dashboard/subscription"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <CreditCard className="h-4 w-4" />
            Voir les abonnements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
          Ajouter des documents
        </h1>
        <p className="hidden sm:block mt-1 text-neutral-500 dark:text-neutral-400">
          Glissez-déposez vos fichiers ou cliquez pour les sélectionner
        </p>
      </div>

      {/* Global Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-300">Erreur de limite</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="rounded-lg p-1.5 text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Options Grid */}
      <div className={`grid gap-3 grid-cols-3 transition-all`}>
        {/* Drop Zone - Files */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed text-center transition-all ${
            hasSelection ? "p-3" : "p-5 sm:p-8"
          } ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10"
              : "border-neutral-300 bg-white hover:border-blue-400 hover:bg-blue-50/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5"
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,.tif,.heic,.heif,.mp3,.wav,.wave,.ogg,.flac,.aac,.m4a,.mp4,.m4v,.mov,.webm,.avi,.mkv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pages,.numbers,.key,.txt,.csv,.rtf,.md,.markdown,.py,.c,.h,.cpp,.hpp,.js,.ts,.tsx,.java,.cs,.go,.rs,.rb,.php,.swift,.kt,.html,.htm,.css,.scss,.json,.xml,.yaml,.yml,.sh,.sql,.zip,.rar,.7z,.gz"
            onChange={handleFileSelect}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="pointer-events-none flex flex-col items-center gap-1.5">
            <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 transition-all ${hasSelection ? "h-8 w-8" : "h-12 w-12 sm:h-16 sm:w-16"}`}>
              <Cloud className={`text-white transition-all ${hasSelection ? "h-4 w-4" : "h-6 w-6 sm:h-8 sm:w-8"}`} />
            </div>
            <p className={`font-semibold text-neutral-900 dark:text-white transition-all ${hasSelection ? "text-xs" : "text-sm sm:text-lg"}`}>
              Fichiers
            </p>
            {!hasSelection && (
              <>
                <p className="hidden sm:block text-sm text-neutral-500 dark:text-neutral-400">
                  Glissez ou cliquez pour sélectionner
                </p>
                <div className="hidden sm:flex flex-wrap justify-center gap-1.5 mt-1">
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/20 dark:text-red-400">PDF</span>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-600 dark:bg-green-500/20 dark:text-green-400">Images</span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">Office</span>
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">Code</span>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">Audio/Vidéo</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Drop Zone - Folder */}
        <div
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed text-center transition-all border-violet-300 bg-white hover:border-violet-400 hover:bg-violet-50/50 dark:border-violet-500/30 dark:bg-neutral-800/50 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/5 ${
            hasSelection ? "p-3" : "p-5 sm:p-8"
          }`}
        >
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore - webkitdirectory is a non-standard attribute
            webkitdirectory=""
            // @ts-ignore
            directory=""
            multiple
            onChange={handleFolderSelect}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="pointer-events-none flex flex-col items-center gap-1.5">
            <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 transition-all ${hasSelection ? "h-8 w-8" : "h-12 w-12 sm:h-16 sm:w-16"}`}>
              <FolderUp className={`text-white transition-all ${hasSelection ? "h-4 w-4" : "h-6 w-6 sm:h-8 sm:w-8"}`} />
            </div>
            <p className={`font-semibold text-neutral-900 dark:text-white transition-all ${hasSelection ? "text-xs" : "text-sm sm:text-lg"}`}>
              Dossier
            </p>
            {!hasSelection && (
              <>
                <p className="hidden sm:block text-sm text-neutral-500 dark:text-neutral-400">
                  Importez un dossier avec son contenu
                </p>
                <div className="hidden sm:flex justify-center mt-1">
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                    Crée automatiquement le dossier
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cloud Import Button */}
        <button
          onClick={() => setIsCloudPickerOpen(true)}
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed text-center transition-all border-emerald-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-neutral-800/50 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/5 ${
            hasSelection ? "p-3" : "p-5 sm:p-8"
          }`}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 transition-all ${hasSelection ? "h-8 w-8" : "h-12 w-12 sm:h-16 sm:w-16"}`}>
              <CloudCog className={`text-white transition-all ${hasSelection ? "h-4 w-4" : "h-6 w-6 sm:h-8 sm:w-8"}`} />
            </div>
            <p className={`font-semibold text-neutral-900 dark:text-white transition-all ${hasSelection ? "text-xs" : "text-sm sm:text-lg"}`}>
              Cloud
            </p>
            {!hasSelection && (
              <>
                <p className="hidden sm:block text-sm text-neutral-500 dark:text-neutral-400">
                  Google Drive, OneDrive
                </p>
                <div className="hidden sm:flex justify-center gap-2 mt-1">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Google Drive
                  </span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    OneDrive
                  </span>
                </div>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Selected Folder Info */}
      {folderName && folderTotalCount > 0 && (() => {
        const uniqueFolders = new Set(
          folderDataRef.current
            .filter(f => f.subfolderPath)
            .map(f => f.subfolderPath)
        );
        const subfolderCount = Math.max(0, uniqueFolders.size - 1);

        return (
          <div className="rounded-3xl bg-gradient-to-r from-violet-50 to-purple-50 p-5 dark:from-violet-500/10 dark:to-purple-500/10 border border-violet-200 dark:border-violet-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
                  <Folder className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {folderName}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {folderTotalCount.toLocaleString("fr-FR")} fichier{folderTotalCount > 1 ? "s" : ""}
                    {subfolderCount > 0 && (
                      <span> • {subfolderCount} sous-dossier{subfolderCount > 1 ? "s" : ""}</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={clearFolder}
                disabled={isUploading}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-violet-600 transition-colors hover:bg-violet-100 dark:text-violet-400 dark:hover:bg-violet-500/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* AI Sorting Toggle */}
      {files.length > 0 && aiStatus && (
        <div className="rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-5 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
                <Wand2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Tri automatique par IA
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {aiStatus.limit === -1
                    ? "Illimité avec votre plan"
                    : `${aiStatus.remaining}/${aiStatus.limit} analyses restantes ce mois`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiSortingEnabled(!aiSortingEnabled)}
              disabled={!aiStatus.allowed || isUploading}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                aiSortingEnabled
                  ? "bg-violet-500"
                  : "bg-neutral-300 dark:bg-neutral-600"
              } ${!aiStatus.allowed ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  aiSortingEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          {aiSortingEnabled && (
            <p className="mt-3 text-xs text-violet-600 dark:text-violet-400">
              Les documents seront analysés et classés automatiquement dans des dossiers appropriés.
            </p>
          )}
          {!aiStatus.allowed && aiStatus.remaining === 0 && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              Limite mensuelle atteinte. Passez à Premium pour un tri illimité.
            </p>
          )}
        </div>
      )}

      {/* Private Upload Toggle */}
      {hasSelection && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
                <Lock className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Espace privé
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {isPrivateUpload
                    ? "Visible uniquement par vous dans Mon espace privé"
                    : "Ajouter dans Mon espace privé"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPrivateUpload(!isPrivateUpload)}
              disabled={isUploading}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                isPrivateUpload
                  ? "bg-neutral-700 dark:bg-neutral-500"
                  : "bg-neutral-300 dark:bg-neutral-600"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  isPrivateUpload ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Destination Folder Selector (individual files only) */}
      {files.length > 0 && folderTotalCount === 0 && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
              <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Dossier de destination
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Les règles du dossier (ex : conversion PDF) seront appliquées
              </p>
            </div>
          </div>
          <div className="mt-4">
            <select
              value={selectedDestinationFolderId ?? ""}
              onChange={(e) => setSelectedDestinationFolderId(e.target.value || null)}
              disabled={isUploading}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:text-white dark:focus:border-blue-400"
            >
              <option value="">Aucun dossier (racine)</option>
              {availableFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Files List */}
      {(files.length > 0 || folderTotalCount > 0) && (
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {folderTotalCount > 0
                ? `Dossier "${folderName}" (${folderTotalCount.toLocaleString("fr-FR")} fichiers)`
                : `Fichiers sélectionnés (${files.length})`}
            </h3>
            <button
              onClick={() => {
                setFiles([]);
                clearFolder();
              }}
              disabled={isUploading}
              className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Tout supprimer
            </button>
          </div>

          <div className="space-y-2">
            {/* Individual files */}
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              const progress = uploadProgress[file.name] || 0;
              const fileError = fileErrors[file.name];
              const aiResult = aiResults[file.name];

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${
                    fileError
                      ? "bg-red-50 dark:bg-red-500/10"
                      : "bg-neutral-50 dark:bg-neutral-700/30"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    fileError
                      ? "bg-red-100 dark:bg-red-500/20"
                      : progress === 100
                      ? "bg-green-100 dark:bg-green-500/20"
                      : "bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10"
                  }`}>
                    {fileError ? (
                      <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                    ) : progress === 100 ? (
                      <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : isUploading && progress > 0 && progress < 100 ? (
                      <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : (
                      <FileIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {formatFileSize(file.size)}
                    </p>

                    {fileError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {fileError}
                      </p>
                    )}

                    {/* AI Result Badge */}
                    {aiResult && progress === 100 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                          <FolderOpen className="h-3 w-3" />
                          {aiResult.category}
                        </span>
                        <span className="text-xs text-neutral-400">
                          Classé automatiquement
                        </span>
                      </div>
                    )}

                    {isUploading && progress > 0 && !fileError && progress < 100 && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {aiSortingEnabled && progress >= 50 && progress < 100 && (
                          <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
                            Analyse IA en cours...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {progress !== 100 && !isUploading && (
                    <button
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Folder files — show only preview + overall progress */}
            {folderTotalCount > 0 && (
              <>
                {/* Overall progress bar during upload */}
                {isUploading && (
                  <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-spin" />
                        <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                          Import en cours…
                        </span>
                      </div>
                      <span className="text-sm text-violet-600 dark:text-violet-400">
                        {uploadedCount.toLocaleString("fr-FR")} / {folderTotalCount.toLocaleString("fr-FR")}
                        {folderFailedCount > 0 && (
                          <span className="ml-2 text-red-500">({folderFailedCount} erreur{folderFailedCount > 1 ? "s" : ""})</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-violet-200 dark:bg-violet-900">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${folderProgress}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-violet-500 dark:text-violet-400">
                      {folderProgress}% — {10} uploads en parallèle
                    </p>
                  </div>
                )}

                {/* Completion state */}
                {!isUploading && folderProgress === 100 && (
                  <div className="rounded-2xl bg-green-50 dark:bg-green-500/10 p-4 flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {uploadedCount.toLocaleString("fr-FR")} fichier{uploadedCount > 1 ? "s" : ""} importé{uploadedCount > 1 ? "s" : ""}
                      {folderFailedCount > 0 && ` — ${folderFailedCount} erreur${folderFailedCount > 1 ? "s" : ""}`}
                    </span>
                  </div>
                )}

                {/* Preview of first 8 files */}
                {folderPreview.map((item, index) => {
                  const FileIcon = getFileIcon(item.file);
                  return (
                    <div
                      key={`preview-${index}`}
                      className="flex items-center gap-4 rounded-2xl p-4 bg-violet-50/50 dark:bg-violet-500/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
                        <FileIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span>{formatFileSize(item.size)}</span>
                          {item.subfolderPath && item.subfolderPath !== folderName && (
                            <>
                              <span>•</span>
                              <span className="truncate text-violet-500 dark:text-violet-400">
                                📁 {item.subfolderPath}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* "And N more files" summary */}
                {folderTotalCount > folderPreview.length && (
                  <div className="rounded-2xl border border-dashed border-violet-200 dark:border-violet-500/20 p-3 text-center">
                    <p className="text-sm text-violet-600 dark:text-violet-400">
                      + {(folderTotalCount - folderPreview.length).toLocaleString("fr-FR")} autres fichiers
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading || (files.length === 0 && folderTotalCount === 0)}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none ${
                folderTotalCount > 0
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/25"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25"
              }`}
            >
              {isUploading
                ? `${uploadedCount.toLocaleString("fr-FR")} / ${(files.length || folderTotalCount).toLocaleString("fr-FR")} fichiers importés…`
                : folderTotalCount > 0
                ? `Importer le dossier (${folderTotalCount.toLocaleString("fr-FR")} fichiers)`
                : `Uploader ${files.length} fichier${files.length > 1 ? "s" : ""}`}
            </button>
            {isUploading ? (
              <button
                disabled
                className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                Annuler
              </button>
            ) : (
              <Link
                href="/dashboard/documents"
                prefetch={false}
                className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Annuler
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Info Card - Show upload limits for all plans */}
      {aiStatus && (
        <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-xl shadow-violet-500/20">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Formats acceptés</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-violet-100">
                <li>PDF, Images, Audio, Vidéo, Office, Code, Archives</li>
                <li>Taille max : 100 MB (vidéos 1 GB, archives 500 MB)</li>
                <li>Jusqu&apos;à 100 fichiers en parallèle</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Picker Modal */}
      <CloudPicker
        isOpen={isCloudPickerOpen}
        onClose={() => setIsCloudPickerOpen(false)}
        onFilesSelected={handleCloudFilesSelected}
      />
    </div>
  );
}
