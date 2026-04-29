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
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Buka notifikasi"
                >
                    <Bell className="h-5 w-5" />
                    <span
                        className={cn(
                            "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-white",
                            isConnected ? "bg-emerald-500" : "bg-slate-300"
                        )}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[360px] rounded-3xl border border-slate-200/80 bg-white/95 p-0 shadow-2xl shadow-slate-900/10"
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
                    <div>
                        <p className="text-sm font-bold text-slate-900">Notifikasi</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            {isConnected ? (
                                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                                <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span>{isConnected ? "Realtime aktif" : "Menghubungkan ulang..."}</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto rounded-xl px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => void markAllAsRead()}
                        disabled={unreadCount === 0}
                    >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Tandai semua
                    </Button>
                </div>

                <ScrollArea className="max-h-[420px]">
                    <div className="p-2">
                        {notifications.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
                                <p className="text-sm font-semibold text-slate-700">Belum ada notifikasi</p>
                                <p className="mt-1 text-xs text-slate-500">
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
                                            ? "border-slate-200 bg-white hover:bg-slate-50"
                                            : "border-blue-200 bg-blue-50/80 hover:bg-blue-50"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {notification.title}
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                                                {notification.description || "Tidak ada deskripsi."}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={notification.read ? "outline" : "secondary"}
                                            className={cn(
                                                "shrink-0 rounded-full px-2 py-0.5 text-[10px]",
                                                notification.read
                                                    ? "border-slate-200 text-slate-500"
                                                    : "border-blue-200 bg-blue-100 text-blue-700"
                                            )}
                                        >
                                            {notification.read ? "Read" : "Unread"}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-400">
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
