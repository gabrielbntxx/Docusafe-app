/**
 * Folder Rules Types
 *
 * Defines the structure for folder rules that can be applied
 * to automatically process files when uploaded to a folder.
 */

/**
 * Rule for converting files to PDF
 */
export type ConvertToPdfRule = {
  enabled: boolean;
  sourceTypes: string[]; // MIME types that should be converted
};

/**
 * All folder rules
 * Extensible structure for future rules
 */
export type FolderRules = {
  convertToPdf?: ConvertToPdfRule;
  // Future rules can be added here:
  // autoRename?: { enabled: boolean; pattern: string };
  // autoTag?: { enabled: boolean; tags: string[] };
  // compress?: { enabled: boolean; quality: number };
};

/**
 * Default empty rules
 */
export const DEFAULT_FOLDER_RULES: FolderRules = {};

/**
 * Default settings for the Convert to PDF rule
 */
export const DEFAULT_CONVERT_TO_PDF_RULE: ConvertToPdfRule = {
  enabled: false,
  sourceTypes: [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/tiff",
    "image/bmp",
    "image/avif",
    "image/svg+xml",
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
  ],
};

/**
 * Parse folder rules from JSON string
 */
export function parseFolderRules(rulesJson: string | null | undefined): FolderRules {
  if (!rulesJson) return DEFAULT_FOLDER_RULES;
  try {
    return JSON.parse(rulesJson) as FolderRules;
  } catch {
    console.warn("[FolderRules] Failed to parse rules JSON:", rulesJson);
    return DEFAULT_FOLDER_RULES;
  }
}

/**
 * Stringify folder rules to JSON
 */
export function stringifyFolderRules(rules: FolderRules): string {
  return JSON.stringify(rules);
}

/**
 * Check if a folder has any active rules
 */
export function hasActiveRules(rules: FolderRules): boolean {
  if (rules.convertToPdf?.enabled) return true;
  // Add checks for future rules here
  return false;
}
