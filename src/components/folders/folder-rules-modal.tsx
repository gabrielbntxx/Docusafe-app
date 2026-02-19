"use client";

import { useState, useEffect, useCallback } from "react";
import { X, FileType, Check, Settings2, Loader2, Wand2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { FolderRules, DEFAULT_CONVERT_TO_PDF_RULE } from "@/types/folder-rules";

type FolderRulesModalProps = {
  folderId: string;
  folderName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function FolderRulesModal({
  folderId,
  folderName,
  isOpen,
  onClose,
  onSave,
}: FolderRulesModalProps) {
  const { t } = useTranslation();
  const [convertToPdfEnabled, setConvertToPdfEnabled] = useState(false);
  const [savedConvertToPdfEnabled, setSavedConvertToPdfEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load current folder rules - only once when modal opens
  useEffect(() => {
    if (isOpen && folderId && !hasLoaded) {
      setIsLoading(true);
      setError(null);

      fetch(`/api/folders/${folderId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          const enabled = !!data.rules?.convertToPdf?.enabled;
          setConvertToPdfEnabled(enabled);
          setSavedConvertToPdfEnabled(enabled);
          setHasLoaded(true);
        })
        .catch((err) => {
          console.error("Error loading folder rules:", err);
          setError("Erreur lors du chargement des règles");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, folderId, hasLoaded]);

  // Reset hasLoaded when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasLoaded(false);
      setApplyResult(null);
    }
  }, [isOpen]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const rules: FolderRules = {};

      if (convertToPdfEnabled) {
        rules.convertToPdf = {
          enabled: true,
          sourceTypes: DEFAULT_CONVERT_TO_PDF_RULE.sourceTypes,
        };
      }

      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Save failed:", errorData);
        throw new Error("Failed to save rules");
      }

      setSavedConvertToPdfEnabled(convertToPdfEnabled);
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving rules:", err);
      setError("Erreur lors de l'enregistrement des règles");
    } finally {
      setIsSaving(false);
    }
  }, [convertToPdfEnabled, folderId, onClose, onSave]);

  const handleApplyToExisting = useCallback(async () => {
    setIsApplying(true);
    setApplyResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/folders/${folderId}/apply-rules`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la conversion");
      } else if (data.converted === 0) {
        setApplyResult(t("applyRulesNone"));
      } else {
        setApplyResult(t("applyRulesSuccess").replace("{{count}}", String(data.converted)));
        onSave(); // refresh parent list
      }
    } catch {
      setError("Erreur lors de la conversion");
    } finally {
      setIsApplying(false);
    }
  }, [folderId, onSave, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:max-w-md sm:rounded-[28px]">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500">
              <Settings2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("folderRules")}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                {folderName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
          </div>
        ) : (
          <>
            {/* Rules List */}
            <div className="space-y-3">
              {/* Convert to PDF Rule */}
              <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
                      <FileType className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {t("convertToPdf")}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConvertToPdfEnabled(!convertToPdfEnabled)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      convertToPdfEnabled
                        ? "bg-violet-500"
                        : "bg-neutral-300 dark:bg-neutral-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                        convertToPdfEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                {convertToPdfEnabled && (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-500/10">
                      <p className="text-xs text-violet-700 dark:text-violet-300">
                        {t("convertToPdfDescription")}
                      </p>
                    </div>
                    {savedConvertToPdfEnabled && (
                      <button
                        onClick={handleApplyToExisting}
                        disabled={isApplying}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-medium text-violet-700 transition-all hover:bg-violet-50 active:scale-[0.98] disabled:opacity-50 dark:border-violet-500/30 dark:bg-neutral-800 dark:text-violet-400 dark:hover:bg-violet-500/10"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {t("applyingRules")}
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-3.5 w-3.5" />
                            {t("applyRulesToExisting")}
                          </>
                        )}
                      </button>
                    )}
                    {applyResult && (
                      <p className="text-center text-xs font-medium text-green-600 dark:text-green-400">
                        {applyResult}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Future rules placeholder */}
              <div className="rounded-xl border-2 border-dashed border-neutral-200 p-4 text-center dark:border-neutral-700">
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  {t("moreRulesSoon")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t("save")}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
