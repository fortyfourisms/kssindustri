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

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof TrendingUp;
    label: string;
    value: string;
    tone: string;
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</p>
        </div>
    );
}

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

    const courseDetailQueries = useQueries({
        queries: publishedCourses.map((course) => ({
            queryKey: ["lms-progress-course-detail", course.id],
            queryFn: () => lmsService.getCourseById(course.id),
            enabled: !!course.id,
        })),
    });

    const certificateCourseIds = useMemo(
        () => getCertificateCourseIds(userCertificates),
        [userCertificates]
    );

    const courseInsights = useMemo(
        () =>
            publishedCourses.map((course, index) => {
                const detail = courseDetailQueries[index]?.data;
                return buildLmsCourseInsight({
                    course,
                    materi: detail?.materi ?? [],
                    completedIds: detail?.completedIds ?? [],
                    hasCertificate: certificateCourseIds.has(String(course.id)),
                    index,
                });
            }),
        [publishedCourses, courseDetailQueries, certificateCourseIds]
    );

    const totalCourses = courseInsights.length;
    const startedCourses = courseInsights.filter((item) => item.started).length;
    const passedCourses = courseInsights.filter((item) => item.passed).length;
    const totalMateri = courseInsights.reduce((sum, item) => sum + item.totalMateri, 0);
    const completedMateri = courseInsights.reduce((sum, item) => sum + item.completedMateri, 0);
    const overallProgress = totalMateri > 0 ? Math.round((completedMateri / totalMateri) * 100) : 0;

    const sortedCourses = useMemo(
        () => [...courseInsights].sort((a, b) => b.progress - a.progress || a.title.localeCompare(b.title)),
        [courseInsights]
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6 pb-12">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                                <TrendingUp className="h-4 w-4" />
                                Progress Belajar
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Pantau pembelajaran dari data LMS</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                                Ringkasan ini mengambil jumlah kelas, materi selesai, dan status kelulusan langsung dari database LMS.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatCard icon={GraduationCap} label="Kelas tersedia" value={String(totalCourses)} tone="bg-sky-50 text-sky-600" />
                            <StatCard icon={BookOpen} label="Kelas dimulai" value={String(startedCourses)} tone="bg-indigo-50 text-indigo-600" />
                            <StatCard icon={CheckCircle2} label="Materi selesai" value={`${completedMateri}/${totalMateri}`} tone="bg-emerald-50 text-emerald-600" />
                            <StatCard icon={Award} label="Lulus" value={String(passedCourses)} tone="bg-amber-50 text-amber-600" />
                        </div>
                    </div>
                </div>

                {coursesError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {coursesError}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-900">Progress per kelas</h2>
                                <p className="text-sm text-slate-500">Kemajuan aktual berdasarkan materi yang sudah ditandai selesai.</p>
                            </div>
                            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                                Total {overallProgress}%
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isLoadingCourses && Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-2xl border border-slate-100 p-4">
                                    <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-100" />
                                    <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-100" />
                                    <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
                                </div>
                            ))}

                            {!isLoadingCourses && sortedCourses.length === 0 && (
                                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-500">
                                        <GraduationCap className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Belum ada data kelas</h3>
                                    <p className="mt-2 max-w-md text-sm text-slate-500">
                                        Progress akan muncul otomatis setelah kelas tersedia di database LMS.
                                    </p>
                                </div>
                            )}

                            {!isLoadingCourses && sortedCourses.map((course, index) => (
                                <motion.button
                                    key={course.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: index * 0.05 }}
                                    onClick={() => navigate(getCourseRoute(course.id))}
                                    className="w-full rounded-3xl border border-slate-200 bg-slate-50/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-sm"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="truncate text-lg font-black tracking-tight text-slate-900">{course.title}</h3>
                                                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600">
                                                    {course.category}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">{course.lastItemLabel}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
                                            <p className="mt-1 text-sm font-black text-slate-800">{course.statusLabel}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-semibold text-slate-700">Progress</span>
                                            <span className="font-black text-slate-900">{course.progress}%</span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700"
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl bg-white px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Materi</p>
                                            <p className="mt-1 text-sm font-black text-slate-800">{course.completedMateri}/{course.totalMateri}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Durasi</p>
                                            <p className="mt-1 flex items-center gap-2 text-sm font-black text-slate-800">
                                                <Clock3 className="h-4 w-4 text-slate-400" />
                                                {course.totalDurationLabel}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-white px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kelulusan</p>
                                            <p className="mt-1 text-sm font-black text-slate-800">{course.passed ? "Sertifikat tersedia" : "Belum lulus"}</p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-black tracking-tight text-slate-900">Ringkasan cepat</h2>
                            <div className="mt-5 space-y-4">
                                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Progress keseluruhan</p>
                                    <p className="mt-1 text-3xl font-black text-slate-900">{overallProgress}%</p>
                                    <p className="mt-2 text-sm text-slate-500">Dihitung dari total materi yang sudah selesai dibanding seluruh materi yang tersedia.</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sertifikat</p>
                                    <p className="mt-1 text-3xl font-black text-slate-900">{userCertificates.length}</p>
                                    <p className="mt-2 text-sm text-slate-500">Jumlah kelas yang sudah memiliki sertifikat terbit untuk akun Anda.</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-black tracking-tight text-slate-900">Kelas terdekat selesai</h2>
                            <div className="mt-5 space-y-3">
                                {sortedCourses
                                    .filter((course) => !course.passed && course.started)
                                    .slice(0, 3)
                                    .map((course) => (
                                        <button
                                            key={course.id}
                                            onClick={() => navigate(getCourseRoute(course.id))}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-sky-200 hover:bg-sky-50/40"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-black text-slate-900">{course.title}</p>
                                                    <p className="mt-1 truncate text-xs text-slate-500">{course.lastItemLabel}</p>
                                                </div>
                                                <span className="shrink-0 text-sm font-black text-sky-600">{course.progress}%</span>
                                            </div>
                                        </button>
                                    ))}

                                {!sortedCourses.some((course) => !course.passed && course.started) && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                        Belum ada kelas aktif yang sedang dikerjakan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
