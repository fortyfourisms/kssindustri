// IKAS (Indeks Keamanan Siber) Type Definitions

// ─── POST /api/maturity/ikas ───────────────────────────────────────

export interface IkasIdentifikasiPayload {
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
}

export interface IkasProteksiPayload {
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
    nilai_subdomain6: number;
}

export interface IkasDeteksiPayload {
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
}

export interface IkasGulihPayload {
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
}

export interface IkasPayload {
    id_perusahaan: string;
    jabatan: string;
    responden: string;
    tanggal: string;
    target_nilai: number;
    telepon: string;
}

export interface IkasResponse {
    id: string;
    id_perusahaan: string;
    jabatan: string;
    responden: string;
    tanggal: string;
    target_nilai: number;
    telepon: string;
    perusahaan?: any;
    identifikasi?: any;
    proteksi?: any;
    deteksi?: any;
    gulih?: any;
    nilai_kematangan?: number;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/maturity/domain ─────────────────────────────────────

export interface DomainPayload {
    nama_domain: string;
}

export interface DomainResponse {
    id: string;
    nama_domain: string;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/maturity/kategori ───────────────────────────────────

export interface KategoriPayload {
    domain_id: string;
    nama_kategori: string;
}

export interface KategoriResponse {
    id: string;
    domain_id: string;
    nama_kategori: string;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/maturity/sub-kategori ───────────────────────────────

export interface SubKategoriPayload {
    kategori_id: string;
    nama_sub_kategori: string;
}

export interface SubKategoriResponse {
    id: string;
    kategori_id: string;
    nama_sub_kategori: string;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/maturity/ruang-lingkup ──────────────────────────────

export interface RuangLingkupPayload {
    nama_ruang_lingkup: string;
}

export interface RuangLingkupResponse {
    id: string;
    nama_ruang_lingkup: string;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/identifikasi ────────────────────────────────────────

export interface IdentifikasiPayload {
    nilai_identifikasi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
}

export interface IdentifikasiResponse extends IdentifikasiPayload {
    id: string;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/proteksi ────────────────────────────────────────

export interface ProteksiPayload {
    nilai_proteksi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
    nilai_subdomain6: number;
}

export interface ProteksiResponse extends ProteksiPayload {
    id: string;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/deteksi ─────────────────────────────────────────

export interface DeteksiPayload {
    nilai_deteksi: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
}

export interface DeteksiResponse extends DeteksiPayload {
    id: string;
    created_at: string;
    updated_at: string;
}

// ─── POST /api/gulih ───────────────────────────────────────────

export interface GulihPayload {
    nilai_gulih: number;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
}

export interface GulihResponse extends GulihPayload {
    id: string;
    created_at: string;
    updated_at: string;
}

// ─── GET /api/maturity/pertanyaan-identifikasi ─────────────────────

export interface PertanyaanIdentifikasiResponse {
    id: number;
    pertanyaan_identifikasi: string;
    index0: string;
    index1: string;
    index2: string;
    index3: string;
    index4: string;
    index5: string;
    ruang_lingkup: {
        id: number;
        nama_ruang_lingkup: string;
    };
    sub_kategori: {
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
    };
    created_at: string;
    updated_at: string;
}

export interface JawabanPayload {
    id?: string;
    ikas_id?: string;
    id_pertanyaan?: string;
    pertanyaan_identifikasi_id?: number | string;
    pertanyaan_proteksi_id?: number | string;
    pertanyaan_deteksi_id?: number | string;
    pertanyaan_gulih_id?: number | string;
    id_perusahaan?: string;
    perusahaan_id?: string;
    jawaban?: number | string;
    jawaban_identifikasi?: number | string;
    jawaban_proteksi?: number | string;
    jawaban_deteksi?: number | string;
    jawaban_gulih?: number | string;
    nilai?: number;
}

export interface JawabanResponse {
    id: string;
    ikas_id?: string;
    id_pertanyaan?: string;
    pertanyaan_identifikasi_id?: number | string;
    pertanyaan_proteksi_id?: number | string;
    pertanyaan_deteksi_id?: number | string;
    pertanyaan_gulih_id?: number | string;
    id_perusahaan?: string;
    perusahaan_id?: string;
    jawaban?: number | string;
    jawaban_identifikasi?: number | string;
    jawaban_proteksi?: number | string;
    jawaban_deteksi?: number | string;
    jawaban_gulih?: number | string;
    nilai?: number;
    created_at?: string;
    updated_at?: string;
}

// Specific response shape for Gulih jawaban including nested pertanyaan structure
export interface JawabanGulihResponse extends JawabanResponse {
    evidence?: string;
    jawaban_gulih?: number;
    keterangan?: string;
    pertanyaan_gulih?: {
        id: number;
        pertanyaan_gulih: string;
        sub_kategori: {
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
        };
    };
    perusahaan_id?: string;
    created_at?: string;
    updated_at?: string;
    validasi?: string;
}

export interface JawabanIdentifikasiPayload {
    perusahaan_id: string;                    // UUID perusahaan — WAJIB untuk filter GET
    pertanyaan_identifikasi_id: number;       // ID pertanyaan dari backend
    jawaban_identifikasi: number;             // nilai 0-5
    keterangan?: string;
    evidence?: string;
    validasi?: string;
}

export interface JawabanProteksiPayload {
    perusahaan_id: string;
    pertanyaan_proteksi_id: number;
    jawaban_proteksi: number;
    keterangan?: string;
    evidence?: string;
    validasi?: string;
}

export interface JawabanDeteksiPayload {
    perusahaan_id: string;
    pertanyaan_deteksi_id: number;
    jawaban_deteksi: number;
    keterangan?: string;
    evidence?: string;
    validasi?: string;
}

export interface JawabanGulihPayload {
    perusahaan_id: string;
    pertanyaan_gulih_id: number;
    jawaban_gulih: number;
    keterangan?: string;
    evidence?: string;
    validasi?: string;
}

export type DomainSlug = "identifikasi" | "proteksi" | "deteksi" | "gulih";

export interface EmbeddedDomain {
    id: number;
    nama_domain: string;
}

export interface EmbeddedKategori {
    id: number;
    nama_kategori: string;
    domain: EmbeddedDomain;
}

export interface EmbeddedSubKategori {
    id: number;
    nama_sub_kategori: string;
    kategori: EmbeddedKategori;
}

export interface EmbeddedRuangLingkup {
    id: number;
    nama_ruang_lingkup: string;
}

interface BasePertanyaan {
    id: number;
    index0: string;
    index1: string;
    index2: string;
    index3: string;
    index4: string;
    index5: string;
    ruang_lingkup: EmbeddedRuangLingkup;
    sub_kategori: EmbeddedSubKategori;
    created_at?: string;
    updated_at?: string;
}

export interface PertanyaanIdentifikasi extends BasePertanyaan {
    pertanyaan_identifikasi: string;
}

export interface PertanyaanProteksi extends BasePertanyaan {
    pertanyaan_proteksi: string;
}

export interface PertanyaanDeteksi extends BasePertanyaan {
    pertanyaan_deteksi: string;
}

export interface PertanyaanGulih extends BasePertanyaan {
    pertanyaan_gulih: string;
}

interface BaseJawaban {
    id: number;
    ikas_id?: string | number;
    perusahaan_id?: string | number;
    id_perusahaan?: string | number;
    is_validated?: boolean;
    evidence?: string;
    keterangan?: string;
    validasi?: string;
    created_at?: string;
    updated_at?: string;
}

export interface JawabanIdentifikasi extends BaseJawaban {
    pertanyaan_identifikasi: PertanyaanIdentifikasi;
    pertanyaan_identifikasi_id?: number | string;
    jawaban_identifikasi: number;
}

export interface JawabanProteksi extends BaseJawaban {
    pertanyaan_proteksi: PertanyaanProteksi;
    pertanyaan_proteksi_id?: number | string;
    jawaban_proteksi: number;
}

export interface JawabanDeteksi extends BaseJawaban {
    pertanyaan_deteksi: PertanyaanDeteksi;
    pertanyaan_deteksi_id?: number | string;
    jawaban_deteksi: number;
}

export interface JawabanGulih extends BaseJawaban {
    pertanyaan_gulih: PertanyaanGulih;
    pertanyaan_gulih_id?: number | string;
    jawaban_gulih: number;
}

export interface CreateIkasPayload {
    id_perusahaan: string | number;
    jabatan: string;
    responden: string;
    tanggal: string;
    target_nilai: number;
    telepon: string;
    kategori_kematangan_keamanan_siber?: string;
}

export interface UpdateIkasPayload extends Partial<CreateIkasPayload> {}

export interface SaveJawabanPayload {
    ikas_id: string | number;
    pertanyaan_id: number;
    jawaban: number;
    evidence?: string;
    keterangan?: string;
}

export interface IkasDomainData {
    id?: string | number;
    nilai?: number | null;
    kategori?: string | null;
    kategori_tingkat_kematangan_domain?: string | null;
    nilai_subdomain1?: number | null;
    nilai_subdomain2?: number | null;
    nilai_subdomain3?: number | null;
    nilai_subdomain4?: number | null;
    nilai_subdomain5?: number | null;
    nilai_subdomain6?: number | null;
    nilai_identifikasi?: number | null;
    nilai_proteksi?: number | null;
    nilai_deteksi?: number | null;
    nilai_gulih?: number | null;
    nilai_tanggulih?: number | null;
}

export interface IkasData {
    id: string | number;
    id_perusahaan: string | number;
    jabatan: string;
    responden: string;
    tanggal: string;
    target_nilai: number;
    telepon: string;
    is_validated?: boolean;
    edit_request_status?: string | null;
    status_edit_request?: string | null;
    request_edit_status?: string | null;
    status_pengajuan_edit?: string | null;
    latest_edit_request?: {
        id?: string | number;
        status?: string | null;
        edit_status?: string | null;
        request_status?: string | null;
        review_status?: string | null;
        reason?: string | null;
        alasan?: string | null;
        catatan?: string | null;
        catatan_user?: string | null;
        created_at?: string;
        updated_at?: string;
    } | null;
    kategori_kematangan_keamanan_siber?: string;
    perusahaan?: any;
    identifikasi?: IkasDomainData | null;
    proteksi?: IkasDomainData | null;
    deteksi?: IkasDomainData | null;
    gulih?: IkasDomainData | null;
    tanggulih?: IkasDomainData | null;
    nilai_kematangan?: number | null;
    total_rata_rata?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface IkasViewDomainData {
    nilai: number;
    kategori: string;
    nilai_subdomain1: number;
    nilai_subdomain2: number;
    nilai_subdomain3: number;
    nilai_subdomain4: number;
    nilai_subdomain5: number;
    nilai_subdomain6: number;
}

export interface IkasViewData {
    identifikasi: IkasViewDomainData;
    proteksi: IkasViewDomainData;
    deteksi: IkasViewDomainData;
    gulih: IkasViewDomainData;
    total_rata_rata: number;
    total_kategori: string;
}

const EMPTY_DOMAIN_VIEW: IkasViewDomainData = {
    nilai: 0,
    kategori: "-",
    nilai_subdomain1: 0,
    nilai_subdomain2: 0,
    nilai_subdomain3: 0,
    nilai_subdomain4: 0,
    nilai_subdomain5: 0,
    nilai_subdomain6: 0,
};

function toSafeNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getDomainNilai(domain: IkasDomainData | null | undefined, ...fallbackKeys: Array<keyof IkasDomainData>): number {
    if (!domain) return 0;
    if (domain.nilai !== undefined && domain.nilai !== null) return toSafeNumber(domain.nilai);
    for (const key of fallbackKeys) {
        const value = domain[key];
        if (value !== undefined && value !== null) return toSafeNumber(value);
    }
    return 0;
}

function mapDomainToView(
    domain: IkasDomainData | null | undefined,
    nilaiKeys: Array<keyof IkasDomainData>,
): IkasViewDomainData {
    if (!domain) return { ...EMPTY_DOMAIN_VIEW };

    return {
        nilai: getDomainNilai(domain, ...nilaiKeys),
        kategori: String(
            domain.kategori_tingkat_kematangan_domain ??
            domain.kategori ??
            "-"
        ),
        nilai_subdomain1: toSafeNumber(domain.nilai_subdomain1),
        nilai_subdomain2: toSafeNumber(domain.nilai_subdomain2),
        nilai_subdomain3: toSafeNumber(domain.nilai_subdomain3),
        nilai_subdomain4: toSafeNumber(domain.nilai_subdomain4),
        nilai_subdomain5: toSafeNumber(domain.nilai_subdomain5),
        nilai_subdomain6: toSafeNumber(domain.nilai_subdomain6),
    };
}

export function getKategoriKematangan(score: number | null | undefined): string {
    const value = toSafeNumber(score);
    if (value <= 0) return "Input Belum Lengkap";
    if (value < 1) return "Awal";
    if (value < 2) return "Berkembang";
    if (value < 3) return "Terdefinisi";
    if (value < 4) return "Terkelola";
    return "Optimal";
}

export function mapIkasToView(data: IkasData | null | undefined): IkasViewData {
    if (!data) {
        return {
            identifikasi: { ...EMPTY_DOMAIN_VIEW },
            proteksi: { ...EMPTY_DOMAIN_VIEW },
            deteksi: { ...EMPTY_DOMAIN_VIEW },
            gulih: { ...EMPTY_DOMAIN_VIEW },
            total_rata_rata: 0,
            total_kategori: "Input Belum Lengkap",
        };
    }

    const identifikasi = mapDomainToView(data.identifikasi, ["nilai_identifikasi"]);
    const proteksi = mapDomainToView(data.proteksi, ["nilai_proteksi"]);
    const deteksi = mapDomainToView(data.deteksi, ["nilai_deteksi"]);
    const gulihSource = data.gulih ?? data.tanggulih ?? null;
    const gulih = mapDomainToView(gulihSource, ["nilai_gulih", "nilai_tanggulih"]);
    const total = toSafeNumber(data.total_rata_rata ?? data.nilai_kematangan);

    return {
        identifikasi,
        proteksi,
        deteksi,
        gulih,
        total_rata_rata: total,
        total_kategori: String(
            data.kategori_kematangan_keamanan_siber ??
            getKategoriKematangan(total)
        ),
    };
}
