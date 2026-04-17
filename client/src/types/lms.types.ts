// ─── LMS Types ────────────────────────────────────────────────────────────────
// Hanya berisi kolom sesuai skema database. Tidak ada kolom tambahan.

// ── kelas ─────────────────────────────────────────────────────────────────────

export interface Kelas {
    id: string;
    judul: string;
    deskripsi?: string;
    thumbnail?: string;
    status: 'draft' | 'published';
    created_by: string;
    created_at: string;
    updated_at: string;
}

// ── materi ────────────────────────────────────────────────────────────────────

export interface MateriItem {
    id: string;
    id_kelas: string;
    judul: string;
    tipe: 'video' | 'teks';
    urutan: number;
    youtube_id?: string;
    durasi_detik?: number;
    konten_html?: string;
    deskripsi_singkat?: string;
    kategori?: string;
    created_at: string;
    updated_at: string;
}

// ── file_pendukung ────────────────────────────────────────────────────────────

export interface FilePendukung {
    id: string;
    id_materi: string;
    nama_file: string;
    file_path: string;
    ukuran: number;
    created_at: string;
}

// ── kuis ──────────────────────────────────────────────────────────────────────

export interface KuisItem {
    id: string;
    id_kelas: string;
    id_materi?: string;
    judul: string;
    deskripsi?: string;
    durasi_menit?: number;
    passing_grade: number;
    is_final: boolean;
    urutan: number;
    created_at: string;
    updated_at: string;
}

// ── soal ──────────────────────────────────────────────────────────────────────

export interface Soal {
    id: string;
    id_kuis: string;
    pertanyaan: string;
    urutan: number;
    created_at: string;
}

// ── pilihan_jawaban ───────────────────────────────────────────────────────────

export interface PilihanJawaban {
    id: string;
    id_soal: string;
    teks: string;
    is_correct: boolean;
    urutan: number;
}

// ── user_materi_progress ──────────────────────────────────────────────────────

export interface UserMateriProgress {
    id: string;
    id_user: string;
    id_materi: string;
    is_completed: boolean;
    last_watched_seconds: number;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

// ── kuis_attempt ─────────────────────────────────────────────────────────────

export interface KuisAttempt {
    id: string;
    id_user: string;
    id_kuis: string;
    skor: number;
    total_soal: number;
    total_benar: number;
    is_passed: boolean;
    started_at: string;
    finished_at?: string;
}

// ── kuis_jawaban ──────────────────────────────────────────────────────────────

export interface KuisJawaban {
    id: string;
    attempt_id: string;
    id_soal: string;
    id_pilihan: string;
    is_correct: boolean;
}

// ── diskusi ───────────────────────────────────────────────────────────────────

export interface DiskusiItem {
    id: string;
    id_materi: string;
    id_user: string;
    id_parent?: string;
    konten: string;
    created_at: string;
    updated_at: string;
}

// ── catatan_pribadi ───────────────────────────────────────────────────────────

export interface CatatanPribadi {
    id: string;
    id_materi: string;
    id_user: string;
    konten: string;
    created_at: string;
    updated_at: string;
}

// ── sertifikat ────────────────────────────────────────────────────────────────

export interface SertifikatItem {
    id: string;
    nomor_sertifikat: string;
    id_kelas: string;
    id_user: string;
    nama_peserta: string;
    nama_kelas: string;
    tanggal_terbit: string;
    pdf_path?: string;
    created_at: string;
}

// ─── API Payload Types (bukan tabel DB, untuk request body) ──────────────────

export interface JawabanPayload {
    id_soal: string;
    id_pilihan: string;
}

export interface SubmitKuisPayload {
    answers: JawabanPayload[];
}

export interface PostDiskusiPayload {
    konten: string;
    id_parent?: string;
}

// ─── API Response Types (data JOIN dari backend, bukan kolom DB tunggal) ─────

/** Soal dari endpoint start-kuis, sudah include pilihan_jawaban */
export interface SoalWithPilihan extends Soal {
    pilihan: PilihanJawaban[];
}

/** DiskusiItem dari endpoint GET diskusi, sudah include user info dari JOIN */
export interface DiskusiWithUser extends DiskusiItem {
    user?: {
        id: string;
        name: string;
        username?: string;
    };
    replies?: DiskusiWithUser[];
}
