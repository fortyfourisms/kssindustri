import { apiClient } from './apiClient';
import type { IkasData, CreateIkasPayload, UpdateIkasPayload } from '@/types/ikas.types';

// Re-export so existing imports from this service still work
export type { CreateIkasPayload, UpdateIkasPayload };

// ─── Normalize helpers ────────────────────────────────────────────────────────

function normalizeList<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.ikas)) return res.ikas;
    if (res && typeof res === 'object') {
        const arrVal = Object.values(res).find((v) => Array.isArray(v));
        if (arrVal) return arrVal as T[];
    }
    return [];
}

function normalizeOne<T>(res: any): T {
    if (Array.isArray(res)) return res[0];
    if (res && res.data) {
        return Array.isArray(res.data) ? res.data[0] : res.data;
    }
    return res;
}

// ─── IKAS Service ─────────────────────────────────────────────────────────────

/**
 * IKAS Service — wraps all /api/maturity/ikas endpoints.
 *
 * For user-facing views, use `getById(id)` where `id` is the IKAS record ID
 * that belongs to the authenticated user's company.  Admin-level operations
 * (getAll, create, import, delete) are also exposed here but should be
 * restricted at the UI layer based on role.
 */
export const ikasService = {
    // ── Read ──────────────────────────────────────────────────────────────────

    /** GET /api/maturity/ikas — List all IKAS records (admin only) */
    async getAll(): Promise<IkasData[]> {
        const res = await apiClient.get<any>('/api/maturity/ikas');
        return normalizeList<IkasData>(res);
    },

    /** GET /api/maturity/ikas/{id} — Fetch a single IKAS record by its ID.
     *  For regular users: pass the ID that belongs to their own company. */
    async getById(id: number | string): Promise<IkasData> {
        const res = await apiClient.get<any>(`/api/maturity/ikas/${id}`);
        return normalizeOne<IkasData>(res);
    },

    // ── Write ─────────────────────────────────────────────────────────────────

    /** POST /api/maturity/ikas — Create a new IKAS record */
    async create(payload: CreateIkasPayload): Promise<IkasData> {
        return apiClient.post<IkasData>('/api/maturity/ikas', payload);
    },

    /** PUT /api/maturity/ikas/{id} — Update an existing IKAS record */
    async update(id: number | string, payload: UpdateIkasPayload): Promise<IkasData> {
        return apiClient.put<IkasData>(`/api/maturity/ikas/${id}`, payload);
    },

    /** DELETE /api/maturity/ikas/{id} — Delete an IKAS record */
    async delete(id: number | string): Promise<void> {
        return apiClient.delete(`/api/maturity/ikas/${id}`);
    },

    // ── Import ────────────────────────────────────────────────────────────────

    /** POST /api/maturity/ikas/import — Import IKAS data from an Excel file */
    async importExcel(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post<any>('/api/maturity/ikas/import', formData);
    },
};
