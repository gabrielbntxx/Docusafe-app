# 🚂 Déploiement sur Railway - Guide pas à pas

## ✅ Préparation (FAIT)

- ✅ Schéma Prisma migré vers PostgreSQL
- ✅ Fichier railway.json créé
- ✅ .env.example documenté

---

## 📋 Étape 1 : Créer un compte Railway

1. Allez sur **https://railway.app**
2. Cliquez sur **"Start a New Project"**
3. Connectez-vous avec **GitHub** (recommandé)
4. Vous aurez **500h gratuites** ($5 de crédit)

---

## 📋 Étape 2 : Créer un nouveau projet

### Option A : Depuis GitHub (Recommandé)

1. Dans Railway, cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Autorisez Railway à accéder à vos repos
4. Sélectionnez le repo **docu_safe**
5. Railway va détecter automatiquement que c'est Next.js

### Option B : Depuis CLI

```bash
npm install -g railway
railway login
railway init
railway link
```

---

## 📋 Étape 3 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"**
3. Choisissez **"PostgreSQL"**
4. Railway va créer la base de données et générer `DATABASE_URL`

**Important** : Railway lie automatiquement la DATABASE_URL à votre service !

---

## 📋 Étape 4 : Configurer les variables d'environnement

Dans Railway, allez dans votre service → **Variables** :

### Variables obligatoires :

```bash
# Base de données (auto-générée par Railway)
DATABASE_URL=postgresql://...

# NextAuth (IMPORTANT : à générer)
NEXTAUTH_SECRET=<générer avec: openssl rand -base64 32>
NEXTAUTH_URL=https://votre-app.railway.app

# Pour l'app mobile
NEXT_PUBLIC_API_URL=https://votre-app.railway.app
```

### Générer NEXTAUTH_SECRET :

Sur votre Mac, ouvrez le Terminal et exécutez :
```bash
openssl rand -base64 32
```

Copiez le résultat dans Railway.

### Variables optionnelles (pour plus tard) :

```bash
# Google OAuth
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📋 Étape 5 : Configurer le build

Railway devrait détecter automatiquement, mais vérifiez dans **Settings** :

### Build Command :
```bash
npm run build && npx prisma generate && npx prisma migrate deploy
```

### Start Command :
```bash
npm run start
```

### Install Command :
```bash
npm install
```

---

## 📋 Étape 6 : Première migration de la base de données

Après que Railway ait déployé votre app :

1. Dans Railway, ouvrez votre service
2. Allez dans l'onglet **"Deployments"**
3. Attendez que le déploiement soit **"Success"** (vert)

Railway va automatiquement :
- Installer les dépendances
- Générer le client Prisma
- Exécuter les migrations

### Si vous voulez forcer une migration manuellement :

Dans Railway, allez dans votre service → **"Shell"** et exécutez :
```bash
npx prisma migrate deploy
```

---

## 📋 Étape 7 : Obtenir votre URL

1. Dans Railway, allez dans **Settings**
2. Section **"Networking"**
3. Cliquez sur **"Generate Domain"**
4. Vous obtiendrez une URL comme : `https://docu-safe-production-xxxx.up.railway.app`

**Copiez cette URL !** Vous en aurez besoin pour :
- La variable `NEXTAUTH_URL`
- La variable `NEXT_PUBLIC_API_URL`
- Configurer votre app mobile Capacitor

---

## 📋 Étape 8 : Tester votre déploiement

1. Ouvrez l'URL générée dans votre navigateur
2. Essayez de vous inscrire
3. Essayez de vous connecter
4. Uploadez un document
5. Vérifiez que tout fonctionne

### En cas d'erreur :

1. Dans Railway → **Deployments** → Cliquez sur le dernier déploiement
2. Consultez les **logs** pour voir l'erreur
3. Vérifiez vos variables d'environnement

---

## 📋 Étape 9 : Configurer le stockage des fichiers

### Problème actuel

Votre app stocke les fichiers dans `/uploads` localement. Railway a un système de fichiers **éphémère** : vos fichiers seront perdus à chaque redéploiement.

### Solution : Utiliser Cloudflare R2 (recommandé) ou AWS S3

#### Option A : Cloudflare R2 (Moins cher que S3)

1. Créez un compte sur https://cloudflare.com
2. Allez dans **R2 Object Storage**
3. Créez un bucket (ex: `justif-documents`)
4. Obtenez vos clés API
5. Installez le SDK :
   ```bash
   npm install @aws-sdk/client-s3
   ```

6. Ajoutez les variables d'environnement dans Railway :
   ```bash
   R2_ACCOUNT_ID=votre_account_id
   R2_ACCESS_KEY_ID=votre_access_key
   R2_SECRET_ACCESS_KEY=votre_secret_key
   R2_BUCKET_NAME=justif-documents
   ```

#### Option B : AWS S3

1. Créez un compte AWS
2. Créez un bucket S3
3. Obtenez vos clés IAM
4. Même processus qu'avec R2

**Note** : Je peux vous aider à migrer le code de stockage local vers R2/S3 après le déploiement initial.

---

## 📋 Étape 10 : Déploiements automatiques

Railway est maintenant configuré pour :
- ✅ Déployer automatiquement à chaque `git push` sur la branche `main`
- ✅ Exécuter les migrations Prisma
- ✅ Rebuilder l'app

Pour déployer :
```bash
git add .
git commit -m "Update"
git push
```

Railway déploiera automatiquement en ~2-3 minutes.

---

## 💰 Coûts Railway

### Plan Hobby (Gratuit pendant 500h)
- **500 heures gratuites** par mois (soit ~$5)
- PostgreSQL inclus (1GB)
- 1GB RAM par service
- 1 vCPU par service

### Après les 500h
- **$5/mois** pour usage similaire
- $0.000231 par GB-seconde pour RAM
- $10/GB pour stockage

**Estimation pour votre app** : ~$5-10/mois

---

## 🔧 Commandes utiles

### Voir les logs en temps réel
```bash
railway logs
```

### Ouvrir l'app
```bash
railway open
```

### Exécuter des commandes dans Railway
```bash
railway run <commande>
```

### Migrer la base de données
```bash
railway run npx prisma migrate deploy
```

### Réinitialiser la base de données (⚠️ DANGER)
```bash
railway run npx prisma migrate reset
```

---

## ✅ Checklist finale

Avant de passer à l'étape iOS :

- [ ] Projet créé sur Railway
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] NEXTAUTH_SECRET généré
- [ ] Premier déploiement réussi (vert)
- [ ] URL générée (ex: https://xxx.railway.app)
- [ ] NEXTAUTH_URL mise à jour avec l'URL Railway
- [ ] NEXT_PUBLIC_API_URL configurée
- [ ] Test : Inscription fonctionne
- [ ] Test : Connexion fonctionne
- [ ] Test : Upload de document fonctionne (si stockage configuré)

---

## 🆘 Problèmes courants

### Erreur : "Prisma Client not generated"
```bash
railway run npx prisma generate
```

### Erreur : "Cannot find module .next"
Vérifiez que la build command inclut `npm run build`

### Erreur : "Connection refused" pour la DB
Vérifiez que `DATABASE_URL` est bien configurée automatiquement par Railway

### App ne démarre pas
Consultez les logs :
```bash
railway logs
```

---

## 📞 Prochaine étape

Une fois Railway configuré et testé :
1. ✅ Vous avez une URL de production
2. ✅ Votre backend est hébergé
3. ➡️ On peut passer à la configuration iOS avec Capacitor

Prêt pour l'étape iOS ! 🚀
