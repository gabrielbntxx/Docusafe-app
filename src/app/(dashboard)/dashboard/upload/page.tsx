"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, X, FileText, File, Image as ImageIcon, FileCheck, Cloud, Sparkles, Wand2, FolderOpen, Loader2, Music, Video, FolderUp, Folder, FileCode, FileSpreadsheet, Presentation, Archive, CloudCog } from "lucide-react";
import { CloudPicker } from "@/components/cloud-picker/cloud-picker";

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
  subfolderPath: string | null; // The full path from root to parent folder (e.g., "root/sub1/sub2")
};

type FolderStructure = {
  [folderPath: string]: string; // Maps folder path to folder ID
};

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [folderFiles, setFolderFiles] = useState<FileWithPath[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
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

  // Destination folder selector (for individual file uploads)
  const [availableFolders, setAvailableFolders] = useState<Array<{ id: string; name: string; color: string | null }>>([]);
  const [selectedDestinationFolderId, setSelectedDestinationFolderId] = useState<string | null>(null);

  // Cloud picker state
  const [isCloudPickerOpen, setIsCloudPickerOpen] = useState(false);

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
    // Accept most files - let the backend validate
    const validFiles = droppedFiles.filter(file => {
      // Block only executable files
      const blockedExtensions = ['.exe', '.bat', '.cmd', '.msi', '.dll', '.scr', '.com'];
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      return !blockedExtensions.includes(ext);
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      // Clear folder selection when adding individual files
      setFolderFiles([]);
      setFolderName(null);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);

      // Extract folder name from the first file's path
      const firstPath = (fileList[0] as any).webkitRelativePath || "";
      const rootFolderName = firstPath.split("/")[0] || "Dossier importé";

      // Block only executable files
      const blockedExtensions = ['.exe', '.bat', '.cmd', '.msi', '.dll', '.scr', '.com'];

      const filesWithPaths: FileWithPath[] = fileList
        .filter(file => {
          // Skip hidden files and directories
          const path = (file as any).webkitRelativePath || file.name;
          if (path.includes("/.") || path.startsWith(".")) return false;
          // Skip blocked executable types
          const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
          if (blockedExtensions.includes(ext)) return false;
          return true;
        })
        .map(file => {
          const relativePath = (file as any).webkitRelativePath || file.name;
          const pathParts = relativePath.split("/");
          // Remove the filename to get the folder path
          pathParts.pop();
          const subfolderPath = pathParts.length > 0 ? pathParts.join("/") : null;

          return {
            file,
            relativePath,
            folderName: rootFolderName,
            subfolderPath, // e.g., "rootFolder/subfolder1/subfolder2"
          };
        });

      if (filesWithPaths.length > 0) {
        setFolderFiles(filesWithPaths);
        setFolderName(rootFolderName);
        // Clear individual files when selecting a folder
        setFiles([]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeFolderFile = (index: number) => {
    setFolderFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setFolderName(null);
      }
      return newFiles;
    });
  };

  const clearFolder = () => {
    setFolderFiles([]);
    setFolderName(null);
    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  // Handle files from cloud picker
  const handleCloudFilesSelected = (cloudFiles: File[]) => {
    setFiles(prev => [...prev, ...cloudFiles]);
    // Clear folder selection when adding cloud files
    setFolderFiles([]);
    setFolderName(null);
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
        // Folder might already exist, try to find it
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
    const hasFolderFiles = folderFiles.length > 0;

    if (!hasFiles && !hasFolderFiles) return;

    setIsUploading(true);
    setError(null);
    setFileErrors({});
    setAiResults({});

    let hasError = false;
    const folderIdMap: FolderStructure = {}; // Maps folder path -> folder ID

    // If uploading a folder with subfolders, create the entire folder structure first
    if (hasFolderFiles && folderName) {
      // Get all unique folder paths and sort them by depth (parents first)
      const allFolderPaths = new Set<string>();
      folderFiles.forEach(f => {
        if (f.subfolderPath) {
          // Add all parent paths too
          const parts = f.subfolderPath.split("/");
          let currentPath = "";
          parts.forEach(part => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            allFolderPaths.add(currentPath);
          });
        }
      });

      // Sort by depth (fewer slashes = created first)
      const sortedPaths = Array.from(allFolderPaths).sort((a, b) => {
        return a.split("/").length - b.split("/").length;
      });

      console.log("[Upload] Creating folder structure:", sortedPaths);

      // Create each folder in order
      for (const folderPath of sortedPaths) {
        const parts = folderPath.split("/");
        const currentFolderName = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1).join("/") || null;
        const parentId = parentPath ? folderIdMap[parentPath] : null;

        console.log(`[Upload] Creating folder: "${currentFolderName}" with parent: "${parentPath}" (parentId: ${parentId})`);

        const folderId = await createOrGetFolder(currentFolderName, parentId);
        if (folderId) {
          folderIdMap[folderPath] = folderId;
          console.log(`[Upload] Folder created: ${folderPath} -> ${folderId}`);
        }
      }
    }

    // Upload files (either individual or from folder)
    const filesToUpload = hasFolderFiles
      ? folderFiles.map(f => ({
          file: f.file,
          name: f.file.name,
          folderId: f.subfolderPath ? folderIdMap[f.subfolderPath] : null,
        }))
      : files.map(f => ({ file: f, name: f.name, folderId: selectedDestinationFolderId }));

    for (const { file, name, folderId } of filesToUpload) {
      const formData = new FormData();
      formData.append("file", file);
      if (folderId) {
        formData.append("folderId", folderId);
      }

      try {
        // Step 1: Upload the file
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const uploadData = await response.json();
          setUploadProgress(prev => ({ ...prev, [name]: aiSortingEnabled && !folderId ? 50 : 100 }));

          // Step 2: If AI sorting is enabled and NOT uploading to a specific folder, analyze and sort
          if (aiSortingEnabled && !folderId && uploadData.document?.id) {
            try {
              console.log("[Upload] Starting AI analysis for:", name, "type:", file.type);
              const analyzeResponse = await fetch("/api/documents/analyze", {
                method: "PUT", // PUT for auto-sort
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: uploadData.document.id }),
              });

              const analyzeData = await analyzeResponse.json();
              console.log("[Upload] AI analysis response:", analyzeData);

              if (analyzeResponse.ok && analyzeData.success) {
                setAiResults(prev => ({
                  ...prev,
                  [name]: {
                    category: analyzeData.result?.category || "Autres",
                    type: analyzeData.result?.documentType || "autre",
                  },
                }));
              } else {
                // Show AI error but don't fail the upload
                console.error("[Upload] AI analysis failed:", analyzeData.error);
                setAiResults(prev => ({
                  ...prev,
                  [name]: {
                    category: "Analyse échouée",
                    type: analyzeData.error || "Erreur inconnue",
                  },
                }));
              }
            } catch (aiError) {
              console.error("[Upload] AI analysis error:", aiError);
              setAiResults(prev => ({
                ...prev,
                [name]: {
                  category: "Erreur",
                  type: "Erreur réseau lors de l'analyse",
                },
              }));
            }
          }

          setUploadProgress(prev => ({ ...prev, [name]: 100 }));
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || "Erreur lors de l'upload";
          setFileErrors(prev => ({ ...prev, [name]: errorMessage }));
          hasError = true;

          if (response.status === 403) {
            setError(errorMessage);
            break;
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
        setFileErrors(prev => ({ ...prev, [name]: "Erreur réseau" }));
        hasError = true;
      }
    }

    setIsUploading(false);

    if (!hasError) {
      setTimeout(() => {
        router.push("/dashboard/my-files");
      }, 1500);
    }
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    // Images
    if (file.type.startsWith("image/") || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.heic'].includes(ext)) {
      return ImageIcon;
    }
    // PDF
    if (file.type === "application/pdf" || ext === '.pdf') return FileText;
    // Audio
    if (file.type.startsWith("audio/") || ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'].includes(ext)) {
      return Music;
    }
    // Video
    if (file.type.startsWith("video/") || ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext)) {
      return Video;
    }
    // Spreadsheets
    if (['.xls', '.xlsx', '.numbers', '.csv'].includes(ext)) return FileSpreadsheet;
    // Presentations
    if (['.ppt', '.pptx', '.key'].includes(ext)) return Presentation;
    // Code files
    if (['.py', '.js', '.ts', '.tsx', '.c', '.cpp', '.h', '.java', '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.html', '.css', '.scss', '.json', '.xml', '.yaml', '.yml', '.sh', '.sql', '.md'].includes(ext)) {
      return FileCode;
    }
    // Archives
    if (['.zip', '.rar', '.7z', '.gz', '.tar'].includes(ext)) return Archive;
    // Documents (Word, Pages, etc.)
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Ajouter des documents
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Drop Zone - Files */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
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

          <div className="pointer-events-none space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/25">
              <Cloud className="h-8 w-8 text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                Fichiers
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Glissez ou cliquez pour sélectionner
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/20 dark:text-red-400">PDF</span>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-600 dark:bg-green-500/20 dark:text-green-400">Images</span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">Office</span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">Code</span>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">Audio/Vidéo</span>
            </div>
          </div>
        </div>

        {/* Drop Zone - Folder */}
        <div
          className="relative overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all border-violet-300 bg-white hover:border-violet-400 hover:bg-violet-50/50 dark:border-violet-500/30 dark:bg-neutral-800/50 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/5"
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

          <div className="pointer-events-none space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/25">
              <FolderUp className="h-8 w-8 text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                Dossier complet
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Importez un dossier avec son contenu
              </p>
            </div>

            <div className="flex justify-center">
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                Crée automatiquement le dossier
              </span>
            </div>
          </div>
        </div>

        {/* Cloud Import Button */}
        <button
          onClick={() => setIsCloudPickerOpen(true)}
          className="relative overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all border-emerald-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-neutral-800/50 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/5"
        >
          <div className="space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25">
              <CloudCog className="h-8 w-8 text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                Depuis le cloud
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Google Drive, OneDrive
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                Google Drive
              </span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                OneDrive
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Selected Folder Info */}
      {folderName && folderFiles.length > 0 && (() => {
        // Count unique subfolders
        const uniqueFolders = new Set(
          folderFiles
            .filter(f => f.subfolderPath)
            .map(f => f.subfolderPath)
        );
        const subfolderCount = uniqueFolders.size - 1; // Exclude root folder

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
                    {folderFiles.length} fichier{folderFiles.length > 1 ? "s" : ""}
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

      {/* Destination Folder Selector (individual files only) */}
      {files.length > 0 && folderFiles.length === 0 && (
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
      {(files.length > 0 || folderFiles.length > 0) && (
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {folderFiles.length > 0
                ? `Dossier "${folderName}" (${folderFiles.length} fichiers)`
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

            {/* Folder files */}
            {folderFiles.map((fileData, index) => {
              const FileIcon = getFileIcon(fileData.file);
              const progress = uploadProgress[fileData.file.name] || 0;
              const fileError = fileErrors[fileData.file.name];

              return (
                <div
                  key={`folder-${index}`}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${
                    fileError
                      ? "bg-red-50 dark:bg-red-500/10"
                      : "bg-violet-50/50 dark:bg-violet-500/5"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    fileError
                      ? "bg-red-100 dark:bg-red-500/20"
                      : progress === 100
                      ? "bg-green-100 dark:bg-green-500/20"
                      : "bg-violet-100 dark:bg-violet-500/20"
                  }`}>
                    {fileError ? (
                      <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                    ) : progress === 100 ? (
                      <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : isUploading && progress > 0 && progress < 100 ? (
                      <Loader2 className="h-6 w-6 text-violet-600 dark:text-violet-400 animate-spin" />
                    ) : (
                      <FileIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-white">
                      {fileData.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>{formatFileSize(fileData.file.size)}</span>
                      {fileData.subfolderPath && fileData.subfolderPath !== folderName && (
                        <>
                          <span>•</span>
                          <span className="truncate text-violet-500 dark:text-violet-400">
                            📁 {fileData.subfolderPath}
                          </span>
                        </>
                      )}
                    </div>

                    {fileError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {fileError}
                      </p>
                    )}

                    {isUploading && progress > 0 && !fileError && progress < 100 && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-200 dark:bg-violet-900">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {progress !== 100 && !isUploading && (
                    <button
                      onClick={() => removeFolderFile(index)}
                      disabled={isUploading}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading || (files.length === 0 && folderFiles.length === 0)}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none ${
                folderFiles.length > 0
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/25"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25"
              }`}
            >
              {isUploading
                ? "Upload en cours..."
                : folderFiles.length > 0
                ? `Importer le dossier (${folderFiles.length} fichiers)`
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
                <li>Formats : PDF, Images, MP3, MP4, WAV</li>
                <li>Taille max : 100 MB par fichier</li>
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
