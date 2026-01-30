"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  FolderOpen,
  Search,
  Bot,
  Shield,
  Share2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  FileText,
  Image,
  Video,
  Music,
  Lock,
  Bell,
  Settings,
  CreditCard,
  Mail,
  HelpCircle,
} from "lucide-react";

type GuideSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  steps: {
    title: string;
    content: string;
  }[];
};

const guides: GuideSection[] = [
  {
    id: "upload",
    title: "Importer des documents",
    icon: Upload,
    color: "blue",
    description: "Apprenez à ajouter vos fichiers dans DocuSafe",
    steps: [
      {
        title: "Formats acceptés",
        content: "DocuSafe accepte les fichiers PDF, images (JPG, PNG, GIF, WebP), fichiers audio (MP3, WAV) et vidéos (MP4, MOV, WebM). La taille maximale est de 100 MB par fichier.",
      },
      {
        title: "Glisser-déposer",
        content: "Faites glisser vos fichiers directement dans la zone d'upload sur la page d'ajout de documents. Vous pouvez importer plusieurs fichiers en même temps.",
      },
      {
        title: "Tri automatique par IA",
        content: "Activez le bouton 'Tri automatique par IA' avant l'upload pour que DocuSafe analyse et classe automatiquement vos documents dans des dossiers appropriés.",
      },
    ],
  },
  {
    id: "folders",
    title: "Organiser avec des dossiers",
    icon: FolderOpen,
    color: "amber",
    description: "Créez et gérez vos dossiers personnalisés",
    steps: [
      {
        title: "Créer un dossier",
        content: "Cliquez sur 'Nouveau dossier' dans la page Mes fichiers. Donnez-lui un nom, choisissez une icône et une couleur pour le personnaliser.",
      },
      {
        title: "Déplacer des documents",
        content: "Sélectionnez un ou plusieurs documents, puis utilisez le bouton 'Déplacer' pour les ranger dans un dossier existant.",
      },
      {
        title: "Dossiers protégés par PIN",
        content: "Activez la protection PIN dans les Paramètres, puis verrouillez vos dossiers sensibles. Un code à 4 chiffres sera requis pour y accéder.",
      },
    ],
  },
  {
    id: "search",
    title: "Rechercher des documents",
    icon: Search,
    color: "violet",
    description: "Retrouvez rapidement vos fichiers",
    steps: [
      {
        title: "Recherche intelligente",
        content: "La barre de recherche analyse le nom, les tags, le type de document et même les données extraites par l'IA (émetteur, montant, date...).",
      },
      {
        title: "Filtres rapides",
        content: "Utilisez les filtres par type de fichier (PDF, Images, Audio, Vidéo) et par période (Aujourd'hui, Cette semaine, Ce mois) pour affiner vos résultats.",
      },
      {
        title: "Recherches récentes",
        content: "Vos dernières recherches sont sauvegardées pour un accès rapide. Cliquez sur une recherche récente pour la relancer.",
      },
    ],
  },
  {
    id: "docubot",
    title: "DocuBot - Assistant IA",
    icon: Bot,
    color: "emerald",
    description: "Posez des questions sur vos documents",
    steps: [
      {
        title: "Qu'est-ce que DocuBot ?",
        content: "DocuBot est votre assistant intelligent. Il peut répondre à des questions sur vos documents, faire des résumés et vous aider à retrouver des informations.",
      },
      {
        title: "Comment l'utiliser",
        content: "Accédez à DocuBot depuis le menu. Posez vos questions en langage naturel, par exemple : 'Quel est le montant de ma dernière facture EDF ?'",
      },
      {
        title: "Suggestions de questions",
        content: "DocuBot vous propose des questions suggérées basées sur vos documents récents. Cliquez dessus pour obtenir rapidement des informations.",
      },
    ],
  },
  {
    id: "ai-sorting",
    title: "Tri automatique par IA",
    icon: Sparkles,
    color: "pink",
    description: "Laissez l'IA organiser vos documents",
    steps: [
      {
        title: "Comment ça marche",
        content: "L'IA analyse le contenu de vos documents (texte, images, audio, vidéo) pour déterminer leur type et les classer dans des dossiers précis.",
      },
      {
        title: "Dossiers intelligents",
        content: "Au lieu de créer des dossiers génériques comme 'Documents', l'IA crée des dossiers précis comme 'Factures EDF 2024' ou 'Cours Informatique'.",
      },
      {
        title: "Activer le tri automatique",
        content: "Lors de l'upload, activez le bouton violet 'Tri automatique par IA'. Vos documents seront analysés et classés automatiquement.",
      },
    ],
  },
  {
    id: "share",
    title: "Partager des documents",
    icon: Share2,
    color: "cyan",
    description: "Partagez vos fichiers en toute sécurité",
    steps: [
      {
        title: "Créer un lien de partage",
        content: "Sélectionnez un document et cliquez sur 'Partager'. Un lien unique sera généré que vous pouvez envoyer à n'importe qui.",
      },
      {
        title: "Protection par mot de passe",
        content: "Optionnellement, protégez votre lien avec un mot de passe. Le destinataire devra le saisir pour accéder au document.",
      },
      {
        title: "Date d'expiration",
        content: "Définissez une date d'expiration pour que le lien devienne invalide après un certain temps. Idéal pour les documents sensibles.",
      },
    ],
  },
  {
    id: "security",
    title: "Sécurité et confidentialité",
    icon: Shield,
    color: "green",
    description: "Vos documents sont protégés",
    steps: [
      {
        title: "Chiffrement de bout en bout",
        content: "Tous vos documents sont chiffrés avant d'être stockés. Même nous ne pouvons pas les lire. Seul vous avez la clé de déchiffrement.",
      },
      {
        title: "PIN de dossier",
        content: "Ajoutez une couche de sécurité supplémentaire avec un PIN à 4 chiffres pour vos dossiers les plus sensibles.",
      },
      {
        title: "Connexion sécurisée",
        content: "Votre compte est protégé par un mot de passe fort. Nous recommandons d'utiliser un mot de passe unique pour DocuSafe.",
      },
    ],
  },
  {
    id: "email-import",
    title: "Import par email",
    icon: Mail,
    color: "indigo",
    description: "Envoyez des documents par email",
    steps: [
      {
        title: "Votre adresse d'import",
        content: "Chaque compte a une adresse email unique (ex: votrenom-abc123@import.docusafe.app). Trouvez-la dans les Paramètres.",
      },
      {
        title: "Envoyer des documents",
        content: "Transférez n'importe quel email avec pièces jointes à cette adresse. Les fichiers seront automatiquement importés dans DocuSafe.",
      },
      {
        title: "Types de fichiers",
        content: "Seuls les fichiers supportés (PDF, images, audio, vidéo) seront importés. Les autres pièces jointes seront ignorées.",
      },
    ],
  },
];

export function HelpClient() {
  const [expandedGuide, setExpandedGuide] = useState<string | null>("upload");

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; lightBg: string }> = {
      blue: { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", lightBg: "bg-blue-50 dark:bg-blue-500/10" },
      amber: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", lightBg: "bg-amber-50 dark:bg-amber-500/10" },
      violet: { bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", lightBg: "bg-violet-50 dark:bg-violet-500/10" },
      emerald: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", lightBg: "bg-emerald-50 dark:bg-emerald-500/10" },
      pink: { bg: "bg-pink-500", text: "text-pink-600 dark:text-pink-400", lightBg: "bg-pink-50 dark:bg-pink-500/10" },
      cyan: { bg: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", lightBg: "bg-cyan-50 dark:bg-cyan-500/10" },
      green: { bg: "bg-green-500", text: "text-green-600 dark:text-green-400", lightBg: "bg-green-50 dark:bg-green-500/10" },
      indigo: { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", lightBg: "bg-indigo-50 dark:bg-indigo-500/10" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
              Centre d&apos;aide
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Guides et tutoriels pour utiliser DocuSafe
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-6 grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { icon: FileText, label: "PDF", color: "text-red-500" },
          { icon: Image, label: "Images", color: "text-blue-500" },
          { icon: Video, label: "Vidéos", color: "text-purple-500" },
          { icon: Music, label: "Audio", color: "text-pink-500" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 rounded-xl bg-white p-3 text-center shadow-sm dark:bg-neutral-800/50 sm:p-4"
          >
            <item.icon className={`h-5 w-5 ${item.color} sm:h-6 sm:w-6`} />
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Guides */}
      <div className="space-y-3">
        {guides.map((guide) => {
          const isExpanded = expandedGuide === guide.id;
          const colors = getColorClasses(guide.color);

          return (
            <div
              key={guide.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800/50"
            >
              {/* Guide Header */}
              <button
                onClick={() => toggleGuide(guide.id)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} shadow-md`}>
                  <guide.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {guide.description}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                )}
              </button>

              {/* Guide Content */}
              {isExpanded && (
                <div className="border-t border-neutral-100 px-4 pb-4 dark:border-neutral-700/50">
                  <div className="space-y-4 pt-4">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colors.lightBg} text-xs font-bold ${colors.text}`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-white text-sm">
                            {step.title}
                          </h4>
                          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Link */}
      <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 p-5 text-white shadow-lg shadow-cyan-500/25">
        <h3 className="font-semibold">Besoin d&apos;aide supplémentaire ?</h3>
        <p className="mt-1 text-sm text-cyan-100">
          Notre équipe support est là pour vous aider.
        </p>
        <Link
          href="/dashboard/support"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          Contacter le support
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
