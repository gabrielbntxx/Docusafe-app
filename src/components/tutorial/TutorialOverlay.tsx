"use client";

import { useEffect, useState, useCallback } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { useTranslation } from "@/hooks/useTranslation";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

type Position = {
  top: number;
  left: number;
  width: number;
  height: number;
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
  } = useTutorial();
  const { t } = useTranslation();
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const calculatePosition = useCallback(() => {
    if (!currentStepData) return;

    // Special case for welcome and complete screens
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

    const element = document.querySelector(currentStepData.target);
    if (!element) {
      setTargetPosition(null);
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 6;

    setTargetPosition({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Calculate tooltip position
    const tooltipWidth = 300;
    const tooltipHeight = 220; // Approximate height
    const gap = 12;
    const margin = 16; // Minimum margin from screen edges

    let style: React.CSSProperties = { position: "fixed" };

    switch (currentStepData.position) {
      case "right":
        style.left = rect.right + gap;
        // Check if tooltip fits on the right
        if (rect.right + gap + tooltipWidth > window.innerWidth - margin) {
          // Position below instead
          style.left = Math.max(margin, Math.min(rect.left, window.innerWidth - tooltipWidth - margin));
          style.top = rect.bottom + gap;
        } else {
          // Position to the right, vertically centered but within bounds
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
        // If would go below screen, position above instead
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
  }, [currentStepData]);

  useEffect(() => {
    if (isActive) {
      // Small delay to ensure DOM elements are rendered
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

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* SVG mask for spotlight effect - no blur, clean cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            {/* White = visible (dark overlay), Black = hidden (spotlight hole) */}
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
        {/* Dark overlay with mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
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

      {/* Tooltip/Dialog */}
      <div
        className={`pointer-events-auto z-10 w-[300px] max-w-[calc(100vw-32px)] rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-800 ${
          isCentered ? "text-center" : ""
        }`}
        style={tooltipStyle}
      >
        {/* Close button */}
        <button
          onClick={skipTutorial}
          className="absolute right-2 top-2 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon for welcome/complete */}
        {isCentered && (
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
        )}

        {/* Step indicator dots */}
        {!isCentered && (
          <div className="mb-2 flex items-center gap-1 pr-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentStep
                    ? "bg-blue-500"
                    : "bg-neutral-200 dark:bg-neutral-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <h3 className="mb-1.5 text-base font-bold text-neutral-900 dark:text-white pr-6">
          {t(currentStepData.titleKey as any)}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t(currentStepData.descriptionKey as any)}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isWelcome && (
            <button
              onClick={prevStep}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {isWelcome && (
            <button
              onClick={skipTutorial}
              className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              {t("tutorialSkip" as any)}
            </button>
          )}

          <button
            onClick={nextStep}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600 active:scale-[0.98]"
          >
            {isComplete
              ? t("tutorialFinish" as any)
              : isWelcome
              ? t("tutorialStart" as any)
              : t("tutorialNext" as any)}
            {!isComplete && <ChevronRight className="h-4 w-4" />}
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
