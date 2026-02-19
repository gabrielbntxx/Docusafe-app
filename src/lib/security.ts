import { headers } from "next/headers";

// ============================================
// CONFIGURATION
// ============================================

// Types MIME autorisés avec leurs signatures (magic bytes)
export const ALLOWED_FILE_TYPES = {
  // === PDF ===
  "application/pdf": {
    extensions: [".pdf"],
    magicBytes: [0x25, 0x50, 0x44, 0x46], // %PDF
    maxSize: 100 * 1024 * 1024, // 100MB
  },

  // === Images ===
  "image/jpeg": {
    extensions: [".jpg", ".jpeg"],
    magicBytes: [0xff, 0xd8, 0xff],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "image/png": {
    extensions: [".png"],
    magicBytes: [0x89, 0x50, 0x4e, 0x47],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "image/gif": {
    extensions: [".gif"],
    magicBytes: [0x47, 0x49, 0x46, 0x38], // GIF8
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "image/webp": {
    extensions: [".webp"],
    magicBytes: [0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "image/svg+xml": {
    extensions: [".svg"],
    magicBytes: [0x3c], // < (XML start)
    maxSize: 10 * 1024 * 1024, // 10MB
    skipMagicValidation: true,
  },
  "image/bmp": {
    extensions: [".bmp"],
    magicBytes: [0x42, 0x4d], // BM
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "image/tiff": {
    extensions: [".tiff", ".tif"],
    magicBytes: [0x49, 0x49], // II (little-endian) or MM (big-endian)
    maxSize: 100 * 1024 * 1024, // 100MB
    skipMagicValidation: true,
  },
  "image/heic": {
    extensions: [".heic", ".heif"],
    magicBytes: [0x00, 0x00, 0x00],
    maxSize: 100 * 1024 * 1024, // 100MB
    skipMagicValidation: true,
  },

  // === Audio formats ===
  "audio/mpeg": {
    extensions: [".mp3"],
    magicBytes: [0xff, 0xfb], // MP3 frame sync (or 0x49, 0x44, 0x33 for ID3)
    maxSize: 100 * 1024 * 1024, // 100MB
    alternateMagicBytes: [0x49, 0x44, 0x33], // ID3 tag
  },
  "audio/wav": {
    extensions: [".wav", ".wave"],
    magicBytes: [0x52, 0x49, 0x46, 0x46], // RIFF
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "audio/x-wav": {
    extensions: [".wav", ".wave"],
    magicBytes: [0x52, 0x49, 0x46, 0x46], // RIFF
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "audio/ogg": {
    extensions: [".ogg", ".oga"],
    magicBytes: [0x4f, 0x67, 0x67, 0x53], // OggS
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "audio/flac": {
    extensions: [".flac"],
    magicBytes: [0x66, 0x4c, 0x61, 0x43], // fLaC
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "audio/aac": {
    extensions: [".aac", ".m4a"],
    magicBytes: [0x00, 0x00, 0x00],
    maxSize: 100 * 1024 * 1024, // 100MB
    skipMagicValidation: true,
  },

  // === Video formats ===
  "video/mp4": {
    extensions: [".mp4", ".m4v"],
    magicBytes: [0x00, 0x00, 0x00], // MP4 starts with size bytes, then ftyp
    maxSize: 1024 * 1024 * 1024, // 1GB
    skipMagicValidation: true, // MP4 has variable header, skip magic byte check
  },
  "video/quicktime": {
    extensions: [".mov"],
    magicBytes: [0x00, 0x00, 0x00],
    maxSize: 1024 * 1024 * 1024, // 1GB
    skipMagicValidation: true,
  },
  "video/webm": {
    extensions: [".webm"],
    magicBytes: [0x1a, 0x45, 0xdf, 0xa3], // EBML header
    maxSize: 1024 * 1024 * 1024, // 1GB
  },
  "video/x-msvideo": {
    extensions: [".avi"],
    magicBytes: [0x52, 0x49, 0x46, 0x46], // RIFF
    maxSize: 1024 * 1024 * 1024, // 1GB
  },
  "video/x-matroska": {
    extensions: [".mkv"],
    magicBytes: [0x1a, 0x45, 0xdf, 0xa3], // EBML header
    maxSize: 1024 * 1024 * 1024, // 1GB
  },

  // === Microsoft Office Documents ===
  "application/msword": {
    extensions: [".doc"],
    magicBytes: [0xd0, 0xcf, 0x11, 0xe0], // OLE compound document
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extensions: [".docx"],
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP (OOXML)
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "application/vnd.ms-excel": {
    extensions: [".xls"],
    magicBytes: [0xd0, 0xcf, 0x11, 0xe0], // OLE compound document
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    extensions: [".xlsx"],
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP (OOXML)
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "application/vnd.ms-powerpoint": {
    extensions: [".ppt"],
    magicBytes: [0xd0, 0xcf, 0x11, 0xe0], // OLE compound document
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    extensions: [".pptx"],
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP (OOXML)
    maxSize: 100 * 1024 * 1024, // 100MB
  },

  // === Apple iWork Documents ===
  "application/vnd.apple.pages": {
    extensions: [".pages"],
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "application/vnd.apple.numbers": {
    extensions: [".numbers"],
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  "application/vnd.apple.keynote": {
    extensions: [".key"],
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP
    maxSize: 100 * 1024 * 1024, // 100MB
  },

  // === Text and Document formats ===
  "text/plain": {
    extensions: [".txt", ".text", ".log"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/csv": {
    extensions: [".csv"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "application/rtf": {
    extensions: [".rtf"],
    magicBytes: [0x7b, 0x5c, 0x72, 0x74, 0x66], // {\rtf
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  "text/markdown": {
    extensions: [".md", ".markdown"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },

  // === Code files ===
  "text/x-python": {
    extensions: [".py", ".pyw"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-c": {
    extensions: [".c", ".h"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-c++": {
    extensions: [".cpp", ".hpp", ".cc", ".cxx"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/javascript": {
    extensions: [".js", ".mjs"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/typescript": {
    extensions: [".ts", ".tsx"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-java": {
    extensions: [".java"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-csharp": {
    extensions: [".cs"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-go": {
    extensions: [".go"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-rust": {
    extensions: [".rs"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-ruby": {
    extensions: [".rb"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-php": {
    extensions: [".php"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-swift": {
    extensions: [".swift"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-kotlin": {
    extensions: [".kt", ".kts"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/html": {
    extensions: [".html", ".htm"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/css": {
    extensions: [".css", ".scss", ".sass", ".less"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "application/json": {
    extensions: [".json"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "application/xml": {
    extensions: [".xml"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-yaml": {
    extensions: [".yaml", ".yml"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "application/x-sh": {
    extensions: [".sh", ".bash"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },
  "text/x-sql": {
    extensions: [".sql"],
    magicBytes: [],
    maxSize: 50 * 1024 * 1024, // 50MB
    skipMagicValidation: true,
  },

  // === Archives (for reference, not extraction) ===
  "application/zip": {
    extensions: [".zip"],
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // PK
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  "application/x-rar-compressed": {
    extensions: [".rar"],
    magicBytes: [0x52, 0x61, 0x72, 0x21], // Rar!
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  "application/x-7z-compressed": {
    extensions: [".7z"],
    magicBytes: [0x37, 0x7a, 0xbc, 0xaf], // 7z
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  "application/gzip": {
    extensions: [".gz", ".gzip"],
    magicBytes: [0x1f, 0x8b],
    maxSize: 500 * 1024 * 1024, // 500MB
  },
} as const;

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  upload: {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
  pinVerify: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  emailVerify: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  resendCode: {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
  sharedAccess: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
  forgotPassword: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  resetPassword: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
};

// In-memory rate limit store (pour production, utiliser Redis)
const rateLimitStore = new Map<
  string,
  { attempts: number; firstAttempt: number; blockedUntil?: number }
>();

// ============================================
// FILE VALIDATION
// ============================================

/**
 * Valide le type MIME réel d'un fichier en vérifiant ses magic bytes
 */
export function validateFileMagicBytes(
  buffer: Buffer,
  declaredMimeType: string
): { valid: boolean; detectedType?: string; error?: string } {
  const fileConfig =
    ALLOWED_FILE_TYPES[declaredMimeType as keyof typeof ALLOWED_FILE_TYPES];

  if (!fileConfig) {
    return {
      valid: false,
      error: `Type MIME non autorisé: ${declaredMimeType}`,
    };
  }

  // Skip magic byte validation for certain formats (like MP4 with variable headers)
  if ("skipMagicValidation" in fileConfig && fileConfig.skipMagicValidation) {
    return { valid: true };
  }

  // Vérifier les magic bytes
  const magicBytes = fileConfig.magicBytes;
  const fileHeader = buffer.slice(0, magicBytes.length);

  let matches = magicBytes.every(
    (byte, index) => fileHeader[index] === byte
  );

  // Check alternate magic bytes if primary doesn't match (e.g., MP3 with ID3 tag)
  if (!matches && "alternateMagicBytes" in fileConfig && fileConfig.alternateMagicBytes) {
    const altMagicBytes = fileConfig.alternateMagicBytes as readonly number[];
    const altFileHeader = buffer.slice(0, altMagicBytes.length);
    matches = altMagicBytes.every(
      (byte, index) => altFileHeader[index] === byte
    );
  }

  if (!matches) {
    // Essayer de détecter le vrai type
    const detectedType = detectFileType(buffer);
    return {
      valid: false,
      detectedType,
      error: `Le contenu du fichier ne correspond pas au type déclaré (${declaredMimeType})`,
    };
  }

  return { valid: true };
}

/**
 * Détecte le type de fichier à partir de ses magic bytes
 */
function detectFileType(buffer: Buffer): string | undefined {
  for (const [mimeType, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    const magicBytes = config.magicBytes;
    const fileHeader = buffer.slice(0, magicBytes.length);
    const matches = magicBytes.every(
      (byte, index) => fileHeader[index] === byte
    );
    if (matches) {
      return mimeType;
    }
  }
  return undefined;
}

/**
 * Valide la taille du fichier selon son type
 */
export function validateFileSize(
  size: number,
  mimeType: string
): { valid: boolean; error?: string; maxSize?: number } {
  const fileConfig =
    ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];

  if (!fileConfig) {
    return { valid: false, error: "Type de fichier non reconnu" };
  }

  if (size > fileConfig.maxSize) {
    const maxSizeMB = fileConfig.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `Le fichier dépasse la taille maximale autorisée (${maxSizeMB}MB)`,
      maxSize: fileConfig.maxSize,
    };
  }

  return { valid: true };
}

/**
 * Valide l'extension du fichier
 */
export function validateFileExtension(
  filename: string,
  mimeType: string
): { valid: boolean; error?: string } {
  const fileConfig =
    ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];

  if (!fileConfig) {
    return { valid: false, error: "Type de fichier non reconnu" };
  }

  const extension = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (!fileConfig.extensions.includes(extension as never)) {
    return {
      valid: false,
      error: `Extension de fichier invalide. Attendu: ${fileConfig.extensions.join(", ")}`,
    };
  }

  return { valid: true };
}

// ============================================
// FILENAME SANITIZATION
// ============================================

/**
 * Caractères dangereux à supprimer des noms de fichiers
 */
const DANGEROUS_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;
const MULTIPLE_DOTS = /\.{2,}/g;
const MULTIPLE_SPACES = /\s{2,}/g;
const LEADING_TRAILING_DOTS_SPACES = /^[\s.]+|[\s.]+$/g;

/**
 * Noms de fichiers réservés sur Windows
 */
const RESERVED_NAMES = [
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

/**
 * Sanitize un nom de fichier pour le rendre sûr
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return `file_${Date.now()}`;
  }

  // Séparer le nom et l'extension
  const lastDot = filename.lastIndexOf(".");
  let name = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  let extension = lastDot > 0 ? filename.slice(lastDot) : "";

  // Nettoyer le nom
  name = name
    .replace(DANGEROUS_CHARS, "")
    .replace(MULTIPLE_DOTS, ".")
    .replace(MULTIPLE_SPACES, " ")
    .replace(LEADING_TRAILING_DOTS_SPACES, "")
    .trim();

  // Nettoyer l'extension
  extension = extension
    .toLowerCase()
    .replace(DANGEROUS_CHARS, "")
    .replace(MULTIPLE_DOTS, ".");

  // Vérifier les noms réservés
  const upperName = name.toUpperCase();
  if (RESERVED_NAMES.includes(upperName)) {
    name = `_${name}`;
  }

  // Limiter la longueur
  const maxNameLength = 200;
  if (name.length > maxNameLength) {
    name = name.slice(0, maxNameLength);
  }

  // Si le nom est vide après sanitization
  if (!name) {
    name = `file_${Date.now()}`;
  }

  return `${name}${extension}`;
}

/**
 * Génère un nom de fichier unique avec UUID
 */
export function generateSecureFilename(
  originalFilename: string,
  userId: string
): string {
  const sanitized = sanitizeFilename(originalFilename);
  const extension = sanitized.slice(sanitized.lastIndexOf("."));
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `${userId}_${timestamp}_${random}${extension}`;
}

// ============================================
// RATE LIMITING
// ============================================

/**
 * Obtient l'identifiant client (IP ou user ID)
 */
export async function getClientIdentifier(userId?: string): Promise<string> {
  if (userId) {
    return `user_${userId}`;
  }

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  return `ip_${ip}`;
}

/**
 * Nettoie les entrées expirées du store
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    // Supprimer si le blocage est expiré et la fenêtre aussi
    if (
      (!data.blockedUntil || data.blockedUntil < now) &&
      now - data.firstAttempt > 60 * 60 * 1000 // 1 heure
    ) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Vérifie et applique le rate limiting
 */
export function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMIT_CONFIG
): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  error?: string;
} {
  const config = RATE_LIMIT_CONFIG[action];
  const key = `${action}_${identifier}`;
  const now = Date.now();

  // Nettoyer périodiquement (1% des requêtes)
  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }

  let data = rateLimitStore.get(key);

  // Vérifier si bloqué
  if (data?.blockedUntil && data.blockedUntil > now) {
    const resetIn = Math.ceil((data.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
      error: `Trop de tentatives. Réessayez dans ${formatDuration(resetIn)}`,
    };
  }

  // Réinitialiser si la fenêtre est expirée
  if (!data || now - data.firstAttempt > config.windowMs) {
    data = { attempts: 0, firstAttempt: now };
  }

  // Incrémenter les tentatives
  data.attempts++;

  // Vérifier la limite
  if (data.attempts > config.maxAttempts) {
    data.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(key, data);

    const resetIn = Math.ceil(config.blockDurationMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
      error: `Trop de tentatives. Réessayez dans ${formatDuration(resetIn)}`,
    };
  }

  rateLimitStore.set(key, data);

  const remaining = config.maxAttempts - data.attempts;
  const resetIn = Math.ceil((data.firstAttempt + config.windowMs - now) / 1000);

  return {
    allowed: true,
    remaining,
    resetIn,
  };
}

/**
 * Réinitialise le rate limit pour un identifiant (ex: après login réussi)
 */
export function resetRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMIT_CONFIG
): void {
  const key = `${action}_${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Formate une durée en secondes en texte lisible
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconde${seconds > 1 ? "s" : ""}`;
  }
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `${hours} heure${hours > 1 ? "s" : ""}`;
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Valide une adresse email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email requis" };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { valid: false, error: "Email trop long" };
  }

  // Regex basique mais robuste pour les emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Format d'email invalide" };
  }

  return { valid: true };
}

/**
 * Valide un mot de passe
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Mot de passe requis" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 8 caractères" };
  }

  if (password.length > 128) {
    return { valid: false, error: "Le mot de passe est trop long" };
  }

  // Vérifier la complexité
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLowercase || !hasUppercase || !hasNumber) {
    return {
      valid: false,
      error: "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
    };
  }

  return { valid: true };
}

/**
 * Valide un nom d'utilisateur
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Nom requis" };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: "Le nom doit contenir au moins 2 caractères" };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Le nom est trop long" };
  }

  // Vérifier les caractères dangereux
  if (/<|>|script|javascript/i.test(trimmed)) {
    return { valid: false, error: "Le nom contient des caractères non autorisés" };
  }

  return { valid: true };
}

/**
 * Valide un PIN (4 chiffres)
 */
export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (!pin || typeof pin !== "string") {
    return { valid: false, error: "PIN requis" };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, error: "Le PIN doit contenir exactement 4 chiffres" };
  }

  // Vérifier les PIN trop simples
  const simplePins = ["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1234", "4321"];
  if (simplePins.includes(pin)) {
    return { valid: false, error: "Ce PIN est trop simple" };
  }

  return { valid: true };
}

/**
 * Valide un numéro de téléphone (format international)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Numéro de téléphone requis" };
  }

  const trimmed = phone.trim();

  // Format international: +{country_code}{number}, 7-15 digits total
  const phoneRegex = /^\+[1-9]\d{6,14}$/;

  if (!phoneRegex.test(trimmed)) {
    return {
      valid: false,
      error: "Format invalide. Utilisez le format international (ex: +33612345678)",
    };
  }

  return { valid: true };
}

// ============================================
// COMPREHENSIVE FILE VALIDATION
// ============================================

/**
 * Get MIME type from file extension
 */
function getMimeTypeFromExtension(filename: string): string | null {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  for (const [mimeType, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    if ((config.extensions as readonly string[]).includes(ext)) {
      return mimeType;
    }
  }
  return null;
}

/**
 * Valide un fichier de manière complète
 */
export async function validateFile(
  file: File,
  buffer: Buffer
): Promise<{
  valid: boolean;
  sanitizedName: string;
  effectiveMimeType: string;
  errors: string[];
}> {
  const errors: string[] = [];

  // Determine the effective MIME type (browser might not detect it correctly)
  let effectiveMimeType = file.type;

  // If browser didn't detect the type, try to determine from extension
  if (!effectiveMimeType || effectiveMimeType === "application/octet-stream") {
    const detectedMimeType = getMimeTypeFromExtension(file.name);
    if (detectedMimeType) {
      effectiveMimeType = detectedMimeType;
    }
  }

  // 1. Vérifier que le type MIME est autorisé
  if (!(effectiveMimeType in ALLOWED_FILE_TYPES)) {
    // Check if extension is known even if MIME isn't
    const extensionMime = getMimeTypeFromExtension(file.name);
    if (extensionMime && extensionMime in ALLOWED_FILE_TYPES) {
      effectiveMimeType = extensionMime;
    } else {
      errors.push(
        `Type de fichier non autorisé: ${file.type || "inconnu"}. Types acceptés: PDF, Images, Documents Office/Pages, Audio, Vidéo, Fichiers de code, Archives`
      );
    }
  }

  // Skip further validation if type is not allowed
  if (errors.length > 0) {
    const sanitizedName = sanitizeFilename(file.name);
    return { valid: false, sanitizedName, effectiveMimeType, errors };
  }

  // 2. Valider l'extension
  const extValidation = validateFileExtension(file.name, effectiveMimeType);
  if (!extValidation.valid && extValidation.error) {
    errors.push(extValidation.error);
  }

  // 3. Valider la taille
  const sizeValidation = validateFileSize(file.size, effectiveMimeType);
  if (!sizeValidation.valid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }

  // 4. Valider les magic bytes (contenu réel) - only for types that require it
  const fileConfig = ALLOWED_FILE_TYPES[effectiveMimeType as keyof typeof ALLOWED_FILE_TYPES];
  if (fileConfig && !("skipMagicValidation" in fileConfig && fileConfig.skipMagicValidation)) {
    const magicValidation = validateFileMagicBytes(buffer, effectiveMimeType);
    if (!magicValidation.valid && magicValidation.error) {
      // For text-based files, be more lenient
      const isTextBased = effectiveMimeType.startsWith("text/") ||
        effectiveMimeType === "application/json" ||
        effectiveMimeType === "application/xml";
      if (!isTextBased) {
        errors.push(magicValidation.error);
      }
    }
  }

  // 5. Sanitize le nom du fichier
  const sanitizedName = sanitizeFilename(file.name);

  return {
    valid: errors.length === 0,
    sanitizedName,
    effectiveMimeType,
    errors,
  };
}
