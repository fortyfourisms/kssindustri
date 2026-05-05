import { create } from 'zustand';
import { lmsService } from '@/features/lms/services/lms.service';
import type {
    Kelas,
    MateriItem,
    KuisItem,
    SoalWithPilihan,
    FilePendukung,
    FeedbackItem,
    KuisAttempt,
    JawabanPayload,
    SertifikatItem,
} from '@/features/lms/types/lms.types';

// ─── Action Result ────────────────────────────────────────────────────────────

interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface QuizProgressState {
    isPassed: boolean;
    latestScore?: number;
    attemptCount: number;
    passedAt?: string;
}

type QuizProgressMap = Record<string, QuizProgressState>;

// ─── State Interface ──────────────────────────────────────────────────────────

interface LmsState {
    // ── Course List ──────────────────────────────────────────────────────────
    courses: Kelas[];
    isLoadingCourses: boolean;
    coursesError: string | null;

    // ── Active Course ─────────────────────────────────────────────────────────
    // GET /api/kelas/{id} mengembalikan kelas + materi[] + progress sekaligus
    activeCourse: Kelas | null;
    courseMateri: MateriItem[];             // dari field `materi` di response
    completedMateriIds: Set<string>;        // id_materi yang is_completed = true
    courseQuizzes: KuisItem[];
    quizProgressById: QuizProgressMap;
    isLoadingCourse: boolean;
    courseError: string | null;

    // ── Active Materi Detail ──────────────────────────────────────────────────
    activeMateri: MateriItem | null;
    materiFiles: FilePendukung[];
    isLoadingMateri: boolean;
    materiError: string | null;

    // ── Kuis ──────────────────────────────────────────────────────────────────
    kuisAttempt: KuisAttempt | null;
    kuisSoal: SoalWithPilihan[];
    kuisResult: KuisAttempt | null;
    isLoadingKuis: boolean;
    kuisError: string | null;

    // ── Sertifikat ────────────────────────────────────────────────────────────
    courseCertificate: SertifikatItem | null;
    userCertificates: SertifikatItem[];
    isLoadingCertificate: boolean;
    certificateError: string | null;

    // ── Actions ───────────────────────────────────────────────────────────────

    fetchCourses: () => Promise<void>;
    /** GET /api/kelas/{id} — sekaligus isi courseMateri & completedMateriIds */
    fetchCourseById: (id: string) => Promise<void>;
    fetchCourseQuizzes: (courseId: string) => Promise<void>;
    updateQuizProgress: (quizId: string, result: Pick<KuisAttempt, 'is_passed' | 'skor'>) => void;

    setActiveMateri: (materi: MateriItem) => void;
    /** Track view materi lalu fetch file pendukung */
    loadMateriDetail: (materiId: string) => Promise<void>;
    markMateriCompleted: (materiId: string) => Promise<ActionResult<void>>;

    saveFeedback: (materiId: string, konten: string) => Promise<ActionResult<FeedbackItem>>;

    startKuis: (kuisId: string) => Promise<ActionResult<{ attempt: KuisAttempt; soal: SoalWithPilihan[] }>>;
    submitKuis: (attemptId: string, answers: JawabanPayload[]) => Promise<ActionResult<KuisAttempt>>;
    /** GET /api/kuis/attempt/{id}/result — panggil setelah submit berhasil */
    fetchKuisResult: (attemptId: string) => Promise<ActionResult<KuisAttempt>>;

    fetchCertificate: (courseId: string) => Promise<SertifikatItem | null>;
    generateCertificate: (courseId: string, namaPeserta?: string) => Promise<ActionResult<SertifikatItem>>;
    fetchMyCertificates: () => Promise<void>;

    resetKuis: () => void;
    resetCourse: () => void;
    resetMateri: () => void;
    reset: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
    courses: [] as Kelas[],
    isLoadingCourses: false,
    coursesError: null as string | null,

    activeCourse: null as Kelas | null,
    courseMateri: [] as MateriItem[],
    completedMateriIds: new Set<string>(),
    courseQuizzes: [] as KuisItem[],
    quizProgressById: {} as QuizProgressMap,
    isLoadingCourse: false,
    courseError: null as string | null,

    activeMateri: null as MateriItem | null,
    materiFiles: [] as FilePendukung[],
    isLoadingMateri: false,
    materiError: null as string | null,

    kuisAttempt: null as KuisAttempt | null,
    kuisSoal: [] as SoalWithPilihan[],
    kuisResult: null as KuisAttempt | null,
    isLoadingKuis: false,
    kuisError: null as string | null,

    courseCertificate: null as SertifikatItem | null,
    userCertificates: [] as SertifikatItem[],
    isLoadingCertificate: false,
    certificateError: null as string | null,
};

function buildQuizProgressMap(quizzes: KuisItem[]): QuizProgressMap {
    return quizzes.reduce<QuizProgressMap>((acc, quiz) => {
        acc[quiz.id] = {
            isPassed: quiz.is_passed === true,
            latestScore: quiz.latest_score,
            attemptCount: quiz.attempt_count ?? 0,
            passedAt: quiz.passed_at,
        };
        return acc;
    }, {});
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLmsStore = create<LmsState>()((set, get) => ({
    ...initialState,

    // ── Course List ────────────────────────────────────────────────────────────

    fetchCourses: async () => {
        set({ isLoadingCourses: true, coursesError: null });
        try {
            const courses = await lmsService.getCourses();
            set({ courses, isLoadingCourses: false });
        } catch (e: unknown) {
            set({ coursesError: e instanceof Error ? e.message : 'Gagal memuat daftar kelas', isLoadingCourses: false });
        }
    },

    // ── Active Course ──────────────────────────────────────────────────────────
    // GET /api/kelas/{id} sudah include materi[] + progress dalam satu response

    fetchCourseById: async (id) => {
        set({ isLoadingCourse: true, courseError: null, activeCourse: null, courseMateri: [] });
        try {
            const { kelas, materi, completedIds } = await lmsService.getCourseById(id);
            set({
                activeCourse: kelas,
                courseMateri: materi,
                completedMateriIds: new Set<string>(completedIds),
                isLoadingCourse: false,
            });
        } catch (e: unknown) {
            set({ courseError: e instanceof Error ? e.message : 'Gagal memuat data kelas', isLoadingCourse: false });
        }
    },

    fetchCourseQuizzes: async (courseId) => {
        try {
            const quizzes = await lmsService.getCourseKuis(courseId);
            set({ courseQuizzes: quizzes, quizProgressById: buildQuizProgressMap(quizzes) });
        } catch {
            set({ courseQuizzes: [], quizProgressById: {} });
        }
    },

    updateQuizProgress: (quizId, result) => set((state) => {
        const previous = state.quizProgressById[quizId];
        const nextAttemptCount = Math.max(previous?.attemptCount ?? 0, 0) + 1;

        return {
            quizProgressById: {
                ...state.quizProgressById,
                [quizId]: {
                    isPassed: result.is_passed,
                    latestScore: result.skor,
                    attemptCount: nextAttemptCount,
                    passedAt: result.is_passed ? new Date().toISOString() : previous?.passedAt,
                },
            },
        };
    }),

    // ── Active Materi Detail ───────────────────────────────────────────────────

    setActiveMateri: (materi) => set({ activeMateri: materi }),

    loadMateriDetail: async (materiId) => {
        set({ isLoadingMateri: true, materiError: null });
        try {
            // Track kunjungan materi tanpa langsung menandainya selesai.
            lmsService.trackProgress(materiId, { is_completed: false }).catch(() => undefined);

            const [files] = await Promise.allSettled([
                lmsService.getFiles(materiId),
            ]);

            set({
                materiFiles: files.status === 'fulfilled' ? files.value : [],
                isLoadingMateri: false,
            });
        } catch (e: unknown) {
            set({ materiError: e instanceof Error ? e.message : 'Gagal memuat detail materi', isLoadingMateri: false });
        }
    },

    markMateriCompleted: async (materiId) => {
        const previousCompletedIds = new Set<string>(Array.from(get().completedMateriIds));

        // Optimistic update so UI feels responsive, but rollback if backend rejects it.
        set((state) => ({
            completedMateriIds: new Set<string>(Array.from(state.completedMateriIds).concat(materiId)),
        }));
        try {
            await lmsService.markMateriCompleted(materiId);
            return { success: true };
        } catch (e: unknown) {
            set({ completedMateriIds: previousCompletedIds });
            return { success: false, error: e instanceof Error ? e.message : 'Gagal menandai materi selesai' };
        }
    },

    saveFeedback: async (materiId, konten) => {
        try {
            const data = await lmsService.saveFeedback(materiId, konten);
            return { success: true, data };
        } catch (e: unknown) {
            return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan feedback' };
        }
    },

    // ── Kuis ───────────────────────────────────────────────────────────────────

    startKuis: async (kuisId) => {
        set({ isLoadingKuis: true, kuisError: null, kuisAttempt: null, kuisSoal: [], kuisResult: null });
        try {
            const { attempt, soal } = await lmsService.startKuis(kuisId);
            set({ kuisAttempt: attempt, kuisSoal: soal, isLoadingKuis: false });
            return { success: true, data: { attempt, soal } };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Gagal memulai kuis';
            set({ kuisError: msg, isLoadingKuis: false });
            return { success: false, error: msg };
        }
    },

    submitKuis: async (attemptId, answers) => {
        set({ isLoadingKuis: true, kuisError: null });
        try {
            const attempt = await lmsService.submitKuis(attemptId, { answers, jawaban: answers });
            // Simpan attemptId di kuisAttempt (updated), result akan di-fetch terpisah
            set({ kuisAttempt: attempt, isLoadingKuis: false });
            return { success: true, data: attempt };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Gagal mengirim jawaban';
            set({ kuisError: msg, isLoadingKuis: false });
            return { success: false, error: msg };
        }
    },

    /** GET /api/kuis/attempt/{id}/result — panggil setelah submitKuis berhasil */
    fetchKuisResult: async (attemptId) => {
        set({ isLoadingKuis: true, kuisError: null });
        try {
            const result = await lmsService.getKuisResult(attemptId);
            set({ kuisResult: result, isLoadingKuis: false });
            return { success: true, data: result };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Gagal mengambil hasil kuis';
            set({ kuisError: msg, isLoadingKuis: false });
            return { success: false, error: msg };
        }
    },

    // ── Sertifikat ─────────────────────────────────────────────────────────────

    fetchCertificate: async (courseId) => {
        set({ isLoadingCertificate: true, certificateError: null });
        try {
            const cert = await lmsService.getCertificate(courseId);
            set({ courseCertificate: cert, isLoadingCertificate: false });
            return cert;
        } catch (e: unknown) {
            set({ certificateError: e instanceof Error ? e.message : 'Gagal memuat sertifikat', isLoadingCertificate: false });
            return null;
        }
    },

    generateCertificate: async (courseId, namaPeserta) => {
        set({ isLoadingCertificate: true, certificateError: null });
        try {
            const cert = await lmsService.generateCertificate(courseId, namaPeserta ? { nama_peserta: namaPeserta } : {});
            set({ courseCertificate: cert, isLoadingCertificate: false });
            return { success: true, data: cert };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Gagal generate sertifikat';
            set({ certificateError: msg, isLoadingCertificate: false });
            return { success: false, error: msg };
        }
    },

    fetchMyCertificates: async () => {
        try {
            const certs = await lmsService.getMySertifikats();
            set({ userCertificates: certs });
        } catch {
            set({ userCertificates: [] });
        }
    },

    // ── Resets ─────────────────────────────────────────────────────────────────

    resetKuis: () => set({
        kuisAttempt: null,
        kuisSoal: [],
        kuisResult: null,
        isLoadingKuis: false,
        kuisError: null,
    }),

    resetCourse: () => set({
        activeCourse: null,
        courseMateri: [],
        courseQuizzes: [],
        completedMateriIds: new Set<string>(),
        quizProgressById: {},
        isLoadingCourse: false,
        courseError: null,
    }),

    resetMateri: () => set({
        activeMateri: null,
        materiFiles: [],
        isLoadingMateri: false,
        materiError: null,
    }),

    reset: () => set({ ...initialState, completedMateriIds: new Set<string>() }),
}));

// ─── Derived helpers ──────────────────────────────────────────────────────────

/** Hitung persentase progress dari completedMateriIds dan courseMateri */
export function computeProgress(courseMateri: MateriItem[], completedIds: Set<string>): number {
    if (courseMateri.length === 0) return 0;
    return Math.round((completedIds.size / courseMateri.length) * 100);
}

export function sortMateriByOrder(courseMateri: MateriItem[]): MateriItem[] {
    return [...courseMateri].sort((a, b) => a.urutan - b.urutan);
}

export function sortQuizzesByOrder(quizzes: KuisItem[]): KuisItem[] {
    return [...quizzes].sort((a, b) => a.urutan - b.urutan);
}

export function isQuizPassed(quizId: string, quizProgressById: QuizProgressMap): boolean {
    return quizProgressById[quizId]?.isPassed === true;
}

export function getLinkedQuizzesForMateri(materiId: string, courseQuizzes: KuisItem[]): KuisItem[] {
    return sortQuizzesByOrder(courseQuizzes.filter((quiz) => quiz.id_materi === materiId));
}

export function getFinalQuizzes(courseQuizzes: KuisItem[]): KuisItem[] {
    return sortQuizzesByOrder(courseQuizzes.filter((quiz) => !quiz.id_materi));
}

export function isMateriAccessible(
    sortedMateri: MateriItem[],
    materiId: string,
    completedIds: Set<string>,
    courseQuizzes: KuisItem[],
    quizProgressById: QuizProgressMap,
): boolean {
    const materiIndex = sortedMateri.findIndex((materi) => materi.id === materiId);
    if (materiIndex < 0) return false;
    if (materiIndex === 0) return true;

    const previousMateri = sortedMateri[materiIndex - 1];
    if (!completedIds.has(previousMateri.id)) return false;

    return getLinkedQuizzesForMateri(previousMateri.id, courseQuizzes).every((quiz) => isQuizPassed(quiz.id, quizProgressById));
}

export function isQuizAccessible(
    quiz: KuisItem,
    sortedMateri: MateriItem[],
    completedIds: Set<string>,
    courseQuizzes: KuisItem[],
    quizProgressById: QuizProgressMap,
): boolean {
    if (quiz.id_materi) {
        return completedIds.has(quiz.id_materi);
    }

    const allMateriCompleted = sortedMateri.every((materi) => completedIds.has(materi.id));
    if (!allMateriCompleted) return false;

    return sortQuizzesByOrder(courseQuizzes)
        .filter((item) => item.id_materi)
        .every((item) => isQuizPassed(item.id, quizProgressById));
}

export function getNextCourseStep(
    sortedMateri: MateriItem[],
    courseQuizzes: KuisItem[],
    completedIds: Set<string>,
    quizProgressById: QuizProgressMap,
): { type: 'materi'; id: string } | { type: 'quiz'; id: string } | null {
    for (const materi of sortedMateri) {
        if (!completedIds.has(materi.id)) {
            return { type: 'materi', id: materi.id };
        }

        const firstUnpassedQuiz = getLinkedQuizzesForMateri(materi.id, courseQuizzes)
            .find((quiz) => !isQuizPassed(quiz.id, quizProgressById));

        if (firstUnpassedQuiz) {
            return { type: 'quiz', id: firstUnpassedQuiz.id };
        }
    }

    const firstUnpassedFinalQuiz = getFinalQuizzes(courseQuizzes)
        .find((quiz) => !isQuizPassed(quiz.id, quizProgressById));

    return firstUnpassedFinalQuiz ? { type: 'quiz', id: firstUnpassedFinalQuiz.id } : null;
}
