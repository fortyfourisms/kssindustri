import { create } from 'zustand';
import { lmsService } from '@/services/lms.service';
import type {
    Kelas,
    MateriItem,
    KuisItem,
    SoalWithPilihan,
    FilePendukung,
    DiskusiWithUser,
    CatatanPribadi,
    KuisAttempt,
    JawabanPayload,
    SertifikatItem,
} from '@/types/lms.types';

// ─── Action Result ────────────────────────────────────────────────────────────

interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

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
    isLoadingCourse: boolean;
    courseError: string | null;

    // ── Active Materi Detail ──────────────────────────────────────────────────
    activeMateri: MateriItem | null;
    materiFiles: FilePendukung[];
    materiDiscussion: DiskusiWithUser[];
    materiNotes: CatatanPribadi | null;
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

    setActiveMateri: (materi: MateriItem) => void;
    /** POST /api/materi/{id}/progress + fetch files/diskusi/catatan */
    loadMateriDetail: (materiId: string) => Promise<void>;
    markMateriCompleted: (materiId: string) => Promise<void>;

    postDiscussion: (materiId: string, konten: string) => Promise<ActionResult<DiskusiWithUser>>;
    saveNotes: (materiId: string, konten: string) => Promise<ActionResult<CatatanPribadi>>;

    startKuis: (kuisId: string) => Promise<ActionResult<{ attempt: KuisAttempt; soal: SoalWithPilihan[] }>>;
    submitKuis: (attemptId: string, answers: JawabanPayload[]) => Promise<ActionResult<KuisAttempt>>;
    /** GET /api/kuis/attempt/{id}/result — panggil setelah submit berhasil */
    fetchKuisResult: (attemptId: string) => Promise<ActionResult<KuisAttempt>>;

    fetchCertificate: (courseId: string) => Promise<void>;
    generateCertificate: (courseId: string) => Promise<ActionResult<SertifikatItem>>;
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
    isLoadingCourse: false,
    courseError: null as string | null,

    activeMateri: null as MateriItem | null,
    materiFiles: [] as FilePendukung[],
    materiDiscussion: [] as DiskusiWithUser[],
    materiNotes: null as CatatanPribadi | null,
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

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLmsStore = create<LmsState>()((set) => ({
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
            set({ courseQuizzes: quizzes });
        } catch {
            set({ courseQuizzes: [] });
        }
    },

    // ── Active Materi Detail ───────────────────────────────────────────────────

    setActiveMateri: (materi) => set({ activeMateri: materi }),

    loadMateriDetail: async (materiId) => {
        set({ isLoadingMateri: true, materiError: null });
        try {
            // POST /api/materi/{id}/progress tanpa set lokal agar status selesai ditentukan secara manual atau dari respons backend
            lmsService.trackProgress(materiId).catch(() => undefined);

            const [files, discussion, notes] = await Promise.allSettled([
                lmsService.getFiles(materiId),
                lmsService.getDiscussion(materiId),
                lmsService.getNotes(materiId),
            ]);

            set({
                materiFiles:      files.status      === 'fulfilled' ? files.value      : [],
                materiDiscussion: discussion.status === 'fulfilled' ? discussion.value : [],
                materiNotes:      notes.status      === 'fulfilled' ? notes.value      : null,
                isLoadingMateri: false,
            });
        } catch (e: unknown) {
            set({ materiError: e instanceof Error ? e.message : 'Gagal memuat detail materi', isLoadingMateri: false });
        }
    },

    markMateriCompleted: async (materiId) => {
        // Optimistic update
        set((state) => ({
            completedMateriIds: new Set<string>(Array.from(state.completedMateriIds).concat(materiId)),
        }));
        try {
            await lmsService.trackProgress(materiId);
        } catch (e) {
            // Ignore for now
        }
    },

    postDiscussion: async (materiId, konten) => {
        try {
            const item = await lmsService.postDiscussion(materiId, { konten });
            set((state) => ({ materiDiscussion: [item, ...state.materiDiscussion] }));
            return { success: true, data: item };
        } catch (e: unknown) {
            return { success: false, error: e instanceof Error ? e.message : 'Gagal mengirim diskusi' };
        }
    },

    saveNotes: async (materiId, konten) => {
        try {
            const updated = await lmsService.saveNotes(materiId, konten);
            set({ materiNotes: updated });
            return { success: true, data: updated };
        } catch (e: unknown) {
            return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan catatan' };
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
            const attempt = await lmsService.submitKuis(attemptId, { answers });
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
        } catch (e: unknown) {
            set({ certificateError: e instanceof Error ? e.message : 'Gagal memuat sertifikat', isLoadingCertificate: false });
        }
    },

    generateCertificate: async (courseId) => {
        set({ isLoadingCertificate: true, certificateError: null });
        try {
            const cert = await lmsService.generateCertificate(courseId);
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
        isLoadingCourse: false,
        courseError: null,
    }),

    resetMateri: () => set({
        activeMateri: null,
        materiFiles: [],
        materiDiscussion: [],
        materiNotes: null,
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
