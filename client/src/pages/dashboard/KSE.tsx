import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { exportKsePdf } from "@/lib/pdf-export";
import { getKategoriSE } from "@/data/kse-data";
import {
    getKseEditRequestStatus,
    getKseEditStatusMeta,
    getLatestKseEditRequest,
    type KseEditRequestRecord,
    type KseEditRequestStatus,
} from "@/lib/kse-edit-request";
import { useUser } from "@/hooks/useAuth";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Building2, Download, Loader2, Monitor, Plus, Send, ServerCrash } from "lucide-react";
import { motion } from "framer-motion";

const PANEL_CLS = "dashboard-table-surface overflow-hidden rounded-2xl border shadow-[0_24px_54px_rgba(148,163,184,0.18)]";
const PANEL_HEADER_CLS = "dashboard-table-divider flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between";
const PANEL_TITLE_CLS = "text-lg font-bold text-[var(--dashboard-text)]";
const PANEL_DESCRIPTION_CLS = "mt-0.5 text-sm text-[var(--dashboard-text-muted)]";
const SECONDARY_BUTTON_CLS = "dashboard-secondary-button inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all";
const PRIMARY_BUTTON_CLS = "dashboard-primary-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0";
const TABLE_HEAD_CLS = "dashboard-table-head dashboard-table-divider border-b";
const TABLE_HEAD_CELL_CLS = "px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)] whitespace-nowrap";
const TABLE_HEAD_CELL_CENTER_CLS = `${TABLE_HEAD_CELL_CLS} text-center`;
const TABLE_ROW_CLS = "dashboard-table-row-hover transition-colors";
const SCORE_BADGE_CLS = "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-section-muted)] text-base font-extrabold text-[var(--dashboard-text)] shadow-sm";
const ACTION_BUTTON_CLS = "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all";
const ACTION_BUTTON_ACTIVE_CLS = `${ACTION_BUTTON_CLS} dashboard-warning-button whitespace-nowrap shadow-md hover:-translate-y-0.5`;
const ACTION_BUTTON_DISABLED_CLS = `${ACTION_BUTTON_CLS} cursor-not-allowed border border-[var(--dashboard-border)] bg-[var(--dashboard-section-muted)] text-[var(--dashboard-text-muted)]`;
const FOOTER_CLS = "dashboard-table-divider flex items-center justify-between border-t bg-[var(--dashboard-section-muted)] px-5 py-3";
const FOOTER_TEXT_CLS = "text-xs font-medium text-[var(--dashboard-text-muted)]";
const INFO_ICON_CLS = "flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--dashboard-info-soft-border)] bg-[var(--dashboard-info-soft-bg)] text-[var(--dashboard-info-soft-fg)]";

const FIELD_TO_BOBOT: Record<string, Record<string, number>> = {
    nilai_investasi: { A: 5, B: 2, C: 1 },
    anggaran_operasional: { A: 5, B: 2, C: 1 },
    kepatuhan_peraturan: { A: 5, B: 2, C: 1 },
    teknik_kriptografi: { A: 5, B: 2, C: 1 },
    jumlah_pengguna: { A: 5, B: 2, C: 1 },
    data_pribadi: { A: 5, B: 2, C: 1 },
    klasifikasi_data: { A: 5, B: 2, C: 1 },
    kekritisan_proses: { A: 5, B: 2, C: 1 },
    dampak_kegagalan: { A: 5, B: 2, C: 1 },
    potensi_kerugian_dan_dampak_negatif: { A: 5, B: 2, C: 1 },
};

function computeBobot(se: Record<string, any>): number {
    return Object.entries(FIELD_TO_BOBOT).reduce((sum, [field, bobotMap]) => {
        const value = se?.[field];
        return sum + (bobotMap[value] || 0);
    }, 0);
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

function KategoriBadge({ kategori }: { kategori: string }) {
    const map: Record<string, { bg: string; text: string; dot: string }> = {
        Strategis: { bg: "dashboard-chip-danger", text: "text-[var(--dashboard-danger-soft-fg)]", dot: "bg-[var(--dashboard-danger-soft-fg)]" },
        Tinggi: { bg: "dashboard-chip-warning", text: "text-[var(--dashboard-warning-soft-fg)]", dot: "bg-[var(--dashboard-warning-soft-fg)]" },
        Rendah: { bg: "dashboard-chip-success", text: "text-[var(--dashboard-success-soft-fg)]", dot: "bg-[var(--dashboard-success-soft-fg)]" },
    };
    const style = map[kategori] || { bg: "dashboard-chip-info", text: "text-[var(--dashboard-info-soft-fg)]", dot: "bg-[var(--dashboard-info-soft-fg)]" };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {kategori || "Belum Lengkap"}
        </span>
    );
}

function EditRequestBadge({ status }: { status: KseEditRequestStatus }) {
    const meta = getKseEditStatusMeta(status);
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${meta.badgeClassName}`}>
            {meta.label}
        </span>
    );
}

export default function KSE() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: user } = useUser();

    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { perusahaan } = useCompanyProfile(user);

    const { data: seData, isLoading, isError, refetch } = useQuery<any>({
        queryKey: ["se"],
        queryFn: api.getKse,
    });
    const { data: editRequestData } = useQuery<any>({
        queryKey: ["se-edit-requests"],
        queryFn: api.getKseEditRequests,
    });

    const requestList = useMemo<KseEditRequestRecord[]>(() => {
        if (Array.isArray(editRequestData?.data)) return editRequestData.data;
        if (Array.isArray(editRequestData)) return editRequestData;
        return [];
    }, [editRequestData]);

    const seList: any[] = Array.isArray(seData?.data)
        ? seData.data
        : Array.isArray(seData)
            ? seData
            : seData && typeof seData === "object" && seData.id
                ? [seData]
                : [];

    return (
        <RequireCompanyProfile>
            <div className="mx-auto max-w-7xl space-y-6 pb-12">
                <PageHeader
                    icon={Building2}
                    title={`Kategorisasi Sistem Elektronik - ${perusahaan?.nama_perusahaan || "Stakeholder"}`}
                    subtitle="User mengajukan perubahan dengan mengedit draft data terlebih dahulu, lalu admin memutuskan apakah perubahan diterapkan."
                />

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={PANEL_CLS}
                >
                    <div className={PANEL_HEADER_CLS}>
                        <div>
                            <h3 className={PANEL_TITLE_CLS}>Tabel KSE</h3>
                            <p className={PANEL_DESCRIPTION_CLS}>Daftar sistem elektronik, skor kategorisasi, dan status pengajuan perubahan data.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {seList.length > 0 && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            await exportKsePdf(perusahaan?.nama_perusahaan);
                                        } catch (error: any) {
                                            toast({
                                                title: "Export PDF gagal",
                                                description: error?.message || "Tidak dapat membuka jendela export.",
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                    className={SECONDARY_BUTTON_CLS}
                                >
                                    <Download className="h-4 w-4" />
                                    Export PDF
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/dashboard/form-kse")}
                                className={PRIMARY_BUTTON_CLS}
                            >
                                <Plus className="h-4 w-4" />
                                Tambah SE
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-24">
                            <Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-info-soft-fg)]" />
                            <p className="text-sm font-medium text-[var(--dashboard-text-muted)]">Memuat data...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-8 py-24 text-center">
                            <ServerCrash className="h-10 w-10 text-[var(--dashboard-danger-soft-fg)]" />
                            <p className="font-semibold text-[var(--dashboard-text)]">Gagal memuat data SE.</p>
                            <button onClick={() => refetch()} className="text-sm font-bold text-[var(--dashboard-info-soft-fg)] hover:underline">
                                Coba Lagi
                            </button>
                        </div>
                    ) : seList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
                            <div className={INFO_ICON_CLS}>
                                <Monitor className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-[var(--dashboard-text)]">Belum ada data SE</p>
                                <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">Tambahkan sistem elektronik pertama Anda untuk memulai penilaian.</p>
                            </div>
                            <button
                                onClick={() => navigate("/dashboard/form-kse")}
                                className={PRIMARY_BUTTON_CLS}
                            >
                                <Plus className="h-4 w-4" />
                                Tambah SE Sekarang
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 p-4 md:hidden">
                                {seList.map((se, idx) => {
                                    const bobot = computeBobot(se);
                                    const kategori = se.kategori_se || getKategoriSE(bobot).kategori;
                                    const editStatus = getKseEditRequestStatus(se, requestList);
                                    const latestRequest = getLatestKseEditRequest(se, requestList);
                                    const statusMeta = getKseEditStatusMeta(editStatus);
                                    const isPendingApproval = editStatus === "pending_approval";

                                    return (
                                        <div key={se.id ?? idx} className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">SE #{idx + 1}</p>
                                                    <h4 className="mt-1 text-base font-bold text-[var(--dashboard-text)]">{se.nama_se || "-"}</h4>
                                                </div>
                                                <span className={SCORE_BADGE_CLS}>{bobot}</span>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <KategoriBadge kategori={kategori} />
                                                <EditRequestBadge status={editStatus} />
                                            </div>

                                            <div className="mt-4 space-y-3 text-sm">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Status edit</p>
                                                    <p className="mt-1 text-[var(--dashboard-text-soft)]">{statusMeta.description}</p>
                                                </div>
                                                {latestRequest?.catatan_user && (
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Catatan user</p>
                                                        <p className="mt-1 text-[var(--dashboard-text-soft)]">{latestRequest.catatan_user}</p>
                                                    </div>
                                                )}
                                                {latestRequest?.catatan && (
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Catatan admin</p>
                                                        <p className="mt-1 text-[var(--dashboard-text-soft)]">{latestRequest.catatan}</p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Dibuat</p>
                                                        <p className="mt-1 text-[var(--dashboard-text-soft)]">{formatDate(se.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Diperbarui</p>
                                                        <p className="mt-1 text-[var(--dashboard-text-soft)]">{formatDate(se.updated_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/dashboard/form-kse?id=${se.id}`)}
                                                disabled={isPendingApproval}
                                                className={cn(
                                                    "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold transition-all",
                                                    isPendingApproval ? ACTION_BUTTON_DISABLED_CLS : ACTION_BUTTON_ACTIVE_CLS
                                                )}
                                            >
                                                {isPendingApproval ? <Loader2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                                {isPendingApproval ? "Menunggu Admin" : "Ajukan Perubahan Data"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-sm">
                                <thead>
                                    <tr className={TABLE_HEAD_CLS}>
                                        <th className={TABLE_HEAD_CELL_CLS}>No</th>
                                        <th className={TABLE_HEAD_CELL_CLS}>Nama Sistem Elektronik</th>
                                        <th className={TABLE_HEAD_CELL_CLS}>Kategori</th>
                                        <th className={TABLE_HEAD_CELL_CLS}>Status Edit</th>
                                        <th className={TABLE_HEAD_CELL_CENTER_CLS}>Skor</th>
                                        <th className={TABLE_HEAD_CELL_CLS}>Dibuat</th>
                                        <th className={TABLE_HEAD_CELL_CLS}>Diperbarui</th>
                                        <th className={TABLE_HEAD_CELL_CENTER_CLS}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="dashboard-table-divider divide-y">
                                    {seList.map((se, idx) => {
                                        const bobot = computeBobot(se);
                                        const kategori = se.kategori_se || getKategoriSE(bobot).kategori;
                                        const editStatus = getKseEditRequestStatus(se, requestList);
                                        const latestRequest = getLatestKseEditRequest(se, requestList);
                                        const statusMeta = getKseEditStatusMeta(editStatus);
                                        const isPendingApproval = editStatus === "pending_approval";

                                        return (
                                            <motion.tr
                                                key={se.id ?? idx}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                className={TABLE_ROW_CLS}
                                            >
                                                <td className="px-5 py-4 text-xs font-semibold text-[var(--dashboard-text-muted)]">{idx + 1}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--dashboard-info-soft-border)] bg-[var(--dashboard-info-soft-bg)]">
                                                            <Monitor className="h-4 w-4 text-[var(--dashboard-info-soft-fg)]" />
                                                        </div>
                                                        <span className="font-semibold leading-tight text-[var(--dashboard-text)]">{se.nama_se || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <KategoriBadge kategori={kategori} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="space-y-1">
                                                        <EditRequestBadge status={editStatus} />
                                                        <p className="text-[11px] text-[var(--dashboard-text-muted)]">{statusMeta.description}</p>
                                                        {latestRequest?.catatan_user && (
                                                            <p className="text-[11px] text-[var(--dashboard-text-soft)]">Catatan user: {latestRequest.catatan_user}</p>
                                                        )}
                                                        {latestRequest?.catatan && (
                                                            <p className="text-[11px] text-[var(--dashboard-text-soft)]">Catatan admin: {latestRequest.catatan}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={SCORE_BADGE_CLS}>{bobot}</span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap text-[var(--dashboard-text-soft)]">{formatDate(se.created_at)}</td>
                                                <td className="px-5 py-4 whitespace-nowrap text-[var(--dashboard-text-soft)]">{formatDate(se.updated_at)}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/form-kse?id=${se.id}`)}
                                                            disabled={isPendingApproval}
                                                            className={isPendingApproval ? ACTION_BUTTON_DISABLED_CLS : ACTION_BUTTON_ACTIVE_CLS}
                                                        >
                                                            {isPendingApproval ? <Loader2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                                                            {isPendingApproval ? "Menunggu Admin" : "Ajukan Perubahan Data"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                                </table>
                            </div>

                            <div className={FOOTER_CLS}>
                                <p className={FOOTER_TEXT_CLS}>
                                    {seList.length} sistem elektronik terdaftar
                                    {seData?.total_count != null ? ` (total: ${seData.total_count})` : ""}
                                </p>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </RequireCompanyProfile>
    );
}
