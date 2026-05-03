import type { Kelas, MateriItem, SertifikatItem } from "@/features/lms/types/lms.types";

const CATEGORY_FALLBACKS = ["Jaringan", "Kesadaran", "Kebijakan", "Insiden", "Cloud", "Pertahanan"];

export function inferLmsCategory(title: string, index: number): string {
    const lower = title.toLowerCase();
    if (lower.includes("network")) return "Jaringan";
    if (lower.includes("cloud")) return "Cloud";
    if (lower.includes("incident") || lower.includes("csirt")) return "Insiden";
    if (lower.includes("policy") || lower.includes("governance")) return "Kebijakan";
    if (lower.includes("phishing") || lower.includes("awareness")) return "Kesadaran";
    if (lower.includes("defense") || lower.includes("secure")) return "Pertahanan";
    return CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length];
}

export function formatMinutes(totalSeconds: number): string {
    const minutes = Math.max(1, Math.ceil(totalSeconds / 60));
    return `${minutes} menit`;
}

export function sortMateri(materi: MateriItem[]): MateriItem[] {
    return [...materi].sort((a, b) => a.urutan - b.urutan);
}

export function isPublishedCourse(course: Kelas): boolean {
    return course.status !== "draft";
}

export interface LmsCourseInsight {
    id: string;
    title: string;
    description: string;
    category: string;
    totalMateri: number;
    completedMateri: number;
    progress: number;
    totalDurationSeconds: number;
    totalDurationLabel: string;
    started: boolean;
    passed: boolean;
    statusLabel: string;
    lastItemLabel: string;
}

export function buildLmsCourseInsight(params: {
    course: Kelas;
    materi?: MateriItem[];
    completedIds?: string[];
    hasCertificate: boolean;
    index: number;
}): LmsCourseInsight {
    const { course, materi = [], completedIds = [], hasCertificate, index } = params;
    const sorted = sortMateri(materi);
    const totalMateri = sorted.length;
    const totalDurationSeconds = sorted.reduce((sum, item) => sum + (item.durasi_detik ?? 0), 0);
    const completedMateri = hasCertificate ? totalMateri : completedIds.length;
    const progress = totalMateri > 0 ? Math.round((completedMateri / totalMateri) * 100) : 0;
    const started = hasCertificate || completedIds.length > 0;
    const nextMateri = sorted.find((item) => !completedIds.includes(item.id));
    const latestMateri = sorted[sorted.length - 1];

    let statusLabel = "Belum dimulai";
    if (hasCertificate) statusLabel = "Lulus";
    else if (started) statusLabel = "Sedang dipelajari";

    let lastItemLabel = "Belum ada materi";
    if (hasCertificate && latestMateri) lastItemLabel = `Selesai di ${latestMateri.judul}`;
    else if (nextMateri) lastItemLabel = `Lanjut ke ${nextMateri.judul}`;
    else if (latestMateri) lastItemLabel = `Materi terakhir ${latestMateri.judul}`;

    return {
        id: course.id,
        title: course.judul,
        description: course.deskripsi || "Pelajari materi keamanan siber yang tersedia secara bertahap sesuai kurikulum.",
        category: inferLmsCategory(course.judul, index),
        totalMateri,
        completedMateri,
        progress,
        totalDurationSeconds,
        totalDurationLabel: formatMinutes(totalDurationSeconds),
        started,
        passed: hasCertificate,
        statusLabel,
        lastItemLabel,
    };
}

export function getCertificateCourseIds(certificates: SertifikatItem[]): Set<string> {
    return new Set(certificates.map((item) => String(item.id_kelas)));
}
