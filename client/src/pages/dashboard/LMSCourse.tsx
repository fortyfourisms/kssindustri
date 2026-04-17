import { useEffect } from "react";
import { useNavigate, useParams, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    Grid,
    Lock,
    PlayCircle,
    ClipboardList,
    ChevronRight,
    Trophy,
    FileText,
    BookOpen,
    GraduationCap,
    AlertCircle,
    Loader2,
    Award,
} from "lucide-react";
import { useLmsStore, computeProgress } from "@/stores/lms.store";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col lg:flex-row gap-6 animate-pulse">
            <div className="w-full lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                    <div className="h-3 w-32 bg-slate-200 rounded-full" />
                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
                </div>
            </div>
            <div className="flex-1 space-y-4">
                <div className="h-52 bg-slate-200 rounded-3xl" />
                <div className="h-6 w-64 bg-slate-200 rounded-full" />
                <div className="h-4 w-full bg-slate-100 rounded-full" />
            </div>
        </div>
    );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-base font-black text-slate-700 mb-1">Gagal Memuat Kelas</h3>
            <p className="text-sm text-slate-400 mb-4">{message}</p>
            <button onClick={onRetry} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors">
                Coba Lagi
            </button>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LMSCourse() {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();

    const {
        activeCourse,
        courseMateri,
        courseQuizzes,
        completedMateriIds,
        isLoadingCourse,
        courseError,
        fetchCourseById,
        fetchCourseQuizzes,
        resetCourse,
    } = useLmsStore();

    useEffect(() => {
        if (!courseId) return;
        fetchCourseById(courseId);
        fetchCourseQuizzes(courseId);
        return () => { resetCourse(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // Materi diurutkan berdasarkan kolom `urutan`
    const sortedMateri = [...courseMateri].sort((a, b) => a.urutan - b.urutan);
    const progressPercentage = computeProgress(sortedMateri, completedMateriIds);

    const location = useLocation();

    // Auto-redirect jika berada di index root route kelas
    useEffect(() => {
        if (!isLoadingCourse && sortedMateri.length > 0 && location.pathname === `/dashboard/materi/${courseId}`) {
            const firstUncompleted = sortedMateri.find(m => !completedMateriIds.has(m.id));
            if (firstUncompleted) {
                navigate(`/dashboard/materi/${courseId}/learn/${firstUncompleted.id}`, { replace: true });
            } else {
                // Semua materi selesai, lempar ke kuis pertama yang belum atau materi terakhir
                const unlinkedQuizzes = courseQuizzes.filter(q => !q.id_materi).sort((a,b) => a.urutan - b.urutan);
                if (unlinkedQuizzes.length > 0) {
                    navigate(`/dashboard/materi/${courseId}/quiz/${unlinkedQuizzes[0].id}`, { replace: true });
                } else {
                    navigate(`/dashboard/materi/${courseId}/learn/${sortedMateri[sortedMateri.length - 1].id}`, { replace: true });
                }
            }
        }
    }, [isLoadingCourse, location.pathname, courseId, sortedMateri, completedMateriIds, courseQuizzes, navigate]);

    // Jika sedang proses memuat agar tidak flash Outlet kosong
    if (isLoadingCourse) return <Skeleton />;
    if (courseError) {
        return (
            <ErrorCard
                message={courseError}
                onRetry={() => { if (courseId) { fetchCourseById(courseId); fetchCourseQuizzes(courseId); } }}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col lg:flex-row gap-6">
            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 pb-6">
                    {/* Judul */}
                    {activeCourse && (
                        <div className="mb-5 pb-4 border-b border-slate-100">
                            <h2 className="text-sm font-black text-slate-800 leading-snug line-clamp-3">{activeCourse.judul}</h2>
                        </div>
                    )}

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm mb-2 font-semibold">
                            <span className="text-slate-700">Progress Belajar</span>
                            <span className="text-teal-600">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                        </div>
                    </div>

                    {/* Daftar Materi & Kuis Terkait Header */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 text-slate-800 font-bold text-sm">
                        <Grid className="w-4 h-4 text-blue-600" />
                        Daftar Materi & Kuis
                    </div>

                    {/* Materi & Linked Kuis List */}
                    {sortedMateri.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">Belum ada materi tersedia.</p>
                    ) : (
                        <div className="space-y-1">
                            {sortedMateri.map((materi, idx) => {
                                const isDone = completedMateriIds.has(materi.id);
                                const prevDone = idx === 0 || completedMateriIds.has(sortedMateri[idx - 1].id);
                                const isLocked = !prevDone;
                                const isVideo = materi.tipe === "video";
                                const linkedQuizzes = courseQuizzes.filter(q => q.id_materi === materi.id).sort((a,b) => a.urutan - b.urutan);

                                return (
                                    <div key={materi.id} className="space-y-1">
                                        {isLocked ? (
                                            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left cursor-not-allowed opacity-50">
                                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="text-sm font-medium text-slate-500 line-clamp-2">
                                                    {String(materi.urutan).padStart(2, "0")}. {materi.judul}
                                                </span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/dashboard/materi/${courseId}/learn/${materi.id}`)}
                                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                                            >
                                                {isDone
                                                    ? <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                                                    : isVideo
                                                        ? <PlayCircle className="w-5 h-5 text-blue-400 shrink-0" />
                                                        : <FileText className="w-5 h-5 text-indigo-400 shrink-0" />}
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 line-clamp-2">
                                                        {String(materi.urutan).padStart(2, "0")}. {materi.judul}
                                                    </span>
                                                    {isDone && <span className="text-[10px] text-teal-600 font-bold block">✓ Selesai</span>}
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                                            </button>
                                        )}

                                        {/* Linked Quizzes */}
                                        {linkedQuizzes.length > 0 && linkedQuizzes.map((kuis) => (
                                            <button
                                                key={kuis.id}
                                                onClick={() => !isLocked && isDone && navigate(`/dashboard/materi/${courseId}/quiz/${kuis.id}`)}
                                                disabled={isLocked || !isDone}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ml-4 max-w-[calc(100%-1rem)] text-left transition-colors group ${
                                                    (isLocked || !isDone) ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-50/50"
                                                }`}
                                            >
                                                {(isLocked || !isDone) ? (
                                                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                ) : (
                                                    <ClipboardList className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                                )}
                                                <span className={`text-[13px] font-semibold flex-1 min-w-0 line-clamp-2 ${(isLocked || !isDone) ? "text-slate-500" : "text-slate-600 group-hover:text-orange-700"}`}>
                                                    Kuis: {kuis.judul}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Unlinked / Final Kuis List */}
                    {(() => {
                        const unlinkedQuizzes = courseQuizzes.filter(q => !q.id_materi).sort((a,b) => a.urutan - b.urutan);
                        if (unlinkedQuizzes.length === 0) return null;
                        
                        // Final Kuis takes 100% materi completion
                        const isFinalLocked = progressPercentage < 100;

                        return (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl mb-3 text-orange-800 font-bold text-sm">
                                    <ClipboardList className="w-4 h-4 text-orange-500" />
                                    Kuis Gabungan / Akhir
                                </div>
                                <div className="space-y-1">
                                    {unlinkedQuizzes.map((kuis) => (
                                        <button
                                            key={kuis.id}
                                            disabled={isFinalLocked}
                                            onClick={() => !isFinalLocked && navigate(`/dashboard/materi/${courseId}/quiz/${kuis.id}`)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors group ${
                                                isFinalLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-50/50"
                                            }`}
                                        >
                                            {isFinalLocked ? (
                                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                            ) : (
                                                <ClipboardList className="w-4 h-4 text-orange-400 shrink-0" />
                                            )}
                                            <span className={`text-sm font-semibold flex-1 min-w-0 line-clamp-2 ${isFinalLocked ? "text-slate-500" : "text-slate-700 group-hover:text-orange-700"}`}>{kuis.judul}</span>
                                            {!isFinalLocked && <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-400 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Sertifikat */}
                {progressPercentage >= 100 && (
                    <button
                        onClick={() => navigate(`/dashboard/materi/${courseId}/certificate`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-200"
                    >
                        <Award className="w-4 h-4" />
                        Ambil Sertifikat
                    </button>
                )}

                <div className="hidden lg:block">
                    <button
                        onClick={() => navigate("/dashboard/materi")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar Kelas
                    </button>
                </div>
            </div>

            {/* ── Main Content (Outlet) ──────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-white/50 border border-slate-200/60 rounded-[32px] p-6 lg:p-10 shadow-sm min-h-[500px]">
                    <Outlet />
                </div>
            </div>

            {/* Mobile Back */}
            <div className="lg:hidden mt-8 text-center border-t border-slate-200 pt-6">
                <button
                    onClick={() => navigate("/dashboard/materi")}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Kelas
                </button>
            </div>
        </div>
    );
}
