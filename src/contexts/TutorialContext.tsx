"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TutorialStep = {
  id: string;
  target: string; // CSS selector for the element to highlight
  titleKey: string; // Translation key for title
  descriptionKey: string; // Translation key for description
  position: "top" | "bottom" | "left" | "right";
  route?: string; // Optional route to navigate to
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    target: "body",
    titleKey: "tutorialWelcomeTitle",
    descriptionKey: "tutorialWelcomeDesc",
    position: "bottom",
  },
  {
    id: "upload",
    target: "[data-tutorial='upload-button']",
    titleKey: "tutorialUploadTitle",
    descriptionKey: "tutorialUploadDesc",
    position: "right",
  },
  {
    id: "documents",
    target: "[data-tutorial='documents-link']",
    titleKey: "tutorialDocumentsTitle",
    descriptionKey: "tutorialDocumentsDesc",
    position: "right",
  },
  {
    id: "folders",
    target: "[data-tutorial='folders-link']",
    titleKey: "tutorialFoldersTitle",
    descriptionKey: "tutorialFoldersDesc",
    position: "right",
  },
  {
    id: "search",
    target: "[data-tutorial='search-link']",
    titleKey: "tutorialSearchTitle",
    descriptionKey: "tutorialSearchDesc",
    position: "right",
  },
  {
    id: "docubot",
    target: "[data-tutorial='docubot-link']",
    titleKey: "tutorialDocubotTitle",
    descriptionKey: "tutorialDocubotDesc",
    position: "right",
  },
  {
    id: "settings",
    target: "[data-tutorial='settings-link']",
    titleKey: "tutorialSettingsTitle",
    descriptionKey: "tutorialSettingsDesc",
    position: "right",
  },
  {
    id: "help",
    target: "[data-tutorial='help-link']",
    titleKey: "tutorialHelpTitle",
    descriptionKey: "tutorialHelpDesc",
    position: "right",
  },
  {
    id: "complete",
    target: "body",
    titleKey: "tutorialCompleteTitle",
    descriptionKey: "tutorialCompleteDesc",
    position: "bottom",
  },
];

type TutorialContextType = {
  isActive: boolean;
  currentStep: number;
  currentStepData: TutorialStep | null;
  totalSteps: number;
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  hasCompletedTutorial: boolean;
};

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if tutorial was completed on mount
  useEffect(() => {
    const completed = localStorage.getItem("docusafe_tutorial_completed");
    if (completed !== "true") {
      setHasCompletedTutorial(false);
      // Auto-start tutorial for new users after a short delay
      setTimeout(() => {
        setIsActive(true);
      }, 1000);
    }
    setIsInitialized(true);
  }, []);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const endTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedTutorial(true);
    localStorage.setItem("docusafe_tutorial_completed", "true");
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const skipTutorial = () => {
    endTutorial();
  };

  // Don't show tutorial until initialized to avoid hydration issues
  const currentStepData = isActive && isInitialized ? TUTORIAL_STEPS[currentStep] : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive: isActive && isInitialized,
        currentStep,
        currentStepData,
        totalSteps: TUTORIAL_STEPS.length,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        hasCompletedTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
