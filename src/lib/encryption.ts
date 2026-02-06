import crypto from "crypto";

// Algorithme de chiffrement AES-256-GCM (authentifié)
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const KEY_LENGTH = 32; // 256 bits pour AES-256

// Clé maître depuis les variables d'environnement
function getMasterKey(): string {
  const key = process.env.ENCRYPTION_MASTER_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_MASTER_KEY environment variable is required");
  }
  return key;
}

/**
 * Génère une clé de chiffrement unique pour un utilisateur
 * Cette clé sera stockée chiffrée dans la base de données
 */
export function generateUserEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("base64");
}

/**
 * Dérive une clé à partir de la clé maître et d'un sel
 * Utilise PBKDF2 pour la dérivation de clé
 */
function deriveKey(salt: Buffer): Buffer {
  const masterKeyBuffer = Buffer.from(getMasterKey(), "utf-8");
  return crypto.pbkdf2Sync(masterKeyBuffer, salt, 100000, KEY_LENGTH, "sha256");
}

/**
 * Chiffre la clé utilisateur avec la clé maître
 * Format: salt (32 bytes) + iv (16 bytes) + authTag (16 bytes) + encryptedData
 */
export function encryptUserKey(userKey: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = deriveKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(userKey, "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Combine salt + iv + authTag + encrypted
  const result = Buffer.concat([salt, iv, authTag, encrypted]);
  return result.toString("base64");
}

/**
 * Déchiffre la clé utilisateur avec la clé maître
 */
export function decryptUserKey(encryptedUserKey: string): string {
  const data = Buffer.from(encryptedUserKey, "base64");

  // Extraire les composants
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  const derivedKey = deriveKey(salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}

/**
 * Chiffre un document avec la clé utilisateur
 * Format: iv (16 bytes) + authTag (16 bytes) + encryptedData
 */
export function encryptDocument(
  data: Buffer,
  userEncryptionKey: string
): Buffer {
  const key = Buffer.from(userEncryptionKey, "base64");
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Déchiffre un document avec la clé utilisateur
 */
export function decryptDocument(
  encryptedData: Buffer,
  userEncryptionKey: string
): Buffer {
  const key = Buffer.from(userEncryptionKey, "base64");

  // Extraire les composants
  const iv = encryptedData.subarray(0, IV_LENGTH);
  const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = encryptedData.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Chiffre un document avec streaming pour les gros fichiers
 * Retourne un Transform stream
 */
export function createEncryptStream(userEncryptionKey: string): {
  stream: crypto.CipherGCM;
  iv: Buffer;
  getAuthTag: () => Buffer;
} {
  const key = Buffer.from(userEncryptionKey, "base64");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  return {
    stream: cipher,
    iv,
    getAuthTag: () => cipher.getAuthTag(),
  };
}

/**
 * Déchiffre un document avec streaming pour les gros fichiers
 */
export function createDecryptStream(
  userEncryptionKey: string,
  iv: Buffer,
  authTag: Buffer
): crypto.DecipherGCM {
  const key = Buffer.from(userEncryptionKey, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher;
}

/**
 * Vérifie si un document est chiffré (par son préfixe)
 * Les documents chiffrés commencent par un marqueur spécifique
 */
export const ENCRYPTION_MARKER = Buffer.from("DOCUSAFE_ENC_V1");

export function isEncrypted(data: Buffer): boolean {
  if (data.length < ENCRYPTION_MARKER.length) return false;
  return data.subarray(0, ENCRYPTION_MARKER.length).equals(ENCRYPTION_MARKER);
}

/**
 * Ajoute le marqueur de chiffrement
 */
export function addEncryptionMarker(encryptedData: Buffer): Buffer {
  return Buffer.concat([ENCRYPTION_MARKER, encryptedData]);
}

/**
 * Retire le marqueur de chiffrement
 */
export function removeEncryptionMarker(data: Buffer): Buffer {
  if (!isEncrypted(data)) {
    throw new Error("Data is not encrypted or missing encryption marker");
  }
  return data.subarray(ENCRYPTION_MARKER.length);
}
