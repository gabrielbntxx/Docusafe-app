"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RotateCcw, AlertTriangle, FileText, Image as ImageIcon, File, Music, Video, Loader2 } from "lucide-react";

type TrashedDoc = {
  id: string;
  displayName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  deletedAt: string;
  daysLeft: number;
  folder: { id: string; name: string; color: string | null } | null;
};

function FileIcon({ fileType }: { fileType: string }) {
  const Icon =
    fileType === "pdf" ? FileText :
    fileType === "image" ? ImageIcon :
    fileType === "audio" ? Music :
    fileType === "video" ? Video :
    File;
  return <Icon className="h-4 w-4" />;
}

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} Go`;
  if (mb >= 1) return `${mb.toFixed(1)} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}

export function TrashSection() {
  const [docs, setDocs] = useState<TrashedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);
  const [purgingAll, setPurgingAll] = useState(false);
  const [confirmPurgeAll, setConfirmPurgeAll] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/documents/trash");
      if (res.ok) {
        const data = await res.json();
        setDocs(data.documents);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const res = await fetch(`/api/documents/${id}/restore`, { method: "POST" });
      if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setRestoringId(null);
    }
  };

  const handlePurge = async (id: string) => {
    setPurgingId(id);
    try {
      const res = await fetch(`/api/documents/${id}/purge`, { method: "DELETE" });
      if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setPurgingId(null);
    }
  };

  const handlePurgeAll = async () => {
    setPurgingAll(true);
    try {
      const res = await fetch("/api/documents/trash", { method: "DELETE" });
      if (res.ok) setDocs([]);
    } finally {
      setPurgingAll(false);
      setConfirmPurgeAll(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
            <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Corbeille</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Fichiers supprimés — restaurables pendant 30 jours
            </p>
          </div>
        </div>
        {docs.length > 0 && (
          confirmPurgeAll ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Confirmer ?</span>
              <button
                onClick={handlePurgeAll}
                disabled={purgingAll}
                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
              >
                {purgingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Vider
              </button>
              <button
                onClick={() => setConfirmPurgeAll(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmPurgeAll(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Vider la corbeille
            </button>
          )
        )}
      </div>

      {/* Warning */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>Les fichiers supprimés depuis plus de 30 jours sont effacés automatiquement et définitivement.</span>
      </div>

      {/* List */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Impossible de charger la corbeille
            </p>
            <button
              onClick={fetchTrash}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Réessayer
            </button>
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Trash2 className="h-10 w-10 text-neutral-200 dark:text-neutral-700" />
            <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500">La corbeille est vide</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 py-3">
                {/* Icon */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
                  <FileIcon fileType={doc.fileType} />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {doc.displayName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                    <span>{formatSize(doc.sizeBytes)}</span>
                    {doc.folder && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: doc.folder.color || "#6366f1" }}
                          />
                          {doc.folder.name}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span className={doc.daysLeft <= 3 ? "font-medium text-red-500 dark:text-red-400" : ""}>
                      {doc.daysLeft === 0
                        ? "Expire aujourd'hui"
                        : `${doc.daysLeft}j restant${doc.daysLeft > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleRestore(doc.id)}
                    disabled={restoringId === doc.id || purgingId === doc.id}
                    title="Restaurer"
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-all hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                  >
                    {restoringId === doc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Restaurer
                  </button>
                  <button
                    onClick={() => handlePurge(doc.id)}
                    disabled={restoringId === doc.id || purgingId === doc.id}
                    title="Supprimer définitivement"
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    {purgingId === doc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
