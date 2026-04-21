import { motion } from "framer-motion";
import { courseShowcaseItems } from "@/data/courseShowcase";
import { BookOpen, Shield, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <section id="courses" className="relative py-16 md:py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white via-white/70 to-transparent" />
        <div className="absolute -top-16 left-[8%] h-56 w-56 rounded-full bg-[#595cff]/10 blur-3xl" />
        <div className="absolute top-20 right-[10%] h-64 w-64 rounded-full bg-[#60efff]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#0061ff]/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <h2 className="mt-5 text-4xl md:text-6xl font-display font-medium tracking-tight text-slate-900 leading-tight">
            Program pembelajaran
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#60efff]">
              keamanan siber
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-slate-600">
            Rangkaian kelas untuk memperkuat awareness, tata kelola, dan kapabilitas teknis keamanan siber dengan tampilan yang selaras dengan identitas visual landing page.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {courseShowcaseItems.map((course) => (
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
              className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(31,60,136,0.12)] backdrop-blur-sm cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:border-[#0061ff]/20 hover:shadow-[0_30px_100px_rgba(31,60,136,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff]/40"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,239,255,0.16),transparent_42%)]" />
                <div className="absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-[#0061ff]/10 blur-2xl" />
              </div>
              <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${course.accent} p-6`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_38%)] transition-opacity duration-500 group-hover:opacity-90" />
                <div className={`absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-gradient-to-br ${course.glow} blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-90`} />
                <div className="absolute -right-6 top-6 h-24 w-24 rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="relative z-10 flex h-full items-end">
                  <h3 className="max-w-[85%] text-2xl font-bold leading-tight text-white transition-transform duration-500 group-hover:translate-y-[-2px]">
                    {course.title}
                  </h3>
                </div>
              </div>

              <div className="relative p-6">
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
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 transition-colors duration-500 group-hover:text-slate-700">{course.summary}</p>
                  <span className="text-lg text-[#0061ff] transition-transform duration-500 group-hover:translate-x-2">
                    -&gt;
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
