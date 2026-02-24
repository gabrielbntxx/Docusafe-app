"use client";

import { useState, useCallback } from "react";
import { Download, Image as ImageIcon, Trash2, Eye, Search } from "lucide-react";
import { DocumentPreviewModal } from "./document-preview-modal";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";

type Photo = {
  id: string;
  displayName: string;
  originalName: string;
  mimeType: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt: string;
  aiAnalyzed?: number;
  aiCategory?: string | null;
  aiDocumentType?: string | null;
  aiConfidence?: number | null;
  aiExtractedData?: string | null;
  expiryDate?: string | null;
  folder: { id: string; name: string; color: string | null; icon: string | null } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type Props = { photos: Photo[] };

export function PhotosClient({ photos }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = photos.filter((p) =>
    p.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  }, []);

  const handleDownload = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/documents/${photo.id}/download`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.displayName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleDelete = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer "${photo.displayName}" ?`)) return;
    setDeletingId(photo.id);
    try {
      const res = await fetch(`/api/documents/${photo.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24 lg:pb-8">
        {/* Header */}
        <div className="sticky top-14 lg:top-0 z-10 border-b border-black/5 dark:border-white/5 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-lg shadow-pink-500/20">
                <ImageIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                  {t("myPhotos")}
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {filtered.length} {t("photosCount")}
                </p>
              </div>
            </div>

            {/* Search */}
            {photos.length > 0 && (
              <div className="relative max-w-xs w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-blue-300 dark:focus:border-blue-700 focus:outline-none text-neutral-900 dark:text-white placeholder-neutral-400 transition"
                />
              </div>
            )}
          </div>

          {/* Mobile search */}
          {photos.length > 0 && (
            <div className="px-4 pb-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-blue-300 dark:focus:border-blue-700 focus:outline-none text-neutral-900 dark:text-white placeholder-neutral-400 transition"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Empty state */}
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-violet-100 dark:from-pink-900/20 dark:to-violet-900/20">
                <ImageIcon className="h-12 w-12 text-pink-400 dark:text-pink-500" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {t("noPhotosFound")}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                {t("noPhotosFoundDesc")}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Aucune photo ne correspond à « {search} »
              </p>
            </div>
          ) : (
            /* Photo grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
              {filtered.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  deleting={deletingId === photo.id}
                  onOpen={openModal}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DocumentPreviewModal
        document={selectedPhoto}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}

/* ─── Individual photo card ─────────────────────────────────────────────── */

type CardProps = {
  photo: Photo;
  deleting: boolean;
  onOpen: (p: Photo) => void;
  onDownload: (p: Photo, e: React.MouseEvent) => void;
  onDelete: (p: Photo, e: React.MouseEvent) => void;
};

function PhotoCard({ photo, deleting, onOpen, onDownload, onDelete }: CardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      onClick={() => onOpen(photo)}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
    >
      {/* Thumbnail */}
      {!imgError ? (
        <>
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-neutral-300 dark:text-neutral-600 animate-pulse" />
            </div>
          )}
          <img
            src={`/api/documents/${photo.id}/view`}
            alt={photo.displayName}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
        {/* Top: action buttons */}
        <div className="flex justify-end gap-1.5">
          <button
            onClick={(e) => onDownload(photo, e)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
            title="Télécharger"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => onDelete(photo, e)}
            disabled={deleting}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-red-500/80 transition"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom: name + meta */}
        <div>
          <p className="text-white text-xs font-medium truncate leading-tight mb-0.5">
            {photo.displayName}
          </p>
          <div className="flex items-center gap-1.5 text-white/70 text-[10px]">
            <span>{formatSize(photo.sizeBytes)}</span>
            <span>·</span>
            <span>{formatDate(photo.uploadedAt)}</span>
          </div>
          {photo.folder && (
            <p className="text-white/60 text-[10px] truncate mt-0.5">
              📁 {photo.folder.name}
            </p>
          )}
          {photo.aiCategory && (
            <span className="inline-block mt-1 rounded-full bg-white/20 backdrop-blur-sm px-1.5 py-0.5 text-[9px] text-white font-medium">
              {photo.aiCategory}
            </span>
          )}
        </div>
      </div>

      {/* View icon hint (center, only on hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
          <Eye className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Loading overlay when deleting */}
      {deleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
