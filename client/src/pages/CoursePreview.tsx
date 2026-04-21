import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCourseShowcaseBySlug } from "@/data/courseShowcase";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  PlayCircle,
  Shield,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const typeIconMap = {
  Video: PlayCircle,
  Kuis: ClipboardList,
  PDF: FileText,
  Lab: Shield,
} as const;

export default function CoursePreview() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const course = useMemo(() => (slug ? getCourseShowcaseBySlug(slug) : undefined), [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!course) {
    return <Navigate to="/" replace />;
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
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke landing page
          </button>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 rounded-[2rem] border border-white/60 bg-white/80 p-6 md:p-8 shadow-[0_24px_100px_rgba(31,60,136,0.10)] backdrop-blur-xl"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    {course.category}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]">
                    <Shield className="h-3.5 w-3.5" />
                    {course.duration}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {course.level}
                  </span>
                </div>

                <h1 className="mt-5 text-3xl md:text-5xl font-display font-semibold tracking-tight text-slate-900 leading-tight">
                  {course.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                  <div className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-blue-600" />
                    {course.provider}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-cyan-600" />
                    Preview kelas cyber security
                  </div>
                </div>

                <div className={`mt-8 relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${course.accent} p-8 md:p-10 min-h-[300px]`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_32%)]" />
                  <div className={`absolute left-0 bottom-0 h-36 w-36 rounded-full bg-gradient-to-br ${course.glow} blur-3xl`} />
                  <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white backdrop-blur-md">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between text-white/80 text-sm font-semibold uppercase tracking-[0.22em]">
                      <span>FortyFour Learning</span>
                    </div>
                    <div className="py-10">
                      <h2 className="max-w-3xl text-3xl md:text-5xl font-bold leading-tight text-white">
                        {course.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-white/85">
                        {course.summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {course.innovationCategories.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="lg:pt-16">
                <div className="sticky top-28 rounded-[1.75rem] border border-[#0061ff]/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,97,255,0.10)] backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-slate-900">Program ini termasuk</h3>
                  <div className="mt-5 space-y-3">
                    {course.includes.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#0061ff]">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
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

            <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6 text-sm font-medium text-slate-500">
              {["Informasi Umum", "Syarat Pendaftaran", "Aktivitas", "Tentang Mitra"].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                  {item}
                </span>
              ))}
            </div>
          </motion.section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 md:p-8 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-slate-900">Informasi Umum</h2>
                <div className="mt-5 space-y-4 text-slate-600 leading-relaxed">
                  {course.overview.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-900">Kategori Peserta</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {course.participantCategories.map((tag) => (
                      <span key={tag} className="rounded-xl bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#1f3c88]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-900">Kategori Inovasi</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {course.innovationCategories.map((tag) => (
                      <span key={tag} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 md:p-8 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-slate-900">Syarat Pendaftaran</h2>
                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  {course.requirements.map((item, index) => (
                    <div
                      key={item.label}
                      className={`grid grid-cols-1 md:grid-cols-[240px_1fr] ${index !== course.requirements.length - 1 ? "border-b border-slate-200" : ""}`}
                    >
                      <div className="bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">{item.label}</div>
                      <div className="bg-white px-5 py-4 text-sm text-slate-600">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 md:p-8 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-slate-900">Aktivitas</h2>
                <div className="mt-6 space-y-5">
                  {course.activities.map((group) => (
                    <div key={group.title} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <h3 className="text-lg font-bold text-slate-900">{group.title}</h3>
                        <span className="text-sm font-medium text-slate-500">{group.summary}</span>
                      </div>

                      <div className="divide-y divide-slate-200">
                        {group.items.map((item) => {
                          const Icon = typeIconMap[item.type];
                          return (
                            <div key={item.title} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0061ff]">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{item.title}</p>
                                  <p className="text-sm text-slate-500">{item.type}</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium text-slate-500">{item.duration}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 md:p-8 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-slate-900">Tentang Mitra</h2>
                <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xl font-display font-bold text-slate-900">{course.provider}</p>
                      <p className="mt-1 text-sm font-medium text-blue-600">Partner pembelajaran keamanan siber</p>
                    </div>
                    <div className="inline-flex w-fit rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#1f3c88]">
                      Trusted Learning Partner
                    </div>
                  </div>
                  <p className="mt-5 text-slate-600 leading-relaxed">{course.partnerDescription}</p>
                </div>
              </section>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-[32rem] rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-900">Arah belajar</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Preview ini dirancang untuk membantu peserta memahami struktur kelas sebelum mendaftar. Konten akhir dapat berkembang mengikuti kebutuhan program.
                </p>
                <button
                  onClick={() => navigate("/#courses")}
                  className="mt-5 w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600"
                >
                  Lihat kelas lainnya
                </button>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-10">
          <Footer />
        </div>
      </main>
    </div>
  );
}
