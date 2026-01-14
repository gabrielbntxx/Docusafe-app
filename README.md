# 📁 Justif' - Votre coffre-fort numérique intelligent

**"Tous vos justificatifs au bon endroit, au bon moment, automatiquement."**

Une application web moderne qui centralise, organise et digitalise tous vos documents administratifs avec de l'intelligence artificielle pour tout catégoriser automatiquement.

## 🎨 Design

Design moderne inspiré d'Apple avec :
- Bordures arrondies généreuses (12-16px)
- Palette de couleurs professionnelle (Bleu profond, Vert émeraude, Orange)
- Transitions fluides et micro-animations
- Glassmorphism subtil

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL (ou utiliser Prisma Postgres local)

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs

# Générer le client Prisma
npx prisma generate

# Démarrer la base de données locale (optionnel)
npx prisma dev

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
docu_safe/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/              # Pages d'authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Pages protégées
│   │   ├── api/                 # API Routes
│   │   │   └── auth/
│   │   ├── layout.tsx           # Layout racine
│   │   ├── page.tsx             # Page d'accueil
│   │   └── globals.css          # Styles globaux
│   ├── components/
│   │   ├── ui/                  # Composants UI de base
│   │   ├── auth/                # Composants d'authentification
│   │   └── providers/           # Providers React
│   ├── lib/
│   │   ├── auth.ts              # Configuration NextAuth
│   │   ├── db.ts                # Client Prisma
│   │   └── utils.ts             # Fonctions utilitaires
│   ├── types/                   # Types TypeScript
│   └── hooks/                   # Custom React hooks
├── prisma/
│   └── schema.prisma            # Schéma de base de données
├── public/                      # Assets statiques
└── package.json
```

## 🛠️ Stack technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: NextAuth.js v5
- **UI Components**: Custom components + shadcn/ui
- **Déploiement**: Vercel (recommandé)

## ✅ Fonctionnalités implémentées (Sprint 1)

### Authentification
- ✅ Inscription avec email/mot de passe
- ✅ Connexion avec email/mot de passe
- ✅ Connexion avec Google OAuth
- ✅ Hachage sécurisé des mots de passe (bcrypt)
- ✅ Sessions JWT
- ✅ Protection des routes

### Design
- ✅ Page d'accueil moderne
- ✅ Pages login/register avec design Apple-style
- ✅ Système de design avec couleurs personnalisées
- ✅ Composants UI réutilisables (Button, Card, Input, Label)
- ✅ Responsive design

### Base de données
- ✅ Schéma complet (User, Document, Folder, Account, Session)
- ✅ Relations entre modèles
- ✅ Enums pour les types (PlanType, OcrStatus)
- ✅ Création automatique du dossier "Dossier Location" à l'inscription

## 🔜 Prochaines étapes (Sprint 2-4)

### Sprint 2 : Upload & Stockage (Semaines 3-4)
- [ ] Configuration S3/R2
- [ ] API d'upload avec presigned URLs
- [ ] Interface drag-and-drop
- [ ] Bibliothèque de documents (vue grille)
- [ ] Gestion des quotas (FREE: 10 docs/100MB)

### Sprint 3 : OCR & Catégorisation (Semaine 5)
- [ ] Intégration Google Cloud Vision ou AWS Textract
- [ ] Jobs en arrière-plan (Inngest/Trigger.dev)
- [ ] Catégorisation automatique par mots-clés
- [ ] Recherche dans les documents

### Sprint 4 : Dossiers & Paiements (Semaines 6-7)
- [ ] CRUD des dossiers
- [ ] Intégration Stripe (checkout + webhooks)
- [ ] Gestion des abonnements
- [ ] Dashboard avec statistiques

## 🔐 Variables d'environnement

Voir [.env.example](.env.example) pour la liste complète des variables requises.

Variables critiques pour démarrer :
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 📝 Commandes utiles

```bash
# Développement
npm run dev                    # Démarrer le serveur de dev
npm run build                  # Build de production
npm run start                  # Démarrer le build de production
npm run lint                   # Linter le code

# Prisma
npx prisma dev                 # Démarrer Prisma Postgres local
npx prisma generate            # Générer le client Prisma
npx prisma migrate dev         # Créer une migration
npx prisma studio              # Interface graphique pour la DB
```

## 🎯 Objectifs MVP (8 semaines)

**Semaines 1-2** ✅ : Fondations (auth + design)
**Semaines 3-4** : Upload & stockage
**Semaine 5** : OCR & catégorisation
**Semaines 6-7** : Dossiers & paiements
**Semaine 8** : Polish & tests

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Créé avec ❤️ pour simplifier la gestion de vos documents administratifs**
