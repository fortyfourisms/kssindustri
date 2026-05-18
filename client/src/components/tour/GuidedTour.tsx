import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface GuidedTourStep {
    id: string;
    title: string;
    description: string;
    target?: string;
    placement?: TourPlacement;
    doneLabel?: string;
}

interface GuidedTourProps {
    steps: GuidedTourStep[];
    storageKey: string;
    enabled?: boolean;
    openSignal?: number;
    onFinish?: () => void;
}

interface RectBox {
    top: number;
    left: number;
    width: number;
    height: number;
}

const VIEWPORT_MARGIN = 16;
const TOOLTIP_GAP = 18;
const HIGHLIGHT_PADDING = 18;

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getTargetElement(step: GuidedTourStep) {
    if (!step.target) return null;
    return document.querySelector(step.target) as HTMLElement | null;
}

export function GuidedTour({ steps, storageKey, enabled = true, openSignal = 0, onFinish }: GuidedTourProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<RectBox | null>(null);
    const [mounted, setMounted] = useState(false);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const hasCheckedStorageRef = useRef(false);
    const lastOpenSignalRef = useRef(openSignal);

    const currentStep = steps[currentStepIndex];
    const totalSteps = steps.length;

    const markCompleted = useCallback(() => {
        window.localStorage.setItem(storageKey, "true");
    }, [storageKey]);

    const closeTour = useCallback(
        (shouldPersist: boolean) => {
            if (shouldPersist) {
                markCompleted();
                onFinish?.();
            }
            setIsOpen(false);
            setCurrentStepIndex(0);
        },
        [markCompleted, onFinish]
    );

    const updateTargetRect = useCallback(() => {
        if (!isOpen || !currentStep) return;

        if (!currentStep.target || currentStep.placement === "center") {
            setTargetRect(null);
            return;
        }

        const element = getTargetElement(currentStep);
        if (!element) {
            setTargetRect(null);
            return;
        }

        const rect = element.getBoundingClientRect();
        setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });
    }, [currentStep, isOpen]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!enabled || hasCheckedStorageRef.current) return;
        hasCheckedStorageRef.current = true;
        const isCompleted = window.localStorage.getItem(storageKey) === "true";
        if (!isCompleted) {
            setIsOpen(true);
        }
    }, [enabled, storageKey]);

    useEffect(() => {
        if (!enabled) return;
        if (openSignal === lastOpenSignalRef.current) return;

        lastOpenSignalRef.current = openSignal;
        setCurrentStepIndex(0);
        setIsOpen(true);
    }, [enabled, openSignal]);

    useEffect(() => {
        if (!isOpen || !currentStep || !currentStep.target || currentStep.placement === "center") return;
        const element = getTargetElement(currentStep);
        if (!element) return;

        element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }, [currentStep, isOpen]);

    useLayoutEffect(() => {
        if (!isOpen) return;

        updateTargetRect();
        const handle = window.setTimeout(updateTargetRect, 320);
        window.addEventListener("resize", updateTargetRect);
        window.addEventListener("scroll", updateTargetRect, true);

        return () => {
            window.clearTimeout(handle);
            window.removeEventListener("resize", updateTargetRect);
            window.removeEventListener("scroll", updateTargetRect, true);
        };
    }, [isOpen, currentStepIndex, updateTargetRect]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeTour(true);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [closeTour, isOpen]);

    const tooltipPosition = useMemo(() => {
        if (!mounted || !isOpen) return null;

        const tooltipWidth = Math.min(360, window.innerWidth - VIEWPORT_MARGIN * 2);
        const tooltipHeight = tooltipRef.current?.offsetHeight ?? 240;

        if (!targetRect) {
            return {
                top: Math.max((window.innerHeight - tooltipHeight) / 2, VIEWPORT_MARGIN),
                left: Math.max((window.innerWidth - tooltipWidth) / 2, VIEWPORT_MARGIN),
                placement: "center" as TourPlacement,
            };
        }

        const placement = (() => {
            if (currentStep?.placement && currentStep.placement !== "center") {
                return currentStep.placement;
            }

            const spaceBottom = window.innerHeight - (targetRect.top + targetRect.height);
            const spaceTop = targetRect.top;

            if (window.innerWidth < 768) return spaceBottom > spaceTop ? "bottom" : "top";
            if (spaceBottom >= tooltipHeight + TOOLTIP_GAP) return "bottom";
            if (spaceTop >= tooltipHeight + TOOLTIP_GAP) return "top";
            return "right";
        })();

        let top = 0;
        let left = 0;

        if (placement === "bottom") {
            top = targetRect.top + targetRect.height + TOOLTIP_GAP;
            left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        } else if (placement === "top") {
            top = targetRect.top - tooltipHeight - TOOLTIP_GAP;
            left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        } else if (placement === "left") {
            top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
            left = targetRect.left - tooltipWidth - TOOLTIP_GAP;
        } else {
            top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
            left = targetRect.left + targetRect.width + TOOLTIP_GAP;
        }

        return {
            top: clamp(top, VIEWPORT_MARGIN, window.innerHeight - tooltipHeight - VIEWPORT_MARGIN),
            left: clamp(left, VIEWPORT_MARGIN, window.innerWidth - tooltipWidth - VIEWPORT_MARGIN),
            placement,
        };
    }, [currentStep?.placement, isOpen, mounted, targetRect]);

    if (!mounted || !isOpen || !currentStep || totalSteps === 0) {
        return null;
    }

    const isLastStep = currentStepIndex === totalSteps - 1;
    const spotlightRect = targetRect
        ? {
              top: Math.max(targetRect.top - HIGHLIGHT_PADDING, VIEWPORT_MARGIN / 2),
              left: Math.max(targetRect.left - HIGHLIGHT_PADDING, VIEWPORT_MARGIN / 2),
              width: targetRect.width + HIGHLIGHT_PADDING * 2,
              height: targetRect.height + HIGHLIGHT_PADDING * 2,
          }
        : null;

    const arrowClassName = (() => {
        switch (tooltipPosition?.placement) {
            case "top":
                return "left-1/2 top-full -translate-x-1/2";
            case "left":
                return "left-full top-1/2 -translate-y-1/2";
            case "right":
                return "right-full top-1/2 -translate-y-1/2";
            case "bottom":
                return "left-1/2 bottom-full -translate-x-1/2";
            default:
                return "hidden";
        }
    })();

    const arrowRotation = (() => {
        switch (tooltipPosition?.placement) {
            case "top":
                return "rotate-45";
            case "bottom":
                return "rotate-[225deg]";
            case "left":
                return "rotate-[135deg]";
            case "right":
                return "-rotate-45";
            default:
                return "";
        }
    })();

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[140]">
                <motion.div
                    className="absolute inset-0 bg-slate-950/72"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                {spotlightRect ? (
                    <motion.div
                        className="pointer-events-none absolute rounded-[30px] bg-sky-400/10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            top: spotlightRect.top - 10,
                            left: spotlightRect.left - 10,
                            width: spotlightRect.width + 20,
                            height: spotlightRect.height + 20,
                        }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                    />
                ) : null}

                {spotlightRect ? (
                    <motion.div
                        className="pointer-events-none absolute rounded-[28px] border border-white/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.66),0_0_0_3px_rgba(255,255,255,0.88),0_0_28px_rgba(56,189,248,0.28)]"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            top: spotlightRect.top,
                            left: spotlightRect.left,
                            width: spotlightRect.width,
                            height: spotlightRect.height,
                        }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        style={{
                            boxShadow:
                                "0 0 0 9999px rgba(2, 6, 23, 0.66), 0 0 0 3px rgba(255, 255, 255, 0.88), 0 0 28px rgba(56, 189, 248, 0.28)",
                        }}
                    />
                ) : null}

                <div className="absolute inset-0" aria-hidden="true" />

                {tooltipPosition ? (
                    <motion.div
                        ref={tooltipRef}
                        role="dialog"
                        aria-modal="true"
                        className="absolute w-[min(360px,calc(100vw-32px))]"
                        initial={{ opacity: 0, scale: 0.94, y: 8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            top: tooltipPosition.top,
                            left: tooltipPosition.left,
                        }}
                        exit={{ opacity: 0, scale: 0.94, y: 8 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                        <div className="relative rounded-[28px] border border-white/70 bg-white p-5 text-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.32)] sm:p-6">
                            <div
                                className={cn(
                                    "absolute h-4 w-4 border border-white/70 bg-white",
                                    arrowClassName,
                                    arrowRotation
                                )}
                            />

                            <div className="mb-4 flex items-center justify-between gap-3">
                                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                                    Step {currentStepIndex + 1} dari {totalSteps}
                                </span>
                            </div>

                            <h3 className="text-lg font-black tracking-tight text-slate-950">
                                {currentStep.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {currentStep.description}
                            </p>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => closeTour(true)}
                                    className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                                >
                                    Skip Tour
                                </button>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStepIndex((value) => Math.max(0, value - 1))}
                                        disabled={currentStepIndex === 0}
                                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isLastStep) {
                                                closeTour(true);
                                                return;
                                            }
                                            setCurrentStepIndex((value) => Math.min(totalSteps - 1, value + 1));
                                        }}
                                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        {isLastStep ? currentStep.doneLabel ?? "Selesai" : "Next"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </div>
        </AnimatePresence>,
        document.body
    );
}
