import { motion } from "framer-motion";
import { courseShowcaseItems } from "@/data/courseShowcase";
import { ArrowRight, BookOpen, Shield, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COURSE_PREVIEW_LIMIT = 3;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CourseShowcase() {
  const navigate = useNavigate();
  const hasMoreCourses = courseShowcaseItems.length > COURSE_PREVIEW_LIMIT;
  const previewCourses = courseShowcaseItems.slice(0, COURSE_PREVIEW_LIMIT);

  return (
    <section id="courses" className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white via-white/70 to-transparent" />
        <div className="absolute -top-16 left-[8%] h-56 w-56 rounded-full bg-[#595cff]/10 blur-3xl" />
        <div className="absolute top-20 right-[10%] h-64 w-64 rounded-full bg-[#60efff]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#0061ff]/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 sm:mb-12 md:mb-16">
          <div className="mx-auto grid max-w-7xl gap-8 text-center lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end lg:text-left">
            <div className="mx-auto max-w-3xl lg:mx-0">
              <h2 className="font-display text-[clamp(2.2rem,7vw,4.75rem)] font-medium leading-[1.02] tracking-tight text-slate-900">
                Program Pembelajaran
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff]">
                  Keamanan Siber
                </span>
              </h2>
            </div>
            {hasMoreCourses ? (
              <div className="hidden justify-end lg:flex">
                <button
                  type="button"
                  onClick={() => navigate("/courses")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#0061ff]"
                >
                  Show More
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
        >
          {previewCourses.map((course) => (
            <motion.article
              key={course.title}
              variants={itemVariants}
              onClick={() => navigate(`/course-preview/${course.slug}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/course-preview/${course.slug}`);
                }
              }}
              role="button"
              tabIndex={0}
              className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#0061ff]/20 hover:shadow-[0_30px_100px_rgba(31,60,136,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff]/40 sm:rounded-[2rem] shadow-[0_20px_80px_rgba(31,60,136,0.12)]"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,239,255,0.16),transparent_42%)]" />
                <div className="absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-[#0061ff]/10 blur-2xl" />
              </div>
              <div className={`relative h-40 overflow-hidden bg-gradient-to-br p-5 sm:h-44 sm:p-6 ${course.accent}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_38%)] transition-opacity duration-500 group-hover:opacity-90" />
                <div className={`absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-gradient-to-br ${course.glow} blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-90`} />
                <div className="absolute -right-6 top-6 h-24 w-24 rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="relative z-10 flex h-full items-end">
                  <h3 className="max-w-[90%] text-xl font-bold leading-tight text-white transition-transform duration-500 group-hover:translate-y-[-2px] sm:max-w-[85%] sm:text-2xl">
                    {course.title}
                  </h3>
                </div>
              </div>

              <div className="relative p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    {course.category}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]">
                    <Shield className="h-3.5 w-3.5" />
                    {course.duration}
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
                <div className="mt-5 flex items-start justify-between gap-4">
                  <p className="text-sm font-medium leading-relaxed text-slate-500 transition-colors duration-500 group-hover:text-slate-700">{course.summary}</p>
                  <span className="pt-0.5 text-lg text-[#0061ff] transition-transform duration-500 group-hover:translate-x-2">
                    -&gt;
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {hasMoreCourses ? (
          <div className="mt-6 flex justify-center lg:hidden">
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#0061ff]"
            >
              Show More
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
