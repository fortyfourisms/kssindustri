import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Award,
    Download,
    Trophy,
    Calendar,
    Loader2,
    AlertCircle,
    RefreshCcw,
    CheckCircle2,
    Sparkles,
    GraduationCap,
} from "lucide-react";
import { useLmsStore } from "@/features/lms/stores/lms.store";
import { lmsService } from "@/features/lms/services/lms.service";
import { toast } from "sonner";
import { getCourseRoute } from "@/features/lms/lib/lms-routes";
import { useAuthStore } from "@/stores/auth.store";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LMSCertificate() {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const [generating, setGenerating] = useState(false);
    const currentUser = useAuthStore((state) => state.currentUser);

    const {
        activeCourse,
        courseCertificate,
        userCertificates,
        isLoadingCertificate,
        certificateError,
        fetchCertificate,
        generateCertificate,
        fetchMyCertificates,
    } = useLmsStore();

    useEffect(() => {
        if (!courseId) return;
        fetchCertificate(courseId);
        fetchMyCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const handleGenerate = async () => {
        if (!courseId) return;
        setGenerating(true);
        const result = await generateCertificate(
            courseId,
            currentUser?.display_name || currentUser?.displayName || currentUser?.name || currentUser?.username || ""
        );
        setGenerating(false);
        if (result.success) {
            toast.success("Sertifikat berhasil dibuat!");
        } else {
            toast.error(result.error ?? "Gagal membuat sertifikat");
        }
    };

    const handleDownload = (certId: string) => {
        const url = lmsService.downloadSertifikat(certId);
        window.location.assign(url);
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoadingCertificate) {
        return (
            <div className="flex h-full w-full flex-col pt-2 lg:pt-6">
                <div className="session-scrollbar content-area-padding flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center py-24">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                        <p className="text-sm text-slate-400 font-medium">Memeriksa sertifikat...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (certificateError) {
        return (
            <div className="flex h-full w-full flex-col pt-2 lg:pt-6">
                <div className="session-scrollbar content-area-padding flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center py-24 text-center">
                        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                        <h3 className="text-base font-black text-slate-700 mb-1">Gagal Memuat Sertifikat</h3>
                        <p className="text-sm text-slate-400 mb-4">{certificateError}</p>
                        <button
                            onClick={() => courseId && fetchCertificate(courseId)}
                            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col pt-2 lg:pt-6">
            <div className="mb-6 px-4 sm:px-6 lg:mb-8 lg:px-8">
                <button
                    onClick={() => navigate(getCourseRoute(courseId!))}
                    className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-white/70 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Kelas
                </button>
            </div>

            <div className="session-scrollbar content-area-padding flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Award className="w-6 h-6 text-amber-500" />
                            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Sertifikat</h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            {activeCourse?.judul ?? "Kelas"}
                        </p>
                    </div>

                    {/* ── Case 1: Certificate already generated ── */}
                    {courseCertificate ? (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            {/* Certificate Card */}
                            <div className="relative mb-8 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-6 shadow-2xl shadow-amber-200 sm:p-8 lg:p-10">
                                {/* Decorative elements */}
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white" />
                                    <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white" />
                                </div>
                                <div className="absolute top-6 right-6 opacity-30">
                                    <GraduationCap className="w-16 h-16 text-white" />
                                </div>

                                <div className="relative z-10 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-5">
                                        <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>

                                    <p className="text-amber-100 text-xs font-black uppercase tracking-widest mb-3">Sertifikat Kelulusan</p>
                                    <h2 className="mb-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                                        {activeCourse?.judul ?? courseCertificate.nama_kelas ?? "Kelas"}
                                    </h2>

                                    {(courseCertificate.nama_peserta || currentUser?.display_name || currentUser?.displayName) && (
                                        <p className="text-amber-100 font-medium text-base mb-4">
                                            Diberikan kepada: <span className="font-black text-white">{courseCertificate.nama_peserta || currentUser?.display_name || currentUser?.displayName || currentUser?.name || currentUser?.username}</span>
                                        </p>
                                    )}

                                    {courseCertificate.tanggal_terbit && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 border border-white/20 rounded-xl text-sm font-semibold text-white">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(courseCertificate.tanggal_terbit).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                <button
                                    onClick={() => handleDownload(courseCertificate.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-amber-200 hover:scale-[1.01]"
                                >
                                    <Download className="w-4 h-4" />
                                    Unduh Sertifikat
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                                <p className="text-sm font-semibold text-teal-700">
                                    Sertifikat ini telah tersimpan di akun Anda dan dapat didownload kapan saja.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── Case 2: Not yet generated ── */
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-12"
                        >
                            {/* Congratulations Banner */}
                            <div className="relative mb-8 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#2a45a3] p-6 text-center sm:p-8 lg:p-10">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_70%,white_0%,transparent_50%)]" />
                                <div className="relative z-10 text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
                                        <Sparkles className="w-10 h-10 text-yellow-300" />
                                    </div>
                                    <h2 className="mb-3 text-2xl font-black text-white sm:text-3xl">Selamat Telah Menyelesaikan Kelas!</h2>
                                    <p className="text-blue-200 font-medium max-w-md mx-auto">
                                        Anda berhak mendapatkan sertifikat kelulusan. Klik tombol di bawah untuk membuat sertifikat Anda.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-base font-black text-white transition-all duration-300 shadow-xl shadow-amber-200 hover:scale-[1.01] hover:from-amber-600 hover:to-yellow-600 disabled:opacity-60"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Membuat Sertifikat...
                                    </>
                                ) : (
                                    <>
                                        <Award className="w-5 h-5" />
                                        Buat Sertifikat Saya
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* ── All my certificates ── */}
                    {userCertificates.length > 0 && (
                        <div className="mt-10">
                            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
                                Sertifikat Saya Lainnya
                            </h3>
                            <div className="space-y-3">
                                {userCertificates
                                    .filter((c) => String(c.id) !== String(courseCertificate?.id))
                                    .map((cert, idx) => (
                                        <motion.div
                                            key={cert.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-amber-200 hover:shadow-sm sm:flex-row sm:items-center sm:p-5"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                                <Award className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                                    {cert.nama_kelas ?? "Kelas"}
                                                </p>
                                                {cert.tanggal_terbit && (
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        {new Date(cert.tanggal_terbit).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDownload(cert.id)}
                                                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 text-xs font-bold text-amber-700 transition-all duration-300 hover:bg-amber-100"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Unduh
                                            </button>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
