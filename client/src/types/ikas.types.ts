// ─── Existing types (scores/results from /api/maturity/ikas) ─────────────────

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

// ─── Maturity Structure API types ────────────────────────────────────────────
// Endpoints: /api/maturity/domain, /api/maturity/kategori, etc.

export type DomainSlug = 'identifikasi' | 'proteksi' | 'deteksi' | 'gulih';

export interface MaturityDomain {
    id: number;
    nama_domain: string;
    created_at: string;
    updated_at: string;
}

export interface MaturityKategori {
    id: number;
    domain_id: number;
    nama_kategori: string;
    created_at: string;
    updated_at: string;
}

export interface MaturitySubKategori {
    id: number;
    kategori_id: number;
    nama_sub_kategori: string;
    created_at: string;
    updated_at: string;
}

export interface MaturityRuangLingkup {
    id: number;
    nama_ruang_lingkup: string;
}

// Sub-kategori as embedded in a pertanyaan response
export interface EmbeddedSubKategori {
    id: number;
    nama_sub_kategori: string;
    kategori: {
        id: number;
        nama_kategori: string;
        domain: {
            id: number;
            nama_domain: string;
        };
    };
}

// ─── Pertanyaan (Question) API types ─────────────────────────────────────────
// /api/maturity/pertanyaan-{domain}

export interface PertanyaanIdentifikasi {
    id: number;
    pertanyaan_identifikasi: string;
    index0: string;
    index1: string;
    index2: string;
    index3: string;
    index4: string;
    index5: string;
    ruang_lingkup: MaturityRuangLingkup;
    sub_kategori: EmbeddedSubKategori;
    created_at: string;
    updated_at: string;
}

export interface PertanyaanProteksi {
    id: number;
    pertanyaan_proteksi: string;
    index0: string;
    index1: string;
    index2: string;
    index3: string;
    index4: string;
    index5: string;
    ruang_lingkup: MaturityRuangLingkup;
    sub_kategori: EmbeddedSubKategori;
    created_at: string;
    updated_at: string;
}

export interface PertanyaanDeteksi {
    id: number;
    pertanyaan_deteksi: string;
    index0: string;
    index1: string;
    index2: string;
    index3: string;
    index4: string;
    index5: string;
    ruang_lingkup: MaturityRuangLingkup;
    sub_kategori: EmbeddedSubKategori;
    created_at: string;
    updated_at: string;
}

export interface PertanyaanGulih {
    id: number;
    pertanyaan_gulih: string;
    index0: string;
    index1: string;
    index2: string;
    index3: string;
    index4: string;
    index5: string;
    ruang_lingkup: MaturityRuangLingkup;
    sub_kategori: EmbeddedSubKategori;
    created_at: string;
    updated_at: string;
}

/** Normalized question shape (used internally after fetching) */
export interface PertanyaanNormalized {
    id: number;
    domainSlug: DomainSlug;
    /** Compound question ID used in the assessment store: e.g. "identifikasi-3" */
    questionId: string;
    text: string;
    index0: string;
    index1: string;
    index2: string;
    index3: string;
    index4: string;
    index5: string;
    ruang_lingkup: MaturityRuangLingkup;
    sub_kategori: EmbeddedSubKategori;
}

// ─── Jawaban (Answer) API types ───────────────────────────────────────────────
// /api/maturity/jawaban-{domain}

export interface JawabanIdentifikasi {
    id: number;
    jawaban_identifikasi: number;   // 0–5
    evidence: string;
    keterangan: string;
    pertanyaan_identifikasi: {
        id: number;
        pertanyaan_identifikasi: string;
        sub_kategori: EmbeddedSubKategori;
    };
    perusahaan_id: string;
    validasi: string;
    created_at: string;
    updated_at: string;
}

export interface JawabanProteksi {
    id: number;
    jawaban_proteksi: number;
    evidence: string;
    keterangan: string;
    pertanyaan_proteksi: {
        id: number;
        pertanyaan_proteksi: string;
        sub_kategori: EmbeddedSubKategori;
    };
    perusahaan_id: string;
    validasi: string;
    created_at: string;
    updated_at: string;
}

export interface JawabanDeteksi {
    id: number;
    jawaban_deteksi: number;
    evidence: string;
    keterangan: string;
    pertanyaan_deteksi: {
        id: number;
        pertanyaan_deteksi: string;
        sub_kategori: EmbeddedSubKategori;
    };
    perusahaan_id: string;
    validasi: string;
    created_at: string;
    updated_at: string;
}

export interface JawabanGulih {
    id: number;
    jawaban_gulih: number;
    evidence: string;
    keterangan: string;
    pertanyaan_gulih: {
        id: number;
        pertanyaan_gulih: string;
        sub_kategori: EmbeddedSubKategori;
    };
    perusahaan_id: string;
    validasi: string;
    created_at: string;
    updated_at: string;
}

/** Payload to create/update a jawaban */
export interface SaveJawabanPayload {
    pertanyaan_id: number;
    jawaban: number;       // 0–5
    evidence?: string;
    keterangan?: string;
}
