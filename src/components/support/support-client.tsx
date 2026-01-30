"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

export function SupportClient() {
  const [copied, setCopied] = useState(false);
  const email = "docusafe.contact@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
              Support
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Nous sommes là pour vous aider
            </p>
          </div>
        </div>
      </div>

      {/* Contact Card */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-xl shadow-cyan-500/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Mail className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">Contactez-nous par email</h2>
            <p className="mt-1 text-sm text-cyan-100">
              Notre équipe vous répondra dans les plus brefs délais.
            </p>

            {/* Email display and copy */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 backdrop-blur-sm">
                <span className="font-medium text-sm sm:text-base">{email}</span>
              </div>
              <button
                onClick={copyEmail}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 font-medium backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copier</span>
                  </>
                )}
              </button>
            </div>

            {/* Send email button */}
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-medium text-cyan-600 shadow-lg transition-all hover:bg-cyan-50 active:scale-95"
            >
              <Mail className="h-4 w-4" />
              Envoyer un email
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Délai de réponse
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Sous 24-48 heures
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
              <MessageCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Support en français
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Équipe francophone
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800/50">
        <h3 className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <HelpCircle className="h-5 w-5 text-amber-500" />
          Pour un traitement plus rapide
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Décrivez votre problème le plus précisément possible
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Indiquez votre adresse email de connexion à DocuSafe
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Si possible, joignez des captures d&apos;écran du problème
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Mentionnez l&apos;appareil utilisé (iPhone, Android, PC, Mac)
          </li>
        </ul>
      </div>

      {/* Help Link */}
      <div className="mt-6 rounded-2xl bg-neutral-50 p-5 dark:bg-neutral-900/50">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Avant de nous contacter, consultez notre{" "}
          <Link
            href="/dashboard/help"
            className="font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Centre d&apos;aide
          </Link>{" "}
          qui répond aux questions les plus fréquentes.
        </p>
      </div>
    </div>
  );
}
