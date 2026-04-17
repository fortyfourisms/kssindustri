import { apiClient } from './apiClient';
import type {
    Kelas,
    MateriItem,
    KuisItem,
    SoalWithPilihan,
    FilePendukung,
    DiskusiWithUser,
    PostDiskusiPayload,
    CatatanPribadi,
    KuisAttempt,
    SubmitKuisPayload,
    SertifikatItem,
} from '@/types/lms.types';

// ─── Normalize helpers ────────────────────────────────────────────────────────

function normalizeList<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && typeof res === 'object') {
        const arrVal = Object.values(res).find((v) => Array.isArray(v));
        if (arrVal) return arrVal as T[];
    }
    return [];
}

function normalizeOne<T>(res: any): T {
    if (res && res.data && !Array.isArray(res.data)) return res.data;
    if (res && res.data && Array.isArray(res.data)) return res.data[0];
    return res;
}

// ─── YouTube embed helper ─────────────────────────────────────────────────────

export function buildYoutubeEmbed(youtubeId: string): string {
    return `https://www.youtube.com/embed/${youtubeId}`;
}

// ─── API Contract (sesuai backend routes) ────────────────────────────────────
//
//  GET  /api/kelas                              → list kelas
//  GET  /api/kelas/{id}                         → detail kelas + materi + progress
//  POST /api/materi/{id}/progress               → update progress video/teks
//  GET  /api/materi/{id}/file-pendukung         → list file pendukung (PDF)
//  GET  /api/materi/{id}/diskusi                → list diskusi per materi
//  POST /api/materi/{id}/diskusi                → buat diskusi/reply
//  GET  /api/materi/{id}/catatan                → get catatan pribadi
//  PUT  /api/materi/{id}/catatan                → upsert catatan pribadi
//  GET  /api/kelas/{id}/kuis                    → list kuis dalam kelas
//  POST /api/kuis/{id_kuis}/start               → mulai kuis
//  POST /api/kuis/attempt/{attempt_id}/submit   → submit jawaban kuis
//  GET  /api/kuis/attempt/{attempt_id}/result   → lihat hasil kuis
//  GET  /api/kelas/{id}/sertifikat              → cek sertifikat user
//  POST /api/kelas/{id}/sertifikat/generate     → generate sertifikat
//  GET  /api/sertifikat/me                      → list sertifikat user
//  GET  /api/sertifikat/{id}                    → detail sertifikat
//  GET  /api/sertifikat/{id}/download           → download PDF sertifikat
//  GET  /api/file-pendukung/{id}/download       → download file pendukung

// ─── Raw response type for GET /api/kelas/{id} ───────────────────────────────
// Backend mengembalikan kelas + embedded materi[] (beserta progress user)

interface RawMateriWithProgress extends MateriItem {
    progress?: {
        is_completed?: boolean;
        last_watched_seconds?: number;
        completed_at?: string;
    };
}

interface RawKelasDetail extends Kelas {
    materi?: RawMateriWithProgress[];
}

// ─── Parsed result dari getCourseById ────────────────────────────────────────

export interface KelasDetailResult {
    kelas: Kelas;
    materi: MateriItem[];
    completedIds: string[];   // id_materi yang sudah is_completed = true
}

// ─── LMS Service ──────────────────────────────────────────────────────────────

export const lmsService = {

    // ── GET /api/kelas ───────────────────────────────────────────────────────
    async getCourses(): Promise<Kelas[]> {
        const res = await apiClient.get<any>('/api/kelas');
        return normalizeList<Kelas>(res);
    },

    // ── GET /api/kelas/{id} → detail kelas + materi + progress ──────────────
    async getCourseById(id: string): Promise<{ kelas: Kelas; materi: MateriItem[]; completedIds: string[] }> {
        const res = await apiClient.get<any>(`/api/kelas/${id}`);
        const data = res?.data ?? res;
        
        let completedIds: string[] = [];
        let materiData: MateriItem[] = [];
        let kelasData = data?.kelas ?? data;

        // Coba baca dari root array progress (jika return backend dipisah)
        const rootProgress = data?.progress ?? data?.completed_materi_ids;
        if (Array.isArray(rootProgress)) {
             completedIds = rootProgress.map((p: any) => {
                 if (typeof p === 'string') return p;
                 // Jika object, cek apakah is_completed = true/1 (jika property ada)
                 if (typeof p === 'object' && p !== null) {
                     if ('is_completed' in p) {
                         const ok = p.is_completed === true || p.is_completed == 1 || p.is_completed === "1";
                         return ok ? (p.id_materi || p.materi_id || p.id) : null;
                     }
                     return p.id_materi || p.materi_id || p.id;
                 }
                 return null;
             }).filter(Boolean);
             materiData = normalizeList<MateriItem>(data?.materi ?? []);
        } else {
             // Coba baca secara nested didalam array materi (jika backend return JOIN)
             type RawMateriItem = MateriItem & { progress?: { is_completed: any }, is_completed?: any };
             const rawMateri: RawMateriItem[] = normalizeList<RawMateriItem>(data?.materi ?? data ?? []);
             completedIds = rawMateri.filter(m => {
                 const isCompObj = m.progress?.is_completed;
                 const isCompRoot = m.is_completed;
                 return isCompObj === true || isCompObj == 1 || isCompObj === "1" ||
                        isCompRoot === true || isCompRoot == 1 || isCompRoot === "1";
             }).map(m => m.id);
             materiData = rawMateri.map(({ progress: _p, is_completed: _i, ...m }) => m as MateriItem);
        }

        return {
            kelas: normalizeOne<Kelas>(kelasData),
            materi: materiData,
            completedIds,
        };
    },

    // ── GET /api/kelas/{id}/kuis ─────────────────────────────────────────────
    async getCourseKuis(id: string): Promise<KuisItem[]> {
        const res = await apiClient.get<any>(`/api/kelas/${id}/kuis`);
        return normalizeList<KuisItem>(res);
    },

    // ── POST /api/materi/{id}/progress ───────────────────────────────────────
    async trackProgress(materiId: string) {
        return apiClient.post(`/api/materi/${materiId}/progress`, { is_completed: true });
    },

    // ── GET /api/materi/{id}/file-pendukung ──────────────────────────────────
    async getFiles(materiId: string): Promise<FilePendukung[]> {
        const res = await apiClient.get<any>(`/api/materi/${materiId}/file-pendukung`);
        return normalizeList<FilePendukung>(res);
    },

    // ── GET /api/file-pendukung/{id}/download ────────────────────────────────
    downloadFile(fileId: string): string {
        const base = import.meta.env.VITE_API_BASE_URL ?? '';
        return `${base}/api/file-pendukung/${fileId}/download`;
    },

    // ── GET /api/materi/{id}/diskusi ─────────────────────────────────────────
    async getDiscussion(materiId: string): Promise<DiskusiWithUser[]> {
        const res = await apiClient.get<any>(`/api/materi/${materiId}/diskusi`);
        return normalizeList<DiskusiWithUser>(res);
    },

    // ── POST /api/materi/{id}/diskusi ────────────────────────────────────────
    async postDiscussion(materiId: string, payload: PostDiskusiPayload): Promise<DiskusiWithUser> {
        const res = await apiClient.post<any>(`/api/materi/${materiId}/diskusi`, payload);
        return normalizeOne<DiskusiWithUser>(res);
    },

    // ── GET /api/materi/{id}/catatan ─────────────────────────────────────────
    async getNotes(materiId: string): Promise<CatatanPribadi | null> {
        try {
            const res = await apiClient.get<any>(`/api/materi/${materiId}/catatan`);
            if (!res) return null;
            return normalizeOne<CatatanPribadi>(res);
        } catch {
            return null;
        }
    },

    // ── PUT /api/materi/{id}/catatan ─────────────────────────────────────────
    async saveNotes(materiId: string, konten: string): Promise<CatatanPribadi> {
        const res = await apiClient.put<any>(`/api/materi/${materiId}/catatan`, { konten });
        return normalizeOne<CatatanPribadi>(res);
    },

    // ── POST /api/kuis/{id_kuis}/start ───────────────────────────────────────
    // Returns: { attempt: KuisAttempt, soal: SoalWithPilihan[] }
    async startKuis(kuisId: string): Promise<{ attempt: KuisAttempt; soal: SoalWithPilihan[] }> {
        const res = await apiClient.post<any>(`/api/kuis/${kuisId}/start`, {});
        const data = res?.data ?? res;

        // Backend mungkin me-return { attempt: { id: "..." } } atau sekadar { attempt_id: "...", soal: [...] }
        let attemptData = data?.attempt;
        if (!attemptData) {
            attemptData = { ...data };
        }

        // Jika ID kuis menggunakan key 'attempt_id'
        if (!attemptData.id && attemptData.attempt_id) {
            attemptData.id = attemptData.attempt_id;
        } else if (!attemptData.id && data?.attempt_id) {
            attemptData.id = data.attempt_id;
        }

        return {
            attempt: normalizeOne<KuisAttempt>(attemptData),
            soal: normalizeList<SoalWithPilihan>(data?.soal ?? data?.questions ?? []),
        };
    },

    // ── POST /api/kuis/attempt/{attempt_id}/submit ───────────────────────────
    async submitKuis(attemptId: string, payload: SubmitKuisPayload): Promise<KuisAttempt> {
        const res = await apiClient.post<any>(`/api/kuis/attempt/${attemptId}/submit`, payload);
        return normalizeOne<KuisAttempt>(res);
    },

    // ── GET /api/kuis/attempt/{attempt_id}/result ────────────────────────────
    async getKuisResult(attemptId: string): Promise<KuisAttempt> {
        const res = await apiClient.get<any>(`/api/kuis/attempt/${attemptId}/result`);
        return normalizeOne<KuisAttempt>(res);
    },

    // ── GET /api/kelas/{id}/sertifikat ───────────────────────────────────────
    async getCertificate(courseId: string): Promise<SertifikatItem | null> {
        try {
            const res = await apiClient.get<any>(`/api/kelas/${courseId}/sertifikat`);
            if (!res) return null;
            return normalizeOne<SertifikatItem>(res);
        } catch {
            return null;
        }
    },

    // ── POST /api/kelas/{id}/sertifikat/generate ─────────────────────────────
    async generateCertificate(courseId: string): Promise<SertifikatItem> {
        const res = await apiClient.post<any>(`/api/kelas/${courseId}/sertifikat/generate`, {});
        return normalizeOne<SertifikatItem>(res);
    },

    // ── GET /api/sertifikat/me ───────────────────────────────────────────────
    async getMySertifikats(): Promise<SertifikatItem[]> {
        const res = await apiClient.get<any>('/api/sertifikat/me');
        return normalizeList<SertifikatItem>(res);
    },

    // ── GET /api/sertifikat/{id} ─────────────────────────────────────────────
    async getSertifikatDetail(sertifikatId: string): Promise<SertifikatItem> {
        const res = await apiClient.get<any>(`/api/sertifikat/${sertifikatId}`);
        return normalizeOne<SertifikatItem>(res);
    },

    // ── GET /api/sertifikat/{id}/download ────────────────────────────────────
    downloadSertifikat(sertifikatId: string): string {
        const base = import.meta.env.VITE_API_BASE_URL ?? '';
        return `${base}/api/sertifikat/${sertifikatId}/download`;
    },
};
