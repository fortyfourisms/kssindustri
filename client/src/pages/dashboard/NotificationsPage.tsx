import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Bell,
    CheckCheck,
    Filter,
    Loader2,
    RefreshCw,
    Search,
    Shield,
    UserCircle2,
    Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { cn, getMediaUrl } from "@/lib/utils";
import { notificationsService } from "@/services/notifications.service";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationItem } from "@/types/notification.types";

type ReadFilter = "all" | "unread" | "read";

function sortNotifications(items: NotificationItem[]) {
    return [...items].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

function formatNotificationTime(timestamp: string) {
    try {
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(timestamp));
    } catch {
        return timestamp;
    }
}

function getRelativeTime(timestamp: string) {
    try {
        const now = Date.now();
        const time = new Date(timestamp).getTime();
        const diffMinutes = Math.round((time - now) / (1000 * 60));
        const formatter = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

        if (Math.abs(diffMinutes) < 60) {
            return formatter.format(diffMinutes, "minute");
        }

        const diffHours = Math.round(diffMinutes / 60);
        if (Math.abs(diffHours) < 24) {
            return formatter.format(diffHours, "hour");
        }

        const diffDays = Math.round(diffHours / 24);
        return formatter.format(diffDays, "day");
    } catch {
        return "";
    }
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function NotificationActorAvatar({
    actorAvatar,
    actorName,
    className,
}: {
    actorAvatar: string;
    actorName: string;
    className?: string;
}) {
    if (actorAvatar) {
        return (
            <img
                src={getMediaUrl(actorAvatar)}
                alt={actorName}
                className={cn("rounded-2xl object-cover", className)}
            />
        );
    }

    return (
        <div
            className={cn("flex items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-600", className)}
        >
            {getInitials(actorName)}
        </div>
    );
}

function getNotificationIcon(type: string) {
    const normalized = type.toLowerCase();

    if (normalized.includes("ikas")) return Shield;
    if (normalized.includes("kse")) return Wrench;
    if (normalized.includes("csirt")) return UserCircle2;
    if (normalized.includes("resource")) return RefreshCw;

    return Bell;
}

function getTypePillStyle(type: string) {
    const normalized = type.toLowerCase();

    if (normalized.includes("ikas")) {
        return {
            background: "rgba(37, 99, 235, 0.1)",
            color: "#1d4ed8",
        };
    }

    if (normalized.includes("kse")) {
        return {
            background: "rgba(124, 58, 237, 0.1)",
            color: "#6d28d9",
        };
    }

    if (normalized.includes("csirt")) {
        return {
            background: "rgba(5, 150, 105, 0.12)",
            color: "#047857",
        };
    }

    return {
        background: "var(--dashboard-card-chip)",
        color: "var(--dashboard-selection-text)",
    };
}

function getStatusPillStyle(read: boolean) {
    return read
        ? {
            background: "rgba(148, 163, 184, 0.14)",
            color: "var(--dashboard-text-soft)",
        }
        : {
            background: "rgba(79, 70, 229, 0.14)",
            color: "#4338ca",
        };
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [readFilter, setReadFilter] = useState<ReadFilter>("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [errorMessage, setErrorMessage] = useState("");
    const [isUnavailable, setIsUnavailable] = useState(false);
    const { fetchNotifications, markAllAsRead } = useNotifications();

    const loadNotifications = async (refresh = false) => {
        setErrorMessage("");
        setIsUnavailable(false);

        if (refresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const result = await notificationsService.getAll();
            setNotifications(sortNotifications(result.notifications));
        } catch (error) {
            const status = typeof error === "object" && error !== null && "status" in error
                ? Number((error as { status?: unknown }).status)
                : undefined;

            if (status === 403) {
                setIsUnavailable(true);
                setNotifications([]);
            } else {
                setErrorMessage("Gagal memuat notifikasi. Silakan coba lagi.");
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        void loadNotifications();
    }, []);

    const counts = useMemo(() => {
        const unread = notifications.filter((item) => !item.read).length;
        return {
            total: notifications.length,
            unread,
            read: notifications.length - unread,
        };
    }, [notifications]);

    const typeOptions = useMemo(() => {
        const uniqueTypes = Array.from(
            new Map(
                notifications
                    .filter((item) => item.type || item.typeLabel)
                    .map((item) => [item.type || item.typeLabel, item.typeLabel || item.type])
            ).entries()
        );

        return uniqueTypes.map(([value, label]) => ({ value, label }));
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return notifications.filter((item) => {
            const matchesSearch =
                !query ||
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.typeLabel.toLowerCase().includes(query) ||
                item.actorName.toLowerCase().includes(query) ||
                item.actorUsername.toLowerCase().includes(query);

            const matchesRead =
                readFilter === "all" ||
                (readFilter === "unread" && !item.read) ||
                (readFilter === "read" && item.read);

            const matchesType = typeFilter === "all" || item.type === typeFilter;

            return matchesSearch && matchesRead && matchesType;
        });
    }, [notifications, readFilter, searchQuery, typeFilter]);

    const handleMarkAsRead = async (notificationId: string) => {
        const target = notifications.find((item) => item.id === notificationId);
        if (!target || target.read) return;

        setNotifications((current) =>
            current.map((item) => (
                item.id === notificationId ? { ...item, read: true } : item
            ))
        );

        try {
            await notificationsService.markAsRead(notificationId);
            await fetchNotifications();
        } catch {
            setNotifications((current) =>
                current.map((item) => (
                    item.id === notificationId ? { ...item, read: false } : item
                ))
            );
            setErrorMessage("Gagal menandai notifikasi sebagai dibaca.");
        }
    };

    const handleMarkAllAsRead = async () => {
        if (counts.unread === 0) return;

        const previous = notifications;
        setIsMarkingAll(true);
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));

        try {
            await markAllAsRead();
        } catch {
            setNotifications(previous);
            setErrorMessage("Gagal menandai semua notifikasi sebagai dibaca.");
        } finally {
            setIsMarkingAll(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-12">
            <PageHeader
                icon={Bell}
                title="Notifications"
                subtitle="Pantau aktivitas terbaru dan pembaruan sistem berdasarkan data notifikasi yang tersedia."
            />

            <section
                className="dashboard-table-surface overflow-hidden rounded-[2rem] border px-4 py-4 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:px-6 sm:py-6 lg:px-8 lg:py-7"
            >
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-4">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
                                style={{
                                    borderColor: "rgba(226,232,240,0.95)",
                                    color: "#334155",
                                    background: "rgba(255,255,255,0.7)",
                                }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Dashboard
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="button"
                                onClick={() => void handleMarkAllAsRead()}
                                disabled={counts.unread === 0 || isLoading || isMarkingAll || isUnavailable}
                                className="h-11 rounded-2xl px-5 text-sm font-semibold shadow-sm"
                                style={{
                                    background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                                    color: "#ffffff",
                                }}
                            >
                                {isMarkingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                                Mark all as read
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void loadNotifications(true)}
                                disabled={isLoading || isRefreshing}
                                className="h-11 rounded-2xl px-5 text-sm font-semibold"
                                style={{
                                    borderColor: "rgba(226,232,240,0.95)",
                                    background: "#ffffff",
                                    color: "#334155",
                                }}
                            >
                                <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
                            <div
                                className="flex h-12 items-center gap-3 rounded-2xl border px-4"
                                style={{
                                    borderColor: "rgba(226,232,240,0.95)",
                                    background: "#ffffff",
                                }}
                            >
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search notifications..."
                                    className="h-full w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <Select value={readFilter} onValueChange={(value: ReadFilter) => setReadFilter(value)}>
                                <SelectTrigger
                                    className="h-12 rounded-2xl border px-4 text-sm shadow-none focus:ring-0"
                                    style={{
                                        borderColor: "rgba(226,232,240,0.95)",
                                        background: "#ffffff",
                                        color: "#334155",
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-slate-500" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua status</SelectItem>
                                    <SelectItem value="unread">Belum dibaca</SelectItem>
                                    <SelectItem value="read">Sudah dibaca</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger
                                    className="h-12 rounded-2xl border px-4 text-sm shadow-none focus:ring-0"
                                    style={{
                                        borderColor: "rgba(226,232,240,0.95)",
                                        background: "#ffffff",
                                        color: "#334155",
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-slate-500" />
                                        <SelectValue placeholder="Type" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua tipe</SelectItem>
                                    {typeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                            <div
                                className="rounded-2xl border px-4 py-3"
                                style={{ borderColor: "rgba(226,232,240,0.95)", background: "#ffffff" }}
                            >
                                <span className="font-semibold text-slate-900">{counts.total}</span>
                                <span className="ml-2 text-slate-500">total notifikasi</span>
                            </div>
                            <div
                                className="rounded-2xl border px-4 py-3"
                                style={{ borderColor: "rgba(226,232,240,0.95)", background: "#ffffff" }}
                            >
                                <span className="font-semibold text-indigo-700">{counts.unread}</span>
                                <span className="ml-2 text-slate-500">belum dibaca</span>
                            </div>
                            <div
                                className="rounded-2xl border px-4 py-3"
                                style={{ borderColor: "rgba(226,232,240,0.95)", background: "#ffffff" }}
                            >
                                <span className="font-semibold text-slate-700">{counts.read}</span>
                                <span className="ml-2 text-slate-500">sudah dibaca</span>
                            </div>
                        </div>

                        {errorMessage ? (
                            <div
                                className="rounded-2xl border px-4 py-3 text-sm"
                                style={{
                                    borderColor: "rgba(99,102,241,0.18)",
                                    background: "rgba(99,102,241,0.06)",
                                    color: "#334155",
                                }}
                            >
                                {errorMessage}
                            </div>
                        ) : null}

                        <div
                            className="overflow-hidden rounded-[1.5rem] border"
                            style={{
                                borderColor: "rgba(226,232,240,0.95)",
                                background: "#ffffff",
                            }}
                        >
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                </div>
                            ) : isUnavailable ? (
                                <div className="px-6 py-16 text-center">
                                    <p className="text-base font-semibold text-slate-800">Notifikasi belum tersedia</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Akun ini belum memiliki akses ke endpoint notifikasi.
                                    </p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="px-6 py-16 text-center">
                                    <p className="text-base font-semibold text-slate-800">Tidak ada notifikasi yang cocok</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Ubah kata kunci pencarian atau filter untuk melihat hasil lain.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden lg:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent" style={{ borderColor: "rgba(241,245,249,1)" }}>
                                                    <TableHead className="h-11 text-xs font-semibold text-slate-500">Notification</TableHead>
                                                    <TableHead className="h-11 w-[220px] text-xs font-semibold text-slate-500">Type</TableHead>
                                                    <TableHead className="h-11 w-[220px] text-xs font-semibold text-slate-500">Time</TableHead>
                                                    <TableHead className="h-11 w-[140px] text-xs font-semibold text-slate-500">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredNotifications.map((notification) => {
                                                    const Icon = getNotificationIcon(notification.type);
                                                    const avatarName = notification.actorName || notification.actorUsername || notification.title;

                                                    return (
                                                        <TableRow
                                                            key={notification.id}
                                                            className="border-0 transition-colors hover:bg-slate-50/80"
                                                            style={{
                                                                background: notification.read ? "#ffffff" : "rgba(244,247,255,0.92)",
                                                            }}
                                                        >
                                                            <TableCell className="px-5 py-4">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="relative">
                                                                        <NotificationActorAvatar
                                                                            actorAvatar={notification.actorAvatar}
                                                                            actorName={avatarName}
                                                                            className="h-11 w-11"
                                                                        />
                                                                        {!notification.actorAvatar ? (
                                                                            <div
                                                                                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white"
                                                                                style={{
                                                                                    background: notification.read ? "rgba(226,232,240,0.95)" : "rgba(79,70,229,0.14)",
                                                                                    color: notification.read ? "#64748b" : "#4338ca",
                                                                                }}
                                                                            >
                                                                                <Icon className="h-3 w-3" />
                                                                            </div>
                                                                        ) : null}
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <p className="truncate text-base font-semibold text-slate-900">
                                                                                {notification.title}
                                                                            </p>
                                                                            {!notification.read ? (
                                                                                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                                                            ) : null}
                                                                        </div>
                                                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                                                            {notification.description || "Tidak ada deskripsi tambahan."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="px-5 py-4">
                                                                <span
                                                                    className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                                                                    style={getTypePillStyle(notification.type)}
                                                                >
                                                                    {notification.typeLabel || "Umum"}
                                                                </span>
                                                            </TableCell>

                                                            <TableCell className="px-5 py-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-medium text-slate-700">
                                                                        {getRelativeTime(notification.timestamp)}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400">
                                                                        {formatNotificationTime(notification.timestamp)}
                                                                    </p>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <span
                                                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold leading-none"
                                                                        style={getStatusPillStyle(notification.read)}
                                                                    >
                                                                        {notification.read ? "sudah dibaca" : "belum dibaca"}
                                                                    </span>
                                                                    {!notification.read ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void handleMarkAsRead(notification.id)}
                                                                            className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                                                                        >
                                                                            Tandai
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="space-y-3 p-3 lg:hidden">
                                        {filteredNotifications.map((notification) => {
                                            const Icon = getNotificationIcon(notification.type);
                                            const avatarName = notification.actorName || notification.actorUsername || notification.title;

                                            return (
                                                <article
                                                    key={notification.id}
                                                    className="rounded-[1.25rem] border p-4"
                                                    style={{
                                                        borderColor: "rgba(226,232,240,0.95)",
                                                        background: notification.read ? "#ffffff" : "rgba(244,247,255,0.92)",
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="relative">
                                                            <NotificationActorAvatar
                                                                actorAvatar={notification.actorAvatar}
                                                                actorName={avatarName}
                                                                className="h-10 w-10"
                                                            />
                                                            {!notification.actorAvatar ? (
                                                                <div
                                                                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white"
                                                                    style={{
                                                                        background: notification.read ? "rgba(226,232,240,0.95)" : "rgba(79,70,229,0.14)",
                                                                        color: notification.read ? "#64748b" : "#4338ca",
                                                                    }}
                                                                >
                                                                    <Icon className="h-3 w-3" />
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                                                                <span
                                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold leading-none"
                                                                    style={getStatusPillStyle(notification.read)}
                                                                >
                                                                    {notification.read ? "sudah dibaca" : "belum dibaca"}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                                {notification.description || "Tidak ada deskripsi tambahan."}
                                                            </p>
                                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                                <span
                                                                    className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold"
                                                                    style={getTypePillStyle(notification.type)}
                                                                >
                                                                    {notification.typeLabel || "Umum"}
                                                                </span>
                                                                <span className="text-xs text-slate-400">{getRelativeTime(notification.timestamp)}</span>
                                                            </div>
                                                            {!notification.read ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void handleMarkAsRead(notification.id)}
                                                                    className="mt-3 text-xs font-semibold text-indigo-600"
                                                                >
                                                                    Tandai sebagai dibaca
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                    </div>
                </div>
            </section>
        </div>
    );
}
