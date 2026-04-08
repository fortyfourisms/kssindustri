import { create } from 'zustand';

// ─── App-level bootstrap state ────────────────────────────────────────────────
// Hanya bertanggung jawab untuk satu hal: apakah app sudah selesai boot atau belum.
// Tidak ada persist middleware — state ini cukup in-memory per session tab.

interface AppState {
    /** true = bootstrap selesai, router aman di-render */
    isAppReady: boolean;
    setAppReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
    isAppReady: false,
    setAppReady: (ready) => set({ isAppReady: ready }),
}));
