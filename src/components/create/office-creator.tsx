"use client";

/**
 * OfficeCreator — Word & Excel document creator
 * Generates .docx and .xlsx files client-side.
 * Supports download + save to DocuSafe (via upload API).
 */

import { useState, useRef } from "react";
import { FileText, Table, Download, Save, Plus, Trash2, Loader2, CheckCircle, X } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "word" | "excel";

type ExcelRow = string[];

// ─── Helpers ────────────────────────────────────────────────────────────────

async function generateDocx(title: string, body: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");

  const bodyParagraphs = body
    .split("\n")
    .map((line) =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 24, font: "Calibri" })],
        spacing: { after: 200 },
      })
    );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...bodyParagraphs,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

async function generateXlsx(columns: string[], rows: ExcelRow[]): Promise<Blob> {
  const XLSX = await import("xlsx");

  const wsData = [columns, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style header row bold
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) {
      ws[addr].s = { font: { bold: true } };
    }
  }

  // Auto column width
  ws["!cols"] = columns.map((col) => ({
    wch: Math.max(col.length + 2, 12),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Données");

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

async function uploadToDocuSafe(blob: Blob, filename: string): Promise<void> {
  const fd = new FormData();
  fd.append("file", blob, filename);
  const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Erreur lors de la sauvegarde");
  }
}

// ─── Word Editor ─────────────────────────────────────────────────────────────

function WordEditor() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const safeName = () => (title.trim() || "document").replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").trim() || "document";

  const generate = async (action: "download" | "save") => {
    if (!title.trim() && !body.trim()) return;
    setStatus(action === "save" ? "saving" : "generating");
    setErrorMsg("");
    try {
      const blob = await generateDocx(title || "Document", body);
      if (action === "download") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${safeName()}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus("idle");
      } else {
        await uploadToDocuSafe(blob, `${safeName()}.docx`);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Erreur");
      setStatus("error");
    }
  };

  const isLoading = status === "generating" || status === "saving";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Titre du document
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Rapport mensuel, Note interne…"
          disabled={isLoading}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Contenu
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Rédigez le contenu de votre document ici…&#10;&#10;Chaque ligne sera un paragraphe séparé dans le fichier Word."
          rows={14}
          disabled={isLoading}
          className="w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />
        <p className="mt-1 text-xs text-neutral-400">
          {body.split("\n").filter((l) => l.trim()).length} paragraphe{body.split("\n").filter((l) => l.trim()).length !== 1 ? "s" : ""}
        </p>
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <X className="h-4 w-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {status === "saved" && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Document sauvegardé dans DocuSafe
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => generate("download")}
          disabled={isLoading || (!title.trim() && !body.trim())}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {status === "generating" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Télécharger .docx
        </button>
        <button
          onClick={() => generate("save")}
          disabled={isLoading || (!title.trim() && !body.trim())}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 disabled:opacity-50"
        >
          {status === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder dans DocuSafe
        </button>
      </div>
    </div>
  );
}

// ─── Excel Editor ─────────────────────────────────────────────────────────────

function ExcelEditor() {
  const [columns, setColumns] = useState<string[]>(["Colonne 1", "Colonne 2", "Colonne 3"]);
  const [rows, setRows] = useState<ExcelRow[]>([["", "", ""]]);
  const [sheetName, setSheetName] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const newColRef = useRef<HTMLInputElement>(null);

  const addColumn = () => {
    const name = `Colonne ${columns.length + 1}`;
    setColumns((c) => [...c, name]);
    setRows((r) => r.map((row) => [...row, ""]));
  };

  const removeColumn = (ci: number) => {
    if (columns.length <= 1) return;
    setColumns((c) => c.filter((_, i) => i !== ci));
    setRows((r) => r.map((row) => row.filter((_, i) => i !== ci)));
  };

  const updateColumn = (ci: number, val: string) => {
    setColumns((c) => c.map((col, i) => (i === ci ? val : col)));
  };

  const addRow = () => {
    setRows((r) => [...r, columns.map(() => "")]);
  };

  const removeRow = (ri: number) => {
    setRows((r) => r.filter((_, i) => i !== ri));
  };

  const updateCell = (ri: number, ci: number, val: string) => {
    setRows((r) => r.map((row, i) => (i === ri ? row.map((cell, j) => (j === ci ? val : cell)) : row)));
  };

  const safeName = () => (sheetName.trim() || "tableau").replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").trim() || "tableau";

  const generate = async (action: "download" | "save") => {
    setStatus(action === "save" ? "saving" : "generating");
    setErrorMsg("");
    try {
      const blob = await generateXlsx(columns, rows);
      if (action === "download") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${safeName()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus("idle");
      } else {
        await uploadToDocuSafe(blob, `${safeName()}.xlsx`);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Erreur");
      setStatus("error");
    }
  };

  const isLoading = status === "generating" || status === "saving";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Nom du fichier
        </label>
        <input
          type="text"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          placeholder="Ex: Budget 2025, Inventaire, Planning…"
          disabled={isLoading}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />
      </div>

      {/* Table editor */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
              {columns.map((col, ci) => (
                <th key={ci} className="px-3 py-2 text-left font-medium">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => updateColumn(ci, e.target.value)}
                      disabled={isLoading}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-neutral-700 outline-none transition-colors focus:border-emerald-400 focus:bg-white dark:text-neutral-300 dark:focus:bg-neutral-700"
                    />
                    {columns.length > 1 && (
                      <button
                        onClick={() => removeColumn(ci)}
                        disabled={isLoading}
                        className="flex-shrink-0 rounded p-0.5 text-neutral-400 hover:text-red-500 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-2 py-2">
                <button
                  onClick={addColumn}
                  disabled={isLoading || columns.length >= 20}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                >
                  <Plus className="h-3 w-3" />
                  Colonne
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      disabled={isLoading}
                      placeholder="—"
                      className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-neutral-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white placeholder:text-neutral-300 disabled:opacity-50 dark:text-neutral-200 dark:focus:bg-neutral-700"
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => removeRow(ri)}
                    disabled={isLoading || rows.length <= 1}
                    className="rounded p-1 text-neutral-300 hover:text-red-400 disabled:opacity-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 transition-all hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
      >
        <Plus className="h-4 w-4" />
        Ajouter une ligne
      </button>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <X className="h-4 w-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {status === "saved" && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          Tableau sauvegardé dans DocuSafe
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => generate("download")}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {status === "generating" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Télécharger .xlsx
        </button>
        <button
          onClick={() => generate("save")}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 disabled:opacity-50"
        >
          {status === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder dans DocuSafe
        </button>
      </div>
    </div>
  );
}

// ─── Main OfficeCreator ───────────────────────────────────────────────────────

export function OfficeCreator() {
  const [tab, setTab] = useState<Tab>("word");

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      {/* Header */}
      <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-md">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Créer un document Office
            </h2>
            <p className="text-xs text-neutral-400">Éditeur Word ou tableau Excel — téléchargez ou sauvegardez dans DocuSafe</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            onClick={() => setTab("word")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === "word"
                ? "bg-white text-blue-600 shadow-sm dark:bg-neutral-700 dark:text-blue-400"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Word (.docx)
          </button>
          <button
            onClick={() => setTab("excel")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === "excel"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-neutral-700 dark:text-emerald-400"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            <Table className="h-4 w-4" />
            Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="p-5">
        {tab === "word" ? <WordEditor /> : <ExcelEditor />}
      </div>
    </div>
  );
}
