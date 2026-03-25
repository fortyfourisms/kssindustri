import { apiClient } from './apiClient';
import type { CsirtMember, CreateCsirtPayload, SdmCsirt, SeCsirt, CreateSePayload, CreateSdmPayload } from '@/types/csirt.types';

/**
 * Normalize API response:
 * Backend may return data as:
 *   - plain array/object  → return as-is
 *   - { data: [...] }     → return .data
 *   - { csirt: {...} }    → return .csirt
 *   - { sdm: [...] }      → return .sdm
 *   - { se: [...] }       → return .se
 */
function normalizeList<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.sdm)) return res.sdm;
    if (res && Array.isArray(res.se)) return res.se;
    if (res && Array.isArray(res.csirt)) return res.csirt;
    // single object wrapped → wrap in array
    if (res && typeof res === 'object' && !Array.isArray(res)) {
        // Check for any array property
        const arrVal = Object.values(res).find(v => Array.isArray(v));
        if (arrVal) return arrVal as T[];
    }
    return [];
}

function normalizeOne<T>(res: any): T {
    if (res && res.data && !Array.isArray(res.data)) return res.data;
    if (res && res.csirt) return res.csirt;
    return res;
}

/**
 * CSIRT Service — handles data fetching for CSIRT domain.
 */
export const csirtService = {
    /** Get all CSIRT members */
    async getMembers(): Promise<CsirtMember[]> {
        const res = await apiClient.get<any>('/api/csirt');
        console.log('[CSIRT DEBUG] GET /api/csirt raw:', res);
        return normalizeList<CsirtMember>(res);
    },

    /** Get CSIRT member by ID */
    async getMemberById(id: number | string): Promise<CsirtMember> {
        const res = await apiClient.get<any>(`/api/csirt/${id}`);
        return normalizeOne<CsirtMember>(res);
    },

    /** Create a new CSIRT member */
    async create(payload: CreateCsirtPayload | FormData): Promise<CsirtMember> {
        return apiClient.post<CsirtMember>('/api/csirt', payload);
    },

    /** Update a CSIRT member by ID */
    async update(id: number | string, payload: Partial<CreateCsirtPayload> | FormData): Promise<CsirtMember> {
        if (payload instanceof FormData) {
            payload.append("_method", "PUT");
            return apiClient.post<CsirtMember>(`/api/csirt/${id}`, payload);
        }
        return apiClient.put<CsirtMember>(`/api/csirt/${id}`, payload);
    },

    /** Delete a CSIRT member by ID */
    async delete(id: number | string): Promise<void> {
        return apiClient.delete(`/api/csirt/${id}`);
    },

    /** Get SDM (human resources) for a CSIRT */
    async getSdmByCsirtId(id: number | string): Promise<SdmCsirt[]> {
        const res = await apiClient.get<any>(`/api/sdm_csirt?id_csirt=${id}`);
        console.log('[CSIRT DEBUG] GET /api/sdm_csirt raw:', res);
        return normalizeList<SdmCsirt>(res);
    },

    /** Get SE (systems/infrastructure) for a CSIRT */
    async getSeByCsirtId(id: number | string): Promise<SeCsirt[]> {
        const res = await apiClient.get<any>(`/api/se?id_csirt=${id}`);
        console.log('[CSIRT DEBUG] GET /api/se raw:', res);
        return normalizeList<SeCsirt>(res);
    },

    // ── SDM (Sumber Daya Manusia) CRUD via /api/sdm_csirt ────────────────────

    /** Create a new SDM record (POST /api/sdm_csirt) */
    async createSdm(payload: CreateSdmPayload): Promise<SdmCsirt> {
        return apiClient.post<SdmCsirt>('/api/sdm_csirt', payload);
    },

    /** Update a SDM record by ID (PUT /api/sdm_csirt/{id}) */
    async updateSdm(id: number | string, payload: Partial<CreateSdmPayload>): Promise<SdmCsirt> {
        return apiClient.put<SdmCsirt>(`/api/sdm_csirt/${id}`, payload);
    },

    /** Delete a SDM record by ID (DELETE /api/sdm_csirt/{id}) */
    async deleteSdm(id: number | string): Promise<void> {
        return apiClient.delete(`/api/sdm_csirt/${id}`);
    },

    // ── SE (Sistem Elektronik) CRUD via /api/se ─────────────────────────────

    /** Get SE by its own ID (GET /api/se/{id}) */
    async getSeById(id: string | number): Promise<SeCsirt> {
        const res = await apiClient.get<any>(`/api/se/${id}`);
        return normalizeOne<SeCsirt>(res);
    },

    /** Create a new SE record (POST /api/se) */
    async createSe(payload: CreateSePayload): Promise<SeCsirt> {
        return apiClient.post<SeCsirt>('/api/se', payload);
    },

    /** Update a SE record by its own ID (PUT /api/se/{id}) */
    async updateSe(id: number | string, payload: Partial<Omit<SeCsirt, 'id'>>): Promise<SeCsirt> {
        return apiClient.put<SeCsirt>(`/api/se/${id}`, payload);
    },

    /** Delete a SE record by its own ID (DELETE /api/se/{id}) */
    async deleteSe(id: number | string): Promise<void> {
        return apiClient.delete(`/api/se/${id}`);
    },
};
