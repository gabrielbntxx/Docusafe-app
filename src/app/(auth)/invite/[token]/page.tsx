"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, CheckCircle, XCircle, Loader2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

type InvitationInfo = {
  ownerName: string;
  ownerEmail: string;
  email: string;
  expiresAt: string;
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch invitation info
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/team/invite/info?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Invitation invalide");
          return;
        }
        const data = await res.json();
        setInvitation(data);
      } catch {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }
    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);

    try {
      const res = await fetch("/api/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'acceptation");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setAccepting(false);
    }
  };

  const callbackUrl = `/invite/${token}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="mb-6 flex items-center justify-center">
          <div className="rounded-full bg-violet-100 p-4 dark:bg-violet-500/20">
            <Users className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
              Bienvenue dans l&apos;equipe !
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Redirection vers le dashboard...
            </p>
          </div>
        ) : error && !invitation ? (
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
              Invitation invalide
            </h2>
            <p className="mb-6 text-neutral-500 dark:text-neutral-400">{error}</p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Retour a la connexion
            </Link>
          </div>
        ) : invitation ? (
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
              Invitation DocuSafe Business
            </h2>
            <p className="mb-6 text-neutral-500 dark:text-neutral-400">
              <strong className="text-neutral-900 dark:text-white">
                {invitation.ownerName}
              </strong>{" "}
              vous invite a rejoindre son espace DocuSafe Business.
            </p>

            {/* Features */}
            <div className="mb-6 rounded-xl bg-violet-50 p-4 text-left dark:bg-violet-500/10">
              <p className="mb-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                Vous aurez acces a :
              </p>
              <ul className="space-y-1 text-sm text-violet-600 dark:text-violet-400">
                <li>&#10003; Documents et dossiers partages</li>
                <li>&#10003; Stockage illimite</li>
                <li>&#10003; IA d&apos;analyse illimitee</li>
                <li>&#10003; Toutes les fonctionnalites Business</li>
              </ul>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {sessionStatus === "loading" ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-violet-500" />
            ) : session ? (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {accepting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Acceptation...
                  </span>
                ) : (
                  "Accepter l'invitation"
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Connectez-vous ou creez un compte pour accepter
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Link>
                <Link
                  href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <UserPlus className="h-4 w-4" />
                  Creer un compte
                </Link>
              </div>
            )}

            <p className="mt-4 text-xs text-neutral-400">
              Expire le{" "}
              {new Date(invitation.expiresAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
