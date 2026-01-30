"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TutorialStep = {
  id: string;
  target: string; // CSS selector for the element to highlight (desktop)
  mobileTarget?: string; // CSS selector for mobile element
  titleKey: string; // Translation key for title
  descriptionKey: string; // Translation key for description
  mobileTitleKey?: string; // Mobile-specific title
  mobileDescriptionKey?: string; // Mobile-specific description
  position: "top" | "bottom" | "left" | "right";
  desktopOnly?: boolean; // Skip this step on mobile
  mobileOnly?: boolean; // Skip this step on desktop
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
    mobileTarget: "[data-tutorial='mobile-upload']",
    titleKey: "tutorialUploadTitle",
    descriptionKey: "tutorialUploadDesc",
    position: "right",
  },
  {
    id: "documents",
    target: "[data-tutorial='documents-link']",
    mobileTarget: "[data-tutorial='mobile-documents']",
    titleKey: "tutorialDocumentsTitle",
    descriptionKey: "tutorialDocumentsDesc",
    position: "right",
  },
  {
    id: "folders",
    target: "[data-tutorial='folders-link']",
    mobileTarget: "[data-tutorial='mobile-folders']",
    titleKey: "tutorialFoldersTitle",
    descriptionKey: "tutorialFoldersDesc",
    position: "right",
  },
  {
    id: "search",
    target: "[data-tutorial='search-link']",
    mobileTarget: "[data-tutorial='mobile-search']",
    titleKey: "tutorialSearchTitle",
    descriptionKey: "tutorialSearchDesc",
    position: "right",
  },
  // Desktop only steps
  {
    id: "docubot",
    target: "[data-tutorial='docubot-link']",
    titleKey: "tutorialDocubotTitle",
    descriptionKey: "tutorialDocubotDesc",
    position: "right",
    desktopOnly: true,
  },
  {
    id: "settings",
    target: "[data-tutorial='settings-link']",
    titleKey: "tutorialSettingsTitle",
    descriptionKey: "tutorialSettingsDesc",
    position: "right",
    desktopOnly: true,
  },
  {
    id: "help",
    target: "[data-tutorial='help-link']",
    titleKey: "tutorialHelpTitle",
    descriptionKey: "tutorialHelpDesc",
    position: "right",
    desktopOnly: true,
  },
  // Mobile only - menu explanation
  {
    id: "menu",
    target: "body",
    mobileTarget: "[data-tutorial='mobile-menu-button']",
    titleKey: "tutorialMenuTitle",
    descriptionKey: "tutorialMenuDesc",
    position: "bottom",
    mobileOnly: true,
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
  isMobile: boolean;
};

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and check tutorial completion on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const completed = localStorage.getItem("docusafe_tutorial_completed");
    if (completed !== "true") {
      setHasCompletedTutorial(false);
      // Auto-start tutorial for new users after a short delay
      setTimeout(() => {
        setIsActive(true);
      }, 1000);
    }
    setIsInitialized(true);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter steps based on device type
  const filteredSteps = TUTORIAL_STEPS.filter((step) => {
    if (isMobile && step.desktopOnly) return false;
    if (!isMobile && step.mobileOnly) return false;
    return true;
  });

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
    if (currentStep < filteredSteps.length - 1) {
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
  const currentStepData = isActive && isInitialized ? filteredSteps[currentStep] : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive: isActive && isInitialized,
        currentStep,
        currentStepData,
        totalSteps: filteredSteps.length,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        hasCompletedTutorial,
        isMobile,
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
