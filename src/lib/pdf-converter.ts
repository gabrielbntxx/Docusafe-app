/**
 * PDF Converter Library
 *
 * Converts images and text/code files to PDF.
 * Images: uses sharp for processing + pdfkit for PDF generation.
 * Text/code: renders with monospace font, line numbers, and page numbers.
 * Apple iWork: extracts QuickLook/Preview.pdf from the ZIP bundle.
 */

import sharp from "sharp";
import PDFDocument from "pdfkit";
import { PDFDocument as PdfLib, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

/** Apple iWork file MIME types (all are ZIP-based bundles) */
export const APPLE_IWORK_MIME_TYPES = new Set([
  "application/vnd.apple.pages",
  "application/vnd.apple.numbers",
  "application/vnd.apple.keynote",
]);

/**
 * Extract the QuickLook/Preview.pdf from an Apple iWork file (.pages, .numbers, .key).
 * These files are ZIP archives that embed a PDF preview at QuickLook/Preview.pdf.
 * Returns null if the file is not a valid ZIP or has no preview PDF.
 */
export async function extractAppleQuickLookPdf(buffer: Buffer): Promise<Buffer | null> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const pdfEntry = zip.file("QuickLook/Preview.pdf");
    if (!pdfEntry) return null;
    const pdfBuffer = await pdfEntry.async("nodebuffer");
    return pdfBuffer;
  } catch {
    return null;
  }
}

/**
 * Image MIME types supported for conversion (sharp handles all of these)
 */
export const CONVERTIBLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/tiff",
  "image/bmp",
  "image/avif",
  "image/svg+xml",
];

/**
 * Text/code MIME types supported for conversion (rendered as monospace PDF)
 */
export const CONVERTIBLE_TEXT_TYPES = [
  // Plain text
  "text/plain",
  "text/csv",
  "text/markdown",
  // Web
  "text/html",
  "text/css",
  "text/javascript",
  "text/xml",
  // Code
  "text/x-c",
  "text/x-c++",
  "text/x-python",
  "text/x-java",
  "text/x-rust",
  "text/x-go",
  "text/x-sh",
  "text/x-ruby",
  "text/x-php",
  "text/x-swift",
  "text/x-kotlin",
  "text/x-typescript",
  // Application text
  "application/json",
  "application/javascript",
  "application/typescript",
  "application/xml",
  "application/x-httpd-php",
  "application/x-sh",
  "application/x-yaml",
  "application/yaml",
];

/**
 * All MIME types that can be converted to PDF
 */
export const ALL_CONVERTIBLE_TYPES = [
  ...CONVERTIBLE_IMAGE_TYPES,
  ...CONVERTIBLE_TEXT_TYPES,
];

/**
 * Check if a MIME type can be converted to PDF
 */
export function canConvertToPdf(mimeType: string): boolean {
  return ALL_CONVERTIBLE_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Check if a MIME type is a text/code type
 */
export function isTextType(mimeType: string): boolean {
  return CONVERTIBLE_TEXT_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Unified converter — routes to image or text converter based on MIME type
 */
export async function convertFileToPdf(
  fileBuffer: Buffer,
  mimeType: string,
  originalFileName: string
): Promise<{ pdfBuffer: Buffer; newFileName: string }> {
  if (isTextType(mimeType)) {
    return convertTextToPdf(fileBuffer, originalFileName);
  }
  return convertImageToPdf(fileBuffer, mimeType, originalFileName);
}

/**
 * Convert an image buffer to PDF
 */
export async function convertImageToPdf(
  imageBuffer: Buffer,
  mimeType: string,
  originalFileName: string
): Promise<{ pdfBuffer: Buffer; newFileName: string }> {
  console.log(`[PDFConverter] Converting image ${originalFileName} (${mimeType}) to PDF`);

  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Convert to PNG for consistent handling
    const processedImage = await image.png().toBuffer();

    const width = metadata.width || 612;
    const height = metadata.height || 792;

    const maxWidth = 612;
    const maxHeight = 792;

    let pdfWidth = width;
    let pdfHeight = height;

    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      pdfWidth = Math.round(width * scale);
      pdfHeight = Math.round(height * scale);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [pdfWidth, pdfHeight],
        margin: 0,
        info: {
          Title: originalFileName,
          Creator: "DocuSafe",
          Producer: "DocuSafe PDF Converter",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        const newFileName = originalFileName.replace(/\.[^.]+$/, ".pdf");
        console.log(`[PDFConverter] Image PDF generated: ${pdfBuffer.length} bytes`);
        resolve({ pdfBuffer, newFileName });
      });
      doc.on("error", (error: Error) => {
        console.error("[PDFConverter] Image PDF error:", error);
        reject(error);
      });

      doc.image(processedImage, 0, 0, { width: pdfWidth, height: pdfHeight });
      doc.end();
    });
  } catch (error) {
    console.error("[PDFConverter] Image conversion error:", error);
    throw new Error(
      `Failed to convert image to PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Convert a text/code file buffer to PDF using pdf-lib (pure JS, no AFM files needed).
 * Renders with Courier monospace font, line numbers, and page footers.
 */
export async function convertTextToPdf(
  textBuffer: Buffer,
  originalFileName: string
): Promise<{ pdfBuffer: Buffer; newFileName: string }> {
  console.log(`[PDFConverter] Converting text ${originalFileName} to PDF`);

  // Keep printable ASCII + common whitespace; replace everything else with '?'
  const rawText = textBuffer.toString("utf-8");
  const text = rawText.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
  const lines = text.split(/\r?\n/);
  const newFileName = originalFileName.replace(/\.[^.]+$/, ".pdf");

  const pdfDoc = await PdfLib.create();
  pdfDoc.setTitle(originalFileName);
  pdfDoc.setCreator("DocuSafe");
  pdfDoc.setProducer("DocuSafe PDF Converter");

  const font     = await pdfDoc.embedFont(StandardFonts.Courier);
  const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // A4 dimensions in points
  const pageWidth  = 595.28;
  const pageHeight = 841.89;
  const margin     = 50;
  const fontSize   = 8.5;
  const lineHeight = fontSize * 1.35;

  const headerH   = 26; // height consumed by header + separator
  const footerH   = 16; // height consumed by footer
  const bodyTop   = pageHeight - margin - headerH;
  const bodyBottom = margin + footerH;
  const linesPerPage = Math.floor((bodyTop - bodyBottom) / lineHeight);

  const lineNumWidth = String(lines.length).length;
  const totalPages   = Math.max(1, Math.ceil(lines.length / linesPerPage));
  const contentWidth = pageWidth - margin * 2;

  for (let p = 0; p < totalPages; p++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // ── Header ──────────────────────────────────────────────────────────────
    page.drawText(originalFileName, {
      x: margin,
      y: pageHeight - margin - 10,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: contentWidth,
    });
    page.drawLine({
      start: { x: margin, y: pageHeight - margin - 18 },
      end:   { x: pageWidth - margin, y: pageHeight - margin - 18 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    // ── Code lines ──────────────────────────────────────────────────────────
    const startLine = p * linesPerPage;
    const endLine   = Math.min(startLine + linesPerPage, lines.length);

    for (let i = startLine; i < endLine; i++) {
      const lineNum = String(i + 1).padStart(lineNumWidth, " ");
      const fullLine = `${lineNum}  ${lines[i] ?? ""}`;

      // Truncate lines that would overflow the page width (≈ 600px / 5.1pt per char at 8.5pt)
      const maxChars = Math.floor(contentWidth / font.widthOfTextAtSize(" ", fontSize));
      const displayLine = fullLine.length > maxChars
        ? fullLine.slice(0, maxChars - 1) + "\u2026"
        : fullLine;

      page.drawText(displayLine, {
        x: margin,
        y: bodyTop - (i - startLine) * lineHeight,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    // ── Page footer ──────────────────────────────────────────────────────────
    const label     = `${p + 1} / ${totalPages}`;
    const labelW    = font.widthOfTextAtSize(label, 7);
    page.drawText(label, {
      x: pageWidth - margin - labelW,
      y: margin - 5,
      size: 7,
      font,
      color: rgb(0.67, 0.67, 0.67),
    });
  }

  const pdfBytes = await pdfDoc.save();
  console.log(`[PDFConverter] Text PDF generated: ${pdfBytes.length} bytes`);
  return { pdfBuffer: Buffer.from(pdfBytes), newFileName };
}

/**
 * Get the output filename for a converted file
 */
export function getPdfFileName(originalFileName: string): string {
  return originalFileName.replace(/\.[^.]+$/, ".pdf");
}
