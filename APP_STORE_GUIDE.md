# 📱 Guide complet : Publier JUSTIF' sur l'App Store

## ✅ Ce qui a déjà été fait (Aujourd'hui)

1. ✅ Installation de Capacitor et des plugins iOS
2. ✅ Initialisation du projet Capacitor
3. ✅ Configuration de base

---

## 🎯 PHASE 1 : Préparation technique (1-2 jours)

### Étape 1.1 : Adapter Next.js pour l'export statique

**Problème** : Capacitor nécessite des fichiers statiques, mais votre app Next.js utilise :
- Server-side rendering (SSR)
- API Routes
- Base de données

**Solution** : Créer une configuration hybride

#### A. Créer un script de build pour mobile

Ajoutez dans `package.json` :

```json
"scripts": {
  "build:mobile": "next build && npx cap sync",
  "open:ios": "npx cap open ios"
}
```

#### B. **IMPORTANT** : Configuration de l'API

Votre app utilise des API routes (`/api/*`). Vous avez 2 options :

**Option A (Recommandée)** : Héberger le backend séparément
- Déployer votre Next.js app sur Vercel/Railway/Render
- L'app mobile fait des requêtes vers `https://api.justif.com`
- Modifier les fetch() pour pointer vers l'URL de prod

**Option B** : Embarquer le backend dans l'app
- Plus complexe
- Utiliser une architecture API locale
- Pas recommandé pour App Store

### Étape 1.2 : Préparer l'hébergement

**Choix recommandé : Vercel** (gratuit + facile)

1. Créer un compte Vercel
2. Connecter votre repo GitHub
3. Déployer en 1 clic
4. Vous obtenez : `https://justif.vercel.app`

**Alternative : Railway** (base de données incluse)
- Supporte PostgreSQL directement
- Plus adapté pour votre app complète

### Étape 1.3 : Modifier les appels API

Dans tous vos composants, remplacez :

```typescript
// Avant
fetch('/api/documents/upload', ...)

// Après
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`, ...)
```

Créer `.env.local` :
```
NEXT_PUBLIC_API_URL=https://votre-app.vercel.app
```

---

## 🎯 PHASE 2 : Configuration iOS (Nécessite un Mac)

### Étape 2.1 : Prérequis

- ✅ Mac avec macOS (obligatoire pour Xcode)
- ✅ Xcode installé (gratuit sur Mac App Store)
- ✅ Compte Apple Developer (99$/an)

### Étape 2.2 : Ajouter la plateforme iOS

```bash
npx cap add ios
```

Cela crée le dossier `/ios` avec le projet Xcode.

### Étape 2.3 : Ouvrir le projet dans Xcode

```bash
npm run open:ios
```

### Étape 2.4 : Configuration dans Xcode

1. **Bundle Identifier** : `com.justif.app`
2. **Team** : Sélectionner votre compte Apple Developer
3. **Version** : 1.0.0
4. **Build** : 1

### Étape 2.5 : Configurer les permissions (Info.plist)

Ajouter ces clés dans `ios/App/App/Info.plist` :

```xml
<key>NSCameraUsageDescription</key>
<string>JUSTIF' a besoin d'accéder à la caméra pour scanner vos documents</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>JUSTIF' a besoin d'accéder à vos photos pour télécharger des documents</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>JUSTIF' a besoin de sauvegarder des documents dans vos photos</string>
```

---

## 🎯 PHASE 3 : Icônes et Assets (1 jour)

### Étape 3.1 : Créer les icônes d'app

Vous devez créer une icône de 1024x1024px.

**Outils recommandés** :
- Figma / Canva (pour designer)
- https://www.appicon.co/ (pour générer toutes les tailles)

**Tailles nécessaires** :
- 1024x1024 (App Store)
- 180x180, 167x167, 152x152, etc. (iPhone/iPad)

### Étape 3.2 : Splash Screen

Créer un écran de démarrage :
- 2048x2732 (iPad Pro)
- 1242x2688 (iPhone Pro Max)

### Étape 3.3 : Captures d'écran pour App Store

**Obligatoire** - Tailles à préparer :
- iPhone 6.7" : 1290 x 2796
- iPhone 6.5" : 1242 x 2688
- iPad Pro 12.9" : 2048 x 2732

**Astuce** : Utiliser le simulateur iOS dans Xcode

---

## 🎯 PHASE 4 : Configuration Apple Developer (1 jour)

### Étape 4.1 : Créer un compte Apple Developer

1. Aller sur https://developer.apple.com
2. S'inscrire (99$/an)
3. Attendre validation (24-48h)

### Étape 4.2 : Créer l'App ID

1. Apple Developer Console → Identifiers
2. Créer un nouveau App ID
3. Bundle ID : `com.justif.app`
4. Nom : JUSTIF'
5. Activer les capabilities :
   - Push Notifications
   - In-App Purchase (si abonnement Pro)

### Étape 4.3 : Créer les certificats

1. **Development Certificate** (pour tester sur votre iPhone)
2. **Distribution Certificate** (pour App Store)

Xcode peut les créer automatiquement :
- Xcode → Preferences → Accounts → Manage Certificates

### Étape 4.4 : Créer le Provisioning Profile

1. Apple Developer → Profiles
2. App Store Distribution Profile
3. Lier à votre App ID et certificat

---

## 🎯 PHASE 5 : App Store Connect (1 jour)

### Étape 5.1 : Créer l'app dans App Store Connect

1. Aller sur https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Remplir :
   - **Name** : JUSTIF'
   - **Primary Language** : French
   - **Bundle ID** : com.justif.app
   - **SKU** : JUSTIF001

### Étape 5.2 : Préparer les métadonnées

#### Description (Français)
```
JUSTIF' - Gérez tous vos documents administratifs en un seul endroit

Gardez vos factures, contrats, justificatifs et documents importants
organisés et accessibles où que vous soyez.

FONCTIONNALITÉS :
• 📁 Organisation par dossiers personnalisables
• 🔒 Protection par code PIN
• 🌍 Support multilingue (FR/EN)
• 🌙 Mode sombre
• 📊 Tableau de bord avec statistiques
• 🔍 Recherche rapide
• 📤 Upload facile de documents

VERSION GRATUITE :
• 5 documents maximum
• 2 MB de stockage

VERSION PRO :
• Documents illimités
• Stockage illimité
• Support prioritaire

Téléchargez JUSTIF' maintenant et prenez le contrôle de votre paperasse !
```

#### Mots-clés (séparés par virgules, max 100 caractères)
```
documents,justificatifs,factures,organisation,paperasse,administratif,fichiers
```

#### Catégories
- **Principale** : Productivité
- **Secondaire** : Utilitaires

### Étape 5.3 : Upload des captures d'écran

Pour chaque taille d'écran :
1. Ouvrir le simulateur iOS dans Xcode
2. Naviguer dans votre app
3. Cmd+S pour screenshot
4. Upload dans App Store Connect

**Minimum requis** :
- 3 screenshots pour iPhone
- 3 screenshots pour iPad (si vous supportez iPad)

### Étape 5.4 : Informations légales

#### Politique de confidentialité (OBLIGATOIRE)

Créer une page : `https://votre-site.com/privacy-policy`

**Template basique** :
```
Politique de Confidentialité de JUSTIF'

Dernière mise à jour : [Date]

1. Données collectées
Nous collectons : nom, email, documents uploadés

2. Utilisation des données
Vos données sont utilisées uniquement pour le fonctionnement de l'app

3. Stockage
Vos documents sont stockés de manière sécurisée

4. Partage
Nous ne partageons jamais vos données avec des tiers

5. Vos droits
Vous pouvez supprimer votre compte à tout moment

Contact : support@justif.com
```

#### Conditions d'utilisation

URL : `https://votre-site.com/terms`

---

## 🎯 PHASE 6 : Build et Soumission

### Étape 6.1 : Build de production

Dans Xcode :

1. Product → Scheme → Edit Scheme
2. Run → Build Configuration → **Release**
3. Generic iOS Device (sélectionner en haut)
4. Product → Archive

Attendez 5-10 minutes...

### Étape 6.2 : Upload vers App Store Connect

1. Après l'archive : Window → Organizer
2. Sélectionner votre archive
3. Distribute App
4. App Store Connect
5. Upload
6. Attendre validation (10-30 min)

### Étape 6.3 : Soumettre pour review

1. Retour sur App Store Connect
2. Votre build apparaît dans "Activity"
3. Version Information → Build → Sélectionner le build
4. **Submit for Review**

### Étape 6.4 : Questionnaire Apple

Questions importantes :

**Export Compliance** :
- Votre app utilise-t-elle du chiffrement ? → Oui (HTTPS)
- Chiffrement standard uniquement ? → Oui

**Content Rights** :
- Avez-vous les droits sur le contenu ? → Oui

**Advertising Identifier** :
- Utilisez-vous l'IDFA ? → Non (sauf si vous ajoutez des pubs)

---

## 🎯 PHASE 7 : Review et Publication (1-7 jours)

### Ce qui peut arriver :

#### ✅ Approuvé (70% des cas)
- Vous recevez un email
- L'app est publiée automatiquement (ou manuellement si configuré)
- Visible sur l'App Store en 24h

#### ❌ Rejeté (30% des cas)

**Raisons courantes de rejet** :

1. **Bug ou crash**
   - Solution : Tester sur plusieurs appareils

2. **Métadonnées incomplètes**
   - Solution : Vérifier description, screenshots, privacy policy

3. **Fonctionnalité non accessible**
   - Solution : Fournir un compte de test

4. **Violation des guidelines**
   - Solution : Lire https://developer.apple.com/app-store/review/guidelines/

5. **In-App Purchase requis**
   - Si vous avez un abonnement Pro, vous DEVEZ utiliser IAP d'Apple
   - Solution : Implémenter StoreKit ou gérer via le web

---

## 🎯 PHASE 8 : Gestion des abonnements PRO

### Option A : In-App Purchase Apple (Obligatoire pour App Store)

**Apple prend 30% (15% après 1 an)**

1. App Store Connect → Features → In-App Purchases
2. Créer un abonnement "JUSTIF' Pro"
3. Prix : Définir les prix par pays
4. Implémenter StoreKit dans le code

**Code à ajouter** :
```typescript
import { Purchases } from '@capacitor-community/purchases';

// Initialiser RevenueCat (service qui simplifie IAP)
await Purchases.configure({ apiKey: 'YOUR_KEY' });

// Acheter Pro
const { customerInfo } = await Purchases.purchasePackage({ package });
```

### Option B : Abonnement Web (Alternative)

**Vous gardez 100%** mais Apple peut rejeter l'app

1. Ne pas mentionner "Pro" dans l'app iOS
2. Les utilisateurs s'abonnent sur le site web
3. L'app vérifie juste le statut d'abonnement

**Code** :
```typescript
// L'app vérifie si l'utilisateur a souscrit sur le web
const response = await fetch(`${API_URL}/api/user/subscription`);
const { isPro } = await response.json();
```

---

## 📋 CHECKLIST FINALE

Avant de soumettre, vérifiez :

### Technique
- [ ] App fonctionne sans crash
- [ ] Tous les liens API pointent vers prod
- [ ] Upload de documents fonctionne
- [ ] Authentification fonctionne
- [ ] Dark mode fonctionne
- [ ] Traductions FR/EN complètes
- [ ] Testé sur iPhone et iPad

### Assets
- [ ] Icône 1024x1024 créée
- [ ] Toutes les tailles d'icônes générées
- [ ] Splash screen configuré
- [ ] 3+ screenshots iPhone
- [ ] 3+ screenshots iPad (optionnel)

### Légal
- [ ] Politique de confidentialité publiée
- [ ] URL privacy policy ajoutée
- [ ] Conditions d'utilisation rédigées
- [ ] Compte développeur actif (99$ payés)

### App Store Connect
- [ ] App créée dans App Store Connect
- [ ] Description complétée (FR + EN)
- [ ] Mots-clés ajoutés
- [ ] Catégories sélectionnées
- [ ] Screenshots uploadés
- [ ] Build uploadé et validé
- [ ] Version sélectionnée pour review

---

## 💰 Budget total

| Item | Coût |
|------|------|
| Compte Apple Developer | 99$/an |
| Hébergement backend (Vercel/Railway) | Gratuit - 20$/mois |
| Nom de domaine (optionnel) | 10$/an |
| Icônes/Design (si outsourcé) | 50-200€ |
| **TOTAL première année** | **~150-250€** |

---

## ⏱️ Timeline réaliste

| Phase | Durée | Vous êtes ici |
|-------|-------|--------------|
| Installation Capacitor | 1h | ✅ FAIT |
| Configuration iOS | 2h | ⏳ À FAIRE |
| Hébergement backend | 1 jour | ⏳ À FAIRE |
| Créer icônes/assets | 1 jour | ⏳ À FAIRE |
| Setup Apple Developer | 1-2 jours | ⏳ À FAIRE |
| Métadonnées App Store | 1 jour | ⏳ À FAIRE |
| Tests et build | 1 jour | ⏳ À FAIRE |
| Review Apple | 1-7 jours | ⏳ À FAIRE |
| **TOTAL** | **7-14 jours** | |

---

## 🚨 Points critiques

### 1. Vous DEVEZ avoir un Mac
Impossible de build pour iOS sans Mac + Xcode

### 2. Backend doit être hébergé
Votre app ne peut pas fonctionner en local avec Capacitor

### 3. In-App Purchase obligatoire
Si vous vendez un abonnement dans l'app, vous devez utiliser le système Apple

### 4. Test sur vrais appareils
Ne comptez pas uniquement sur le simulateur

---

## 📞 Prochaines étapes immédiates

1. **Vérifiez que vous avez un Mac** ✅
2. **Créez un compte Apple Developer** (99$) - Faire maintenant
3. **Choisissez un service d'hébergement** (Vercel recommandé)
4. **Préparez vos assets** (icône, screenshots)

Une fois ces 4 points faits, je pourrai vous aider à :
- Configurer le projet iOS dans Xcode
- Adapter le code pour pointer vers votre API de production
- Créer les fichiers de configuration nécessaires
- Vous guider dans la soumission

---

## 🎓 Ressources utiles

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)

---

Bonne chance ! 🚀
