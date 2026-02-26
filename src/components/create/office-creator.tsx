"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText, Table, Download, Save, Plus, Loader2, CheckCircle, X,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, ChevronLeft,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "word" | "excel";
type Status = "idle" | "generating" | "saving" | "saved" | "error";
type ExcelRow = string[];
type CellKey = `${number},${number}`;

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const TEXT_COLORS = [
  "#000000", "#1e293b", "#64748b", "#ef4444",
  "#f97316", "#eab308", "#16a34a", "#2563eb",
  "#7c3aed", "#db2777",
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rgbToHex(color: string): string {
  if (!color) return "000000";
  if (color.startsWith("#")) return color.replace("#", "").toUpperCase();
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return [1, 2, 3].map((i) => parseInt(m[i]).toString(16).padStart(2, "0")).join("").toUpperCase();
  return "000000";
}

// ─── HTML → docx converter ────────────────────────────────────────────────────

async function htmlToDocx(title: string, html: string, baseFontSize: number): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");

  // Parse in a temporary hidden element so inherited styles resolve
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;visibility:hidden;left:-9999px;";
  document.body.appendChild(host);
  host.innerHTML = html;

  type RunOpts = {
    text: string;
    bold?: boolean;
    italics?: boolean;
    underline?: { type: "single" };
    color?: string;
    size?: number;
    font?: string;
  };

  function getAlign(el: HTMLElement): string {
    const ta = el.style.textAlign;
    if (ta === "center") return AlignmentType.CENTER;
    if (ta === "right") return AlignmentType.RIGHT;
    if (ta === "justify") return AlignmentType.BOTH;
    return AlignmentType.LEFT;
  }

  function extractRuns(node: Node, inherited: {
    bold?: boolean; italic?: boolean; underline?: boolean;
    color?: string; size?: number;
  }): RunOpts[] {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text) return [];
      return [{
        text,
        bold: inherited.bold,
        italics: inherited.italic,
        underline: inherited.underline ? { type: "single" as const } : undefined,
        color: rgbToHex(inherited.color || "#000000"),
        size: (inherited.size || baseFontSize) * 2,
        font: "Calibri",
      }];
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const next = { ...inherited };

    if (["b", "strong"].includes(tag) || el.style.fontWeight === "bold" || parseInt(el.style.fontWeight || "0") >= 600) next.bold = true;
    if (["i", "em"].includes(tag) || el.style.fontStyle === "italic") next.italic = true;
    if (tag === "u" || el.style.textDecoration?.includes("underline")) next.underline = true;
    if (el.style.color) next.color = el.style.color;
    if (el.style.fontSize) {
      const fs = parseFloat(el.style.fontSize);
      if (!isNaN(fs)) next.size = el.style.fontSize.includes("px") ? Math.round(fs * 0.75) : fs;
    }

    const runs: RunOpts[] = [];
    el.childNodes.forEach((child) => runs.push(...extractRuns(child, next)));
    return runs;
  }

  const paragraphs: InstanceType<typeof Paragraph>[] = [];

  if (title.trim()) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 56, font: "Calibri", color: "0F172A" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      })
    );
  }

  function processBlock(el: Element) {
    const tag = el.tagName.toLowerCase();
    const htmlEl = el as HTMLElement;
    const align = getAlign(htmlEl) as string;
    const runs = extractRuns(el, { size: baseFontSize });
    const textRuns = runs.map((r) => new TextRun(r));
    const hasContent = runs.some((r) => r.text?.trim());

    if (tag === "h1") {
      paragraphs.push(new Paragraph({
        children: runs.map((r) => new TextRun({ ...r, bold: true, size: Math.max(r.size || 0, 44) })),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 200 },
      }));
    } else if (tag === "h2") {
      paragraphs.push(new Paragraph({
        children: runs.map((r) => new TextRun({ ...r, bold: true, size: Math.max(r.size || 0, 32) })),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 160 },
      }));
    } else if (tag === "h3") {
      paragraphs.push(new Paragraph({
        children: runs.map((r) => new TextRun({ ...r, bold: true, size: Math.max(r.size || 0, 26) })),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 120 },
      }));
    } else if (tag === "li") {
      paragraphs.push(new Paragraph({
        children: textRuns,
        bullet: { level: 0 },
        alignment: align as never,
        spacing: { after: 120 },
      }));
    } else if (!hasContent) {
      paragraphs.push(new Paragraph({ children: [], spacing: { after: 80 } }));
    } else {
      paragraphs.push(new Paragraph({
        children: textRuns,
        alignment: align as never,
        spacing: { after: 200 },
      }));
    }
  }

  function walkNode(node: Node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: node.textContent, size: baseFontSize * 2, font: "Calibri", color: "000000" })],
          spacing: { after: 200 },
        }));
      }
      return;
    }
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      processBlock(el);
    } else if (tag === "br") {
      paragraphs.push(new Paragraph({ children: [], spacing: { after: 80 } }));
    } else if (tag === "ul" || tag === "ol") {
      el.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === "li") {
          processBlock(child as Element);
        }
      });
    } else {
      node.childNodes.forEach(walkNode);
    }
  }

  host.childNodes.forEach(walkNode);
  document.body.removeChild(host);

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
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
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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

function StatusBanner({ status, errorMsg }: { status: Status; errorMsg: string }) {
  if (status === "error") return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
      <X className="h-4 w-4 flex-shrink-0" />{errorMsg}
    </div>
  );
  if (status === "saved") return (
    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
      <CheckCircle className="h-4 w-4 flex-shrink-0" />Document sauvegardé dans DocuSafe
    </div>
  );
  return null;
}

// ─── Word Editor ──────────────────────────────────────────────────────────────

function WordEditor() {
  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const safeName = () =>
    (title.trim() || "document").replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").trim() || "document";

  // Update toolbar active states from current selection
  const updateToolbarState = useCallback(() => {
    if (!editorRef.current) return;
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarState);
    return () => document.removeEventListener("selectionchange", updateToolbarState);
  }, [updateToolbarState]);

  // Check if editor is empty (for placeholder)
  const checkEmpty = () => {
    const c = editorRef.current?.innerHTML || "";
    setIsEmpty(!c || c === "<br>" || c === "<p><br></p>" || c === "<p></p>" || c === "<div><br></div>");
  };

  // Execute a formatting command without losing selection
  // IMPORTANT: use onMouseDown + e.preventDefault() on buttons, not onClick
  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateToolbarState();
  };

  // Apply font size — global default (affects whole editor, not per-selection)
  const applyFontSize = (pt: number) => {
    setFontSize(pt);
    if (editorRef.current) editorRef.current.style.fontSize = `${pt}pt`;
  };

  // Apply color to selected text
  const applyColor = (color: string) => {
    setTextColor(color);
    setShowColorPicker(false);
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
  };

  const generate = async (action: "download" | "save") => {
    const html = editorRef.current?.innerHTML || "";
    if (!title.trim() && isEmpty) return;
    setStatus(action === "save" ? "saving" : "generating");
    setErrorMsg("");
    try {
      const blob = await htmlToDocx(title, html, fontSize);
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
    <div className="space-y-3">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du document…"
        disabled={isLoading}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
      />

      {/* Editor box */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 px-2 py-1.5">

          {/* Paragraph style */}
          <div className="flex items-center gap-0.5 border-r border-neutral-200 dark:border-neutral-600 pr-1.5 mr-1.5">
            {(["h1", "h2", "h3", "p"] as const).map((tag, i) => (
              <button
                key={tag}
                onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", tag); }}
                title={tag === "p" ? "Paragraphe normal" : `Titre ${i + 1}`}
                className="rounded-md px-1.5 py-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {tag === "p" ? "¶" : `H${i + 1}`}
              </button>
            ))}
          </div>

          {/* Bold / Italic / Underline */}
          <div className="flex items-center gap-0.5 border-r border-neutral-200 dark:border-neutral-600 pr-1.5 mr-1.5">
            <button
              onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}
              className={`rounded-md px-2 py-1 text-xs font-bold transition-colors ${isBold ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
            >B</button>
            <button
              onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}
              className={`rounded-md px-2 py-1 text-xs italic transition-colors ${isItalic ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
            >I</button>
            <button
              onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}
              className={`rounded-md px-2 py-1 text-xs underline transition-colors ${isUnderline ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
            >U</button>
          </div>

          {/* Font size */}
          <div className="flex items-center gap-1 border-r border-neutral-200 dark:border-neutral-600 pr-1.5 mr-1.5">
            <select
              value={fontSize}
              onChange={(e) => applyFontSize(Number(e.target.value))}
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-1.5 py-0.5 text-xs text-neutral-700 dark:text-neutral-200 outline-none focus:border-blue-400"
            >
              {FONT_SIZES.map((s) => <option key={s} value={s}>{s}pt</option>)}
            </select>
          </div>

          {/* Color picker */}
          <div className="relative border-r border-neutral-200 dark:border-neutral-600 pr-1.5 mr-1.5">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowColorPicker((p) => !p)}
              title="Couleur du texte"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <span className="text-sm font-bold leading-none" style={{ color: textColor }}>A</span>
              <span className="mt-0.5 block h-1 w-4 rounded-full" style={{ background: textColor }} />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 z-30 mt-1.5 grid grid-cols-5 gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 shadow-xl">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onMouseDown={(e) => { e.preventDefault(); applyColor(c); }}
                    title={c}
                    className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: textColor === c ? "#3b82f6" : "transparent" }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 border-r border-neutral-200 dark:border-neutral-600 pr-1.5 mr-1.5">
            {([
              { cmd: "justifyLeft", Icon: AlignLeft, title: "Gauche" },
              { cmd: "justifyCenter", Icon: AlignCenter, title: "Centré" },
              { cmd: "justifyRight", Icon: AlignRight, title: "Droite" },
              { cmd: "justifyFull", Icon: AlignJustify, title: "Justifié" },
            ] as const).map(({ cmd, Icon, title }) => (
              <button
                key={cmd}
                onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
                title={title}
                className="rounded-md p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <button
              onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }}
              title="Liste à puces"
              className="rounded-md px-1.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >• ━</button>
            <button
              onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }}
              title="Liste numérotée"
              className="rounded-md px-1.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >1. ━</button>
          </div>
        </div>

        {/* ── Contenteditable ── */}
        <div className="relative bg-white dark:bg-neutral-900">
          {isEmpty && (
            <div className="pointer-events-none absolute left-5 top-4 text-sm leading-relaxed text-neutral-300 dark:text-neutral-600">
              Rédigez votre document ici…<br />
              <span className="text-xs">Sélectionnez du texte pour le mettre en forme.</span>
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={checkEmpty}
            onKeyUp={updateToolbarState}
            onMouseUp={updateToolbarState}
            className="min-h-[300px] p-5 text-neutral-900 outline-none dark:text-white
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-neutral-900 dark:[&_h1]:text-white
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-neutral-800 dark:[&_h2]:text-neutral-100
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-neutral-700 dark:[&_h3]:text-neutral-200
              [&_p]:mb-2 [&_p]:leading-relaxed
              [&_div]:mb-1 [&_div]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2
              [&_li]:mb-0.5 [&_li]:leading-relaxed
              [&_b]:font-bold [&_strong]:font-bold
              [&_i]:italic [&_em]:italic
              [&_u]:underline"
            style={{ fontSize: `${fontSize}pt`, lineHeight: 1.7 }}
          />
        </div>

        {/* Footer hint */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-1.5">
          <p className="text-[11px] text-neutral-400">
            Taille active&nbsp;: <strong>{fontSize}pt</strong> · Sélectionnez du texte pour appliquer gras, italique, couleur…
          </p>
        </div>
      </div>

      <StatusBanner status={status} errorMsg={errorMsg} />

      <div className="flex gap-3">
        <button
          onClick={() => generate("download")}
          disabled={isLoading || (isEmpty && !title.trim())}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {status === "generating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Télécharger .docx
        </button>
        <button
          onClick={() => generate("save")}
          disabled={isLoading || (isEmpty && !title.trim())}
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
  const [rows, setRows] = useState<ExcelRow[]>([["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]]);
  const [sheetName, setSheetName] = useState("");
  const [headerColorIdx, setHeaderColorIdx] = useState(0);
  const [selectedCells, setSelectedCells] = useState<Set<CellKey>>(new Set());
  const [lastSelected, setLastSelected] = useState<[number, number] | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);
  const hc = HEADER_COLORS[headerColorIdx];

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
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      setSelectedCells(newSet);
      setLastSelected([ri, ci]);
    } else {
      setSelectedCells(new Set([key]));
      setLastSelected([ri, ci]);
    }
  };

  const selectColumn = (ci: number) => {
    const s = new Set<CellKey>();
    rows.forEach((_, ri) => s.add(`${ri},${ci}` as CellKey));
    setSelectedCells(s); setLastSelected([0, ci]);
  };
  const selectRow = (ri: number) => {
    const s = new Set<CellKey>();
    columns.forEach((_, ci) => s.add(`${ri},${ci}` as CellKey));
    setSelectedCells(s); setLastSelected([ri, 0]);
  };
  const clearSelection = () => setSelectedCells(new Set());

  const fillSelected = () => {
    if (!selectedCells.size) return;
    setRows((prev) => prev.map((row, ri) => row.map((cell, ci) => selectedCells.has(`${ri},${ci}` as CellKey) ? fillValue : cell)));
    setFillValue(""); setSelectedCells(new Set());
  };
  const eraseSelected = () => {
    setRows((prev) => prev.map((row, ri) => row.map((cell, ci) => selectedCells.has(`${ri},${ci}` as CellKey) ? "" : cell)));
    setSelectedCells(new Set());
  };

  const focusCell = (ri: number, ci: number) => {
    const el = tableRef.current?.querySelector<HTMLInputElement>(`[data-cell="${ri},${ci}"]`);
    el?.focus(); el?.select();
  };

  const handleCellKeyDown = (ri: number, ci: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const maxC = columns.length - 1, maxR = rows.length - 1;
    if (e.key === "Tab") {
      e.preventDefault();
      e.shiftKey ? (ci > 0 ? focusCell(ri, ci - 1) : ri > 0 && focusCell(ri - 1, maxC)) : (ci < maxC ? focusCell(ri, ci + 1) : ri < maxR ? focusCell(ri + 1, 0) : (addRow(), requestAnimationFrame(() => focusCell(ri + 1, 0))));
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.shiftKey ? (ri > 0 && focusCell(ri - 1, ci)) : (ri < maxR ? focusCell(ri + 1, ci) : (addRow(), requestAnimationFrame(() => focusCell(ri + 1, ci))));
    } else if (e.key === "ArrowDown" && ri < maxR) { e.preventDefault(); focusCell(ri + 1, ci); }
    else if (e.key === "ArrowUp" && ri > 0) { e.preventDefault(); focusCell(ri - 1, ci); }
    else if (e.key === "Escape") clearSelection();
  };

  const addColumn = () => { if (columns.length >= 26) return; setColumns((c) => [...c, `Colonne ${c.length + 1}`]); setRows((r) => r.map((row) => [...row, ""])); };
  const removeColumn = (ci: number) => { if (columns.length <= 1) return; setColumns((c) => c.filter((_, i) => i !== ci)); setRows((r) => r.map((row) => row.filter((_, i) => i !== ci))); setSelectedCells(new Set()); };
  const updateColumn = (ci: number, val: string) => setColumns((c) => c.map((col, i) => i === ci ? val : col));
  const addRow = () => setRows((r) => [...r, columns.map(() => "")]);
  const removeRow = (ri: number) => { setRows((r) => r.filter((_, i) => i !== ri)); setSelectedCells(new Set()); };
  const updateCell = (ri: number, ci: number, val: string) => setRows((r) => r.map((row, i) => i === ri ? row.map((cell, j) => j === ci ? val : cell) : row));

  const safeName = () => (sheetName.trim() || "tableau").replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").trim() || "tableau";

  const generate = async (action: "download" | "save") => {
    setStatus(action === "save" ? "saving" : "generating"); setErrorMsg("");
    try {
      const blob = await generateXlsx(columns, rows);
      if (action === "download") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${safeName()}.xlsx`; a.click(); URL.revokeObjectURL(url);
        setStatus("idle");
      } else { await uploadToDocuSafe(blob, `${safeName()}.xlsx`); setStatus("saved"); setTimeout(() => setStatus("idle"), 3000); }
    } catch (e: unknown) { setErrorMsg(e instanceof Error ? e.message : "Erreur"); setStatus("error"); }
  };

  const isLoading = status === "generating" || status === "saving";

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nom du fichier</label>
          <input type="text" value={sheetName} onChange={(e) => setSheetName(e.target.value)} placeholder="Ex: Budget 2025, Inventaire…" disabled={isLoading}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500" />
        </div>
        <div className="flex-shrink-0">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Couleur en-tête</label>
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2">
            {HEADER_COLORS.map((c, i) => (
              <button key={i} onClick={() => setHeaderColorIdx(i)} className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: c.bg, borderColor: headerColorIdx === i ? "#3b82f6" : "transparent" }} />
            ))}
          </div>
        </div>
      </div>

      {selectedCells.size > 1 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{selectedCells.size} cellules</span>
          <input type="text" value={fillValue} onChange={(e) => setFillValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fillSelected()}
            placeholder="Valeur à remplir…" className="flex-1 rounded-lg border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-neutral-800 px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 outline-none" />
          <button onClick={fillSelected} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600">Remplir</button>
          <button onClick={eraseSelected} className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700">Effacer</button>
          <button onClick={clearSelection} className="text-neutral-400 hover:text-neutral-600"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700" ref={tableRef}>
        <table className="w-full text-sm select-none">
          <thead>
            <tr style={{ background: hc.bg }}>
              <th className="w-8 px-2 py-2 text-center text-xs opacity-60" style={{ color: hc.fg }}>#</th>
              {columns.map((col, ci) => (
                <th key={ci} className="px-2 py-2 text-left font-medium" style={{ color: hc.fg }}>
                  <div className="flex items-center gap-1">
                    <button onClick={() => selectColumn(ci)} className="text-[10px] opacity-60 hover:opacity-100" style={{ color: hc.fg }} title="Sélectionner la colonne">↓</button>
                    <input type="text" value={col} onChange={(e) => updateColumn(ci, e.target.value)} disabled={isLoading}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs font-semibold outline-none focus:border-white/40 focus:bg-black/10"
                      style={{ color: hc.fg }} />
                    {columns.length > 1 && (
                      <button onClick={() => removeColumn(ci)} disabled={isLoading} className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100" style={{ color: hc.fg }}>
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-2 py-2">
                <button onClick={addColumn} disabled={isLoading || columns.length >= 26} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs opacity-80 hover:opacity-100 disabled:opacity-30" style={{ color: hc.fg }}>
                  <Plus className="h-3 w-3" />Col.
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                <td className="w-8 px-2 py-1 text-center">
                  <button onClick={() => selectRow(ri)} className="text-[10px] text-neutral-400 hover:text-emerald-500" title="Sélectionner la ligne">{ri + 1}</button>
                </td>
                {row.map((cell, ci) => {
                  const isSel = selectedCells.has(`${ri},${ci}` as CellKey);
                  return (
                    <td key={ci} className="px-1.5 py-1">
                      <input type="text" value={cell} data-cell={`${ri},${ci}`}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        onMouseDown={(e) => handleCellClick(ri, ci, e)}
                        onKeyDown={(e) => handleCellKeyDown(ri, ci, e)}
                        disabled={isLoading} placeholder="—"
                        className={`w-full rounded-lg border px-2 py-1 text-xs text-neutral-800 outline-none transition-colors placeholder:text-neutral-300 disabled:opacity-50 dark:text-neutral-200 dark:placeholder:text-neutral-600 ${
                          isSel ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500" : "border-transparent bg-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-neutral-700"
                        }`} />
                    </td>
                  );
                })}
                <td className="px-1.5 py-1">
                  <button onClick={() => removeRow(ri)} disabled={isLoading || rows.length <= 1} className="rounded p-1 text-neutral-300 hover:text-red-400 disabled:opacity-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow} disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 transition-all hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400">
        <Plus className="h-4 w-4" />Ajouter une ligne
      </button>
      <p className="text-center text-[11px] text-neutral-400">Shift+clic = plage · Ctrl+clic = multiple · Tab/Entrée = naviguer</p>

      <StatusBanner status={status} errorMsg={errorMsg} />
      <div className="flex gap-3">
        <button onClick={() => generate("download")} disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
          {status === "generating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Télécharger .xlsx
        </button>
        <button onClick={() => generate("save")} disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 disabled:opacity-50">
          {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Sauvegarder
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
        <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected(null)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-md ${selected === "word" ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-emerald-500 to-emerald-600"}`}>
              {selected === "word" ? <FileText className="h-4 w-4 text-white" /> : <Table className="h-4 w-4 text-white" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {selected === "word" ? "Éditeur Word" : "Éditeur Excel"}
              </h2>
              <p className="text-xs text-neutral-400">
                {selected === "word" ? "Rédigez et mettez en forme votre document .docx" : "Créez votre tableau .xlsx"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">{selected === "word" ? <WordEditor /> : <ExcelEditor />}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-md">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Créer un document Office</h2>
            <p className="text-xs text-neutral-400">Choisissez le type de document</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5">
        <button onClick={() => setSelected("word")}
          className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-6 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-500/5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20 shadow-sm transition-all group-hover:shadow-md group-hover:from-blue-200 group-hover:to-blue-300">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Document Word</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Éditeur riche avec mise en forme en temps réel</p>
            <span className="mt-2 inline-block rounded-full bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">.docx</span>
          </div>
        </button>
        <button onClick={() => setSelected("excel")}
          className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-500/20 dark:to-emerald-600/20 shadow-sm transition-all group-hover:shadow-md group-hover:from-emerald-200 group-hover:to-emerald-300">
            <Table className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Tableau Excel</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Tableau avec colonnes personnalisables et navigation</p>
            <span className="mt-2 inline-block rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">.xlsx</span>
          </div>
        </button>
      </div>
    </div>
  );
}
