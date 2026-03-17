import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useUser, useProfile } from "@/hooks/useAuth";
import {
    Shield,
    Monitor,
    Users,
    ClipboardList,
    ChevronRight,
    Mail,
    Building2,
    Phone,
    Globe,
    CheckCircle2,
    Briefcase,
    MapPin,
    Calendar,
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RadarChartIkas } from "@/components/RadarChartIkas";
import { getMediaUrl } from "@/lib/utils";

const moduleConfig = {
    IKAS: {
        label: "IKAS",
        fullName: "Indeks Keamanan Siber",
        description: "Ukur dan pantau tingkat keamanan siber organisasi Anda secara komprehensif.",
        href: "/dashboard/ikas",
        icon: Shield,
        cardBg: "bg-blue-50",
        dotColor: "bg-blue-500",
        titleColor: "text-blue-900",
        descColor: "text-blue-700/70",
        linkColor: "text-blue-700 hover:text-blue-900",
        badgeBg: "bg-white/70",
        badgeText: "text-blue-700",
        shapeColor: "text-blue-200",
        shapeStyle: "circles",
    },
    KSE: {
        label: "KSE",
        fullName: "Kapasitas SDM & Ekosistem",
        description: "Evaluasi kapasitas sumber daya manusia dan ekosistem keamanan siber.",
        href: "/dashboard/kse",
        icon: Monitor,
        cardBg: "bg-violet-50",
        dotColor: "bg-violet-500",
        titleColor: "text-violet-900",
        descColor: "text-violet-700/70",
        linkColor: "text-violet-700 hover:text-violet-900",
        badgeBg: "bg-white/70",
        badgeText: "text-violet-700",
        shapeColor: "text-violet-200",
        shapeStyle: "spiral",
    },
    CSIRT: {
        label: "CSIRT",
        fullName: "Status Tim Respons Insiden",
        description: "Daftarkan dan kelola status tim respons insiden siber organisasi.",
        href: "/dashboard/csirt",
        icon: Shield,
        cardBg: "bg-teal-50",
        dotColor: "bg-teal-500",
        titleColor: "text-teal-900",
        descColor: "text-teal-700/70",
        linkColor: "text-teal-700 hover:text-teal-900",
        badgeBg: "bg-white/70",
        badgeText: "text-teal-700",
        shapeColor: "text-teal-200",
        shapeStyle: "squares",
    },
    SURVEI: {
        label: "Survei Profil Resiko",
        fullName: "Profil Resiko Siber",
        description: "Isi survei profil risiko untuk mendapatkan gambaran kesiapan keamanan siber.",
        href: "/dashboard/survei",
        icon: ClipboardList,
        cardBg: "bg-amber-50",
        dotColor: "bg-amber-500",
        titleColor: "text-amber-900",
        descColor: "text-amber-700/70",
        linkColor: "text-amber-700 hover:text-amber-900",
        badgeBg: "bg-white/70",
        badgeText: "text-amber-700",
        shapeColor: "text-amber-200",
        shapeStyle: "diamonds",
    },
};

export default function Dashboard() {
    const { data: user } = useUser();
    
    // Fetch perusahaan langsung dari GET /api/perusahaan/{id}
    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { data: perusahaanResponse } = useQuery({
        queryKey: ["perusahaan", perusahaanId],
        queryFn: () => api.getPerusahaanById(String(perusahaanId)),
        enabled: !!perusahaanId,
    });
    const perusahaan = perusahaanResponse ?? user?.perusahaan;

    // Fetch data for modules to show status
    const { data: ikasData } = useQuery({ queryKey: ["ikas"], queryFn: api.getIkas });
    const { data: kseData } = useQuery({ queryKey: ["kse"], queryFn: api.getKse });
    const { data: csirtData } = useQuery({ queryKey: ["csirt"], queryFn: api.getCsirt });
    const { data: surveiData } = useQuery({ queryKey: ["survei"], queryFn: api.getSurvei });

    // Fallback data structure for IKAS mirroring IKAS.tsx
    const ikasDataFallback = {
        total_rata_rata: 0,
        total_kategori: "INPUT BELUM LENGKAP",
        identifikasi: { nilai_identifikasi: 0, kategori_identifikasi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0, nilai_subdomain5: 0 },
        proteksi: { nilai_proteksi: 0, kategori_proteksi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0, nilai_subdomain5: 0, nilai_subdomain6: 0 },
        deteksi: { nilai_deteksi: 0, kategori_deteksi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0 },
        tanggulih: { nilai_tanggulih: 0, kategori_tanggulih: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0 },
    };

    const isIkasFilled = ikasData && Object.keys(ikasData).length > 0;
    const activeIkasData = isIkasFilled ? ikasData : ikasDataFallback;
    const isKseFilled = kseData && Object.keys(kseData).length > 0;
    const isCsirtFilled = csirtData && csirtData.length > 0;

    return (
        <DashboardLayout title="Dashboard">
            <div className="max-w-7xl mx-auto pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative rounded-[2rem] overflow-hidden group h-[180px] sm:h-[240px] md:h-[280px] shadow-2xl shadow-blue-900/10 border border-white/20"
                        >
                            <img
                                src="/images/banner.png"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Dashboard Banner"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-900/20 to-transparent" />

                            <div className="absolute inset-0 p-5 md:p-10 flex flex-col justify-between">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                                        {perusahaan?.nama_perusahaan ?? "Nama Perusahaan"}
                                    </h1>
                                </div>
                            </div>
                        </motion.div>

                        {/* Module Action Cards - Directly below banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SocietyCard
                                {...moduleConfig.IKAS}
                                status={isIkasFilled ? "Sudah Diisi" : "Belum Diisi"}
                            />
                            <SocietyCard
                                {...moduleConfig.KSE}
                                status={isKseFilled ? "Sudah Diisi" : "Belum Diisi"}
                            />
                            <SocietyCard
                                {...moduleConfig.CSIRT}
                                status={isCsirtFilled ? "Sudah Diisi" : "Belum Diisi"}
                            />
                            <SocietyCard
                                {...moduleConfig.SURVEI}
                                status={surveiData && (Array.isArray(surveiData) ? surveiData.length > 0 : Object.keys(surveiData).length > 0) ? "Sudah Diisi" : "Belum Diisi"}
                            />
                        </div>

                        {/* Radar Charts Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <RadarChartIkas ikasDataDynamic={activeIkasData} />
                        </motion.div>

                        <div className="flex justify-end pr-4">
                            <Link href="/dashboard/ikas" className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider hover:gap-3 transition-all group">
                                Lihat Detail Lengkap <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column (Sidebar Content) */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 h-fit"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    <img
                                        src={getMediaUrl(user?.foto_profile)}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-black text-slate-900 font-display">{user?.username ?? "User Name"}</h2>
                                <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                            </div>

                            <div className="w-full h-px bg-slate-100 my-2" />

                            <div className="w-full space-y-4 text-left">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Informasi Akun</h3>
                                </div>
                                <div className="bg-slate-50/50 rounded-[1.5rem] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                                    <AccountItem icon={Mail} label="EMAIL" value={user?.email} />
                                    <AccountItem icon={Phone} label="TELEPON" value={perusahaan?.telepon} />
                                    <AccountItem icon={MapPin} label="LOKASI" value={perusahaan?.alamat} />
                                    <AccountItem icon={Briefcase} label="JABATAN" value={user?.jabatan_name} />
                                    <AccountItem icon={Building2} label="PERUSAHAAN" value={perusahaan?.nama_perusahaan ?? "Nama Perusahaan"} />
                                    <AccountItem icon={Calendar} label="BERGABUNG" value={user?.created_at || user?.createdAt ? new Date(user.created_at || user.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "Tidak diketahui"} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Company Info Card - Directly below profile */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between h-fit"
                        >
                            <div className="space-y-4">
                                <h3 className="text-base font-black text-slate-800">Tentang Perusahaan</h3>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-slate-900">{perusahaan?.nama_perusahaan}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {perusahaan?.deskripsi || "Informasi perusahaan belum lengkap. Silakan lengkapi profil perusahaan di menu profil."}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-8">
                                <InfoTile icon={Phone} label="TELEPON" value={perusahaan?.telepon || "-"} />
                                <InfoTile icon={Globe} label="WEBSITE" value={perusahaan?.website || "-"} />
                                <InfoTile icon={Users} label="STATUS CSIRT" value={isCsirtFilled ? "Terdaftar" : "Belum Terdaftar"} />
                                <InfoTile icon={CheckCircle2} label="STATUS IKAS" value={isIkasFilled ? "Lengkap" : "Incomplete"} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

}

function DecorativeShape({ style, colorClass }: { style: string; colorClass: string }) {
    if (style === "circles") return (
        <div className={`absolute -right-6 -bottom-6 opacity-60 ${colorClass}`}>
            <svg width="140" height="140" viewBox="0 0 140 140" fill="currentColor">
                <circle cx="90" cy="50" r="48" opacity="0.5" />
                <circle cx="60" cy="100" r="34" opacity="0.4" />
                <circle cx="110" cy="110" r="24" opacity="0.3" />
            </svg>
        </div>
    );
    if (style === "spiral") return (
        <div className={`absolute -right-4 -bottom-4 opacity-60 ${colorClass}`}>
            <svg width="140" height="140" viewBox="0 0 140 140" fill="currentColor">
                <circle cx="100" cy="100" r="50" opacity="0.35" />
                <circle cx="100" cy="100" r="36" opacity="0.30" />
                <circle cx="100" cy="100" r="22" opacity="0.25" />
                <circle cx="100" cy="100" r="10" opacity="0.4" />
            </svg>
        </div>
    );
    if (style === "squares") return (
        <div className={`absolute -right-4 -bottom-4 opacity-60 ${colorClass}`}>
            <svg width="140" height="140" viewBox="0 0 140 140" fill="currentColor">
                <rect x="60" y="10" width="60" height="60" rx="12" opacity="0.5" />
                <rect x="30" y="60" width="55" height="55" rx="12" opacity="0.35" />
                <rect x="80" y="75" width="45" height="45" rx="10" opacity="0.25" />
            </svg>
        </div>
    );
    if (style === "diamonds") return (
        <div className={`absolute -right-4 -bottom-4 opacity-60 ${colorClass}`}>
            <svg width="140" height="140" viewBox="0 0 140 140" fill="currentColor">
                <polygon points="100,10 130,60 100,110 70,60" opacity="0.45" />
                <polygon points="70,50 100,90 70,130 40,90" opacity="0.30" />
                <polygon points="110,65 130,95 110,125 90,95" opacity="0.25" />
            </svg>
        </div>
    );
    return null;
}

function SocietyCard({ label, fullName, description, href, cardBg, dotColor, titleColor, descColor, linkColor, badgeBg, badgeText, shapeColor, shapeStyle, status }: any) {
    const isFilled = status === "Sudah Diisi";
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Link
                href={href}
                className={`relative block ${cardBg} rounded-[2rem] p-7 overflow-hidden group cursor-pointer border border-black/5 hover:shadow-xl transition-all duration-300`}
            >
                {/* Status badge */}
                <div className="relative z-10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${badgeBg} ${badgeText} backdrop-blur-sm border border-black/5`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isFilled ? dotColor : "bg-slate-400"}`} />
                        {status}
                    </span>
                </div>

                {/* Title & Description */}
                <div className="relative z-10 mt-5 mb-10">
                    <h4 className={`text-2xl font-black tracking-tight ${titleColor}`}>{label}</h4>
                    <p className={`text-sm mt-2 leading-relaxed font-medium ${descColor} max-w-[65%]`}>{description}</p>
                </div>

                {/* CTA Link */}
                <div className="relative z-10">
                    <span className={`text-sm font-bold underline underline-offset-2 flex items-center gap-1 w-fit transition-all ${linkColor} group-hover:gap-2`}>
                        {isFilled ? "Lihat Detail" : "Isi Sekarang"}
                        <ChevronRight className="w-4 h-4" />
                    </span>
                </div>

                {/* Decorative shape */}
                <DecorativeShape style={shapeStyle} colorClass={shapeColor} />
            </Link>
        </motion.div>
    );
}

function AccountItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-white transition-colors duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-0.5">{label}</p>
                <p className="text-[13px] font-bold text-slate-700 truncate leading-none">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}

function InfoTile({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-300 border border-slate-50 group hover:border-slate-100 hover:shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">{label}</p>
            </div>
            <p className="text-[13px] font-bold text-slate-700 truncate ml-4">
                {value || "-"}
            </p>
        </div>
    );
}
