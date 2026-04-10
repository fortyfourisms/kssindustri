export interface DomainDeteksi {
    id: number;
    kategori_tingkat_kematangan_domain: string;
    nilai_deteksi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
}

export interface DomainGulih {
    id: number;
    kategori_tingkat_kematangan_domain: string;
    nilai_gulih: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
}

export interface DomainIdentifikasi {
    id: number;
    kategori_tingkat_kematangan_domain: string;
    nilai_identifikasi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
}

export interface DomainProteksi {
    id: number;
    kategori_tingkat_kematangan_domain: string;
    nilai_proteksi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
    nilai_subdomain6: number;
}

export interface PerusahaanInfo {
    id: string;
    nama_perusahaan: string;
}

export interface IkasData {
    id: string;
    created_at: string;
    updated_at: string;
    tanggal: string;
    responden: string;
    jabatan: string;
    telepon: string;
    target_nilai: number;
    nilai_kematangan: number;
    kategori_kematangan_keamanan_siber: string;
    perusahaan: PerusahaanInfo;
    identifikasi: DomainIdentifikasi;
    proteksi: DomainProteksi;
    deteksi: DomainDeteksi;
    gulih: DomainGulih;
}

/** Payload untuk membuat atau mengupdate IKAS */
export interface CreateIkasPayload {
    responden: string;
    jabatan: string;
    telepon: string;
    tanggal: string;
    target_nilai: number;
    [key: string]: any;
}

export type UpdateIkasPayload = Partial<CreateIkasPayload> & Record<string, any>;

