"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, File, Image as ImageIcon, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

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
      // Accepter les PDFs, images et documents
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
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

    let hasError = false;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || "Erreur lors de l'upload";
          setFileErrors(prev => ({ ...prev, [file.name]: errorMessage }));
          hasError = true;

          // Si c'est une erreur de limite globale, on arrête tout
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

    // Rediriger vers la bibliothèque après upload seulement si pas d'erreur
    if (!hasError) {
      setTimeout(() => {
        router.push("/dashboard/documents");
      }, 1000);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type === "application/pdf") return FileText;
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Ajouter des documents
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Glissez-déposez vos fichiers ou cliquez pour les sélectionner
        </p>
      </div>

      {/* Global Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200">Erreur de limite</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="rounded-lg p-1 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
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
        className={`
          relative rounded-2xl border-2 border-dashed p-12 text-center transition-all
          ${
            isDragging
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-300 bg-white hover:border-primary-400 hover:bg-primary-25"
          }
        `}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="pointer-events-none space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary-100">
            <Upload className="h-8 w-8 text-primary-600" />
          </div>

          <div>
            <p className="text-lg font-semibold text-neutral-900">
              Glissez vos fichiers ici
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              ou cliquez pour sélectionner
            </p>
          </div>

          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            PDF, JPG, PNG - Plan FREE: 2MB max par fichier, 5 fichiers max
          </p>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              Fichiers sélectionnés ({files.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Tout supprimer
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              const progress = uploadProgress[file.name] || 0;
              const fileError = fileErrors[file.name];

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    fileError
                      ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                      : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    fileError ? "bg-red-100 dark:bg-red-900/50" : "bg-primary-100 dark:bg-primary-900/30"
                  }`}>
                    {fileError ? (
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatFileSize(file.size)}
                    </p>

                    {/* Error Message */}
                    {fileError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {fileError}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {isUploading && progress > 0 && !fileError && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div
                          className="h-full bg-primary-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {progress === 100 ? (
                    <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <button
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="flex-1"
            >
              {isUploading ? "Upload en cours..." : `Uploader ${files.length} fichier${files.length > 1 ? "s" : ""}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/documents")}
              disabled={isUploading}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary-50 to-secondary-50 p-6 dark:border-neutral-700 dark:from-primary-900/20 dark:to-secondary-900/20">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          📋 Limites du plan FREE
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <li>• <strong>Formats acceptés:</strong> PDF, JPG, PNG, GIF</li>
          <li>• <strong>Taille par fichier:</strong> Maximum 2 MB</li>
          <li>• <strong>Nombre de fichiers:</strong> Maximum 5 fichiers</li>
          <li>• <strong>Stockage total:</strong> Maximum 2 MB au total</li>
          <li className="pt-2">
            <strong className="text-primary-600 dark:text-primary-400">💎 Passez à Pro</strong> pour des fichiers illimités et 10GB de stockage
          </li>
        </ul>
      </div>
    </div>
  );
}
