"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { translations, type Language, type TranslationKey } from "@/lib/translations";

export function useTranslation() {
  const { data: session, status } = useSession();
  // Always start with "fr" to match server-rendered HTML and avoid hydration mismatch
  const [language, setLanguage] = useState<Language>("fr");

  // Use primitive to avoid re-running on every session object reference change
  const userLanguage = session?.user?.language as Language | undefined;

  useEffect(() => {
    if (status === "authenticated") {
      const resolvedLang = userLanguage || "fr";
      setLanguage(resolvedLang);
      localStorage.setItem("docusafe-language", resolvedLang);
    } else if (status === "unauthenticated") {
      // Check localStorage for returning visitors
      try {
        const stored = localStorage.getItem("docusafe-language");
        if (stored === "en" || stored === "fr") setLanguage(stored);
      } catch {}
    }
  }, [userLanguage, status]);

  // useCallback ensures t is a stable reference — only changes when language changes.
  // Without this, any useEffect([t]) dependency fires on every render,
  // causing infinite render loops (DocuBotWidget's setMessages effect was the culprit).
  const t = useCallback((key: TranslationKey): string => {
    const translation = translations[language]?.[key] || translations.fr[key];
    return translation || key;
  }, [language]);

  const isLoading = status === "loading";

  return { t, language, isLoading };
}
