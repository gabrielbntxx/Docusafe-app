/**
 * PDF Converter Library
 *
 * Converts images to PDF using sharp for image processing
 * and pdfkit for PDF generation.
 */

import sharp from "sharp";
import PDFDocument from "pdfkit";

/**
 * Supported image MIME types for conversion
 */
export const CONVERTIBLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Check if a MIME type can be converted to PDF
 */
export function canConvertToPdf(mimeType: string): boolean {
  return CONVERTIBLE_IMAGE_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Convert an image buffer to PDF
 *
 * @param imageBuffer - The original image buffer
 * @param mimeType - The MIME type of the image
 * @param originalFileName - The original filename (used to generate new name)
 * @returns Object containing the PDF buffer and new filename
 */
export async function convertImageToPdf(
  imageBuffer: Buffer,
  mimeType: string,
  originalFileName: string
): Promise<{ pdfBuffer: Buffer; newFileName: string }> {
  console.log(`[PDFConverter] Converting ${originalFileName} (${mimeType}) to PDF`);

  try {
    // 1. Process image with sharp to get metadata and normalize format
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Convert to PNG for consistent handling (preserves transparency)
    const processedImage = await image.png().toBuffer();

    // 2. Get image dimensions
    const width = metadata.width || 612;
    const height = metadata.height || 792;

    console.log(`[PDFConverter] Image dimensions: ${width}x${height}`);

    // 3. Calculate PDF page size
    // Use image dimensions but cap at reasonable page size
    const maxWidth = 612; // Letter width in points (8.5 inches * 72)
    const maxHeight = 792; // Letter height in points (11 inches * 72)

    let pdfWidth = width;
    let pdfHeight = height;

    // Scale down if image is too large
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      pdfWidth = Math.round(width * scale);
      pdfHeight = Math.round(height * scale);
      console.log(`[PDFConverter] Scaled to: ${pdfWidth}x${pdfHeight}`);
    }

    // 4. Generate PDF
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
        console.log(`[PDFConverter] PDF generated: ${pdfBuffer.length} bytes`);
        resolve({ pdfBuffer, newFileName });
      });
      doc.on("error", (error: Error) => {
        console.error("[PDFConverter] PDF generation error:", error);
        reject(error);
      });

      // Embed image in PDF
      doc.image(processedImage, 0, 0, {
        width: pdfWidth,
        height: pdfHeight,
      });

      doc.end();
    });
  } catch (error) {
    console.error("[PDFConverter] Conversion error:", error);
    throw new Error(
      `Failed to convert image to PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get the output filename for a converted file
 */
export function getPdfFileName(originalFileName: string): string {
  return originalFileName.replace(/\.[^.]+$/, ".pdf");
}
