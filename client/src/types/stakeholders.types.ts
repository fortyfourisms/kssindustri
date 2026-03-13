// ─── Stakeholder Types ───────────────────────────────────────────────────────

export interface Stakeholder {
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

export interface CreateStakeholderPayload {
    alamat: string;
    email: string;
    nama_perusahaan: string;
    photo: string;
    sektor: string;
    telepon: string;
    website: string;
}

export interface CreateStakeholderResponse {
    id: string;
    nilai_deteksi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
}
