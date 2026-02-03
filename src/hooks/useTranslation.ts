"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { translations, type Language, type TranslationKey } from "@/lib/translations";

// Get initial language from localStorage to prevent flash
function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  try {
    const stored = localStorage.getItem("docusafe-language");
    if (stored === "en" || stored === "fr") return stored;
  } catch (e) {}
  return "fr"; // Default to French
}

export function useTranslation() {
  const { data: session, status } = useSession();
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    if (status === "authenticated") {
      const userLanguage = (session?.user?.language as Language) || "fr";
      setLanguage(userLanguage);
      // Save to localStorage for instant loading next time
      localStorage.setItem("docusafe-language", userLanguage);
    } else if (status === "unauthenticated") {
      localStorage.removeItem("docusafe-language");
    }
  }, [session, status]);

  const t = (key: TranslationKey): string => {
    const translation = translations[language]?.[key] || translations.fr[key];
    return translation || key;
  };

  const isLoading = status === "loading";

  return { t, language, isLoading };
}
