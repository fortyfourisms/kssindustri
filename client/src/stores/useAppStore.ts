import { create } from 'zustand';

// ─── App-level bootstrap state ────────────────────────────────────────────────
// Hanya bertanggung jawab untuk satu hal: apakah app sudah selesai boot atau belum.
// Tidak ada persist middleware — state ini cukup in-memory per session tab.

interface AppState {
    /** true = bootstrap selesai, router aman di-render */
    isAppReady: boolean;
    /** true = intro loading landing page sudah pernah ditampilkan di session tab ini */
    hasSeenLandingLoading: boolean;
    setAppReady: (ready: boolean) => void;
    setHasSeenLandingLoading: (seen: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
    isAppReady: false,
    hasSeenLandingLoading: false,
    setAppReady: (ready) => set({ isAppReady: ready }),
    setHasSeenLandingLoading: (seen) => set({ hasSeenLandingLoading: seen }),
}));
