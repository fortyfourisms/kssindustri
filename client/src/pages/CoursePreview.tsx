import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { publicCoursesService } from "@/services/publicCourses.service";

export default function CoursePreview() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  useScrollToTop(slug);
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["public-course-detail", slug],
    queryFn: () => publicCoursesService.getCourseBySlug(slug || ""),
    enabled: !!slug,
  });

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (!isLoading && (isError || !course)) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_40%,#eef6ff_100%)]" />
        <div className="absolute -top-10 left-[6%] h-72 w-72 rounded-full bg-[#595cff]/10 blur-3xl" />
        <div className="absolute top-32 right-[8%] h-80 w-80 rounded-full bg-[#60efff]/12 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#0061ff]/8 blur-3xl" />
      </div>
      <Navbar mode="preview" />

      <main className="relative z-10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar course
          </button>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 rounded-[2rem] border border-white/60 bg-white/80 p-6 md:p-8 shadow-[0_24px_100px_rgba(31,60,136,0.10)] backdrop-blur-xl"
          >
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-12 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-[180px] rounded-[1.5rem] bg-slate-100" />
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                      {course?.category}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {course?.durationLabel}
                    </span>
                  </div>

                  <h1 className="mt-6 max-w-5xl text-3xl font-display font-semibold tracking-tight text-slate-900 leading-[1.05] md:text-5xl xl:text-6xl">
                    {course?.title}
                  </h1>
                  <p className="mt-5 max-w-4xl text-base leading-relaxed text-slate-600 md:text-lg">
                    {course?.summary}
                  </p>

                  <div className="mt-8 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Penyelenggara</p>
                    <p className="mt-3 text-base font-semibold text-slate-900">{course?.provider}</p>
                  </div>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-[1.75rem] border border-white/60 bg-white/85 p-6 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-900">Ringkasan Program</h3>
                    <div className="mt-5 space-y-4">
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#0061ff]">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                        <span>{course?.durationLabel}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#0061ff]">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                        <span className="capitalize">Status {course?.status || "published"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/register")}
                      className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#22d3ee] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.01]"
                    >
                      Daftar Sekarang
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </motion.section>

          <div className="mt-8">
            <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 md:p-8 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-slate-900">Informasi Umum</h2>
              <div className="mt-5 space-y-4 text-slate-600 leading-relaxed">
                {isLoading ? (
                  <>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                  </>
                ) : (
                  <>
                    <p>{course?.generalInfo}</p>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-10">
          <Footer />
        </div>
      </main>
    </div>
  );
}
