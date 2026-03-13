import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useUser, useProfile } from "@/hooks/useAuth";
import {
    Shield,
    Monitor,
    Users,
    ClipboardList,
    TrendingUp,
    Award,
    ChevronRight,
    Info,
    Mail,
    Building2,
    Phone,
    Globe,
    MoreVertical,
    CheckCircle2,
    Briefcase,
    MapPin,
    Calendar,
    Target
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RadarChartIkas } from "@/components/RadarChartIkas";

const moduleConfig = {
    IKAS: {
        label: "IKAS",
        fullName: "Indeks Keamanan Siber",
        href: "/dashboard/ikas",
        icon: Shield,
        color: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/25",
        bg: "bg-blue-50",
        text: "text-blue-700",
    },
    KSE: {
        label: "KSE",
        fullName: "Kapasitas SDM & Ekosistem",
        href: "/dashboard/kse",
        icon: Monitor,
        color: "from-purple-500 to-indigo-600",
        shadow: "shadow-purple-500/25",
        bg: "bg-purple-50",
        text: "text-purple-700",
    },
    CSIRT: {
        label: "CSIRT",
        fullName: "Status Tim Respons Insiden",
        href: "/dashboard/csirt",
        icon: Shield, // Using Shield as per image for CSIRT
        color: "from-cyan-500 to-teal-500",
        shadow: "shadow-cyan-500/25",
        bg: "bg-cyan-50",
        text: "text-cyan-700",
    },
};

export default function Dashboard() {
    const { data: user } = useUser();
    const {
        displayEmail,
        displayPhone,
        displayLocation,
        displayJabatan,
        displayJoined
    } = useProfile();

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

    const perusahaan = user?.perusahaan ?? user;
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
                            className="relative rounded-[2rem] overflow-hidden group h-[280px] shadow-2xl shadow-blue-900/10 border border-white/20"
                        >
                            <img
                                src="/images/banner.png"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Dashboard Banner"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-900/20 to-transparent" />

                            <div className="absolute inset-0 p-10 flex flex-col justify-between">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                                        {perusahaan?.nama_perusahaan ?? "Nama Perusahaan"}
                                    </h1>
                                </div>
                            </div>
                        </motion.div>

                        {/* Module Action Cards - Directly below banner */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ModuleActionCard
                                {...moduleConfig.IKAS}
                                status={isIkasFilled ? "Sudah Diisi" : "Belum Diisi"}
                                subText="Indeks Keamanan Siber"
                            />
                            <ModuleActionCard
                                {...moduleConfig.KSE}
                                status={isKseFilled ? "Sudah Diisi" : "Belum Diisi"}
                                subText="Kapasitas SDM & Ekosistem"
                            />
                            <ModuleActionCard
                                {...moduleConfig.CSIRT}
                                status={isCsirtFilled ? "Sudah Diisi" : "Belum Diisi"}
                                subText="Status Tim Respons Insiden"
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
                                        src={user?.foto_profile}
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
                                    <AccountItem icon={Mail} label="EMAIL" value={displayEmail} />
                                    <AccountItem icon={Phone} label="TELEPON" value={displayPhone} />
                                    <AccountItem icon={MapPin} label="LOKASI" value={displayLocation} />
                                    <AccountItem icon={Briefcase} label="JABATAN" value={displayJabatan} />
                                    <AccountItem icon={Building2} label="PERUSAHAAN" value={perusahaan?.nama_perusahaan ?? "Nama Perusahaan"} />
                                    <AccountItem icon={Calendar} label="BERGABUNG" value={displayJoined} />
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

function ModuleActionCard({ label, fullName, href, icon: Icon, color, shadow, bg, text, status, subText }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Link
                href={href}
                className="block bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/30 border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group cursor-pointer relative overflow-hidden"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadow} transition-transform group-hover:scale-110`}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-lg font-display">{label}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className={`px-3 py-0.5 rounded-full ${bg} ${text} text-[10px] font-bold flex items-center gap-1`}>
                                    <div className={`w-1 h-1 rounded-full ${text.replace('text', 'bg')}`} />
                                    {status}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-500">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-8 flex items-center gap-2 text-slate-400">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-semibold">{subText}</span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <span className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Lihat Detail</span>
                    <div className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all ml-auto">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
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
