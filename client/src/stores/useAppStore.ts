import { create } from 'zustand';

// ─── App-level bootstrap state ────────────────────────────────────────────────
// Hanya bertanggung jawab untuk satu hal: apakah app sudah selesai boot atau belum.
// Tidak ada persist middleware — state ini cukup in-memory per session tab.

interface AppState {
    /** true = bootstrap selesai, router aman di-render */
    isAppReady: boolean;
    /** true = intro loading landing page sudah pernah ditampilkan di session tab ini */
    hasSeenLandingLoading: boolean;
    /** tema khusus area dashboard */
    dashboardTheme: "dark" | "light";
    setAppReady: (ready: boolean) => void;
    setHasSeenLandingLoading: (seen: boolean) => void;
    setDashboardTheme: (theme: "dark" | "light") => void;
    toggleDashboardTheme: () => void;
}

const DASHBOARD_THEME_STORAGE_KEY = "kssi-dashboard-theme";
const DASHBOARD_THEME_PREFERENCE_KEY = "kssi-dashboard-theme-preference-set";

function getInitialDashboardTheme(): "dark" | "light" {
    if (typeof window === "undefined") {
        return "light";
    }

    const hasStoredPreference = window.localStorage.getItem(DASHBOARD_THEME_PREFERENCE_KEY) === "true";
    if (!hasStoredPreference) {
        return "light";
    }

    const storedTheme = window.localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
    return storedTheme === "dark" ? "dark" : "light";
}

export const useAppStore = create<AppState>()((set) => ({
    isAppReady: false,
    hasSeenLandingLoading: false,
    dashboardTheme: getInitialDashboardTheme(),
    setAppReady: (ready) => set({ isAppReady: ready }),
    setHasSeenLandingLoading: (seen) => set({ hasSeenLandingLoading: seen }),
    setDashboardTheme: (theme) => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, theme);
            window.localStorage.setItem(DASHBOARD_THEME_PREFERENCE_KEY, "true");
        }
        set({ dashboardTheme: theme });
    },
    toggleDashboardTheme: () => set((state) => {
        const nextTheme = state.dashboardTheme === "dark" ? "light" : "dark";
        if (typeof window !== "undefined") {
            window.localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, nextTheme);
            window.localStorage.setItem(DASHBOARD_THEME_PREFERENCE_KEY, "true");
        }
        return { dashboardTheme: nextTheme };
    }),
}));
