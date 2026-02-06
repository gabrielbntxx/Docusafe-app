/**
 * Folder Rules Processor
 *
 * Applies folder rules to uploaded files, such as converting images to PDF.
 */

import { db } from "./db";
import { parseFolderRules } from "@/types/folder-rules";
import { convertImageToPdf, canConvertToPdf } from "./pdf-converter";

/**
 * Result of processing a file through folder rules
 */
export type ProcessedFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  wasConverted: boolean;
  originalFileName?: string;
  originalMimeType?: string;
};

/**
 * Apply folder rules to a file
 *
 * @param folderId - The folder ID (null if uploading to root)
 * @param fileBuffer - The file content
 * @param fileName - The original filename
 * @param mimeType - The file MIME type
 * @returns The processed file (may be converted or unchanged)
 */
export async function applyFolderRules(
  folderId: string | null,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ProcessedFile> {
  // If no folder specified, return original file
  if (!folderId) {
    return {
      buffer: fileBuffer,
      fileName,
      mimeType,
      wasConverted: false,
    };
  }

  try {
    // Fetch folder with rules
    const folder = await db.folder.findUnique({
      where: { id: folderId },
      select: { rules: true, name: true },
    });

    if (!folder || !folder.rules) {
      return {
        buffer: fileBuffer,
        fileName,
        mimeType,
        wasConverted: false,
      };
    }

    const rules = parseFolderRules(folder.rules);

    // Check if convert to PDF rule is enabled
    if (rules.convertToPdf?.enabled) {
      const sourceTypes = rules.convertToPdf.sourceTypes;

      // Check if this file type should be converted
      if (sourceTypes.includes(mimeType) && canConvertToPdf(mimeType)) {
        console.log(`[FolderRules] Converting ${fileName} to PDF (folder: ${folder.name})`);

        try {
          const { pdfBuffer, newFileName } = await convertImageToPdf(
            fileBuffer,
            mimeType,
            fileName
          );

          return {
            buffer: pdfBuffer,
            fileName: newFileName,
            mimeType: "application/pdf",
            wasConverted: true,
            originalFileName: fileName,
            originalMimeType: mimeType,
          };
        } catch (conversionError) {
          console.error("[FolderRules] Conversion failed, keeping original:", conversionError);
          // On conversion failure, return original file
          return {
            buffer: fileBuffer,
            fileName,
            mimeType,
            wasConverted: false,
          };
        }
      }
    }

    // Future: Add other rules here (autoRename, autoTag, compress, etc.)

    // No rules applied, return original
    return {
      buffer: fileBuffer,
      fileName,
      mimeType,
      wasConverted: false,
    };
  } catch (error) {
    console.error("[FolderRules] Error applying rules:", error);
    // On any error, return original file to avoid blocking upload
    return {
      buffer: fileBuffer,
      fileName,
      mimeType,
      wasConverted: false,
    };
  }
}

/**
 * Get folder rules by folder ID
 */
export async function getFolderRules(folderId: string) {
  const folder = await db.folder.findUnique({
    where: { id: folderId },
    select: { rules: true },
  });

  return folder ? parseFolderRules(folder.rules) : null;
}
