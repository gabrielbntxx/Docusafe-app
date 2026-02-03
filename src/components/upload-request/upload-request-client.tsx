"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Check,
  X,
  Lock,
  Clock,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  Shield,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type UploadRequestClientProps = {
  token: string;
  title: string;
  description: string | null;
  recipientName: string | null;
  maxFiles: number;
  filesUploaded: number;
  expiresAt: string;
  hasPassword: boolean;
  isExpired: boolean;
  status: string;
};

type FileWithProgress = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

export function UploadRequestClient({
  token,
  title,
  description,
  recipientName,
  maxFiles,
  filesUploaded,
  expiresAt,
  hasPassword,
  isExpired,
  status,
}: UploadRequestClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(!hasPassword);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploaderName, setUploaderName] = useState("");
  const [uploaderEmail, setUploaderEmail] = useState("");
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const remainingSlots = maxFiles - filesUploaded;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingPassword(true);
    setPasswordError("");

    try {
      const response = await fetch(`/api/upload/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setPasswordError("Mot de passe incorrect");
      }
    } catch (error) {
      setPasswordError("Erreur de vérification");
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles = droppedFiles.slice(0, remainingSlots - files.length);

      setFiles((prev) => [
        ...prev,
        ...newFiles.map((file) => ({
          file,
          progress: 0,
          status: "pending" as const,
        })),
      ]);
    },
    [files.length, remainingSlots]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.slice(0, remainingSlots - files.length);

    setFiles((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      })),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading" as const } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", files[i].file);
        formData.append("uploaderName", uploaderName);
        formData.append("uploaderEmail", uploaderEmail);
        formData.append("note", note);
        if (hasPassword) {
          formData.append("password", password);
        }

        const response = await fetch(`/api/upload/${token}`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "done" as const, progress: 100 } : f
            )
          );
        } else {
          const data = await response.json();
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "error" as const, error: data.error || "Erreur" }
                : f
            )
          );
        }
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error" as const, error: "Erreur réseau" }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    // Check if all files uploaded successfully
    const allDone = files.every((f) => f.status === "done" || f.status === "error");
    const anySuccess = files.some((f) => f.status === "done");
    if (allDone && anySuccess) {
      setIsComplete(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Expired state
  if (isExpired || status === "expired") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-200 dark:bg-neutral-800">
            <Clock className="h-8 w-8 text-neutral-500" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">
            Lien expiré
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Ce lien de demande de documents a expiré le {formatDate(expiresAt)}.
          </p>
        </div>
      </div>
    );
  }

  // Password protection
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl dark:bg-neutral-900">
            <div className="text-center mb-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/20">
                <Lock className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              </div>
              <h1 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">
                Accès protégé
              </h1>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Entrez le mot de passe pour accéder à cette demande
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-neutral-900 placeholder-neutral-400 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                {passwordError && (
                  <p className="mt-2 text-center text-sm text-red-500">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!password || isCheckingPassword}
                className="w-full rounded-xl bg-violet-500 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-600 disabled:opacity-50"
              >
                {isCheckingPassword ? "Vérification..." : "Accéder"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isComplete) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">
            Documents envoyés !
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Vos fichiers ont été envoyés avec succès. Vous pouvez fermer cette page.
          </p>
        </div>
      </div>
    );
  }

  // Main upload interface
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <Upload className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            {title}
          </h1>
          {recipientName && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Demandé par {recipientName}
            </p>
          )}
        </div>

        {/* Info Card */}
        <div className="rounded-2xl bg-white p-5 shadow-xl shadow-black/5 dark:bg-neutral-900 mb-6">
          {description && (
            <div className="mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Instructions
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {remainingSlots} fichier{remainingSlots > 1 ? "s" : ""} restant{remainingSlots > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Expire le {formatDate(expiresAt)}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              Transfert sécurisé
            </span>
          </div>
        </div>

        {/* Upload Area */}
        <div className="rounded-2xl bg-white p-5 shadow-xl shadow-black/5 dark:bg-neutral-900 mb-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                : "border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-500/50"
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
            />
            <div className="flex flex-col items-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isDragging ? "bg-blue-100 dark:bg-blue-500/20" : "bg-neutral-100 dark:bg-neutral-800"
              }`}>
                <Upload className={`h-6 w-6 ${
                  isDragging ? "text-blue-600 dark:text-blue-400" : "text-neutral-500"
                }`} />
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Glissez vos fichiers ici
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                ou cliquez pour sélectionner
              </p>
            </div>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((fileData, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(fileData.file.size)}
                    </p>
                  </div>
                  {fileData.status === "pending" && (
                    <button
                      onClick={() => removeFile(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {fileData.status === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  {fileData.status === "done" && (
                    <Check className="h-5 w-5 text-emerald-500" />
                  )}
                  {fileData.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Info */}
        <div className="rounded-2xl bg-white p-5 shadow-xl shadow-black/5 dark:bg-neutral-900 mb-6">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
            Informations (optionnel)
          </h3>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={uploaderEmail}
                  onChange={(e) => setUploaderEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note..."
                rows={2}
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Upload className="h-4 w-4" />
              Envoyer {files.length > 0 ? `(${files.length} fichier${files.length > 1 ? "s" : ""})` : ""}
            </span>
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          Propulsé par <span className="font-semibold">Justif&apos;</span> - Vos documents en sécurité
        </p>
      </div>
    </div>
  );
}
