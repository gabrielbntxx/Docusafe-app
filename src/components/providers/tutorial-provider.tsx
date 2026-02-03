"use client";

import { TutorialProvider as TutorialContextProvider } from "@/contexts/TutorialContext";
import { ReactNode } from "react";

// TutorialOverlay disabled to fix navigation issues
// But context is still provided for settings page
export function TutorialProvider({ children }: { children: ReactNode }) {
  return (
    <TutorialContextProvider>
      {children}
      {/* TutorialOverlay removed - was causing navigation freeze */}
    </TutorialContextProvider>
  );
}
