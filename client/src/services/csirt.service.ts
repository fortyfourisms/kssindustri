import { apiClient } from './apiClient';
import type { CsirtMember, CreateCsirtPayload, SdmCsirt, SeCsirt, CreateSePayload } from '@/types/csirt.types';

/**
 * CSIRT Service — handles data fetching for CSIRT domain.
 */
export const csirtService = {
    /** Get all CSIRT members */
    async getMembers(): Promise<CsirtMember[]> {
        return apiClient.get<CsirtMember[]>('/api/csirt');
    },

    /** Get CSIRT member by ID */
    async getMemberById(id: number | string): Promise<CsirtMember> {
        return apiClient.get<CsirtMember>(`/api/csirt/${id}`);
    },

    /** Create a new CSIRT member */
    async create(payload: CreateCsirtPayload | FormData): Promise<CsirtMember> {
        return apiClient.post<CsirtMember>('/api/csirt', payload);
    },

    /** Update a CSIRT member by ID */
    async update(id: number | string, payload: Partial<CreateCsirtPayload> | FormData): Promise<CsirtMember> {
        return apiClient.put<CsirtMember>(`/api/csirt/${id}`, payload);
    },

    /** Delete a CSIRT member by ID */
    async delete(id: number | string): Promise<void> {
        return apiClient.delete(`/api/csirt/${id}`);
    },

    /** Get SDM (human resources) for a CSIRT */
    async getSdmByCsirtId(id: number | string): Promise<SdmCsirt[]> {
        return apiClient.get<SdmCsirt[]>(`/api/sdm_csirt?id_csirt=${id}`);
    },

    /** Get SE (systems/infrastructure) for a CSIRT */
    async getSeByCsirtId(id: number | string): Promise<SeCsirt[]> {
        return apiClient.get<SeCsirt[]>(`/api/se?id_csirt=${id}`);
    },

    // ── SE (Sistem Elektronik) CRUD via /api/se ─────────────────────────────

    /** Get SE by its own ID (GET /api/se/{id}) */
    async getSeById(id: string | number): Promise<SeCsirt> {
        return apiClient.get<SeCsirt>(`/api/se/${id}`);
    },

    /** Create a new SE record (POST /api/se) */
    async createSe(payload: CreateSePayload): Promise<SeCsirt> {
        return apiClient.post<SeCsirt>('/api/se', payload);
    },

    /** Update a SE record by its own ID (PUT /api/se/{id}) */
    async updateSe(id: number | string, payload: Partial<Omit<SeCsirt, 'id'>>): Promise<SeCsirt> {
        return apiClient.put<SeCsirt>(`/api/se/${id}`, payload);
    },
};

