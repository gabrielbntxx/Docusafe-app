"use client";

import { useEffect, useState, useCallback } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { useTranslation } from "@/hooks/useTranslation";
import { X, ChevronLeft, ChevronRight, Sparkles, FileText, Upload, Folder, Search, Bot, Settings, HelpCircle, Menu } from "lucide-react";

type Position = {
  top: number;
  left: number;
  width: number;
  height: number;
};

// Icons for each tutorial step on mobile
const stepIcons: Record<string, React.ElementType> = {
  upload: Upload,
  documents: FileText,
  folders: Folder,
  search: Search,
  docubot: Bot,
  settings: Settings,
  help: HelpCircle,
  menu: Menu,
};

export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    prevStep,
    skipTutorial,
    isMobile,
  } = useTutorial();
  const { t } = useTranslation();
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const calculatePosition = useCallback(() => {
    if (!currentStepData) return;

    // Special case for welcome and complete screens - always centered
    if (currentStepData.target === "body") {
      setTargetPosition(null);
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    // On mobile, use mobile-specific targets
    const mobileTarget = currentStepData.mobileTarget;
    const targetSelector = isMobile && mobileTarget ? mobileTarget : currentStepData.target;

    const element = document.querySelector(targetSelector);

    // On mobile without a valid target, show centered card
    if (!element || isMobile) {
      // For mobile, always show centered with enough space for bottom nav
      if (isMobile) {
        setTargetPosition(null);
        setTooltipStyle({
          position: "fixed",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        });

        // If we found a mobile element, highlight it
        if (element) {
          const rect = element.getBoundingClientRect();
          const padding = 6;
          setTargetPosition({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          });
        }
        return;
      }

      // Desktop fallback
      setTargetPosition(null);
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    // Desktop positioning
    const rect = element.getBoundingClientRect();
    const padding = 6;

    setTargetPosition({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Calculate tooltip position for desktop
    const tooltipWidth = 300;
    const tooltipHeight = 220;
    const gap = 12;
    const margin = 16;

    let style: React.CSSProperties = { position: "fixed" };

    switch (currentStepData.position) {
      case "right":
        style.left = rect.right + gap;
        if (rect.right + gap + tooltipWidth > window.innerWidth - margin) {
          style.left = Math.max(margin, Math.min(rect.left, window.innerWidth - tooltipWidth - margin));
          style.top = rect.bottom + gap;
        } else {
          const idealTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          style.top = Math.max(margin, Math.min(idealTop, window.innerHeight - tooltipHeight - margin));
        }
        break;
      case "left":
        style.right = window.innerWidth - rect.left + gap;
        const idealTopLeft = rect.top + rect.height / 2 - tooltipHeight / 2;
        style.top = Math.max(margin, Math.min(idealTopLeft, window.innerHeight - tooltipHeight - margin));
        break;
      case "bottom":
        style.top = rect.bottom + gap;
        style.left = Math.max(margin, Math.min(rect.left, window.innerWidth - tooltipWidth - margin));
        if (rect.bottom + gap + tooltipHeight > window.innerHeight - margin) {
          style.top = Math.max(margin, rect.top - tooltipHeight - gap);
        }
        break;
      case "top":
        style.top = Math.max(margin, rect.top - tooltipHeight - gap);
        style.left = Math.max(margin, Math.min(rect.left, window.innerWidth - tooltipWidth - margin));
        break;
    }

    setTooltipStyle(style);
  }, [currentStepData, isMobile]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(calculatePosition, 100);
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
        window.removeEventListener("scroll", calculatePosition);
      };
    }
  }, [isActive, currentStep, calculatePosition]);

  if (!isActive || !currentStepData) return null;

  const isWelcome = currentStepData.id === "welcome";
  const isComplete = currentStepData.id === "complete";
  const isCentered = isWelcome || isComplete;
  const StepIcon = stepIcons[currentStepData.id] || Sparkles;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* SVG mask for spotlight effect */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetPosition && (
              <rect
                x={targetPosition.left}
                y={targetPosition.top}
                width={targetPosition.width}
                height={targetPosition.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight ring around target element */}
      {targetPosition && (
        <div
          className="absolute rounded-xl ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent transition-all duration-300 pointer-events-none"
          style={{
            top: targetPosition.top,
            left: targetPosition.left,
            width: targetPosition.width,
            height: targetPosition.height,
          }}
        />
      )}

      {/* Tooltip/Dialog - Adapted for mobile */}
      <div
        className={`pointer-events-auto z-10 rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-800 ${
          isMobile ? "w-[calc(100vw-32px)] max-w-[340px]" : "w-[300px] max-w-[calc(100vw-32px)]"
        } ${isCentered || isMobile ? "text-center" : ""}`}
        style={tooltipStyle}
      >
        {/* Close button */}
        <button
          onClick={skipTutorial}
          className="absolute right-2 top-2 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon - show for centered states or on mobile for all steps */}
        {(isCentered || isMobile) && (
          <div className={`mx-auto mb-3 flex items-center justify-center rounded-full shadow-lg ${
            isCentered
              ? "h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
              : "h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/25"
          }`}>
            <StepIcon className={`text-white ${isCentered ? "h-7 w-7" : "h-6 w-6"}`} />
          </div>
        )}

        {/* Step indicator dots */}
        {!isCentered && (
          <div className={`mb-2 flex items-center gap-1 ${isMobile ? "justify-center" : "pr-6"}`}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-colors ${
                  isMobile ? "w-6" : "flex-1"
                } ${
                  i <= currentStep
                    ? "bg-blue-500"
                    : "bg-neutral-200 dark:bg-neutral-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <h3 className={`mb-1.5 font-bold text-neutral-900 dark:text-white ${
          isMobile ? "text-lg" : "text-base pr-6"
        }`}>
          {t(currentStepData.titleKey as any)}
        </h3>
        <p className={`mb-4 leading-relaxed text-neutral-600 dark:text-neutral-400 ${
          isMobile ? "text-sm" : "text-sm"
        }`}>
          {t(currentStepData.descriptionKey as any)}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isWelcome && (
            <button
              onClick={prevStep}
              className={`flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 ${
                isMobile ? "h-11 w-11" : "h-9 w-9"
              }`}
            >
              <ChevronLeft className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
            </button>
          )}

          {isWelcome && (
            <button
              onClick={skipTutorial}
              className={`flex-1 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 ${
                isMobile ? "py-3" : "py-2"
              }`}
            >
              {t("tutorialSkip" as any)}
            </button>
          )}

          <button
            onClick={nextStep}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-500 text-sm font-semibold text-white hover:bg-blue-600 active:scale-[0.98] ${
              isMobile ? "py-3" : "py-2"
            }`}
          >
            {isComplete
              ? t("tutorialFinish" as any)
              : isWelcome
              ? t("tutorialStart" as any)
              : t("tutorialNext" as any)}
            {!isComplete && <ChevronRight className={isMobile ? "h-5 w-5" : "h-4 w-4"} />}
          </button>
        </div>

        {/* Step count */}
        {!isCentered && (
          <p className="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
            {currentStep + 1} / {totalSteps}
          </p>
        )}
      </div>
    </div>
  );
}
