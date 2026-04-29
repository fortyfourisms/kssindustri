import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

type TurnstileWidgetProps = {
    siteKey: string;
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: (error?: unknown) => void;
    onTimeout?: () => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "flexible" | "compact";
    retry?: "auto" | "never";
    retryInterval?: number;
};

export type TurnstileWidgetHandle = {
    reset: () => void;
};

type TurnstileLifecycleState = "idle" | "ready" | "verified" | "expired" | "error" | "timeout";

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
                    "timeout-callback"?: () => void;
                    theme?: "light" | "dark" | "auto";
                    size?: "normal" | "flexible" | "compact";
                    retry?: "auto" | "never";
                    "retry-interval"?: number;
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

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(function TurnstileWidget({
    siteKey,
    onVerify,
    onExpire,
    onError,
    onTimeout,
    theme = "light",
    size = "flexible",
    retry = "auto",
    retryInterval = 8000,
}, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const lifecycleRef = useRef<TurnstileLifecycleState>("idle");
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);
    const onTimeoutRef = useRef(onTimeout);

    useEffect(() => {
        onVerifyRef.current = onVerify;
        onExpireRef.current = onExpire;
        onErrorRef.current = onError;
        onTimeoutRef.current = onTimeout;
    }, [onError, onExpire, onTimeout, onVerify]);

    const resetWidget = useCallback(() => {
        setLoadError(null);
        lifecycleRef.current = "ready";
        if (widgetIdRef.current && window.turnstile?.reset) {
            window.turnstile.reset(widgetIdRef.current);
        }
    }, []);

    useImperativeHandle(ref, () => ({
        reset: resetWidget,
    }), [resetWidget]);

    useEffect(() => {
        if (!siteKey) {
            setLoadError("Turnstile site key is missing. Please contact the administrator.");
            lifecycleRef.current = "error";
            onErrorRef.current?.();
            return;
        }

        let isMounted = true;

        loadTurnstileScript()
            .then((turnstile) => {
                if (!isMounted || !containerRef.current) return;
                if (widgetIdRef.current) return;

                lifecycleRef.current = "ready";
                widgetIdRef.current = turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    theme,
                    size,
                    retry,
                    "retry-interval": retryInterval,
                    callback: (token: string) => {
                        lifecycleRef.current = "verified";
                        onVerifyRef.current(token);
                        setLoadError(null);
                    },
                    "expired-callback": () => {
                        if (lifecycleRef.current === "expired") return;
                        lifecycleRef.current = "expired";
                        setLoadError("Turnstile verification expired. Please verify again.");
                        onExpireRef.current?.();
                    },
                    "error-callback": (error?: unknown) => {
                        if (lifecycleRef.current === "error") return;
                        lifecycleRef.current = "error";
                        setLoadError("Turnstile verification failed. Please retry.");
                        onErrorRef.current?.(error);
                    },
                    "timeout-callback": () => {
                        if (lifecycleRef.current === "timeout") return;
                        lifecycleRef.current = "timeout";
                        setLoadError("Turnstile timed out. Please complete the challenge again.");
                        onTimeoutRef.current?.();
                    },
                });
            })
            .catch((error) => {
                if (!isMounted) return;
                lifecycleRef.current = "error";
                console.error("Turnstile failed to initialize", {
                    error,
                    siteKey,
                    scriptSrc: TURNSTILE_SCRIPT_SRC,
                    hostname: window.location.hostname,
                });
                const message = error instanceof Error ? error.message : "Turnstile failed to load";
                setLoadError(`${message}. Please refresh the page.`);
                onErrorRef.current?.(error);
            });

        return () => {
            isMounted = false;
            lifecycleRef.current = "idle";
            if (widgetIdRef.current && window.turnstile?.remove) {
                window.turnstile.remove(widgetIdRef.current);
            }
            widgetIdRef.current = null;
        };
    }, [resetWidget, retry, retryInterval, siteKey, size, theme]);

    return (
        <div className="space-y-2">
            <div
                ref={containerRef}
                className="min-h-[65px] rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm"
            />
            {loadError && <p className="text-xs font-semibold text-red-500">{loadError}</p>}
        </div>
    );
});
