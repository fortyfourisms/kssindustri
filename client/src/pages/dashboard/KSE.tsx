import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";

const KseFormSchema = z.object({
    systemName: z.string().min(1, "Nama sistem wajib diisi"),
    category: z.string().min(1, "Kategori wajib diisi"),
    description: z.string().optional(),
    riskLevel: z.enum(["rendah", "sedang", "tinggi"]),
    operator: z.string().optional(),
    custodian: z.string().optional(),
    dataType: z.string().optional(),
    interconnected: z.string().optional(),
    compliance: z.string().optional(),
});
type KseForm = z.infer<typeof KseFormSchema>;

const SE_CATEGORIES = [
    "Layanan Publik Elektronik",
    "Sistem Internal Pemerintah",
    "Sistem Perbankan dan Keuangan",
    "Sistem Infrastruktur Kritis",
    "Sistem Komersial",
    "Lainnya",
];

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function KSE() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ["kse"], queryFn: api.getKse });

    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<KseForm>({
        resolver: zodResolver(KseFormSchema),
        defaultValues: { riskLevel: "rendah" },
    });

    useEffect(() => {
        if (data) {
            reset({
                systemName: data.systemName ?? "",
                category: data.category ?? "",
                description: data.description ?? "",
                riskLevel: (data.riskLevel as any) ?? "rendah",
                operator: data.data?.operator ?? "",
                custodian: data.data?.custodian ?? "",
                dataType: data.data?.dataType ?? "",
                interconnected: data.data?.interconnected ?? "",
                compliance: data.data?.compliance ?? "",
            });
        }
    }, [data, reset]);

    const saveMutation = useMutation({
        mutationFn: (form: KseForm) => api.saveKse({
            systemName: form.systemName,
            category: form.category,
            description: form.description,
            riskLevel: form.riskLevel,
            data: {
                operator: form.operator,
                custodian: form.custodian,
                dataType: form.dataType,
                interconnected: form.interconnected,
                compliance: form.compliance,
            },
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["kse"] });
            toast({ title: "Tersimpan", description: "Data KSE berhasil disimpan." });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const riskColors: Record<string, string> = {
        rendah: "text-emerald-700 bg-emerald-50 border-emerald-200",
        sedang: "text-amber-700 bg-amber-50 border-amber-200",
        tinggi: "text-red-700 bg-red-50 border-red-200",
    };

    return (
        <DashboardLayout title="KSE">
            <RequireCompanyProfile>
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Monitor className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 font-display">Kategorisasi Sistem Elektronik</h1>
                            <p className="text-sm text-slate-500">Input dan kategorisasi data sistem elektronik Anda</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                    ) : (
                        <motion.form
                            onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 space-y-5"
                        >
                            <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Informasi Sistem</h2>

                            <div>
                                <label className={LABEL_CLS}>Nama Sistem Elektronik</label>
                                <input {...register("systemName")} className={INPUT_CLS} placeholder="Contoh: SIMPEG, SIKEU" />
                                {errors.systemName && <p className="text-red-500 text-xs mt-1">{errors.systemName.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Kategori Sistem</label>
                                <select {...register("category")} className={INPUT_CLS}>
                                    <option value="">-- Pilih Kategori --</option>
                                    {SE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Deskripsi Sistem</label>
                                <textarea {...register("description")} rows={3} className={INPUT_CLS} placeholder="Deskripsi singkat sistem..." />
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Operator Sistem</label>
                                <input {...register("operator")} className={INPUT_CLS} placeholder="Nama unit/instansi operator" />
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Pengelola Data (Custodian)</label>
                                <input {...register("custodian")} className={INPUT_CLS} placeholder="Nama pengelola data" />
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Jenis Data yang Dikelola</label>
                                <input {...register("dataType")} className={INPUT_CLS} placeholder="Contoh: Data pribadi, data keuangan" />
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Keterhubungan Sistem</label>
                                <input {...register("interconnected")} className={INPUT_CLS} placeholder="Sistem lain yang terhubung" />
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Kepatuhan Regulasi</label>
                                <input {...register("compliance")} className={INPUT_CLS} placeholder="Contoh: PP 71/2019, UU PDP" />
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Tingkat Risiko</label>
                                <div className="flex gap-3">
                                    {(["rendah", "sedang", "tinggi"] as const).map((level) => (
                                        <label key={level} className="flex-1 cursor-pointer">
                                            <input type="radio" {...register("riskLevel")} value={level} className="sr-only" />
                                            <div className={`px-4 py-2.5 rounded-xl border-2 text-center text-sm font-bold capitalize transition-all ${riskColors[level]}`}>
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saveMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</>
                                ) : (
                                    <><Save className="w-4 h-4" />Simpan Data KSE</>
                                )}
                            </button>
                        </motion.form>
                    )}
                </div>
            </RequireCompanyProfile>
        </DashboardLayout>
    );
}
