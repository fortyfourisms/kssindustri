import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, BookOpen, CheckCircle2, Clock3, GraduationCap, TrendingUp } from "lucide-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCourseRoute } from "@/features/lms/lib/lms-routes";
import {
    buildLmsCourseInsight,
    getCertificateCourseIds,
    isPublishedCourse,
} from "@/features/lms/lib/lms-dashboard";
import { lmsService } from "@/features/lms/services/lms.service";
import { useLmsStore } from "@/features/lms/stores/lms.store";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ── Stat Card — same style as dashboard's white cards ───────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    iconClass,
    delay = 0,
}: {
    icon: typeof TrendingUp;
    label: string;
    value: string;
    iconClass: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
            <div className={cn("mb-3 flex h-11 w-11 items-center justify-center rounded-2xl", iconClass)}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{value}</p>
        </motion.div>
    );
}

// ── Progress Bar — same style as dashboard's "Proses Belajar" ───────────────
function ProgressBar({ value }: { value: number }) {
    return (
        <div className="relative h-5 w-full overflow-hidden rounded-sm bg-slate-100">
            <div
                className="absolute inset-y-0 left-0 rounded-sm bg-[#4f46e5] transition-all duration-700"
                style={{ width: `${value}%` }}
            />
            <div
                className="absolute inset-y-0 right-0"
                style={{
                    width: `${100 - value}%`,
                    background:
                        "repeating-linear-gradient(-45deg, #1e1b4b 0px, #1e1b4b 2px, transparent 2px, transparent 7px)",
                    opacity: 0.18,
                }}
            />
        </div>
    );
}

// ── Status Label — same pill style as dashboard category tags ────────────────
function StatusPill({ passed, started }: { passed: boolean; started: boolean }) {
    if (passed)
        return (
            <span className="rounded-full bg-[#4f46e5] px-2.5 py-1 text-[11px] font-bold text-white">
                Lulus
            </span>
        );
    if (started)
        return (
            <span className="rounded-full bg-[#b7f0ff] px-2.5 py-1 text-[11px] font-bold text-slate-900">
                Aktif
            </span>
        );
    return (
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
            Belum mulai
        </span>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function LMSProgress() {
    const navigate = useNavigate();
    const { courses, isLoadingCourses, coursesError, fetchCourses } = useLmsStore();

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const publishedCourses = useMemo(
        () => courses.filter(isPublishedCourse),
        [courses]
    );

    const { data: userCertificates = [] } = useQuery({
        queryKey: ["lms-progress-certificates"],
        queryFn: () => lmsService.getMySertifikats(),
    });

    const certificateCourseIds = useMemo(
        () => getCertificateCourseIds(userCertificates),
        [userCertificates]
    );

    const detailCourseIds = useMemo(() => {
        const ids = new Set<string>();
        publishedCourses.slice(0, 8).forEach((course) => ids.add(course.id));
        userCertificates.forEach((certificate) => ids.add(String(certificate.id_kelas)));
        return Array.from(ids);
    }, [publishedCourses, userCertificates]);

    const courseDetailQueries = useQueries({
        queries: detailCourseIds.map((courseId) => ({
            queryKey: ["lms-progress-course-detail", courseId],
            queryFn: () => lmsService.getCourseById(courseId),
            enabled: !!courseId,
            staleTime: 1000 * 60 * 5,
        })),
    });

    const detailedCourseMap = useMemo(
        () =>
            detailCourseIds.reduce<Record<string, { materi: any[]; completedIds: string[] }>>(
                (acc, courseId, index) => {
                    const detail = courseDetailQueries[index]?.data;
                    if (detail) {
                        acc[courseId] = {
                            materi: detail.materi ?? [],
                            completedIds: detail.completedIds ?? [],
                        };
                    }
                    return acc;
                },
                {}
            ),
        [detailCourseIds, courseDetailQueries]
    );

    const courseInsights = useMemo(
        () =>
            publishedCourses.map((course, index) => {
                const detail = detailedCourseMap[course.id];
                return buildLmsCourseInsight({
                    course,
                    materi: detail?.materi ?? [],
                    completedIds: detail?.completedIds ?? [],
                    hasCertificate: certificateCourseIds.has(String(course.id)),
                    index,
                });
            }),
        [publishedCourses, detailedCourseMap, certificateCourseIds]
    );

    const totalCourses = courseInsights.length;
    const startedCourses = courseInsights.filter((c) => c.started).length;
    const passedCourses = courseInsights.filter((c) => c.passed).length;
    const totalMateri = courseInsights.reduce((s, c) => s + c.totalMateri, 0);
    const completedMateri = courseInsights.reduce((s, c) => s + c.completedMateri, 0);
    const overallProgress = totalMateri > 0 ? Math.round((completedMateri / totalMateri) * 100) : 0;

    const sortedCourses = useMemo(
        () => [...courseInsights].sort((a, b) => b.progress - a.progress || a.title.localeCompare(b.title)),
        [courseInsights]
    );

    const activeCourses = sortedCourses.filter((c) => !c.passed && c.started).slice(0, 3);

    return (
        <div className="h-full overflow-y-auto bg-[#f8fafc]">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

                {/* ── Page Header — mirrors dashboard welcome card ── */}
                <div className="mb-6 rounded-3xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-200 sm:px-6">

                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        Pantau Perjalanan Belajarmu
                    </h1>
                </div>

                {/* ── Stat Cards — mirrors dashboard card style ── */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <StatCard
                        icon={GraduationCap}
                        label="Kelas Tersedia"
                        value={String(totalCourses)}
                        iconClass="bg-sky-50 text-sky-600"
                        delay={0.04}
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Kelas Dimulai"
                        value={String(startedCourses)}
                        iconClass="bg-indigo-50 text-indigo-600"
                        delay={0.08}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Materi Selesai"
                        value={`${completedMateri}/${totalMateri}`}
                        iconClass="bg-emerald-50 text-emerald-600"
                        delay={0.12}
                    />
                    <StatCard
                        icon={Award}
                        label="Sertifikat"
                        value={String(userCertificates.length)}
                        iconClass="bg-amber-50 text-amber-500"
                        delay={0.16}
                    />
                </div>

                {coursesError && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {coursesError}
                    </div>
                )}

                {/* ── Main Grid — same flex pattern as dashboard ── */}
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 xl:gap-10">

                    {/* ── Left: Course Progress List ── */}
                    <div className="min-w-0 flex-1">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight text-slate-950">Progress per Kelas</h2>
                            <span className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm">
                                {overallProgress}% total
                            </span>
                        </div>

                        {/* Skeleton */}
                        {isLoadingCourses && (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <Skeleton className="h-4 w-1/3 rounded-full" />
                                        <Skeleton className="mt-4 h-5 w-full rounded-sm" />
                                        <Skeleton className="mt-3 h-3 w-1/2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty */}
                        {!isLoadingCourses && sortedCourses.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <GraduationCap className="h-7 w-7" />
                                </div>
                                <h3 className="text-base font-black text-slate-800">Belum ada data kelas</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Progress akan muncul otomatis setelah kelas tersedia.
                                </p>
                            </div>
                        )}

                        {/* Course rows — same card style as dashboard "Materi Saya" mobile cards */}
                        {!isLoadingCourses && (
                            <div className="space-y-3">
                                {sortedCourses.map((course, index) => (
                                    <motion.button
                                        key={course.id}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35, delay: index * 0.05 }}
                                        onClick={() => navigate(getCourseRoute(course.id))}
                                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
                                    >
                                        {/* Top row: title + status */}
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="text-base font-black tracking-tight text-slate-950">
                                                    {course.title}
                                                </h3>
                                                <p className="mt-0.5 text-xs text-slate-500">{course.lastItemLabel}</p>
                                            </div>
                                            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                                {/* Category tag — same as dashboard TAG_THEMES style */}
                                                <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#4f46e5]">
                                                    {course.category}
                                                </span>
                                                <StatusPill passed={course.passed} started={course.started} />
                                            </div>
                                        </div>

                                        {/* Progress label + bar — exact same as dashboard "Proses Belajar" */}
                                        <div className="mt-4">
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span className="font-semibold text-slate-700">Progress</span>
                                                <span className="font-black text-slate-900">{course.progress}%</span>
                                            </div>
                                            <ProgressBar value={course.progress} />
                                        </div>

                                        {/* Stat chips — same as dashboard featured card chips */}
                                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Materi</div>
                                                <div className="mt-1 text-sm font-black text-slate-900">
                                                    {course.completedMateri}/{course.totalMateri}
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Durasi</div>
                                                <div className="mt-1 flex items-center gap-1 text-sm font-black text-slate-900">
                                                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                                    {course.totalDurationLabel}
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kelulusan</div>
                                                <div className="mt-1 text-sm font-black text-slate-900">
                                                    {course.passed ? "Lulus ✓" : "Belum lulus"}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right Aside — same width & structure as dashboard aside ── */}
                    <aside className="space-y-8 lg:w-[280px] lg:shrink-0 xl:w-[320px]">

                        {/* Overall Progress — mirrors dashboard "Proses Belajar" section */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black tracking-tight text-slate-950">Progress Keseluruhan</h2>
                            </div>
                            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-slate-800">Total materi</span>
                                        <span className="font-black text-slate-700">{overallProgress}%</span>
                                    </div>
                                    <ProgressBar value={overallProgress} />
                                    <p className="mt-2 text-xs text-slate-500">
                                        {completedMateri} dari {totalMateri} materi telah diselesaikan.
                                    </p>
                                </div>

                                {/* Quick summary rows */}
                                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                                    {[
                                        { label: "Kelas tersedia", value: String(totalCourses), icon: GraduationCap, cls: "bg-sky-50 text-sky-600" },
                                        { label: "Sedang dikerjakan", value: String(startedCourses), icon: BookOpen, cls: "bg-indigo-50 text-indigo-600" },
                                        { label: "Kelas lulus", value: String(passedCourses), icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
                                        { label: "Sertifikat diraih", value: String(userCertificates.length), icon: Award, cls: "bg-amber-50 text-amber-500" },
                                    ].map(({ label, value, icon: Icon, cls }) => (
                                        <div key={label} className="flex items-center gap-2.5">
                                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", cls)}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="flex-1 text-sm font-medium text-slate-600">{label}</span>
                                            <span className="text-sm font-black text-slate-950">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Active Courses — mirrors dashboard "Rekomendasi" gradient card */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black tracking-tight text-slate-950">Kelas Aktif</h2>
                            </div>

                            {activeCourses.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
                                    Belum ada kelas yang sedang dikerjakan.
                                </div>
                            ) : (
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3f3bf4] via-[#4f46e5] to-[#312e9e] p-5 text-white shadow-xl shadow-indigo-500/20">
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.18),transparent_45%)]" />
                                    <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-8 translate-y-8 rounded-full bg-white/5 blur-2xl" />

                                    <div className="relative space-y-3">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b7f0ff] px-3 py-1.5 text-xs font-bold text-slate-900">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            Sedang Berjalan
                                        </span>

                                        {activeCourses.map((course, i) => (
                                            <button
                                                key={course.id}
                                                onClick={() => navigate(getCourseRoute(course.id))}
                                                className="w-full rounded-xl bg-white/10 px-4 py-3 text-left transition hover:bg-white/20 active:scale-[0.98]"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="line-clamp-1 text-sm font-black text-white">{course.title}</p>
                                                    <span className="shrink-0 text-xs font-black text-[#b7f0ff]">{course.progress}%</span>
                                                </div>
                                                {/* Mini progress bar */}
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                                                    <div
                                                        className="h-full rounded-full bg-[#b7f0ff] transition-all duration-700"
                                                        style={{ width: `${course.progress}%` }}
                                                    />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
