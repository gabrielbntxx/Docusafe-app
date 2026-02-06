"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  Lock,
  AlertCircle,
  Loader2,
  Music,
  Video,
  Shield,
  Clock,
  X,
  Archive,
} from "lucide-react";

type DocumentType = {
  id: string;
  displayName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
};

type FolderType = {
  id: string;
  name: string;
  color: string;
  documents: DocumentType[];
};

type ShareData = {
  name: string | null;
  expiresAt: string;
  folders: FolderType[];
  documents: DocumentType[];
};

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentType | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Check share info on mount
  useEffect(() => {
    checkShare();
  }, [token]);

  const checkShare = async () => {
    // Try to access content directly via POST (no password)
    // If password is required, API will return 401 with requiresPassword flag
    await fetchShareContent();
  };

  const fetchShareContent = async (pwd?: string) => {
    setIsLoading(true);
    setPasswordError(false);

    try {
      const response = await fetch(`/api/shared/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.requiresPassword) {
          // Password is required - show password form
          if (pwd) {
            // User already entered a password but it was wrong
            setPasswordError(true);
          }
          setRequiresPassword(true);
          setIsLoading(false);
          return;
        }
        setError(data.error || "Erreur d'accès");
        setIsLoading(false);
        return;
      }

      setShareData(data.share);
      setRequiresPassword(false);
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch share error:", err);
      setError("Erreur de connexion");
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShareContent(password);
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

  const handleDownload = (docId: string, displayName: string) => {
    const link = document.createElement("a");
    link.href = `/api/shared/${token}/download/${docId}`;
    link.download = displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = async (doc: DocumentType) => {
    setPreviewDoc(doc);
    setIsPreviewLoading(true);

    try {
      const response = await fetch(`/api/shared/${token}/view/${doc.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewDoc(null);
    setPreviewUrl(null);
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const response = await fetch(`/api/shared/${token}/download-all`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = shareData?.name
          ? `${shareData.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.zip`
          : "documents.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download all error:", err);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Calculate total document count
  const totalDocuments = (shareData?.folders?.reduce((sum, f) => sum + f.documents.length, 0) || 0)
    + (shareData?.documents?.length || 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-neutral-600 dark:text-neutral-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-neutral-900 shadow-xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            {error === "Ce lien de partage a expiré" ? "Lien expiré" : "Erreur"}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Password required state
  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-neutral-900 shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
              <Lock className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              Contenu protégé
            </h1>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Ce partage est protégé par un mot de passe
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
                className={`w-full rounded-xl border-2 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition-colors ${
                  passwordError
                    ? "border-red-500 focus:border-red-500"
                    : "border-transparent focus:border-blue-500"
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-500">Mot de passe incorrect</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl"
            >
              Accéder au contenu
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-neutral-900 dark:text-white">
                {shareData?.name || "Fichiers partagés"}
              </h1>
              {shareData?.expiresAt && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expire le {new Date(shareData.expiresAt).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          </div>
          {totalDocuments > 1 && (
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isDownloadingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Téléchargement...</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  <span className="hidden sm:inline">Tout télécharger</span>
                  <span className="sm:hidden">ZIP</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Folders */}
        {shareData?.folders && shareData.folders.length > 0 && (
          <div className="space-y-4 mb-8">
            {shareData.folders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-2xl bg-white dark:bg-neutral-900 shadow-lg overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-4 border-b border-neutral-100 dark:border-neutral-800"
                  style={{ backgroundColor: folder.color + "10" }}
                >
                  <Folder className="h-5 w-5" style={{ color: folder.color }} />
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {folder.name}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    ({folder.documents.length} fichier{folder.documents.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {folder.documents.map((doc) => {
                    const Icon = getFileIcon(doc.fileType);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white truncate">
                            {doc.displayName}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatFileSize(doc.sizeBytes)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(doc)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.id, doc.displayName)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Individual Documents */}
        {shareData?.documents && shareData.documents.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-white">
                Documents
              </span>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {shareData.documents.map((doc) => {
                const Icon = getFileIcon(doc.fileType);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {doc.displayName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatFileSize(doc.sizeBytes)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc.id, doc.displayName)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!shareData?.folders || shareData.folders.length === 0) &&
          (!shareData?.documents || shareData.documents.length === 0) && (
            <div className="rounded-2xl bg-white dark:bg-neutral-900 shadow-lg p-12 text-center">
              <File className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" />
              <p className="mt-4 text-neutral-500 dark:text-neutral-400">
                Aucun fichier dans ce partage
              </p>
            </div>
          )}
      </main>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 p-4 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                  {previewDoc.displayName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewDoc.id, previewDoc.displayName)}
                  className="flex h-8 items-center gap-2 rounded-lg bg-blue-100 px-3 text-sm font-medium text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
                <button
                  onClick={closePreview}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-950">
              {isPreviewLoading ? (
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : previewUrl ? (
                previewDoc.fileType === "pdf" ? (
                  <iframe
                    src={previewUrl}
                    className="h-full w-full min-h-[70vh]"
                    title={previewDoc.displayName}
                  />
                ) : previewDoc.fileType === "image" ? (
                  <div className="flex items-center justify-center h-full min-h-[50vh] p-8">
                    <img
                      src={previewUrl}
                      alt={previewDoc.displayName}
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
                  </div>
                ) : previewDoc.fileType === "audio" ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                      <Music className="h-12 w-12 text-white" />
                    </div>
                    <audio src={previewUrl} controls className="w-full max-w-md" />
                  </div>
                ) : previewDoc.fileType === "video" ? (
                  <div className="flex items-center justify-center h-full min-h-[50vh] p-8">
                    <video src={previewUrl} controls className="max-h-full max-w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8">
                    <File className="h-16 w-16 text-neutral-400" />
                    <p className="mt-4 text-neutral-500">Aperçu non disponible</p>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
