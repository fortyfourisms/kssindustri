import { API_BASE_URL, apiClient } from "@/services/apiClient";
import { decodeHtmlEntities, normalizeList, stripHtml } from "@/services/events.service";
import type { PublicCourseApiItem, PublicCourseItem } from "@/types/public-course.types";

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

function resolveThumbnailUrl(thumbnail?: string | null) {
  const normalized = thumbnail?.trim();
  if (!normalized) return undefined;
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("/")) {
    return API_BASE_URL ? `${API_BASE_URL}${normalized}` : normalized;
  }
  return API_BASE_URL ? `${API_BASE_URL}/${normalized}` : normalized;
}

function mapCourseItem(item: PublicCourseApiItem): PublicCourseItem {
  const title = item.judul?.trim() || "Kelas tanpa judul";
  const description = decodeHtmlEntities(item.deskripsi?.trim() || "").replace(/\s+/g, " ").trim();
  const plainDescription = stripHtml(description);
  const normalizedDescription = plainDescription || "Deskripsi kelas akan segera tersedia.";
  const numericId = typeof item.id === "number" ? item.id : Number(item.id);

  return {
    id: String(item.id),
    numericId: Number.isFinite(numericId) ? numericId : undefined,
    slug: `${String(item.id)}-${slugify(title || "kelas")}`,
    title,
    description: normalizedDescription,
    summary: shortenText(normalizedDescription, 160),
    thumbnailUrl: resolveThumbnailUrl(item.thumbnail),
    category: item.kategori?.trim() || "Kelas Siber",
    durationLabel: item.durasi_jp ? `${item.durasi_jp} JP` : "Durasi belum tersedia",
    provider: item.penyelenggara?.trim() || "Penyelenggara belum tersedia",
    targetParticipant: item.target_peserta?.trim() || "Terbuka untuk peserta umum.",
    registrationRequirements: item.syarat_pendaftaran?.trim() || "Informasi syarat pendaftaran akan segera tersedia.",
    generalInfo: item.informasi_umum?.trim() || normalizedDescription,
    status: String(item.status ?? "").trim().toLowerCase(),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

async function getAllCourses() {
  const res = await apiClient.get<unknown>("/api/public/kelas");
  return normalizeList<PublicCourseApiItem>(res)
    .map(mapCourseItem)
    .filter((course) => course.status !== "draft")
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
}

export const publicCoursesService = {
  async getCourses() {
    return getAllCourses();
  },

  async getCourseBySlug(slug: string) {
    const courses = await getAllCourses();
    const course = courses.find((item) => item.slug === slug);

    if (!course) {
      throw new Error("Kelas tidak ditemukan.");
    }

    return course;
  },
};
