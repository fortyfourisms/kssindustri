import { useUser } from "@/hooks/useAuth";
import {
    Shield,
    Monitor,
    Users,
    ClipboardList,
    ChevronRight,
    ArrowUpRight,
    Mail,
    Phone,
    Globe,
    CheckCircle2,
    Briefcase,
    Calendar,
    LucideIcon,
    Sparkles,
    Activity,
    BadgeCheck,
    FileCheck2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQueries, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RadarChartIkas } from "@/components/RadarChartIkas";
import { getMediaUrl } from "@/lib/utils";
import { ikasService } from "@/services/ikas.service";
import type {
    IkasData,
    JawabanDeteksi,
    JawabanGulih,
    JawabanIdentifikasi,
    JawabanProteksi,
    PertanyaanDeteksi,
    PertanyaanGulih,
    PertanyaanIdentifikasi,
    PertanyaanProteksi,
} from "@/types/ikas.types";

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
        accentFrom: "from-blue-600",
        accentTo: "to-cyan-400",
        panelBg: "bg-blue-500/10",
        panelIcon: Shield,
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
        accentFrom: "from-violet-600",
        accentTo: "to-fuchsia-400",
        panelBg: "bg-violet-500/10",
        panelIcon: Monitor,
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
        accentFrom: "from-teal-600",
        accentTo: "to-emerald-400",
        panelBg: "bg-teal-500/10",
        panelIcon: BadgeCheck,
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
        accentFrom: "from-amber-500",
        accentTo: "to-orange-400",
        panelBg: "bg-amber-500/10",
        panelIcon: ClipboardList,
    },
};

function normalizeCollectionCount(data: unknown) {
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === "object") return Object.keys(data as Record<string, unknown>).length;
    return 0;
}

function formatModuleStatus(count: number, singular: string, plural = singular) {
    if (count <= 0) return "Belum ada data";
    return `${count} ${count === 1 ? singular : plural}`;
}

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

    const { data: ikasListData } = useQuery({
        queryKey: ["ikasList"],
        queryFn: () => ikasService.getAll(),
    });
    const { data: kseData } = useQuery({ queryKey: ["kse"], queryFn: api.getKse });
    const { data: csirtData } = useQuery({ queryKey: ["csirt"], queryFn: api.getCsirt });
    const { data: surveiData } = useQuery({ queryKey: ["survei"], queryFn: api.getSurvei });

    const [
        pertanyaanIdentifikasiQuery,
        pertanyaanProteksiQuery,
        pertanyaanDeteksiQuery,
        pertanyaanGulihQuery,
        jawabanIdentifikasiQuery,
        jawabanProteksiQuery,
        jawabanDeteksiQuery,
        jawabanGulihQuery,
    ] = useQueries({
        queries: [
            { queryKey: ["pertanyaan-identifikasi"], queryFn: () => ikasService.getPertanyaanIdentifikasi() },
            { queryKey: ["pertanyaan-proteksi"], queryFn: () => ikasService.getPertanyaanProteksi() },
            { queryKey: ["pertanyaan-deteksi"], queryFn: () => ikasService.getPertanyaanDeteksi() },
            { queryKey: ["pertanyaan-gulih"], queryFn: () => ikasService.getPertanyaanGulih() },
            { queryKey: ["jawaban-identifikasi"], queryFn: () => ikasService.getJawabanIdentifikasi() },
            { queryKey: ["jawaban-proteksi"], queryFn: () => ikasService.getJawabanProteksi() },
            { queryKey: ["jawaban-deteksi"], queryFn: () => ikasService.getJawabanDeteksi() },
            { queryKey: ["jawaban-gulih"], queryFn: () => ikasService.getJawabanGulih() },
        ],
    });

    // Fallback data structure for IKAS mirroring IKAS.tsx
    const ikasDataFallback = {
        total_rata_rata: 0,
        total_kategori: "INPUT BELUM LENGKAP",
        identifikasi: { nilai_identifikasi: 0, kategori_identifikasi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0, nilai_subdomain5: 0 },
        proteksi: { nilai_proteksi: 0, kategori_proteksi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0, nilai_subdomain5: 0, nilai_subdomain6: 0 },
        deteksi: { nilai_deteksi: 0, kategori_deteksi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0 },
        tanggulih: { nilai_tanggulih: 0, kategori_tanggulih: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0 },
    };

    const ikasList = (ikasListData ?? []) as IkasData[];
    const latestIkas = [...ikasList].sort((a, b) => {
        const dateA = new Date(a.tanggal || a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.tanggal || b.updated_at || b.created_at).getTime();
        return dateB - dateA;
    })[0];

    const pertanyaanIdentifikasi = (pertanyaanIdentifikasiQuery.data ?? []) as PertanyaanIdentifikasi[];
    const pertanyaanProteksi = (pertanyaanProteksiQuery.data ?? []) as PertanyaanProteksi[];
    const pertanyaanDeteksi = (pertanyaanDeteksiQuery.data ?? []) as PertanyaanDeteksi[];
    const pertanyaanGulih = (pertanyaanGulihQuery.data ?? []) as PertanyaanGulih[];

    const jawabanIdentifikasi = (jawabanIdentifikasiQuery.data ?? []) as JawabanIdentifikasi[];
    const jawabanProteksi = (jawabanProteksiQuery.data ?? []) as JawabanProteksi[];
    const jawabanDeteksi = (jawabanDeteksiQuery.data ?? []) as JawabanDeteksi[];
    const jawabanGulih = (jawabanGulihQuery.data ?? []) as JawabanGulih[];

    const totalPertanyaanIkas =
        pertanyaanIdentifikasi.length +
        pertanyaanProteksi.length +
        pertanyaanDeteksi.length +
        pertanyaanGulih.length;
    const totalJawabanIkas =
        jawabanIdentifikasi.length +
        jawabanProteksi.length +
        jawabanDeteksi.length +
        jawabanGulih.length;
    const progressPengisianIkas = totalPertanyaanIkas > 0
        ? `${Math.round((totalJawabanIkas / totalPertanyaanIkas) * 100)}%`
        : "0%";

    const allJawabanIkas = [
        ...jawabanIdentifikasi,
        ...jawabanProteksi,
        ...jawabanDeteksi,
        ...jawabanGulih,
    ];
    const validasiValues = allJawabanIkas
        .map((item) => String(item.validasi ?? "").trim().toLowerCase())
        .filter(Boolean);

    const statusVerifikasiIkas = (() => {
        if (validasiValues.length === 0) return "Belum diverifikasi";
        if (validasiValues.some((value) => value.includes("tolak") || value.includes("reject") || value.includes("revisi"))) {
            return "Perlu revisi";
        }
        if (validasiValues.every((value) => value.includes("verif") || value.includes("valid") || value.includes("approve") || value.includes("setuju"))) {
            return "Terverifikasi";
        }
        return "Menunggu verifikasi";
    })();

    const hasilFinalIkas = latestIkas
        ? `${Number(latestIkas.nilai_kematangan ?? 0).toFixed(2)} - ${latestIkas.kategori_kematangan_keamanan_siber ?? "-"}`
        : "Belum tersedia";

    const isIkasFilled = totalJawabanIkas > 0 || ikasList.length > 0;
    const activeIkasData = latestIkas
        ? {
            total_rata_rata: latestIkas.nilai_kematangan ?? 0,
            total_kategori: latestIkas.kategori_kematangan_keamanan_siber ?? "INPUT BELUM LENGKAP",
            identifikasi: {
                nilai_identifikasi: latestIkas.identifikasi?.nilai_identifikasi ?? 0,
                kategori_identifikasi: latestIkas.identifikasi?.kategori_tingkat_kematangan_domain ?? "INPUT BELUM LENGKAP",
                nilai_subdomain1: latestIkas.identifikasi?.nilai_subdomain1 ?? 0,
                nilai_subdomain2: latestIkas.identifikasi?.nilai_subdomain2 ?? 0,
                nilai_subdomain3: latestIkas.identifikasi?.nilai_subdomain3 ?? 0,
                nilai_subdomain4: latestIkas.identifikasi?.nilai_subdomain4 ?? 0,
                nilai_subdomain5: latestIkas.identifikasi?.nilai_subdomain5 ?? 0,
            },
            proteksi: {
                nilai_proteksi: latestIkas.proteksi?.nilai_proteksi ?? 0,
                kategori_proteksi: latestIkas.proteksi?.kategori_tingkat_kematangan_domain ?? "INPUT BELUM LENGKAP",
                nilai_subdomain1: latestIkas.proteksi?.nilai_subdomain1 ?? 0,
                nilai_subdomain2: latestIkas.proteksi?.nilai_subdomain2 ?? 0,
                nilai_subdomain3: latestIkas.proteksi?.nilai_subdomain3 ?? 0,
                nilai_subdomain4: latestIkas.proteksi?.nilai_subdomain4 ?? 0,
                nilai_subdomain5: latestIkas.proteksi?.nilai_subdomain5 ?? 0,
                nilai_subdomain6: latestIkas.proteksi?.nilai_subdomain6 ?? 0,
            },
            deteksi: {
                nilai_deteksi: latestIkas.deteksi?.nilai_deteksi ?? 0,
                kategori_deteksi: latestIkas.deteksi?.kategori_tingkat_kematangan_domain ?? "INPUT BELUM LENGKAP",
                nilai_subdomain1: latestIkas.deteksi?.nilai_subdomain1 ?? 0,
                nilai_subdomain2: latestIkas.deteksi?.nilai_subdomain2 ?? 0,
                nilai_subdomain3: latestIkas.deteksi?.nilai_subdomain3 ?? 0,
            },
            tanggulih: {
                nilai_tanggulih: latestIkas.gulih?.nilai_gulih ?? 0,
                kategori_tanggulih: latestIkas.gulih?.kategori_tingkat_kematangan_domain ?? "INPUT BELUM LENGKAP",
                nilai_subdomain1: latestIkas.gulih?.nilai_subdomain1 ?? 0,
                nilai_subdomain2: latestIkas.gulih?.nilai_subdomain2 ?? 0,
                nilai_subdomain3: latestIkas.gulih?.nilai_subdomain3 ?? 0,
                nilai_subdomain4: latestIkas.gulih?.nilai_subdomain4 ?? 0,
            },
        }
        : ikasDataFallback;
    const kseCount = normalizeCollectionCount(kseData);
    const csirtCount = normalizeCollectionCount(csirtData);
    const surveiCount = normalizeCollectionCount(surveiData);

    const isKseFilled = kseCount > 0;
    const isCsirtFilled = csirtCount > 0;
    const isSurveiFilled = surveiCount > 0;

    const kseMetrics = [
        { label: "Data Tersimpan", value: formatModuleStatus(kseCount, "entri", "entri") },
        { label: "Kondisi", value: isKseFilled ? "Siap ditinjau" : "Perlu pengisian" },
        { label: "Aksi", value: isKseFilled ? "Lanjutkan pembaruan" : "Mulai isi data" },
    ];

    const csirtMetrics = [
        { label: "Tim Terdaftar", value: formatModuleStatus(csirtCount, "tim", "tim") },
        { label: "Status", value: isCsirtFilled ? "Aktif dipantau" : "Belum terdaftar" },
        { label: "Aksi", value: isCsirtFilled ? "Kelola anggota" : "Daftarkan tim" },
    ];

    const surveiMetrics = [
        { label: "Respons Masuk", value: formatModuleStatus(surveiCount, "respons", "respons") },
        { label: "Kondisi", value: isSurveiFilled ? "Sudah tersedia" : "Belum diisi" },
        { label: "Aksi", value: isSurveiFilled ? "Lihat hasil survei" : "Mulai survei" },
    ];

    return (
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
                            metrics={[
                                { label: "Progress Pengisian", value: progressPengisianIkas },
                                { label: "Status Verifikasi", value: statusVerifikasiIkas },
                                { label: "Hasil Final", value: hasilFinalIkas },
                            ]}
                        />
                        <SocietyCard
                            {...moduleConfig.KSE}
                            status={isKseFilled ? "Sudah Diisi" : "Belum Diisi"}
                            metrics={kseMetrics}
                        />
                        <SocietyCard
                            {...moduleConfig.CSIRT}
                            status={isCsirtFilled ? "Sudah Diisi" : "Belum Diisi"}
                            metrics={csirtMetrics}
                        />
                        <SocietyCard
                            {...moduleConfig.SURVEI}
                            status={isSurveiFilled ? "Sudah Diisi" : "Belum Diisi"}
                            metrics={surveiMetrics}
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
                        <Link to="/dashboard/ikas" className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider hover:gap-3 transition-all group">
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
                                <AccountItem icon={Users} label="USERNAME" value={user?.username} />
                                <AccountItem icon={Mail} label="EMAIL" value={user?.email} />
                                <AccountItem icon={Briefcase} label="JABATAN" value={user?.jabatan_name || "-"} />
                                <AccountItem icon={Calendar} label="BERGABUNG" value={user?.created_at || user?.updated_at ? new Date(user.created_at || user.updated_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "Tidak diketahui"} />
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

type SocietyMetric = {
    label: string;
    value: string;
};

type SocietyCardProps = {
    label: string;
    fullName: string;
    description: string;
    href: string;
    cardBg: string;
    dotColor: string;
    titleColor: string;
    descColor: string;
    linkColor: string;
    badgeBg: string;
    badgeText: string;
    shapeColor: string;
    shapeStyle: string;
    accentFrom: string;
    accentTo: string;
    panelBg: string;
    panelIcon: LucideIcon;
    status: string;
    metrics?: SocietyMetric[];
};

function SocietyCard({
    label,
    fullName,
    description,
    href,
    cardBg,
    dotColor,
    titleColor,
    descColor,
    linkColor,
    badgeBg,
    badgeText,
    shapeColor,
    shapeStyle,
    accentFrom,
    accentTo,
    panelBg,
    panelIcon: PanelIcon,
    status,
    metrics = [],
}: SocietyCardProps) {
    const isFilled = status === "Sudah Diisi";
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -6 }}
        >
            <Link
                to={href}
                className={`relative block ${cardBg} rounded-[2rem] p-6 overflow-hidden group cursor-pointer border border-white/60 hover:shadow-2xl hover:shadow-slate-300/30 transition-all duration-300 backdrop-blur-sm`}
            >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentFrom} ${accentTo}`} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/20" />

                {/* Status badge */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="space-y-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${badgeBg} ${badgeText} backdrop-blur-sm border border-black/5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isFilled ? dotColor : "bg-slate-400"}`} />
                            {status}
                        </span>
                        <div className={`w-12 h-12 rounded-2xl ${panelBg} border border-white/60 shadow-inner flex items-center justify-center`}>
                            <PanelIcon className={`w-6 h-6 ${titleColor}`} />
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-white/70 border border-black/5 ${titleColor}`}>
                            <Sparkles className="w-3 h-3" />
                            Modul
                        </div>
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold bg-white/60 border border-black/5 ${badgeText}`}>
                            <Activity className="w-3 h-3" />
                            Interaktif
                        </div>
                    </div>
                </div>

                {/* Title & Description */}
                <div className="relative z-10 mt-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-black">{fullName}</p>
                            <h4 className={`text-2xl font-black tracking-tight mt-2 ${titleColor}`}>{label}</h4>
                        </div>
                        <div className={`rounded-2xl px-3 py-2 text-right bg-white/60 border border-black/5 ${titleColor}`}>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Ringkas</p>
                            <p className="text-sm font-black">{metrics[0]?.value ?? status}</p>
                        </div>
                    </div>
                    <p className={`text-sm mt-3 leading-relaxed font-medium ${descColor} max-w-[85%]`}>{description}</p>
                </div>

                {metrics.length > 0 && (
                    <div className="relative z-10 mt-5 mb-6 grid grid-cols-1 gap-2.5">
                        {metrics.map((metric) => (
                            <div key={metric.label} className="rounded-[1.25rem] bg-white/75 backdrop-blur-md border border-white/70 px-3.5 py-3 shadow-sm shadow-slate-200/40 transition-transform duration-300 group-hover:translate-x-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{metric.label}</p>
                                        <p className={`text-sm font-bold mt-1 leading-snug ${titleColor}`}>{metric.value || "-"}</p>
                                    </div>
                                    <div className={`mt-0.5 rounded-xl p-2 ${panelBg}`}>
                                        <FileCheck2 className={`w-4 h-4 ${titleColor}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA Link */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                    <span className={`text-sm font-bold flex items-center gap-1 w-fit transition-all ${linkColor} group-hover:gap-2`}>
                        {isFilled ? "Lihat Detail" : "Isi Sekarang"}
                        <ChevronRight className="w-4 h-4" />
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${titleColor}`}>
                        Buka Menu
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
