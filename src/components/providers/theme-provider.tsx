"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [theme, setThemeState] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    if (status === "authenticated") {
      const userTheme = (session?.user?.theme as Theme) || "light";
      setThemeState(userTheme);

      // Apply theme and save to localStorage for instant loading next time
      if (userTheme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("docusafe-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("docusafe-theme", "light");
      }
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setThemeState("light");
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("docusafe-theme");
      setIsLoading(false);
    }
  }, [session, status]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;

    setThemeState(newTheme);

    // Apply theme and save to localStorage
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("docusafe-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("docusafe-theme", "light");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
