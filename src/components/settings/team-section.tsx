"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Trash2,
  Loader2,
  Clock,
  Crown,
  X,
  CheckCircle,
  Copy,
  ChevronDown,
  Shield,
  Eye,
  Pencil,
} from "lucide-react";

type MemberRole = "owner" | "admin" | "editeur" | "lecteur";

type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  teamRole: MemberRole | null;
  createdAt: string;
};

type Invitation = {
  id: string;
  email: string;
  status: string;
  role: MemberRole;
  createdAt: string;
  expiresAt: string;
};

const ROLE_CONFIG: Record<
  MemberRole,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  owner: {
    label: "Propriétaire",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-500/20",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-500/20",
    icon: Shield,
  },
  editeur: {
    label: "Éditeur",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-500/20",
    icon: Pencil,
  },
  lecteur: {
    label: "Lecteur",
    color: "text-neutral-500 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-700",
    icon: Eye,
  },
};

function RoleBadge({ role }: { role: MemberRole }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.editeur;
  const Icon = cfg.icon;
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.color}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [totalCount, setTotalCount] = useState(1);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editeur" | "lecteur">("editeur");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchData = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch("/api/team/members"),
        fetch("/api/team/invite"),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
        setTotalCount(data.totalCount || 1);
      }

      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error("Error fetching team data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setError(null);
    setSuccess(null);
    setLastInviteLink(null);
    setCopiedLink(false);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi");
        return;
      }

      if (data.inviteLink) {
        setLastInviteLink(data.inviteLink);
      }

      if (data.emailSent) {
        setSuccess(`Invitation envoyée à ${inviteEmail} (rôle : ${ROLE_CONFIG[inviteRole].label})`);
      } else {
        setSuccess(
          `Invitation créée ! L'email n'a pas pu être envoyé. Copiez le lien ci-dessous.`
        );
      }
      setInviteEmail("");
      fetchData();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      const res = await fetch("/api/team/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error removing member:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: "admin" | "editeur" | "lecteur") => {
    setChangingRoleId(memberId);
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error changing role:", err);
    } finally {
      setChangingRoleId(null);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    setRevokingId(invitationId);
    try {
      const res = await fetch("/api/team/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error revoking invite:", err);
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!lastInviteLink) return;
    try {
      await navigator.clipboard.writeText(lastInviteLink);
    } catch {}
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-500/20">
            <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Mon Equipe
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {totalCount}/5 membres
            </p>
          </div>
        </div>
        <div className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
          Business
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
          style={{ width: `${(totalCount / 5) * 100}%` }}
        />
      </div>

      {/* Invite form with role selector */}
      <form onSubmit={handleInvite} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
              disabled={inviting || totalCount >= 5}
            />
          </div>
          <div className="relative">
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
              disabled={inviting || totalCount >= 5}
              className="h-full appearance-none rounded-lg border border-neutral-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-neutral-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="admin">Admin</option>
              <option value="editeur">Éditeur</option>
              <option value="lecteur">Lecteur</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          </div>
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim() || totalCount >= 5}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {inviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Inviter
          </button>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          <span className="font-medium">Admin</span> — peut uploader et supprimer ·{" "}
          <span className="font-medium">Éditeur</span> — peut uploader ·{" "}
          <span className="font-medium">Lecteur</span> — consultation uniquement
        </p>
      </form>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <X className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-500/10 dark:text-green-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            {success}
          </div>
          {lastInviteLink && (
            <button
              onClick={handleCopyInviteLink}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {copiedLink ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedLink ? "Lien copié !" : "Copier le lien d'invitation"}
            </button>
          )}
        </div>
      )}

      {/* Owner */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <Crown className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Propriétaire
          </span>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
              Vous
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Vous (propriétaire)
              </p>
            </div>
            <RoleBadge role="owner" />
          </div>
        </div>
      </div>

      {/* Active members */}
      {members.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <Users className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Membres ({members.length})
            </span>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {(member.name || member.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {member.name || "Sans nom"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {/* Role selector */}
                  <div className="relative">
                    <select
                      value={member.teamRole || "editeur"}
                      onChange={(e) =>
                        handleChangeRole(
                          member.id,
                          e.target.value as "admin" | "editeur" | "lecteur"
                        )
                      }
                      disabled={changingRoleId === member.id}
                      className="appearance-none rounded-full border border-neutral-200 bg-white py-1 pl-3 pr-7 text-xs font-medium text-neutral-600 focus:border-violet-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      <option value="admin">Admin</option>
                      <option value="editeur">Éditeur</option>
                      <option value="lecteur">Lecteur</option>
                    </select>
                    {changingRoleId === member.id ? (
                      <Loader2 className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-neutral-400" />
                    ) : (
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removingId === member.id}
                    className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    title="Retirer de l&apos;équipe"
                  >
                    {removingId === member.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/30">
          <div className="flex items-center gap-3 border-b border-amber-100 px-4 py-3 dark:border-amber-500/20">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Invitations en attente ({invitations.length})
            </span>
          </div>
          <div className="divide-y divide-amber-100 dark:divide-amber-500/10">
            {invitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm dark:bg-amber-500/10">
                    <Mail className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                      {invite.email}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Expire le{" "}
                      {new Date(invite.expiresAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        timeZone: "UTC",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <RoleBadge role={invite.role || "editeur"} />
                  <button
                    onClick={() => handleRevokeInvite(invite.id)}
                    disabled={revokingId === invite.id}
                    className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    title="Annuler l&apos;invitation"
                  >
                    {revokingId === invite.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {members.length === 0 && invitations.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center dark:border-neutral-700">
          <UserPlus className="mx-auto mb-3 h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Invitez des membres pour partager votre espace DocuSafe
          </p>
        </div>
      )}
    </div>
  );
}
