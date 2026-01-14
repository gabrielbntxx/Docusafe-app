"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { translations, type Language, type TranslationKey } from "@/lib/translations";

export function useTranslation() {
  const { data: session, status } = useSession();
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    if (status === "authenticated") {
      const userLanguage = session?.user?.language as Language;
      setLanguage(userLanguage || "en");
    }
  }, [session, status]);

  const t = (key: TranslationKey): string => {
    const translation = translations[language]?.[key] || translations.en[key];
    return translation || key;
  };

  const isLoading = status === "loading";

  return { t, language, isLoading };
}
