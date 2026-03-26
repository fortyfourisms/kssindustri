import { apiClient } from './apiClient';
import type { Perusahaan, CreatePerusahaanPayload, CreatePerusahaanResponse } from '@/types/perusahaan.types';

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
    async getAll(): Promise<Perusahaan[]> {
        return apiClient.get<Perusahaan[]>('/api/perusahaan');
    },

    /** POST /api/perusahaan — Tambah perusahaan baru */
    async create(data: CreatePerusahaanPayload): Promise<CreatePerusahaanResponse> {
        const formData = new FormData();
        formData.append('nama_perusahaan', data.nama_perusahaan);
        formData.append('id_sub_sektor', data.id_sub_sektor);
        formData.append('email', data.email);
        formData.append('alamat', data.alamat);
        formData.append('telepon', data.telepon);
        formData.append('website', data.website);
        if (data.photo instanceof File) {
            formData.append('photo', data.photo);
        }
        return apiClient.post<CreatePerusahaanResponse>('/api/perusahaan', formData);
    },

    /** GET /api/perusahaan/dropdown — List perusahaan untuk dropdown */
    async getDropdown(): Promise<Perusahaan[]> {
        return apiClient.get<Perusahaan[]>('/api/perusahaan/dropdown');
    },

    /** GET /api/perusahaan/{id} — Ambil perusahaan berdasarkan ID */
    async getById(id: string): Promise<Perusahaan> {
        return apiClient.get<Perusahaan>(`/api/perusahaan/${id}`);
    },

    /** PUT /api/perusahaan/{id} — Update perusahaan */
    async update(id: string, data: Partial<CreatePerusahaanPayload>): Promise<Perusahaan> {
        const formData = new FormData();
        if (data.nama_perusahaan) formData.append('nama_perusahaan', data.nama_perusahaan);
        if (data.id_sub_sektor) formData.append('id_sub_sektor', data.id_sub_sektor);
        if (data.email) formData.append('email', data.email);
        if (data.alamat) formData.append('alamat', data.alamat);
        if (data.telepon) formData.append('telepon', data.telepon);
        if (data.website) formData.append('website', data.website);
        if (data.photo instanceof File) {
            formData.append('photo', data.photo);
        }
        return apiClient.put<Perusahaan>(`/api/perusahaan/${id}`, formData);
    },

    /** DELETE /api/perusahaan/{id} — Hapus perusahaan */
    async delete(id: string): Promise<void> {
        return apiClient.delete(`/api/perusahaan/${id}`);
    },
};
