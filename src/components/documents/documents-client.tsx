"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  File,
  Grid3x3,
  List,
  Download,
  Trash2,
  Eye,
  Folder,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentPreviewModal } from "./document-preview-modal";
import { useTranslation } from "@/hooks/useTranslation";

type Document = {
  id: string;
  originalName: string;
  displayName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string | null;
  ocrStatus: string;
  uploadedAt: string;
  folder: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
};

type FolderType = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  _count: {
    documents: number;
  };
};

export function DocumentsClient({
  documents,
  folders,
}: {
  documents: Document[];
  folders: FolderType[];
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  const handleView = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const handleDownload = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = documents.find(d => d.id === docId)?.originalName || "document";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert(t("errorDownloading"));
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`${t("confirmDelete")} "${docName}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${docId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert(t("errorDeleting"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(t("errorDeleting"));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || doc.folder?.id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return FileText;
    if (fileType === "image") return ImageIcon;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">{t("myDocuments")}</h1>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              {documents.length} {t("totalDocuments")}
            </p>
          </div>

          <Button asChild className="hidden sm:flex">
            <Link href="/dashboard/upload">
              <Plus className="mr-2 h-4 w-4" />
              {t("addDocument")}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <Input
              type="text"
              placeholder={t("searchDocuments")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:placeholder-neutral-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <select
              value={selectedFolder || ""}
              onChange={(e) => setSelectedFolder(e.target.value || null)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="">{t("allFolders")}</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name} ({folder._count.documents})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              onClick={() => setViewMode("grid")}
              className={"rounded-lg p-2 transition-all " + (viewMode === "grid" ? "bg-white text-primary-600 shadow-soft dark:bg-neutral-700 dark:text-primary-400" : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300")}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={"rounded-lg p-2 transition-all " + (viewMode === "list" ? "bg-white text-primary-600 shadow-soft dark:bg-neutral-700 dark:text-primary-400" : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <FileText className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
            <p className="mt-4 text-sm font-medium text-neutral-900 dark:text-white">
              {t("noDocumentsFound")}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {searchQuery || selectedFolder ? t("tryModifyFilters") : t("startByAdding")}
            </p>
            {!searchQuery && !selectedFolder && (
              <Button asChild className="mt-4">
                <Link href="/dashboard/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addDocument")}
                </Link>
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc) => {
              const Icon = getFileIcon(doc.fileType);
              return (
                <div
                  key={doc.id}
                  className="group relative flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft transition-all hover:shadow-soft-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/40 dark:to-secondary-900/40">
                    <Icon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                  </div>

                  <h3 className="truncate font-medium text-neutral-900 dark:text-white">
                    {doc.displayName}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {formatFileSize(doc.sizeBytes)} • {formatDate(doc.uploadedAt)}
                  </p>

                  {doc.folder && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <Folder className="h-3 w-3" style={{ color: doc.folder.color || undefined }} />
                      <span className="truncate">{doc.folder.name}</span>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <button
                      onClick={() => handleView(doc)}
                      className="flex-1 rounded-lg bg-primary-50 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-900/60"
                    >
                      <Eye className="mx-auto h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="rounded-lg bg-neutral-50 p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.displayName)}
                      className="rounded-lg bg-neutral-50 p-2 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => {
              const Icon = getFileIcon(doc.fileType);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-soft transition-all hover:shadow-soft-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/40 dark:to-secondary-900/40">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-medium text-neutral-900 dark:text-white">
                      {doc.displayName}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{formatFileSize(doc.sizeBytes)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                      {doc.folder && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" style={{ color: doc.folder.color || undefined }} />
                            <span>{doc.folder.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(doc)}
                      className="rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-900/60"
                    >
                      {t("view")}
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="rounded-lg bg-neutral-50 p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.displayName)}
                      className="rounded-lg bg-neutral-50 p-2 text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
