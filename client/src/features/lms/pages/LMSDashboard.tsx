import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCoursesRoute, getCourseRoute } from "@/features/lms/lib/lms-routes";
import { useLmsStore } from "@/features/lms/stores/lms.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const CATEGORY_FALLBACKS = ["All", "Network", "Awareness", "Policy", "Incident", "Cloud", "Defense"];

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

function inferCategory(title: string, index: number): string {
    const lower = title.toLowerCase();
    if (lower.includes("network")) return "Network";
    if (lower.includes("cloud")) return "Cloud";
    if (lower.includes("incident") || lower.includes("csirt")) return "Incident";
    if (lower.includes("policy") || lower.includes("governance")) return "Policy";
    if (lower.includes("phishing") || lower.includes("awareness")) return "Awareness";
    if (lower.includes("defense") || lower.includes("secure")) return "Defense";
    return CATEGORY_FALLBACKS[(index % (CATEGORY_FALLBACKS.length - 1)) + 1];
}

function getInitials(name?: string) {
    if (!name) return "LR";
    return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function getPseudoDuration(title: string, index: number) {
    return 18 + ((title.length + index * 7) % 35);
}

function getProgressValue(index: number, total: number, certificateCount: number) {
    if (total === 0) return 0;
    const base = Math.max(24, 82 - index * 14);
    return Math.min(96, base + (certificateCount > 0 ? 8 : 0));
}

const TEACHER_NAMES = ["Vanessa Douglas", "Aysha Hayes", "Ilyas Lamb", "Kobi Potts"];

export function LMSDashboard() {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);
    const { courses, userCertificates, isLoadingCourses, coursesError, fetchCourses, fetchMyCertificates } = useLmsStore();

    useEffect(() => {
        fetchCourses();
        fetchMyCertificates();
    }, [fetchCourses, fetchMyCertificates]);

    const categoryOptions = ["All", ...Array.from(new Set(courses.slice(0, 6).map((c, i) => inferCategory(c.judul, i))))];
    const featuredCourses = courses.slice(0, 3);
    const lessonRows = courses.slice(0, 5);
    const learningItems = courses.slice(0, 3).map((course, index) => ({
        id: course.id,
        label: inferCategory(course.judul, index),
        value: getProgressValue(index, courses.length, userCertificates.length),
    }));

    return (
        <div className="h-full overflow-y-auto bg-[#f8fafc]">
            <div className="mx-auto max-w-[1480px] px-6 py-6">
                {/* Two-column layout */}
                <div className="flex gap-8 xl:gap-10">

                    {/* ── LEFT: Main content ── */}
                    <div className="min-w-0 flex-1">

                        {/* Category Pills */}
                        <div className="mb-6 flex flex-wrap gap-2">
                            {categoryOptions.map((cat, i) => (
                                <button
                                    key={cat}
                                    className={cn(
                                        "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                                        i === 0
                                            ? "bg-slate-900 text-white shadow-md"
                                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Error banner */}
                        {coursesError && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {coursesError}
                            </div>
                        )}

                        {/* Featured Course Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {(isLoadingCourses ? Array.from({ length: 3 }) : featuredCourses).map((course, index) => {
                                if (!course) {
                                    return (
                                        <div
                                            key={`sk-${index}`}
                                            className="h-[200px] animate-pulse rounded-2xl bg-slate-100"
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
                                            "group flex min-h-[200px] flex-col rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg",
                                            theme.bg, theme.text
                                        )}
                                    >
                                        <span className={cn("inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold", TAG_THEMES[index % TAG_THEMES.length])}>
                                            {inferCategory(course.judul, index)}
                                        </span>
                                        <div className="mt-auto">
                                            <h2 className="mt-4 text-lg font-black leading-tight tracking-tight text-slate-950">
                                                {course.judul}
                                            </h2>
                                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                                                {course.deskripsi || "Pelajari materi inti keamanan siber secara bertahap dengan konten yang mudah diikuti."}
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* My Lessons Table */}
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
                                {/* Table Header */}
                                <div className="grid grid-cols-[1fr,180px,100px] border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    <span>Lesson</span>
                                    <span>Teacher</span>
                                    <span className="text-right">Duration</span>
                                </div>

                                {/* Table Rows */}
                                {(isLoadingCourses ? Array.from({ length: 5 }) : lessonRows).map((course, index) => {
                                    if (!course) {
                                        return (
                                            <div key={`lsk-${index}`} className="grid grid-cols-[1fr,180px,100px] border-b border-slate-100 px-6 py-4 last:border-b-0">
                                                <div className="h-9 w-3/4 animate-pulse rounded-xl bg-slate-100" />
                                                <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-100" />
                                                <div className="ml-auto h-9 w-16 animate-pulse rounded-xl bg-slate-100" />
                                            </div>
                                        );
                                    }
                                    return (
                                        <button
                                            key={course.id}
                                            onClick={() => navigate(getCourseRoute(course.id))}
                                            className="grid w-full grid-cols-[1fr,180px,100px] items-center border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50 last:border-b-0"
                                        >
                                            {/* Lesson */}
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                                                    {getInitials(course.judul)}
                                                </div>
                                                <span className="truncate text-sm font-medium text-slate-900">{course.judul}</span>
                                            </div>
                                            {/* Teacher */}
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-200 text-[10px] font-black text-slate-700">
                                                    {getInitials(currentUser?.name || TEACHER_NAMES[index % TEACHER_NAMES.length])}
                                                </div>
                                                <span className="truncate text-sm text-slate-700">
                                                    {TEACHER_NAMES[index % TEACHER_NAMES.length]}
                                                </span>
                                            </div>
                                            {/* Duration */}
                                            <div className="text-right text-sm font-medium text-slate-900">
                                                {getPseudoDuration(course.judul, index)} min
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Sidebar ── */}
                    <aside className="hidden w-[320px] shrink-0 space-y-8 xl:block">

                        {/* Learning Process */}
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
                                            {/* Progress bar with hatch overlay */}
                                            <div className="relative h-5 w-full overflow-hidden rounded-sm bg-slate-100">
                                                {/* Filled bar */}
                                                <div
                                                    className="absolute inset-y-0 left-0 rounded-sm bg-[#4f46e5] transition-all duration-700"
                                                    style={{ width: `${item.value}%` }}
                                                />
                                                {/* Hatch pattern overlay on the right portion */}
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
                                        Progress akan tampil setelah kelas tersedia.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* You Might Like It */}
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
                                {/* Decorative radial glows */}
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.18),transparent_45%)]" />
                                {/* Wavy pattern */}
                                <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-8 translate-y-8 rounded-full bg-white/5 blur-2xl" />

                                <div className="relative">
                                    {/* Tag */}
                                    <span className="inline-flex rounded-full bg-[#b7f0ff] px-3 py-1.5 text-xs font-bold text-slate-900">
                                        {featuredCourses[0] ? inferCategory(featuredCourses[0].judul, 0) : "Design"}
                                    </span>

                                    {/* Title */}
                                    <h3 className="mt-5 text-2xl font-black leading-tight">
                                        {featuredCourses[0]?.judul || "Motion Design"}
                                    </h3>

                                    {/* Description */}
                                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                                        {featuredCourses[0]?.deskripsi
                                            ? featuredCourses[0].deskripsi.slice(0, 100) + "..."
                                            : "Jelajahi kelas pilihan yang dirancang agar proses belajar terasa lebih terarah dan engaging."}
                                    </p>

                                    {/* Avatar row */}
                                    <div className="mt-6 flex items-center gap-3 text-xs text-white/75">
                                        <div className="flex -space-x-2">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 bg-white text-[10px] font-black text-[#4338ca]"
                                                >
                                                    {i === 3 ? "+8" : getInitials(currentUser?.name || `U${i + 1}`)}
                                                </div>
                                            ))}
                                        </div>
                                        <span>They are already learning</span>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => {
                                            if (featuredCourses[0]) navigate(getCourseRoute(featuredCourses[0].id));
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
