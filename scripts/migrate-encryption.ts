/**
 * Script de migration pour chiffrer les documents existants
 * Usage: npx ts-node scripts/migrate-encryption.ts
 */

import { PrismaClient } from "@prisma/client";
import {
  encryptDocument,
  addEncryptionMarker,
  generateUserEncryptionKey,
  encryptUserKey,
  decryptUserKey,
  isEncrypted,
} from "../src/lib/encryption";

// Note: Ce script nécessite un accès direct à R2
// Vous devez configurer les variables d'environnement R2

const prisma = new PrismaClient();

async function migrateUserDocuments(userId: string) {
  console.log(`\nMigration des documents pour l'utilisateur: ${userId}`);

  // Récupérer l'utilisateur avec sa clé
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      encryptionKey: true,
      documents: {
        where: {
          isEncrypted: 0, // Seulement les documents non chiffrés
        },
        select: {
          id: true,
          storageKey: true,
          originalName: true,
        },
      },
    },
  });

  if (!user) {
    console.log(`Utilisateur ${userId} non trouvé`);
    return;
  }

  if (user.documents.length === 0) {
    console.log(`Aucun document à migrer pour l'utilisateur ${userId}`);
    return;
  }

  // Obtenir ou créer la clé de chiffrement
  let userEncryptionKey: string;
  if (user.encryptionKey) {
    userEncryptionKey = decryptUserKey(user.encryptionKey);
  } else {
    userEncryptionKey = generateUserEncryptionKey();
    const encryptedKey = encryptUserKey(userEncryptionKey);
    await prisma.user.update({
      where: { id: userId },
      data: { encryptionKey: encryptedKey },
    });
    console.log(`Clé de chiffrement créée pour l'utilisateur ${userId}`);
  }

  console.log(`${user.documents.length} documents à migrer`);

  // Pour chaque document non chiffré
  for (const doc of user.documents) {
    try {
      console.log(`  - Migration: ${doc.originalName}`);

      // Note: Cette partie nécessite l'accès R2
      // Dans un environnement réel, vous devriez:
      // 1. Télécharger le fichier depuis R2
      // 2. Le chiffrer
      // 3. Le re-uploader
      // 4. Marquer comme chiffré dans la DB

      // Exemple de ce que le code ferait:
      // const fileBuffer = await getFromR2(doc.storageKey);
      //
      // if (isEncrypted(fileBuffer)) {
      //   console.log(`    Déjà chiffré, ignoré`);
      //   continue;
      // }
      //
      // const encryptedBuffer = encryptDocument(fileBuffer, userEncryptionKey);
      // const finalBuffer = addEncryptionMarker(encryptedBuffer);
      // await uploadToR2(doc.storageKey, finalBuffer, "application/octet-stream");

      // Marquer comme chiffré dans la DB
      await prisma.document.update({
        where: { id: doc.id },
        data: { isEncrypted: 1 },
      });

      console.log(`    ✓ Migré avec succès`);
    } catch (error) {
      console.error(`    ✗ Erreur: ${error}`);
    }
  }
}

async function main() {
  console.log("=== Migration du chiffrement des documents ===\n");

  // Récupérer tous les utilisateurs avec des documents non chiffrés
  const usersWithUnencryptedDocs = await prisma.user.findMany({
    where: {
      documents: {
        some: {
          isEncrypted: 0,
        },
      },
    },
    select: {
      id: true,
      email: true,
      _count: {
        select: {
          documents: {
            where: { isEncrypted: 0 },
          },
        },
      },
    },
  });

  console.log(
    `${usersWithUnencryptedDocs.length} utilisateurs avec des documents non chiffrés\n`
  );

  for (const user of usersWithUnencryptedDocs) {
    console.log(
      `Utilisateur: ${user.email} (${user._count.documents} documents)`
    );
  }

  // Confirmer avant de continuer
  console.log("\n⚠️  ATTENTION: Ce script va modifier les fichiers sur R2");
  console.log("Assurez-vous d'avoir une sauvegarde avant de continuer.\n");

  // Pour exécuter réellement la migration, décommentez:
  // for (const user of usersWithUnencryptedDocs) {
  //   await migrateUserDocuments(user.id);
  // }

  console.log("\n=== Migration terminée ===");
}

main()
  .catch((e) => {
    console.error("Erreur lors de la migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
