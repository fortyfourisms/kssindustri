import { create } from 'zustand';
import { ikasService } from '@/services/ikas.service';
import type { IkasData } from '@/types/ikas.types';
import type { CreateIkasPayload, UpdateIkasPayload } from '@/services/ikas.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

interface IkasState {
    /** Full list — used by admin views */
    ikasList: IkasData[];
    /** Single record scoped to the current user's company */
    currentIkas: IkasData | null;

    initialized: boolean;
    loading: boolean;
    error: string | null;

    // ── Selectors ─────────────────────────────────────────────────────────────
    getIkasById: (id: string | number) => IkasData | undefined;

    // ── Actions ───────────────────────────────────────────────────────────────

    /**
     * Load ALL IKAS records (admin).
     * Lazy — skips if already initialized.
     */
    initialize: () => Promise<void>;

    /**
     * Force-refresh the full IKAS list (admin).
     */
    refresh: () => Promise<void>;

    /**
     * Load the IKAS record that belongs to the authenticated user.
     * Pass the IKAS record ID (or company ID if the API uses company ID).
     *
     * For regular users, the UI should call this instead of `initialize`.
     */
    loadByUserId: (id: string | number) => Promise<void>;

    /** Create a new IKAS record */
    createIkas: (payload: CreateIkasPayload) => Promise<ActionResult<IkasData>>;

    /** Update an existing IKAS record */
    updateIkas: (id: string | number, payload: UpdateIkasPayload) => Promise<ActionResult<IkasData>>;

    /** Delete an IKAS record (admin only) */
    deleteIkas: (id: string | number) => Promise<ActionResult>;

    /** Import IKAS data from an Excel file (admin only) */
    importExcel: (file: File) => Promise<ActionResult>;

    /** Reset store to initial state */
    reset: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
    ikasList: [],
    currentIkas: null,
    initialized: false,
    loading: false,
    error: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useIkasStore = create<IkasState>()((set, get) => ({
    ...initialState,

    // ── Selectors ─────────────────────────────────────────────────────────────

    getIkasById: (id) =>
        get().ikasList.find((item) => String(item.id) === String(id)),

    // ── Actions ───────────────────────────────────────────────────────────────

    initialize: async () => {
        if (get().initialized) return;
        set({ loading: true, error: null });
        try {
            const data = await ikasService.getAll();
            set({ ikasList: data, initialized: true, loading: false });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Gagal memuat data IKAS',
                loading: false,
                ikasList: [],
            });
        }
    },

    refresh: async () => {
        set({ loading: true, error: null });
        try {
            const data = await ikasService.getAll();
            set({ ikasList: data, loading: false });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Gagal memperbarui data IKAS',
                loading: false,
            });
        }
    },

    /**
     * Fetch the IKAS record belonging to the current user.
     * The endpoint GET /api/maturity/ikas/{id} returns a single record.
     * Regular users should only see data scoped to their own ID.
     */
    loadByUserId: async (id) => {
        set({ loading: true, error: null });
        try {
            const data = await ikasService.getById(id);
            set({ currentIkas: data, loading: false });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Gagal memuat data IKAS Anda',
                loading: false,
                currentIkas: null,
            });
        }
    },

    createIkas: async (payload) => {
        set({ loading: true, error: null });
        try {
            const response = await ikasService.create(payload);
            // Refresh list so new record is immediately visible
            await get().refresh();
            set({ currentIkas: response });
            return { success: true, data: response };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Gagal membuat data IKAS';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    updateIkas: async (id, payload) => {
        set({ loading: true, error: null });
        try {
            const updated = await ikasService.update(id, payload);
            // Update currentIkas if it matches
            set((state) => ({
                currentIkas:
                    state.currentIkas && String(state.currentIkas.id) === String(id)
                        ? updated
                        : state.currentIkas,
                loading: false,
            }));
            // Optionally refresh list for admin views
            if (get().initialized) await get().refresh();
            return { success: true, data: updated };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Gagal memperbarui data IKAS';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    deleteIkas: async (id) => {
        set({ loading: true, error: null });
        try {
            await ikasService.delete(id);
            set((state) => ({
                ikasList: state.ikasList.filter((item) => String(item.id) !== String(id)),
                currentIkas:
                    state.currentIkas && String(state.currentIkas.id) === String(id)
                        ? null
                        : state.currentIkas,
                loading: false,
            }));
            return { success: true };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Gagal menghapus data IKAS';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    importExcel: async (file) => {
        set({ loading: true, error: null });
        try {
            const res = await ikasService.importExcel(file);
            // Refresh list after import
            await get().refresh();
            return { success: true, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Gagal mengimpor file Excel';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    reset: () => set(initialState),
}));
