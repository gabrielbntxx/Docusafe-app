"use client";

/**
 * OfficeCreator — Word & Excel document creator (v2)
 * Card-based type selection, rich toolbar for Word, multi-cell select for Excel.
 */

import { useState, useRef, useCallback } from "react";
import {
  FileText, Table, Download, Save, Plus, Loader2, CheckCircle, X,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, ChevronLeft, Palette,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "word" | "excel";
type WordAlignment = "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
type Status = "idle" | "generating" | "saving" | "saved" | "error";
type ExcelRow = string[];
type CellKey = `${number},${number}`;

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const TEXT_COLORS = [
  "#000000", "#1e293b", "#64748b", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899",
];

const HEADER_COLORS = [
  { bg: "#10b981", fg: "#ffffff" },
  { bg: "#3b82f6", fg: "#ffffff" },
  { bg: "#8b5cf6", fg: "#ffffff" },
  { bg: "#ef4444", fg: "#ffffff" },
  { bg: "#f97316", fg: "#ffffff" },
  { bg: "#6b7280", fg: "#ffffff" },
  { bg: "#1f2937", fg: "#ffffff" },
  { bg: "#f1f5f9", fg: "#0f172a" },
];

// ─── Inline markdown parser → docx TextRun props ─────────────────────────────

function parseInlineRuns(text: string, size: number, color: string) {
  type RunProps = { text: string; bold?: boolean; italics?: boolean; color: string; size: number; font: string };
  const cleanColor = color.replace("#", "");
  const base = { color: cleanColor, size: size * 2, font: "Calibri" };

  // Split on **bold** first, then *italic* within plain segments
  const boldParts = text.split(/\*\*(.+?)\*\*/);
  const runs: RunProps[] = [];

  boldParts.forEach((part, bi) => {
    if (!part) return;
    if (bi % 2 === 1) {
      runs.push({ text: part, bold: true, ...base });
    } else {
      const italicParts = part.split(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
      italicParts.forEach((ip, ii) => {
        if (!ip) return;
        if (ii % 2 === 1) {
          runs.push({ text: ip, italics: true, ...base });
        } else {
          runs.push({ text: ip, ...base });
        }
      });
    }
  });

  return runs.filter((r) => r.text);
}

// ─── Word document generator ─────────────────────────────────────────────────

async function generateDocx(
  title: string,
  body: string,
  opts: { fontSize: number; color: string; alignment: WordAlignment }
): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } =
    await import("docx");

  const alignMap: Record<WordAlignment, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
    LEFT: AlignmentType.LEFT,
    CENTER: AlignmentType.CENTER,
    RIGHT: AlignmentType.RIGHT,
    JUSTIFIED: AlignmentType.BOTH,
  };

  const align = alignMap[opts.alignment];

  function makeRuns(line: string) {
    return parseInlineRuns(line, opts.fontSize, opts.color).map((r) => new TextRun(r));
  }

  const children: InstanceType<typeof Paragraph>[] = [];

  if (title.trim()) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 56,
            color: "0f172a",
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      })
    );
  }

  for (const line of body.split("\n")) {
    if (line.startsWith("# ")) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(2), bold: true, size: 44, color: "1e293b", font: "Calibri" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 200 },
        })
      );
    } else if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(3), bold: true, size: 32, color: "334155", font: "Calibri" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 160 },
        })
      );
    } else if (line.startsWith("### ")) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(4), bold: true, size: 26, color: "475569", font: "Calibri" })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 120 },
        })
      );
    } else if (/^[-*•]\s+/.test(line)) {
      children.push(
        new Paragraph({
          children: makeRuns(line.replace(/^[-*•]\s+/, "")),
          bullet: { level: 0 },
          alignment: align,
          spacing: { after: 120 },
        })
      );
    } else if (!line.trim()) {
      children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 80 } }));
    } else {
      children.push(
        new Paragraph({
          children: makeRuns(line),
          alignment: align,
          spacing: { after: 200 },
        })
      );
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return await Packer.toBlob(doc);
}

// ─── Excel generator ──────────────────────────────────────────────────────────

async function generateXlsx(columns: string[], rows: ExcelRow[]): Promise<Blob> {
  const XLSX = await import("xlsx");

  const wsData = [columns, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = columns.map((col) => ({ wch: Math.max(col.length + 4, 14) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Données");

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ─── Upload helper ─────────────────────────────────────────────────────────────

async function uploadToDocuSafe(blob: Blob, filename: string): Promise<void> {
  const fd = new FormData();
  fd.append("file", blob, filename);
  const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Erreur lors de la sauvegarde");
  }
}

// ─── StatusBanner ─────────────────────────────────────────────────────────────

function StatusBanner({ status, errorMsg }: { status: Status; errorMsg: string }) {
  if (status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
        <X className="h-4 w-4 flex-shrink-0" />
        {errorMsg}
      </div>
    );
  }
  if (status === "saved") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        Document sauvegardé dans DocuSafe
      </div>
    );
  }
  return null;
}

// ─── Word Editor ──────────────────────────────────────────────────────────────

function WordEditor() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState("#000000");
  const [alignment, setAlignment] = useState<WordAlignment>("LEFT");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const safeName = () =>
    (title.trim() || "document").replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").trim() || "document";

  // Insert markdown syntax at cursor
  const insertAtCursor = useCallback(
    (before: string, after = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = body.slice(start, end);
      const newValue = body.slice(0, start) + before + selected + after + body.slice(end);
      setBody(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = start + before.length;
        ta.selectionEnd = end + before.length + (selected ? selected.length : 0);
        ta.focus();
      });
    },
    [body]
  );

  // Insert prefix at start of current line
  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = body.lastIndexOf("\n", start - 1) + 1;
      const lineContent = body.slice(lineStart, body.indexOf("\n", start) === -1 ? undefined : body.indexOf("\n", start));
      // Toggle: if already has prefix, remove it; otherwise add it
      const hasPrefix = lineContent.startsWith(prefix);
      let newValue: string;
      if (hasPrefix) {
        newValue = body.slice(0, lineStart) + body.slice(lineStart + prefix.length);
      } else {
        newValue = body.slice(0, lineStart) + prefix + body.slice(lineStart);
      }
      setBody(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = hasPrefix ? start - prefix.length : start + prefix.length;
        ta.selectionEnd = hasPrefix ? start - prefix.length : start + prefix.length;
        ta.focus();
      });
    },
    [body]
  );

  const generate = async (action: "download" | "save") => {
    if (!title.trim() && !body.trim()) return;
    setStatus(action === "save" ? "saving" : "generating");
    setErrorMsg("");
    try {
      const blob = await generateDocx(title || "Document", body, { fontSize, color: textColor, alignment });
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
      {/* Title */}
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

      {/* Toolbar */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 overflow-hidden">
        {/* Row 1 – Text formatting */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
          {/* Font size */}
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-200 dark:border-neutral-700 mr-1">
            <span className="text-xs text-neutral-400">Aa</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              disabled={isLoading}
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-1.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 outline-none focus:border-blue-400 disabled:opacity-50"
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s}pt</option>
              ))}
            </select>
          </div>

          {/* Color picker */}
          <div className="relative pr-2 border-r border-neutral-200 dark:border-neutral-700 mr-1">
            <button
              onClick={() => setShowColorPicker((p) => !p)}
              disabled={isLoading}
              title="Couleur du texte"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >
              <Palette className="h-3.5 w-3.5" />
              <span
                className="inline-block h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-600"
                style={{ background: textColor }}
              />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 z-20 mt-1 flex gap-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 shadow-lg">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setTextColor(c); setShowColorPicker(false); }}
                    className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: c,
                      borderColor: textColor === c ? "#3b82f6" : "transparent",
                    }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 dark:border-neutral-700 mr-1">
            {(
              [
                { val: "LEFT" as WordAlignment, Icon: AlignLeft, title: "Gauche" },
                { val: "CENTER" as WordAlignment, Icon: AlignCenter, title: "Centré" },
                { val: "RIGHT" as WordAlignment, Icon: AlignRight, title: "Droite" },
                { val: "JUSTIFIED" as WordAlignment, Icon: AlignJustify, title: "Justifié" },
              ] as const
            ).map(({ val, Icon, title }) => (
              <button
                key={val}
                onClick={() => setAlignment(val)}
                disabled={isLoading}
                title={title}
                className={`rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
                  alignment === val
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                    : "text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Syntax shortcuts */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => insertLinePrefix("# ")}
              disabled={isLoading}
              title="Titre 1"
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 px-2 py-0.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >H1</button>
            <button
              onClick={() => insertLinePrefix("## ")}
              disabled={isLoading}
              title="Titre 2"
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 px-2 py-0.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >H2</button>
            <button
              onClick={() => insertAtCursor("**", "**")}
              disabled={isLoading}
              title="Gras"
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 px-2 py-0.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >B</button>
            <button
              onClick={() => insertAtCursor("*", "*")}
              disabled={isLoading}
              title="Italique"
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 px-2 py-0.5 text-[11px] italic text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >I</button>
            <button
              onClick={() => insertLinePrefix("- ")}
              disabled={isLoading}
              title="Liste à puces"
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 px-2 py-0.5 text-[11px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >•</button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            "Rédigez votre document ici…\n\n# Titre principal\n## Sous-titre\n\n**texte en gras**  *texte en italique*\n- élément de liste\n\nChaque ligne vide crée un espace dans le document."
          }
          rows={16}
          disabled={isLoading}
          className="w-full resize-y border-0 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-300 disabled:opacity-50 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
          style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.65 }}
        />
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-1.5">
          <p className="text-[11px] text-neutral-400">
            {body.split("\n").filter((l) => l.trim()).length} lignes
          </p>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-neutral-300 dark:border-neutral-600"
              style={{ background: textColor }}
            />
            <span>{fontSize}pt · {alignment.charAt(0) + alignment.slice(1).toLowerCase()}</span>
          </div>
        </div>
      </div>

      <StatusBanner status={status} errorMsg={errorMsg} />

      <div className="flex gap-3">
        <button
          onClick={() => generate("download")}
          disabled={isLoading || (!title.trim() && !body.trim())}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {status === "generating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Télécharger .docx
        </button>
        <button
          onClick={() => generate("save")}
          disabled={isLoading || (!title.trim() && !body.trim())}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 disabled:opacity-50"
        >
          {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ─── Excel Editor ─────────────────────────────────────────────────────────────

function ExcelEditor() {
  const [columns, setColumns] = useState<string[]>(["Colonne 1", "Colonne 2", "Colonne 3", "Colonne 4", "Colonne 5"]);
  const [rows, setRows] = useState<ExcelRow[]>([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ]);
  const [sheetName, setSheetName] = useState("");
  const [headerColorIdx, setHeaderColorIdx] = useState(0);
  const [selectedCells, setSelectedCells] = useState<Set<CellKey>>(new Set());
  const [lastSelected, setLastSelected] = useState<[number, number] | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);

  const hc = HEADER_COLORS[headerColorIdx];

  // ── Cell selection ──────────────────────────────────────────────────────────

  const handleCellClick = (ri: number, ci: number, e: React.MouseEvent) => {
    const key = `${ri},${ci}` as CellKey;
    if (e.shiftKey && lastSelected) {
      const [lr, lc] = lastSelected;
      const newSet = new Set<CellKey>();
      for (let r = Math.min(ri, lr); r <= Math.max(ri, lr); r++)
        for (let c = Math.min(ci, lc); c <= Math.max(ci, lc); c++)
          newSet.add(`${r},${c}` as CellKey);
      setSelectedCells(newSet);
    } else if (e.ctrlKey || e.metaKey) {
      const newSet = new Set(selectedCells);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      setSelectedCells(newSet);
      setLastSelected([ri, ci]);
    } else {
      setSelectedCells(new Set([key]));
      setLastSelected([ri, ci]);
    }
  };

  const selectColumn = (ci: number) => {
    const newSet = new Set<CellKey>();
    rows.forEach((_, ri) => newSet.add(`${ri},${ci}` as CellKey));
    setSelectedCells(newSet);
    setLastSelected([0, ci]);
  };

  const selectRow = (ri: number) => {
    const newSet = new Set<CellKey>();
    columns.forEach((_, ci) => newSet.add(`${ri},${ci}` as CellKey));
    setSelectedCells(newSet);
    setLastSelected([ri, 0]);
  };

  const clearSelection = () => setSelectedCells(new Set());

  const fillSelected = () => {
    if (!selectedCells.size) return;
    setRows((prev) =>
      prev.map((row, ri) => row.map((cell, ci) => (selectedCells.has(`${ri},${ci}` as CellKey) ? fillValue : cell)))
    );
    setFillValue("");
    setSelectedCells(new Set());
  };

  const eraseSelected = () => {
    if (!selectedCells.size) return;
    setRows((prev) =>
      prev.map((row, ri) => row.map((cell, ci) => (selectedCells.has(`${ri},${ci}` as CellKey) ? "" : cell)))
    );
    setSelectedCells(new Set());
  };

  // ── Keyboard navigation ─────────────────────────────────────────────────────

  const focusCell = (ri: number, ci: number) => {
    const el = tableRef.current?.querySelector<HTMLInputElement>(`[data-cell="${ri},${ci}"]`);
    el?.focus();
    el?.select();
  };

  const handleCellKeyDown = (ri: number, ci: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const maxC = columns.length - 1;
    const maxR = rows.length - 1;
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) { ci > 0 ? focusCell(ri, ci - 1) : ri > 0 && focusCell(ri - 1, maxC); }
      else { ci < maxC ? focusCell(ri, ci + 1) : ri < maxR ? focusCell(ri + 1, 0) : (addRow(), requestAnimationFrame(() => focusCell(ri + 1, 0))); }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) { ri > 0 && focusCell(ri - 1, ci); }
      else if (ri < maxR) { focusCell(ri + 1, ci); }
      else { addRow(); requestAnimationFrame(() => focusCell(ri + 1, ci)); }
    } else if (e.key === "ArrowDown" && ri < maxR) { e.preventDefault(); focusCell(ri + 1, ci); }
    else if (e.key === "ArrowUp" && ri > 0) { e.preventDefault(); focusCell(ri - 1, ci); }
    else if (e.key === "Escape") { clearSelection(); }
  };

  // ── Column/Row management ───────────────────────────────────────────────────

  const addColumn = () => {
    if (columns.length >= 26) return;
    setColumns((c) => [...c, `Colonne ${c.length + 1}`]);
    setRows((r) => r.map((row) => [...row, ""]));
  };

  const removeColumn = (ci: number) => {
    if (columns.length <= 1) return;
    setColumns((c) => c.filter((_, i) => i !== ci));
    setRows((r) => r.map((row) => row.filter((_, i) => i !== ci)));
    setSelectedCells(new Set());
  };

  const updateColumn = (ci: number, val: string) =>
    setColumns((c) => c.map((col, i) => (i === ci ? val : col)));

  const addRow = () => setRows((r) => [...r, columns.map(() => "")]);

  const removeRow = (ri: number) => {
    setRows((r) => r.filter((_, i) => i !== ri));
    setSelectedCells(new Set());
  };

  const updateCell = (ri: number, ci: number, val: string) =>
    setRows((r) => r.map((row, i) => (i === ri ? row.map((cell, j) => (j === ci ? val : cell)) : row)));

  const safeName = () =>
    (sheetName.trim() || "tableau").replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").trim() || "tableau";

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
      {/* File name + header color */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Nom du fichier
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Ex: Budget 2025, Inventaire…"
            disabled={isLoading}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          />
        </div>
        {/* Header color */}
        <div className="flex-shrink-0">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Couleur en-tête
          </label>
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2">
            {HEADER_COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => setHeaderColorIdx(i)}
                className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c.bg,
                  borderColor: headerColorIdx === i ? "#3b82f6" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selection bar (shown when >1 cell selected) */}
      {selectedCells.size > 1 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {selectedCells.size} cellules sélectionnées
          </span>
          <input
            type="text"
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fillSelected()}
            placeholder="Valeur à remplir…"
            className="flex-1 rounded-lg border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-neutral-800 px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:border-emerald-400"
          />
          <button
            onClick={fillSelected}
            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600"
          >
            Remplir
          </button>
          <button
            onClick={eraseSelected}
            className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Effacer
          </button>
          <button onClick={clearSelection} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700" ref={tableRef}>
        <table className="w-full text-sm select-none">
          <thead>
            <tr style={{ background: hc.bg }}>
              {/* Row number header corner */}
              <th className="w-8 px-2 py-2 text-center text-xs opacity-60" style={{ color: hc.fg }}>#</th>
              {columns.map((col, ci) => (
                <th
                  key={ci}
                  className="px-2 py-2 text-left font-medium"
                  style={{ color: hc.fg }}
                >
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => selectColumn(ci)}
                      className="text-[10px] opacity-60 hover:opacity-100 mr-0.5"
                      style={{ color: hc.fg }}
                      title="Sélectionner la colonne"
                    >↓</button>
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => updateColumn(ci, e.target.value)}
                      disabled={isLoading}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs font-semibold outline-none focus:border-white/40 focus:bg-black/10"
                      style={{ color: hc.fg }}
                    />
                    {columns.length > 1 && (
                      <button
                        onClick={() => removeColumn(ci)}
                        disabled={isLoading}
                        className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 disabled:opacity-30"
                        style={{ color: hc.fg }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {/* Add column button */}
              <th className="px-2 py-2">
                <button
                  onClick={addColumn}
                  disabled={isLoading || columns.length >= 26}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs opacity-80 hover:opacity-100 disabled:opacity-30"
                  style={{ color: hc.fg }}
                >
                  <Plus className="h-3 w-3" />
                  Col.
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
                {/* Row number */}
                <td className="w-8 px-2 py-1 text-center">
                  <button
                    onClick={() => selectRow(ri)}
                    className="text-[10px] text-neutral-400 hover:text-emerald-500"
                    title="Sélectionner la ligne"
                  >
                    {ri + 1}
                  </button>
                </td>
                {row.map((cell, ci) => {
                  const isSelected = selectedCells.has(`${ri},${ci}` as CellKey);
                  return (
                    <td key={ci} className="px-2 py-1">
                      <input
                        type="text"
                        value={cell}
                        data-cell={`${ri},${ci}`}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        onMouseDown={(e) => handleCellClick(ri, ci, e)}
                        onKeyDown={(e) => handleCellKeyDown(ri, ci, e)}
                        disabled={isLoading}
                        placeholder="—"
                        className={`w-full rounded-lg border px-2 py-1 text-xs text-neutral-800 outline-none transition-colors placeholder:text-neutral-300 disabled:opacity-50 dark:text-neutral-200 dark:placeholder:text-neutral-600 ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500"
                            : "border-transparent bg-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-neutral-700"
                        }`}
                      />
                    </td>
                  );
                })}
                <td className="px-2 py-1">
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

      {/* Add row */}
      <button
        onClick={addRow}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 transition-all hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
      >
        <Plus className="h-4 w-4" />
        Ajouter une ligne
      </button>

      <p className="text-[11px] text-neutral-400 text-center">
        Cliquer = sélectionner · Shift+clic = plage · Ctrl+clic = multiple · Tab/Entrée = naviguer
      </p>

      <StatusBanner status={status} errorMsg={errorMsg} />

      <div className="flex gap-3">
        <button
          onClick={() => generate("download")}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {status === "generating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Télécharger .xlsx
        </button>
        <button
          onClick={() => generate("save")}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 disabled:opacity-50"
        >
          {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ─── Main OfficeCreator ───────────────────────────────────────────────────────

export function OfficeCreator() {
  const [selected, setSelected] = useState<Tab | null>(null);

  if (selected) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header with back + title */}
        <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(null)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-md ${
                selected === "word"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-600"
              }`}
            >
              {selected === "word" ? (
                <FileText className="h-4 w-4 text-white" />
              ) : (
                <Table className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {selected === "word" ? "Éditeur Word" : "Éditeur Excel"}
              </h2>
              <p className="text-xs text-neutral-400">
                {selected === "word"
                  ? "Rédigez votre document, téléchargez ou sauvegardez en .docx"
                  : "Créez votre tableau, téléchargez ou sauvegardez en .xlsx"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {selected === "word" ? <WordEditor /> : <ExcelEditor />}
        </div>
      </div>
    );
  }

  // Card selector
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-md">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Créer un document Office
            </h2>
            <p className="text-xs text-neutral-400">
              Choisissez le type de document à créer
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5">
        {/* Word card */}
        <button
          onClick={() => setSelected("word")}
          className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-6 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20 shadow-sm group-hover:shadow-md group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-500/30 dark:group-hover:to-blue-600/30 transition-all">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Document Word</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Rédigez un document texte avec titres, listes et mise en forme
            </p>
            <span className="mt-2 inline-block rounded-full bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              .docx
            </span>
          </div>
        </button>

        {/* Excel card */}
        <button
          onClick={() => setSelected("excel")}
          className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-500/20 dark:to-emerald-600/20 shadow-sm group-hover:shadow-md group-hover:from-emerald-200 group-hover:to-emerald-300 dark:group-hover:from-emerald-500/30 dark:group-hover:to-emerald-600/30 transition-all">
            <Table className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Tableau Excel</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Créez un tableau avec colonnes personnalisables et navigation clavier
            </p>
            <span className="mt-2 inline-block rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              .xlsx
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
