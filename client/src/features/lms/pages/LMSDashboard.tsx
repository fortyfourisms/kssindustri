import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCoursesRoute, getCourseRoute } from "@/features/lms/lib/lms-routes";
import {
    buildLmsCourseInsight,
    getCertificateCourseIds,
    inferLmsCategory,
    isPublishedCourse,
} from "@/features/lms/lib/lms-dashboard";
import { lmsService } from "@/features/lms/services/lms.service";
import { useLmsStore } from "@/features/lms/stores/lms.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import type { LmsCourseInsight } from "@/features/lms/lib/lms-dashboard";

const CARD_THEMES = [
    { bg: "bg-[#b7f0ff]", text: "text-slate-900" },
    { bg: "bg-[#f4f2ff]", text: "text-slate-900" },
    { bg: "bg-[#eef2ff]", text: "text-slate-900" },
];

const TAG_THEMES = [
    "bg-[#4f46e5] text-white",
    "bg-[#4338ca] text-white",
    "bg-[#2563eb] text-white",
];

export function LMSDashboard() {
    const navigate = useNavigate();
    const { courses, isLoadingCourses, coursesError, fetchCourses } = useLmsStore();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const userDisplayName = currentUser?.displayName || currentUser?.name || currentUser?.username || "User";

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const publishedCourses = useMemo(
        () => courses.filter(isPublishedCourse),
        [courses]
    );

    const { data: userCertificates = [] } = useQuery({
        queryKey: ["lms-my-certificates"],
        queryFn: () => lmsService.getMySertifikats(),
    });

    const certificateCourseIds = useMemo(
        () => getCertificateCourseIds(userCertificates),
        [userCertificates]
    );

    const baseCourseInsights = useMemo(
        () =>
            publishedCourses.map((course, index) => {
                return buildLmsCourseInsight({
                    course,
                    hasCertificate: certificateCourseIds.has(String(course.id)),
                    index,
                });
            }),
        [publishedCourses, certificateCourseIds]
    );

    const categoryOptions = useMemo(
        () => ["All", ...Array.from(new Set(baseCourseInsights.map((item, index) => inferLmsCategory(item.title, index))))],
        [baseCourseInsights]
    );
    const safeSelectedCategory = categoryOptions.includes(selectedCategory) ? selectedCategory : "All";
    const filteredBaseCourses = useMemo(
        () => safeSelectedCategory === "All"
            ? baseCourseInsights
            : baseCourseInsights.filter((item) => item.category === safeSelectedCategory),
        [baseCourseInsights, safeSelectedCategory]
    );
    const detailCourseIds = useMemo(
        () => filteredBaseCourses.slice(0, 5).map((course) => course.id),
        [filteredBaseCourses]
    );
    const courseDetailQueries = useQueries({
        queries: detailCourseIds.map((courseId) => ({
            queryKey: ["lms-dashboard-course-detail", courseId],
            queryFn: () => lmsService.getCourseById(courseId),
            enabled: !!courseId,
            staleTime: 1000 * 60 * 5,
        })),
    });
    const detailedCourseMap = useMemo(
        () =>
            detailCourseIds.reduce<Record<string, { materi: any[]; completedIds: string[] }>>((acc, courseId, index) => {
                const detail = courseDetailQueries[index]?.data;
                if (detail) {
                    acc[courseId] = {
                        materi: detail.materi ?? [],
                        completedIds: detail.completedIds ?? [],
                    };
                }
                return acc;
            }, {}),
        [detailCourseIds, courseDetailQueries]
    );
    const filteredCourses = useMemo(
        () =>
            filteredBaseCourses.map((course, index) => {
                const detail = detailedCourseMap[course.id];
                if (!detail) return course;

                return buildLmsCourseInsight({
                    course: publishedCourses.find((item) => item.id === course.id) ?? {
                        id: course.id,
                        judul: course.title,
                        deskripsi: course.description,
                        status: "published",
                        created_by: "",
                        created_at: "",
                        updated_at: "",
                    },
                    materi: detail.materi,
                    completedIds: detail.completedIds,
                    hasCertificate: certificateCourseIds.has(String(course.id)),
                    index,
                });
            }),
        [filteredBaseCourses, detailedCourseMap, publishedCourses, certificateCourseIds]
    );
    const featuredCourses = filteredCourses.slice(0, 3);
    const lessonRows = filteredCourses.slice(0, 5);
    const learningItems = filteredCourses
        .filter((item) => item.started || item.passed)
        .slice(0, 3)
        .map((item) => ({
            id: item.id,
            label: item.category,
            value: item.progress,
        }));
    const suggestedCourse = filteredCourses.find((item) => !item.started) ?? featuredCourses[0];
    const featuredCourseSlots: Array<LmsCourseInsight | null> = isLoadingCourses ? Array.from({ length: 3 }, () => null) : featuredCourses;
    const lessonRowSlots: Array<LmsCourseInsight | null> = isLoadingCourses ? Array.from({ length: 5 }, () => null) : lessonRows;

    useEffect(() => {
        if (!categoryOptions.includes(selectedCategory)) {
            setSelectedCategory("All");
        }
    }, [categoryOptions, selectedCategory]);

    return (
        <div className="h-full overflow-y-auto bg-[#f8fafc]">
            <div className="mx-auto max-w-[1480px] px-6 py-6">
                <div className="flex gap-8 xl:gap-10">
                    <div className="min-w-0 flex-1">
                        <div className="mb-6 rounded-3xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200">
                            <p className="text-sm font-medium text-slate-500">Dashboard LMS</p>
                            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                                Selamat datang {userDisplayName}
                            </h1>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2">
                            {categoryOptions.map((cat, i) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                                        cat === safeSelectedCategory
                                            ? "bg-slate-900 text-white shadow-md"
                                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {coursesError && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {coursesError}
                            </div>
                        )}

                        {!isLoadingCourses && !coursesError && filteredCourses.length === 0 && (
                            <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
                                Belum ada kelas pada kategori <span className="font-bold text-slate-700">{safeSelectedCategory}</span>.
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredCourseSlots.map((course, index) => {
                                if (!course) {
                                    return (
                                        <div
                                            key={`sk-${index}`}
                                            className="h-[220px] animate-pulse rounded-2xl bg-slate-100"
                                        />
                                    );
                                }
                                const theme = CARD_THEMES[index % CARD_THEMES.length];
                                return (
                                    <motion.button
                                        key={course.id}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.07 }}
                                        onClick={() => navigate(getCourseRoute(course.id))}
                                        className={cn(
                                            "group flex min-h-[220px] flex-col rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg",
                                            theme.bg,
                                            theme.text
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className={cn("inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold", TAG_THEMES[index % TAG_THEMES.length])}>
                                                {course.category}
                                            </span>
                                            <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-slate-700">
                                                {course.statusLabel}
                                            </span>
                                        </div>
                                        <div className="mt-auto">
                                            <h2 className="mt-4 text-lg font-black leading-tight tracking-tight text-slate-950">
                                                {course.title}
                                            </h2>
                                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                                                {course.description}
                                            </p>
                                            <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                                                <div className="rounded-xl bg-white/70 px-3 py-2">
                                                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Materi</div>
                                                    <div className="mt-1 text-sm font-black">{course.totalMateri}</div>
                                                </div>
                                                <div className="rounded-xl bg-white/70 px-3 py-2">
                                                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Selesai</div>
                                                    <div className="mt-1 text-sm font-black">{course.completedMateri}</div>
                                                </div>
                                                <div className="rounded-xl bg-white/70 px-3 py-2">
                                                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Progress</div>
                                                    <div className="mt-1 text-sm font-black">{course.progress}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="mt-10">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-black tracking-tight text-slate-950">My lessons</h2>
                                <button
                                    onClick={() => navigate(getCoursesRoute())}
                                    className="text-sm font-medium text-slate-500 transition hover:text-[#4f46e5]"
                                >
                                    View all lessons
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <div className="grid grid-cols-[1fr,140px,140px,120px] border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    <span>Kelas</span>
                                    <span>Materi</span>
                                    <span>Durasi</span>
                                    <span className="text-right">Progress</span>
                                </div>

                                {lessonRowSlots.map((course, index) => {
                                    if (!course) {
                                        return (
                                            <div key={`lsk-${index}`} className="grid grid-cols-[1fr,140px,140px,120px] border-b border-slate-100 px-6 py-4 last:border-b-0">
                                                <div className="h-9 w-3/4 animate-pulse rounded-xl bg-slate-100" />
                                                <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
                                                <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
                                                <div className="ml-auto h-9 w-16 animate-pulse rounded-xl bg-slate-100" />
                                            </div>
                                        );
                                    }
                                    return (
                                        <button
                                            key={course.id}
                                            onClick={() => navigate(getCourseRoute(course.id))}
                                            className="grid w-full grid-cols-[1fr,140px,140px,120px] items-center border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50 last:border-b-0"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                                                    {String(index + 1).padStart(2, "0")}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="block truncate text-sm font-medium text-slate-900">{course.title}</span>
                                                    <span className="block truncate text-xs text-slate-500">{course.lastItemLabel}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">
                                                {course.completedMateri}/{course.totalMateri}
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">
                                                {course.totalDurationLabel}
                                            </div>
                                            <div className="text-right text-sm font-bold text-slate-900">
                                                {course.progress}%
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <aside className="hidden w-[320px] shrink-0 space-y-8 xl:block">
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black tracking-tight text-slate-950">Learning process</h2>
                                <button
                                    onClick={() => navigate("/lms/progress")}
                                    className="text-sm font-medium text-slate-400 transition hover:text-[#4f46e5]"
                                >
                                    See all
                                </button>
                            </div>

                            <div className="space-y-5">
                                {learningItems.length > 0 ? (
                                    learningItems.map((item) => (
                                        <div key={item.id}>
                                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                                <span className="font-semibold text-slate-800">{item.label}</span>
                                                <span className="font-bold text-slate-700">{item.value}%</span>
                                            </div>
                                            <div className="relative h-5 w-full overflow-hidden rounded-sm bg-slate-100">
                                                <div
                                                    className="absolute inset-y-0 left-0 rounded-sm bg-[#4f46e5] transition-all duration-700"
                                                    style={{ width: `${item.value}%` }}
                                                />
                                                <div
                                                    className="absolute inset-y-0 right-0"
                                                    style={{
                                                        width: `${100 - item.value}%`,
                                                        background: "repeating-linear-gradient(-45deg, #1e1b4b 0px, #1e1b4b 2px, transparent 2px, transparent 7px)",
                                                        opacity: 0.18,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                                        Progress akan tampil setelah Anda mulai mempelajari kelas.
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black tracking-tight text-slate-950">You might like it</h2>
                                <button
                                    onClick={() => navigate(getCoursesRoute())}
                                    className="text-sm font-medium text-slate-400 transition hover:text-[#4f46e5]"
                                >
                                    See all
                                </button>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3f3bf4] via-[#4f46e5] to-[#312e9e] p-5 text-white shadow-xl shadow-indigo-500/20">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.18),transparent_45%)]" />
                                <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-8 translate-y-8 rounded-full bg-white/5 blur-2xl" />

                                <div className="relative">
                                    <span className="inline-flex rounded-full bg-[#b7f0ff] px-3 py-1.5 text-xs font-bold text-slate-900">
                                        {suggestedCourse?.category || "Kelas"}
                                    </span>

                                    <h3 className="mt-5 text-2xl font-black leading-tight">
                                        {suggestedCourse?.title || "Belum ada kelas tersedia"}
                                    </h3>

                                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                                        {suggestedCourse?.description
                                            ? `${suggestedCourse.description.slice(0, 100)}...`
                                            : "Jelajahi kelas pilihan yang dirancang agar proses belajar terasa lebih terarah dan engaging."}
                                    </p>

                                    <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-white/80">
                                        <div className="rounded-xl bg-white/10 px-3 py-2">
                                            <div className="text-[10px] uppercase tracking-wider text-white/60">Materi</div>
                                            <div className="mt-1 font-black text-white">{suggestedCourse?.totalMateri ?? 0}</div>
                                        </div>
                                        <div className="rounded-xl bg-white/10 px-3 py-2">
                                            <div className="text-[10px] uppercase tracking-wider text-white/60">Durasi</div>
                                            <div className="mt-1 font-black text-white">{suggestedCourse?.totalDurationLabel ?? "0 min"}</div>
                                        </div>
                                        <div className="rounded-xl bg-white/10 px-3 py-2">
                                            <div className="text-[10px] uppercase tracking-wider text-white/60">Status</div>
                                            <div className="mt-1 font-black text-white">{suggestedCourse?.statusLabel ?? "-"}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (suggestedCourse) navigate(getCourseRoute(suggestedCourse.id));
                                            else navigate(getCoursesRoute());
                                        }}
                                        className="mt-5 w-full rounded-xl bg-white py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 active:scale-[0.98]"
                                    >
                                        Learn more
                                    </button>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
