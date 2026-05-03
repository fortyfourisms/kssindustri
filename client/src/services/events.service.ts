import { apiClient } from "@/services/apiClient";
import type {
  EventApiItem,
  EventItem,
  EventRegistrationPayload,
  EventRegistrationRequest,
  EventRegistrationResult,
} from "@/types/event.types";

function normalizeList<T>(res: unknown): T[] {
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
  const fullDescription = item.deskripsi?.trim() || "Deskripsi kegiatan akan segera tersedia.";
  const eventDate = item.tanggal || item.created_at || new Date().toISOString();
  const status = resolveEventStatus(item.status, eventDate);
  const numericId = typeof item.id === "number" ? item.id : Number(item.id);

  return {
    id: String(item.id),
    numericId: Number.isFinite(numericId) ? numericId : undefined,
    title,
    shortDescription: shortenDescription(fullDescription),
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

  async getEventDetail(eventId: string) {
    const events = await getAllEvents();
    const event = events.find((item) => item.id === eventId);
    if (!event) {
      throw new Error("Event tidak ditemukan.");
    }

    return event;
  },

  async registerEvent(eventId: string, payload: EventRegistrationPayload): Promise<EventRegistrationResult> {
    const event = await eventsService.getEventDetail(eventId);
    const requestPayload: EventRegistrationRequest = {
      email: payload.email,
      jabatan: payload.position,
      nama: payload.fullName,
      no_hp: payload.phoneNumber,
      perusahaan: payload.company,
      sektor: payload.industrySector,
    };
    const res = await apiClient.post<unknown>(`/api/kegiatan/${eventId}/registrasi`, requestPayload);
    return {
      message: getResponseMessage(res) || "Registrasi berhasil dikirim.",
      registeredAt: new Date().toISOString(),
      attendee: payload,
      event: {
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        location: event.location,
        statusLabel: event.statusLabel,
      },
    };
  },
};
