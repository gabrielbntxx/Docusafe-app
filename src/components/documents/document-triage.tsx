"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Check,
  CheckCheck,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  File,
  Music,
  Video,
  Loader2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type Document = {
  id: string;
  originalName: string;
  displayName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string | null;
  aiAnalyzed?: number;
  aiCategory?: string | null;
  uploadedAt: string;
  folder: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  addedBy?: { name: string; color: string } | null;
};

type DocumentTriageProps = {
  documents: Document[];
  onExit: () => void;
  onDeleteComplete: (docId: string) => void;
};

const SWIPE_THRESHOLD = 80;

// Detect if a file is a text/code file by its mimeType
function isCodeOrText(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/javascript" ||
    mimeType === "application/xml" ||
    mimeType === "application/x-httpd-php" ||
    mimeType === "application/typescript" ||
    mimeType === "application/x-sh" ||
    mimeType === "application/x-yaml"
  );
}

// Get a display label for the language from mimeType
function getLanguageLabel(mimeType: string): string {
  const map: Record<string, string> = {
    "application/json": "JSON",
    "application/javascript": "JavaScript",
    "application/typescript": "TypeScript",
    "application/xml": "XML",
    "application/x-httpd-php": "PHP",
    "application/x-sh": "Shell",
    "application/x-yaml": "YAML",
    "text/html": "HTML",
    "text/css": "CSS",
    "text/javascript": "JavaScript",
    "text/x-python": "Python",
    "text/x-c": "C",
    "text/x-c++": "C++",
    "text/x-java": "Java",
    "text/x-rust": "Rust",
    "text/x-go": "Go",
    "text/markdown": "Markdown",
    "text/csv": "CSV",
    "text/plain": "Texte",
  };
  return map[mimeType] || "Code";
}

// Inline preview component that fetches and displays file content
function FilePreview({ document }: { document: Document }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isText = isCodeOrText(document.mimeType);

  useEffect(() => {
    let currentBlobUrl: string | null = null;
    setIsLoading(true);
    setHasError(false);
    setBlobUrl(null);
    setTextContent(null);

    fetch(`/api/documents/${document.id}/view`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch");
        if (isText) {
          return response.text().then((text) => {
            setTextContent(text);
            setIsLoading(false);
          });
        }
        return response.blob().then((blob) => {
          currentBlobUrl = URL.createObjectURL(blob);
          setBlobUrl(currentBlobUrl);
          setIsLoading(false);
        });
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    };
  }, [document.id, isText]);

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return FileText;
    if (fileType === "image") return ImageIcon;
    if (fileType === "audio") return Music;
    if (fileType === "video") return Video;
    return File;
  };

  const Icon = getFileIcon(document.fileType);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-500/50 animate-spin" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-full items-center justify-center">
        <Icon className="h-20 w-20 text-blue-500/40 dark:text-blue-400/40" />
      </div>
    );
  }

  // Code / text preview
  if (isText && textContent !== null) {
    const lang = getLanguageLabel(document.mimeType);
    const lines = textContent.split("\n");
    const preview = lines.slice(0, 40).join("\n");
    return (
      <div className="relative h-full w-full overflow-hidden bg-neutral-950">
        {/* Language badge */}
        <span className="absolute right-2 top-2 z-10 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] font-medium text-neutral-300">
          {lang}
        </span>
        {/* Line numbers + code */}
        <div className="flex h-full overflow-hidden">
          {/* Gutter */}
          <div className="select-none border-r border-white/5 bg-white/5 px-2 pt-3 text-right font-mono text-[10px] leading-[1.6] text-neutral-600">
            {lines.slice(0, 40).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Code */}
          <pre className="flex-1 overflow-auto px-3 pt-3 pb-3 font-mono text-[11px] leading-[1.6] text-neutral-200 whitespace-pre">
            {preview}
            {lines.length > 40 && (
              <span className="text-neutral-500">{"\n"}…{lines.length - 40} ligne(s) supplémentaire(s)</span>
            )}
          </pre>
        </div>
      </div>
    );
  }

  if (document.fileType === "image" && blobUrl) {
    return (
      <img
        src={blobUrl}
        alt={document.displayName}
        className="h-full w-full object-contain rounded-2xl"
      />
    );
  }

  if (document.fileType === "pdf" && blobUrl) {
    return (
      <iframe
        src={blobUrl}
        title={document.displayName}
        className="h-full w-full rounded-2xl"
      />
    );
  }

  if (document.fileType === "video" && blobUrl) {
    return (
      <video
        src={blobUrl}
        className="h-full w-full object-contain rounded-2xl"
        muted
      />
    );
  }

  // Fallback: show icon
  return (
    <div className="flex h-full items-center justify-center">
      <Icon className="h-20 w-20 text-blue-500 dark:text-blue-400" />
    </div>
  );
}

export function DocumentTriage({
  documents,
  onExit,
  onDeleteComplete,
}: DocumentTriageProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [exitAnimation, setExitAnimation] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  // History tracking for undo
  const [history, setHistory] = useState<Array<{ action: "keep" | "delete" }>>([]);
  const [deletedInSession, setDeletedInSession] = useState<Set<string>>(new Set());

  const currentDoc = currentIndex < documents.length ? documents[currentIndex] : null;
  const nextDoc = currentIndex + 1 < documents.length ? documents[currentIndex + 1] : null;
  const isCurrentDeleted = currentDoc ? deletedInSession.has(currentDoc.id) : false;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "Ko", "Mo", "Go"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  };

  const advanceCard = useCallback((direction: "left" | "right") => {
    setExitAnimation(direction);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitAnimation(null);
      setSwipeOffset(0);
    }, 300);
  }, []);

  const handleKeep = useCallback(() => {
    if (exitAnimation || isDeleting) return;
    setHistory((prev) => [...prev, { action: "keep" }]);
    advanceCard("right");
  }, [exitAnimation, isDeleting, advanceCard]);

  const handleDelete = useCallback(async () => {
    if (exitAnimation || isDeleting || !currentDoc) return;
    // If already deleted (went back to it), just skip forward
    if (deletedInSession.has(currentDoc.id)) {
      setHistory((prev) => [...prev, { action: "keep" }]);
      advanceCard("right");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${currentDoc.id}/delete`, {
        method: "DELETE",
      });
      if (response.ok) {
        const deletedId = currentDoc.id;
        setDeletedInSession((prev) => new Set([...prev, deletedId]));
        setHistory((prev) => [...prev, { action: "delete" }]);
        advanceCard("left");
        setTimeout(() => {
          onDeleteComplete(deletedId);
          setIsDeleting(false);
        }, 350);
      } else {
        setIsDeleting(false);
      }
    } catch {
      setIsDeleting(false);
    }
  }, [exitAnimation, isDeleting, currentDoc, deletedInSession, advanceCard, onDeleteComplete]);

  // Go back one step
  const handleBack = useCallback(() => {
    if (history.length === 0 || exitAnimation || isDeleting) return;
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setSwipeOffset(0);
  }, [history.length, exitAnimation, isDeleting]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (exitAnimation || isDeleting) return;
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (swipeOffset > SWIPE_THRESHOLD) {
      handleKeep();
    } else if (swipeOffset < -SWIPE_THRESHOLD) {
      handleDelete();
    } else {
      setSwipeOffset(0);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleKeep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "Escape") {
        onExit();
      } else if ((e.key === "z" && (e.metaKey || e.ctrlKey)) || e.key === "Backspace") {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeep, handleDelete, onExit, handleBack]);

  // Completion screen
  if (!currentDoc) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
            <CheckCheck className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t("triageComplete")}
          </h2>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t("triageCompleteDesc")}
          </p>
          <div className="mt-8 flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-600 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <RotateCcw className="h-4 w-4" />
                Revenir
              </button>
            )}
            <button
              onClick={onExit}
              className="rounded-xl bg-blue-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
            >
              {t("back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Card transform
  const getCardTransform = () => {
    if (exitAnimation === "left") return "translateX(-150vw) rotate(-15deg)";
    if (exitAnimation === "right") return "translateX(150vw) rotate(15deg)";
    return `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)`;
  };

  const getCardTransition = () => {
    if (exitAnimation) return "transform 0.3s ease-out";
    if (swipeOffset === 0) return "transform 0.2s ease-out";
    return "none";
  };

  // Overlay opacities
  const keepOpacity = swipeOffset > 30 ? Math.min(1, (swipeOffset - 30) / 50) : 0;
  const deleteOpacity = swipeOffset < -30 ? Math.min(1, (-swipeOffset - 30) / 50) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("triageExit")}
        </button>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t("triageMode")}
        </h2>
        {/* Back button (top-right) */}
        <button
          onClick={handleBack}
          disabled={history.length === 0 || !!exitAnimation || isDeleting}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Annuler
        </button>
      </div>

      {/* Progress */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-lg shadow-black/5 dark:bg-neutral-800 dark:shadow-none">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {currentIndex + 1}
          </span>
          <span className="text-neutral-400">/</span>
          <span className="text-neutral-600 dark:text-neutral-300">
            {documents.length}
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">
            {t("triageProgress")}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(currentIndex / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Swipe hint (mobile only) */}
      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 sm:hidden">
        {t("triageSwipeHint")}
      </p>

      {/* Card stack */}
      <div className="relative flex justify-center px-4" style={{ minHeight: "420px" }}>
        {/* Next card (behind) */}
        {nextDoc && (
          <div
            className="absolute w-full max-w-sm select-none"
            style={{
              transform: "scale(0.95) translateY(12px)",
              opacity: 0.6,
              zIndex: 0,
            }}
          >
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-neutral-800">
              <div className="h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10">
                <FilePreview key={nextDoc.id} document={nextDoc} />
              </div>
              <div className="p-5">
                <h3 className="truncate text-lg font-semibold text-neutral-900 dark:text-white">
                  {nextDoc.displayName}
                </h3>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>{formatFileSize(nextDoc.sizeBytes)}</span>
                  <span className="text-neutral-300 dark:text-neutral-600">•</span>
                  <span>{formatDate(nextDoc.uploadedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current card (front) */}
        <div
          style={{
            transform: getCardTransform(),
            transition: getCardTransition(),
            touchAction: "pan-y",
            zIndex: 1,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-sm select-none"
        >
          {/* Keep overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl border-4 border-green-500 bg-green-500/10"
            style={{ opacity: keepOpacity }}
          >
            <span className="text-4xl font-black text-green-500 -rotate-12 drop-shadow-lg">
              {t("triageKeep")}
            </span>
          </div>

          {/* Delete overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl border-4 border-red-500 bg-red-500/10"
            style={{ opacity: deleteOpacity }}
          >
            <span className="text-4xl font-black text-red-500 rotate-12 drop-shadow-lg">
              {t("triageDelete")}
            </span>
          </div>

          {/* "Already deleted" badge when going back */}
          {isCurrentDeleted && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-4 rounded-3xl">
              <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                <Trash2 className="h-3 w-3" />
                Déjà supprimé
              </span>
            </div>
          )}

          {/* Card content */}
          <div className={`overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/10 dark:bg-neutral-800 dark:shadow-black/30 ${isCurrentDeleted ? "opacity-60 ring-2 ring-red-400" : ""}`}>
            {/* Preview area */}
            <div className="h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10">
              <FilePreview key={currentDoc.id} document={currentDoc} />
            </div>

            {/* Document info */}
            <div className="p-5">
              <h3 className="truncate text-xl font-semibold text-neutral-900 dark:text-white">
                {currentDoc.displayName}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <span>{formatFileSize(currentDoc.sizeBytes)}</span>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <span>{formatDate(currentDoc.uploadedAt)}</span>
              </div>
              {currentDoc.folder && (
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: currentDoc.folder.color || "#6366f1" }}
                  />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {currentDoc.folder.name}
                  </span>
                </div>
              )}
              {currentDoc.aiCategory && (
                <div className="mt-2 inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  {currentDoc.aiCategory}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 pb-4">
        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting || !!exitAnimation || isCurrentDeleted}
          title={isCurrentDeleted ? "Déjà supprimé" : t("triageDelete")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-lg transition-all hover:bg-red-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
        >
          {isDeleting ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <X className="h-8 w-8" />
          )}
        </button>

        {/* Undo button (center, smaller) */}
        <button
          onClick={handleBack}
          disabled={history.length === 0 || !!exitAnimation || isDeleting}
          title="Annuler (⌘Z)"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 shadow transition-all hover:bg-neutral-200 hover:text-neutral-600 hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-20 dark:bg-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-600 dark:hover:text-neutral-300"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Keep button */}
        <button
          onClick={handleKeep}
          disabled={isDeleting || !!exitAnimation}
          title={t("triageKeep")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500 shadow-lg transition-all hover:bg-green-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
        >
          <Check className="h-8 w-8" />
        </button>
      </div>

      {/* Keyboard hint (desktop only) */}
      <p className="hidden text-center text-xs text-neutral-400 dark:text-neutral-500 sm:block">
        ← {t("triageDelete")} &nbsp;|&nbsp; ⌘Z Annuler &nbsp;|&nbsp; {t("triageKeep")} →
      </p>
    </div>
  );
}
