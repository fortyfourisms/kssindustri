import { create } from "zustand";
import { notificationsService } from "@/services/notifications.service";
import type { NotificationItem } from "@/types/notification.types";

const NOTIFICATION_LIMIT = 20;

function sortNotifications(items: NotificationItem[]) {
    return [...items].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

function limitNotifications(items: NotificationItem[]) {
    return sortNotifications(items).slice(0, NOTIFICATION_LIMIT);
}

function mergeNotifications(
    current: NotificationItem[],
    incoming: NotificationItem[]
) {
    const map = new Map<string, NotificationItem>();

    [...current, ...incoming].forEach((item) => {
        const existing = map.get(item.id);
        map.set(item.id, existing ? { ...existing, ...item } : item);
    });

    return limitNotifications(Array.from(map.values()));
}

interface NotificationsState {
    notifications: NotificationItem[];
    unreadCount: number;
    isConnected: boolean;
    isLoading: boolean;
    hasLoaded: boolean;
    isAvailable: boolean;
    setConnected: (connected: boolean) => void;
    fetchNotifications: () => Promise<boolean>;
    addNotification: (notification: NotificationItem) => boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: false,
    hasLoaded: false,
    isAvailable: true,

    setConnected: (connected) => set({ isConnected: connected }),

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const { notifications, unreadCount } = await notificationsService.getAll();
            const limited = limitNotifications(notifications);

            set({
                notifications: limited,
                unreadCount:
                    typeof unreadCount === "number"
                        ? unreadCount
                        : limited.filter((item) => !item.read).length,
                isLoading: false,
                hasLoaded: true,
                isAvailable: true,
            });
            return true;
        } catch (error) {
            const status = typeof error === "object" && error !== null && "status" in error
                ? Number((error as { status?: unknown }).status)
                : undefined;

            if (status === 403) {
                set({
                    notifications: [],
                    unreadCount: 0,
                    isConnected: false,
                    isLoading: false,
                    hasLoaded: true,
                    isAvailable: false,
                });
                return false;
            }

            set({ isLoading: false });
            return true;
        }
    },

    addNotification: (notification) => {
        const current = get().notifications;
        const alreadyExists = current.some((item) => item.id === notification.id);
        const next = mergeNotifications(current, [notification]);

        set({
            notifications: next,
            unreadCount: next.filter((item) => !item.read).length,
        });

        return !alreadyExists;
    },

    markAsRead: async (id) => {
        const target = get().notifications.find((item) => item.id === id);
        if (!target || target.read) return;

        await notificationsService.markAsRead(id);

        const next = get().notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item
        );

        set({
            notifications: next,
            unreadCount: next.filter((item) => !item.read).length,
        });
    },

    markAllAsRead: async () => {
        if (get().unreadCount === 0) return;

        await notificationsService.markAllAsRead();

        const next = get().notifications.map((item) => ({ ...item, read: true }));
        set({
            notifications: next,
            unreadCount: 0,
        });
    },
}));
