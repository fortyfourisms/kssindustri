import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil, Trash2, Users, X, Save, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";

const CsirtFormSchema = z.object({
    teamName: z.string().min(1, "Nama tim wajib diisi"),
    contactEmail: z.string().email("Email tidak valid"),
    phone: z.string().optional(),
    scope: z.string().min(1, "Cakupan wajib diisi"),
    notes: z.string().optional(),
});
type CsirtForm = z.infer<typeof CsirtFormSchema>;

const CAPABILITIES = [
    "Deteksi Insiden",
    "Respons Insiden",
    "Analisis Malware",
    "Forensik Digital",
    "Threat Intelligence",
    "Vulnerability Assessment",
    "Koordinasi Eksternal",
    "Pelatihan & Awareness",
];

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

interface FormModalProps {
    initial?: any;
    onSubmit: (d: CsirtForm, caps: string[]) => void;
    onClose: () => void;
    loading: boolean;
}

function FormModal({ initial, onSubmit, onClose, loading }: FormModalProps) {
    const [selectedCaps, setSelectedCaps] = useState<string[]>(initial?.capabilities ?? []);
    const { register, handleSubmit, formState: { errors } } = useForm<CsirtForm>({
        resolver: zodResolver(CsirtFormSchema),
        defaultValues: initial,
    });

    const toggleCap = (c: string) =>
        setSelectedCaps((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 font-display">{initial ? "Edit CSIRT" : "Tambah CSIRT"}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit((d) => onSubmit(d, selectedCaps))} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama Tim CSIRT</label>
                        <input {...register("teamName")} className={INPUT_CLS} placeholder="Contoh: CSIRT-BSSN" />
                        {errors.teamName && <p className="text-red-500 text-xs mt-1">{errors.teamName.message}</p>}
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Email Kontak</label>
                        <input {...register("contactEmail")} type="email" className={INPUT_CLS} placeholder="csirt@instansi.go.id" />
                        {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Nomor Telepon</label>
                        <input {...register("phone")} className={INPUT_CLS} placeholder="+62 21 xxxxxxx" />
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Cakupan (Scope)</label>
                        <textarea {...register("scope")} rows={3} className={INPUT_CLS} placeholder="Deskripsi cakupan tugas CSIRT..." />
                        {errors.scope && <p className="text-red-500 text-xs mt-1">{errors.scope.message}</p>}
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Kapabilitas</label>
                        <div className="flex flex-wrap gap-2">
                            {CAPABILITIES.map((c) => (
                                <button
                                    type="button"
                                    key={c}
                                    onClick={() => toggleCap(c)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedCaps.includes(c)
                                        ? "bg-violet-600 text-white border-violet-600"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Catatan</label>
                        <textarea {...register("notes")} rows={2} className={INPUT_CLS} placeholder="Catatan tambahan..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function CSIRT() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);

    const { data: list = [], isLoading } = useQuery({ queryKey: ["csirt"], queryFn: api.getCsirt });

    const createMutation = useMutation({
        mutationFn: (d: any) => api.createCsirt(d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["csirt"] }); setShowForm(false); toast({ title: "CSIRT ditambahkan" }); },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.updateCsirt(id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["csirt"] }); setEditing(null); toast({ title: "CSIRT diperbarui" }); },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: api.deleteCsirt,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["csirt"] }); toast({ title: "CSIRT dihapus" }); },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const handleCreate = (form: CsirtForm, caps: string[]) => createMutation.mutate({ ...form, capabilities: caps });
    const handleUpdate = (form: CsirtForm, caps: string[]) =>
        updateMutation.mutate({ id: editing.id, data: { ...form, capabilities: caps } });

    return (
        <DashboardLayout title="CSIRT">
            <RequireCompanyProfile>
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-black text-slate-900 font-display">CSIRT</h1>
                                <p className="text-sm text-slate-500">Computer Security Incident Response Team</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setEditing(null); setShowForm(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
                    ) : list.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="font-semibold">Belum ada data CSIRT</p>
                            <p className="text-sm mt-1">Klik tombol Tambah untuk memulai</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {list.map((item: any, i: number) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-black text-slate-900 font-display text-base">{item.teamName}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5">{item.contactEmail}</p>
                                            {item.phone && <p className="text-sm text-slate-500">{item.phone}</p>}
                                            <p className="text-sm text-slate-700 mt-2">{item.scope}</p>
                                            {item.capabilities?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {item.capabilities.map((c: string) => (
                                                        <span key={c} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-violet-100 text-violet-700">{c}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => { setEditing(item); setShowForm(false); }}
                                                className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { if (confirm("Hapus data CSIRT ini?")) deleteMutation.mutate(item.id); }}
                                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {(showForm || editing) && (
                        <FormModal
                            initial={editing}
                            onSubmit={editing ? handleUpdate : handleCreate}
                            onClose={() => { setShowForm(false); setEditing(null); }}
                            loading={createMutation.isPending || updateMutation.isPending}
                        />
                    )}
                </AnimatePresence>
            </RequireCompanyProfile>
        </DashboardLayout>
    );
}
