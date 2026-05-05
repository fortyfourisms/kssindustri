import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    XCircle,
    CheckCircle2,
    Trophy,
    RotateCcw,
    ChevronRight,
    Loader2,
    AlertCircle,
    PlayCircle,
    Clock3,
} from "lucide-react";
import {
    getFinalQuizzes,
    getNextCourseStep,
    isQuizAccessible,
    sortMateriByOrder,
    useLmsStore,
} from "@/features/lms/stores/lms.store";
import { toast } from "sonner";
import type { JawabanPayload, SoalWithPilihan } from "@/features/lms/types/lms.types";
import { getCourseCertificateRoute, getCourseLearnRoute, getCourseQuizRoute, getCourseRoute } from "@/features/lms/lib/lms-routes";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";

type Stage = "start" | "questions" | "submitting" | "result";
const QUIZ_CONTENT_MAX_WIDTH = "max-w-5xl";

function RichTextContent({
    html,
    className,
}: {
    html?: string;
    className?: string;
}) {
    if (!html) return null;

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function StartScreen({
    title,
    description,
    passingGrade,
    durasiMenit,
    isLoading,
    error,
    onStart,
}: {
    title: string;
    description?: string;
    passingGrade?: number;
    durasiMenit?: number;
    isLoading: boolean;
    error: string | null;
    onStart: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto flex w-full ${QUIZ_CONTENT_MAX_WIDTH} flex-col items-center px-1 py-6 text-center sm:py-10`}
        >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-200 sm:mb-6 sm:h-20 sm:w-20">
                <ClipboardList className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            </div>
            <h1 className="mb-3 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h1>
            {description && (
                <RichTextContent
                    html={description}
                    className="prose prose-slate mb-4 max-w-2xl text-left text-sm font-medium text-slate-500 prose-p:my-2 prose-headings:text-slate-900 prose-strong:text-slate-700 sm:text-base"
                />
            )}
            <div className="mb-8 flex w-full flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                {passingGrade !== undefined && (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 sm:w-auto">
                        <Trophy className="h-4 w-4" />
                        Nilai lulus: {passingGrade}%
                    </div>
                )}
                {durasiMenit && (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 sm:w-auto">
                        <Clock3 className="h-4 w-4" />
                        {durasiMenit} menit
                    </div>
                )}
            </div>
            {error && (
                <div className="mb-6 flex w-full items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-sm font-semibold text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            )}
            <button
                onClick={onStart}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-black text-white shadow-xl shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.01] disabled:opacity-60"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
                Mulai Kuis
            </button>
        </motion.div>
    );
}

function QuestionsScreen({
    soal,
    answers,
    onSelect,
}: {
    soal: SoalWithPilihan[];
    answers: Record<string, string>;
    onSelect: (soalId: string, pilihanId: string) => void;
}) {
    const answered = Object.keys(answers).length;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mx-auto w-full ${QUIZ_CONTENT_MAX_WIDTH}`}>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">Jawab semua soal untuk melanjutkan</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                        Pilih satu jawaban terbaik di tiap pertanyaan.
                    </p>
                </div>
                <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm sm:w-auto sm:min-w-[140px] sm:text-right">
                    <span className="text-2xl font-black text-slate-800">{answered}</span>
                    <span className="text-base font-bold text-slate-400">/{soal.length}</span>
                    <p className="text-[11px] font-semibold text-slate-400">terjawab</p>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-5 gap-2 sm:grid-cols-10">
                {soal.map((q) => (
                    <div
                        key={q.id}
                        className={`h-2 rounded-full transition-all duration-300 ${answers[q.id] ? "bg-blue-600" : "bg-slate-200"}`}
                    />
                ))}
            </div>

            <div className="space-y-8 pb-28 sm:pb-32">
                {soal
                    .slice()
                    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
                    .map((q, qIdx) => {
                        const selectedPilihan = answers[q.id];
                        const pilihan = q.pilihan.slice().sort((a, b) => a.urutan - b.urutan);

                        return (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: qIdx * 0.06 }}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
                            >
                                <div className="mb-5 flex items-start gap-3">
                                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                                        {qIdx + 1}
                                    </span>
                                    <RichTextContent
                                        html={q.pertanyaan}
                                        className="prose prose-slate min-w-0 flex-1 pt-0.5 text-sm font-bold text-slate-800 prose-p:my-0 prose-headings:my-0 prose-headings:text-slate-900 prose-strong:text-slate-900 sm:text-base"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    {pilihan.map((p, pi) => {
                                        const isSelected = selectedPilihan === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => onSelect(q.id, p.id)}
                                                className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-all duration-200 ${isSelected
                                                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200/60"
                                                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                    }`}
                                            >
                                                <span
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${isSelected
                                                        ? "bg-white/20 text-white"
                                                        : "border border-slate-200 bg-white text-slate-500"
                                                        }`}
                                                >
                                                    {String.fromCharCode(65 + pi)}
                                                </span>
                                                <RichTextContent
                                                    html={p.teks}
                                                    className={`prose min-w-0 flex-1 leading-relaxed prose-p:my-0 prose-headings:my-0 [&_*]:text-inherit [&_em]:text-inherit [&_strong]:text-inherit ${isSelected ? "text-white prose-headings:text-white prose-strong:text-white prose-p:text-white" : ""}`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
            </div>

        </motion.div>
    );
}

function ResultScreen({
    skor,
    isPassed,
    totalBenar,
    totalSoal,
    certificateId,
    showCertificateAction,
    onOpenCertificate,
    onRetry,
    onBack,
}: {
    skor: number;
    isPassed: boolean;
    totalBenar: number;
    totalSoal: number;
    certificateId?: string | null;
    showCertificateAction?: boolean;
    onOpenCertificate?: () => void;
    onRetry: () => void;
    onBack: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto flex w-full ${QUIZ_CONTENT_MAX_WIDTH} flex-col items-center gap-8 py-6 sm:py-8`}
        >
            <div
                className={`relative w-full overflow-hidden rounded-3xl p-6 text-center sm:p-8 ${isPassed
                    ? "bg-gradient-to-br from-teal-500 to-emerald-600"
                    : "bg-gradient-to-br from-rose-500 to-red-600"
                    }`}
            >
                <div className="absolute inset-0 opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                width: `${80 + i * 30}px`,
                                height: `${80 + i * 30}px`,
                                top: `${-20 + i * 10}%`,
                                left: `${-10 + i * 20}%`,
                                opacity: 0.3,
                            }}
                        />
                    ))}
                </div>
                <div className="relative z-10">
                    {isPassed ? (
                        <Trophy className="mx-auto mb-4 h-14 w-14 text-yellow-300 drop-shadow-lg sm:h-16 sm:w-16" />
                    ) : (
                        <XCircle className="mx-auto mb-4 h-14 w-14 text-white/80 sm:h-16 sm:w-16" />
                    )}
                    <div className="mb-2 text-5xl font-black text-white sm:text-7xl">
                        {Math.round(skor)}
                        <span className="text-3xl sm:text-4xl">%</span>
                    </div>
                    <p className="text-base font-bold text-white/90 sm:text-lg">
                        {isPassed ? "Selamat! Anda lulus" : "Belum lulus, silakan coba lagi"}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                        {totalBenar} dari {totalSoal} soal benar
                    </p>
                </div>
            </div>

            {isPassed ? (
                <div className="flex w-full items-start gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:items-center sm:p-6">
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-teal-600" />
                    <div>
                        <p className="font-black text-teal-800">Kuis Diselesaikan</p>
                        <p className="text-sm font-medium text-teal-600">
                            Progres Anda telah dicatat. Lanjutkan ke materi berikutnya.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex w-full items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:items-center sm:p-6">
                    <XCircle className="h-8 w-8 shrink-0 text-rose-500" />
                    <div>
                        <p className="font-black text-rose-700">Belum Mencapai Nilai Lulus</p>
                        <p className="text-sm font-medium text-rose-600">
                            Ulangi kuis setelah mempelajari kembali materi.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex w-full flex-col gap-3 sm:flex-row">
                {showCertificateAction && certificateId && onOpenCertificate && (
                    <button
                        onClick={onOpenCertificate}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.01]"
                    >
                        Lihat Sertifikat
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
                <button
                    onClick={onRetry}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                    <RotateCcw className="h-4 w-4" />
                    Ulangi Kuis
                </button>
                <button
                    onClick={onBack}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.01]"
                >
                    Kembali ke Kelas
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
}

export default function LMSQuiz() {
    const navigate = useNavigate();
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const [stage, setStage] = useState<Stage>("start");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [passedQuizModalOpen, setPassedQuizModalOpen] = useState(false);
    const pageRef = useRef<HTMLDivElement | null>(null);
    const currentUser = useAuthStore((state) => state.currentUser);

    const {
        activeCourse,
        courseMateri,
        courseQuizzes,
        completedMateriIds,
        quizProgressById,
        kuisAttempt,
        kuisSoal,
        kuisResult,
        courseCertificate,
        isLoadingKuis,
        kuisError,
        startKuis,
        submitKuis,
        fetchKuisResult,
        fetchCertificate,
        fetchCourseById,
        fetchCourseQuizzes,
        generateCertificate,
        updateQuizProgress,
        resetKuis,
    } = useLmsStore();
    const [finalCertificateId, setFinalCertificateId] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            resetKuis();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const kuisInfo = courseQuizzes.find((k) => k.id === quizId);
    const sortedMateri = sortMateriByOrder(courseMateri);
    const quizPassed = quizId ? quizProgressById[quizId]?.isPassed === true : false;
    const isAccessible = kuisInfo
        ? isQuizAccessible(kuisInfo, sortedMateri, completedMateriIds, courseQuizzes, quizProgressById)
        : false;

    useEffect(() => {
        if (!courseId || !quizId || courseQuizzes.length === 0 || !kuisInfo) return;
        if (isAccessible) return;

        const fallbackStep = getNextCourseStep(sortedMateri, courseQuizzes, completedMateriIds, quizProgressById);
        if (fallbackStep?.type === "materi") {
            navigate(getCourseLearnRoute(courseId, fallbackStep.id), { replace: true });
        } else if (fallbackStep?.type === "quiz") {
            navigate(getCourseQuizRoute(courseId, fallbackStep.id), { replace: true });
        } else {
            navigate(getCourseRoute(courseId), { replace: true });
        }
    }, [courseId, quizId, courseQuizzes, kuisInfo, isAccessible, sortedMateri, completedMateriIds, quizProgressById, navigate]);

    useEffect(() => {
        const node = pageRef.current;
        if (!node) return;

        let current: HTMLElement | null = node;
        while (current) {
            const style = window.getComputedStyle(current);
            const overflowY = style.overflowY;
            const isScrollable = (overflowY === "auto" || overflowY === "scroll") && current.scrollHeight > current.clientHeight;

            if (isScrollable) {
                current.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            current = current.parentElement;
        }

        node.scrollIntoView({ block: "start", behavior: "smooth" });
    }, [stage]);

    const handleStart = async () => {
        if (!quizId || !isAccessible) return;
        if (quizPassed) {
            setPassedQuizModalOpen(true);
            return;
        }

        if (courseId && kuisInfo?.is_final) {
            await fetchCourseById(courseId);
            await fetchCourseQuizzes(courseId);

            const {
                courseMateri: syncedMateri,
                courseQuizzes: syncedQuizzes,
                completedMateriIds: syncedCompletedIds,
                quizProgressById: syncedQuizProgress,
            } = useLmsStore.getState();

            const syncedSortedMateri = sortMateriByOrder(syncedMateri);
            const syncedQuiz = getFinalQuizzes(syncedQuizzes).find((quiz) => quiz.id === quizId)
                ?? syncedQuizzes.find((quiz) => quiz.id === quizId);
            const canStartFinalQuiz = syncedQuiz
                ? isQuizAccessible(syncedQuiz, syncedSortedMateri, syncedCompletedIds, syncedQuizzes, syncedQuizProgress)
                : false;

            if (!canStartFinalQuiz) {
                toast.error("Selesaikan semua materi dan kuis yang terkait terlebih dahulu");
                return;
            }
        }

        setAnswers({});
        const result = await startKuis(quizId);
        if (result.success) {
            setStage("questions");
        } else {
            toast.error(result.error ?? "Gagal memulai kuis");
        }
    };

    const handleSubmit = async (answers: JawabanPayload[]) => {
        if (!kuisAttempt) return;
        setStage("submitting");
        const submitResult = await submitKuis(kuisAttempt.id, answers);
        if (submitResult.success) {
            const resultRes = await fetchKuisResult(kuisAttempt.id);
            if (resultRes.success) {
                if (quizId && resultRes.data) {
                    updateQuizProgress(quizId, resultRes.data);
                }
                if (courseId && kuisInfo?.is_final && resultRes.data?.is_passed) {
                    const displayName = currentUser?.display_name || currentUser?.displayName || currentUser?.name || currentUser?.username || "";
                    const existingCertificate = await fetchCertificate(courseId);
                    if (existingCertificate) {
                        setFinalCertificateId(existingCertificate.id);
                    } else {
                        const generated = await generateCertificate(courseId, displayName);
                        if (generated.success && generated.data) {
                            setFinalCertificateId(generated.data.id);
                        } else {
                            setFinalCertificateId(null);
                            toast.error(generated.error ?? "Gagal membuat sertifikat");
                        }
                    }
                } else {
                    setFinalCertificateId(null);
                }
                setStage("result");
            } else {
                toast.error(resultRes.error ?? "Gagal mengambil hasil kuis");
                setStage("questions");
            }
        } else {
            toast.error(submitResult.error ?? "Gagal mengirim jawaban");
            setStage("questions");
        }
    };

    const handleRetry = () => {
        resetKuis();
        setAnswers({});
        setStage("start");
    };

    const handleSelectAnswer = (soalId: string, pilihanId: string) => {
        setAnswers((prev) => ({ ...prev, [soalId]: pilihanId }));
    };

    const allAnswered = kuisSoal.length > 0 && kuisSoal.every((q) => answers[q.id] !== undefined);
    const answeredCount = Object.keys(answers).length;

    const handleSubmitAnswers = () => {
        const payload: JawabanPayload[] = kuisSoal.map((q) => ({
            id_soal: q.id,
            id_pilihan: answers[q.id],
        }));
        handleSubmit(payload);
    };

    return (
        <div ref={pageRef} className="flex w-full min-h-full flex-col px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:px-8">
            <Dialog
                open={passedQuizModalOpen}
                onOpenChange={(open) => {
                    setPassedQuizModalOpen(open);
                    if (!open && courseId) {
                        navigate(getCourseRoute(courseId), { replace: true });
                    }
                }}
            >
                <DialogContent className="inset-auto left-1/2 top-1/2 h-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-6">
                    <DialogHeader>
                        <DialogTitle>Anda sudah lulus kuis ini</DialogTitle>
                        <DialogDescription>
                            {kuisInfo?.judul ? `Kuis "${kuisInfo.judul}" sudah dinyatakan lulus.` : "Kuis ini sudah dinyatakan lulus."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => {
                                setPassedQuizModalOpen(false);
                                if (courseId) {
                                    navigate(getCourseRoute(courseId), { replace: true });
                                }
                            }}
                            className="inline-flex h-10 w-auto items-center justify-center self-end whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Kembali ke kelas
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className={`mx-auto w-full ${QUIZ_CONTENT_MAX_WIDTH}`}>
                <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#60efff] p-6 lg:p-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_30%)]" />
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-white/80">
                                    <span className="inline-flex items-center gap-2">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        {kuisInfo?.is_final ? "Kuis Akhir" : "Kuis"}
                                    </span>
                                    <span>{activeCourse?.judul ?? "Kelas"}</span>
                                    {kuisInfo?.passing_grade !== undefined && (
                                        <span className="inline-flex items-center gap-2">
                                            <Trophy className="h-3.5 w-3.5" />
                                            Lulus {kuisInfo.passing_grade}%
                                        </span>
                                    )}
                                    {kuisInfo?.durasi_menit && (
                                        <span className="inline-flex items-center gap-2">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {kuisInfo.durasi_menit} menit
                                        </span>
                                    )}
                                </div>
                                <h1 className="mt-4 max-w-4xl text-[28px] font-black leading-tight text-white lg:text-[34px]">
                                    {kuisInfo?.judul ?? "Kuis"}
                                </h1>
                                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/85 lg:text-base">
                                    {kuisInfo?.deskripsi || "Jawab setiap soal dengan teliti. Pastikan semua pertanyaan terisi sebelum mengumpulkan jawaban Anda."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                                {(["start", "questions", "result"] as const).map((s) => (
                                    <div
                                        key={s}
                                        className={`h-2.5 w-2.5 rounded-full transition-all ${stage === s || (stage === "submitting" && s === "questions")
                                            ? "scale-125 bg-white"
                                            : "bg-white/35"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {stage === "start" && (
                    <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <StartScreen
                            title={kuisInfo?.judul ?? "Kuis"}
                            description={kuisInfo?.deskripsi}
                            passingGrade={kuisInfo?.passing_grade}
                            durasiMenit={kuisInfo?.durasi_menit}
                            isLoading={isLoadingKuis}
                            error={kuisError}
                            onStart={handleStart}
                        />
                    </motion.div>
                )}

                {(stage === "questions" || stage === "submitting") && kuisSoal.length > 0 && (
                    <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <QuestionsScreen
                            soal={kuisSoal}
                            answers={answers}
                            onSelect={handleSelectAnswer}
                        />
                    </motion.div>
                )}

                {stage === "result" && kuisResult && (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ResultScreen
                            skor={kuisResult.skor}
                            isPassed={kuisResult.is_passed}
                            totalBenar={kuisResult.total_benar}
                            totalSoal={kuisResult.total_soal}
                            certificateId={finalCertificateId ?? courseCertificate?.id ?? null}
                            showCertificateAction={Boolean(kuisInfo?.is_final && kuisResult.is_passed)}
                            onOpenCertificate={() => navigate(getCourseCertificateRoute(courseId!))}
                            onRetry={handleRetry}
                            onBack={() => navigate(getCourseRoute(courseId!))}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {(stage === "questions" || stage === "submitting") && kuisSoal.length > 0 && (
                <div className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-slate-200/70 bg-[#f4f7fb]/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className={`mx-auto flex w-full ${QUIZ_CONTENT_MAX_WIDTH} items-center gap-3`}>
                        <button
                            onClick={handleSubmitAnswers}
                            disabled={!allAnswered || stage === "submitting"}
                            className={`min-h-12 w-full rounded-2xl px-4 py-4 text-base font-black transition-all duration-300 ${allAnswered && stage !== "submitting"
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_20px_40px_rgba(59,130,246,0.22)] hover:scale-[1.01]"
                                : "cursor-not-allowed bg-slate-100 text-slate-400"
                                }`}
                        >
                            {stage === "submitting" ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
                                </span>
                            ) : allAnswered ? (
                                <span className="flex items-center justify-center gap-2">
                                    Kumpulkan Jawaban
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            ) : (
                                `Jawab ${kuisSoal.length - answeredCount} soal lagi`
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
