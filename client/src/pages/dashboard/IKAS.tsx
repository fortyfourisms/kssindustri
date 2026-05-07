import { useState, useRef, useMemo } from "react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { ikasDataStatic } from "@/data/ikas-data";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Building2, Search, Shield, Radar, Activity, Edit, FileSpreadsheet, Loader2, CalendarDays, BadgeCheck, Clock3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadarChartIkas } from "@/components/RadarChartIkas";
import { IkasYearComparisonChart } from "@/components/IkasYearComparisonChart";
import { ikasService } from "@/services/ikas.service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton, SkeletonTable, SkeletonText } from "@/components/ui/skeleton";
import { getIkasEditRequestStatus, getIkasEditStatusMeta } from "@/lib/ikas-edit-request";
import { mapIkasToView, type IkasViewData } from "@/types/ikas.types";
import { buildIkasViewFromJawaban } from "@/lib/ikas-live-summary";

// ─── Tipe fallback default ikasDataDynamic ──────────────────────────────────
const defaultIkasData: IkasViewData = mapIkasToView(null);

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

function getRecordTimeValue(record: Record<string, any> | null | undefined) {
    const time = new Date(
        record?.updated_at ??
        record?.created_at ??
        record?.tanggal ??
        0
    ).getTime();
    return Number.isFinite(time) ? time : 0;
}

function normalizeScopedIkasId(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim();
    return normalized || null;
}

function getVerificationStatus(raw: Record<string, any> | null | undefined) {
    if (typeof raw?.is_validated === "boolean") {
        return raw.is_validated ? "Terverifikasi" : "Menunggu verifikasi";
    }

    const value = String(
        raw?.status_verifikasi ??
        raw?.verifikasi ??
        raw?.validasi ??
        raw?.status ??
        ""
    ).trim().toLowerCase();

    if (!value) return "Belum diverifikasi";
    if (value.includes("tolak") || value.includes("reject") || value.includes("revisi")) return "Perlu revisi";
    if (value.includes("verif") || value.includes("valid") || value.includes("approve") || value.includes("setuju")) return "Terverifikasi";
    return "Menunggu verifikasi";
}

function getVerificationBadgeClasses(status: string) {
    if (status === "Terverifikasi") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "Perlu revisi") {
        return "border-rose-200 bg-rose-50 text-rose-700";
    }

    if (status === "Menunggu verifikasi") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-600";
}

const MIN_EDIT_REASON_LENGTH = 10;

export default function IKAS() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: user } = useQuery({ queryKey: ["me"], queryFn: api.getMe });
    const userData = user as any;
    const perusahaanId = userData?.id_perusahaan || userData?.perusahaan?.id;

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    const [loading, setLoading] = useState(false);
    const [showEditRequestModal, setShowEditRequestModal] = useState(false);
    const [editReason, setEditReason] = useState("");
    const [isSubmittingEditRequest, setIsSubmittingEditRequest] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    // ── Fetch seluruh data IKAS milik perusahaan user → GET /api/maturity/ikas ──────────
    const { data: ikasRaw, isLoading: ikasListLoading } = useQuery({
        queryKey: ["my-ikas", perusahaanId || "unknown"],
        queryFn: () => api.getMyIkas(perusahaanId),
        staleTime: 30_000,
        enabled: !!perusahaanId,
    });
    const [
        jawabanIdentifikasiQuery,
        jawabanProteksiQuery,
        jawabanDeteksiQuery,
        jawabanGulihQuery,
    ] = useQueries({
        queries: [
            { queryKey: ["jawaban-identifikasi"], queryFn: () => ikasService.getJawabanIdentifikasi(), enabled: !!perusahaanId },
            { queryKey: ["jawaban-proteksi"], queryFn: () => ikasService.getJawabanProteksi(), enabled: !!perusahaanId },
            { queryKey: ["jawaban-deteksi"], queryFn: () => ikasService.getJawabanDeteksi(), enabled: !!perusahaanId },
            { queryKey: ["jawaban-gulih"], queryFn: () => ikasService.getJawabanGulih(), enabled: !!perusahaanId },
        ],
    });

    // Normalize: API may return single object or array
    const ikasList: any[] = useMemo(() => (
        ikasRaw
            ? (Array.isArray(ikasRaw) ? ikasRaw : [ikasRaw])
            : []
    ), [ikasRaw]);

    // ── Hitung daftar tahun unik dari data yang tersedia ───────────────────
    const availableYears: number[] = useMemo(() => (
        Array.from(
            new Set(
                ikasList
                    .map((item: any) => extractYear(item.tanggal ?? item.created_at ?? ""))
                    .filter((y): y is number => y !== null)
            )
        ).sort((a, b) => b - a)
    ), [ikasList]);

    // Buat kisaran tahun: 3 tahun ke belakang + tahun dari data, selalu ada opsi
    const recentYears = useMemo(
        () => Array.from({ length: 4 }, (_, i) => currentYear - i),
        [currentYear]
    );
    const yearOptions = useMemo(() => (
        Array.from(new Set([...recentYears, ...availableYears])).sort((a, b) => b - a)
    ), [recentYears, availableYears]);

    // ── Cari data yang cocok untuk tahun yang dipilih ──────────────────────
    const selectedIkasRecord = useMemo(() => {
        if (ikasList.length === 0) return null;

        return ikasList
            .filter((item: any) => {
                const yr = extractYear(item.tanggal ?? item.created_at ?? "");
                return yr === selectedYear;
            })
            .sort((a: any, b: any) => getRecordTimeValue(b) - getRecordTimeValue(a))[0] ?? null;
    }, [ikasList, selectedYear]);
    const ikasDataDynamic: IkasViewData = useMemo(
        () => mapIkasToView(selectedIkasRecord ?? null),
        [selectedIkasRecord]
    );

    const allJawabanIkas = useMemo(() => {
        const selectedIkasId = normalizeScopedIkasId(selectedIkasRecord?.id);
        return [
            ...((jawabanIdentifikasiQuery.data ?? []) as Array<Record<string, any>>),
            ...((jawabanProteksiQuery.data ?? []) as Array<Record<string, any>>),
            ...((jawabanDeteksiQuery.data ?? []) as Array<Record<string, any>>),
            ...((jawabanGulihQuery.data ?? []) as Array<Record<string, any>>),
        ].filter((item) => {
            if (!selectedIkasId) return true;
            return normalizeScopedIkasId(item?.ikas_id) === selectedIkasId;
        });
    }, [
        jawabanIdentifikasiQuery.data,
        jawabanProteksiQuery.data,
        jawabanDeteksiQuery.data,
        jawabanGulihQuery.data,
        selectedIkasRecord?.id,
    ]);

    const liveIkasData = useMemo(() => {
        const selectedIkasId = normalizeScopedIkasId(selectedIkasRecord?.id);
        const filterByIkasId = <T extends { ikas_id?: string | number }>(items: T[]) => (
            items.filter((item) => {
                if (!selectedIkasId) return true;
                return normalizeScopedIkasId(item?.ikas_id) === selectedIkasId;
            })
        );

        return buildIkasViewFromJawaban({
            identifikasi: filterByIkasId((jawabanIdentifikasiQuery.data ?? []) as Array<any>),
            proteksi: filterByIkasId((jawabanProteksiQuery.data ?? []) as Array<any>),
            deteksi: filterByIkasId((jawabanDeteksiQuery.data ?? []) as Array<any>),
            gulih: filterByIkasId((jawabanGulihQuery.data ?? []) as Array<any>),
        });
    }, [
        jawabanIdentifikasiQuery.data,
        jawabanProteksiQuery.data,
        jawabanDeteksiQuery.data,
        jawabanGulihQuery.data,
        selectedIkasRecord?.id,
    ]);

    const ikasDataForDisplay: IkasViewData = liveIkasData ?? ikasDataDynamic;

    const statusVerifikasiIkas = useMemo(() => {
        const selectedStatus = getVerificationStatus(selectedIkasRecord);
        if (selectedStatus !== "Belum diverifikasi") {
            return selectedStatus;
        }

        const validationFlags = allJawabanIkas
            .map((item) => item.is_validated)
            .filter((value): value is boolean => typeof value === "boolean");

        if (validationFlags.length > 0) {
            if (validationFlags.every(Boolean)) return "Terverifikasi";
            return "Menunggu verifikasi";
        }

        const validasiValues = allJawabanIkas
            .map((item) => String(item.validasi ?? "").trim().toLowerCase())
            .filter(Boolean);

        if (validasiValues.length === 0) return "Belum diverifikasi";
        if (validasiValues.some((value) => value.includes("tolak") || value.includes("reject") || value.includes("revisi"))) {
            return "Perlu revisi";
        }
        if (validasiValues.every((value) => value.includes("verif") || value.includes("valid") || value.includes("approve") || value.includes("setuju"))) {
            return "Terverifikasi";
        }
        return "Menunggu verifikasi";
    }, [allJawabanIkas, selectedIkasRecord]);

    const verificationBadgeClasses = getVerificationBadgeClasses(statusVerifikasiIkas);
    const isIkasVerified = statusVerifikasiIkas === "Terverifikasi";
    const editRequestStatus = getIkasEditRequestStatus(selectedIkasRecord);
    const editRequestMeta = getIkasEditStatusMeta(editRequestStatus);
    const isEditApproved = editRequestStatus === "approved";
    const isPendingApproval = editRequestStatus === "pending_approval";
    const canDirectEdit = !!selectedIkasRecord && (!isIkasVerified || isEditApproved);
    const shouldRequestEdit = !!selectedIkasRecord && isIkasVerified && !isEditApproved;
    const primaryActionLabel = !selectedIkasRecord
        ? "Input Data"
        : canDirectEdit
            ? "Edit Data"
            : isPendingApproval
                ? "Menunggu Persetujuan Admin"
                : "Ajukan Perubahan Data";
    const latestEditRequest = selectedIkasRecord?.latest_edit_request
        ?? selectedIkasRecord?.last_edit_request
        ?? selectedIkasRecord?.edit_request
        ?? selectedIkasRecord?.request_edit
        ?? selectedIkasRecord?.latest_request_edit
        ?? null;
    const latestEditReason = latestEditRequest?.reason ?? latestEditRequest?.alasan ?? latestEditRequest?.catatan_user ?? "";
    const latestAdminNote = latestEditRequest?.catatan ?? "";
    const isImportLocked = !!selectedIkasRecord && isIkasVerified && !isEditApproved;

    const formatValue = (value: number | null | undefined) => {
        if (value === null || value === undefined || value === 0) return '-';
        return Number(value).toFixed(2);
    };

    const ikasDetailRows = [
        {
            domain: "Identifikasi",
            indikator: "Mengidentifikasi Peran dan tanggung jawab organisasi",
            target: ikasDataStatic.identifikasi.peran_tanggung_jawab,
            nilai: formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataForDisplay.identifikasi.nilai),
            kategoriDomain: ikasDataForDisplay.identifikasi.kategori,
        },
        {
            domain: "Identifikasi",
            indikator: "Menyusun strategi, kebijakan, dan prosedur Keamanan Siber",
            target: ikasDataStatic.identifikasi.strategi_kebijakan,
            nilai: formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataForDisplay.identifikasi.nilai),
            kategoriDomain: ikasDataForDisplay.identifikasi.kategori,
        },
        {
            domain: "Identifikasi",
            indikator: "Mengelola aset informasi",
            target: ikasDataStatic.identifikasi.aset_informasi,
            nilai: formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataForDisplay.identifikasi.nilai),
            kategoriDomain: ikasDataForDisplay.identifikasi.kategori,
        },
        {
            domain: "Identifikasi",
            indikator: "Menilai dan mengelola risiko Keamanan Siber",
            target: ikasDataStatic.identifikasi.risiko_keamanan,
            nilai: formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain4),
            nilaiDomain: formatValue(ikasDataForDisplay.identifikasi.nilai),
            kategoriDomain: ikasDataForDisplay.identifikasi.kategori,
        },
        {
            domain: "Identifikasi",
            indikator: "Mengelola risiko rantai pasok",
            target: ikasDataStatic.identifikasi.rantai_pasok,
            nilai: formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain5),
            nilaiDomain: formatValue(ikasDataForDisplay.identifikasi.nilai),
            kategoriDomain: ikasDataForDisplay.identifikasi.kategori,
        },
        {
            domain: "Proteksi",
            indikator: "Mengelola identitas, autentikasi, dan kendali akses",
            target: ikasDataStatic.proteksi.identitas_autentikasi,
            nilai: formatValue(ikasDataForDisplay.proteksi.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataForDisplay.proteksi.nilai),
            kategoriDomain: ikasDataForDisplay.proteksi.kategori,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi aset fisik",
            target: ikasDataStatic.proteksi.aset_fisik,
            nilai: formatValue(ikasDataForDisplay.proteksi.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataForDisplay.proteksi.nilai),
            kategoriDomain: ikasDataForDisplay.proteksi.kategori,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi data",
            target: ikasDataStatic.proteksi.data,
            nilai: formatValue(ikasDataForDisplay.proteksi.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataForDisplay.proteksi.nilai),
            kategoriDomain: ikasDataForDisplay.proteksi.kategori,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi aplikasi",
            target: ikasDataStatic.proteksi.aplikasi,
            nilai: formatValue(ikasDataForDisplay.proteksi.nilai_subdomain4),
            nilaiDomain: formatValue(ikasDataForDisplay.proteksi.nilai),
            kategoriDomain: ikasDataForDisplay.proteksi.kategori,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi jaringan",
            target: ikasDataStatic.proteksi.jaringan,
            nilai: formatValue(ikasDataForDisplay.proteksi.nilai_subdomain5),
            nilaiDomain: formatValue(ikasDataForDisplay.proteksi.nilai),
            kategoriDomain: ikasDataForDisplay.proteksi.kategori,
        },
        {
            domain: "Proteksi",
            indikator: "Melindungi sumber daya manusia",
            target: ikasDataStatic.proteksi.sdm,
            nilai: formatValue(ikasDataForDisplay.proteksi.nilai_subdomain6),
            nilaiDomain: formatValue(ikasDataForDisplay.proteksi.nilai),
            kategoriDomain: ikasDataForDisplay.proteksi.kategori,
        },
        {
            domain: "Deteksi",
            indikator: "Mengelola deteksi Peristiwa Siber",
            target: ikasDataStatic.deteksi.deteksi_peristiwa,
            nilai: formatValue(ikasDataForDisplay.deteksi.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataForDisplay.deteksi.nilai),
            kategoriDomain: ikasDataForDisplay.deteksi.kategori,
        },
        {
            domain: "Deteksi",
            indikator: "Menganalisis anomali dan Peristiwa Siber",
            target: ikasDataStatic.deteksi.anomali_peristiwa,
            nilai: formatValue(ikasDataForDisplay.deteksi.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataForDisplay.deteksi.nilai),
            kategoriDomain: ikasDataForDisplay.deteksi.kategori,
        },
        {
            domain: "Deteksi",
            indikator: "Memantau Peristiwa Siber berkelanjutan",
            target: ikasDataStatic.deteksi.pemantauan_berkelanjutan,
            nilai: formatValue(ikasDataForDisplay.deteksi.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataForDisplay.deteksi.nilai),
            kategoriDomain: ikasDataForDisplay.deteksi.kategori,
        },
        {
            domain: "Gulih",
            indikator: "Menyusun perencanaan penanggulangan dan pemulihan Insiden Siber",
            target: ikasDataStatic.gulih.perencanaan_pemulihan,
            nilai: formatValue(ikasDataForDisplay.gulih.nilai_subdomain1),
            nilaiDomain: formatValue(ikasDataForDisplay.gulih.nilai),
            kategoriDomain: ikasDataForDisplay.gulih.kategori,
        },
        {
            domain: "Gulih",
            indikator: "Menganalisis dan melaporkan Insiden Siber",
            target: ikasDataStatic.gulih.analisis_pelaporan,
            nilai: formatValue(ikasDataForDisplay.gulih.nilai_subdomain2),
            nilaiDomain: formatValue(ikasDataForDisplay.gulih.nilai),
            kategoriDomain: ikasDataForDisplay.gulih.kategori,
        },
        {
            domain: "Gulih",
            indikator: "Melaksanakan penanggulangan dan pemulihan Insiden Siber",
            target: ikasDataStatic.gulih.pelaksanaan_pemulihan,
            nilai: formatValue(ikasDataForDisplay.gulih.nilai_subdomain3),
            nilaiDomain: formatValue(ikasDataForDisplay.gulih.nilai),
            kategoriDomain: ikasDataForDisplay.gulih.kategori,
        },
        {
            domain: "Gulih",
            indikator: "Meningkatkan keamanan setelah terjadinya Insiden Siber",
            target: ikasDataStatic.gulih.peningkatan_keamanan,
            nilai: formatValue(ikasDataForDisplay.gulih.nilai_subdomain4),
            nilaiDomain: formatValue(ikasDataForDisplay.gulih.nilai),
            kategoriDomain: ikasDataForDisplay.gulih.kategori,
        },
    ];

    const ikasRowsByDomain = useMemo(() => {
        return ikasDetailRows.reduce<Record<string, typeof ikasDetailRows>>((acc, row) => {
            if (!acc[row.domain]) {
                acc[row.domain] = [];
            }
            acc[row.domain].push(row);
            return acc;
        }, {});
    }, [ikasDetailRows]);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isImportLocked) {
            toast({
                title: "Upload Excel dikunci",
                description: "Data IKAS yang sudah terverifikasi hanya bisa diubah setelah pengajuan perubahan disetujui admin.",
                variant: "destructive",
            });
            event.target.value = '';
            return;
        }

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

    const handlePrimaryAction = () => {
        if (!selectedIkasRecord) {
            navigate('/dashboard/form-ikas');
            return;
        }

        if (canDirectEdit) {
            navigate('/dashboard/form-ikas');
            return;
        }

        if (shouldRequestEdit && !isPendingApproval) {
            setShowEditRequestModal(true);
        }
    };

    const closeEditRequestModal = () => {
        setShowEditRequestModal(false);
        setEditReason("");
    };

    const handleSubmitEditRequest = async () => {
        if (!selectedIkasRecord?.id) return;
        if (editReason.trim().length < MIN_EDIT_REASON_LENGTH) {
            toast({
                title: "Alasan belum cukup",
                description: `Tuliskan alasan pengajuan perubahan data IKAS minimal ${MIN_EDIT_REASON_LENGTH} karakter.`,
                variant: "destructive",
            });
            return;
        }

        setIsSubmittingEditRequest(true);
        try {
            await api.requestIkasEdit(selectedIkasRecord.id, { reason: editReason.trim() });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["my-ikas", perusahaanId || "unknown"] }),
                queryClient.invalidateQueries({ queryKey: ["jawaban-identifikasi"] }),
                queryClient.invalidateQueries({ queryKey: ["jawaban-proteksi"] }),
                queryClient.invalidateQueries({ queryKey: ["jawaban-deteksi"] }),
                queryClient.invalidateQueries({ queryKey: ["jawaban-gulih"] }),
            ]);
            closeEditRequestModal();
            toast({
                title: "Pengajuan berhasil dikirim",
                description: "Status perubahan data kini menunggu persetujuan admin.",
            });
        } catch (error: any) {
            toast({
                title: "Gagal mengajukan perubahan",
                description: error?.message || "Terjadi kesalahan saat mengirim permohonan perubahan data.",
                variant: "destructive",
            });
        } finally {
            setIsSubmittingEditRequest(false);
        }
    };

    const editReasonLength = editReason.trim().length;
    const isEditReasonValid = editReasonLength >= MIN_EDIT_REASON_LENGTH;

    return (
        <RequireCompanyProfile>
            <div className="max-w-7xl mx-auto space-y-6">

                <PageHeader
                    icon={Building2}
                    title={`IKAS - ${userData?.perusahaan?.nama_perusahaan || "Stakeholder"}`}
                    subtitle={userData?.perusahaan?.subSektor?.name || undefined}
                />


                {/* ── Year Tab Bar ──────────────────────────────────────── */}
                {/* Year Comparison Charts */}
                {ikasListLoading ? (
                    <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm">
                        <div className="skeleton-stack-lg">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <Skeleton className="h-7 w-48" />
                                <Skeleton className="h-9 w-28 rounded-xl" />
                            </div>
                            <SkeletonText lines={2} size="md" />
                            <Skeleton className="h-[320px] rounded-[1.5rem]" />
                        </div>
                    </div>
                ) : (
                    <IkasYearComparisonChart
                        ikasList={ikasList as any[] | undefined}
                        availableYears={availableYears}
                    />
                )}

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
                                        className={`button-force-white relative px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${isSelected
                                            ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 scale-105'
                                            : 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800'
                                            }`}
                                    >
                                        {year}
                                        {hasData && !isSelected && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white" title="Ada data" />
                                        )}
                                        {year === currentYear && isSelected && (
                                            <span className="button-force-white ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">Terkini</span>
                                        )}
                                        {year !== currentYear && isSelected && (
                                            <span className="button-force-white ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">Historis</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {isHistoricalView && (
                            <button
                                type="button"
                                onClick={() => setSelectedYear(currentYear)}
                                className="button-force-white ml-auto flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-3 py-2 text-xs font-semibold transition-all hover:from-blue-800 hover:via-blue-700 hover:to-cyan-600"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                Kembali ke terkini
                            </button>
                        )}
                    </div>
                </div>

                <div className={`bg-white/70 backdrop-blur-md border rounded-2xl p-6 shadow-sm transition-colors ${isHistoricalView ? 'border-amber-200/80' : 'border-slate-200/60'}`}>
                    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status Validasi IKAS</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Menampilkan status validasi untuk data tahun {selectedYear}.
                            </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-bold ${verificationBadgeClasses}`}>
                            {statusVerifikasiIkas === "Terverifikasi" ? (
                                <BadgeCheck className="h-4 w-4" />
                            ) : (
                                <Clock3 className="h-4 w-4" />
                            )}
                            {statusVerifikasiIkas}
                        </div>
                    </div>

                    {selectedIkasRecord && isIkasVerified && (
                        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status Permohonan Perubahan</p>
                                    <p className="mt-1 text-sm text-slate-500">{editRequestMeta.description}</p>
                                </div>
                                <span className={`inline-flex items-center self-start rounded-full px-4 py-2 text-sm font-bold ${editRequestMeta.badgeClassName}`}>
                                    {editRequestMeta.label}
                                </span>
                            </div>
                            {latestEditReason && (
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-700">Alasan terakhir:</span> {latestEditReason}
                                </p>
                            )}
                            {latestAdminNote && (
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-700">Catatan admin:</span> {latestAdminNote}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {ikasListLoading && (
                        <div className="mb-8 space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={`ikas-domain-skeleton-${index}`} className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="skeleton-avatar-md" />
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <Skeleton className="h-8 w-16 rounded-xl" />
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 md:hidden">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={`ikas-mobile-skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <Skeleton className="h-4 w-28" />
                                        <div className="mt-4">
                                            <SkeletonText lines={4} size="md" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <SkeletonTable
                                columns={4}
                                rows={6}
                                columnTemplate="minmax(0,2.4fr) 110px 110px 150px"
                                className="hidden border-slate-200 bg-white md:block"
                            />
                        </div>
                    )}

                    {!ikasListLoading && (
                        <>
                            {/* Domain summary cards (Strip) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {/* Identifikasi */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-blue-900 to-blue-600 shadow-lg shadow-blue-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="button-force-white w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <div className="button-force-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataForDisplay.identifikasi.nilai)}</div>
                                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wide">Identifikasi</div>
                                        <div className="mt-0.5 text-[11px] italic">{ikasDataForDisplay.identifikasi.kategori}</div>
                                    </div>
                                </div>

                                {/* Proteksi */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-purple-900 to-purple-600 shadow-lg shadow-purple-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="button-force-white w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div className="button-force-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataForDisplay.proteksi.nilai)}</div>
                                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wide">Proteksi</div>
                                        <div className="mt-0.5 text-[11px] italic">{ikasDataForDisplay.proteksi.kategori}</div>
                                    </div>
                                </div>

                                {/* Deteksi */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-amber-900 to-amber-600 shadow-lg shadow-amber-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="button-force-white w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30">
                                        <Radar className="w-5 h-5" />
                                    </div>
                                    <div className="button-force-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataForDisplay.deteksi.nilai)}</div>
                                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wide">Deteksi</div>
                                        <div className="mt-0.5 text-[11px] italic">{ikasDataForDisplay.deteksi.kategori}</div>
                                    </div>
                                </div>

                                {/* Penanggulangan */}
                                <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-br from-emerald-900 to-emerald-600 shadow-lg shadow-emerald-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                    <div className="button-force-white w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 ring-1 ring-white/30">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="button-force-white relative z-10">
                                        <div className="text-2xl font-black leading-none">{formatValue(ikasDataForDisplay.gulih.nilai)}</div>
                                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wide leading-tight">Penanggulangan &amp; Pemulihan</div>
                                        <div className="mt-0.5 text-[11px] italic">{ikasDataForDisplay.gulih.kategori}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Maturity Table */}
                            <div className="space-y-4 md:hidden">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Ringkasan Tingkat Kematangan</p>
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-white p-3 shadow-sm">
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Target Total</p>
                                            <p className="mt-1 text-lg font-black text-slate-900">2.51</p>
                                        </div>
                                        <div className="rounded-xl bg-white p-3 shadow-sm">
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Nilai Total</p>
                                            <p className="mt-1 text-lg font-black text-slate-900">{formatValue(ikasDataForDisplay.total_rata_rata)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 rounded-xl bg-white p-3 shadow-sm">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Kategori Keamanan Siber</p>
                                        <p className="mt-1 text-base font-black text-[#1e3a5f]">{ikasDataForDisplay.total_kategori}</p>
                                    </div>
                                </div>

                                {Object.entries(ikasRowsByDomain).map(([domain, rows]) => (
                                    <div key={domain} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{domain}</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-500">Detail indikator domain {domain.toLowerCase()}.</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Nilai Domain</p>
                                                <p className="mt-1 text-lg font-black text-slate-900">{rows[0]?.nilaiDomain}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Kategori Domain</p>
                                            <p className="mt-1 text-sm font-bold text-slate-700">{rows[0]?.kategoriDomain || "-"}</p>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {rows.map((row, index) => (
                                                <div key={`${domain}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                                    <p className="text-sm font-semibold leading-relaxed text-slate-800">{row.indikator}</p>
                                                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Target</p>
                                                            <p className="mt-1 font-bold text-slate-700">{row.target}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Nilai</p>
                                                            <p className="mt-1 font-bold text-slate-900">{row.nilai}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
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
                                            <th colSpan={2} className="button-force-white border-r border-t border-slate-200 bg-[#1e3a5f] p-2 text-center">Total</th>
                                            <th className="button-force-white border-r border-slate-200 bg-[#1e3a5f] p-2 text-center">2.51</th>
                                            <th className="button-force-white border-r border-slate-200 bg-[#1e3a5f] p-2 text-center">{formatValue(ikasDataForDisplay.total_rata_rata)}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* IDENTIFIKASI */}
                                        <tr>
                                            <td rowSpan={5} className={`button-force-white bg-gradient-to-b from-blue-800 to-blue-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>IDENTIFIKASI</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengidentifikasi Peran dan tanggung jawab organisasi</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.peran_tanggung_jawab}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain1)}</td>
                                            <td rowSpan={5} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataForDisplay.identifikasi.nilai)}</td>
                                            <td rowSpan={5} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataForDisplay.identifikasi.kategori}</td>
                                            <td rowSpan={18} className="p-4 border border-slate-200 text-center font-black text-xl text-[#1e3a5f] tracking-wide leading-snug">{ikasDataForDisplay.total_kategori}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menyusun strategi, kebijakan, dan prosedur Keamanan Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.strategi_kebijakan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola aset informasi</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.aset_informasi}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain3)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menilai dan mengelola risiko Keamanan Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.risiko_keamanan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain4)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola risiko rantai pasok</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.identifikasi.rantai_pasok}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.identifikasi.nilai_subdomain5)}</td>
                                        </tr>

                                        {/* PROTEKSI */}
                                        <tr>
                                            <td rowSpan={6} className={`button-force-white bg-gradient-to-b from-purple-800 to-purple-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>PROTEKSI</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola identitas, autentikasi, dan kendali akses</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.identitas_autentikasi}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.proteksi.nilai_subdomain1)}</td>
                                            <td rowSpan={6} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataForDisplay.proteksi.nilai)}</td>
                                            <td rowSpan={6} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataForDisplay.proteksi.kategori}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi aset fisik</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.aset_fisik}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.proteksi.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi data</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.data}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.proteksi.nilai_subdomain3)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi aplikasi</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.aplikasi}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.proteksi.nilai_subdomain4)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi jaringan</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.jaringan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.proteksi.nilai_subdomain5)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melindungi sumber daya manusia</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.proteksi.sdm}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.proteksi.nilai_subdomain6)}</td>
                                        </tr>

                                        {/* DETEKSI */}
                                        <tr>
                                            <td rowSpan={3} className={`button-force-white bg-gradient-to-b from-amber-800 to-amber-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>DETEKSI</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Mengelola deteksi Peristiwa Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.deteksi.deteksi_peristiwa}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.deteksi.nilai_subdomain1)}</td>
                                            <td rowSpan={3} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataForDisplay.deteksi.nilai)}</td>
                                            <td rowSpan={3} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataForDisplay.deteksi.kategori}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menganalisis anomali dan Peristiwa Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.deteksi.anomali_peristiwa}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.deteksi.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Memantau Peristiwa Siber berkelanjutan</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.deteksi.pemantauan_berkelanjutan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.deteksi.nilai_subdomain3)}</td>
                                        </tr>

                                        {/* PENANGGULANGAN & PEMULIHAN */}
                                        <tr>
                                            <td rowSpan={4} className={`button-force-white bg-gradient-to-b from-emerald-800 to-emerald-600 ${domainCss} [writing-mode:vertical-rl] rotate-180 border border-slate-200`}>GULIH</td>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menyusun perencanaan penanggulangan dan pemulihan Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.gulih.perencanaan_pemulihan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.gulih.nilai_subdomain1)}</td>
                                            <td rowSpan={4} className="p-2 border border-slate-200 text-center font-bold">{formatValue(ikasDataForDisplay.gulih.nilai)}</td>
                                            <td rowSpan={4} className="p-2 border border-slate-200 text-center font-medium italic text-slate-600">{ikasDataForDisplay.gulih.kategori}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Menganalisis dan melaporkan Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.gulih.analisis_pelaporan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.gulih.nilai_subdomain2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Melaksanakan penanggulangan dan pemulihan Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.gulih.pelaksanaan_pemulihan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.gulih.nilai_subdomain3)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-slate-200 text-slate-700">Meningkatkan keamanan setelah terjadinya Insiden Siber</td>
                                            <td className="p-2 border border-slate-200 text-center">{ikasDataStatic.gulih.peningkatan_keamanan}</td>
                                            <td className="p-2 border border-slate-200 text-center font-semibold">{formatValue(ikasDataForDisplay.gulih.nilai_subdomain4)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Bar */}
                            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 md:hidden">
                                <p className="text-sm font-semibold text-slate-700">
                                    Semua detail IKAS sudah diringkas ke dalam kartu mobile. Buka layar tablet atau desktop jika Anda ingin melihat tabel lengkap versi matriks.
                                </p>
                            </div>

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
                                    className={`button-force-white flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                                        isPendingApproval
                                            ? 'cursor-not-allowed bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
                                            : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-600 active:scale-[0.99]'
                                    }`}
                                    onClick={handlePrimaryAction}
                                    disabled={isPendingApproval}
                                >
                                    <Edit className="w-4 h-4" /> {primaryActionLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    disabled={loading || isImportLocked}
                                    className="button-force-white flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 px-5 py-2.5 text-sm font-bold transition-all hover:from-emerald-800 hover:via-emerald-700 hover:to-green-600 disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>
                                    ) : isImportLocked ? (
                                        <><FileSpreadsheet className="w-4 h-4" /> Upload Excel Terkunci</>
                                    ) : (
                                        <><FileSpreadsheet className="w-4 h-4" /> Upload Excel</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Radar Charts Section */}
                {ikasListLoading ? (
                    <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm">
                        <div className="skeleton-stack-lg">
                            <div className="flex items-center justify-between gap-4">
                                <Skeleton className="h-7 w-44" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-[360px] rounded-[1.5rem]" />
                        </div>
                    </div>
                ) : (
                    <RadarChartIkas ikasDataDynamic={ikasDataForDisplay} />
                )}

                <Dialog open={showEditRequestModal} onOpenChange={setShowEditRequestModal}>
                    <DialogContent
                        overlayClassName="bg-slate-950/55 backdrop-blur-sm"
                        className="!inset-auto !left-1/2 !top-1/2 !grid !h-auto !max-h-[calc(100dvh-1.5rem)] !w-[calc(100vw-1.5rem)] !max-w-2xl !translate-x-[-50%] !translate-y-[-50%] gap-0 overflow-y-auto rounded-[30px] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.97)_100%)] p-0 shadow-[0_30px_90px_rgba(15,23,42,0.24)] ring-1 ring-slate-200/70 [&>button]:right-3 [&>button]:top-3 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:border [&>button]:border-white/80 [&>button]:bg-white/85 [&>button]:p-0 [&>button]:text-slate-500 [&>button]:opacity-100 [&>button]:shadow-sm [&>button]:backdrop-blur [&>button]:transition-all [&>button]:hover:bg-white [&>button]:hover:text-slate-800 sm:[&>button]:right-4 sm:[&>button]:top-4"
                    >
                        <div className="p-4 sm:p-6">
                            <div className="space-y-5 sm:space-y-6">
                                <DialogHeader className="space-y-2 text-left">
                                    <DialogTitle className="pr-10 text-xl font-black leading-tight text-slate-900 sm:text-[1.8rem]">
                                        Ajukan Perubahan Data IKAS
                                    </DialogTitle>
                                    <DialogDescription className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                                        Data IKAS yang sudah terverifikasi hanya dapat diubah setelah mendapat persetujuan admin. Tuliskan alasan pengajuan perubahan di bawah ini.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 border-t border-slate-200/80 pt-4 sm:pt-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <label className="text-sm font-semibold text-slate-800 sm:text-base">Alasan pengajuan perubahan</label>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                            {editReasonLength}/{MIN_EDIT_REASON_LENGTH}+
                                        </span>
                                    </div>
                                    <Textarea
                                        value={editReason}
                                        onChange={(event) => setEditReason(event.target.value)}
                                        placeholder="Jelaskan alasan perubahan data IKAS yang diajukan."
                                        rows={5}
                                        className="min-h-[150px] resize-none rounded-[22px] border-slate-200 bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 shadow-inner shadow-slate-100/80 focus-visible:border-blue-400 focus-visible:ring-blue-500 sm:min-h-[190px] sm:text-base"
                                    />
                                    <div className="space-y-1">
                                        {!isEditReasonValid && editReasonLength > 0 ? (
                                            <p className="text-xs font-medium text-amber-600 sm:text-sm">
                                                Tambahkan {MIN_EDIT_REASON_LENGTH - editReasonLength} karakter lagi untuk mengaktifkan tombol kirim.
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="border-t border-slate-200/80 pt-4 sm:pt-5">
                                    <DialogFooter className="gap-3 sm:justify-end sm:space-x-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditRequestModal(false);
                                                setEditReason("");
                                            }}
                                            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-[0_10px_22px_rgba(148,163,184,0.10)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto sm:min-w-[128px]"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmitEditRequest}
                                            disabled={isSubmittingEditRequest || !isEditReasonValid}
                                            className="button-force-white inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 px-5 py-3 text-sm font-bold shadow-[0_16px_32px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:from-amber-500 hover:via-orange-500 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:from-amber-400 disabled:hover:via-orange-500 disabled:hover:to-orange-600 sm:w-auto sm:min-w-[180px]"
                                        >
                                            {isSubmittingEditRequest ? "Mengirim..." : "Kirim Pengajuan"}
                                        </button>
                                    </DialogFooter>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </RequireCompanyProfile>
    );
}
