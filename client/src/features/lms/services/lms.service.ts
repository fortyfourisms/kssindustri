import { apiClient } from '@/services/apiClient';
import type {
    FilePendukung,
    FeedbackItem,
    GenerateSertifikatPayload,
    Kelas,
    KuisAttempt,
    KuisItem,
    MateriItem,
    SertifikatItem,
    SoalWithPilihan,
    SubmitKuisPayload,
} from '@/features/lms/types/lms.types';

function normalizeList<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && typeof res === 'object') {
        const arrVal = Object.values(res).find((value) => Array.isArray(value));
        if (arrVal) return arrVal as T[];
    }
    return [];
}

function normalizeOne<T>(res: any): T {
    if (res && res.data && !Array.isArray(res.data)) return res.data;
    if (res && res.data && Array.isArray(res.data)) return res.data[0];
    return res;
}

function normalizeQuizQuestions(res: any): SoalWithPilihan[] {
    const questions = normalizeList<any>(res);

    return questions.map((item) => ({
        ...item,
        pilihan: normalizeList(item?.pilihan ?? item?.pilihan_jawaban ?? item?.options ?? []),
    }));
}

export function buildYoutubeEmbed(youtubeId: string): string {
    return `https://www.youtube.com/embed/${youtubeId}`;
}

interface TrackProgressPayload {
    is_completed?: boolean;
    last_watched_seconds?: number;
}

export interface KelasDetailResult {
    kelas: Kelas;
    materi: MateriItem[];
    completedIds: string[];
}

export const lmsService = {
    async getCourses(): Promise<Kelas[]> {
        const res = await apiClient.get<any>('/api/kelas');
        return normalizeList<Kelas>(res);
    },

    async getCourseById(id: string): Promise<KelasDetailResult> {
        const res = await apiClient.get<any>(`/api/kelas/${id}`);
        const data = res?.data ?? res;

        let completedIds: string[] = [];
        let materiData: MateriItem[] = [];
        const kelasData = data?.kelas ?? data;
        const rootProgress = data?.progress ?? data?.completed_materi_ids;

        if (Array.isArray(rootProgress)) {
            completedIds = rootProgress
                .map((item: any) => {
                    if (typeof item === 'string') return item;

                    if (typeof item === 'object' && item !== null) {
                        if ('is_completed' in item) {
                            const isCompleted =
                                item.is_completed === true ||
                                item.is_completed == 1 ||
                                item.is_completed === '1';

                            return isCompleted ? (item.id_materi || item.materi_id || item.id) : null;
                        }

                        return item.id_materi || item.materi_id || item.id;
                    }

                    return null;
                })
                .filter(Boolean);

            materiData = normalizeList<MateriItem>(data?.materi ?? []);
        } else {
            type RawMateriItem = MateriItem & {
                progress?: { is_completed: boolean | number | string };
                is_completed?: boolean | number | string;
            };

            const rawMateri: RawMateriItem[] = normalizeList<RawMateriItem>(data?.materi ?? data ?? []);

            completedIds = rawMateri
                .filter((materi) => {
                    const isCompletedFromProgress = materi.progress?.is_completed;
                    const isCompletedFromRoot = materi.is_completed;

                    return (
                        isCompletedFromProgress === true ||
                        isCompletedFromProgress == 1 ||
                        isCompletedFromProgress === '1' ||
                        isCompletedFromRoot === true ||
                        isCompletedFromRoot == 1 ||
                        isCompletedFromRoot === '1'
                    );
                })
                .map((materi) => materi.id);

            materiData = rawMateri.map(({ progress: _progress, is_completed: _isCompleted, ...materi }) => materi as MateriItem);
        }

        return {
            kelas: normalizeOne<Kelas>(kelasData),
            materi: materiData,
            completedIds,
        };
    },

    async getCourseKuis(id: string): Promise<KuisItem[]> {
        const res = await apiClient.get<any>(`/api/kelas/${id}/kuis`);
        return normalizeList<KuisItem>(res);
    },

    async trackProgress(materiId: string, payload: TrackProgressPayload = { is_completed: false }) {
        return apiClient.post(`/api/materi/${materiId}/progress`, payload);
    },

    async markMateriCompleted(materiId: string) {
        return apiClient.post(`/api/materi/${materiId}/progress`, { is_completed: true });
    },

    async getFiles(materiId: string): Promise<FilePendukung[]> {
        const res = await apiClient.get<any>(`/api/materi/${materiId}/file-pendukung`);
        return normalizeList<FilePendukung>(res);
    },

    downloadFile(fileId: string): string {
        const base = import.meta.env.VITE_API_BASE_URL ?? '';
        return `${base}/api/file-pendukung/${fileId}/download`;
    },

    async saveFeedback(materiId: string, konten: string): Promise<FeedbackItem> {
        const res = await apiClient.put<any>(`/api/materi/${materiId}/feedback`, { konten });
        return normalizeOne<FeedbackItem>(res);
    },

    async startKuis(kuisId: string): Promise<{ attempt: KuisAttempt; soal: SoalWithPilihan[] }> {
        const res = await apiClient.post<any>(`/api/kuis/${kuisId}/start`, {});
        const data = res?.data ?? res;

        let attemptData = data?.attempt;
        if (!attemptData) {
            attemptData = { ...data };
        }

        if (!attemptData.id && attemptData.attempt_id) {
            attemptData.id = attemptData.attempt_id;
        } else if (!attemptData.id && data?.attempt_id) {
            attemptData.id = data.attempt_id;
        }

        return {
            attempt: normalizeOne<KuisAttempt>(attemptData),
            soal: normalizeQuizQuestions(data?.soal ?? data?.questions ?? []),
        };
    },

    async submitKuis(attemptId: string, payload: SubmitKuisPayload): Promise<KuisAttempt> {
        const submitPayload = {
            answers: payload.answers,
            jawaban: payload.jawaban ?? payload.answers,
        };

        const res = await apiClient.post<any>(`/api/kuis/attempt/${attemptId}/submit`, submitPayload);
        return normalizeOne<KuisAttempt>(res);
    },

    async getKuisResult(attemptId: string): Promise<KuisAttempt> {
        const res = await apiClient.get<any>(`/api/kuis/attempt/${attemptId}/result`);
        return normalizeOne<KuisAttempt>(res);
    },

    async getCertificate(courseId: string): Promise<SertifikatItem | null> {
        try {
            const res = await apiClient.get<any>(`/api/kelas/${courseId}/sertifikat`);
            if (!res) return null;
            return normalizeOne<SertifikatItem>(res);
        } catch {
            return null;
        }
    },

    async generateCertificate(courseId: string, payload: GenerateSertifikatPayload = {}): Promise<SertifikatItem> {
        const res = await apiClient.post<any>(`/api/kelas/${courseId}/sertifikat/generate`, payload);
        return normalizeOne<SertifikatItem>(res);
    },

    async getMySertifikats(): Promise<SertifikatItem[]> {
        const res = await apiClient.get<any>('/api/sertifikat/me');
        return normalizeList<SertifikatItem>(res);
    },

    async getSertifikatDetail(sertifikatId: string): Promise<SertifikatItem> {
        const res = await apiClient.get<any>(`/api/sertifikat/${sertifikatId}`);
        return normalizeOne<SertifikatItem>(res);
    },

    downloadSertifikat(sertifikatId: string): string {
        const base = import.meta.env.VITE_API_BASE_URL ?? '';
        return `${base}/api/sertifikat/${sertifikatId}/download`;
    },
};
