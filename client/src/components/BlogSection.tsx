import { useBlogs } from "@/hooks/useBlogs";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

const BLOG_PREVIEW_LIMIT = 5;

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

export function BlogSection() {
  const navigate = useNavigate();
  const { data: blogArticles = [], isLoading, isError } = useBlogs();
  const previewArticles = blogArticles.slice(0, BLOG_PREVIEW_LIMIT);
  const hasMoreArticles = blogArticles.length > BLOG_PREVIEW_LIMIT;

  return (
    <section id="blog" className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_45%,#eef6ff_100%)]" />
        <div className="absolute left-[8%] top-10 h-56 w-56 rounded-full bg-[#595cff]/10 blur-3xl" />
        <div className="absolute right-[12%] top-24 h-64 w-64 rounded-full bg-[#60efff]/16 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#0061ff]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-10">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display font-medium leading-tight text-slate-900 sm:text-3xl lg:text-5xl">
              Artikel untuk memperkuat
              <span className="block text-slate-400">
                pemahaman keamanan siber
              </span>
            </h2>
          </div>
          {hasMoreArticles ? (
            <div className="hidden justify-end lg:flex">
              <button
                type="button"
                onClick={() => navigate("/blog")}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:text-[#0061ff]"
              >
                Show More
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`blog-skeleton-${index}`}
                variants={itemVariants}
                className={`min-h-[300px] overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-[0_20px_80px_rgba(31,60,136,0.08)] sm:p-6 ${
                  index === 0 ? "sm:col-span-2 xl:col-span-2" : ""
                }`}
              >
                <div className="skeleton-stack-lg h-full">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                  </div>
                  <div className="skeleton-stack">
                    <Skeleton className="skeleton-text-sm w-32" />
                    <Skeleton className="skeleton-title" style={{ width: "72%" }} />
                    <SkeletonText lines={3} size="md" />
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : null}

          {!isLoading && isError ? (
            <div className="sm:col-span-2 xl:col-span-3 rounded-[2rem] border border-red-100 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_20px_80px_rgba(31,60,136,0.08)]">
              Artikel belum dapat dimuat dari server saat ini.
            </div>
          ) : null}

          {!isLoading && !isError && previewArticles.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-3 rounded-[2rem] border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_20px_80px_rgba(31,60,136,0.08)]">
              Belum ada berita yang tersedia.
            </div>
          ) : null}

          {!isLoading && !isError
            ? previewArticles.map((article, index) => (
                <motion.article
                  key={article.slug}
                  variants={itemVariants}
                  onClick={() => navigate(`/blog/${article.slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/blog/${article.slug}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(31,60,136,0.10)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#0061ff]/20 hover:shadow-[0_28px_100px_rgba(31,60,136,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff]/40 ${
                    index === 0 ? "sm:col-span-2 xl:col-span-2" : ""
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,239,255,0.14),transparent_42%)]" />
                  </div>

                  <div className="relative border-b border-slate-100 p-5 sm:p-6 md:p-7">
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
                      <h3 className="mt-3 text-xl font-bold leading-tight text-slate-900 sm:text-2xl lg:text-3xl">
                        {article.title}
                      </h3>
                      <p className="mt-4 max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="relative p-5 sm:p-6 md:p-7">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]">
                        <Tag className="h-3 w-3" />
                        ID {article.id}
                      </span>
                      {article.updatedAt ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#0061ff]/15 bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1f3c88]">
                          <Tag className="h-3 w-3" />
                          Diperbarui
                        </span>
                        ) : null}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        Oleh {article.authorLabel}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-[#0061ff] transition-transform duration-500 group-hover:translate-x-1">
                        Baca artikel
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))
            : null}
        </motion.div>

        {hasMoreArticles ? (
          <div className="mt-6 lg:hidden">
            <button
              type="button"
              onClick={() => navigate("/blog")}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:text-[#0061ff]"
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
