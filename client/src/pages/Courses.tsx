import { ArrowRight, BookOpen, Shield, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useQuery } from "@tanstack/react-query";
import { publicCoursesService } from "@/services/publicCourses.service";

const COURSE_ACCENTS = [
  {
    accent: "from-[#1f3c88] via-[#0061ff] to-[#60efff]",
    glow: "from-[#1f3c88]/20 via-[#0061ff]/15 to-transparent",
  },
  {
    accent: "from-[#0f2f6b] via-[#1d4ed8] to-[#22d3ee]",
    glow: "from-[#0f2f6b]/20 via-[#1d4ed8]/15 to-transparent",
  },
  {
    accent: "from-[#173b7a] via-[#2563eb] to-[#67e8f9]",
    glow: "from-[#173b7a]/20 via-[#2563eb]/15 to-transparent",
  },
];

export default function Courses() {
  const navigate = useNavigate();
  useScrollToTop();
  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ["public-courses"],
    queryFn: () => publicCoursesService.getCourses(),
  });

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Navbar mode="preview" />

      <main className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eff6ff_100%)]" />
          <div className="absolute left-[10%] top-16 h-60 w-60 rounded-full bg-[#595cff]/10 blur-3xl" />
          <div className="absolute right-[8%] top-24 h-72 w-72 rounded-full bg-[#60efff]/16 blur-3xl" />
          <div className="absolute bottom-16 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#0061ff]/10 blur-3xl" />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-medium tracking-tight text-slate-900 leading-tight">
              Jelajahi program pembelajaran
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#60efff]">
                keamanan siber yang siap dipelajari
              </span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
              Kelas dirancang untuk kebutuhan awareness, operasional, governance, dan engineering agar peserta bisa belajar dengan alur yang lebih jelas dan relevan.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`course-page-skeleton-${index}`}
                    className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_20px_80px_rgba(31,60,136,0.08)]"
                  >
                    <div className="h-44 animate-pulse bg-slate-200" />
                    <div className="space-y-4 p-6">
                      <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))
              : courses.map((course, index) => {
                  const accent = COURSE_ACCENTS[index % COURSE_ACCENTS.length];

                  return (
                    <article
                      key={course.id}
                      onClick={() => navigate(`/course-preview/${course.slug}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/course-preview/${course.slug}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(31,60,136,0.10)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#0061ff]/20 hover:shadow-[0_28px_100px_rgba(31,60,136,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff]/40"
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,239,255,0.14),transparent_42%)]" />
                        <div className="absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-[#0061ff]/10 blur-2xl" />
                      </div>

                      <div
                        className={`relative h-44 overflow-hidden bg-gradient-to-br ${accent.accent} p-6`}
                        style={
                          course.thumbnailUrl
                            ? {
                                backgroundImage: `linear-gradient(135deg, rgba(14,47,107,0.88), rgba(0,97,255,0.72), rgba(96,239,255,0.50)), url(${course.thumbnailUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_38%)] transition-opacity duration-500 group-hover:opacity-90" />
                        <div className={`absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-gradient-to-br ${accent.glow} blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-90`} />
                        <div className="absolute -right-6 top-6 h-24 w-24 rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                        <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="relative z-10 flex h-full items-end">
                          <h2 className="max-w-[85%] text-2xl font-bold leading-tight text-white transition-transform duration-500 group-hover:translate-y-[-2px]">
                            {course.title}
                          </h2>
                        </div>
                      </div>

                      <div className="relative p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                          <span className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                            {course.category}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]">
                            <Shield className="h-3.5 w-3.5" />
                            {course.durationLabel}
                          </span>
                        </div>

                        <div className="space-y-4 text-slate-700">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#1f3c88]">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Penyelenggara</p>
                              <p className="mt-1 text-base font-semibold leading-snug text-slate-900">{course.provider}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 h-px bg-gradient-to-r from-[#1f3c88]/15 via-[#0061ff]/30 to-[#60efff]/15" />
                        <div className="mt-5 flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-slate-500 transition-colors duration-500 group-hover:text-slate-700">
                            {course.summary}
                          </p>
                          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#0061ff] transition-transform duration-500 group-hover:translate-x-1">
                            Detail
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
          </div>

          {!isLoading && !isError && courses.length === 0 ? (
            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm font-medium text-slate-500 shadow-[0_20px_80px_rgba(31,60,136,0.08)]">
              Belum ada kelas yang tersedia saat ini.
            </div>
          ) : null}

          {!isLoading && isError ? (
            <div className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm font-medium text-rose-700 shadow-[0_20px_80px_rgba(31,60,136,0.08)]">
              Gagal memuat daftar kelas. Silakan coba lagi beberapa saat.
            </div>
          ) : null}
        </section>

        <Footer />
      </main>
    </div>
  );
}
