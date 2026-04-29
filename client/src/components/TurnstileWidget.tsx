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
const TURNSTILE_LOAD_TIMEOUT_MS = 15000;

function waitForTurnstileApi(timeoutMs = TURNSTILE_LOAD_TIMEOUT_MS): Promise<NonNullable<Window["turnstile"]>> {
    if (window.turnstile) {
        return Promise.resolve(window.turnstile);
    }

    return new Promise((resolve, reject) => {
        const startedAt = Date.now();

        const check = () => {
            if (window.turnstile) {
                resolve(window.turnstile);
                return;
            }

            if (Date.now() - startedAt >= timeoutMs) {
                reject(new Error("Turnstile API did not become available"));
                return;
            }

            window.setTimeout(check, 50);
        };

        check();
    });
}

function loadTurnstileScript(): Promise<NonNullable<Window["turnstile"]>> {
    if (window.turnstile) {
        return Promise.resolve(window.turnstile);
    }

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
        return new Promise((resolve, reject) => {
            if (window.turnstile) {
                resolve(window.turnstile);
                return;
            }
            if (existingScript.dataset.loaded === "error") {
                reject(new Error("Turnstile script previously failed to load"));
                return;
            }

            const timeoutId = window.setTimeout(() => {
                reject(new Error("Turnstile script load timed out"));
            }, TURNSTILE_LOAD_TIMEOUT_MS);

            existingScript.addEventListener("load", async () => {
                window.clearTimeout(timeoutId);
                try {
                    resolve(await waitForTurnstileApi());
                } catch (error) {
                    reject(error);
                }
            }, { once: true });
            existingScript.addEventListener("error", () => {
                window.clearTimeout(timeoutId);
                reject(new Error("Turnstile script failed to load"));
            }, { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_SRC;
        const timeoutId = window.setTimeout(() => {
            script.dataset.loaded = "error";
            reject(new Error("Turnstile script load timed out"));
        }, TURNSTILE_LOAD_TIMEOUT_MS);

        script.onload = async () => {
            window.clearTimeout(timeoutId);
            script.dataset.loaded = "true";
            try {
                resolve(await waitForTurnstileApi());
            } catch (error) {
                reject(error);
            }
        };
        script.onerror = () => {
            window.clearTimeout(timeoutId);
            script.dataset.loaded = "error";
            reject(new Error("Turnstile script failed to load"));
        };
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
            .then((turnstile) => {
                if (!isMounted || !containerRef.current) return;
                if (widgetIdRef.current) return;

                widgetIdRef.current = turnstile.render(containerRef.current, {
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
            })
            .catch((error) => {
                if (!isMounted) return;
                console.error("Turnstile failed to initialize", {
                    error,
                    siteKey,
                    scriptSrc: TURNSTILE_SCRIPT_SRC,
                    hostname: window.location.hostname,
                });
                const message = error instanceof Error ? error.message : "Turnstile failed to load";
                setLoadError(`${message}. Please refresh the page.`);
                onError?.(error);
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
