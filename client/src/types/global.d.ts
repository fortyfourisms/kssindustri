interface Window {
    _env_?: {
        // Runtime-injected frontend config from `dist/env-config.js`.
        VITE_API_BASE_URL?: string;
        TURNSTILE_SITE_KEY?: string;
    };
}
