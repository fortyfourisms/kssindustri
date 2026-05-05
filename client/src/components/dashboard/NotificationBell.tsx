import { Bell, CheckCheck, Wifi, WifiOff } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

function formatNotificationTime(timestamp: string) {
    try {
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(timestamp));
    } catch {
        return timestamp;
    }
}

export function NotificationBell() {
    const {
        notifications,
        unreadCount,
        isConnected,
        isAvailable,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="relative flex h-10 w-10 items-center justify-center rounded-2xl border transition"
                    style={{
                        borderColor: "var(--dashboard-border)",
                        background: "var(--dashboard-surface)",
                        color: "var(--dashboard-text-soft)",
                    }}
                    aria-label="Buka notifikasi"
                >
                    <Bell className="h-5 w-5" />
                    <span
                        className={cn(
                            "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border"
                        )}
                        style={{
                            borderColor: "var(--dashboard-surface-strong)",
                            background: isConnected ? "var(--dashboard-status-success)" : "var(--dashboard-status-offline)",
                        }}
                    />
                    {unreadCount > 0 && (
                        <span
                            className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-sm"
                            style={{
                                background: "var(--dashboard-notification-counter-bg)",
                                color: "var(--dashboard-notification-counter-fg)",
                            }}
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[360px] rounded-3xl border p-0 shadow-2xl"
                style={{
                    borderColor: "var(--dashboard-border)",
                    background: "var(--dashboard-surface-strong)",
                    boxShadow: "var(--dashboard-card-shadow)",
                }}
            >
                <div className="flex items-start justify-between gap-3 border-b px-4 py-4" style={{ borderColor: "var(--dashboard-border)" }}>
                    <div>
                        <p className="text-sm font-bold" style={{ color: "var(--dashboard-text)" }}>Notifikasi</p>
                        <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                            {isConnected ? (
                                <Wifi className="h-3.5 w-3.5" style={{ color: "var(--dashboard-status-success)" }} />
                            ) : (
                                <WifiOff className="h-3.5 w-3.5" style={{ color: "var(--dashboard-status-warning)" }} />
                            )}
                            <span>{isConnected ? "Realtime aktif" : "Menghubungkan ulang..."}</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto rounded-xl px-2 py-1 text-xs hover:bg-[var(--dashboard-action-soft-hover)] hover:text-[var(--dashboard-action-soft-fg-strong)]"
                        style={{ color: "var(--dashboard-action-soft-fg)" }}
                        onClick={() => void markAllAsRead()}
                        disabled={unreadCount === 0 || !isAvailable}
                    >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Tandai semua
                    </Button>
                </div>

                <ScrollArea className="max-h-[420px]">
                    <div className="p-2">
                        {!isAvailable ? (
                            <div
                                className="rounded-2xl border border-dashed px-4 py-8 text-center"
                                style={{
                                    background: "var(--dashboard-notification-empty-bg)",
                                    borderColor: "var(--dashboard-notification-empty-border)",
                                }}
                            >
                                <p className="text-sm font-semibold" style={{ color: "var(--dashboard-text-soft)" }}>Notifikasi belum tersedia</p>
                                <p className="mt-1 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                                    Akun ini belum memiliki akses ke endpoint notifikasi.
                                </p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div
                                className="rounded-2xl border border-dashed px-4 py-8 text-center"
                                style={{
                                    background: "var(--dashboard-notification-empty-bg)",
                                    borderColor: "var(--dashboard-notification-empty-border)",
                                }}
                            >
                                <p className="text-sm font-semibold" style={{ color: "var(--dashboard-text-soft)" }}>Belum ada notifikasi</p>
                                <p className="mt-1 text-xs" style={{ color: "var(--dashboard-text-muted)" }}>
                                    Notifikasi terbaru akan muncul di sini secara realtime.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => void markAsRead(notification.id)}
                                    className={cn(
                                        "mb-2 w-full rounded-2xl border px-4 py-3 text-left transition last:mb-0",
                                        notification.read
                                            ? "border-[var(--dashboard-notification-read-border)] bg-[var(--dashboard-notification-read-bg)] hover:bg-[var(--dashboard-notification-read-hover)]"
                                            : "border-[var(--dashboard-notification-unread-border)] bg-[var(--dashboard-notification-unread-bg)] hover:bg-[var(--dashboard-notification-unread-hover)]"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold" style={{ color: "var(--dashboard-text)" }}>
                                                {notification.title}
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-xs leading-5" style={{ color: "var(--dashboard-text-soft)" }}>
                                                {notification.description || "Tidak ada deskripsi."}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={notification.read ? "outline" : "secondary"}
                                            className={cn(
                                                "shrink-0 rounded-full px-2 py-0.5 text-[10px]",
                                                notification.read
                                                    ? "border-[var(--dashboard-notification-badge-read-border)] bg-[var(--dashboard-notification-badge-read-bg)] text-[var(--dashboard-notification-badge-read-fg)]"
                                                    : "border-[var(--dashboard-notification-badge-unread-border)] bg-[var(--dashboard-notification-badge-unread-bg)] text-[var(--dashboard-notification-badge-unread-fg)]"
                                            )}
                                        >
                                            {notification.read ? "Read" : "Unread"}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-[11px]" style={{ color: "var(--dashboard-text-muted)" }}>
                                        {formatNotificationTime(notification.timestamp)}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
