import { useUser } from "@/hooks/useAuth";
import {
    Shield,
    Monitor,
    Users,
    ClipboardList,
    BookOpen,
    ChevronRight,
    ArrowRight,
    ArrowUpRight,
    Mail,
    Phone,
    Globe,
    CheckCircle2,
    CircleDashed,
    Briefcase,
    Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQueries, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";
import { ikasService } from "@/services/ikas.service";
import { csirtService } from "@/services/csirt.service";
import { lmsService } from "@/features/lms/services/lms.service";
import { surveyService } from "@/services/survey.service";
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
import type { SurveyProgress, SurveyRespondent } from "@/types/survey.types";

const moduleConfig = {
    IKAS: {
        label: "IKAS",
        fullName: "Indeks Keamanan Siber",
        description: "Ukur dan pantau tingkat keamanan siber organisasi Anda secara komprehensif.",
        href: "/dashboard/ikas",
        titleColor: "text-blue-900",
        linkColor: "text-blue-700 hover:text-blue-900",
        badgeText: "text-blue-700",
        accentFrom: "from-blue-600",
        accentTo: "to-cyan-400",
    },
    KSE: {
        label: "KSE",
        fullName: "Kapasitas SDM & Ekosistem",
        description: "Evaluasi kapasitas sumber daya manusia dan ekosistem keamanan siber.",
        href: "/dashboard/kse",
        titleColor: "text-violet-900",
        linkColor: "text-violet-700 hover:text-violet-900",
        badgeText: "text-violet-700",
        accentFrom: "from-violet-600",
        accentTo: "to-fuchsia-400",
    },
    CSIRT: {
        label: "CSIRT",
        fullName: "Status Tim Respons Insiden",
        description: "Daftarkan dan kelola status tim respons insiden siber organisasi.",
        href: "/dashboard/csirt",
        titleColor: "text-teal-900",
        linkColor: "text-teal-700 hover:text-teal-900",
        badgeText: "text-teal-700",
        accentFrom: "from-teal-600",
        accentTo: "to-emerald-400",
    },
    SURVEI: {
        label: "Survei Profil Resiko",
        fullName: "Profil Resiko Siber",
        description: "Isi survei profil risiko untuk mendapatkan gambaran kesiapan keamanan siber.",
        href: "/dashboard/survei",
        titleColor: "text-amber-900",
        linkColor: "text-amber-700 hover:text-amber-900",
        badgeText: "text-amber-700",
        accentFrom: "from-amber-500",
        accentTo: "to-orange-400",
    },
    LMS: {
        label: "LMS / Course",
        fullName: "Learning Management System",
        description: "Pantau kelas yang tersedia, progres belajar, dan status kelulusan kuis pembelajaran Anda.",
        href: "/lms",
        titleColor: "text-sky-900",
        linkColor: "text-sky-700 hover:text-sky-900",
        badgeText: "text-sky-700",
        accentFrom: "from-sky-500",
        accentTo: "to-cyan-400",
    },
};

function normalizeList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (!data || typeof data !== "object") return [];

    const record = data as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.csirt)) return record.csirt as T[];
    if (Array.isArray(record.se)) return record.se as T[];
    if (Array.isArray(record.sdm)) return record.sdm as T[];

    if ("id" in record) return [record as T];
    return [];
}

function getLatestRecord<T extends Record<string, any>>(list: T[]): T | null {
    if (list.length === 0) return null;
    return [...list].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || a.tanggal || 0).getTime();
        const dateB = new Date(b.updated_at || b.created_at || b.tanggal || 0).getTime();
        return dateB - dateA;
    })[0] ?? null;
}

const FIELD_TO_BOBOT: Record<string, Record<string, number>> = {
    nilai_investasi: { A: 5, B: 2, C: 1 },
    anggaran_operasional: { A: 5, B: 2, C: 1 },
    kepatuhan_peraturan: { A: 5, B: 2, C: 1 },
    teknik_kriptografi: { A: 5, B: 2, C: 1 },
    jumlah_pengguna: { A: 5, B: 2, C: 1 },
    data_pribadi: { A: 5, B: 2, C: 1 },
    klasifikasi_data: { A: 5, B: 2, C: 1 },
    kekritisan_proses: { A: 5, B: 2, C: 1 },
    dampak_kegagalan: { A: 5, B: 2, C: 1 },
    potensi_kerugian_dan_dampak_negatif: { A: 5, B: 2, C: 1 },
};

function computeKseScore(se: Record<string, any> | null | undefined) {
    if (!se) return 0;
    return Object.entries(FIELD_TO_BOBOT).reduce((sum, [field, bobotMap]) => {
        const value = se[field];
        return sum + (bobotMap[String(value)] || 0);
    }, 0);
}

function getVerificationStatus(raw: Record<string, any> | null | undefined) {
    const value = String(
        raw?.status_verifikasi ??
        raw?.verifikasi ??
        raw?.validasi ??
        raw?.status ??
        ""
    ).trim().toLowerCase();

    if (!value) return "Belum diverifikasi";
    if (value.includes("tolak") || value.includes("reject") || value.includes("revisi")) return "Perlu revisi";
    if (value.includes("verif") || value.includes("valid") || value.includes("approve") || value.includes("setuju")) return "Terverifikasi";
    return "Menunggu verifikasi";
}

function computeLearningProgress(materi: Array<Record<string, any>>, completedIds: string[]) {
    if (!materi.length) return 0;
    return Math.round((completedIds.length / materi.length) * 100);
}

function getSurveyStatus(progress: SurveyProgress | null, respondent: SurveyRespondent | null) {
    if (!respondent) {
        return "Belum mengisi survei";
    }

    if (progress?.completed || progress?.finished_at) {
        return "Survei selesai";
    }

    if (typeof progress?.current_risk === "number") {
        return "Sedang mengisi survei";
    }

    return "Data responden tersimpan";
}

export default function Dashboard() {
    const { data: user } = useUser();

    // Fetch perusahaan langsung dari GET /api/perusahaan/{id}
    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { data: perusahaanResponse } = useQuery({
        queryKey: ["perusahaan", perusahaanId],
        queryFn: () => api.getPerusahaanById(String(perusahaanId)),
        enabled: !!perusahaanId && !user?.perusahaan?.nama_perusahaan,
    });
    const perusahaan = perusahaanResponse ?? user?.perusahaan;

    const { data: myIkasData } = useQuery({
        queryKey: ["my-ikas", perusahaanId || "unknown"],
        queryFn: () => ikasService.getMyIkas(perusahaanId),
        enabled: !!perusahaanId,
    });
    const { data: kseData } = useQuery({ queryKey: ["kse"], queryFn: api.getKse });
    const { data: csirtData } = useQuery({ queryKey: ["csirt"], queryFn: api.getCsirt });
    const { data: lmsCoursesData } = useQuery({ queryKey: ["lms-courses"], queryFn: () => lmsService.getCourses() });
    const { data: lmsCertificatesData } = useQuery({ queryKey: ["lms-certificates"], queryFn: () => lmsService.getMySertifikats() });
    const { data: surveyRespondent } = useQuery({
        queryKey: ["survey-respondent", user?.email || "unknown"],
        queryFn: () => surveyService.findRespondentByEmail(user?.email),
        enabled: !!user?.email,
    });
    const { data: surveyProgress } = useQuery({
        queryKey: ["survey-progress", surveyRespondent?.id || "unknown"],
        queryFn: () => surveyService.getProgress(surveyRespondent?.id as number),
        enabled: !!surveyRespondent?.id,
    });

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

    const ikasList = (myIkasData
        ? (Array.isArray(myIkasData) ? myIkasData : [myIkasData])
        : []) as IkasData[];
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

    const isIkasFilled = totalJawabanIkas > 0 || ikasList.length > 0;
    const kseList = normalizeList<Record<string, any>>(kseData);
    const lmsCourses = normalizeList<Record<string, any>>(lmsCoursesData).filter((course) => course.status !== "draft");
    const lmsCertificates = normalizeList<Record<string, any>>(lmsCertificatesData);
    const latestKse = getLatestRecord(kseList);
    const latestCsirt = getLatestRecord(normalizeList<Record<string, any>>(csirtData));
    const latestCsirtId = latestCsirt?.id ? String(latestCsirt.id) : null;

    const [sdmCsirtQuery, seCsirtQuery] = useQueries({
        queries: [
            {
                queryKey: ["sdm_csirt", latestCsirtId],
                queryFn: () => csirtService.getSdmByCsirtId(latestCsirtId as string),
                enabled: !!latestCsirtId,
            },
            {
                queryKey: ["se_csirt", latestCsirtId],
                queryFn: () => csirtService.getSeByCsirtId(latestCsirtId as string),
                enabled: !!latestCsirtId,
            },
        ],
    });
    const lmsCourseDetailsQueries = useQueries({
        queries: lmsCourses.map((course) => ({
            queryKey: ["lms-course-detail-card", course.id],
            queryFn: () => lmsService.getCourseById(String(course.id)),
            enabled: !!course.id,
        })),
    });

    const sdmCsirtList = normalizeList<Record<string, any>>(sdmCsirtQuery.data);
    const seCsirtList = normalizeList<Record<string, any>>(seCsirtQuery.data);

    const csirtChecklist = [
        { label: "Data CSIRT", complete: !!latestCsirt },
        { label: "SDM CSIRT", complete: sdmCsirtList.length > 0 },
        { label: "SE CSIRT", complete: seCsirtList.length > 0 },
    ];
    const csirtCompletedCount = csirtChecklist.filter((item) => item.complete).length;
    const csirtProgressValue = Math.round((csirtCompletedCount / csirtChecklist.length) * 100);
    const isCsirtComplete = csirtCompletedCount === csirtChecklist.length;

    const latestKseScore = computeKseScore(latestKse);
    const kseVerificationStatus = getVerificationStatus(latestKse);
    const isKseFilled = kseList.length > 0;
    const isSurveiFilled = Boolean(surveyRespondent);
    const surveyCompleted = Boolean(surveyProgress?.completed || surveyProgress?.finished_at);
    const surveyStatus = getSurveyStatus(surveyProgress ?? null, surveyRespondent ?? null);
    const surveyCurrentRisk = typeof surveyProgress?.current_risk === "number" ? surveyProgress.current_risk + 1 : null;
    const surveyTotalRisks = typeof surveyProgress?.total_risks === "number"
        ? surveyProgress.total_risks
        : typeof surveyProgress?.total_steps === "number"
            ? surveyProgress.total_steps
            : null;
    const lmsProgressByCourse = lmsCourses.map((course, index) => {
        const detail = lmsCourseDetailsQueries[index]?.data;
        const materi = detail?.materi ?? [];
        const completedIds = detail?.completedIds ?? [];
        const hasCertificate = lmsCertificates.some((cert) => String(cert.id_kelas) === String(course.id));
        const progress = hasCertificate ? 100 : computeLearningProgress(materi, completedIds);
        return {
            id: String(course.id),
            label: String(course.judul ?? "Kelas"),
            value: hasCertificate ? "LULUS" : `${progress}%`,
            progress,
            started: hasCertificate || completedIds.length > 0,
        };
    });
    const followedCourses = lmsProgressByCourse.filter((item) => item.started);
    const lmsDetailItems = (followedCourses.length > 0 ? followedCourses : lmsProgressByCourse)
        .slice(0, 4)
        .map((item) => ({
            label: item.label,
            value: item.value,
            highlight: item.value === "LULUS",
        }));
    const lmsAvailableCount = lmsCourses.length;
    const lmsFollowedCount = followedCourses.length;
    const lmsPassedQuizCount = lmsCertificates.length;
    const hasLmsData = lmsAvailableCount > 0;

    const csirtMetrics = [
        { label: "Status", value: isCsirtComplete ? "Data sudah lengkap" : "Data belum lengkap" },
    ];

    const kseMetrics = isKseFilled
        ? [
            { label: "Skor Terakhir", value: String(latestKseScore) },
            { label: "Status Verifikasi", value: kseVerificationStatus },
        ]
        : [
            { label: "Status", value: "Belum ada pengisian KSE" },
            { label: "Aksi", value: "Isi KSE untuk melihat skor" },
        ];

    const surveiMetrics = isSurveiFilled
        ? [
            { label: "Status", value: surveyStatus },
            {
                label: "Progress Risiko",
                value: surveyCompleted
                    ? "Selesai"
                    : surveyCurrentRisk !== null
                        ? `Risiko ${surveyCurrentRisk}${surveyTotalRisks ? ` / ${surveyTotalRisks}` : ""}`
                        : "Menunggu risiko pertama",
            },
        ]
        : [
            { label: "Status", value: "Belum mengisi survei" },
            { label: "Aksi", value: "Isi survei untuk mulai asesmen risiko" },
        ];
    const lmsMetrics = [
        { label: "Jumlah Kelas Tersedia", value: String(lmsAvailableCount) },
        { label: "Jumlah Kelas Diikuti", value: String(lmsFollowedCount) },
        { label: "Kuis Telah Lulus", value: String(lmsPassedQuizCount) },
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
                        className="relative rounded-[2rem] overflow-hidden group h-[180px] sm:h-[240px] md:h-[280px] border border-white/20"
                    >
                        <img
                            src="/images/banner.png"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Dashboard Banner"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-900/20 to-transparent" />

                        <div className="absolute inset-0 p-5 md:p-10 flex flex-col justify-between">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    {perusahaan?.nama_perusahaan ?? "Nama Perusahaan"}
                                </h1>
                            </div>
                        </div>
                    </motion.div>

                    {/* Module Action Cards - Directly below banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SocietyCard
                            {...moduleConfig.IKAS}
                            className="sm:col-span-2"
                            featured
                            metrics={[
                                { label: "Progress Pengisian", value: progressPengisianIkas },
                                { label: "Status Verifikasi", value: statusVerifikasiIkas },
                                { label: "Level IKAS", value: latestIkas?.kategori_kematangan_keamanan_siber ?? "Input Belum Lengkap" },
                            ]}
                        />
                        <SocietyCard
                            {...moduleConfig.KSE}
                            metrics={kseMetrics}
                            ctaLabel={!isKseFilled ? "Isi KSE Sekarang" : undefined}
                        />
                        <SocietyCard
                            {...moduleConfig.CSIRT}
                            metrics={csirtMetrics}
                            statusText={isCsirtComplete ? "Data sudah lengkap" : "Data belum lengkap"}
                            checklistItems={csirtChecklist}
                            ctaLabel={!isCsirtComplete ? "Lengkapi Data CSIRT" : undefined}
                        />
                        <SocietyCard
                            {...moduleConfig.SURVEI}
                            metrics={surveiMetrics}
                            ctaLabel={!isSurveiFilled ? "Isi Survei Sekarang" : !surveyCompleted ? "Lanjutkan Survei" : undefined}
                        />
                        <SocietyCard
                            {...moduleConfig.LMS}
                            metrics={lmsMetrics}
                            detailItems={lmsDetailItems}
                            ctaLabel={!hasLmsData || lmsFollowedCount === 0 ? "Mulai Belajar" : undefined}
                        />
                    </div>

                </div>

                {/* Right Column (Sidebar Content) */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 h-fit"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden border-4 border-white">
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
                        className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col justify-between h-fit"
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
                            <InfoTile icon={Users} label="STATUS CSIRT" value={latestCsirt ? "Terdaftar" : "Belum Terdaftar"} />
                            <InfoTile icon={CheckCircle2} label="STATUS IKAS" value={isIkasFilled ? "Lengkap" : "Incomplete"} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );

}

type SocietyMetric = {
    label: string;
    value: string;
};

type ChecklistItem = {
    label: string;
    complete: boolean;
};

type DetailItem = {
    label: string;
    value: string;
    highlight?: boolean;
};

type SocietyCardProps = {
    label: string;
    fullName: string;
    description: string;
    href: string;
    titleColor: string;
    linkColor: string;
    badgeText: string;
    accentFrom: string;
    accentTo: string;
    metrics?: SocietyMetric[];
    statusText?: string;
    checklistItems?: ChecklistItem[];
    detailItems?: DetailItem[];
    progressValue?: number;
    ctaLabel?: string;
    featured?: boolean;
    className?: string;
};

function SocietyCard({
    label,
    fullName,
    description,
    href,
    titleColor,
    linkColor,
    badgeText,
    accentFrom,
    accentTo,
    metrics = [],
    statusText,
    checklistItems = [],
    detailItems = [],
    progressValue: cardProgressValue,
    ctaLabel,
    featured = false,
    className = "",
}: SocietyCardProps) {
    const progressMetric = metrics.find((metric) => metric.label === "Progress Pengisian")?.value ?? "0%";
    const verificationMetric = metrics.find((metric) => metric.label === "Status Verifikasi")?.value ?? "Belum diverifikasi";
    const levelMetric = metrics.find((metric) => metric.label === "Level IKAS")?.value ?? "Input Belum Lengkap";
    const featuredProgressValue = Math.max(0, Math.min(100, Number.parseInt(progressMetric.replace(/[^\d]/g, ""), 10) || 0));

    if (featured) {
        const progressRadius = 64;
        const progressCircumference = 2 * Math.PI * progressRadius;
        const progressOffset = progressCircumference - (featuredProgressValue / 100) * progressCircumference;
        const verificationTextColor = verificationMetric === "Terverifikasi"
            ? "text-emerald-600"
            : verificationMetric === "Menunggu verifikasi"
                ? "text-amber-500"
                : "text-orange-500";

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -6 }}
                className={className}
            >
                <Link
                    to={href}
                    className="group relative block overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 transition-all duration-300 sm:p-8"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.05),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_30%)]" />

                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-stretch">
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-8 text-center">
                            <div className="relative flex h-44 w-44 items-center justify-center">
                                <svg className="h-44 w-44 -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={progressRadius}
                                        stroke="rgb(226 232 240)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={progressRadius}
                                        stroke="rgb(34 197 229)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={progressCircumference}
                                        strokeDashoffset={progressOffset}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-black tracking-tight text-sky-600">{progressMetric}</span>
                                </div>
                            </div>
                            <p className="mt-5 text-center text-sm font-medium text-slate-700">Progress Pengisian</p>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-4">
                                <div className="max-w-xl">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-600">{fullName}</p>
                                    <h4 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{label}</h4>
                                </div>
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-transform duration-300 group-hover:translate-x-1">
                                    <ArrowRight className="h-7 w-7" />
                                </div>
                            </div>

                            <p className="mt-4 max-w-[28rem] text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
                                {description}
                            </p>

                            <div className="mt-7 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Status Verifikasi</p>
                                    <p className={`mt-1 text-sm font-bold ${verificationTextColor}`}>{verificationMetric}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Level IKAS</p>
                                    <p className="mt-1 text-sm font-bold text-orange-500">{levelMetric}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    const hasChecklist = checklistItems.length > 0;
    const hasCta = Boolean(ctaLabel);
    const hasDetailItems = detailItems.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -6 }}
            className={className}
        >
            <Link
                to={href}
                className="group relative block overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 transition-all duration-300"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.05),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_30%)]" />

                <div className="relative z-10 flex min-w-0 flex-col">
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                            <div className="max-w-xl">
                                <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${badgeText}`}>{fullName}</p>
                                <h4 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{label}</h4>
                            </div>
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-transform duration-300 group-hover:translate-x-1">
                                <ArrowRight className="h-6 w-6" />
                            </div>
                        </div>

                        <p className={`mt-4 max-w-[28rem] text-sm font-medium leading-relaxed text-slate-700 sm:text-base`}>{description}</p>

                        {typeof cardProgressValue === "number" && (
                            <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    <span>Progress</span>
                                    <span>{cardProgressValue}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${accentFrom} ${accentTo}`}
                                        style={{ width: `${Math.max(0, Math.min(100, cardProgressValue))}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {statusText && (
                            <div className="mt-6">
                                <p className="text-sm font-medium text-slate-500">Status Utama</p>
                                <p className={`mt-1 text-sm font-bold ${titleColor}`}>{statusText}</p>
                            </div>
                        )}

                        {hasDetailItems && (
                            <div className="mt-6 space-y-3">
                                {detailItems.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-3">
                                        <p className="min-w-0 text-sm font-medium text-slate-600">{item.label}</p>
                                        <p className={`shrink-0 text-sm font-bold ${item.highlight ? "text-emerald-600" : titleColor}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasChecklist && metrics.length > 0 && (
                            <div className="mt-6 space-y-4">
                                {metrics.slice(0, hasDetailItems ? 3 : 2).map((metric) => (
                                    <div key={metric.label}>
                                        <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                                        <p className={`mt-1 text-sm font-bold ${titleColor}`}>{metric.value || "-"}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasChecklist && (
                            <div className="mt-6 space-y-3">
                                {checklistItems.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            {item.complete ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <CircleDashed className="h-4 w-4 text-slate-400" />
                                            )}
                                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${item.complete ? "text-emerald-600" : "text-slate-500"}`}>
                                            {item.complete ? "Lengkap" : "Belum"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between gap-3">
                            {hasCta ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
                                    {ctaLabel}
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            ) : (
                                <span className={`text-sm font-bold ${linkColor}`}>Lihat Detail</span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${badgeText}`}>
                                Buka Menu
                                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </span>
                        </div>
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
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-300 border border-slate-50 group hover:border-slate-100">
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
