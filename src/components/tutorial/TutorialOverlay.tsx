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
      // Element not found, try to find it with a delay or skip
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
    const padding = 8;

    setTargetPosition({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Calculate tooltip position based on the step's position preference
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const gap = 16;

    let style: React.CSSProperties = { position: "fixed" };

    switch (currentStepData.position) {
      case "right":
        style.top = rect.top + rect.height / 2;
        style.left = rect.right + gap;
        style.transform = "translateY(-50%)";
        // If tooltip would go off screen, position it below instead
        if (rect.right + gap + tooltipWidth > window.innerWidth) {
          style.top = rect.bottom + gap;
          style.left = rect.left;
          style.transform = "none";
        }
        break;
      case "left":
        style.top = rect.top + rect.height / 2;
        style.right = window.innerWidth - rect.left + gap;
        style.transform = "translateY(-50%)";
        break;
      case "bottom":
        style.top = rect.bottom + gap;
        style.left = rect.left + rect.width / 2;
        style.transform = "translateX(-50%)";
        break;
      case "top":
        style.bottom = window.innerHeight - rect.top + gap;
        style.left = rect.left + rect.width / 2;
        style.transform = "translateX(-50%)";
        break;
    }

    setTooltipStyle(style);
  }, [currentStepData]);

  useEffect(() => {
    if (isActive) {
      calculatePosition();
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);

      return () => {
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
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300">
        {targetPosition && (
          <div
            className="absolute rounded-2xl ring-4 ring-blue-500/50 ring-offset-2 ring-offset-transparent transition-all duration-300"
            style={{
              top: targetPosition.top,
              left: targetPosition.left,
              width: targetPosition.width,
              height: targetPosition.height,
              boxShadow: `
                0 0 0 9999px rgba(0, 0, 0, 0.6),
                0 0 30px 10px rgba(59, 130, 246, 0.3)
              `,
              background: "transparent",
            }}
          />
        )}
      </div>

      {/* Tooltip/Dialog */}
      <div
        className={`z-10 w-[320px] rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-800 ${
          isCentered ? "text-center" : ""
        }`}
        style={tooltipStyle}
      >
        {/* Close button */}
        <button
          onClick={skipTutorial}
          className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon for welcome/complete */}
        {isCentered && (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        )}

        {/* Step indicator */}
        {!isCentered && (
          <div className="mb-2 flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep
                    ? "bg-blue-500"
                    : "bg-neutral-200 dark:bg-neutral-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
          {t(currentStepData.titleKey as any)}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {t(currentStepData.descriptionKey as any)}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {!isWelcome && (
            <button
              onClick={prevStep}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {isWelcome && (
            <button
              onClick={skipTutorial}
              className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              {t("tutorialSkip" as any)}
            </button>
          )}

          <button
            onClick={nextStep}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
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
          <p className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
            {currentStep + 1} / {totalSteps}
          </p>
        )}
      </div>
    </div>
  );
}
