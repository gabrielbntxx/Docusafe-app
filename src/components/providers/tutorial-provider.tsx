"use client";

import { TutorialProvider as TutorialContextProvider } from "@/contexts/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { ReactNode } from "react";

export function TutorialProvider({ children }: { children: ReactNode }) {
  return (
    <TutorialContextProvider>
      {children}
      <TutorialOverlay />
    </TutorialContextProvider>
  );
}
