export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}

export interface NotificationsListResult {
    notifications: NotificationItem[];
    unreadCount?: number;
}

const NOTIFICATION_TITLE_MAP: Record<string, string> = {
    ikas_edit_actioned: "Permintaan Edit IKAS Diperbarui",
    ikas_edit_requested: "Permintaan Edit IKAS Baru",
    ikas_edit_approved: "Permintaan Edit IKAS Disetujui",
    ikas_edit_rejected: "Permintaan Edit IKAS Ditolak",
    ikas_validated: "Data IKAS Terverifikasi",
    "ikas validated": "Data IKAS Terverifikasi",
    ikas_verified: "Data IKAS Terverifikasi",
    "ikas verified": "Data IKAS Terverifikasi",
    kse_edit_actioned: "Permintaan Edit KSE Diperbarui",
    kse_edit_requested: "Permintaan Edit KSE Baru",
    kse_edit_approved: "Permintaan Edit KSE Disetujui",
    kse_edit_rejected: "Permintaan Edit KSE Ditolak",
};

function toRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function toStringValue(value: unknown, fallback = ""): string {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    return fallback;
}

function toBooleanValue(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "true" || normalized === "1" || normalized === "read";
    }
    return false;
}

function isMachineReadableNotificationTitle(value: string) {
    return /^[a-z0-9]+(?:_[a-z0-9]+)+$/.test(value.trim());
}

function humanizeNotificationTitle(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return "Notifikasi";

    const mappedTitle = NOTIFICATION_TITLE_MAP[normalized];
    if (mappedTitle) return mappedTitle;

    if (!isMachineReadableNotificationTitle(normalized)) {
        return value.trim();
    }

    return normalized
        .split("_")
        .map((segment) => {
            if (segment === "ikas" || segment === "kse") {
                return segment.toUpperCase();
            }

            return segment.charAt(0).toUpperCase() + segment.slice(1);
        })
        .join(" ");
}

function fallbackNotificationId(record: Record<string, unknown>) {
    const source = [
        toStringValue(record.title),
        toStringValue(record.message),
        toStringValue(record.description),
        toStringValue(record.created_at),
        toStringValue(record.createdAt),
    ]
        .filter(Boolean)
        .join("|");

    return source || crypto.randomUUID();
}

export function normalizeNotification(value: unknown): NotificationItem | null {
    const record = toRecord(value);
    if (!record) return null;

    const id =
        toStringValue(record.id) ||
        toStringValue(record.notification_id) ||
        toStringValue(record.uuid) ||
        fallbackNotificationId(record);

    const rawTitle =
        toStringValue(record.title) ||
        toStringValue(record.judul) ||
        toStringValue(record.type) ||
        "Notifikasi";

    const description =
        toStringValue(record.description) ||
        toStringValue(record.message) ||
        toStringValue(record.body) ||
        toStringValue(record.content) ||
        toStringValue(record.deskripsi);

    const timestamp =
        toStringValue(record.timestamp) ||
        toStringValue(record.created_at) ||
        toStringValue(record.createdAt) ||
        toStringValue(record.updated_at) ||
        toStringValue(record.updatedAt) ||
        new Date().toISOString();

    const read =
        toBooleanValue(record.read) ||
        toBooleanValue(record.is_read) ||
        toBooleanValue(record.isRead) ||
        toStringValue(record.status).toLowerCase() === "read";

    return {
        id,
        title: humanizeNotificationTitle(rawTitle),
        description,
        timestamp,
        read,
    };
}

export function normalizeNotificationsResponse(payload: unknown): NotificationItem[] {
    return normalizeNotificationsResult(payload).notifications;
}

export function normalizeNotificationsResult(payload: unknown): NotificationsListResult {
    if (Array.isArray(payload)) {
        return {
            notifications: payload
                .map(normalizeNotification)
                .filter((item): item is NotificationItem => item !== null),
        };
    }

    const record = toRecord(payload);
    if (!record) return { notifications: [] };

    const candidate =
        (Array.isArray(record.data) && record.data) ||
        (Array.isArray(record.notifications) && record.notifications) ||
        (Array.isArray(record.items) && record.items) ||
        [];

    const unreadCountRaw = record.unread_count;
    const unreadCount =
        typeof unreadCountRaw === "number"
            ? unreadCountRaw
            : typeof unreadCountRaw === "string"
                ? Number(unreadCountRaw)
                : undefined;

    return {
        notifications: candidate
            .map(normalizeNotification)
            .filter((item): item is NotificationItem => item !== null),
        unreadCount: Number.isFinite(unreadCount) ? unreadCount : undefined,
    };
}

export function extractNotificationFromEvent(payload: unknown): NotificationItem | null {
    const record = toRecord(payload);
    if (!record) {
        return normalizeNotification(payload);
    }

    const directMessage = toStringValue(record.message).trim().toLowerCase();
    if (
        directMessage === "connected to sse" &&
        record.notification == null &&
        record.data == null &&
        record.payload == null &&
        record.result == null
    ) {
        return null;
    }

    const nested =
        record.notification ??
        record.data ??
        record.payload ??
        record.result;

    return normalizeNotification(nested ?? payload);
}
