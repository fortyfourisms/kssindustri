import { apiClient } from './apiClient';

/**
 * Perusahaan Service
 *
 * Endpoints:
 *   GET    /api/perusahaan            — List semua perusahaan
 *   POST   /api/perusahaan            — Tambah perusahaan baru
 *   GET    /api/perusahaan/dropdown   — List perusahaan untuk dropdown
 *   GET    /api/perusahaan/{id}       — Ambil perusahaan berdasarkan ID
 *   PUT    /api/perusahaan/{id}       — Update perusahaan
 *   DELETE /api/perusahaan/{id}       — Hapus perusahaan
 */
export const perusahaanService = {
    /** GET /api/perusahaan — List semua perusahaan */
    async getAll(): Promise<any[]> {
        return apiClient.get<any[]>('/api/perusahaan');
    },

    /** POST /api/perusahaan — Tambah perusahaan baru */
    async create(data: any): Promise<any> {
        return apiClient.post<any>('/api/perusahaan', data);
    },

    /** GET /api/perusahaan/dropdown — List perusahaan untuk dropdown */
    async getDropdown(): Promise<any[]> {
        return apiClient.get<any[]>('/api/perusahaan/dropdown');
    },

    /** GET /api/perusahaan/{id} — Ambil perusahaan berdasarkan ID */
    async getById(id: string): Promise<any> {
        return apiClient.get<any>(`/api/perusahaan/${id}`);
    },

    /** PUT /api/perusahaan/{id} — Update perusahaan */
    async update(id: string, data: any): Promise<any> {
        if (data instanceof FormData) {
            return apiClient.putForm<any>(`/api/perusahaan/${id}`, data);
        }
        return apiClient.put<any>(`/api/perusahaan/${id}`, data);
    },

    /** DELETE /api/perusahaan/{id} — Hapus perusahaan */
    async delete(id: string): Promise<void> {
        return apiClient.delete(`/api/perusahaan/${id}`);
    },
};
