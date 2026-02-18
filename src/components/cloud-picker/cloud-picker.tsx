"use client";

import { useState, useCallback } from "react";
import { X, Loader2, FileText, File, Image as ImageIcon, Music, Video, Check } from "lucide-react";

// SVG Icons for cloud providers
const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" className="h-6 w-6">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

const OneDriveIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6">
    <path fill="#0364B8" d="M14.5 15h6.37a3.13 3.13 0 0 0 0-6.26 3.07 3.07 0 0 0-.67.08 5 5 0 0 0-9.37-1.57 3.75 3.75 0 0 0 .67 7.45V15h3z"/>
    <path fill="#0078D4" d="M9.17 9.25a5 5 0 0 1 4.63-3.12 5 5 0 0 1 4.37 2.62 3.07 3.07 0 0 1 .67-.08A3.12 3.12 0 0 1 22 11.79a3.07 3.07 0 0 1-.08.67H9.17a3.73 3.73 0 0 0 0-.46 3.75 3.75 0 0 0 0-2.75z"/>
    <path fill="#1490DF" d="M9.17 9.25a3.75 3.75 0 0 0-.67 7.45V15H5.12a4.12 4.12 0 0 1 0-8.24 4.07 4.07 0 0 1 1.63.34 5.63 5.63 0 0 1 2.42 2.15z"/>
    <path fill="#28A8EA" d="M14.5 15v1.7H5.12a4.12 4.12 0 0 1-1.64-7.9 5.63 5.63 0 0 1 5.69-2.55A5.63 5.63 0 0 1 14.5 15z"/>
  </svg>
);

type CloudFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  downloadUrl?: string;
  provider: "google" | "onedrive";
  accessToken?: string;
};

type CloudPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
};

declare global {
  interface Window {
    gapi: any;
    google: any;
    OneDrive: any;
  }
}

export function CloudPicker({ isOpen, onClose, onFilesSelected }: CloudPickerProps) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingOneDrive, setIsLoadingOneDrive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<CloudFile[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  // Google Drive configuration
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

  // OneDrive configuration
  const ONEDRIVE_CLIENT_ID = process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID;

  // Load Google API script
  const loadGoogleScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.gapi && window.google) {
        resolve();
        return;
      }

      // Load GAPI
      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.onload = () => {
        // Load Google Identity Services
        const gisScript = document.createElement("script");
        gisScript.src = "https://accounts.google.com/gsi/client";
        gisScript.onload = () => resolve();
        gisScript.onerror = () => reject(new Error("Failed to load Google Identity Services"));
        document.body.appendChild(gisScript);
      };
      gapiScript.onerror = () => reject(new Error("Failed to load Google API"));
      document.body.appendChild(gapiScript);
    });
  }, []);

  // Load OneDrive script
  const loadOneDriveScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.OneDrive) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.live.net/v7.2/OneDrive.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load OneDrive SDK"));
      document.body.appendChild(script);
    });
  }, []);

  // Open Google Drive Picker
  const openGoogleDrivePicker = async () => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      console.error("Missing Google config:", {
        clientId: !!GOOGLE_CLIENT_ID,
        apiKey: !!GOOGLE_API_KEY,
        appId: !!GOOGLE_APP_ID
      });
      setError("Google Drive n'est pas configuré. Ajoutez NEXT_PUBLIC_GOOGLE_CLIENT_ID et NEXT_PUBLIC_GOOGLE_API_KEY.");
      return;
    }

    setIsLoadingGoogle(true);
    setError(null);

    try {
      console.log("[Google Drive] Loading scripts...");
      await loadGoogleScript();
      console.log("[Google Drive] Scripts loaded successfully");

      // Initialize GAPI
      await new Promise<void>((resolve, reject) => {
        if (!window.gapi) {
          reject(new Error("GAPI not loaded"));
          return;
        }
        window.gapi.load("picker", { callback: resolve, onerror: reject });
      });
      console.log("[Google Drive] Picker API loaded");

      // Check if Google Identity Services is available
      if (!window.google?.accounts?.oauth2) {
        throw new Error("Google Identity Services not loaded");
      }

      // Get OAuth token
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response: any) => {
          console.log("[Google Drive] Token response:", response.error || "success");
          if (response.error) {
            setError(`Erreur d'authentification: ${response.error}`);
            setIsLoadingGoogle(false);
            return;
          }
          if (response.access_token) {
            showGooglePicker(response.access_token);
          }
        },
        error_callback: (error: any) => {
          console.error("[Google Drive] Token error:", error);
          setError("Erreur lors de l'authentification Google");
          setIsLoadingGoogle(false);
        },
      });

      console.log("[Google Drive] Requesting access token...");
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (err: any) {
      console.error("[Google Drive] Error:", err);
      setError(`Impossible de se connecter à Google Drive: ${err.message || "erreur inconnue"}`);
      setIsLoadingGoogle(false);
    }
  };

  const showGooglePicker = (accessToken: string) => {
    try {
      const view = new window.google.picker.DocsView()
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false);

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setAppId(GOOGLE_APP_ID)
        .setCallback((data: any) => {
          handleGooglePickerCallback(data, accessToken);
          // Close loading when picker is dismissed
          if (data.action === window.google.picker.Action.CANCEL ||
              data.action === window.google.picker.Action.PICKED) {
            setIsLoadingGoogle(false);
          }
        })
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .build();

      picker.setVisible(true);
      console.log("[Google Drive] Picker opened");
    } catch (err: any) {
      console.error("[Google Drive] Picker error:", err);
      setError(`Erreur lors de l'ouverture du sélecteur: ${err.message}`);
      setIsLoadingGoogle(false);
    }
  };

  const handleGooglePickerCallback = async (data: any, accessToken: string) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const files: CloudFile[] = data.docs.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        size: doc.sizeBytes || 0,
        downloadUrl: `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
        provider: "google" as const,
        accessToken,
      }));
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  // Open OneDrive Picker
  const openOneDrivePicker = async () => {
    if (!ONEDRIVE_CLIENT_ID) {
      setError("OneDrive n'est pas configuré. Veuillez contacter l'administrateur.");
      return;
    }

    setIsLoadingOneDrive(true);
    setError(null);

    try {
      await loadOneDriveScript();

      window.OneDrive.open({
        clientId: ONEDRIVE_CLIENT_ID,
        action: "download",
        multiSelect: true,
        advanced: {
          redirectUri: window.location.origin + "/api/onedrive/callback",
        },
        success: (files: any) => {
          const cloudFiles: CloudFile[] = files.value.map((file: any) => ({
            id: file.id,
            name: file.name,
            mimeType: file.file?.mimeType || "application/octet-stream",
            size: file.size || 0,
            downloadUrl: file["@microsoft.graph.downloadUrl"],
            provider: "onedrive" as const,
          }));
          setSelectedFiles(prev => [...prev, ...cloudFiles]);
        },
        cancel: () => {
          console.log("OneDrive picker cancelled");
        },
        error: (err: any) => {
          console.error("OneDrive error:", err);
          setError("Erreur lors de la sélection des fichiers OneDrive");
        },
      });
    } catch (err) {
      console.error("OneDrive error:", err);
      setError("Impossible de se connecter à OneDrive");
    } finally {
      setIsLoadingOneDrive(false);
    }
  };

  // Download selected files
  const downloadAndImport = async () => {
    if (selectedFiles.length === 0) return;

    setIsDownloading(true);
    setError(null);

    const downloadedFiles: File[] = [];

    for (const cloudFile of selectedFiles) {
      try {
        setDownloadProgress(prev => ({ ...prev, [cloudFile.id]: 10 }));

        // Download via our API to avoid CORS
        const response = await fetch("/api/cloud/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: cloudFile.downloadUrl,
            filename: cloudFile.name,
            provider: cloudFile.provider,
            accessToken: cloudFile.accessToken,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to download ${cloudFile.name}`);
        }

        setDownloadProgress(prev => ({ ...prev, [cloudFile.id]: 50 }));

        const blob = await response.blob();
        const file = new globalThis.File([blob], cloudFile.name, { type: cloudFile.mimeType });
        downloadedFiles.push(file);

        setDownloadProgress(prev => ({ ...prev, [cloudFile.id]: 100 }));
      } catch (err) {
        console.error(`Error downloading ${cloudFile.name}:`, err);
        setError(`Erreur lors du téléchargement de ${cloudFile.name}`);
      }
    }

    setIsDownloading(false);

    if (downloadedFiles.length > 0) {
      onFilesSelected(downloadedFiles);
      setSelectedFiles([]);
      onClose();
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return ImageIcon;
    if (mimeType === "application/pdf") return FileText;
    if (mimeType.startsWith("audio/")) return Music;
    if (mimeType.startsWith("video/")) return Video;
    return File;
  };

  if (!isOpen) return null;

  const isConfigured = (GOOGLE_CLIENT_ID && GOOGLE_API_KEY) || ONEDRIVE_CLIENT_ID;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Importer depuis le cloud
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!isConfigured && (
          <div className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
            <p className="font-medium">Configuration requise</p>
            <p className="mt-1 text-xs">
              Les intégrations Google Drive et OneDrive nécessitent une configuration.
              Ajoutez les variables d&apos;environnement NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              NEXT_PUBLIC_GOOGLE_API_KEY, et NEXT_PUBLIC_ONEDRIVE_CLIENT_ID.
            </p>
          </div>
        )}

        {/* Cloud Provider Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={openGoogleDrivePicker}
            disabled={isLoadingGoogle || isDownloading || !GOOGLE_CLIENT_ID}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-5 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingGoogle ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            ) : (
              <GoogleDriveIcon />
            )}
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Google Drive
            </span>
          </button>

          <button
            onClick={openOneDrivePicker}
            disabled={isLoadingOneDrive || isDownloading || !ONEDRIVE_CLIENT_ID}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-5 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingOneDrive ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            ) : (
              <OneDriveIcon />
            )}
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              OneDrive
            </span>
          </button>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Fichiers sélectionnés ({selectedFiles.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {selectedFiles.map((file) => {
                const Icon = getFileIcon(file.mimeType);
                const progress = downloadProgress[file.id] || 0;
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-500/20 dark:to-violet-500/20">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                          {file.provider === "google" ? "Google Drive" : "OneDrive"}
                        </span>
                      </div>
                      {isDownloading && progress > 0 && (
                        <div className="mt-1 h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <div
                            className="h-1 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {progress === 100 ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : !isDownloading && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Import Button */}
            <button
              onClick={downloadAndImport}
              disabled={isDownloading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isDownloading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Téléchargement en cours...
                </span>
              ) : (
                `Importer ${selectedFiles.length} fichier${selectedFiles.length > 1 ? "s" : ""}`
              )}
            </button>
          </div>
        )}

        {/* Instructions */}
        {selectedFiles.length === 0 && (
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Sélectionnez un service cloud pour parcourir vos fichiers
          </p>
        )}
      </div>
    </div>
  );
}
