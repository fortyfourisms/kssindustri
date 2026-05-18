import { apiClient } from "@/services/apiClient";
import { decodeHtmlEntities, normalizeList, stripHtml } from "@/services/events.service";
import type { BlogApiItem, BlogItem } from "@/types/blog.types";

const BLOG_CATEGORY_LABEL = "Berita";
const BLOG_COVER_LABEL = "Insight Terbaru";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function shortenText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatPublishedAt(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function toDescriptionHtml(value?: string | null) {
  const raw = decodeHtmlEntities(value?.trim() || "");
  if (!raw) {
    return "<p>Konten berita akan segera tersedia.</p>";
  }

  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }

  return raw
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function toExcerpt(descriptionHtml: string) {
  const plainText = stripHtml(descriptionHtml);
  return plainText
    ? shortenText(plainText, 160)
    : "Ringkasan berita akan segera tersedia.";
}

function toAuthorLabel(authorId?: number) {
  if (!authorId) return "Admin";
  return `Author #${authorId}`;
}

function normalizeTags(tags?: string[] | null) {
  if (!Array.isArray(tags)) return [];

  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function createLegacySlug(id: string, title: string) {
  const baseSlug = slugify(title) || "berita";
  return `${id}-${baseSlug}`;
}

function mapBlogItem(item: BlogApiItem): BlogItem {
  const title = item.judul?.trim() || "Berita tanpa judul";
  const descriptionHtml = toDescriptionHtml(item.deskripsi);
  const numericId = typeof item.id === "number" ? item.id : Number(item.id);
  const authorId = typeof item.author_id === "number" ? item.author_id : Number(item.author_id);
  const baseSlug = slugify(title) || "berita";

  return {
    id: String(item.id),
    numericId: Number.isFinite(numericId) ? numericId : undefined,
    slug: baseSlug,
    title,
    excerpt: toExcerpt(descriptionHtml),
    descriptionHtml,
    publishedAt: formatPublishedAt(item.created_at),
    authorId: Number.isFinite(authorId) ? authorId : undefined,
    authorLabel: toAuthorLabel(Number.isFinite(authorId) ? authorId : undefined),
    tags: normalizeTags(item.tags),
    category: BLOG_CATEGORY_LABEL,
    coverLabel: BLOG_COVER_LABEL,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function ensureUniqueSlugs(items: BlogItem[]) {
  const slugCount = new Map<string, number>();

  return items.map((item) => {
    const currentCount = slugCount.get(item.slug) ?? 0;
    slugCount.set(item.slug, currentCount + 1);

    if (currentCount === 0) {
      return item;
    }

    return {
      ...item,
      slug: `${item.slug}-${currentCount + 1}`,
    };
  });
}

async function getAllBlogs() {
  const res = await apiClient.get<unknown>("/api/berita");
  return ensureUniqueSlugs(
    normalizeList<BlogApiItem>(res)
      .map(mapBlogItem)
  )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
}

export const blogsService = {
  async getBlogs() {
    return getAllBlogs();
  },

  async getBlogDetail(slug: string) {
    const blogs = await getAllBlogs();
    const article = blogs.find((item) => item.slug === slug || createLegacySlug(item.id, item.title) === slug);

    if (!article) {
      throw new Error("Berita tidak ditemukan.");
    }

    return article;
  },
};
