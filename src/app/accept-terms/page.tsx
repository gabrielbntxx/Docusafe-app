"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, FileText, Lock } from "lucide-react";

export default function AcceptTermsPage() {
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = acceptedTerms && acceptedPrivacy && !isLoading;

  async function handleAccept() {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedTerms, acceptedPrivacy }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Une erreur s'est produite. Réessayez.");
        return;
      }

      // Redirect to dashboard after acceptance
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Avant de continuer
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Veuillez lire et accepter nos conditions pour accéder à DocuSafe
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-neutral-800/50 space-y-6">

          {/* What you're agreeing to */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Conditions Générales d&apos;Utilisation
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Règles d&apos;utilisation du service, responsabilités, résiliation, droit applicable (droit français)
                </p>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Lire les CGU →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Politique de confidentialité
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Traitement de vos données personnelles, chiffrement, vos droits RGPD, sous-traitants
                </p>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Lire la politique →
                </a>
              </div>
            </div>
          </div>

          {/* Checkboxes — explicit, separate consent */}
          <div className="space-y-4 border-t border-neutral-100 pt-5 dark:border-neutral-700">
            {/* Checkbox 1: CGU */}
            <div className="flex items-start gap-3">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
              />
              <label
                htmlFor="accept-terms"
                className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed cursor-pointer"
              >
                J&apos;ai lu et j&apos;accepte intégralement les{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Conditions Générales d&apos;Utilisation
                </a>
                , y compris les clauses de limitation de responsabilité et de droit applicable français.
              </label>
            </div>

            {/* Checkbox 2: Privacy */}
            <div className="flex items-start gap-3">
              <input
                id="accept-privacy"
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
              />
              <label
                htmlFor="accept-privacy"
                className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed cursor-pointer"
              >
                J&apos;ai lu et j&apos;accepte la{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Politique de confidentialité
                </a>{" "}
                et je consens au traitement de mes données personnelles conformément au RGPD pour la fourniture du service.
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleAccept}
            disabled={!canSubmit}
            className={`w-full rounded-xl py-3 px-6 text-sm font-semibold transition-all ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500"
            }`}
          >
            {isLoading ? "Enregistrement..." : "Accepter et accéder à DocuSafe"}
          </button>

          {/* Legal note */}
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
            La date et l&apos;heure de votre acceptation sont enregistrées conformément aux exigences légales.
            <br />
            En refusant, vous ne pourrez pas accéder au service.{" "}
            <a href="mailto:legal@docusafe.online" className="hover:underline">
              legal@docusafe.online
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
