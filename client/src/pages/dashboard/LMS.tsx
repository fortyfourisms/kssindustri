import { useEffect } from "react";
import { BookOpen, ChevronRight, GraduationCap, Shield, Calendar, AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLmsStore } from "@/stores/lms.store";

// ─── Blob color palette (cycles through courses) ──────────────────────────────
const BLOB_PAIRS = [
    { blob1: "bg-blue-400",    blob2: "bg-indigo-300" },
    { blob1: "bg-amber-400",   blob2: "bg-orange-300" },
    { blob1: "bg-teal-400",    blob2: "bg-emerald-300" },
    { blob1: "bg-rose-400",    blob2: "bg-pink-300" },
    { blob1: "bg-violet-400",  blob2: "bg-purple-300" },
    { blob1: "bg-cyan-400",    blob2: "bg-sky-300" },
    { blob1: "bg-fuchsia-400", blob2: "bg-purple-300" },
    { blob1: "bg-blue-500",    blob2: "bg-cyan-300" },
];

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-[200px] bg-slate-100" />
            <div className="p-6 flex flex-col gap-3">
                <div className="h-3 w-16 bg-slate-200 rounded-full" />
                <div className="h-4 w-full bg-slate-200 rounded-full" />
                <div className="h-4 w-3/4 bg-slate-200 rounded-full" />
                <div className="mt-auto space-y-2 pt-4">
                    <div className="h-3 w-full bg-slate-100 rounded-full" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="col-span-full flex flex-col items-center justify-center py-24 text-center"
        >
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 shadow-sm">
                <GraduationCap className="w-9 h-9 text-blue-400" />
            </div>
            <h3 className="text-lg font-black text-slate-700 mb-2">Belum Ada Kelas Tersedia</h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed">
                Materi pembelajaran akan ditampilkan di sini setelah tersedia dari sistem.
            </p>
        </motion.div>
    );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full flex flex-col items-center justify-center py-24 text-center"
        >
            <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                <AlertCircle className="w-9 h-9 text-red-400" />
            </div>
            <h3 className="text-lg font-black text-slate-700 mb-2">Gagal Memuat Kelas</h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed mb-5">{message}</p>
            <button
                onClick={onRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors"
            >
                <RefreshCcw className="w-4 h-4" />
                Coba Lagi
            </button>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LMS() {
    const navigate = useNavigate();
    const { courses, isLoadingCourses, coursesError, fetchCourses } = useLmsStore();

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900">Materi Pembelajaran</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Tingkatkan pemahaman Anda tentang keamanan siber melalui berbagai materi komprehensif.
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-medium text-blue-600 hover:underline cursor-pointer">Dashboards</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-semibold text-slate-900">Materi</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Loading */}
                {isLoadingCourses && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

                {/* Error */}
                {!isLoadingCourses && coursesError && (
                    <ErrorState message={coursesError} onRetry={fetchCourses} />
                )}

                {/* Empty */}
                {!isLoadingCourses && !coursesError && courses.length === 0 && <EmptyState />}

                {/* Course Cards */}
                {!isLoadingCourses && !coursesError && courses.map((course, i) => {
                    const title = course.judul;
                    const { blob1, blob2 } = BLOB_PAIRS[i % BLOB_PAIRS.length];

                    return (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            onClick={() => navigate(`/dashboard/materi/${course.id}`)}
                            className="group flex flex-col h-full bg-white border border-slate-200 hover:border-blue-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                        >
                            {/* Top Decorative Section */}
                            <div className="h-[200px] relative flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-50">
                                <div className={`absolute -top-8 -left-8 w-36 h-36 rounded-full blur-[40px] opacity-40 group-hover:scale-110 transition-transform duration-700 ease-in-out ${blob1}`} />
                                <div className={`absolute -bottom-8 -right-8 w-36 h-36 rounded-full blur-[40px] opacity-40 group-hover:scale-110 transition-transform duration-700 ease-in-out ${blob2}`} />
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

                                <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10 opacity-80">
                                    <GraduationCap className="w-4 h-4 text-blue-800" />
                                    <span className="text-[10px] font-black text-slate-800 tracking-wider">FORTYFOUR</span>
                                </div>
                                <div className="absolute top-4 right-4 z-10 opacity-80 flex gap-1.5 items-center">
                                    <Shield className="w-3.5 h-3.5 text-blue-800" />
                                    <span className="text-[10px] font-black text-blue-900 tracking-wider">BSSN</span>
                                </div>

                                <h3 className="text-center font-black text-slate-800 text-lg relative z-10 max-w-[95%] leading-snug drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
                                    {title}
                                </h3>

                                <div className="absolute bottom-4 right-4 z-10">
                                    <span className="text-[11px] italic font-medium text-slate-600 font-serif">Learn with the expert</span>
                                </div>
                            </div>

                            {/* Bottom Info */}
                            <div className="p-6 border-t border-slate-100 flex-1 flex flex-col bg-white z-20">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-black rounded-lg tracking-wide uppercase shadow-sm">
                                        Kelas
                                    </span>
                                </div>

                                <h4 className="text-[15px] font-bold text-slate-900 leading-snug mb-5 group-hover:text-blue-600 transition-colors">
                                    {title}
                                </h4>

                                <div className="mt-auto space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100/50 flex items-center justify-center shrink-0">
                                            <Shield className="w-3.5 h-3.5 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">Badan Siber dan Sandi Negara</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
