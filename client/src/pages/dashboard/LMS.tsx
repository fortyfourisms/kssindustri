import { Shield, Calendar, GraduationCap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const courseData = [
    {
        id: "crs-001",
        title: "Pengenalan IKAS (Indeks Keamanan Siber)",
        credit: "1 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Tue, 20 Jan 2026 - Thu, 31 Dec 2026",
        blob1: "bg-blue-400",
        blob2: "bg-indigo-300",
    },
    {
        id: "crs-002",
        title: "Tutorial Pengisian dan Validasi Bukti IKAS",
        credit: "3 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Thu, 08 Jan 2026 - Thu, 31 Dec 2026",
        blob1: "bg-amber-400",
        blob2: "bg-orange-300",
    },
    {
        id: "crs-003",
        title: "Panduan Evaluasi Kapasitas SDM & Ekosistem (KSE)",
        credit: "2 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Tue, 10 Feb 2026 - Thu, 31 Dec 2026",
        blob1: "bg-teal-400",
        blob2: "bg-emerald-300",
    },
    {
        id: "crs-004",
        title: "Manajemen dan Respons Insiden Siber (CSIRT)",
        credit: "2 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Thu, 12 Feb 2026 - Thu, 31 Dec 2026",
        blob1: "bg-rose-400",
        blob2: "bg-pink-300",
    },
    {
        id: "crs-005",
        title: "Penyusunan Profil Risiko Siber Organisasi",
        credit: "1 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Wed, 21 Jan 2026 - Thu, 31 Dec 2026",
        blob1: "bg-violet-400",
        blob2: "bg-purple-300",
    },
    {
        id: "crs-006",
        title: "Dasar-dasar Keamanan Informasi untuk ASN",
        credit: "1 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Fri, 02 Jan 2026 - Thu, 31 Dec 2026",
        blob1: "bg-cyan-400",
        blob2: "bg-sky-300",
    },
    {
        id: "crs-007",
        title: "Membangun Kesadaran Keamanan Siber Pekerja",
        credit: "2 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Mon, 05 Jan 2026 - Thu, 31 Dec 2026",
        blob1: "bg-fuchsia-400",
        blob2: "bg-purple-300",
    },
    {
        id: "crs-008",
        title: "Kepatuhan Regulasi Keamanan Siber Sektor Pemerintah",
        credit: "3 JP",
        author: "Badan Siber dan Sandi Negara",
        dateRange: "Wed, 14 Jan 2026 - Thu, 31 Dec 2026",
        blob1: "bg-blue-500",
        blob2: "bg-cyan-300",
    }
];

export default function LMS() {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courseData.map((course, i) => (
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
                            {/* Blurred blobs */}
                            <div className={`absolute -top-8 -left-8 w-36 h-36 rounded-full blur-[40px] opacity-40 group-hover:scale-110 transition-transform duration-700 ease-in-out ${course.blob1}`} />
                            <div className={`absolute -bottom-8 -right-8 w-36 h-36 rounded-full blur-[40px] opacity-40 group-hover:scale-110 transition-transform duration-700 ease-in-out ${course.blob2}`} />
                            
                            {/* Inner white glow */}
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

                            {/* Top row logs */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10 opacity-80">
                                <GraduationCap className="w-4 h-4 text-blue-800" />
                                <span className="text-[10px] font-black text-slate-800 tracking-wider">FORTYFOUR</span>
                            </div>
                            <div className="absolute top-4 right-4 z-10 opacity-80 flex gap-1.5 items-center">
                                <Shield className="w-3.5 h-3.5 text-blue-800" />
                                <span className="text-[10px] font-black text-blue-900 tracking-wider">BSSN</span>
                            </div>

                            {/* Title Center */}
                            <h3 className="text-center font-black text-slate-800 text-lg relative z-10 max-w-[95%] leading-snug drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
                                {course.title}
                            </h3>

                            {/* Learn with expert text */}
                            <div className="absolute bottom-4 right-4 z-10">
                                <span className="text-[11px] italic font-medium text-slate-600 font-serif">Learn with the expert</span>
                            </div>
                        </div>

                        {/* Bottom Information Section */}
                        <div className="p-6 border-t border-slate-100 flex-1 flex flex-col bg-white z-20">
                            <div className="mb-3">
                                <span className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-black rounded-lg tracking-wide uppercase shadow-sm">
                                    Kelas
                                </span>
                            </div>
                            
                            <h4 className="text-[15px] font-bold text-slate-900 leading-snug mb-5 group-hover:text-blue-600 transition-colors">
                                {course.title} ({course.credit})
                            </h4>

                            <div className="mt-auto space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100/50 flex items-center justify-center shrink-0">
                                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">{course.author}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100/50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600">{course.dateRange}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
