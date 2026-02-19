/**
 * PDF Converter Library
 *
 * Converts images and text/code files to PDF.
 * Images: uses sharp for processing + pdfkit for PDF generation.
 * Text/code: renders with monospace font, line numbers, and page numbers.
 */

import sharp from "sharp";
import PDFDocument from "pdfkit";

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
 * Convert a text/code file buffer to PDF
 * Renders with monospace font, line numbers, and page footers.
 */
export async function convertTextToPdf(
  textBuffer: Buffer,
  originalFileName: string
): Promise<{ pdfBuffer: Buffer; newFileName: string }> {
  console.log(`[PDFConverter] Converting text ${originalFileName} to PDF`);

  // Decode UTF-8, replace characters that PDFKit's built-in Courier can't render
  const rawText = textBuffer.toString("utf-8");
  // Keep printable ASCII + common whitespace; replace the rest with '?'
  const text = rawText.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
  const lines = text.split(/\r?\n/);
  const newFileName = originalFileName.replace(/\.[^.]+$/, ".pdf");

  return new Promise((resolve, reject) => {
    const margin = 50;
    const fontSize = 8.5;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = new (PDFDocument as any)({
      size: "A4",
      margins: { top: margin, bottom: margin + 20, left: margin, right: margin },
      bufferPages: true,
      info: {
        Title: originalFileName,
        Creator: "DocuSafe",
        Producer: "DocuSafe PDF Converter",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      console.log(`[PDFConverter] Text PDF generated: ${Buffer.concat(chunks).length} bytes`);
      resolve({ pdfBuffer: Buffer.concat(chunks), newFileName });
    });
    doc.on("error", (error: Error) => {
      console.error("[PDFConverter] Text PDF error:", error);
      reject(error);
    });

    const pageWidth: number = doc.page.width;
    const pageHeight: number = doc.page.height;
    const contentWidth = pageWidth - margin * 2;
    const lineNumWidth = String(lines.length).length;
    const bottomBoundary = pageHeight - margin - 20;

    // ── Header ──────────────────────────────────────────────────────────────
    doc.font("Courier-Bold").fontSize(10).fillColor("#333333")
      .text(originalFileName, margin, margin, { width: contentWidth, lineBreak: false });

    const headerBottom: number = doc.y + 6;
    doc.moveTo(margin, headerBottom)
      .lineTo(pageWidth - margin, headerBottom)
      .strokeColor("#cccccc")
      .lineWidth(0.5)
      .stroke();

    doc.y = headerBottom + 10;

    // ── Code lines ──────────────────────────────────────────────────────────
    doc.font("Courier").fontSize(fontSize).fillColor("#333333");

    for (let i = 0; i < lines.length; i++) {
      if (doc.y >= bottomBoundary) {
        doc.addPage();
        doc.font("Courier").fontSize(fontSize).fillColor("#333333");
      }

      const lineNum = String(i + 1).padStart(lineNumWidth, " ");
      const fullLine = `${lineNum}  ${lines[i] ?? ""}`;

      doc.text(fullLine, margin, doc.y, {
        width: contentWidth,
        lineBreak: false,
        ellipsis: true,
      });
    }

    // ── Page numbers ────────────────────────────────────────────────────────
    const totalPages: number = doc.bufferedPageRange().count;
    for (let p = 0; p < totalPages; p++) {
      doc.switchToPage(p);
      doc.font("Courier").fontSize(7).fillColor("#aaaaaa")
        .text(
          `${p + 1} / ${totalPages}`,
          margin,
          pageHeight - margin + 5,
          { width: contentWidth, align: "right", lineBreak: false }
        );
    }

    doc.end();
  });
}

/**
 * Get the output filename for a converted file
 */
export function getPdfFileName(originalFileName: string): string {
  return originalFileName.replace(/\.[^.]+$/, ".pdf");
}
