// ─── Perusahaan Types ─────────────────────────────────────────────────────────

export interface Perusahaan {
    id: string;
    slug: string;
    photo?: string;
    nama_perusahaan: string;
    sektor: string;
    alamat: string;
    telepon: string;
    email: string;
    website: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreatePerusahaanPayload {
    alamat: string;
    email: string;
    nama_perusahaan: string;
    photo?: File | string;
    id_sub_sektor: string;
    telepon: string;
    website: string;
}

export interface CreatePerusahaanResponse {
    id: string;
    nilai_deteksi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
}
