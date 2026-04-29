import { useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/apiClient";
import { notificationsService } from "@/services/notifications.service";
import { useNotificationsStore } from "@/stores/notifications.store";

async function attemptSseRefresh() {
    try {
        await fetch(`${API_BASE_URL}/api/refresh`, {
            method: "POST",
            credentials: "include",
        });
    } catch {
        // Silent: SSE reconnect can still succeed if session is valid.
    }
}

function safeParseEventData(data: string) {
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
}

export function useNotifications() {
    const notifications = useNotificationsStore((state) => state.notifications);
    const unreadCount = useNotificationsStore((state) => state.unreadCount);
    const isConnected = useNotificationsStore((state) => state.isConnected);
    const isLoading = useNotificationsStore((state) => state.isLoading);
    const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
    const markAsRead = useNotificationsStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

    return {
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}

export function useNotificationStream(enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const store = useNotificationsStore.getState();
        void store.fetchNotifications();

        let eventSource: EventSource | null = null;
        let reconnectTimer: number | null = null;
        let reconnectAttempt = 0;
        let closed = false;

        const clearReconnect = () => {
            if (reconnectTimer !== null) {
                window.clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        };

        const scheduleReconnect = () => {
            if (closed || reconnectTimer !== null) return;

            const delay = Math.min(1000 * 2 ** reconnectAttempt, 10000);
            reconnectAttempt += 1;

            reconnectTimer = window.setTimeout(async () => {
                reconnectTimer = null;
                await attemptSseRefresh();
                connect();
            }, delay);
        };

        const handleIncoming = (rawPayload: unknown) => {
            const notification = notificationsService.parseIncomingEvent(rawPayload);
            if (!notification) return;

            const isNew = useNotificationsStore.getState().addNotification(notification);

            if (isNew && !notification.read) {
                toast(notification.title, {
                    description: notification.description || "Anda menerima notifikasi baru.",
                });
            }
        };

        const connect = () => {
            if (closed) return;

            eventSource?.close();
            useNotificationsStore.getState().setConnected(false);

            eventSource = new EventSource(`${API_BASE_URL}/api/events`, {
                withCredentials: true,
            });

            eventSource.onopen = () => {
                reconnectAttempt = 0;
                useNotificationsStore.getState().setConnected(true);
            };

            eventSource.onmessage = (event) => {
                handleIncoming(safeParseEventData(event.data));
            };

            eventSource.addEventListener("notification", (event) => {
                const messageEvent = event as MessageEvent<string>;
                handleIncoming(safeParseEventData(messageEvent.data));
            });

            eventSource.onerror = () => {
                useNotificationsStore.getState().setConnected(false);
                eventSource?.close();
                scheduleReconnect();
            };
        };

        connect();

        return () => {
            closed = true;
            clearReconnect();
            useNotificationsStore.getState().setConnected(false);
            eventSource?.close();
        };
    }, [enabled]);
}
