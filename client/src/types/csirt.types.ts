// ─── CSIRT Types ─────────────────────────────────────────────────────────────

export interface CsirtMember {
    id: number;
    id_perusahaan: number;
    nama_csirt: string;
    web_csirt: string;
    telepon_csirt: string;
    file_rfc2350: string;
    file_public_key_pgp: string;
    img_csirt: string;
    slug?: string;
}

export interface CreateCsirtPayload {
    id_perusahaan: number;
    nama_csirt: string;
    web_csirt: string;
    telepon_csirt: string;
    file_rfc2350?: string;
    file_public_key_pgp?: string;
    img_csirt?: string;
}

export interface SdmCsirt {
    id: number;
    id_csirt: number;
    nama_personel: string;
    jabatan_csirt: string;
    jabatan_perusahaan: string;
    skill: string;
    sertifikasi: string;
}

export interface SeCsirt {
    id: number;
    id_csirt: number;
    nama_se: string;
    ip_se: string;
    as_number_se: string;
    pengelola_se: string;
    fitur_se: string;
    kategori_se: string;
}
