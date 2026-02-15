"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { translations, type Language, type TranslationKey } from "@/lib/translations";

export function useTranslation() {
  const { data: session, status } = useSession();
  // Always start with "fr" to match server-rendered HTML and avoid hydration mismatch
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    if (status === "authenticated") {
      const userLanguage = (session?.user?.language as Language) || "fr";
      setLanguage(userLanguage);
      localStorage.setItem("docusafe-language", userLanguage);
    } else if (status === "unauthenticated") {
      // Check localStorage for returning visitors
      try {
        const stored = localStorage.getItem("docusafe-language");
        if (stored === "en" || stored === "fr") setLanguage(stored);
      } catch {}
    }
  }, [session, status]);

  const t = (key: TranslationKey): string => {
    const translation = translations[language]?.[key] || translations.fr[key];
    return translation || key;
  };

  const isLoading = status === "loading";

  return { t, language, isLoading };
}
