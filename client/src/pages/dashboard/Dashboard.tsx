import { useUser } from "@/hooks/useAuth";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import {
    Shield,
    Monitor,
    Users,
    ClipboardList,
    BookOpen,
    ChevronRight,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    CircleDashed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQueries, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";
import { csirtService } from "@/services/csirt.service";
import { lmsService } from "@/features/lms/services/lms.service";
import { surveyService } from "@/services/survey.service";
import { STATIC_SURVEY_RISKS } from "@/data/survey-static";
import type { IkasData } from "@/types/ikas.types";
import type { SurveyProgress, SurveyRespondent } from "@/types/survey.types";
import { Skeleton } from "@/components/ui/skeleton";

const moduleConfig = {
    IKAS: {
        label: "IKAS",
        fullName: "Indeks Keamanan Siber",
        description: "Ukur dan pantau tingkat keamanan siber organisasi Anda secara komprehensif.",
        href: "/ikas",
        accentColor: "var(--dashboard-selection-text)",
        accentFrom: "from-blue-600",
        accentTo: "to-cyan-400",
    },
    KSE: {
        label: "KSE",
        fullName: "Kategorisasi Sistem Elektronik",
        description: "Kelola data kategorisasi sistem elektronik untuk memetakan tingkat kepentingan dan klasifikasi layanan Anda.",
        href: "/kse",
        accentColor: "var(--dashboard-info-soft-fg)",
        accentFrom: "from-violet-600",
        accentTo: "to-fuchsia-400",
    },
    CSIRT: {
        label: "CSIRT",
        fullName: "Status Tim Respons Insiden",
        description: "Daftarkan dan kelola status tim respons insiden siber organisasi.",
        href: "/csirt",
        accentColor: "var(--dashboard-success-soft-fg)",
        accentFrom: "from-teal-600",
        accentTo: "to-emerald-400",
    },
    SURVEI: {
        label: "Survei Profil Resiko",
        fullName: "Profil Resiko Siber",
        description: "Isi survei profil risiko untuk mendapatkan gambaran kesiapan keamanan siber.",
        href: "/survei-resiko",
        accentColor: "var(--dashboard-warning-soft-fg)",
        accentFrom: "from-amber-500",
        accentTo: "to-orange-400",
    },
    LMS: {
        label: "LMS / Course",
        fullName: "Learning Management System",
        description: "Pantau kelas yang tersedia, progres belajar, dan status kelulusan kuis pembelajaran Anda.",
        href: "/lms",
        accentColor: "var(--dashboard-info-soft-fg)",
        accentFrom: "from-sky-500",
        accentTo: "to-cyan-400",
    },
};

const HERO_STAT_COLORS: Record<string, string> = {
    IKAS: "var(--dashboard-selection-text)",
    KSE: "var(--dashboard-info-soft-fg)",
    CSIRT: "var(--dashboard-success-soft-fg)",
    Survei: "var(--dashboard-warning-soft-fg)",
};

const HERO_PROGRESS_BG: Record<string, string> = {
    IKAS: "linear-gradient(90deg, #3b82f6 0%, #22d3ee 100%)",
    CSIRT: "linear-gradient(90deg, #14b8a6 0%, #34d399 100%)",
    "LMS Kelas": "linear-gradient(90deg, #0ea5e9 0%, #22d3ee 100%)",
    Survei: "linear-gradient(90deg, #f59e0b 0%, #fb923c 100%)",
};

function HeroStatSkeleton({ label }: { label: string }) {
    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-sm"
            style={{ background: "var(--dashboard-card-chip)", border: "1px solid var(--dashboard-border)" }}
        >
            <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: HERO_STAT_COLORS[label] ?? "var(--dashboard-selection-text)" }}
            >
                {label}
            </p>
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-4 w-28 rounded-lg" />
        </div>
    );
}

function HeroProgressSkeleton({ label }: { label: string }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>
                    {label}
                </span>
                <Skeleton className="h-3 w-10 rounded-md" />
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--dashboard-progress-track)" }}>
                <Skeleton className="h-full w-1/3 rounded-full" />
            </div>
        </div>
    );
}

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
    if (typeof raw?.is_validated === "boolean") {
        return raw.is_validated ? "Terverifikasi" : "Menunggu verifikasi";
    }

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

const LMS_CATEGORY_FALLBACK = "Lainnya";
const DASHBOARD_STAGE_STALE_TIME = 1000 * 60 * 5;

function inferLmsCategory(title: string, index: number) {
    const lower = title.toLowerCase();
    void index;

    if (lower.includes("csirt")) return "CSIRT";
    if (lower.includes("network")) return "Networking";
    if (lower.includes("compliance") || lower.includes("policy") || lower.includes("governance") || lower.includes("audit") || lower.includes("regulation")) return "Compliance";
    if (lower.includes("risk")) return "Risk Management";
    if (lower.includes("incident") || lower.includes("response") || lower.includes("forensic") || lower.includes("soc")) return "Incident Response";
    if (lower.includes("cyber") || lower.includes("security") || lower.includes("secure") || lower.includes("awareness") || lower.includes("phishing") || lower.includes("defense") || lower.includes("cloud")) return "Cybersecurity";
    return LMS_CATEGORY_FALLBACK;
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

function countFilledIkasSubdomains(domain: Record<string, any> | null | undefined) {
    if (!domain) return 0;

    return Object.entries(domain).reduce((count, [key, value]) => {
        if (!key.startsWith("nilai_subdomain")) return count;
        return typeof value === "number" && value > 0 ? count + 1 : count;
    }, 0);
}

export default function Dashboard() {
    const { data: user } = useUser();

    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { perusahaan, perusahaanQuery, shouldFetchPerusahaan } = useCompanyProfile(user);

    const myIkasQuery = useQuery({
        queryKey: ["my-ikas", perusahaanId || "unknown"],
        queryFn: () => api.getMyIkas(perusahaanId),
        enabled: !!perusahaanId,
        staleTime: DASHBOARD_STAGE_STALE_TIME,
    });
    const myIkasData = myIkasQuery.data;
    const kseQuery = useQuery({
        queryKey: ["kse"],
        queryFn: api.getKse,
        staleTime: DASHBOARD_STAGE_STALE_TIME,
    });
    const csirtQuery = useQuery({
        queryKey: ["csirt"],
        queryFn: api.getCsirt,
        staleTime: DASHBOARD_STAGE_STALE_TIME,
    });
    const lmsCoursesQuery = useQuery({
        queryKey: ["lms-courses"],
        queryFn: () => lmsService.getCourses(),
        staleTime: DASHBOARD_STAGE_STALE_TIME,
    });
    const surveyRespondentQuery = useQuery({
        queryKey: ["survey-respondent", user?.id || "unknown", "me"],
        queryFn: () => surveyService.getMyRespondentOrNull(),
        enabled: !!user,
        staleTime: DASHBOARD_STAGE_STALE_TIME,
    });
    const surveyRespondent = surveyRespondentQuery.data;

    const isPrimaryStageReady =
        !!user &&
        (!shouldFetchPerusahaan || perusahaanQuery.isFetched) &&
        (!perusahaanId || myIkasQuery.isFetched) &&
        kseQuery.isFetched &&
        csirtQuery.isFetched &&
        lmsCoursesQuery.isFetched &&
        surveyRespondentQuery.isFetched;

    const lmsCertificatesQuery = useQuery({
        queryKey: ["lms-certificates"],
        queryFn: () => lmsService.getMySertifikats(),
        enabled: isPrimaryStageReady,
        staleTime: DASHBOARD_STAGE_STALE_TIME,
    });
    const lmsCertificatesData = lmsCertificatesQuery.data;

    const surveyProgressQuery = useQuery({
        queryKey: ["survey-progress", surveyRespondent?.id || "unknown"],
        queryFn: () => surveyService.getMyProgressOrNull(surveyRespondent?.id),
        enabled: isPrimaryStageReady && !!surveyRespondent?.id,
        staleTime: DASHBOARD_STAGE_STALE_TIME,
    });
    const surveyProgress = surveyProgressQuery.data;

    const isSecondaryStageReady =
        isPrimaryStageReady &&
        lmsCertificatesQuery.isFetched &&
        (!surveyRespondent?.id || surveyProgressQuery.isFetched);
    const isHeroSummaryLoading = !isPrimaryStageReady;

    const ikasList = (myIkasData
        ? (Array.isArray(myIkasData) ? myIkasData : [myIkasData])
        : []) as IkasData[];
    const latestIkas = [...ikasList].sort((a, b) => {
        const dateA = new Date(a.tanggal || a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.tanggal || b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
    })[0];

    const filledIkasSubdomains =
        countFilledIkasSubdomains(latestIkas?.identifikasi as Record<string, any> | undefined) +
        countFilledIkasSubdomains(latestIkas?.proteksi as Record<string, any> | undefined) +
        countFilledIkasSubdomains(latestIkas?.deteksi as Record<string, any> | undefined) +
        countFilledIkasSubdomains((latestIkas?.gulih ?? latestIkas?.tanggulih) as Record<string, any> | undefined);
    const totalIkasSubdomains = 18;
    const progressPengisianIkas = latestIkas
        ? `${Math.round((filledIkasSubdomains / totalIkasSubdomains) * 100)}%`
        : "0%";
    const statusVerifikasiIkas = getVerificationStatus(latestIkas as Record<string, any> | null | undefined);
    const isIkasFilled = filledIkasSubdomains > 0 || ikasList.length > 0;
    const kseList = normalizeList<Record<string, any>>(kseQuery.data);
    const lmsCourses = normalizeList<Record<string, any>>(lmsCoursesQuery.data).filter((course) => course.status !== "draft");
    const lmsCertificates = normalizeList<Record<string, any>>(lmsCertificatesData);
    const latestKse = getLatestRecord(kseList);
    const latestCsirt = getLatestRecord(normalizeList<Record<string, any>>(csirtQuery.data));
    const latestCsirtId = latestCsirt?.id ? String(latestCsirt.id) : null;

    const [sdmCsirtQuery, seCsirtQuery] = useQueries({
        queries: [
            {
                queryKey: ["sdm_csirt", latestCsirtId],
                queryFn: () => csirtService.getSdmByCsirtId(latestCsirtId as string),
                enabled: isPrimaryStageReady && !!latestCsirtId,
                staleTime: DASHBOARD_STAGE_STALE_TIME,
            },
            {
                queryKey: ["se_csirt", latestCsirtId],
                queryFn: () => csirtService.getSeByCsirtId(latestCsirtId as string),
                enabled: isPrimaryStageReady && !!latestCsirtId,
                staleTime: DASHBOARD_STAGE_STALE_TIME,
            },
        ],
    });

    const isLmsDetailStageReady = isSecondaryStageReady && lmsCourses.length > 0;
    const lmsDetailCourseIds = lmsCourses.slice(0, 4).map((course) => String(course.id));
    const lmsCourseDetailsQueries = useQueries({
        queries: lmsDetailCourseIds.map((courseId) => ({
            queryKey: ["lms-course-detail-card", courseId],
            queryFn: () => lmsService.getCourseById(courseId),
            enabled: isLmsDetailStageReady && !!courseId,
            staleTime: DASHBOARD_STAGE_STALE_TIME,
        })),
    });
    const lmsCourseDetailsMap = lmsDetailCourseIds.reduce<Record<string, { materi: Array<Record<string, any>>; completedIds: string[] }>>((acc, courseId, index) => {
        const detail = lmsCourseDetailsQueries[index]?.data;
        if (detail) {
            acc[courseId] = {
                materi: detail.materi ?? [],
                completedIds: detail.completedIds ?? [],
            };
        }
        return acc;
    }, {});

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
    const surveyTotalRisks = STATIC_SURVEY_RISKS.length;
    const lmsProgressByCourse = lmsCourses.map((course, index) => {
        const detail = lmsCourseDetailsMap[String(course.id)];
        const materi = detail?.materi ?? [];
        const completedIds = detail?.completedIds ?? [];
        const hasCertificate = lmsCertificates.some((cert) => String(cert.id_kelas) === String(course.id));
        const progress = hasCertificate ? 100 : computeLearningProgress(materi, completedIds);
        const category = inferLmsCategory(String(course.judul ?? "Kelas"), index);
        return {
            id: String(course.id),
            label: String(course.judul ?? "Kelas"),
            value: hasCertificate ? "LULUS" : `${progress}%`,
            progress,
            category,
            started: hasCertificate || completedIds.length > 0,
            totalMateri: materi.length,
            completedMateri: hasCertificate ? materi.length : completedIds.length,
            status: hasCertificate
                ? "Sertifikat tersedia"
                : completedIds.length > 0
                    ? "Sedang dipelajari"
                    : "Belum dimulai",
        };
    });
    const followedCourses = lmsProgressByCourse.filter((item) => item.started);
    const lmsDetailItems = (followedCourses.length > 0 ? followedCourses : lmsProgressByCourse)
        .slice(0, 4)
        .map((item) => ({
            label: item.label,
            value: item.value === "LULUS"
                ? `${item.value}${item.totalMateri > 0 ? ` | ${item.totalMateri} materi` : ""}`
                : item.totalMateri > 0
                    ? `${item.completedMateri}/${item.totalMateri} materi | ${item.value}`
                    : item.status,
            highlight: item.value === "LULUS",
        }));
    const lmsAvailableCount = lmsCourses.length;
    const lmsFollowedCount = followedCourses.length;
    const lmsPassedQuizCount = lmsCertificates.length;
    const lmsTotalMateriCount = lmsProgressByCourse.reduce((sum, item) => sum + item.totalMateri, 0);
    const lmsCompletedMateriCount = lmsProgressByCourse.reduce((sum, item) => sum + item.completedMateri, 0);
    const lmsOverallProgress = lmsTotalMateriCount > 0 ? Math.round((lmsCompletedMateriCount / lmsTotalMateriCount) * 100) : 0;
    const hasLmsData = lmsAvailableCount > 0;
    const lmsCategoryHighlights = Array.from(new Set(lmsProgressByCourse.map((item) => item.category))).slice(0, 4);
    const lmsLearningFocus = Array.from(
        lmsProgressByCourse.reduce((map, item) => {
            const current = map.get(item.category) ?? { label: item.category, total: 0, count: 0 };
            current.total += item.progress;
            current.count += 1;
            map.set(item.category, current);
            return map;
        }, new Map<string, { label: string; total: number; count: number }>())
            .values()
    )
        .map((item) => ({
            label: item.label,
            value: Math.round(item.total / item.count),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

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
        { label: "Materi Selesai", value: `${lmsCompletedMateriCount}/${lmsTotalMateriCount}` },
    ];
    const lmsStatusText = !hasLmsData
        ? "Belum ada kelas tersedia"
        : lmsFollowedCount > 0
            ? `${lmsFollowedCount} kelas sedang atau sudah diselesaikan`
            : "Belum ada kelas yang dimulai";

    // Hero stats chips
    const heroStats = [
        { label: "IKAS", value: isIkasFilled ? progressPengisianIkas : "—", sub: statusVerifikasiIkas, textColor: "var(--dashboard-selection-text)" },
        { label: "KSE", value: isKseFilled ? String(latestKseScore) : "—", sub: isKseFilled ? kseVerificationStatus : "Belum diisi", textColor: "var(--dashboard-info-soft-fg)" },
        { label: "CSIRT", value: `${csirtCompletedCount}/${csirtChecklist.length}`, sub: isCsirtComplete ? "Lengkap" : "Belum lengkap", textColor: "var(--dashboard-success-soft-fg)" },
        { label: "Survei", value: isSurveiFilled ? (surveyCompleted ? "✓" : "...") : "—", sub: surveyStatus, textColor: "var(--dashboard-warning-soft-fg)" },
    ];

    // Progress bars
    const progressBars = [
        { label: "IKAS", value: progressPengisianIkas, width: progressPengisianIkas, color: "from-blue-500 to-cyan-400" },
        { label: "CSIRT", value: `${csirtProgressValue}%`, width: `${csirtProgressValue}%`, color: "from-teal-500 to-emerald-400" },
        {
            label: "LMS Kelas",
            value: lmsAvailableCount > 0 ? `${lmsFollowedCount}/${lmsAvailableCount}` : "—",
            width: lmsAvailableCount > 0 ? `${Math.round((lmsFollowedCount / lmsAvailableCount) * 100)}%` : "0%",
            color: "from-sky-500 to-cyan-400",
        },
        {
            label: "Survei",
            value: surveyCompleted ? "Selesai" : isSurveiFilled ? "Dalam proses" : "Belum",
            width: surveyCompleted ? "100%"
                : isSurveiFilled && surveyCurrentRisk && surveyTotalRisks
                    ? `${Math.round((surveyCurrentRisk / surveyTotalRisks) * 100)}%`
                    : isSurveiFilled ? "10%" : "0%",
            color: "from-amber-500 to-orange-400",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">

            {/* ── Hero Card — dark gradient ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-900/20"
                style={{ background: "var(--dashboard-hero-bg)" }}
            >
                {/* Glowing orbs */}
                <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--dashboard-bg-layer-a) 0%, transparent 70%)" }} />
                <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-15" style={{ background: "radial-gradient(circle, var(--dashboard-bg-layer-b) 0%, transparent 70%)" }} />
                {/* Dot grid */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, var(--dashboard-grid-dot) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                {/* Concentric arcs ornament */}
                <svg className="pointer-events-none absolute -top-8 -right-8 opacity-[0.08]" width="280" height="280" viewBox="0 0 280 280" fill="none" aria-hidden="true" style={{ color: "var(--dashboard-text)" }}>
                    {[24, 52, 80, 108, 136, 164, 192].map((r) => (
                        <circle key={r} cx="280" cy="0" r={r} stroke="currentColor" strokeWidth="1.5" />
                    ))}
                </svg>

                <div className="relative z-10 p-6 md:p-10">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--dashboard-text-muted)" }}>
                                    Selamat Datang di Dashboard
                                </p>
                                <h1 className="mt-0.5 text-xl font-black leading-tight tracking-tight md:text-2xl" style={{ color: "var(--dashboard-text)" }}>
                                    {perusahaan?.nama_perusahaan ?? "Nama Perusahaan"}
                                </h1>
                            </div>
                        </div>

                        <Link
                            to="/dashboard/profil"
                            className="shrink-0 flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-colors backdrop-blur-sm"
                            style={{ background: "var(--dashboard-surface-strong)", border: "1px solid var(--dashboard-border)" }}
                        >
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border-2" style={{ background: "var(--dashboard-section-emphasis)", borderColor: "var(--dashboard-border-strong)" }}>
                                <img src={getMediaUrl(user?.foto_profile)} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm font-bold leading-none" style={{ color: "var(--dashboard-text)" }}>Lihat Profil</p>
                            <ArrowRight className="ml-1 h-3.5 w-3.5" style={{ color: "var(--dashboard-text-muted)" }} />
                        </Link>
                    </div>

                    {/* Stats chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {isHeroSummaryLoading
                            ? heroStats.map((stat) => <HeroStatSkeleton key={stat.label} label={stat.label} />)
                            : heroStats.map((stat) => (
                                <div key={stat.label}
                                    className="rounded-2xl p-4 flex flex-col gap-1.5 backdrop-blur-sm"
                                    style={{ background: "var(--dashboard-card-chip)", border: "1px solid var(--dashboard-border)" }}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: HERO_STAT_COLORS[stat.label] ?? "var(--dashboard-selection-text)" }}>{stat.label}</p>
                                    <p className="text-2xl font-black leading-none" style={{ color: "var(--dashboard-text)" }}>{stat.value}</p>
                                    <p className="text-[11px] font-medium leading-tight" style={{ color: "var(--dashboard-text-muted)" }}>{stat.sub}</p>
                                </div>
                            ))}
                    </div>

                    {/* Progress bars */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {isHeroSummaryLoading
                            ? progressBars.map((bar) => <HeroProgressSkeleton key={bar.label} label={bar.label} />)
                            : progressBars.map((bar) => (
                                <div key={bar.label}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>{bar.label}</span>
                                        <span className="text-[10px] font-bold" style={{ color: "var(--dashboard-text-soft)" }}>{bar.value}</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden dashboard-progress-track">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: bar.width, background: HERO_PROGRESS_BG[bar.label] ?? HERO_PROGRESS_BG.IKAS }} />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Module Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <SocietyCard
                    {...moduleConfig.IKAS}
                    className="sm:col-span-2 xl:col-span-3"
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
                <LmsCard
                    className="sm:col-span-2 xl:col-span-3"
                    href={moduleConfig.LMS.href}
                    availableCount={lmsAvailableCount}
                    followedCount={lmsFollowedCount}
                    passedCount={lmsPassedQuizCount}
                    completedMateri={lmsCompletedMateriCount}
                    totalMateri={lmsTotalMateriCount}
                    overallProgress={lmsOverallProgress}
                    courses={lmsProgressByCourse}
                    hasData={hasLmsData}
                />
            </div>
        </div>
    );
}

// ── LMS Card ──────────────────────────────────────────────────────────────────

type LmsCourse = {
    id: string;
    label: string;
    progress: number;
    status: string;
    totalMateri: number;
    completedMateri: number;
    started: boolean;
};

type LmsCardProps = {
    className?: string;
    href: string;
    availableCount: number;
    followedCount: number;
    passedCount: number;
    completedMateri: number;
    totalMateri: number;
    overallProgress: number;
    courses: LmsCourse[];
    hasData: boolean;
};

function LmsCard({
    className = "",
    href,
    availableCount,
    followedCount,
    passedCount,
    completedMateri,
    totalMateri,
    overallProgress,
    courses,
    hasData,
}: LmsCardProps) {
    const ringRadius = 52;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference - (overallProgress / 100) * ringCircumference;

    type StatItem = { label: string; value: number | string; color: string; chipBg: string; chipBorder: string; };
    const stats: StatItem[] = [
        { label: "Tersedia", value: availableCount, color: "var(--dashboard-info-soft-fg)", chipBg: "var(--dashboard-info-soft-bg)", chipBorder: "var(--dashboard-info-soft-border)" },
        { label: "Diikuti", value: followedCount, color: "var(--dashboard-selection-text)", chipBg: "var(--dashboard-selection-bg)", chipBorder: "var(--dashboard-selection-border)" },
        { label: "Lulus", value: passedCount, color: "var(--dashboard-success-soft-fg)", chipBg: "var(--dashboard-success-soft-bg)", chipBorder: "var(--dashboard-success-soft-border)" },
        { label: "Materi", value: `${completedMateri}/${totalMateri}`, color: "var(--dashboard-warning-soft-fg)", chipBg: "var(--dashboard-warning-soft-bg)", chipBorder: "var(--dashboard-warning-soft-border)" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
            className={className}
        >
            <Link
                to={href}
                className="dashboard-card group relative flex flex-col h-full overflow-hidden rounded-[2rem] p-6 sm:p-8 transition-all duration-300 border"
            >
                {/* Sky top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-t-[2rem]" />
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]" style={{ background: "radial-gradient(ellipse at top right, rgba(14,165,233,0.05) 0%, transparent 60%)" }} />
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--dashboard-info-soft-fg)" }}>Learning Management System</p>
                        <h4 className="text-2xl font-black tracking-tight" style={{ color: "var(--dashboard-card-title)" }}>LMS / Course</h4>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300" style={{ background: "var(--dashboard-card-chip)", color: "var(--dashboard-card-muted)" }}>
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>

                <p className="mb-8 text-sm font-medium leading-relaxed" style={{ color: "var(--dashboard-card-description)" }}>
                    Pantau kelas yang tersedia, progres belajar, dan status kelulusan kuis pembelajaran Anda.
                </p>

                <div className="flex flex-col xl:flex-row gap-8 flex-1">
                    {/* Left side: Circular Progress & Stats */}
                    <div className="flex flex-col sm:flex-row xl:flex-col gap-6 shrink-0 xl:w-48">
                        <div className="flex flex-col items-center justify-center rounded-2xl border py-6 px-4" style={{ background: "var(--dashboard-card-chip)", borderColor: "var(--dashboard-border)" }}>
                            <div className="relative flex h-32 w-32 items-center justify-center">
                                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                                    <circle cx="64" cy="64" r={ringRadius} stroke="var(--dashboard-progress-track)" strokeWidth="8" fill="none" />
                                    <circle cx="64" cy="64" r={ringRadius} stroke="currentColor" className="text-sky-500" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black" style={{ color: "var(--dashboard-card-title)" }}>{overallProgress}%</span>
                                </div>
                            </div>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--dashboard-card-muted)" }}>Overall Progress</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 flex-1">
                            {stats.map((s) => (
                                <div key={s.label} className="rounded-xl border p-3 flex flex-col justify-center items-center text-center" style={{ background: s.chipBg, borderColor: s.chipBorder }}>
                                    <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider opacity-70" style={{ color: s.color }}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Course List */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Daftar Kelas</p>
                            {courses.length > 4 && (
                                <span className="text-[10px] font-bold" style={{ color: "var(--dashboard-info-soft-fg)" }}>Lihat Semua</span>
                            )}
                        </div>

                        {hasData && courses.length > 0 ? (
                            <div className="space-y-3">
                                {courses.slice(0, 4).map((course) => {
                                    const isPassed = course.status === "Sertifikat tersedia" || course.status === "Lulus" || course.progress === 100;
                                    const isOngoing = course.progress > 0 && !isPassed;
                                    
                                    return (
                                        <div key={course.id} className="group/item flex items-center gap-4 rounded-2xl border p-3.5 transition-all hover:border-sky-500/20 hover:bg-sky-500/5" style={{ background: "var(--dashboard-card-chip)", borderColor: "var(--dashboard-border)" }}>
                                            <div
                                                className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                                                style={
                                                    isPassed
                                                        ? { background: "var(--dashboard-success-soft-bg)", color: "var(--dashboard-success-soft-fg)" }
                                                        : isOngoing
                                                            ? { background: "var(--dashboard-info-soft-bg)", color: "var(--dashboard-info-soft-fg)" }
                                                            : { background: "var(--dashboard-surface-muted)", color: "var(--dashboard-text-muted)" }
                                                }
                                            >
                                                {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate" style={{ color: "var(--dashboard-text-soft)" }}>
                                                    {course.label}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className="text-[10px] font-black uppercase tracking-wider"
                                                        style={
                                                            isPassed
                                                                ? { color: "var(--dashboard-success-soft-fg)" }
                                                                : isOngoing
                                                                    ? { color: "var(--dashboard-info-soft-fg)" }
                                                                    : { color: "var(--dashboard-text-muted)" }
                                                        }
                                                    >
                                                        {isPassed ? "Lulus" : isOngoing ? "Sedang Belajar" : "Belum Dimulai"}
                                                    </span>
                                                    {isOngoing && (
                                                        <>
                                                            <span style={{ color: "var(--dashboard-text-muted)" }}>•</span>
                                                            <span className="text-[10px] font-bold" style={{ color: "var(--dashboard-text-muted)" }}>{course.progress}% Selesai</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center justify-center">
                                                {isPassed ? (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                                                        <span className="text-xs font-black">✓</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative flex h-8 w-8 items-center justify-center">
                                                        <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                                                            <circle cx="16" cy="16" r="14" stroke="var(--dashboard-progress-track)" strokeWidth="4" fill="none" />
                                                            <circle cx="16" cy="16" r="14" stroke="currentColor" className={isOngoing ? "text-sky-500" : ""} style={isOngoing ? undefined : { color: "var(--dashboard-border)" }} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={(2 * Math.PI * 14) - ((course.progress / 100) * (2 * Math.PI * 14))} />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 rounded-2xl border border-dashed flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--dashboard-card-chip)", borderColor: "var(--dashboard-border)" }}>
                                <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--dashboard-surface-muted)" }}>
                                    <BookOpen className="h-6 w-6" style={{ color: "var(--dashboard-text-muted)" }} />
                                </div>
                                <p className="text-sm font-bold" style={{ color: "var(--dashboard-text-soft)" }}>Belum Ada Kelas</p>
                                <p className="text-xs mt-1 max-w-[200px]" style={{ color: "var(--dashboard-text-muted)" }}>Mulai belajar untuk melihat daftar dan progres kelas Anda di sini.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t flex items-center justify-between gap-3 mt-auto" style={{ borderColor: "var(--dashboard-border)" }}>
                    {followedCount === 0 || !hasData ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold shadow-sm hover:shadow-md transition-shadow" style={{ background: "var(--dashboard-surface-muted)", color: "var(--dashboard-text)" }}>
                            Mulai Belajar
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    ) : (
                        <span className="text-[13px] font-bold" style={{ color: "var(--dashboard-info-soft-fg)" }}>Lihat Semua Progres Kelas</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: "var(--dashboard-text-muted)" }}>
                        Buka LMS
                        <ArrowUpRight className="w-3 h-3" />
                    </span>
                </div>
            </Link>
        </motion.div>
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

type ProgressInsightItem = {
    label: string;
    value: number;
};

type PieSummary = {
    value: number;
    total: number;
    label: string;
};

type SocietyCardProps = {
    label: string;
    fullName: string;
    description: string;
    href: string;
    accentColor: string;
    accentFrom: string;
    accentTo: string;
    metrics?: SocietyMetric[];
    statusText?: string;
    checklistItems?: ChecklistItem[];
    detailItems?: DetailItem[];
    badges?: string[];
    progressItems?: ProgressInsightItem[];
    pieSummary?: PieSummary;
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
    accentColor,
    accentFrom,
    accentTo,
    metrics = [],
    statusText,
    checklistItems = [],
    detailItems = [],
    badges = [],
    progressItems = [],
    pieSummary,
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
            ? "var(--dashboard-success-soft-fg)"
            : "var(--dashboard-warning-soft-fg)";

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -4 }}
                className={className}
            >
                <Link
                    to={href}
                    className="dashboard-card group relative block overflow-hidden rounded-[2rem] p-6 sm:p-10 transition-all duration-300 border"
                >
                    {/* Colored top accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentFrom} ${accentTo} rounded-t-[2rem]`} />
                    {/* Subtle hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]" style={{ background: "radial-gradient(ellipse at top right, rgba(99,102,241,0.06) 0%, transparent 60%)" }} />
                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>{fullName}</p>
                                    <h4 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "var(--dashboard-card-title)" }}>{label}</h4>
                                </div>
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300" style={{ background: "var(--dashboard-card-chip)", color: "var(--dashboard-card-muted)" }}>
                                    <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>

                            <p className="mt-4 max-w-[30rem] text-sm font-medium leading-relaxed sm:text-base" style={{ color: "var(--dashboard-card-description)" }}>
                                {description}
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Status Verifikasi</p>
                                    <p className="mt-1.5 text-sm font-bold" style={{ color: verificationTextColor }}>{verificationMetric}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Level IKAS</p>
                                    <p className="mt-1.5 text-sm font-bold" style={{ color: "var(--dashboard-text-soft)" }}>{levelMetric}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center lg:ml-8 shrink-0">
                            <div className="relative flex h-40 w-40 items-center justify-center">
                                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                                    <circle cx="80" cy="80" r={progressRadius} stroke="var(--dashboard-progress-track)" strokeWidth="12" fill="none" strokeLinecap="round" />
                                    <circle cx="80" cy="80" r={progressRadius} stroke="rgb(14 165 233)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={progressCircumference} strokeDashoffset={progressOffset} className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black tracking-tight" style={{ color: "var(--dashboard-card-title)" }}>{progressMetric}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-center text-xs font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Progress</p>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    const hasChecklist = checklistItems.length > 0;
    const hasCta = Boolean(ctaLabel);
    const hasDetailItems = detailItems.length > 0;
    const hasBadges = badges.length > 0;
    const hasProgressItems = progressItems.length > 0;
    const hasPieSummary = Boolean(pieSummary);
    const pieSummaryData = hasPieSummary ? pieSummary : null;
    const pieSafeValue = pieSummaryData ? Math.max(0, Math.min(pieSummaryData.total, pieSummaryData.value)) : 0;
    const piePercent = pieSummaryData && pieSummaryData.total > 0 ? Math.round((pieSafeValue / pieSummaryData.total) * 100) : 0;
    const pieRadius = 34;
    const pieCircumference = 2 * Math.PI * pieRadius;
    const pieOffset = pieCircumference - (piePercent / 100) * pieCircumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
            className={className}
        >
            <Link
                to={href}
                className="dashboard-card group relative flex flex-col h-full overflow-hidden rounded-[2rem] p-6 sm:p-8 transition-all duration-300 border"
            >
                {/* Colored top accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentFrom} ${accentTo} rounded-t-[2rem]`} />
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]" style={{ background: "radial-gradient(ellipse at top right, rgba(99,102,241,0.05) 0%, transparent 60%)" }} />
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>{fullName}</p>
                        <h4 className="text-2xl font-black tracking-tight" style={{ color: "var(--dashboard-card-title)" }}>{label}</h4>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300" style={{ background: "var(--dashboard-card-chip)", color: "var(--dashboard-card-muted)" }}>
                            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </div>

                    <p className="mt-3 text-sm font-medium leading-relaxed line-clamp-2" style={{ color: "var(--dashboard-card-description)" }}>{description}</p>

                    <div className="mt-8 space-y-6">
                        {typeof cardProgressValue === "number" && (
                            <div>
                                <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>
                                    <span>Progress</span>
                                    <span style={{ color: "var(--dashboard-text-soft)" }}>{cardProgressValue}%</span>
                                </div>
                                <div className="dashboard-progress-track h-2 overflow-hidden rounded-full">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${accentFrom} ${accentTo} transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(100, cardProgressValue))}%` }} />
                                </div>
                            </div>
                        )}

                        {statusText && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Status Utama</p>
                                <p className="mt-1 text-sm font-bold" style={{ color: accentColor }}>{statusText}</p>
                            </div>
                        )}

                        {hasBadges && (
                            <div>
                                <p className="mb-3 text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Topik Kelas</p>
                                <div className="flex flex-wrap gap-2">
                                    {badges.map((badge) => (
                                        <span key={badge} className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold" style={{ borderColor: "var(--dashboard-border)", background: "var(--dashboard-card-chip)", color: "var(--dashboard-text-soft)" }}>
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(hasProgressItems || hasPieSummary) && (
                            <div className="rounded-2xl border p-4" style={{ background: "var(--dashboard-card-chip)", borderColor: "var(--dashboard-border)" }}>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Learning Focus</p>
                                    <span className="text-[11px] font-bold" style={{ color: "var(--dashboard-text-muted)" }}>Topik aktif</span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-[120px,1fr] md:items-center">
                                        <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-5" style={{ background: "var(--dashboard-surface-muted)" }}>
                                            <div className="relative flex h-24 w-24 items-center justify-center">
                                                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                                                    <circle cx="48" cy="48" r={pieRadius} stroke="var(--dashboard-progress-track)" strokeWidth="10" fill="none" />
                                                    <circle cx="48" cy="48" r={pieRadius} stroke="rgb(14 165 233)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={pieCircumference} strokeDashoffset={pieOffset} className="transition-all duration-1000 ease-out" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-lg font-black" style={{ color: accentColor }}>{piePercent}%</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-card-muted)" }}>Selesai</span>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-center text-xs font-bold" style={{ color: "var(--dashboard-text-soft)" }}>{pieSummaryData?.label}</p>
                                            <p className="mt-1 text-[11px]" style={{ color: "var(--dashboard-text-muted)" }}>{pieSafeValue}/{pieSummaryData?.total}</p>
                                        </div>

                                    {hasProgressItems && (
                                        <div className="space-y-3">
                                            {progressItems.map((item) => {
                                                const safeValue = Math.max(0, Math.min(100, item.value));
                                                return (
                                                    <div key={item.label}>
                                                        <div className="mb-1.5 flex items-center justify-between gap-3">
                                                <span className="text-sm font-semibold" style={{ color: "var(--dashboard-text-soft)" }}>{item.label}</span>
                                                <span className="text-sm font-bold" style={{ color: accentColor }}>{safeValue}%</span>
                                            </div>
                                            <div className="dashboard-progress-track relative h-2.5 overflow-hidden rounded-full">
                                                <div className={`h-full rounded-full bg-gradient-to-r ${accentFrom} ${accentTo}`} style={{ width: `${safeValue}%` }} />
                                                            <div
                                                                className="absolute inset-y-0 right-0 opacity-20"
                                                                style={{
                                                                    width: `${100 - safeValue}%`,
                                                                    background: "repeating-linear-gradient(-45deg, #0f172a 0px, #0f172a 2px, transparent 2px, transparent 7px)",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {hasDetailItems && (
                            <div className="space-y-3">
                                {detailItems.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-3">
                                        <p className="min-w-0 text-sm font-medium truncate" style={{ color: "var(--dashboard-card-description)" }}>{item.label}</p>
                                        <p className={`shrink-0 text-sm font-bold ${item.highlight ? "text-emerald-600" : ""}`} style={item.highlight ? undefined : { color: "var(--dashboard-text-soft)" }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasChecklist && metrics.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {metrics.slice(0, 4).map((metric) => (
                                    <div key={metric.label}>
                                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--dashboard-card-muted)" }}>{metric.label}</p>
                                <p className="text-sm font-bold" style={{ color: accentColor }}>{metric.value || "-"}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasChecklist && (
                            <div className="space-y-3">
                                {checklistItems.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {item.complete ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <CircleDashed className="h-4 w-4" style={{ color: "var(--dashboard-card-muted)" }} />
                                        )}
                                        <span className="text-sm font-medium" style={{ color: item.complete ? "var(--dashboard-text-soft)" : "var(--dashboard-text-muted)" }}>{item.label}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${item.complete ? "text-emerald-600" : ""}`} style={item.complete ? undefined : { color: "var(--dashboard-text-muted)" }}>
                                        {item.complete ? "Lengkap" : "Belum"}
                                    </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t flex items-center justify-between gap-3 mt-auto" style={{ borderColor: "var(--dashboard-border)" }}>
                    {hasCta ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold shadow-sm hover:shadow-md transition-shadow" style={{ background: "var(--dashboard-surface-muted)", color: "var(--dashboard-text)" }}>
                            {ctaLabel}
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    ) : (
                        <span className="text-[13px] font-bold" style={{ color: accentColor }}>Lihat Detail</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: "var(--dashboard-text-muted)" }}>
                        Buka
                        <ArrowUpRight className="w-3 h-3" />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}
