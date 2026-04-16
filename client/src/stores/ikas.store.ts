import { create } from 'zustand';
import { ikasService } from '@/services/ikas.service';
import type { IkasData } from '@/types/ikas.types';
import type { CreateIkasPayload, UpdateIkasPayload } from '@/services/ikas.service';

// ─── Respondent form state (used in FormIkas) ─────────────────────────────────
export interface RespondentFormData {
    responden: string;
    jabatan: string;
    telepon: string;
    tanggal: string;
    target_nilai: number;
    kategori_kematangan_keamanan_siber: string;
}

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

    // ── Respondent form state (FormIkas step 1) ────────────────────────────────
    /** Last successfully saved respondent data */
    respondentData: RespondentFormData | null;
    /** True when respondent has been saved to backend — gates access to step 2 */
    respondentSaved: boolean;
    /** Loading state specifically for the respondent save request */
    isLoading: boolean;

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
     * Pass the IKAS record ID.
     *
     * For regular users, the UI should call this instead of `initialize`.
     */
    loadByIkasId: (id: string | number) => Promise<void>;

    /** Create a new IKAS record */
    createIkas: (payload: CreateIkasPayload) => Promise<ActionResult<IkasData>>;

    /** Update an existing IKAS record */
    updateIkas: (id: string | number, payload: UpdateIkasPayload) => Promise<ActionResult<IkasData>>;

    /** Delete an IKAS record (admin only) */
    deleteIkas: (id: string | number) => Promise<ActionResult>;

    /** Import IKAS data from an Excel file (admin only) */
    importExcel: (file: File) => Promise<ActionResult>;

    /**
     * Save respondent data to the backend.
     * - If existingId is provided → PUT /api/maturity/ikas/:id
     * - Otherwise → POST /api/maturity/ikas
     * On success: sets respondentSaved = true, respondentData = payload, currentIkas = result.
     */
    saveRespondent: (payload: RespondentFormData, existingId?: string | null) => Promise<ActionResult<IkasData>>;

    /** Manually mark respondent as saved (e.g. after fetching existing data) */
    setRespondentSaved: (value: boolean) => void;

    /** Reset respondentSaved flag (e.g. when user edits the form) */
    resetRespondentSaved: () => void;

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
    // Respondent form state
    respondentData: null as RespondentFormData | null,
    respondentSaved: false,
    isLoading: false,
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
     * The endpoint GET /api/maturity/ikas/{id} returns a single record by its IKAS ID.
     */
    loadByIkasId: async (id) => {
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

    // ── Respondent form actions ────────────────────────────────────────────────

    saveRespondent: async (payload, existingId) => {
        set({ isLoading: true, error: null });
        try {
            let result: IkasData;
            if (existingId) {
                // Edit mode — PUT
                result = await ikasService.update(existingId, payload);
            } else {
                // Create mode — POST
                result = await ikasService.create(payload);
            }
            set({
                respondentData: payload,
                respondentSaved: true,
                currentIkas: result,
                isLoading: false,
                error: null,
            });
            // Keep list fresh
            if (get().initialized) await get().refresh();
            return { success: true, data: result };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Gagal menyimpan data responden';
            set({ isLoading: false, error: msg });
            return { success: false, error: msg };
        }
    },

    setRespondentSaved: (value) => set({ respondentSaved: value }),

    resetRespondentSaved: () => set({ respondentSaved: false }),

    reset: () => set(initialState),
}));
