import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useBlogs } from "@/hooks/useBlogs";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function Blogs() {
  const navigate = useNavigate();
  const { data: blogArticles = [], isLoading, isError } = useBlogs();
  useScrollToTop();

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Navbar mode="preview" />

      <main className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eff6ff_100%)]" />
          <div className="absolute left-[12%] top-16 h-60 w-60 rounded-full bg-[#0061ff]/10 blur-3xl" />
          <div className="absolute right-[8%] top-24 h-72 w-72 rounded-full bg-[#60efff]/16 blur-3xl" />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="mt-4 text-4xl font-display font-medium leading-tight tracking-tight text-slate-900 md:text-6xl">
              Insight keamanan siber untuk
              <span className="block bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#60efff] bg-clip-text text-transparent">
                awareness, governance, dan resilience
              </span>
            </h1>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`blog-list-skeleton-${index}`}
                    className="min-h-[300px] overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_20px_80px_rgba(31,60,136,0.08)]"
                  >
                    <div className="skeleton-stack-lg h-full">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-28 rounded-full" />
                      </div>
                      <div className="skeleton-stack">
                        <Skeleton className="skeleton-text-sm w-28" />
                        <Skeleton className="skeleton-title" style={{ width: "72%" }} />
                        <SkeletonText lines={3} size="md" />
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))
              : null}

            {!isLoading && isError ? (
              <div className="xl:col-span-3 rounded-[2rem] border border-red-100 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_20px_80px_rgba(31,60,136,0.08)]">
                Data berita belum dapat dimuat dari server.
              </div>
            ) : null}

            {!isLoading && !isError && blogArticles.length === 0 ? (
              <div className="xl:col-span-3 rounded-[2rem] border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_20px_80px_rgba(31,60,136,0.08)]">
                Belum ada berita yang tersedia.
              </div>
            ) : null}

            {!isLoading && !isError
              ? blogArticles.map((article) => (
                  <article
                    key={article.slug}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(31,60,136,0.10)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_100px_rgba(31,60,136,0.16)]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,239,255,0.12),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative border-b border-slate-100 p-6 md:p-7">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                          {article.category}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5 text-[#0061ff]" />
                          {article.publishedAt}
                        </span>
                      </div>

                      <div className="mt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                          {article.coverLabel}
                        </p>
                        <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                          {article.title}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-slate-600">{article.excerpt}</p>
                      </div>
                    </div>

                    <div className="relative p-6 md:p-7">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.length > 0
                          ? article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={`${article.slug}-${tag}`}
                                className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]"
                              >
                                <Tag className="h-3 w-3" />
                                {tag}
                              </span>
                            ))
                          : (
                              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                                <Tag className="h-3 w-3" />
                                Belum ada tag
                              </span>
                            )}
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-slate-500">Oleh {article.authorLabel}</p>
                        <button
                          type="button"
                          onClick={() => navigate(`/blog/${article.slug}`)}
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#0061ff] transition-transform duration-300 group-hover:translate-x-1"
                        >
                          Baca artikel
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              : null}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
