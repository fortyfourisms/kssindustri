import { useState, useRef, useEffect } from "react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { ikasDataStatic } from "@/data/ikas-data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { exportIkasPdf } from "@/lib/pdf-export";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Building2, Search, Shield, Radar, Activity, Edit, FileSpreadsheet, Loader2, CalendarDays, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadarChartIkas } from "@/components/RadarChartIkas";
import { IkasYearComparisonChart } from "@/components/IkasYearComparisonChart";

// ─── Tipe fallback default ikasDataDynamic ──────────────────────────────────
const defaultIkasData = {
    total_rata_rata: 0,
    total_kategori: "INPUT BELUM LENGKAP",
    identifikasi: { nilai_identifikasi: 0, kategori_identifikasi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0, nilai_subdomain5: 0 },
    proteksi: { nilai_proteksi: 0, kategori_proteksi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0, nilai_subdomain5: 0, nilai_subdomain6: 0 },
    deteksi: { nilai_deteksi: 0, kategori_deteksi: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0 },
    tanggulih: { nilai_tanggulih: 0, kategori_tanggulih: "INPUT BELUM LENGKAP", nilai_subdomain1: 0, nilai_subdomain2: 0, nilai_subdomain3: 0, nilai_subdomain4: 0 },
};

/** Petakan raw API response ke struktur ikasDataDynamic */
function mapApiToIkasData(raw: any) {
    if (!raw) return defaultIkasData;
    return {
        total_rata_rata: raw.nilai_kematangan ?? raw.total_rata_rata ?? 0,
        total_kategori: raw.kategori_kematangan_keamanan_siber ?? raw.total_kategori ?? "INPUT BELUM LENGKAP",
        identifikasi: {
            nilai_identifikasi: raw.identifikasi?.nilai_identifikasi ?? 0,
            kategori_identifikasi: raw.identifikasi?.kategori_tingkat_kematangan_domain ?? "INPUT BELUM LENGKAP",
            nilai_subdomain1: raw.identifikasi?.nilai_subdomain1 ?? 0,
            nilai_subdomain2: raw.identifikasi?.nilai_subdomain2 ?? 0,
            nilai_subdomain3: raw.identifikasi?.nilai_subdomain3 ?? 0,
            nilai_subdomain4: raw.identifikasi?.nilai_subdomain4 ?? 0,
            nilai_subdomain5: raw.identifikasi?.nilai_subdomain5 ?? 0,
        },
        proteksi: {
            nilai_proteksi: raw.proteksi?.nilai_proteksi ?? 0,
            kategori_proteksi: raw.proteksi?.kategori_tingkat_kematangan_domain ?? "INPUT BELUM LENGKAP",
            nilai_subdomain1: raw.proteksi?.nilai_subdomain1 ?? 0,
            nilai_subdomain2: raw.proteksi?.nilai_subdomain2 ?? 0,
            nilai_subdomain3: raw.proteksi?.nilai_subdomain3 ?? 0,
            nilai_subdomain4: raw.proteksi?.nilai_subdomain4 ?? 0,
            nilai_subdomain5: raw.proteksi?.nilai_subdomain5 ?? 0,
            nilai_subdomain6: raw.proteksi?.nilai_subdomain6 ?? 0,
        },
        deteksi: {
            nilai_deteksi: raw.deteksi?.nilai_deteksi ?? 0,
            kategori_deteksi: raw.deteksi?.kategori_tingkat_kematangan_domain ?? "INPUT BELUM LENGKAP",
            nilai_subdomain1: raw.deteksi?.nilai_subdomain1 ?? 0,
            nilai_subdomain2: raw.deteksi?.nilai_subdomain2 ?? 0,
            nilai_subdomain3: raw.deteksi?.nilai_subdomain3 ?? 0,
        },
        tanggulih: {
            nilai_tanggulih: raw.gulih?.nilai_gulih ?? raw.tanggulih?.nilai_tanggulih ?? 0,
            kategori_tanggulih: raw.gulih?.kategori_tingkat_kematangan_domain ?? raw.tanggulih?.kategori_tanggulih ?? "INPUT BELUM LENGKAP",
            nilai_subdomain1: raw.gulih?.nilai_subdomain1 ?? raw.tanggulih?.nilai_subdomain1 ?? 0,
            nilai_subdomain2: raw.gulih?.nilai_subdomain2 ?? raw.tanggulih?.nilai_subdomain2 ?? 0,
            nilai_subdomain3: raw.gulih?.nilai_subdomain3 ?? raw.tanggulih?.nilai_subdomain3 ?? 0,
            nilai_subdomain4: raw.gulih?.nilai_subdomain4 ?? raw.tanggulih?.nilai_subdomain4 ?? 0,
        },
    };
}

/** Ekstrak tahun dari string tanggal (ISO/DD-MM-YYYY/YYYY-MM-DD) */
function extractYear(tanggal: string): number | null {
    if (!tanggal) return null;
    // Coba parse ISO
    const d = new Date(tanggal);
    if (!isNaN(d.getTime())) return d.getFullYear();
    // Coba format DD-MM-YYYY
    const parts = tanggal.split(/[-/]/);
    if (parts.length === 3) {
        const yr = parseInt(parts[2]);
        if (!isNaN(yr) && yr > 1900) return yr;
        const yr2 = parseInt(parts[0]);
        if (!isNaN(yr2) && yr2 > 1900) return yr2;
    }
    return null;
}

export default function IKAS() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: user } = useQuery({ queryKey: ["me"], queryFn: api.getMe });
    const userData = user as any;
    const perusahaanId = userData?.id_perusahaan || userData?.perusahaan?.id;

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    const [ikasDataDynamic, setIkasDataDynamic] = useState(defaultIkasData);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    // ── Fetch seluruh data IKAS milik perusahaan user → GET /api/maturity/ikas ──────────
    const { data: ikasRaw, isLoading: ikasListLoading } = useQuery({
        queryKey: ["my-ikas", perusahaanId || "unknown"],
        queryFn: () => api.getMyIkas(perusahaanId),
        staleTime: 30_000,
        enabled: !!perusahaanId,
    });

    // Normalize: API may return single object or array
    const ikasList: any[] = ikasRaw
        ? Array.isArray(ikasRaw) ? ikasRaw : [ikasRaw]
        : [];

    // ── Hitung daftar tahun unik dari data yang tersedia ───────────────────
    const availableYears: number[] = ikasList
        ? Array.from(
            new Set(
                (ikasList as any[])
                    .map((item: any) => extractYear(item.tanggal ?? item.created_at ?? ""))
                    .filter((y): y is number => y !== null)
            )
        ).sort((a, b) => b - a)
        : [];

    // Buat kisaran tahun: 3 tahun ke belakang + tahun dari data, selalu ada opsi
    const recentYears = Array.from({ length: 4 }, (_, i) => currentYear - i);
    const yearOptions = Array.from(
        new Set([...recentYears, ...availableYears])
    ).sort((a, b) => b - a);

    // ── Cari data yang cocok untuk tahun yang dipilih ──────────────────────
    useEffect(() => {
        if (ikasList.length === 0) return;

        const match = ikasList.find((item: any) => {
            const yr = extractYear(item.tanggal ?? item.created_at ?? "");
            return yr === selectedYear;
        });

        setIkasDataDynamic(mapApiToIkasData(match ?? null));
    }, [ikasList, selectedYear]);

    const formatValue = (value: number | null) => {
        if (value === null || value === 0) return '-';
        return value;
    };

    const ikasDetailRows = [
        {
            domain: "Identifikasi",
            indikator: "Mengidentifikasi Peran dan tanggung jawab organisasi",
            target: ikasDataStatic.identifikasi.peran_tanggung_jawab,
            nilai: formatValue(ikasDataDynamic.identifikasi.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi),
            kategoriDomain: ikasDataDynamic.identifikasi.kategori_identifikasi,
        },
        {
            domain: "Identifikasi",
            indikator: "Menyusun strategi, kebijakan, dan prosedur Keamanan Siber",
            target: ikasDataStatic.identifikasi.strategi_kebijakan,
            nilai: formatValue(ikasDataDynamic.identifikasi.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi),
            kategoriDomain: ikasDataDynamic.identifikasi.kategori_identifikasi,
        },
        {
            domain: "Identifikasi",
            indikator: "Mengelola aset informasi",
            target: ikasDataStatic.identifikasi.aset_informasi,
            nilai: formatValue(ikasDataDynamic.identifikasi.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi),
            kategoriDomain: ikasDataDynamic.identifikasi.kategori_identifikasi,
        },
        {
            domain: "Identifikasi",
            indikator: "Menilai dan mengelola risiko Keamanan Siber",
            target: ikasDataStatic.identifikasi.risiko_keamanan,
            nilai: formatValue(ikasDataDynamic.identifikasi.nilai_subdomain4),
            nilaiDomain: formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi),
            kategoriDomain: ikasDataDynamic.identifikasi.kategori_identifikasi,
        },
        {
            domain: "Identifikasi",
            indikator: "Mengelola risiko rantai pasok",
            target: ikasDataStatic.identifikasi.rantai_pasok,
            nilai: formatValue(ikasDataDynamic.identifikasi.nilai_subdomain5),
            nilaiDomain: formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi),
            kategoriDomain: ikasDataDynamic.identifikasi.kategori_identifikasi,
        },
        {
            domain: "Proteksi",
            indikator: "Mengelola identitas, autentikasi, dan kendali akses",
            target: ikasDataStatic.proteksi.identitas_autentikasi,
            nilai: formatValue(ikasDataDynamic.proteksi.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataDynamic.proteksi.nilai_proteksi),
            kategoriDomain: ikasDataDynamic.proteksi.kategori_proteksi,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi aset fisik",
            target: ikasDataStatic.proteksi.aset_fisik,
            nilai: formatValue(ikasDataDynamic.proteksi.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataDynamic.proteksi.nilai_proteksi),
            kategoriDomain: ikasDataDynamic.proteksi.kategori_proteksi,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi data",
            target: ikasDataStatic.proteksi.data,
            nilai: formatValue(ikasDataDynamic.proteksi.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataDynamic.proteksi.nilai_proteksi),
            kategoriDomain: ikasDataDynamic.proteksi.kategori_proteksi,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi aplikasi",
            target: ikasDataStatic.proteksi.aplikasi,
            nilai: formatValue(ikasDataDynamic.proteksi.nilai_subdomain4),
            nilaiDomain: formatValue(ikasDataDynamic.proteksi.nilai_proteksi),
            kategoriDomain: ikasDataDynamic.proteksi.kategori_proteksi,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi jaringan",
            target: ikasDataStatic.proteksi.jaringan,
            nilai: formatValue(ikasDataDynamic.proteksi.nilai_subdomain5),
            nilaiDomain: formatValue(ikasDataDynamic.proteksi.nilai_proteksi),
            kategoriDomain: ikasDataDynamic.proteksi.kategori_proteksi,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi sumber daya manusia",
            target: ikasDataStatic.proteksi.sdm,
            nilai: formatValue(ikasDataDynamic.proteksi.nilai_subdomain6),
            nilaiDomain: formatValue(ikasDataDynamic.proteksi.nilai_proteksi),
            kategoriDomain: ikasDataDynamic.proteksi.kategori_proteksi,
        },
        {
            domain: "Deteksi",
            indikator: "Mengelola deteksi Peristiwa Siber",
            target: ikasDataStatic.deteksi.deteksi_peristiwa,
            nilai: formatValue(ikasDataDynamic.deteksi.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataDynamic.deteksi.nilai_deteksi),
            kategoriDomain: ikasDataDynamic.deteksi.kategori_deteksi,
        },
        {
            domain: "Deteksi",
            indikator: "Menganalisis anomali dan Peristiwa Siber",
            target: ikasDataStatic.deteksi.anomali_peristiwa,
            nilai: formatValue(ikasDataDynamic.deteksi.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataDynamic.deteksi.nilai_deteksi),
            kategoriDomain: ikasDataDynamic.deteksi.kategori_deteksi,
        },
        {
            domain: "Deteksi",
            indikator: "Memantau Peristiwa Siber berkelanjutan",
            target: ikasDataStatic.deteksi.pemantauan_berkelanjutan,
            nilai: formatValue(ikasDataDynamic.deteksi.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataDynamic.deteksi.nilai_deteksi),
            kategoriDomain: ikasDataDynamic.deteksi.kategori_deteksi,
        },
        {
            domain: "Tanggulih",
            indikator: "Menyusun perencanaan penanggulangan dan pemulihan Insiden Siber",
            target: ikasDataStatic.tanggulih.perencanaan_pemulihan,
            nilai: formatValue(ikasDataDynamic.tanggulih.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataDynamic.tanggulih.nilai_tanggulih),
            kategoriDomain: ikasDataDynamic.tanggulih.kategori_tanggulih,
        },
        {
            domain: "Tanggulih",
            indikator: "Menganalisis dan melaporkan Insiden Siber",
            target: ikasDataStatic.tanggulih.analisis_pelaporan,
            nilai: formatValue(ikasDataDynamic.tanggulih.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataDynamic.tanggulih.nilai_tanggulih),
            kategoriDomain: ikasDataDynamic.tanggulih.kategori_tanggulih,
        },
        {
            domain: "Tanggulih",
            indikator: "Melaksanakan penanggulangan dan pemulihan Insiden Siber",
            target: ikasDataStatic.tanggulih.pelaksanaan_pemulihan,
            nilai: formatValue(ikasDataDynamic.tanggulih.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataDynamic.tanggulih.nilai_tanggulih),
            kategoriDomain: ikasDataDynamic.tanggulih.kategori_tanggulih,
        },
        {
            domain: "Tanggulih",
            indikator: "Meningkatkan keamanan setelah terjadinya Insiden Siber",
            target: ikasDataStatic.tanggulih.peningkatan_keamanan,
            nilai: formatValue(ikasDataDynamic.tanggulih.nilai_subdomain4),
            nilaiDomain: formatValue(ikasDataDynamic.tanggulih.nilai_tanggulih),
            kategoriDomain: ikasDataDynamic.tanggulih.kategori_tanggulih,
        },
    ];

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isValidExt = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        if (!isValidExt) {
            toast({ title: "Gagal", description: "Format file harus .xlsx atau .xls", variant: "destructive" });
            event.target.value = '';
            return;
        }

        await uploadExcel(file);
    };

    const uploadExcel = async (file: File) => {
        setLoading(true);
        try {
            // POST /api/maturity/ikas/import
            await api.importIkasExcel(file);
            toast({ title: "Berhasil", description: "Upload berhasil! Data IKAS telah diperbarui." });
            // Refresh daftar IKAS setelah import
            queryClient.invalidateQueries({ queryKey: ["my-ikas", perusahaanId || "unknown"] });
        } catch (error: any) {
            toast({ title: "Gagal Upload", description: error.message || "Terjadi kesalahan saat upload file.", variant: "destructive" });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Styling helpers dari Vue CSS
    const domainCss = "text-white font-extrabold text-center text-[11px] tracking-wider uppercase";

    const isHistoricalView = selectedYear !== currentYear;

    return (
        <RequireCompanyProfile>
            <div className="max-w-7xl mx-auto space-y-6">

                <PageHeader
                    icon={Building2}
                    title={`IKAS - ${userData?.perusahaan?.nama_perusahaan || "Stakeholder"}`}
                    subtitle={userData?.perusahaan?.subSektor?.name || undefined}
                />


                {/* ── Year Tab Bar ──────────────────────────────────────── */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/70 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                            <CalendarDays className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Tahun Data</span>
                        </div>
                        <div className="w-px h-5 bg-slate-200" />
                        <div className="flex items-center gap-2 flex-wrap">
                            {yearOptions.map(year => {
                                const hasData = availableYears.includes(year);
                                const isSelected = selectedYear === year;
                                return (
                                    <button
                                        key={year}
                                        id={`ikas-year-tab-${year}`}
                                        type="button"
                                        onClick={() => setSelectedYear(year)}
                                        className={`relative px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                            }`}
                                    >
                                        {year}
                                        {hasData && !isSelected && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white" title="Ada data" />
                                        )}
                                        {year === currentYear && isSelected && (
                                            <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Terkini</span>
                                        )}
                                        {year !== currentYear && isSelected && (
                                            <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Historis</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {isHistoricalView && (
                            <button
                                type="button"
                                onClick={() => setSelectedYear(currentYear)}
                                className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors shrink-0"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                Kembali ke terkini
                            </button>
                        )}
                    </div>
                </div>

                {/* Year Comparison Charts */}
                <IkasYearComparisonChart
                    ikasList={ikasList as any[] | undefined}
                    availableYears={availableYears}
                />

                <div className={`bg-white/70 backdrop-blur-md border rounded-2xl p-6 shadow-sm transition-colors ${isHistoricalView ? 'border-amber-200/80' : 'border-slate-200/60'}`}>

                    {/* Loading skeleton */}
                    {ikasListLoading && (
                        <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Memuat data IKAS...</span>
                        </div>
                    )}

                    {!ikasListLoading && (
                        <>
                            {/* Domain summary cards (Strip) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {/* Identifikasi */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-blue-900 to-blue-600 shadow-lg shadow-blue-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30 text-white">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <div className="text-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi)}</div>
                                        <div className="text-[11px] font-bold text-white/80 uppercase tracking-wide mt-1">Identifikasi</div>
                                        <div className="text-[11px] text-white/90 italic mt-0.5 opacity-90">{ikasDataDynamic.identifikasi.kategori_identifikasi}</div>
                                    </div>
                                </div>

                                {/* Proteksi */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-purple-900 to-purple-600 shadow-lg shadow-purple-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30 text-white">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div className="text-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataDynamic.proteksi.nilai_proteksi)}</div>
                                        <div className="text-[11px] font-bold text-white/80 uppercase tracking-wide mt-1">Proteksi</div>
                                        <div className="text-[11px] text-white/90 italic mt-0.5 opacity-90">{ikasDataDynamic.proteksi.kategori_proteksi}</div>
                                    </div>
                                </div>

                                {/* Deteksi */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-amber-900 to-amber-600 shadow-lg shadow-amber-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30 text-white">
                                        <Radar className="w-5 h-5" />
                                    </div>
                                    <div className="text-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataDynamic.deteksi.nilai_deteksi)}</div>
                                        <div className="text-[11px] font-bold text-white/80 uppercase tracking-wide mt-1">Deteksi</div>
                                        <div className="text-[11px] text-white/90 italic mt-0.5 opacity-90">{ikasDataDynamic.deteksi.kategori_deteksi}</div>
                                    </div>
                                </div>

                                {/* Penanggulangan */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-emerald-900 to-emerald-600 shadow-lg shadow-emerald-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30 text-white">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="text-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataDynamic.tanggulih.nilai_tanggulih)}</div>
                                        <div className="text-[11px] font-bold text-white/80 uppercase tracking-wide mt-1 leading-tight">Penanggulangan &amp; Pemulihan</div>
                                        <div className="text-[11px] text-white/90 italic mt-0.5 opacity-90">{ikasDataDynamic.tanggulih.kategori_tanggulih}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Maturity Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-[12px] border-collapse bg-white">
                                    <thead className="bg-[#f3f4f6] text-slate-600 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th rowSpan={2} colSpan={2} className="border-r border-slate-200 p-2 text-center align-middle whitespace-pre-line leading-tight text-xs">
                                                {"Tingkat Kematangan\nKeamanan Siber"}
                                            </th>
                                            <th colSpan={5} className="border-b border-slate-200 p-2 text-center text-sm">{selectedYear}</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border-r border-slate-200 p-2">Target Nilai Kematangan</th>
                                            <th className="border-r border-slate-200 p-2">Nilai Kematangan</th>
                                            <th rowSpan={2} className="border-r border-slate-200 p-2 align-middle max-w-[100px]">Nilai Kematangan per-Domain</th>
                                            <th rowSpan={2} className="border-r border-slate-200 p-2 align-middle max-w-[120px]">Kategori Tingkat Kematangan per-Domain</th>
                                            <th rowSpan={2} className="p-2 align-middle whitespace-pre-line max-w-[150px]">
                                                {"Kategori Tingkat Kematangan\nKeamanan Siber"}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th colSpan={2} className="border-r border-t border-slate-200 p-2 text-center bg-[#1e3a5f] text-white">Total</th>
                                            <th className="border-r border-slate-200 p-2 text-center bg-[#1e3a5f] text-white">2.51</th>
                                            <th className="border-r border-slate-200 p-2 text-center bg-[#1e3a5f] text-white">{formatValue(ikasDataDynamic.total_rata_rata)}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* IDENTIFIKASI */}
                                        <tr>
                                            <td rowSpan={5} className={`bg-gradient-to-b from-blue-800 to-blue-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>IDENTIFIKASI</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengidentifikasi Peran dan tanggung jawab organisasi</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.peran_tanggung_jawab}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.identifikasi.nilai_subdomain1)}</td>
                                            <td rowSpan={5} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi)}</td>
                                            <td rowSpan={5} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataDynamic.identifikasi.kategori_identifikasi}</td>
                                            <td rowSpan={18} className="p-4 border border-slate-200 text-center font-black text-xl text-[#1e3a5f] tracking-wide leading-snug">{ikasDataDynamic.total_kategori}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menyusun strategi, kebijakan, dan prosedur Keamanan Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.strategi_kebijakan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.identifikasi.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola aset informasi</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.aset_informasi}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.identifikasi.nilai_subdomain3)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menilai dan mengelola risiko Keamanan Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.risiko_keamanan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.identifikasi.nilai_subdomain4)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola risiko rantai pasok</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.rantai_pasok}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.identifikasi.nilai_subdomain5)}</td>
                                        </tr>

                                        {/* PROTEKSI */}
                                        <tr>
                                            <td rowSpan={6} className={`bg-gradient-to-b from-purple-800 to-purple-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>PROTEKSI</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola identitas, autentikasi, dan kendali akses</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.identitas_autentikasi}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.proteksi.nilai_subdomain1)}</td>
                                            <td rowSpan={6} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataDynamic.proteksi.nilai_proteksi)}</td>
                                            <td rowSpan={6} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataDynamic.proteksi.kategori_proteksi}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi aset fisik</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.aset_fisik}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.proteksi.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi data</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.data}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.proteksi.nilai_subdomain3)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi aplikasi</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.aplikasi}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.proteksi.nilai_subdomain4)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi jaringan</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.jaringan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.proteksi.nilai_subdomain5)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi sumber daya manusia</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.sdm}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.proteksi.nilai_subdomain6)}</td>
                                        </tr>

                                        {/* DETEKSI */}
                                        <tr>
                                            <td rowSpan={3} className={`bg-gradient-to-b from-amber-800 to-amber-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>DETEKSI</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola deteksi Peristiwa Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.deteksi.deteksi_peristiwa}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.deteksi.nilai_subdomain1)}</td>
                                            <td rowSpan={3} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataDynamic.deteksi.nilai_deteksi)}</td>
                                            <td rowSpan={3} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataDynamic.deteksi.kategori_deteksi}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menganalisis anomali dan Peristiwa Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.deteksi.anomali_peristiwa}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.deteksi.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Memantau Peristiwa Siber berkelanjutan</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.deteksi.pemantauan_berkelanjutan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.deteksi.nilai_subdomain3)}</td>
                                        </tr>

                                        {/* PENANGGULANGAN & PEMULIHAN */}
                                        <tr>
                                            <td rowSpan={4} className={`bg-gradient-to-b from-emerald-800 to-emerald-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>TANGGULIH</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menyusun perencanaan penanggulangan dan pemulihan Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.tanggulih.perencanaan_pemulihan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.tanggulih.nilai_subdomain1)}</td>
                                            <td rowSpan={4} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataDynamic.tanggulih.nilai_tanggulih)}</td>
                                            <td rowSpan={4} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataDynamic.tanggulih.kategori_tanggulih}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menganalisis dan melaporkan Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.tanggulih.analisis_pelaporan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.tanggulih.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melaksanakan penanggulangan dan pemulihan Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.tanggulih.pelaksanaan_pemulihan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.tanggulih.nilai_subdomain3)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Meningkatkan keamanan setelah terjadinya Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.tanggulih.peningkatan_keamanan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataDynamic.tanggulih.nilai_subdomain4)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Bar */}
                            <div className="flex flex-wrap justify-end items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFile}
                                />
                                <button
                                    type="button"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-yellow-400 to-amber-500 text-white font-bold text-sm shadow-md shadow-yellow-500/30 hover:shadow-yellow-500/45 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 whitespace-nowrap"
                                    onClick={() => navigate('/dashboard/form-ikas')}
                                >
                                    <Edit className="w-4 h-4" /> Input Data
                                </button>
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>
                                    ) : (
                                        <><FileSpreadsheet className="w-4 h-4" /> Upload Excel</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            exportIkasPdf({
                                                companyName: userData?.perusahaan?.nama_perusahaan,
                                                selectedYear,
                                                totalCategory: ikasDataDynamic.total_kategori,
                                                totalScore: formatValue(ikasDataDynamic.total_rata_rata),
                                                summaryRows: [
                                                    { label: "Nilai Identifikasi", value: formatValue(ikasDataDynamic.identifikasi.nilai_identifikasi) },
                                                    { label: "Nilai Proteksi", value: formatValue(ikasDataDynamic.proteksi.nilai_proteksi) },
                                                    { label: "Nilai Deteksi", value: formatValue(ikasDataDynamic.deteksi.nilai_deteksi) },
                                                    { label: "Nilai Tanggulih", value: formatValue(ikasDataDynamic.tanggulih.nilai_tanggulih) },
                                                ],
                                                detailRows: ikasDetailRows,
                                            });
                                        } catch (error: any) {
                                            toast({
                                                title: "Export PDF gagal",
                                                description: error?.message || "Tidak dapat membuka jendela export.",
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Download className="w-4 h-4" /> Export PDF
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Radar Charts Section */}
                <RadarChartIkas ikasDataDynamic={ikasDataDynamic} />


            </div>
        </RequireCompanyProfile>
    );
}
