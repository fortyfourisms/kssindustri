import { create } from 'zustand';
import { csirtService } from '@/services/csirt.service';
import type { CsirtMember, CreateCsirtPayload } from '@/types/csirt.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

interface CsirtState {
    csirts: CsirtMember[];
    initialized: boolean;
    loading: boolean;
    error: string | null;

    // ── Derived ──────────────────────────────────────────────────────────────
    getCsirtById: (id: number) => CsirtMember | undefined;

    // ── Actions ───────────────────────────────────────────────────────────────
    initialize: () => Promise<void>;
    refresh: () => Promise<void>;
    createCsirt: (payload: CreateCsirtPayload) => Promise<ActionResult<CsirtMember>>;
    updateCsirtById: (id: number, updates: Partial<CreateCsirtPayload>) => Promise<ActionResult<CsirtMember>>;
    deleteCsirtById: (id: number) => Promise<ActionResult>;
    generateSlug: (name: string) => string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCsirtStore = create<CsirtState>()((set, get) => ({
    csirts: [],
    initialized: false,
    loading: false,
    error: null,

    getCsirtById: (id) => get().csirts.find((c) => c.id === id),

    generateSlug: (name) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),

    initialize: async () => {
        if (get().initialized) return; // lazy-load once
        set({ loading: true, error: null });
        try {
            const data = await csirtService.getMembers();
            set({
                csirts: data.map((c) => ({
                    ...c,
                    slug: c.slug ?? get().generateSlug(c.nama_csirt),
                })),
                initialized: true,
                loading: false,
            });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load CSIRTs',
                loading: false,
                csirts: [],
            });
        }
    },

    refresh: async () => {
        set({ loading: true, error: null });
        try {
            const data = await csirtService.getMembers();
            set({
                csirts: data.map((c) => ({
                    ...c,
                    slug: c.slug ?? get().generateSlug(c.nama_csirt),
                })),
                loading: false,
            });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Failed to refresh CSIRTs',
                loading: false,
            });
        }
    },

    createCsirt: async (payload) => {
        set({ loading: true, error: null });
        try {
            const response = await csirtService.create(payload);
            await get().refresh();
            return { success: true, data: response };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to create CSIRT';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    updateCsirtById: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updated = await csirtService.update(id, updates);
            await get().refresh();
            return { success: true, data: updated };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to update CSIRT';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },

    deleteCsirtById: async (id) => {
        set({ loading: true, error: null });
        try {
            await csirtService.delete(id);
            set((state) => ({
                csirts: state.csirts.filter((c) => c.id !== id),
                loading: false,
            }));
            return { success: true };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to delete CSIRT';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
        }
    },
}));
