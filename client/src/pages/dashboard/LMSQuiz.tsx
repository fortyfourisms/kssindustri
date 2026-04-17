import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ClipboardList,
    XCircle,
    CheckCircle2,
    Trophy,
    RotateCcw,
    ChevronRight,
    Loader2,
    AlertCircle,
    PlayCircle,
} from "lucide-react";
import { useLmsStore } from "@/stores/lms.store";
import { toast } from "sonner";
import type { JawabanPayload, SoalWithPilihan } from "@/types/lms.types";

// ─── Stages ───────────────────────────────────────────────────────────────────
type Stage = "start" | "questions" | "submitting" | "result";

// ─── Start Screen ─────────────────────────────────────────────────────────────
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
                <ClipboardList className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">{title}</h1>
            {description && <p className="text-slate-500 font-medium mb-4 leading-relaxed">{description}</p>}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {passingGrade !== undefined && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-sm font-bold text-blue-700">
                        <Trophy className="w-4 h-4" />
                        Nilai lulus: {passingGrade}%
                    </div>
                )}
                {durasiMenit && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                        ⏱ {durasiMenit} menit
                    </div>
                )}
            </div>
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-semibold mb-6">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}
            <button
                onClick={onStart}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl font-black text-white text-base shadow-xl shadow-blue-200 transition-all hover:scale-[1.01] disabled:opacity-60"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                Mulai Kuis
            </button>
        </motion.div>
    );
}

// ─── Questions Screen ─────────────────────────────────────────────────────────
function QuestionsScreen({
    soal,
    onSubmit,
    isSubmitting,
}: {
    soal: SoalWithPilihan[];
    onSubmit: (answers: JawabanPayload[]) => void;
    isSubmitting: boolean;
}) {
    // answers: { [id_soal]: id_pilihan }
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const allAnswered = soal.length > 0 && soal.every((q) => answers[q.id] !== undefined);
    const answered = Object.keys(answers).length;

    const handleSelect = (soalId: string, pilihanId: string) => {
        setAnswers((prev) => ({ ...prev, [soalId]: pilihanId }));
    };

    const handleSubmit = () => {
        const payload: JawabanPayload[] = soal.map((q) => ({
            id_soal: q.id,
            id_pilihan: answers[q.id],
        }));
        onSubmit(payload);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500 font-medium">Jawab semua soal untuk melanjutkan</p>
                <div className="text-right">
                    <span className="text-2xl font-black text-slate-800">{answered}</span>
                    <span className="text-slate-400 font-bold text-base">/{soal.length}</span>
                    <p className="text-[11px] text-slate-400 font-semibold">terjawab</p>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mb-8">
                {soal.map((q) => (
                    <div key={q.id} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${answers[q.id] ? "bg-blue-600" : "bg-slate-200"}`} />
                ))}
            </div>

            {/* Soal */}
            <div className="space-y-8">
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
                                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
                            >
                                <p className="font-bold text-slate-800 text-base mb-5">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black mr-2.5">
                                        {qIdx + 1}
                                    </span>
                                    {q.pertanyaan}
                                </p>
                                <div className="space-y-2.5">
                                    {pilihan.map((p, pi) => {
                                        const isSelected = selectedPilihan === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelect(q.id, p.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left font-semibold text-sm transition-all duration-200 border-2 ${isSelected
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200/60"
                                                        : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                    }`}
                                            >
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? "bg-white/20 text-white" : "bg-white border border-slate-200 text-slate-500"}`}>
                                                    {String.fromCharCode(65 + pi)}
                                                </span>
                                                {p.teks}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
            </div>

            {/* Submit */}
            <div className="mt-8">
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-300 ${allAnswered && !isSubmitting
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.01]"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Mengirim…
                        </span>
                    ) : allAnswered ? "Kumpulkan Jawaban →" : `Jawab ${soal.length - answered} soal lagi`}
                </button>
            </div>
        </motion.div>
    );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
    skor,
    isPassed,
    totalBenar,
    totalSoal,
    onRetry,
    onBack,
}: {
    skor: number;
    isPassed: boolean;
    totalBenar: number;
    totalSoal: number;
    onRetry: () => void;
    onBack: () => void;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-8 py-8 max-w-2xl mx-auto w-full">
            {/* Score Card */}
            <div className={`w-full rounded-3xl p-8 text-center relative overflow-hidden ${isPassed ? "bg-gradient-to-br from-teal-500 to-emerald-600" : "bg-gradient-to-br from-rose-500 to-red-600"}`}>
                <div className="absolute inset-0 opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute rounded-full bg-white" style={{ width: `${80 + i * 30}px`, height: `${80 + i * 30}px`, top: `${-20 + i * 10}%`, left: `${-10 + i * 20}%`, opacity: 0.3 }} />
                    ))}
                </div>
                <div className="relative z-10">
                    {isPassed ? (
                        <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4 drop-shadow-lg" />
                    ) : (
                        <XCircle className="w-16 h-16 text-white/80 mx-auto mb-4" />
                    )}
                    {/* skor dari DB: DECIMAL(5,2) */}
                    <div className="text-7xl font-black text-white mb-2">{Math.round(skor)}<span className="text-4xl">%</span></div>
                    <p className="text-white/90 font-bold text-lg">{isPassed ? "Selamat! Kamu Lulus 🎉" : "Belum Lulus — Coba Lagi"}</p>
                    <p className="text-white/70 text-sm mt-1">{totalBenar} dari {totalSoal} soal benar</p>
                </div>
            </div>

            {/* Status card */}
            {isPassed ? (
                <div className="w-full p-6 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-teal-600 shrink-0" />
                    <div>
                        <p className="font-black text-teal-800">Kuis Diselesaikan</p>
                        <p className="text-sm text-teal-600 font-medium">Progres Anda telah dicatat. Lanjutkan ke materi berikutnya.</p>
                    </div>
                </div>
            ) : (
                <div className="w-full p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4">
                    <XCircle className="w-8 h-8 text-rose-500 shrink-0" />
                    <div>
                        <p className="font-black text-rose-700">Belum Mencapai Nilai Lulus</p>
                        <p className="text-sm text-rose-600 font-medium">Ulangi kuis setelah mempelajari kembali materi.</p>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    <RotateCcw className="w-4 h-4" />
                    Ulangi Kuis
                </button>
                <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-white transition-all shadow-lg hover:scale-[1.01]">
                    Kembali ke Kelas
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LMSQuiz() {
    const navigate = useNavigate();
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
    const [stage, setStage] = useState<Stage>("start");

    const {
        activeCourse,
        courseQuizzes,
        kuisAttempt,
        kuisSoal,
        kuisResult,
        isLoadingKuis,
        kuisError,
        startKuis,
        submitKuis,
        fetchKuisResult,
        resetKuis,
    } = useLmsStore();

    useEffect(() => {
        return () => { resetKuis(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derive kuis info from courseQuizzes
    const kuisInfo = courseQuizzes.find((k) => k.id === quizId);

    const handleStart = async () => {
        if (!quizId) return;
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
            // After successful submit, fetch the result properly
            const resultRes = await fetchKuisResult(kuisAttempt.id);
            if (resultRes.success) {
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
        setStage("start");
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Banner */}
            <div className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#2a45a3] rounded-3xl overflow-hidden shadow-xl mb-8 p-8 relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_50%)]" />
                <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                        <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-0.5">
                            {activeCourse?.judul ?? "Kelas"} · {kuisInfo?.is_final ? "Kuis Akhir" : "Kuis"}
                        </p>
                        <h2 className="text-white font-black text-xl">{kuisInfo?.judul ?? "Kuis"}</h2>
                    </div>
                    {/* Stage indicator */}
                    <div className="ml-auto flex items-center gap-2">
                        {(["start", "questions", "result"] as const).map((s) => (
                            <div key={s} className={`w-2 h-2 rounded-full transition-all ${stage === s || (stage === "submitting" && s === "questions") ? "bg-white scale-125" : "bg-white/30"}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
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
                            onSubmit={handleSubmit}
                            isSubmitting={stage === "submitting"}
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
                            onRetry={handleRetry}
                            onBack={() => navigate(`/dashboard/materi/${courseId}`)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
