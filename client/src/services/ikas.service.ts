import { apiClient } from './apiClient';
import type {
    IkasData, CreateIkasPayload, UpdateIkasPayload,
    DomainSlug, SaveJawabanPayload,
    PertanyaanIdentifikasi, PertanyaanProteksi, PertanyaanDeteksi, PertanyaanGulih,
    JawabanIdentifikasi, JawabanProteksi, JawabanDeteksi, JawabanGulih,
} from '@/types/ikas.types';

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

export const ikasService = {
    // ── IKAS Record CRUD ──────────────────────────────────────────────────────

    /** GET /api/maturity/ikas — List all IKAS records (admin only) */
    async getAll(): Promise<IkasData[]> {
        const res = await apiClient.get<any>('/api/maturity/ikas');
        return normalizeList<IkasData>(res);
    },

    /** GET /api/ikas — Fetch IKAS record(s) for the currently logged-in user */
    async getMyIkas(): Promise<IkasData | IkasData[] | null> {
        try {
            const res = await apiClient.get<any>('/api/ikas');
            return res ?? null;
        } catch {
            return null;
        }
    },

    /** GET /api/maturity/ikas?id={id} — Fetch a single IKAS record by its ID */
    async getById(id: number | string): Promise<IkasData> {
        const res = await apiClient.get<any>(`/api/maturity/ikas?id=${id}`);
        return normalizeOne<IkasData>(res);
    },

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

    /** POST /api/maturity/ikas/import — Import IKAS data from an Excel file */
    async importExcel(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post<any>('/api/maturity/ikas/import', formData);
    },

    // ── Pertanyaan (Questions) ─────────────────────────────────────────────────

    /** Fetch all questions for IDENTIFIKASI domain */
    async getPertanyaanIdentifikasi(): Promise<PertanyaanIdentifikasi[]> {
        const res = await apiClient.get<any>('/api/maturity/pertanyaan-identifikasi');
        return normalizeList<PertanyaanIdentifikasi>(res);
    },

    /** Fetch all questions for PROTEKSI domain */
    async getPertanyaanProteksi(): Promise<PertanyaanProteksi[]> {
        const res = await apiClient.get<any>('/api/maturity/pertanyaan-proteksi');
        return normalizeList<PertanyaanProteksi>(res);
    },

    /** Fetch all questions for DETEKSI domain */
    async getPertanyaanDeteksi(): Promise<PertanyaanDeteksi[]> {
        const res = await apiClient.get<any>('/api/maturity/pertanyaan-deteksi');
        return normalizeList<PertanyaanDeteksi>(res);
    },

    /** Fetch all questions for GULIH (Penanggulangan & Pemulihan) domain */
    async getPertanyaanGulih(): Promise<PertanyaanGulih[]> {
        const res = await apiClient.get<any>('/api/maturity/pertanyaan-gulih');
        return normalizeList<PertanyaanGulih>(res);
    },

    // ── Jawaban (Answers) ──────────────────────────────────────────────────────

    /** Fetch existing answers for IDENTIFIKASI domain (for current user's perusahaan) */
    async getJawabanIdentifikasi(): Promise<JawabanIdentifikasi[]> {
        const res = await apiClient.get<any>('/api/maturity/jawaban-identifikasi');
        return normalizeList<JawabanIdentifikasi>(res);
    },

    /** Fetch existing answers for PROTEKSI domain */
    async getJawabanProteksi(): Promise<JawabanProteksi[]> {
        const res = await apiClient.get<any>('/api/maturity/jawaban-proteksi');
        return normalizeList<JawabanProteksi>(res);
    },

    /** Fetch existing answers for DETEKSI domain */
    async getJawabanDeteksi(): Promise<JawabanDeteksi[]> {
        const res = await apiClient.get<any>('/api/maturity/jawaban-deteksi');
        return normalizeList<JawabanDeteksi>(res);
    },

    /** Fetch existing answers for GULIH domain */
    async getJawabanGulih(): Promise<JawabanGulih[]> {
        const res = await apiClient.get<any>('/api/maturity/jawaban-gulih');
        return normalizeList<JawabanGulih>(res);
    },

    /**
     * Save (create or update) a single answer.
     * @param domain    - which domain ('identifikasi' | 'proteksi' | 'deteksi' | 'gulih')
     * @param jawabanId - existing jawaban id for PUT, or null/undefined for POST
     * @param payload   - { pertanyaan_id, jawaban (0-5), evidence?, keterangan? }
     */
    async saveJawaban(
        domain: DomainSlug,
        jawabanId: number | null | undefined,
        payload: SaveJawabanPayload
    ): Promise<any> {
        const base = `/api/maturity/jawaban-${domain}`;
        // Remap generic fields to domain-specific field names
        const domainPayload: Record<string, any> = {
            [`pertanyaan_${domain}_id`]: payload.pertanyaan_id,
            [`jawaban_${domain}`]: payload.jawaban,
            evidence: payload.evidence ?? '',
            keterangan: payload.keterangan ?? '',
        };
        if (jawabanId) {
            return apiClient.put<any>(`${base}/${jawabanId}`, domainPayload);
        }
        return apiClient.post<any>(base, domainPayload);
    },

    // ─── Respondent ───────────────────────────────────────────────────────────
    // (kept here for backward-compat — ikas.store.saveRespondent still uses ikasService.create/update)
};
