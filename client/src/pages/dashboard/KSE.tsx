import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { csirtService } from "@/services/csirt.service";
import { useUser } from "@/hooks/useAuth";
import { exportKsePdf } from "@/lib/pdf-export";
import { getKategoriSE } from "@/data/kse-data";
import { Building2, Monitor, Plus, Edit2, Trash2, Loader2, ServerCrash, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// ── Helper: compute bobot total from SE record ────────────────────────────────
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

function computeBobot(se: any): number {
    return Object.entries(FIELD_TO_BOBOT).reduce((sum, [field, bobotMap]) => {
        const val = se?.[field];
        return sum + (bobotMap[val] || 0);
    }, 0);
}

function formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// ── Category badge ────────────────────────────────────────────────────────────
function KategoriBadge({ kategori }: { kategori: string }) {
    const map: Record<string, { bg: string; text: string; dot: string }> = {
        Strategis: { bg: 'bg-red-50 border border-red-200', text: 'text-red-600', dot: 'bg-red-500' },
        Tinggi: { bg: 'bg-orange-50 border border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' },
        Rendah: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    };
    const style = map[kategori] || { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {kategori || 'Belum Lengkap'}
        </span>
    );
}

export default function KSE() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: user } = useUser();
    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { data: perusahaanResponse } = useQuery({
        queryKey: ["perusahaan", perusahaanId],
        queryFn: () => api.getPerusahaanById(String(perusahaanId)),
        enabled: !!perusahaanId && !user?.perusahaan?.nama_perusahaan,
    });
    const perusahaan = perusahaanResponse ?? user?.perusahaan;

    const { data: seData, isLoading, isError, refetch } = useQuery<any>({
        queryKey: ["se"],
        queryFn: api.getKse,
    });
    // Normalise: API returns { data: [...], total_count: N }
    const seList: any[] = Array.isArray(seData?.data)
        ? seData.data
        : Array.isArray(seData)
            ? seData
            : seData && typeof seData === 'object' && seData.id
                ? [seData]
                : [];

    return (
        <RequireCompanyProfile>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">

                {/* ── Page Header ── */}
                <PageHeader
                    icon={Building2}
                    title={`Kategorisasi Sistem Elektronik - ${perusahaan?.nama_perusahaan || "Stakeholder"}`}
                    subtitle="Daftar Sistem Elektronik yang telah dinilai beserta kategori dan skornya."
                />

                {/* ── Table Card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Tabel KSE</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Daftar sistem elektronik yang telah dinilai beserta kategori dan skornya.</p>
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
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
                                >
                                    <Download className="w-4 h-4" /> Export PDF
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/dashboard/form-kse')}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-yellow-500/30 transition-all hover:bg-amber-600 hover:shadow-yellow-500/45 hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Tambah SE
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-sm text-slate-400 font-medium">Memuat data...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-8">
                            <ServerCrash className="w-10 h-10 text-red-400" />
                            <p className="text-slate-600 font-semibold">Gagal memuat data SE.</p>
                            <button onClick={() => refetch()} className="text-blue-500 text-sm font-bold hover:underline">Coba Lagi</button>
                        </div>
                    ) : seList.length === 0 ? (
                        /* ── Empty State ── */
                        <div className="flex flex-col items-center justify-center py-24 gap-4 px-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Monitor className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-base">Belum ada data SE</p>
                                <p className="text-sm text-slate-400 mt-1">Tambahkan sistem elektronik pertama Anda untuk memulai penilaian.</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/form-kse')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-md shadow-yellow-500/30 hover:bg-amber-600 hover:shadow-yellow-500/45 hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Tambah SE Sekarang
                            </button>
                        </div>
                    ) : (
                        /* ── Data Table ── */
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">No</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nama Sistem Elektronik</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Kategori</th>
                                        <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Skor</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Dibuat</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Diperbarui</th>
                                        <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {seList.map((se, idx) => {
                                        const bobot = computeBobot(se);
                                        const kategori = se.kategori_se || getKategoriSE(bobot).kategori;
                                        return (
                                            <motion.tr
                                                key={se.id ?? idx}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                <td className="px-5 py-4 text-slate-400 font-semibold text-xs">{idx + 1}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                                            <Monitor className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800 leading-tight">{se.nama_se || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <KategoriBadge kategori={kategori} />
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 font-extrabold text-slate-800 text-base shadow-sm">
                                                        {bobot}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(se.created_at)}</td>
                                                <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{formatDate(se.updated_at)}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/form-kse?id=${se.id}`)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-yellow-500/30 transition-all hover:bg-amber-600 hover:shadow-yellow-500/45 hover:scale-[1.01] active:scale-[0.99] group-hover:shadow-md"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" /> Ajukan perubahan data
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Table footer */}
                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <p className="text-xs text-slate-400 font-medium">{seList.length} sistem elektronik terdaftar{seData?.total_count != null ? ` (total: ${seData.total_count})` : ''}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </RequireCompanyProfile>
    );
}
