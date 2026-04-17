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
    ExternalLink,
} from "lucide-react";
import { useLmsStore } from "@/stores/lms.store";
import { lmsService } from "@/services/lms.service";
import { toast } from "sonner";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LMSCertificate() {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const [generating, setGenerating] = useState(false);

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
        const result = await generateCertificate(courseId);
        setGenerating(false);
        if (result.success) {
            toast.success("Sertifikat berhasil dibuat!");
        } else {
            toast.error(result.error ?? "Gagal membuat sertifikat");
        }
    };

    const handleDownload = (certId: string) => {
        const url = lmsService.downloadSertifikat(certId);
        window.open(url, "_blank");
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoadingCertificate) {
        return (
            <div className="max-w-3xl mx-auto py-24 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                <p className="text-sm text-slate-400 font-medium">Memeriksa sertifikat...</p>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (certificateError) {
        return (
            <div className="max-w-3xl mx-auto py-24 flex flex-col items-center text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                <h3 className="text-base font-black text-slate-700 mb-1">Gagal Memuat Sertifikat</h3>
                <p className="text-sm text-slate-400 mb-4">{certificateError}</p>
                <button
                    onClick={() => courseId && fetchCertificate(courseId)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            {/* Back */}
            <button
                onClick={() => navigate(`/dashboard/materi/${courseId}`)}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Kelas
            </button>

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-amber-500" />
                    <h1 className="text-2xl font-black text-slate-900">Sertifikat</h1>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                    {activeCourse?.judul ?? "Kelas"}
                </p>
            </div>

            {/* ── Case 1: Certificate already generated ── */}
            {courseCertificate ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Certificate Card */}
                    <div className="relative w-full bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-3xl overflow-hidden shadow-2xl shadow-amber-200 p-10 mb-8">
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
                            <h2 className="text-white font-black text-2xl leading-tight mb-2">
                                {activeCourse?.judul ?? courseCertificate.nama_kelas ?? "Kelas"}
                            </h2>

                            {courseCertificate.nama_peserta && (
                                <p className="text-amber-100 font-medium text-base mb-4">
                                    Diberikan kepada: <span className="font-black text-white">{courseCertificate.nama_peserta}</span>
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
                            Download Sertifikat
                        </button>
                        {/* pdf_path: PDF download */}
                        {courseCertificate.pdf_path && (
                            <a
                                href={courseCertificate.pdf_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-4 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Lihat Online
                            </a>
                        )}
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
                    className="text-center py-12"
                >
                    {/* Congratulations Banner */}
                    <div className="w-full bg-gradient-to-br from-[#1e3a8a] to-[#2a45a3] rounded-3xl p-10 mb-8 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_70%,white_0%,transparent_50%)]" />
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
                                <Sparkles className="w-10 h-10 text-yellow-300" />
                            </div>
                            <h2 className="text-white font-black text-2xl mb-3">Selamat Telah Menyelesaikan Kelas!</h2>
                            <p className="text-blue-200 font-medium max-w-md mx-auto">
                                Anda berhak mendapatkan sertifikat kelulusan. Klik tombol di bawah untuk membuat sertifikat Anda.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-base rounded-2xl transition-all shadow-xl shadow-amber-200 hover:scale-[1.01] disabled:opacity-60"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Membuat Sertifikat...
                            </>
                        ) : (
                            <>
                                <Award className="w-5 h-5" />
                                Generate Sertifikat Saya
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
                                    className="flex items-center gap-4 p-5 bg-white border border-slate-200 hover:border-amber-200 hover:shadow-sm rounded-2xl transition-all group"
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
                                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-colors shrink-0"
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
    );
}
