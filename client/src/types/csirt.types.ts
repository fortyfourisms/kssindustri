/**
 * CSIRT Domain Types
 * Represents the contract with the backend.
 */

export interface CsirtMember {
    id: string;
    id_perusahaan?: number;
    nama_csirt: string;
    web_csirt: string;
    telepon_csirt: string;
    file_rfc2350: string;
    file_public_key_pgp: string;
    photo_csirt: string;
    status?: string; // Status field: "Aktif", "Sedang Setup", etc.
    /** Legacy field alias kept for old dummy data */
    img_csirt?: string;
    slug?: string;
    perusahaan?: {
        id: string;
        nama_perusahaan: string;
        alamat: string;
        email: string;
        telepon: string;
        website: string;
        photo: string;
        created_at?: string;
        updated_at?: string;
        sub_sektor?: {
            id: string;
            id_sektor: string;
            nama_sektor: string;
            nama_sub_sektor: string;
            created_at?: string;
            updated_at?: string;
        };
    };
}

export interface CreateCsirtPayload {
    id_perusahaan: string | number;
    slug?: string;
    nama_csirt: string;
    web_csirt: string;
    telepon_csirt: string;
    file_rfc2350?: File | string | null;
    file_public_key_pgp?: File | string | null;
    photo_csirt?: File | string | null;
}

export interface SdmCsirt {
    id: string;
    id_csirt: string | number;
    nama_personel: string;
    jabatan_csirt: string;
    jabatan_perusahaan: string;
    skill: string;
    sertifikasi: string;
    csirt?: {
        id: string;
        nama_csirt: string;
        telepon_csirt: string;
        web_csirt: string;
    };
    created_at?: string;
    updated_at?: string;
}

export interface SeCsirt {
    id: number;
    id_csirt: string;
    id_perusahaan?: string;
    id_sub_sektor?: string;
    nama_se: string;
    ip_se: string;
    as_number_se: string;
    pengelola_se: string;
    fitur_se: string;
    kategori_se?: string;
    // Enum fields (A/B/C) – filled later via penilaian
    anggaran_operasional?: string;
    dampak_kegagalan?: string;
    data_pribadi?: string;
    jumlah_pengguna?: string;
    kekritisan_proses?: string;
    kepatuhan_peraturan?: string;
    klasifikasi_data?: string;
    nilai_investasi?: string;
    potensi_kerugian_dan_dampak_negatif?: string;
    teknik_kriptografi?: string;
}

export interface CreateSePayload {
    id_csirt: string;
    id_perusahaan?: string;
    id_sub_sektor?: string;
    nama_se: string;
    ip_se: string;
    as_number_se: string;
    pengelola_se: string;
    fitur_se: string;
    kategori_se?: string;
    // KSE penilaian enum fields (A/B/C)
    nilai_investasi?: string;
    anggaran_operasional?: string;
    kepatuhan_peraturan?: string;
    teknik_kriptografi?: string;
    jumlah_pengguna?: string;
    data_pribadi?: string;
    klasifikasi_data?: string;
    kekritisan_proses?: string;
    dampak_kegagalan?: string;
    potensi_kerugian_dan_dampak_negatif?: string;
}
