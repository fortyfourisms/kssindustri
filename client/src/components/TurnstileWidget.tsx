import { useEffect, useRef, useState } from "react";

type TurnstileWidgetProps = {
    siteKey: string;
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: (error?: unknown) => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "flexible" | "compact";
};

declare global {
    interface Window {
        turnstile?: {
            ready: (callback: () => void) => void;
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    callback?: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: (error?: unknown) => void;
                    theme?: "light" | "dark" | "auto";
                    size?: "normal" | "flexible" | "compact";
                }
            ) => string;
            remove?: (widgetId: string) => void;
            reset?: (widgetId?: string) => void;
            getResponse?: (widgetId?: string) => string;
            isExpired?: (widgetId?: string) => boolean;
        };
    }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript(): Promise<void> {
    if (window.turnstile) {
        return Promise.resolve();
    }

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
        return new Promise((resolve, reject) => {
            existingScript.addEventListener("load", () => resolve(), { once: true });
            existingScript.addEventListener("error", () => reject(new Error("Failed to load Turnstile")), { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Turnstile"));
        document.head.appendChild(script);
    });
}

export function TurnstileWidget({
    siteKey,
    onVerify,
    onExpire,
    onError,
    theme = "light",
    size = "flexible",
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!siteKey) {
            setLoadError("Turnstile site key is missing. Please contact the administrator.");
            onError?.();
            return;
        }

        let isMounted = true;

        loadTurnstileScript()
            .then(() => {
                if (!isMounted || !window.turnstile || !containerRef.current) return;
                if (widgetIdRef.current) return;

                window.turnstile.ready(() => {
                    if (!isMounted || !window.turnstile || !containerRef.current) return;
                    if (widgetIdRef.current) return;

                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: siteKey,
                        theme,
                        size,
                        callback: (token: string) => {
                            onVerify(token);
                            setLoadError(null);
                        },
                        "expired-callback": () => {
                            setLoadError("Turnstile verification expired. Please verify again.");
                            onExpire?.();
                        },
                        "error-callback": (error?: unknown) => {
                            setLoadError("Turnstile verification failed. Please retry.");
                            onError?.(error);
                        },
                    });
                });
            })
            .catch(() => {
                if (!isMounted) return;
                setLoadError("Turnstile failed to load. Please refresh the page.");
                onError?.();
            });

        return () => {
            isMounted = false;
            if (widgetIdRef.current && window.turnstile?.remove) {
                window.turnstile.remove(widgetIdRef.current);
            }
            widgetIdRef.current = null;
        };
    }, [onError, onExpire, onVerify, siteKey, size, theme]);

    return (
        <div className="space-y-2">
            <div
                ref={containerRef}
                className="min-h-[65px] rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm"
            />
            {loadError && <p className="text-xs font-semibold text-red-500">{loadError}</p>}
        </div>
    );
}
