import { API_BASE_URL, apiClient } from "@/services/apiClient";
import type {
  EventApiItem,
  EventItem,
  EventRegistrationRequest,
  EventRegistrationResult,
  EventRegistrationSubmitPayload,
} from "@/types/event.types";

export function normalizeList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (!res || typeof res !== "object") return [];

  const record = res as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];

  const firstArray = Object.values(record).find((value) => Array.isArray(value));
  return Array.isArray(firstArray) ? (firstArray as T[]) : [];
}

function sortByNearestEvent(a: EventItem, b: EventItem) {
  return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
}

function sortByLatestPastEvent(a: EventItem, b: EventItem) {
  return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: "\u00A0",
    quot: '"',
  };

  return value.replace(/&(#(?:x[a-f0-9]+|\d+)|[a-z][a-z0-9]+);/gi, (entity, token: string) => {
    if (token.startsWith("#")) {
      const isHex = token[1]?.toLowerCase() === "x";
      const rawNumber = isHex ? token.slice(2) : token.slice(1);
      const codePoint = Number.parseInt(rawNumber, isHex ? 16 : 10);

      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
        return entity;
      }

      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return entity;
      }
    }

    return namedEntities[token.toLowerCase()] ?? entity;
  });
}

export function stripHtml(value: string) {
  let result = "";
  let index = 0;
  let ignoredTag: "script" | "style" | null = null;

  const isWhitespace = (char: string) => /\s/.test(char);

  const findTagEnd = (startIndex: number) => {
    let quote: '"' | "'" | null = null;

    for (let cursor = startIndex + 1; cursor < value.length; cursor += 1) {
      const char = value[cursor];
      if (quote) {
        if (char === quote) quote = null;
        continue;
      }

      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }

      if (char === ">") {
        return cursor;
      }
    }

    return -1;
  };

  const readTag = (tagStart: number, tagEnd: number) => {
    let cursor = tagStart + 1;

    while (cursor < tagEnd && isWhitespace(value[cursor])) cursor += 1;

    let isClosing = false;
    if (value[cursor] === "/") {
      isClosing = true;
      cursor += 1;
      while (cursor < tagEnd && isWhitespace(value[cursor])) cursor += 1;
    }

    const nameStart = cursor;
    while (cursor < tagEnd) {
      const char = value[cursor];
      if (isWhitespace(char) || char === "/" || char === ">") break;
      cursor += 1;
    }

    const name = value.slice(nameStart, cursor).toLowerCase();
    return { isClosing, name };
  };

  while (index < value.length) {
    const char = value[index];

    if (char !== "<") {
      if (!ignoredTag) result += char;
      index += 1;
      continue;
    }

    if (value.startsWith("<!--", index)) {
      const commentEnd = value.indexOf("-->", index + 4);
      index = commentEnd === -1 ? value.length : commentEnd + 3;
      continue;
    }

    const tagEnd = findTagEnd(index);
    if (tagEnd === -1) {
      if (!ignoredTag) result += char;
      index += 1;
      continue;
    }

    const { isClosing, name } = readTag(index, tagEnd);
    if (!name) {
      if (!ignoredTag) result += " ";
      index = tagEnd + 1;
      continue;
    }

    if (ignoredTag) {
      if (isClosing && name === ignoredTag) {
        ignoredTag = null;
      }
      index = tagEnd + 1;
      continue;
    }

    if (!isClosing && (name === "script" || name === "style")) {
      ignoredTag = name;
      index = tagEnd + 1;
      continue;
    }

    result += " ";
    index = tagEnd + 1;
  }

  return result.replace(/\s+/g, " ").trim();
}

function normalizeDescriptionHtml(value: string | undefined) {
  const decoded = decodeHtmlEntities(value?.trim() || "");
  return decoded || "<p>Deskripsi kegiatan akan segera tersedia.</p>";
}

function getPreviewText(value: string) {
  const decoded = decodeHtmlEntities(value);
  const withoutHtml = stripHtml(decoded);
  return withoutHtml || "Deskripsi kegiatan akan segera tersedia.";
}

function shortenDescription(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= 140) return normalized;
  return `${normalized.slice(0, 137).trimEnd()}...`;
}

function toStatusLabel(status: string, isPast: boolean) {
  if (isPast) return "Selesai";
  if (!status) return "Akan Datang";

  const normalized = status.replaceAll("_", " ").trim();
  if (!normalized) return "Akan Datang";

  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function resolveEventStatus(status: string | undefined, eventDate: string) {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (["past", "selesai", "done", "completed", "closed", "berakhir"].includes(normalized)) {
    return "past" as const;
  }

  if (["upcoming", "active", "open", "published", "scheduled", "akan datang"].includes(normalized)) {
    return "upcoming" as const;
  }

  const eventTime = new Date(eventDate).getTime();
  if (Number.isFinite(eventTime) && eventTime < Date.now()) {
    return "past" as const;
  }

  return "upcoming" as const;
}

function mapEventItem(item: EventApiItem): EventItem {
  const title = item.judul?.trim() || "Kegiatan";
  const fullDescription = normalizeDescriptionHtml(item.deskripsi);
  const eventDate = item.tanggal || item.created_at || new Date().toISOString();
  const status = resolveEventStatus(item.status, eventDate);
  const numericId = typeof item.id === "number" ? item.id : Number(item.id);
  const fallbackSlug = `${String(item.id)}-${slugify(title || "kegiatan")}`;
  const slug = slugify(item.slug?.trim() || "") || fallbackSlug;

  return {
    id: String(item.id),
    numericId: Number.isFinite(numericId) ? numericId : undefined,
    slug,
    title,
    shortDescription: shortenDescription(getPreviewText(fullDescription)),
    fullDescription,
    eventDate,
    location: item.lokasi?.trim() || "Lokasi akan diumumkan",
    coverLabel: status === "past" ? "Dokumentasi Event" : "Event Terbaru",
    status,
    statusLabel: toStatusLabel(item.status ?? "", status === "past"),
    backendStatus: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

async function getAllEvents() {
  const res = await apiClient.get<unknown>("/api/kegiatan");
  return normalizeList<EventApiItem>(res).map(mapEventItem);
}

function getResponseMessage(res: unknown) {
  if (!res || typeof res !== "object") return "";
  const record = res as Record<string, unknown>;
  return typeof record.message === "string" ? record.message : "";
}

function getNestedRecord(value: unknown, key: string) {
  if (!value || typeof value !== "object") return null;
  const nested = (value as Record<string, unknown>)[key];
  return nested && typeof nested === "object" ? (nested as Record<string, unknown>) : null;
}

function getStringValue(record: Record<string, unknown> | null, key: string) {
  if (!record) return undefined;
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function resolveDownloadUrl(downloadUrl?: string) {
  if (!downloadUrl) return undefined;
  if (/^https?:\/\//i.test(downloadUrl)) return downloadUrl;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${downloadUrl.startsWith("/") ? downloadUrl : `/${downloadUrl}`}`;
  }
  return downloadUrl;
}

function resolveQrImageSource(qrValue?: string) {
  if (!qrValue) return undefined;

  const normalized = qrValue.trim().replace(/\s+/g, "");
  if (!normalized) return undefined;

  if (normalized.startsWith("data:image/")) {
    return normalized;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return API_BASE_URL
      ? `${API_BASE_URL}${normalized}`
      : normalized;
  }

  if (/^[A-Za-z0-9+/=]+$/.test(normalized)) {
    return `data:image/png;base64,${normalized}`;
  }

  return normalized;
}

export const eventsService = {
  async getLandingPreview() {
    const events = await getAllEvents();

    const upcoming = events
      .filter((event) => event.status === "upcoming")
      .sort(sortByNearestEvent)
      .slice(0, 3);

    const past = events
      .filter((event) => event.status === "past")
      .sort(sortByLatestPastEvent)
      .slice(0, 3);

    return { upcoming, past };
  },

  async getUpcomingEvents() {
    const events = await getAllEvents();
    return events.filter((event) => event.status === "upcoming").sort(sortByNearestEvent);
  },

  async getEventDetail(eventSlugOrId: string) {
    const events = await getAllEvents();
    const event = events.find((item) => item.slug === eventSlugOrId || item.id === eventSlugOrId);
    if (!event) {
      throw new Error("Event tidak ditemukan.");
    }

    return event;
  },

  async registerEvent(eventId: string, payload: EventRegistrationSubmitPayload): Promise<EventRegistrationResult> {
    const event = await eventsService.getEventDetail(eventId);
    const { turnstileToken, ...attendeePayload } = payload;
    const requestPayload: EventRegistrationRequest = {
      email: attendeePayload.email,
      jabatan: attendeePayload.position,
      nama: attendeePayload.fullName,
      no_hp: attendeePayload.phoneNumber,
      perusahaan: attendeePayload.company,
      sektor: attendeePayload.industrySector,
      "cf-turnstile-response": turnstileToken,
      turnstile_token: turnstileToken,
      turnstileToken,
      turnstiletoken: turnstileToken,
    };
    const res = await apiClient.post<unknown>(`/api/kegiatan/${eventId}/registrasi`, requestPayload);
    const rootRecord = res && typeof res === "object" ? (res as Record<string, unknown>) : null;
    const dataRecord = getNestedRecord(rootRecord, "data");
    const qrPayloadRecord = getNestedRecord(dataRecord, "qr_payload") ?? getNestedRecord(rootRecord, "qr_payload");
    const qrToken =
      getStringValue(dataRecord, "qr_token") ??
      getStringValue(rootRecord, "qr_token");
    const qrCodeBase64 =
      resolveQrImageSource(
        getStringValue(qrPayloadRecord, "qr_code_base64") ??
        getStringValue(dataRecord, "qr_code_base64") ??
        getStringValue(rootRecord, "qr_code_base64"),
      );
    const downloadUrl = resolveDownloadUrl(
      getStringValue(qrPayloadRecord, "download_url") ??
      getStringValue(dataRecord, "download_url") ??
      getStringValue(rootRecord, "download_url"),
    );

    return {
      message: getResponseMessage(res) || "Registrasi berhasil dikirim.",
      registeredAt: new Date().toISOString(),
      attendee: attendeePayload,
      event: {
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        location: event.location,
        statusLabel: event.statusLabel,
      },
      downloadUrl,
      qrCodeBase64,
      qrToken,
    };
  },
};
