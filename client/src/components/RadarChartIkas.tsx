import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { ikasDataStatic } from "@/data/ikas-data";
import type { IkasViewData } from "@/types/ikas.types";

interface Props {
    ikasDataDynamic: IkasViewData;
}

export function RadarChartIkas({ ikasDataDynamic }: Props) {
    const chartPrimary = "var(--chart-primary)";
    const chartDanger = "var(--chart-danger)";
    const chartSuccess = "var(--dashboard-status-success)";
    const axisColor = "var(--chart-axis)";
    const axisMutedColor = "var(--chart-axis-muted)";
    const gridColor = "var(--chart-grid)";

    const perKategoriData = [
        {
            subject: "Peran & Tanggung Jawab",
            target: ikasDataStatic.identifikasi.peran_tanggung_jawab,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain1,
            fullSubject: "Mengidentifikasi Peran dan tanggung jawab organisasi",
        },
        {
            subject: "Strategi & Kebijakan",
            target: ikasDataStatic.identifikasi.strategi_kebijakan,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain2,
            fullSubject: "Menyusun strategi, kebijakan, dan prosedur Keamanan Siber",
        },
        {
            subject: "Aset Informasi",
            target: ikasDataStatic.identifikasi.aset_informasi,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain3,
            fullSubject: "Mengelola aset informasi",
        },
        {
            subject: "Risiko Keamanan",
            target: ikasDataStatic.identifikasi.risiko_keamanan,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain4,
            fullSubject: "Menilai dan mengelola risiko Keamanan Siber",
        },
        {
            subject: "Risiko Rantai Pasok",
            target: ikasDataStatic.identifikasi.rantai_pasok,
            nilai: ikasDataDynamic.identifikasi.nilai_subdomain5,
            fullSubject: "Mengelola risiko rantai pasok",
        },
        {
            subject: "Identitas & Autentikasi",
            target: ikasDataStatic.proteksi.identitas_autentikasi,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain1,
            fullSubject: "Mengelola identitas, autentikasi, dan kendali akses",
        },
        {
            subject: "Aset Fisik",
            target: ikasDataStatic.proteksi.aset_fisik,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain2,
            fullSubject: "Melindungi aset fisik",
        },
        {
            subject: "Data",
            target: ikasDataStatic.proteksi.data,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain3,
            fullSubject: "Melindungi data",
        },
        {
            subject: "Aplikasi",
            target: ikasDataStatic.proteksi.aplikasi,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain4,
            fullSubject: "Melindungi aplikasi",
        },
        {
            subject: "Jaringan",
            target: ikasDataStatic.proteksi.jaringan,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain5,
            fullSubject: "Melindungi jaringan",
        },
        {
            subject: "SDM",
            target: ikasDataStatic.proteksi.sdm,
            nilai: ikasDataDynamic.proteksi.nilai_subdomain6,
            fullSubject: "Melindungi sumber daya manusia",
        },
        {
            subject: "Deteksi Peristiwa",
            target: ikasDataStatic.deteksi.deteksi_peristiwa,
            nilai: ikasDataDynamic.deteksi.nilai_subdomain1,
            fullSubject: "Mengelola deteksi Peristiwa Siber",
        },
        {
            subject: "Anomali Peristiwa",
            target: ikasDataStatic.deteksi.anomali_peristiwa,
            nilai: ikasDataDynamic.deteksi.nilai_subdomain2,
            fullSubject: "Menganalisis anomali dan Peristiwa Siber",
        },
        {
            subject: "Pemantauan Berkelanjutan",
            target: ikasDataStatic.deteksi.pemantauan_berkelanjutan,
            nilai: ikasDataDynamic.deteksi.nilai_subdomain3,
            fullSubject: "Memantau Peristiwa Siber berkelanjutan",
        },
        {
            subject: "Perencanaan Penanggulangan",
            target: ikasDataStatic.tanggulih.perencanaan_pemulihan,
            nilai: ikasDataDynamic.gulih.nilai_subdomain1,
            fullSubject: "Menyusun perencanaan penanggulangan dan pemulihan Insiden Siber",
        },
        {
            subject: "Analisis & Pelaporan",
            target: ikasDataStatic.tanggulih.analisis_pelaporan,
            nilai: ikasDataDynamic.gulih.nilai_subdomain2,
            fullSubject: "Menganalisis dan melaporkan Insiden Siber",
        },
        {
            subject: "Pelaksanaan Penanggulangan",
            target: ikasDataStatic.tanggulih.pelaksanaan_pemulihan,
            nilai: ikasDataDynamic.gulih.nilai_subdomain3,
            fullSubject: "Melaksanakan penanggulangan dan pemulihan Insiden Siber",
        },
        {
            subject: "Peningkatan Keamanan",
            target: ikasDataStatic.tanggulih.peningkatan_keamanan,
            nilai: ikasDataDynamic.gulih.nilai_subdomain4,
            fullSubject: "Meningkatkan keamanan setelah terjadinya Insiden Siber",
        },
    ];

    const perDomainData = [
        { subject: "IDENTIFIKASI", target: 2.51, nilai: ikasDataDynamic.identifikasi.nilai || 0 },
        { subject: "PROTEKSI", target: 2.51, nilai: ikasDataDynamic.proteksi.nilai || 0 },
        { subject: "DETEKSI", target: 2.51, nilai: ikasDataDynamic.deteksi.nilai || 0 },
        { subject: "PENANGGULANGAN DAN PEMULIHAN", target: 2.51, nilai: ikasDataDynamic.gulih.nilai || 0 },
    ];

    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <ul className="mt-4 flex list-none justify-center gap-6 p-0 text-sm font-medium">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-2">
                        {entry.dataKey === "nilai" ? (
                            <div className="h-3 w-3 rotate-45" style={{ background: chartPrimary }} />
                        ) : (
                            <div className="h-3 w-3" style={{ background: chartDanger }} />
                        )}
                        <span style={{ color: "var(--dashboard-text-soft)" }}>
                            {entry.value === "nilai" ? "Nilai Kematangan" : "Target Nilai Kematangan"}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderTooltip = (label: string | undefined, payload: any[] | undefined, title?: string) => {
        if (!payload?.length) return null;

        return (
            <div
                className="max-w-xs rounded-lg p-3 shadow-xl"
                style={{
                    background: "var(--dashboard-chart-tooltip-bg)",
                    border: "1px solid var(--dashboard-chart-tooltip-border)",
                }}
            >
                <p className="mb-2 text-sm font-bold leading-tight" style={{ color: "var(--dashboard-text)" }}>
                    {title || label}
                </p>
                {payload.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: "var(--dashboard-text-soft)" }}>
                        <div
                            className={entry.dataKey === "nilai" ? "h-2 w-2 rotate-45" : "h-2 w-2"}
                            style={{ background: entry.dataKey === "nilai" ? chartPrimary : chartDanger }}
                        />
                        <span className="font-medium">
                            {entry.name === "nilai" ? "Nilai Kematangan" : "Target Nilai Kematangan"}:
                        </span>
                        <span className="font-bold" style={{ color: "var(--dashboard-text)" }}>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard-surface grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border backdrop-blur-md xl:grid-cols-2">
            <div className="dashboard-divider relative flex flex-col border-b p-6 xl:border-r xl:border-b-0">
                <div
                    className="absolute right-6 top-6 z-10 rounded px-4 py-2 text-sm font-bold tracking-widest shadow-sm"
                    style={{
                        background: "var(--dashboard-chart-target-badge-bg)",
                        border: "1px solid var(--dashboard-chart-target-badge-border)",
                        color: "var(--dashboard-chart-target-badge-text)",
                    }}
                >
                    PER KATEGORI
                </div>
                <div className="min-h-[400px] w-full aspect-square sm:aspect-video xl:aspect-square">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={perKategoriData}>
                            <PolarGrid stroke={gridColor} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 10, fontWeight: 500 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: axisMutedColor, fontSize: 10 }} tickCount={6} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active) return null;
                                    const origItem = perKategoriData.find((item) => item.subject === label);
                                    return renderTooltip(label, payload, origItem?.fullSubject || label);
                                }}
                            />
                            <Radar
                                name="target"
                                dataKey="target"
                                stroke={chartDanger}
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: chartDanger }}
                                dot={{ r: 3, fill: chartDanger, strokeWidth: 0 }}
                            />
                            <Radar
                                name="nilai"
                                dataKey="nilai"
                                stroke={chartPrimary}
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: chartPrimary }}
                                dot={(props: any) => {
                                    const { cx, cy, key } = props;
                                    return <rect key={key} x={cx - 3} y={cy - 3} width={6} height={6} fill={chartPrimary} transform={`rotate(45 ${cx} ${cy})`} />;
                                }}
                            />
                            <Legend content={renderLegend} verticalAlign="bottom" />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="relative flex flex-col p-6">
                <div
                    className="absolute right-6 top-6 z-10 rounded px-4 py-2 text-sm font-bold tracking-widest shadow-sm"
                    style={{
                        background: "var(--dashboard-chart-target-badge-bg)",
                        border: "1px solid var(--dashboard-chart-target-badge-border)",
                        color: "var(--dashboard-chart-target-badge-text)",
                    }}
                >
                    PER DOMAIN
                </div>
                <div className="flex min-h-[400px] w-full flex-grow items-center justify-center aspect-square sm:aspect-video xl:aspect-square">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={perDomainData}>
                            <PolarGrid stroke={gridColor} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 11, fontWeight: 700 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: axisMutedColor, fontSize: 10 }} tickCount={6} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active) return null;
                                    return renderTooltip(label, payload);
                                }}
                            />
                            <Radar
                                dataKey={() => 5}
                                stroke={chartSuccess}
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={false}
                                dot={false}
                                isAnimationActive={false}
                            />
                            <Radar
                                name="target"
                                dataKey="target"
                                stroke={chartDanger}
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: chartDanger }}
                                dot={{ r: 3, fill: chartDanger, strokeWidth: 0 }}
                            />
                            <Radar
                                name="nilai"
                                dataKey="nilai"
                                stroke={chartPrimary}
                                strokeWidth={2}
                                fill="transparent"
                                activeDot={{ r: 4, fill: chartPrimary }}
                                dot={(props: any) => {
                                    const { cx, cy, key } = props;
                                    return <rect key={key} x={cx - 3} y={cy - 3} width={6} height={6} fill={chartPrimary} transform={`rotate(45 ${cx} ${cy})`} />;
                                }}
                            />
                            <Legend content={renderLegend} verticalAlign="bottom" />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
