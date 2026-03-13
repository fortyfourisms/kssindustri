export interface DomainDeteksi {
    id: string;
    kategori_tingkat_kematangan_domain: string;
    nilai_deteksi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
}

export interface DomainGulih {
    id: string;
    kategori_tingkat_kematangan_domain: string;
    nilai_gulih: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
}

export interface DomainIdentifikasi {
    id: string;
    kategori_tingkat_kematangan_domain: string;
    nilai_identifikasi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
}

export interface DomainProteksi {
    id: string;
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
    deteksi: DomainDeteksi;
    gulih: DomainGulih;
    id: string;
    identifikasi: DomainIdentifikasi;
    jabatan: string;
    kategori_kematangan_keamanan_siber: string;
    nilai_kematangan: number;
    perusahaan: PerusahaanInfo;
    proteksi: DomainProteksi;
    responden: string;
    tanggal: string;
    target_nilai: number;
    telepon: string;
}
