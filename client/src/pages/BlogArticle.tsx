import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useBlogDetail, useBlogs } from "@/hooks/useBlogs";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Tag,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function BlogArticle() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useBlogDetail(slug);
  const { data: blogs = [] } = useBlogs();
  const relatedArticles = blogs.filter((item) => item.slug !== slug).slice(0, 2);
  useScrollToTop(slug);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (!isLoading && isError) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_45%,#eef6ff_100%)]" />
        <div className="absolute left-[5%] top-10 h-72 w-72 rounded-full bg-[#595cff]/10 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-80 w-80 rounded-full bg-[#60efff]/12 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#0061ff]/8 blur-3xl" />
      </div>

      <Navbar mode="preview" />

      <main className="relative z-10 pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar blog
          </button>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-[0_24px_100px_rgba(31,60,136,0.10)] backdrop-blur-xl"
          >
            <div className="p-6 md:p-10">
              {isLoading || !article ? (
                <div className="skeleton-stack-lg min-h-[280px]">
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full max-w-5xl rounded-2xl" />
                  <Skeleton className="h-12 w-3/4 rounded-2xl" />
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-24 rounded-[1.5rem]" />
                    <Skeleton className="h-24 rounded-[1.5rem]" />
                    <Skeleton className="h-24 rounded-[1.5rem]" />
                  </div>
                </div>
              ) : (
                <div className="max-w-6xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {article.publishedAt}
                    </span>
                  </div>
                  <h1 className="mt-6 max-w-5xl text-3xl font-display font-semibold tracking-tight text-slate-900 leading-[1.05] md:text-5xl xl:text-6xl">
                    {article.title}
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                    {article.excerpt}
                  </p>
                  <div className="mt-8 grid gap-4 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Penulis</p>
                      <p className="mt-3 text-base font-semibold text-slate-900">{article.authorLabel}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Referensi</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          <Tag className="h-3 w-3 text-[#0061ff]" />
                          ID {article.id}
                        </span>
                        {article.updatedAt ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                            <Tag className="h-3 w-3 text-[#0061ff]" />
                            Sudah diperbarui
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 md:p-8 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                {isLoading || !article ? (
                  <div className="skeleton-stack">
                    <Skeleton className="h-5 w-40 rounded-full" />
                    <SkeletonText lines={4} size="md" />
                  </div>
                ) : (
                  <div
                    className="prose prose-slate max-w-none text-base leading-relaxed prose-headings:font-display prose-headings:text-slate-900 prose-p:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: article.descriptionHtml }}
                  />
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/60 bg-white/85 p-6 shadow-[0_20px_80px_rgba(31,60,136,0.08)] backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-900">Artikel terkait</h3>
                <div className="mt-5 space-y-4">
                  {relatedArticles.length === 0 && !isLoading ? (
                    <p className="text-sm text-slate-600">Belum ada artikel terkait lainnya.</p>
                  ) : null}

                  {relatedArticles.map((item) => (
                    <button
                      key={item.slug}
                      onClick={() => navigate(`/blog/${item.slug}`)}
                      className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-[#0061ff]/20 hover:bg-white"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {item.category}
                      </p>
                      <p className="mt-2 text-base font-bold leading-snug text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.excerpt}
                      </p>
                    </button>
                  ))}
                </div>
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
