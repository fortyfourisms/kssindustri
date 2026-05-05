import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, LineChart, Line,
    ReferenceLine, Cell,
} from "recharts";
import { TrendingUp, BarChart2, BarChart3 } from "lucide-react";
import type { IkasData } from "@/types/ikas.types";

// ─── Helper: petakan raw API item ke nilai domain ────────────────────────────
function extractDomainValues(item: any) {
    return {
        identifikasi: item?.identifikasi?.nilai_identifikasi ?? 0,
        proteksi: item?.proteksi?.nilai_proteksi ?? 0,
        deteksi: item?.deteksi?.nilai_deteksi ?? 0,
        gulih: item?.gulih?.nilai_gulih ?? item?.tanggulih?.nilai_tanggulih ?? 0,
        total: item?.nilai_kematangan ?? item?.total_rata_rata ?? 0,
    };
}

function extractYear(tanggal: string): number | null {
    if (!tanggal) return null;
    const d = new Date(tanggal);
    if (!isNaN(d.getTime())) return d.getFullYear();
    const parts = tanggal.split(/[-/]/);
    if (parts.length === 3) {
        const yr = parseInt(parts[2]);
        if (!isNaN(yr) && yr > 1900) return yr;
        const yr2 = parseInt(parts[0]);
        if (!isNaN(yr2) && yr2 > 1900) return yr2;
    }
    return null;
}

// ─── Palet warna per domain ──────────────────────────────────────────────────
const DOMAIN_COLORS = {
    identifikasi: "#3b82f6",  // blue
    proteksi: "#8b5cf6",  // purple
    deteksi: "#f59e0b",  // amber
    gulih: "#10b981",  // emerald
};

const YEAR_PALETTE = [
    "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981",
    "#ef4444", "#06b6d4", "#f97316", "#84cc16",
];

const TARGET = 2.51;
const PANEL_CLS = "dashboard-table-surface rounded-2xl border p-6 shadow-sm";
const EMPTY_PANEL_CLS = "dashboard-table-surface rounded-2xl border p-10 shadow-sm";
const GRID_STROKE = "var(--dashboard-table-divider)";
const AXIS_STROKE = "var(--dashboard-text-muted)";
const LABEL_STROKE = "var(--dashboard-text-soft)";
const TARGET_STROKE = "var(--dashboard-status-danger)";

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="min-w-[160px] rounded-xl border p-3 text-sm shadow-xl"
            style={{
                background: "var(--dashboard-chart-tooltip-bg)",
                borderColor: "var(--dashboard-chart-tooltip-border)",
                color: "var(--dashboard-text)",
            }}
        >
            <p className="mb-2 border-b pb-1 font-bold" style={{ color: "var(--dashboard-text)", borderColor: "var(--dashboard-border)" }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <span className="flex items-center gap-1.5" style={{ color: "var(--dashboard-text-soft)" }}>
                        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: p.fill || p.color }} />
                        {p.name}
                    </span>
                    <span className="font-bold" style={{ color: "var(--dashboard-text)" }}>{Number(p.value).toFixed(2)}</span>
                </div>
            ))}
            <div className="mt-1 flex items-center justify-between gap-4 border-t py-0.5" style={{ borderColor: "var(--dashboard-border)" }}>
                <span className="text-xs" style={{ color: "var(--dashboard-text-muted)" }}>Target</span>
                <span className="text-xs font-semibold" style={{ color: TARGET_STROKE }}>{TARGET}</span>
            </div>
        </div>
    );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="min-w-[150px] rounded-xl border p-3 text-sm shadow-xl"
            style={{
                background: "var(--dashboard-chart-tooltip-bg)",
                borderColor: "var(--dashboard-chart-tooltip-border)",
                color: "var(--dashboard-text)",
            }}
        >
            <p className="mb-2 border-b pb-1 font-bold" style={{ color: "var(--dashboard-text)", borderColor: "var(--dashboard-border)" }}>Tahun {label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                    <span className="flex items-center gap-1.5" style={{ color: "var(--dashboard-text-soft)" }}>
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
                        {p.name}
                    </span>
                    <span className="font-bold" style={{ color: "var(--dashboard-text)" }}>{Number(p.value).toFixed(2)}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
    ikasList: IkasData[] | undefined;
    availableYears: number[];
}

export function IkasYearComparisonChart({ ikasList, availableYears }: Props) {
    const safeList = ikasList ?? [];
    const hasData = safeList.length > 0 && availableYears.length > 0;

    // ── 1. Bar Chart: perbandingan 4 domain per tahun ─────────────────────
    const barData = availableYears.map(year => {
        const item = safeList.find(
            (d: any) => extractYear(d.tanggal ?? d.created_at ?? "") === year
        );
        const vals = extractDomainValues(item);
        return {
            tahun: String(year),
            Identifikasi: vals.identifikasi,
            Proteksi: vals.proteksi,
            Deteksi: vals.deteksi,
            Tanggulih: vals.gulih,
        };
    }).reverse();

    // ── 2. Line Chart: tren total nilai kematangan per tahun ─────────────
    const lineData = availableYears.map(year => {
        const item = safeList.find(
            (d: any) => extractYear(d.tanggal ?? d.created_at ?? "") === year
        );
        const vals = extractDomainValues(item);
        return {
            tahun: String(year),
            "Nilai Kematangan": vals.total > 0 ? vals.total : null,
        };
    }).reverse();

    // ── 3. Grouped bar: per-domain trend ─────────────────────────────────
    const domainTrendData = [
        { domain: "Identifikasi", key: "identifikasi" as const },
        { domain: "Proteksi", key: "proteksi" as const },
        { domain: "Deteksi", key: "deteksi" as const },
        { domain: "Tanggulih", key: "gulih" as const },
    ].map(({ domain, key }) => {
        const row: Record<string, any> = { domain };
        availableYears.forEach(year => {
            const item = safeList.find(
                (d: any) => extractYear(d.tanggal ?? d.created_at ?? "") === year
            );
            row[String(year)] = extractDomainValues(item)[key] || 0;
        });
        return row;
    });

    const hasMultiYear = availableYears.length > 1;

    return (
        <div className="space-y-4">
            {/* ── Section header ── */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md" style={{ background: "var(--dashboard-primary-button)", color: "var(--text-primary-action)" }}>
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-black" style={{ color: "var(--dashboard-text)" }}>Perbandingan Data Antar Tahun</h2>
                    <p className="text-xs" style={{ color: "var(--dashboard-text-muted)" }}>Visualisasi tren nilai kematangan keamanan siber</p>
                </div>
            </div>

            {/* ── Empty state ── */}
            {!hasData ? (
                <div className={`${EMPTY_PANEL_CLS} flex flex-col items-center justify-center gap-3 text-center`}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--dashboard-card-chip)" }}>
                        <BarChart3 className="w-7 h-7" style={{ color: "var(--dashboard-info-soft-fg)" }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: "var(--dashboard-text-soft)" }}>Belum ada data untuk perbandingan</p>
                </div>
            ) : !hasMultiYear ? (
                /* ── Hanya 1 tahun: tampilkan bar tunggal per domain ── */
                <div className={PANEL_CLS}>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-4 h-4" style={{ color: "var(--dashboard-info-soft-fg)" }} />
                        <span className="text-sm font-bold" style={{ color: "var(--dashboard-text-soft)" }}>
                            Nilai per Domain — {availableYears[0]}
                        </span>
                        <span className="ml-auto text-xs" style={{ color: "var(--dashboard-text-muted)" }}>Data hanya tersedia untuk 1 tahun. Tambahkan data tahun lain untuk melihat perbandingan.</span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={domainTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                                <XAxis dataKey="domain" tick={{ fontSize: 12, fontWeight: 600, fill: LABEL_STROKE }} />
                                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: AXIS_STROKE }} tickCount={6} />
                                <Tooltip content={<CustomBarTooltip />} />
                                <ReferenceLine y={TARGET} stroke={TARGET_STROKE} strokeDasharray="4 2" strokeWidth={1.5}
                                    label={{ value: `Target ${TARGET}`, position: "insideTopRight", fontSize: 10, fill: TARGET_STROKE }} />
                                <Bar dataKey={String(availableYears[0])} radius={[6, 6, 0, 0]}>
                                    {domainTrendData.map((_, i) => (
                                        <Cell key={i} fill={Object.values(DOMAIN_COLORS)[i]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                /* ── Multi-tahun: 2 chart berdampingan ── */
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                    {/* Chart 1: Bar grouped per domain per tahun */}
                    <div className={PANEL_CLS}>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart2 className="w-4 h-4" style={{ color: "var(--dashboard-info-soft-fg)" }} />
                            <span className="text-sm font-bold" style={{ color: "var(--dashboard-text-soft)" }}>Nilai per Domain per Tahun</span>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                                    barCategoryGap="25%" barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                                    <XAxis dataKey="tahun" tick={{ fontSize: 12, fontWeight: 700, fill: LABEL_STROKE }} />
                                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: AXIS_STROKE }} tickCount={6} />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <ReferenceLine y={TARGET} stroke={TARGET_STROKE} strokeDasharray="4 2" strokeWidth={1.5}
                                        label={{ value: `Target ${TARGET}`, position: "insideTopRight", fontSize: 10, fill: TARGET_STROKE }} />
                                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "var(--dashboard-text-soft)" }} />
                                    <Bar dataKey="Identifikasi" fill={DOMAIN_COLORS.identifikasi} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Proteksi" fill={DOMAIN_COLORS.proteksi} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Deteksi" fill={DOMAIN_COLORS.deteksi} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Tanggulih" fill={DOMAIN_COLORS.gulih} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 2: Line tren total nilai kematangan */}
                    <div className={PANEL_CLS}>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4" style={{ color: "var(--dashboard-success-soft-fg)" }} />
                            <span className="text-sm font-bold" style={{ color: "var(--dashboard-text-soft)" }}>Tren Total Nilai Kematangan</span>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                                    <XAxis dataKey="tahun" tick={{ fontSize: 12, fontWeight: 700, fill: LABEL_STROKE }} />
                                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: AXIS_STROKE }} tickCount={6} />
                                    <Tooltip content={<CustomLineTooltip />} />
                                    <ReferenceLine y={TARGET} stroke={TARGET_STROKE} strokeDasharray="4 2" strokeWidth={1.5}
                                        label={{ value: `Target ${TARGET}`, position: "insideTopRight", fontSize: 10, fill: TARGET_STROKE }} />
                                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "var(--dashboard-text-soft)" }} />
                                    <Line
                                        type="monotone"
                                        dataKey="Nilai Kematangan"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        dot={{ r: 5, fill: "#3b82f6", strokeWidth: 2, stroke: "var(--dashboard-surface-strong)" }}
                                        activeDot={{ r: 7 }}
                                        connectNulls={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 3 (full width): Bar per domain, grouped by year */}
                    <div className={`${PANEL_CLS} xl:col-span-2`}>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart2 className="w-4 h-4" style={{ color: "var(--dashboard-selection-text)" }} />
                            <span className="text-sm font-bold" style={{ color: "var(--dashboard-text-soft)" }}>Perbandingan per Domain (semua tahun)</span>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={domainTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                                    barCategoryGap="30%" barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                                    <XAxis dataKey="domain" tick={{ fontSize: 12, fontWeight: 600, fill: LABEL_STROKE }} />
                                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: AXIS_STROKE }} tickCount={6} />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <ReferenceLine y={TARGET} stroke={TARGET_STROKE} strokeDasharray="4 2" strokeWidth={1.5}
                                        label={{ value: `Target ${TARGET}`, position: "insideTopRight", fontSize: 10, fill: TARGET_STROKE }} />
                                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "var(--dashboard-text-soft)" }} />
                                    {availableYears.slice().reverse().map((year, i) => (
                                        <Bar
                                            key={year}
                                            dataKey={String(year)}
                                            fill={YEAR_PALETTE[i % YEAR_PALETTE.length]}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
