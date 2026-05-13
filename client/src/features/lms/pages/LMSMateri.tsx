import { useEffect } from "react";
import { BookOpen, ChevronRight, GraduationCap, Shield, Calendar, AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLmsStore } from "@/features/lms/stores/lms.store";
import { getCourseRoute } from "@/features/lms/lib/lms-routes";
import { SkeletonCard as BaseSkeletonCard } from "@/components/ui/skeleton";

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
        <BaseSkeletonCard className="h-full rounded-3xl border-slate-100 bg-white shadow-sm" thumbnailClassName="h-[200px]" textLines={4} />
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
        <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl space-y-6 pb-12">
            {/* Header */}
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold font-display text-slate-900 sm:text-3xl">Materi Pembelajaran</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Tingkatkan pemahaman Anda tentang keamanan siber melalui berbagai materi komprehensif.
                    </p>
                </div>
                <div className="hidden shrink-0 items-center gap-2 text-sm text-slate-500 sm:flex">
                    <span className="font-medium text-blue-600 hover:underline cursor-pointer">Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-semibold text-slate-900">Materi</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
                            onClick={() => navigate(getCourseRoute(course.id))}
                            className="group flex flex-col h-full bg-white border border-slate-200 hover:border-blue-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                        >
                            {/* Top Decorative Section */}
                            <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden bg-slate-50 p-6 sm:h-[200px] sm:aspect-auto">
                                <div className={`absolute -top-8 -left-8 w-36 h-36 rounded-full blur-[40px] opacity-40 group-hover:scale-110 transition-transform duration-700 ease-in-out ${blob1}`} />
                                <div className={`absolute -bottom-8 -right-8 w-36 h-36 rounded-full blur-[40px] opacity-40 group-hover:scale-110 transition-transform duration-700 ease-in-out ${blob2}`} />
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

                                <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10 opacity-80">
                                    <GraduationCap className="w-4 h-4 text-blue-800" />
                                    <span className="text-[10px] font-black text-slate-800 tracking-wider">FORTYFOUR</span>
                                </div>
                                <div className="absolute top-4 right-4 z-10 opacity-80 flex gap-1.5 items-center">
                                    <Shield className="w-3.5 h-3.5 text-blue-800" />
                                    <span className="text-[10px] font-black text-blue-900 tracking-wider">CYBER</span>
                                </div>

                                <h3 className="text-center font-black text-slate-800 text-lg relative z-10 max-w-[95%] leading-snug drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
                                    {title}
                                </h3>

                                <div className="absolute bottom-4 right-4 z-10">
                                    <span className="text-[11px] italic font-medium text-slate-600 font-serif">Belajar bersama ahlinya</span>
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
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            </div>
        </div>
    );
}
