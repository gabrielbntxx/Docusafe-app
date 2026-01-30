"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, File, Image as ImageIcon, FileCheck, Cloud, Sparkles, Wand2, FolderOpen, Loader2, Music, Video } from "lucide-react";

type AIStatus = {
  allowed: boolean;
  remaining: number;
  limit: number;
  aiSortingEnabled: boolean;
  planType: string;
};

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  // AI sorting state
  const [aiSortingEnabled, setAiSortingEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiResults, setAiResults] = useState<{ [key: string]: { category: string; type: string } }>({});

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
    const validFiles = droppedFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'audio/mpeg', 'audio/wav', 'audio/x-wav',
        'video/mp4', 'video/quicktime', 'video/webm'
      ];
      return validTypes.includes(file.type);
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setFileErrors({});
    setAiResults({});

    let hasError = false;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Step 1: Upload the file
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const uploadData = await response.json();
          setUploadProgress(prev => ({ ...prev, [file.name]: aiSortingEnabled ? 50 : 100 }));

          // Step 2: If AI sorting is enabled, analyze and sort
          if (aiSortingEnabled && uploadData.document?.id) {
            try {
              console.log("[Upload] Starting AI analysis for:", file.name, "type:", file.type);
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
                  [file.name]: {
                    category: analyzeData.result?.category || "Autres",
                    type: analyzeData.result?.documentType || "autre",
                  },
                }));
              } else {
                // Show AI error but don't fail the upload
                console.error("[Upload] AI analysis failed:", analyzeData.error);
                setAiResults(prev => ({
                  ...prev,
                  [file.name]: {
                    category: "Analyse échouée",
                    type: analyzeData.error || "Erreur inconnue",
                  },
                }));
              }
            } catch (aiError) {
              console.error("[Upload] AI analysis error:", aiError);
              setAiResults(prev => ({
                ...prev,
                [file.name]: {
                  category: "Erreur",
                  type: "Erreur réseau lors de l'analyse",
                },
              }));
            }
          }

          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || "Erreur lors de l'upload";
          setFileErrors(prev => ({ ...prev, [file.name]: errorMessage }));
          hasError = true;

          if (response.status === 403) {
            setError(errorMessage);
            break;
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
        setFileErrors(prev => ({ ...prev, [file.name]: "Erreur réseau" }));
        hasError = true;
      }
    }

    setIsUploading(false);

    if (!hasError) {
      setTimeout(() => {
        router.push("/dashboard/documents");
      }, 1500);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type === "application/pdf") return FileText;
    if (file.type.startsWith("audio/")) return Music;
    if (file.type.startsWith("video/")) return Video;
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

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10"
            : "border-neutral-300 bg-white hover:border-blue-400 hover:bg-blue-50/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5"
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.wave,.mp4,.m4v,.mov,.webm"
          onChange={handleFileSelect}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="pointer-events-none space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/25">
            <Cloud className="h-10 w-10 text-white" />
          </div>

          <div>
            <p className="text-xl font-semibold text-neutral-900 dark:text-white">
              Glissez vos fichiers ici
            </p>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              ou cliquez pour sélectionner
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">PDF</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">JPG</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">PNG</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">GIF</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">MP3</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">MP4</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">WAV</span>
          </div>
        </div>
      </div>

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

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Fichiers sélectionnés ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              disabled={isUploading}
              className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Tout supprimer
            </button>
          </div>

          <div className="space-y-2">
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
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
            >
              {isUploading ? "Upload en cours..." : `Uploader ${files.length} fichier${files.length > 1 ? "s" : ""}`}
            </button>
            <button
              onClick={() => router.push("/dashboard/documents")}
              disabled={isUploading}
              className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Info Card - Only show for FREE users */}
      {aiStatus && aiStatus.planType !== "PRO" && (
        <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-xl shadow-violet-500/20">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Limites du plan FREE</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-violet-100">
                <li>Formats: PDF, Images, MP3, MP4, WAV</li>
                <li>Taille max: 100 MB par fichier</li>
                <li>Maximum 15 fichiers</li>
                <li>Stockage total: 1 GB</li>
              </ul>
              <a href="/dashboard/subscription" className="mt-4 inline-block rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30">
                Passer à Pro
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
