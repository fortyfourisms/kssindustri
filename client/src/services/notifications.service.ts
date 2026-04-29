import { apiClient } from "@/services/apiClient";
import {
    extractNotificationFromEvent,
    normalizeNotificationsResult,
} from "@/types/notification.types";

export const notificationsService = {
    async getAll() {
        const response = await apiClient.get<unknown>("/api/notifications");
        return normalizeNotificationsResult(response);
    },

    async markAsRead(id: string) {
        await apiClient.patch(`/api/notifications/${id}/read`, {});
    },

    async markAllAsRead() {
        await apiClient.patch("/api/notifications/read-all", {});
    },

    parseIncomingEvent(payload: unknown) {
        return extractNotificationFromEvent(payload);
    },
};
