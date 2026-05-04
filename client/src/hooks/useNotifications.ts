import { useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/apiClient";
import { authService } from "@/services/auth.service";
import { notificationsService } from "@/services/notifications.service";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationsStore } from "@/stores/notifications.store";

const SSE_DELAY_MIN_MS = 5000;
const SSE_DELAY_MAX_MS = 10000;

async function attemptSseRefresh() {
    try {
        await authService.refresh();
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

function getSseDelayMs() {
    const range = SSE_DELAY_MAX_MS - SSE_DELAY_MIN_MS;
    return SSE_DELAY_MIN_MS + Math.floor(Math.random() * (range + 1));
}

export function useNotifications() {
    const notifications = useNotificationsStore((state) => state.notifications);
    const unreadCount = useNotificationsStore((state) => state.unreadCount);
    const isConnected = useNotificationsStore((state) => state.isConnected);
    const isLoading = useNotificationsStore((state) => state.isLoading);
    const isAvailable = useNotificationsStore((state) => state.isAvailable);
    const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
    const markAsRead = useNotificationsStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

    return {
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        isAvailable,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}

export function useNotificationStream(enabled = true) {
    const authenticated = useAuthStore((state) => state.authenticated);
    const currentUser = useAuthStore((state) => state.currentUser);

    useEffect(() => {
        if (!enabled || !authenticated || !currentUser) return;

        let eventSource: EventSource | null = null;
        let reconnectTimer: number | null = null;
        let initialConnectTimer: number | null = null;
        let initialFetchTimer: number | null = null;
        let reconnectAttempt = 0;
        let closed = false;

        const clearTimer = (timerId: number | null) => {
            if (timerId !== null) {
                window.clearTimeout(timerId);
            }
        };

        const clearAllTimers = () => {
            clearTimer(reconnectTimer);
            clearTimer(initialConnectTimer);
            clearTimer(initialFetchTimer);
            reconnectTimer = null;
            initialConnectTimer = null;
            initialFetchTimer = null;
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

                if (closed || reconnectTimer !== null || !useNotificationsStore.getState().isAvailable) return;

                const delay = getSseDelayMs();
                reconnectAttempt += 1;

                reconnectTimer = window.setTimeout(async () => {
                    reconnectTimer = null;
                    await attemptSseRefresh();
                    connect();
                }, delay);
            };
        };

        initialFetchTimer = window.setTimeout(() => {
            initialFetchTimer = null;
            void (async () => {
                const canConnect = await useNotificationsStore.getState().fetchNotifications();
                if (!canConnect || closed) return;

                initialConnectTimer = window.setTimeout(() => {
                    initialConnectTimer = null;
                    connect();
                }, getSseDelayMs());
            })();
        }, getSseDelayMs());

        return () => {
            closed = true;
            clearAllTimers();
            useNotificationsStore.getState().setConnected(false);
            eventSource?.close();
        };
    }, [authenticated, currentUser, enabled]);
}
