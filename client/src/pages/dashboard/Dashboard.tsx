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
    CheckCircle2,
    CircleDashed,
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
        href: "/ikas",
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
        href: "/kse",
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
        href: "/csirt",
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
        href: "/survei-resiko",
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

const LMS_CATEGORY_FALLBACKS = ["Network", "Awareness", "Policy", "Incident", "Cloud", "Defense"];

function inferLmsCategory(title: string, index: number) {
    const lower = title.toLowerCase();
    if (lower.includes("network")) return "Network";
    if (lower.includes("cloud")) return "Cloud";
    if (lower.includes("incident") || lower.includes("csirt")) return "Incident";
    if (lower.includes("policy") || lower.includes("governance")) return "Policy";
    if (lower.includes("phishing") || lower.includes("awareness")) return "Awareness";
    if (lower.includes("defense") || lower.includes("secure")) return "Defense";
    return LMS_CATEGORY_FALLBACKS[index % LMS_CATEGORY_FALLBACKS.length];
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
        { label: "IKAS", value: isIkasFilled ? progressPengisianIkas : "—", sub: statusVerifikasiIkas, textColor: "text-blue-600" },
        { label: "KSE", value: isKseFilled ? String(latestKseScore) : "—", sub: isKseFilled ? kseVerificationStatus : "Belum diisi", textColor: "text-violet-600" },
        { label: "CSIRT", value: `${csirtCompletedCount}/${csirtChecklist.length}`, sub: isCsirtComplete ? "Lengkap" : "Belum lengkap", textColor: "text-teal-600" },
        { label: "Survei", value: isSurveiFilled ? (surveyCompleted ? "✓" : "...") : "—", sub: surveyStatus, textColor: "text-amber-600" },
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

            {/* ── Hero Card — light mode ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[2rem] overflow-hidden bg-white border border-slate-200 shadow-sm"
            >
                {/* Ornament: concentric arcs — top right */}
                <svg
                    className="pointer-events-none absolute -top-6 -right-6 opacity-[0.07] text-slate-900"
                    width="260" height="260" viewBox="0 0 260 260" fill="none"
                    aria-hidden="true"
                >
                    {[20, 44, 68, 92, 116, 140, 164].map((r) => (
                        <circle key={r} cx="260" cy="0" r={r} stroke="currentColor" strokeWidth="1.5" />
                    ))}
                </svg>

                {/* Ornament: hexagonal grid — bottom left */}
                <svg
                    className="pointer-events-none absolute -bottom-8 -left-8 opacity-[0.06] text-slate-900"
                    width="220" height="180" viewBox="0 0 220 180" fill="none"
                    aria-hidden="true"
                >
                    {Array.from({ length: 30 }).map((_, i) => {
                        const col = i % 6;
                        const row = Math.floor(i / 6);
                        const x = col * 36 + (row % 2 === 1 ? 18 : 0);
                        const y = row * 32;
                        const R = 14;
                        const pts = Array.from({ length: 6 }, (__, k) => {
                            const a = (Math.PI / 3) * k - Math.PI / 6;
                            return `${x + R * Math.cos(a)},${y + R * Math.sin(a)}`;
                        }).join(" ");
                        return <polygon key={i} points={pts} stroke="currentColor" strokeWidth="1" fill="none" />;
                    })}
                </svg>

                {/* Ornament: diagonal lines — top left */}
                <svg
                    className="pointer-events-none absolute top-0 left-0 opacity-[0.04] text-slate-900"
                    width="180" height="180" viewBox="0 0 180 180" fill="none"
                    aria-hidden="true"
                >
                    {Array.from({ length: 12 }).map((_, i) => (
                        <line key={i} x1={i * 16} y1="0" x2={i * 16 - 180} y2="180" stroke="currentColor" strokeWidth="1.2" />
                    ))}
                </svg>

                <div className="relative z-10 p-6 md:p-10">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-sky-50 border border-sky-100">
                                <Shield className="h-5 w-5 text-sky-600" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Dashboard Utama · BSSN
                                </p>
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                                    {perusahaan?.nama_perusahaan ?? "Nama Perusahaan"}
                                </h1>
                            </div>
                        </div>

                        <Link
                            to="/dashboard/profil"
                            className="shrink-0 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 hover:bg-slate-100 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 border-white shrink-0">
                                <img src={getMediaUrl(user?.foto_profile)} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm font-black text-slate-900 leading-none">Lihat Profil</p>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 ml-1" />
                        </Link>
                    </div>

                    {/* Stats chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {heroStats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-1.5">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${stat.textColor}`}>{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                                <p className="text-[11px] text-slate-500 font-medium leading-tight">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Progress bars */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {progressBars.map((bar) => (
                            <div key={bar.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{bar.label}</span>
                                    <span className="text-[10px] font-bold text-slate-700">{bar.value}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${bar.color} transition-all duration-1000`} style={{ width: bar.width }} />
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

    const stats = [
        { label: "Tersedia", value: availableCount, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-100/50" },
        { label: "Diikuti", value: followedCount, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100/50" },
        { label: "Lulus", value: passedCount, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100/50" },
        { label: "Materi", value: `${completedMateri}/${totalMateri}`, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100/50" },
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
                className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-md"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-sky-500">
                            Learning Management System
                        </p>
                        <h4 className="text-2xl font-black tracking-tight text-slate-900">LMS / Course</h4>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors duration-300">
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>

                <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">
                    Pantau kelas yang tersedia, progres belajar, dan status kelulusan kuis pembelajaran Anda.
                </p>

                <div className="flex flex-col xl:flex-row gap-8 flex-1">
                    {/* Left side: Circular Progress & Stats */}
                    <div className="flex flex-col sm:flex-row xl:flex-col gap-6 shrink-0 xl:w-48">
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 py-6 px-4">
                            <div className="relative flex h-32 w-32 items-center justify-center">
                                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                                    <circle cx="64" cy="64" r={ringRadius} stroke="currentColor" className="text-slate-200" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="64" cy="64" r={ringRadius}
                                        stroke="currentColor"
                                        className="text-sky-500"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={ringCircumference}
                                        strokeDashoffset={ringOffset}
                                        style={{ transition: "stroke-dashoffset 1s ease-out" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-800">{overallProgress}%</span>
                                </div>
                            </div>
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Overall Progress</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 flex-1">
                            {stats.map((s) => (
                                <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-3 flex flex-col justify-center items-center text-center`}>
                                    <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                                    <p className={`text-[9px] font-bold uppercase tracking-wider ${s.color} opacity-80 mt-0.5`}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Course List */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Daftar Kelas</p>
                            {courses.length > 4 && (
                                <span className="text-[10px] font-bold text-sky-600">Lihat Semua</span>
                            )}
                        </div>

                        {hasData && courses.length > 0 ? (
                            <div className="space-y-3">
                                {courses.slice(0, 4).map((course) => {
                                    const isPassed = course.status === "Sertifikat tersedia" || course.status === "Lulus" || course.progress === 100;
                                    const isOngoing = course.progress > 0 && !isPassed;
                                    
                                    return (
                                        <div key={course.id} className="group/item flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3.5 transition-all hover:border-sky-100 hover:bg-sky-50/50 hover:shadow-sm">
                                            <div className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-xl ${
                                                isPassed ? "bg-emerald-50 text-emerald-500" : isOngoing ? "bg-sky-50 text-sky-500" : "bg-slate-50 text-slate-400"
                                            }`}>
                                                {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate group-hover/item:text-sky-700 transition-colors">
                                                    {course.label}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                                                        isPassed ? "text-emerald-600" : isOngoing ? "text-sky-600" : "text-slate-400"
                                                    }`}>
                                                        {isPassed ? "Lulus" : isOngoing ? "Sedang Belajar" : "Belum Dimulai"}
                                                    </span>
                                                    {isOngoing && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="text-[10px] font-bold text-slate-500">{course.progress}% Selesai</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center justify-center">
                                                {isPassed ? (
                                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <span className="text-xs font-black">✓</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative flex h-8 w-8 items-center justify-center">
                                                        <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                                                            <circle cx="16" cy="16" r="14" stroke="currentColor" className="text-slate-100" strokeWidth="4" fill="none" />
                                                            <circle
                                                                cx="16" cy="16" r="14"
                                                                stroke="currentColor"
                                                                className={isOngoing ? "text-sky-500" : "text-slate-200"}
                                                                strokeWidth="4"
                                                                fill="none"
                                                                strokeLinecap="round"
                                                                strokeDasharray={2 * Math.PI * 14}
                                                                strokeDashoffset={(2 * Math.PI * 14) - ((course.progress / 100) * (2 * Math.PI * 14))}
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                    <BookOpen className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-600">Belum Ada Kelas</p>
                                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Mulai belajar untuk melihat daftar dan progres kelas Anda di sini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                    {followedCount === 0 || !hasData ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-slate-800">
                            Mulai Belajar
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    ) : (
                        <span className="text-[13px] font-bold text-sky-700 group-hover:text-sky-900 transition-colors">Lihat Semua Progres Kelas</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
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
    titleColor: string;
    linkColor: string;
    badgeText: string;
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
    titleColor,
    linkColor,
    badgeText,
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
            ? "text-emerald-600"
            : verificationMetric === "Menunggu verifikasi"
                ? "text-amber-500"
                : "text-orange-500";

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
                    className="group relative block overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-10 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-500 mb-2">{fullName}</p>
                                    <h4 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{label}</h4>
                                </div>
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors duration-300">
                                    <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>

                            <p className="mt-4 max-w-[30rem] text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
                                {description}
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Status Verifikasi</p>
                                    <p className={`mt-1.5 text-sm font-bold ${verificationTextColor}`}>{verificationMetric}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Level IKAS</p>
                                    <p className="mt-1.5 text-sm font-bold text-slate-700">{levelMetric}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center lg:ml-8 shrink-0">
                            <div className="relative flex h-40 w-40 items-center justify-center">
                                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={progressRadius}
                                        stroke="rgb(241 245 249)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={progressRadius}
                                        stroke="rgb(14 165 233)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={progressCircumference}
                                        strokeDashoffset={progressOffset}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black tracking-tight text-slate-800">{progressMetric}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">Progress</p>
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
    const pieSafeValue = hasPieSummary ? Math.max(0, Math.min(pieSummary.total, pieSummary.value)) : 0;
    const piePercent = hasPieSummary && pieSummary.total > 0 ? Math.round((pieSafeValue / pieSummary.total) * 100) : 0;
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
                className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-md"
            >
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${badgeText}`}>{fullName}</p>
                            <h4 className="text-2xl font-black tracking-tight text-slate-900">{label}</h4>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors duration-300">
                            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </div>

                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 line-clamp-2">{description}</p>

                    <div className="mt-8 space-y-6">
                        {typeof cardProgressValue === "number" && (
                            <div>
                                <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <span>Progress</span>
                                    <span className="text-slate-700">{cardProgressValue}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${accentFrom} ${accentTo} transition-all duration-1000`}
                                        style={{ width: `${Math.max(0, Math.min(100, cardProgressValue))}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {statusText && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status Utama</p>
                                <p className={`mt-1 text-sm font-bold ${titleColor}`}>{statusText}</p>
                            </div>
                        )}

                        {hasBadges && (
                            <div>
                                <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Topik Kelas</p>
                                <div className="flex flex-wrap gap-2">
                                    {badges.map((badge) => (
                                        <span
                                            key={badge}
                                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700"
                                        >
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(hasProgressItems || hasPieSummary) && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Learning Focus</p>
                                    <span className="text-[11px] font-bold text-slate-500">Topik aktif</span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-[120px,1fr] md:items-center">
                                    {hasPieSummary && (
                                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-5">
                                            <div className="relative flex h-24 w-24 items-center justify-center">
                                                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r={pieRadius}
                                                        stroke="rgb(226 232 240)"
                                                        strokeWidth="10"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r={pieRadius}
                                                        stroke="rgb(14 165 233)"
                                                        strokeWidth="10"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={pieCircumference}
                                                        strokeDashoffset={pieOffset}
                                                        className="transition-all duration-1000 ease-out"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className={`text-lg font-black ${titleColor}`}>{piePercent}%</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selesai</span>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-center text-xs font-bold text-slate-600">{pieSummary.label}</p>
                                            <p className="mt-1 text-[11px] text-slate-400">{pieSafeValue}/{pieSummary.total}</p>
                                        </div>
                                    )}

                                    {hasProgressItems && (
                                        <div className="space-y-3">
                                            {progressItems.map((item) => {
                                                const safeValue = Math.max(0, Math.min(100, item.value));
                                                return (
                                                    <div key={item.label}>
                                                        <div className="mb-1.5 flex items-center justify-between gap-3">
                                                            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                                                            <span className={`text-sm font-bold ${titleColor}`}>{safeValue}%</span>
                                                        </div>
                                                        <div className="relative h-2.5 overflow-hidden rounded-full bg-white">
                                                            <div
                                                                className={`h-full rounded-full bg-gradient-to-r ${accentFrom} ${accentTo}`}
                                                                style={{ width: `${safeValue}%` }}
                                                            />
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
                                        <p className="min-w-0 text-sm font-medium text-slate-500 truncate">{item.label}</p>
                                        <p className={`shrink-0 text-sm font-bold ${item.highlight ? "text-emerald-600" : "text-slate-700"}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasChecklist && metrics.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {metrics.slice(0, 4).map((metric) => (
                                    <div key={metric.label}>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{metric.label}</p>
                                        <p className={`text-sm font-bold ${titleColor}`}>{metric.value || "-"}</p>
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
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <CircleDashed className="h-4 w-4 text-slate-300" />
                                            )}
                                            <span className={`text-sm font-medium ${item.complete ? "text-slate-700" : "text-slate-500"}`}>{item.label}</span>
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${item.complete ? "text-emerald-600" : "text-slate-400"}`}>
                                            {item.complete ? "Lengkap" : "Belum"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                    {hasCta ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-slate-800">
                            {ctaLabel}
                            <ChevronRight className="h-4 w-4" />
                        </span>
                    ) : (
                        <span className={`text-[13px] font-bold ${linkColor}`}>Lihat Detail</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                        Buka
                        <ArrowUpRight className="w-3 h-3" />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}
