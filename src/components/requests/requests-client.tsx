"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  FileUp,
  Plus,
  Lock,
  Crown,
  Calendar,
  Eye,
  Copy,
  Check,
  X,
  Trash2,
  ExternalLink,
  Shield,
  Clock,
  FileText,
  Mail,
  User,
  Link2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

type PlanType = "FREE" | "STUDENT" | "PRO" | "BUSINESS";

type DocumentRequest = {
  id: string;
  token: string;
  title: string;
  description: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  expiresAt: string;
  status: string;
  filesReceived: number;
  maxFiles: number;
  viewCount: number;
  hasPassword: boolean;
  createdAt: string;
};

type RequestsClientProps = {
  userPlan: PlanType;
  requests: DocumentRequest[];
};

export function RequestsClient({ userPlan, requests: initialRequests }: RequestsClientProps) {
  const { t } = useTranslation();
  const [requests, setRequests] = useState(initialRequests);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState("7"); // days
  const [maxFiles, setMaxFiles] = useState("5");

  const isLocked = userPlan === "FREE" || userPlan === "STUDENT";

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/upload/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          recipientName: recipientName.trim() || null,
          recipientEmail: recipientEmail.trim() || null,
          password: password || null,
          expiresInDays: parseInt(expiresIn),
          maxFiles: parseInt(maxFiles),
        }),
      });

      if (response.ok) {
        const newRequest = await response.json();
        setRequests([newRequest, ...requests]);
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRequests(requests.filter((r) => r.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRecipientName("");
    setRecipientEmail("");
    setPassword("");
    setExpiresIn("7");
    setMaxFiles("5");
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    if (isExpired || status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          Expiré
        </span>
      );
    }
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          Complété
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        En attente
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            Demandes de documents
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Demandez des fichiers à des particuliers ou entreprises
          </p>
        </div>
        {!isLocked && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle demande</span>
          </button>
        )}
      </div>

      {/* Locked State for FREE/STUDENT */}
      {isLocked && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Fonctionnalité Pro</h2>
                <p className="text-sm text-white/70">Disponible avec le plan Pro ou Business</p>
              </div>
            </div>

            <p className="mb-6 text-sm sm:text-base text-white/80">
              Créez des liens de demande pour recevoir des documents de vos clients,
              partenaires ou fournisseurs de manière sécurisée.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Liens personnalisés</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Protection par mot de passe</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Date d&apos;expiration</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Notifications email</span>
              </div>
            </div>

            <a
              href="/dashboard/subscription"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-600 shadow-lg transition-all hover:bg-violet-50 active:scale-[0.98]"
            >
              <Crown className="h-4 w-4" />
              Passer à Pro
            </a>
          </div>
        </div>
      )}

      {/* Demo Preview for Locked Users */}
      {isLocked && (
        <div className="space-y-4 opacity-60 pointer-events-none select-none">
          <h3 className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            <Eye className="h-4 w-4" />
            Aperçu de la fonctionnalité
          </h3>

          {/* Demo Card */}
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xl shadow-black/5 dark:bg-neutral-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                  <FileUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Documents comptables 2024
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Cabinet Martin & Associés
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                <Clock className="h-3 w-3" />
                En attente
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Expire le 15 fév. 2025
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                0/5 fichiers
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                3 vues
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Protégé
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Requests List for PRO/BUSINESS */}
      {!isLocked && (
        <>
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 sm:p-12 text-center shadow-xl shadow-black/5 dark:bg-neutral-800/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20">
                <FileUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
                Aucune demande
              </h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Créez votre première demande de documents
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Créer une demande
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl bg-white p-4 sm:p-5 shadow-xl shadow-black/5 dark:bg-neutral-800/50 transition-all hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                        <FileUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                          {request.title}
                        </h3>
                        {request.recipientName && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                            {request.recipientName}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(request.status, request.expiresAt)}
                  </div>

                  {request.description && (
                    <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                      {request.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Expire {formatDate(request.expiresAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {request.filesReceived}/{request.maxFiles} fichiers
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {request.viewCount} vues
                    </span>
                    {request.hasPassword && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Protégé
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => copyLink(request.token)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-all ${
                        copiedId === request.token
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                      }`}
                    >
                      {copiedId === request.token ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copier le lien
                        </>
                      )}
                    </button>
                    <a
                      href={`/upload/${request.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {deleteConfirm === request.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(request.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-all hover:bg-red-100 hover:text-red-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white p-5 sm:p-6 shadow-2xl dark:bg-neutral-900 sm:max-w-lg sm:rounded-[28px]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FileUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Nouvelle demande
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Créer un lien de réception
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Titre de la demande *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Documents comptables 2024"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Description / Instructions
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les documents attendus..."
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500 resize-none"
                />
              </div>

              {/* Recipient Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <User className="h-3.5 w-3.5" />
                    Destinataire
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nom ou entreprise"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                  />
                </div>
              </div>

              {/* Settings Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <Calendar className="h-3.5 w-3.5" />
                    Expiration
                  </label>
                  <select
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="1">1 jour</option>
                    <option value="3">3 jours</option>
                    <option value="7">7 jours</option>
                    <option value="14">14 jours</option>
                    <option value="30">30 jours</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <FileText className="h-3.5 w-3.5" />
                    Max fichiers
                  </label>
                  <select
                    value={maxFiles}
                    onChange={(e) => setMaxFiles(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="1">1 fichier</option>
                    <option value="3">3 fichiers</option>
                    <option value="5">5 fichiers</option>
                    <option value="10">10 fichiers</option>
                    <option value="20">20 fichiers</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <Lock className="h-3.5 w-3.5" />
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Optionnel"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || isCreating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      Créer le lien
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}
