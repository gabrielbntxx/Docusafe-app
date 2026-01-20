/**
 * Script d'audit de sécurité pour DocuSafe
 * Exécuter avec: npx ts-node scripts/security-audit.ts
 */

import {
  validateFileMagicBytes,
  validateFileSize,
  validateFileExtension,
  sanitizeFilename,
  validateEmail,
  validatePassword,
  validateName,
  validatePin,
  checkRateLimit,
  resetRateLimit,
} from "../src/lib/security";

// Couleurs pour le terminal
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => boolean): void {
  try {
    const result = fn();
    if (result) {
      console.log(`${GREEN}✓${RESET} ${name}`);
      passed++;
    } else {
      console.log(`${RED}✗${RESET} ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`${RED}✗${RESET} ${name} - Error: ${error}`);
    failed++;
  }
}

function section(title: string): void {
  console.log(`\n${BOLD}${YELLOW}═══ ${title} ═══${RESET}\n`);
}

// ============================================
// TESTS DE VALIDATION DES FICHIERS
// ============================================

section("VALIDATION DES FICHIERS");

test("PDF valide accepté", () => {
  const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return validateFileMagicBytes(pdfBuffer, "application/pdf").valid;
});

test("Faux PDF rejeté (mauvais magic bytes)", () => {
  const fakeBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  return !validateFileMagicBytes(fakeBuffer, "application/pdf").valid;
});

test("JPEG valide accepté", () => {
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  return validateFileMagicBytes(jpegBuffer, "image/jpeg").valid;
});

test("PNG valide accepté", () => {
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  return validateFileMagicBytes(pngBuffer, "image/png").valid;
});

test("Type MIME non autorisé rejeté", () => {
  const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  return !validateFileMagicBytes(buffer, "application/javascript").valid;
});

test("EXE déguisé en PDF rejeté", () => {
  const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header
  return !validateFileMagicBytes(exeBuffer, "application/pdf").valid;
});

test("PDF > 50MB rejeté", () => {
  return !validateFileSize(60 * 1024 * 1024, "application/pdf").valid;
});

test("Image > 10MB rejetée", () => {
  return !validateFileSize(15 * 1024 * 1024, "image/png").valid;
});

// ============================================
// TESTS DE SANITISATION DES NOMS
// ============================================

section("SANITISATION DES NOMS DE FICHIERS");

test("Caractères dangereux supprimés", () => {
  const result = sanitizeFilename('file<script>"test.pdf');
  return !result.includes("<") && !result.includes('"');
});

test("Path traversal bloqué (../)", () => {
  const result = sanitizeFilename("../../../etc/passwd");
  return !result.includes("..");
});

test("Path traversal bloqué (..\\)", () => {
  const result = sanitizeFilename("..\\..\\windows\\system32");
  return !result.includes("..\\");
});

test("Noms Windows réservés préfixés", () => {
  const result = sanitizeFilename("CON.pdf");
  return result === "_CON.pdf";
});

test("Null bytes supprimés", () => {
  const result = sanitizeFilename("file\x00name.pdf");
  return !result.includes("\x00");
});

test("Longueur limitée à 204 caractères", () => {
  const longName = "a".repeat(300) + ".pdf";
  const result = sanitizeFilename(longName);
  return result.length <= 204;
});

test("Input vide géré", () => {
  const result = sanitizeFilename("");
  return result.startsWith("file_");
});

// ============================================
// TESTS DE VALIDATION DES INPUTS
// ============================================

section("VALIDATION DES INPUTS");

test("Email valide accepté", () => {
  return validateEmail("user@example.com").valid;
});

test("Email invalide rejeté", () => {
  return (
    !validateEmail("invalid").valid &&
    !validateEmail("@example.com").valid &&
    !validateEmail("user@").valid
  );
});

test("Email trop long rejeté", () => {
  const longEmail = "a".repeat(250) + "@example.com";
  return !validateEmail(longEmail).valid;
});

test("Mot de passe fort accepté", () => {
  return validatePassword("StrongPass123").valid;
});

test("Mot de passe faible rejeté (trop court)", () => {
  return !validatePassword("Ab1").valid;
});

test("Mot de passe faible rejeté (pas de majuscule)", () => {
  return !validatePassword("lowercase123").valid;
});

test("Mot de passe faible rejeté (pas de chiffre)", () => {
  return !validatePassword("NoNumbers").valid;
});

test("Nom avec XSS rejeté", () => {
  return !validateName("<script>alert('xss')</script>").valid;
});

test("Nom avec javascript: rejeté", () => {
  return !validateName("javascript:alert(1)").valid;
});

test("PIN simple rejeté (0000)", () => {
  return !validatePin("0000").valid;
});

test("PIN simple rejeté (1234)", () => {
  return !validatePin("1234").valid;
});

test("PIN valide accepté", () => {
  return validatePin("5739").valid;
});

// ============================================
// TESTS DE RATE LIMITING
// ============================================

section("RATE LIMITING");

test("Première requête autorisée", () => {
  resetRateLimit("test_first", "login");
  return checkRateLimit("test_first", "login").allowed;
});

test("Blocage après 5+ tentatives login", () => {
  resetRateLimit("test_block", "login");
  for (let i = 0; i < 6; i++) {
    checkRateLimit("test_block", "login");
  }
  return !checkRateLimit("test_block", "login").allowed;
});

test("Utilisateurs différents séparés", () => {
  resetRateLimit("user_a", "login");
  resetRateLimit("user_b", "login");
  for (let i = 0; i < 6; i++) {
    checkRateLimit("user_a", "login");
  }
  return checkRateLimit("user_b", "login").allowed;
});

test("Actions différentes séparées", () => {
  resetRateLimit("test_actions", "login");
  resetRateLimit("test_actions", "upload");
  for (let i = 0; i < 6; i++) {
    checkRateLimit("test_actions", "login");
  }
  return checkRateLimit("test_actions", "upload").allowed;
});

test("Reset fonctionne", () => {
  resetRateLimit("test_reset", "login");
  for (let i = 0; i < 3; i++) {
    checkRateLimit("test_reset", "login");
  }
  resetRateLimit("test_reset", "login");
  const result = checkRateLimit("test_reset", "login");
  return result.remaining === 4;
});

// ============================================
// TESTS D'ATTAQUES
// ============================================

section("SIMULATION D'ATTAQUES");

const pathTraversalAttacks = [
  "../../../etc/passwd",
  "..\\..\\..\\windows\\system32",
  "....//....//etc/passwd",
  "%2e%2e%2fetc%2fpasswd",
];

pathTraversalAttacks.forEach((attack, i) => {
  test(`Path traversal #${i + 1} bloqué`, () => {
    const result = sanitizeFilename(attack);
    return (
      !result.includes("..") &&
      !result.includes("etc") &&
      !result.includes("passwd") &&
      !result.includes("windows")
    );
  });
});

const xssAttacks = [
  "<script>alert('xss')</script>",
  "javascript:alert(1)",
  "<img src=x onerror=alert(1)>",
];

xssAttacks.forEach((attack, i) => {
  test(`XSS dans nom #${i + 1} rejeté`, () => {
    return !validateName(attack).valid;
  });
});

// ============================================
// RÉSUMÉ
// ============================================

console.log(`\n${BOLD}═══════════════════════════════════════${RESET}`);
console.log(
  `${BOLD}RÉSULTAT: ${GREEN}${passed} passés${RESET}, ${RED}${failed} échoués${RESET}`
);
console.log(`${BOLD}═══════════════════════════════════════${RESET}\n`);

if (failed > 0) {
  console.log(
    `${RED}⚠️  Des tests ont échoué! Vérifiez les vulnérabilités.${RESET}`
  );
  process.exit(1);
} else {
  console.log(`${GREEN}✅ Tous les tests de sécurité sont passés!${RESET}`);
  process.exit(0);
}
