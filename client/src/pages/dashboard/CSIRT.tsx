import { useState, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { csirtService } from "@/services/csirt.service";
import { getMediaUrl } from "@/lib/utils";
import { Loader2, Building2, Pencil, Phone, Globe, Mail, Server, Link as LinkIcon, Plus, User, ShieldCheck, Briefcase, Wrench, Award, Trash2, Hash, UserCheck, Settings, Tag, Eye, ChevronRight, Save, X, Download } from "lucide-react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { motion, AnimatePresence } from "framer-motion";
import { useCsirtProfile } from "@/hooks/useCsirtProfile";
import { useUser } from "@/hooks/useAuth";
import type { SdmCsirt, SeCsirt } from "@/types/csirt.types";

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

// ─── Modal: CSIRT Profile Create ──────────────────────────────────────────────
function CreateCsirtModal({ onSubmit, onClose, loading, idPerusahaan }: any) {
    const [formData, setFormData] = useState({ nama_csirt: "", web_csirt: "", telepon_csirt: "", email_csirt: "" });
    const [photoCsirt, setPhotoCsirt] = useState<File | null>(null);
    const [fileRfc, setFileRfc] = useState<File | null>(null);
    const [filePgp, setFilePgp] = useState<File | null>(null);
    const [fileStr, setFileStr] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("nama_csirt", formData.nama_csirt);
        fd.append("web_csirt", formData.web_csirt);
        fd.append("telepon_csirt", formData.telepon_csirt);
        fd.append("email_csirt", formData.email_csirt);
        if (idPerusahaan) fd.append("id_perusahaan", idPerusahaan);
        if (photoCsirt) fd.append("photo_csirt", photoCsirt);
        if (fileRfc) fd.append("file_rfc2350", fileRfc);
        if (filePgp) fd.append("file_public_key_pgp", filePgp);
        if (fileStr) fd.append("file_str", fileStr);
        onSubmit(fd);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 font-display text-xl">Tambah CSIRT</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 bg-slate-100 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama CSIRT</label>
                        <input value={formData.nama_csirt} onChange={(e) => setFormData({ ...formData, nama_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: CSIRT-BSSN" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Website CSIRT</label>
                            <input value={formData.web_csirt} onChange={(e) => setFormData({ ...formData, web_csirt: e.target.value })} required className={INPUT_CLS} placeholder="www.csirt.go.id" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Telepon CSIRT</label>
                            <input value={formData.telepon_csirt} onChange={(e) => setFormData({ ...formData, telepon_csirt: e.target.value })} required className={INPUT_CLS} placeholder="+62 21 xxxxxxx" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Email CSIRT</label>
                            <input value={formData.email_csirt} onChange={(e) => setFormData({ ...formData, email_csirt: e.target.value })} required className={INPUT_CLS} placeholder="[EMAIL_ADDRESS]" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <label className={LABEL_CLS}>Foto CSIRT <span className="text-xs font-normal text-slate-400">(Opsional)</span></label>
                        <input type="file" accept="image/*" onChange={(e) => setPhotoCsirt(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Dokumen RFC2350 <span className="text-xs font-normal text-slate-400">(PDF, Opsional)</span></label>
                            <input type="file" accept=".pdf" onChange={(e) => setFileRfc(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>PGP Public Key <span className="text-xs font-normal text-slate-400">(.asc, Opsional)</span></label>
                            <input type="file" accept=".asc" onChange={(e) => setFilePgp(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>STR <span className="text-xs font-normal text-slate-400">(.pdf, Opsional)</span></label>
                            <input type="file" accept=".pdf" onChange={(e) => setFileStr(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Buat Profil CSIRT
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Modal: CSIRT Profile Edit ────────────────────────────────────────────────
function EditCsirtModal({ initial, onSubmit, onClose, loading, idPerusahaan }: any) {
    const [formData, setFormData] = useState({
        nama_csirt: initial?.nama_csirt || "",
        web_csirt: initial?.web_csirt || "",
        telepon_csirt: initial?.telepon_csirt || "",
        email_csirt: initial?.email_csirt || "",
    });
    const [photoCsirt, setPhotoCsirt] = useState<File | null>(null);
    const [fileRfc, setFileRfc] = useState<File | null>(null);
    const [filePgp, setFilePgp] = useState<File | null>(null);
    const [fileStr, setFileStr] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("nama_csirt", formData.nama_csirt);
        fd.append("web_csirt", formData.web_csirt);
        fd.append("telepon_csirt", formData.telepon_csirt);
        fd.append("email_csirt", formData.email_csirt);
        // Do not append id_perusahaan on update to prevent permission errors
        if (photoCsirt) fd.append("photo_csirt", photoCsirt);
        if (fileRfc) fd.append("file_rfc2350", fileRfc);
        if (filePgp) fd.append("file_public_key_pgp", filePgp);
        if (fileStr) fd.append("file_str", fileStr);
        onSubmit(fd);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 font-display text-xl">Edit Profil CSIRT</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 bg-slate-100 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama CSIRT</label>
                        <input value={formData.nama_csirt} onChange={(e) => setFormData({ ...formData, nama_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: CSIRT-BSSN" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Website CSIRT</label>
                            <input value={formData.web_csirt} onChange={(e) => setFormData({ ...formData, web_csirt: e.target.value })} required className={INPUT_CLS} placeholder="www.csirt.go.id" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Telepon CSIRT</label>
                            <input value={formData.telepon_csirt} onChange={(e) => setFormData({ ...formData, telepon_csirt: e.target.value })} required className={INPUT_CLS} placeholder="+62 21 xxxxxxx" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Email CSIRT</label>
                            <input value={formData.email_csirt} onChange={(e) => setFormData({ ...formData, email_csirt: e.target.value })} required className={INPUT_CLS} placeholder="[EMAIL_ADDRESS]" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <label className={LABEL_CLS}>Foto CSIRT <span className="text-xs font-normal text-slate-400">(Opsional)</span></label>
                        <input type="file" accept="image/*" onChange={(e) => setPhotoCsirt(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Dokumen RFC2350 <span className="text-xs font-normal text-slate-400">(PDF, Opsional)</span></label>
                            <input type="file" accept=".pdf" onChange={(e) => setFileRfc(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>PGP Public Key <span className="text-xs font-normal text-slate-400">(.asc, Opsional)</span></label>
                            <input type="file" accept=".asc" onChange={(e) => setFilePgp(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>STR <span className="text-xs font-normal text-slate-400">(.pdf, Opsional)</span></label>
                            <input type="file" accept=".pdf" onChange={(e) => setFileStr(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 bg-white" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Modal: SDM Create ────────────────────────────────────────────────────────
function CreateSdmModal({ csirtId, onSave, onClose, loading }: {
    csirtId: string;
    onSave: (payload: any) => void;
    onClose: () => void;
    loading: boolean;
}) {
    const [form, setForm] = useState({ nama_personel: "", jabatan_csirt: "", jabatan_perusahaan: "", skill: "" });
    const [sertifikasiList, setSertifikasiList] = useState<string[]>([]);
    const [sertInput, setSertInput] = useState("");

    const handleAddSert = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && (e as React.KeyboardEvent).key !== 'Enter') return;
        e.preventDefault();
        if (sertInput.trim() && !sertifikasiList.includes(sertInput.trim())) {
            setSertifikasiList([...sertifikasiList, sertInput.trim()]);
            setSertInput("");
        }
    };

    const removeSert = (idx: number) => {
        setSertifikasiList(sertifikasiList.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ id_csirt: csirtId, ...form, sertifikasi: sertifikasiList.join(", ") }); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 font-display text-xl">Tambah SDM</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 bg-slate-100 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama Personel</label>
                        <input required value={form.nama_personel} onChange={(e) => setForm({ ...form, nama_personel: e.target.value })} className={INPUT_CLS} placeholder="Nama lengkap" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={LABEL_CLS}>Jabatan CSIRT</label><input required value={form.jabatan_csirt} onChange={(e) => setForm({ ...form, jabatan_csirt: e.target.value })} className={INPUT_CLS} placeholder="Contoh: Ketua" /></div>
                        <div><label className={LABEL_CLS}>Jabatan Perusahaan</label><input required value={form.jabatan_perusahaan} onChange={(e) => setForm({ ...form, jabatan_perusahaan: e.target.value })} className={INPUT_CLS} placeholder="Contoh: Manajer IT" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div><label className={LABEL_CLS}>Keahlian / Skill</label><input required value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className={INPUT_CLS} placeholder="Contoh: Network Security" /></div>
                        <div>
                            <label className={LABEL_CLS}>Sertifikasi</label>
                            <div className="flex gap-2">
                                <input
                                    value={sertInput}
                                    onChange={(e) => setSertInput(e.target.value)}
                                    onKeyDown={handleAddSert}
                                    className={INPUT_CLS}
                                    placeholder={sertifikasiList.length > 0 ? "Tambah sertifikasi" : "Contoh: CISSP"}
                                />
                                <button type="button" onClick={handleAddSert} disabled={!sertInput.trim()} className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:hover:bg-slate-100 text-slate-700 rounded-xl transition flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Tambah Sertifikasi">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            {sertifikasiList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {sertifikasiList.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold">
                                            <span>{s}</span>
                                            <button type="button" onClick={() => removeSert(idx)} className="text-blue-400 hover:text-blue-600"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Tambah SDM
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Modal: SDM Edit ──────────────────────────────────────────────────────────
function EditSdmModal({ initial, csirtId, onSave, onClose, loading }: {
    initial: SdmCsirt;
    csirtId: string;
    onSave: (payload: any) => void;
    onClose: () => void;
    loading: boolean;
}) {
    const [form, setForm] = useState({
        nama_personel: initial.nama_personel || "",
        jabatan_csirt: initial.jabatan_csirt || "",
        jabatan_perusahaan: initial.jabatan_perusahaan || "",
        skill: initial.skill || "",
    });
    const [sertifikasiList, setSertifikasiList] = useState<string[]>(
        initial.sertifikasi ? initial.sertifikasi.split(',').map(s => s.trim()).filter(Boolean) : []
    );
    const [sertInput, setSertInput] = useState("");

    const handleAddSert = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && (e as React.KeyboardEvent).key !== 'Enter') return;
        e.preventDefault();
        if (sertInput.trim() && !sertifikasiList.includes(sertInput.trim())) {
            setSertifikasiList([...sertifikasiList, sertInput.trim()]);
            setSertInput("");
        }
    };

    const removeSert = (idx: number) => {
        setSertifikasiList(sertifikasiList.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ id_csirt: csirtId, ...form, sertifikasi: sertifikasiList.join(", ") }); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 font-display text-xl">Edit SDM</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 bg-slate-100 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama Personel</label>
                        <input required value={form.nama_personel} onChange={(e) => setForm({ ...form, nama_personel: e.target.value })} className={INPUT_CLS} placeholder="Nama lengkap" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={LABEL_CLS}>Jabatan CSIRT</label><input required value={form.jabatan_csirt} onChange={(e) => setForm({ ...form, jabatan_csirt: e.target.value })} className={INPUT_CLS} placeholder="Contoh: Ketua" /></div>
                        <div><label className={LABEL_CLS}>Jabatan Perusahaan</label><input required value={form.jabatan_perusahaan} onChange={(e) => setForm({ ...form, jabatan_perusahaan: e.target.value })} className={INPUT_CLS} placeholder="Contoh: Manajer IT" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div><label className={LABEL_CLS}>Keahlian / Skill</label><input required value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className={INPUT_CLS} placeholder="Contoh: Network Security" /></div>
                        <div>
                            <label className={LABEL_CLS}>Sertifikasi</label>
                            <div className="flex gap-2">
                                <input
                                    value={sertInput}
                                    onChange={(e) => setSertInput(e.target.value)}
                                    onKeyDown={handleAddSert}
                                    className={INPUT_CLS}
                                    placeholder={sertifikasiList.length > 0 ? "Tambah sertifikasi" : "Contoh: CISSP"}
                                />
                                <button type="button" onClick={handleAddSert} disabled={!sertInput.trim()} className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:hover:bg-slate-100 text-slate-700 rounded-xl transition flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Tambah Sertifikasi">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            {sertifikasiList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {sertifikasiList.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold">
                                            <span>{s}</span>
                                            <button type="button" onClick={() => removeSert(idx)} className="text-blue-400 hover:text-blue-600"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">Batal</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ─── Modal: SE Detail ─────────────────────────────────────────────────────────
function SeDetailModal({ se, onClose }: { se: SeCsirt; onClose: () => void }) {
    const rows = [
        { label: "Nama SE", value: se.nama_se },
        { label: "IP SE", value: se.ip_se },
        { label: "AS Number", value: se.as_number_se },
        { label: "Pengelola", value: se.pengelola_se },
        { label: "Fitur", value: se.fitur_se },
        { label: "Kategori", value: se.kategori_se || "-" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 font-display text-xl">Detail SE</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 bg-slate-100 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                    {rows.map(({ label, value }) => (
                        <div key={label} className="flex flex-col gap-0.5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                            <span className="text-sm font-semibold text-slate-800">{value}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">Tutup</button>
            </motion.div>
        </div>
    );
}

// ─── Modal: Download Document ──────────────────────────────────────────────────
function DownloadDocModal({ fileUrl, fileName, csirtName, onClose }: { fileUrl: string; fileName: string; csirtName?: string; onClose: () => void }) {
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;

            const safeCsirtName = (csirtName || "CSIRT").replace(/[^a-zA-Z0-9]/g, '_');
            let finalName = fileName;
            if (fileName === "PGP Public Key") finalName = `public_key_${safeCsirtName}.asc`;
            else if (fileName === "RFC 2350") finalName = `rfc2350_${safeCsirtName}.pdf`;
            else if (fileName === "Surat Tanda Registrasi") finalName = `str_${safeCsirtName}.pdf`;

            link.setAttribute("download", finalName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            onClose();
        } catch (error) {
            console.error("Download failed:", error);
            toast({ title: "Gagal Mengunduh", description: "Browser memblokir unduhan lintas domain. File akan dibuka di tab baru.", variant: "destructive" });
            const fallbackLink = document.createElement("a");
            fallbackLink.href = fileUrl;
            fallbackLink.target = "_blank";
            const safeCsirtName = (csirtName || "CSIRT").replace(/[^a-zA-Z0-9]/g, '_');
            if (fileName === "PGP Public Key") fallbackLink.download = `public_key_${safeCsirtName}.asc`;
            else if (fileName === "RFC 2350") fallbackLink.download = `rfc2350_${safeCsirtName}.pdf`;
            else if (fileName === "Surat Tanda Registrasi") fallbackLink.download = `str_${safeCsirtName}.pdf`;
            document.body.appendChild(fallbackLink);
            fallbackLink.click();
            fallbackLink.parentNode?.removeChild(fallbackLink);
            onClose();
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 text-center">
                <div className="flex justify-end mb-2">
                    <button onClick={onClose} disabled={isDownloading} className="text-slate-400 hover:text-slate-600 transition p-1 bg-slate-100 rounded-lg hover:bg-slate-200"><X className="w-5 h-5" /></button>
                </div>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8" />
                </div>
                <h3 className="font-black text-slate-900 font-display text-lg mb-2">Unduh Dokumen</h3>
                <p className="text-sm text-slate-500 mb-6">Anda akan mengunduh dokumen <strong>{fileName}</strong>. Lanjutkan?</p>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} disabled={isDownloading} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition disabled:opacity-50">Batal</button>
                    <button onClick={handleDownload} disabled={isDownloading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50">
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unduh"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CSIRT() {
    const qc = useQueryClient();
    const { toast } = useToast();

    // ── Hook ────────────────────────────────────────────────────────────────
    const { createMutation, updateMutation, deleteMutation } = useCsirtProfile();

    // ── Modal state ─────────────────────────────────────────────────────────
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [showSdmModal, setShowSdmModal] = useState(false);
    const [editingSdm, setEditingSdm] = useState<SdmCsirt | null>(null);
    const [viewingSe, setViewingSe] = useState<SeCsirt | null>(null);
    const [downloadDoc, setDownloadDoc] = useState<{ url: string; name: string; csirtName?: string } | null>(null);

    // ── Queries ─────────────────────────────────────────────────────────────
    const { data: user } = useUser();
    const idPerusahaan: string = String(
        (user as any)?.id_perusahaan ||
        (user as any)?.perusahaan?.id ||
        ""
    );

    const { data: csirtData, isLoading: isLoadingCsirt } = useQuery({
        queryKey: ["csirt"],
        queryFn: api.getCsirt,
    });

    const csirt = useMemo(() => {
        if (!csirtData) return null;
        return Array.isArray(csirtData) ? csirtData[0] : csirtData;
    }, [csirtData]);

    const activeCsirtId = csirt?.id;

    const { data: sdmList = [], isLoading: isLoadingSdm } = useQuery({
        queryKey: ["sdm_csirt", activeCsirtId],
        queryFn: () => csirtService.getSdmByCsirtId(activeCsirtId as string),
        enabled: !!activeCsirtId,
    });

    const { data: seList = [], isLoading: isLoadingSe } = useQuery({
        queryKey: ["se", activeCsirtId],
        queryFn: () => csirtService.getSeByCsirtId(activeCsirtId as string),
        enabled: !!activeCsirtId,
    });

    const isLoading = isLoadingCsirt || isLoadingSdm || isLoadingSe;

    // ── SDM Mutations ───────────────────────────────────────────────────────
    const createSdmMutation = useMutation({
        mutationFn: (payload: any) => csirtService.createSdm(payload),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdm_csirt", activeCsirtId] }); setShowSdmModal(false); toast({ title: "SDM ditambahkan" }); },
        onError: (e: any) => toast({ title: "Gagal menambah SDM", description: e.message, variant: "destructive" }),
    });

    const updateSdmMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => csirtService.updateSdm(id, payload),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdm_csirt", activeCsirtId] }); setShowSdmModal(false); setEditingSdm(null); toast({ title: "SDM diperbarui" }); },
        onError: (e: any) => toast({ title: "Gagal memperbarui SDM", description: e.message, variant: "destructive" }),
    });

    const deleteSdmMutation = useMutation({
        mutationFn: (id: string) => csirtService.deleteSdm(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdm_csirt", activeCsirtId] }); toast({ title: "SDM dihapus" }); },
        onError: (e: any) => toast({ title: "Gagal menghapus SDM", description: e.message, variant: "destructive" }),
    });


    // ── Handlers ────────────────────────────────────────────────────────────
    const handleCreate = (formPayload: FormData) => {
        createMutation.mutate(formPayload, {
            onSuccess: () => { setShowForm(false); },
        });
    };

    const handleUpdate = (formPayload: FormData) => {
        updateMutation.mutate({ id: editing.id, data: formPayload }, {
            onSuccess: () => { setEditing(null); setShowForm(false); },
        });
    };

    const handleSdmSave = (payload: any) => {
        if (editingSdm) {
            updateSdmMutation.mutate({ id: editingSdm.id, payload });
        } else {
            createSdmMutation.mutate(payload);
        }
    };


    const handleDeleteSdm = (sdm: SdmCsirt) => {
        if (confirm(`Hapus SDM "${sdm.nama_personel}"?`)) deleteSdmMutation.mutate(sdm.id);
    };


    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <RequireCompanyProfile>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold font-display text-slate-900">CSIRT</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-medium text-blue-600 hover:underline cursor-pointer">Dashboards</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="font-semibold text-slate-900">CSIRT</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                ) : !csirt ? (
                    <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-semibold text-slate-600 mb-2">Belum ada data CSIRT</p>
                        <p className="text-sm mt-1 text-slate-500 mb-6">Silakan daftarkan tim CSIRT perusahaan Anda terlebih dahulu.</p>
                        <button
                            onClick={() => { setEditing(null); setShowForm(true); }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Buat Profil CSIRT
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Main Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                            <div className="bg-[#203db0] p-6 flex items-start justify-between text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{csirt.nama_csirt || "Nama CSIRT"}</h2>
                                        <p className="text-blue-100 text-sm mt-0.5">Detail informasi dan manajemen CSIRT</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditing(csirt); setShowForm(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit CSIRT
                                    </button>
                                    <button
                                        onClick={() => { if (confirm("Hapus profil CSIRT ini?")) deleteMutation.mutate(activeCsirtId); }}
                                        className="p-2 transition-colors hover:bg-red-500/20 text-red-200 hover:text-red-100 rounded-lg shrink-0"
                                        title="Hapus CSIRT"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 relative z-10 bg-slate-50/50">
                                <div className="flex-1 flex flex-col md:flex-row gap-6">
                                    <div className="w-40 h-40 rounded-3xl shadow-md p-2 flex-shrink-0 bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                                        {getMediaUrl(csirt.photo_csirt) ? (
                                            <img src={getMediaUrl(csirt.photo_csirt)} alt="CSIRT Photo" className="w-full h-full object-cover rounded-2xl" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                        ) : (
                                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                                <Building2 className="w-16 h-16 text-blue-400 opacity-60" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="text-3xl font-bold text-slate-800 mb-6 font-display">{csirt.nama_csirt}</h3>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <Phone className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Telepon</p>
                                                    <p className="font-bold text-slate-800">{csirt.telepon_csirt || "-"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                    <Globe className="w-4 h-4 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Website</p>
                                                    {csirt.web_csirt ? (
                                                        <a href={csirt.web_csirt.startsWith("http") ? csirt.web_csirt : `https://${csirt.web_csirt}`} target="_blank" rel="noreferrer" className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                                            {csirt.web_csirt}
                                                        </a>
                                                    ) : <p className="font-bold text-slate-800">-</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                    <Mail className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
                                                    {csirt.email_csirt ? (
                                                        <a href={`mailto:${csirt.email_csirt}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                                            {csirt.email_csirt}
                                                        </a>
                                                    ) : <p className="font-bold text-slate-800">-</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-slate-100/90 rounded-2xl p-5 flex items-center gap-4 border border-slate-200/50">
                                            <div className="text-blue-500"><UserCheck className="w-6 h-6" /></div>
                                            <div>
                                                <h4 className="text-xl font-bold text-blue-600">{sdmList.length}</h4>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">SDM Terdaftar</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-slate-100/90 rounded-2xl p-5 flex items-center gap-4 border border-slate-200/50">
                                            <div className="text-emerald-500"><Server className="w-6 h-6" /></div>
                                            <div>
                                                <h4 className="text-xl font-bold text-emerald-600">{seList.length}</h4>
                                                <p className="text-xs font-semibold text-slate-600/70 uppercase tracking-wider mt-0.5">SE Terdaftar</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 border border-slate-200 shadow-sm mt-2">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen Pendukung</h4>
                                        <div className="flex gap-3 ">
                                            {csirt.file_rfc2350 ? (
                                                <button onClick={() => setDownloadDoc({ url: getMediaUrl(csirt.file_rfc2350), name: "RFC 2350", csirtName: csirt.nama_csirt })} className="flex-1 bg-green-50 hover:bg-green-50 border border-slate-200 hover:border-green-200 rounded-xl p-3 flex items-center gap-3 transition-colors group text-left">
                                                    <Download className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                                                    <span className="font-semibold text-slate-700 text-xs group-hover:text-green-600 transition-colors">RFC 2350</span>
                                                </button>
                                            ) : <span className="flex-1 text-xs text-slate-400 p-3 italic">RFC 2350 belum diunggah</span>}
                                            {csirt.file_public_key_pgp ? (
                                                <button onClick={() => setDownloadDoc({ url: getMediaUrl(csirt.file_public_key_pgp), name: "PGP Public Key", csirtName: csirt.nama_csirt })} className="flex-1 bg-green-50 hover:bg-green-50 border border-slate-200 hover:border-green-200 rounded-xl p-3 flex items-center gap-3 transition-colors group text-left">
                                                    <Download className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                                                    <span className="font-semibold text-slate-700 text-xs group-hover:text-green-600 transition-colors">PGP Public Key</span>
                                                </button>
                                            ) : <span className="flex-1 text-xs text-slate-400 p-3 italic">PGP Key belum diunggah</span>}
                                            {csirt.file_str ? (
                                                <button onClick={() => setDownloadDoc({ url: getMediaUrl(csirt.file_str), name: "Surat Tanda Registrasi", csirtName: csirt.nama_csirt })} className="flex-1 bg-green-50 hover:bg-green-50 border border-slate-200 hover:border-green-200 rounded-xl p-3 flex items-center gap-3 transition-colors group text-left">
                                                    <Download className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                                                    <span className="font-semibold text-slate-700 text-xs group-hover:text-green-600 transition-colors">Surat Tanda Registrasi</span>
                                                </button>
                                            ) : <span className="flex-1 text-xs text-slate-400 p-3 italic">Surat Tanda Registrasi belum diunggah</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SDM Table */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="font-bold text-slate-800 text-lg">Tabel Daftar SDM CSIRT</h3>
                                <button onClick={() => { setEditingSdm(null); setShowSdmModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap">
                                    <Plus className="w-4 h-4" /> Tambah SDM
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                                    <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">NO</th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> NAMA PERSONEL</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> CSIRT</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> JABATAN CSIRT</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> JABATAN PERUSAHAAN</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Wrench className="w-3.5 h-3.5" /> KEAHLIAN</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Award className="w-3.5 h-3.5" /> SERTIFIKASI</div></th>
                                            <th className="px-6 py-4 text-center">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sdmList.map((sdm: any, i: number) => (
                                            <tr key={sdm.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium">{i + 1}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{sdm.nama_personel}</td>
                                                <td className="px-6 py-4 font-semibold text-blue-400">{sdm.csirt?.nama_csirt || csirt.nama_csirt}</td>
                                                <td className="px-6 py-4 font-medium text-slate-700">{sdm.jabatan_csirt}</td>
                                                <td className="px-6 py-4 text-slate-500">{sdm.jabatan_perusahaan}</td>
                                                <td className="px-6 py-4 text-slate-500">{sdm.skill}</td>
                                                <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {sdm.sertifikasi ? sdm.sertifikasi.split(',').map((s: string, idx: number) => {
                                                            const trimmed = s.trim();
                                                            if (!trimmed) return null;
                                                            return (
                                                                <span key={idx} className="bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">
                                                                    {trimmed}
                                                                </span>
                                                            );
                                                        }) : <span className="text-slate-400">-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => { setEditingSdm(sdm); setShowSdmModal(true); }} className="p-2 text-emerald-500 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteSdm(sdm)} disabled={deleteSdmMutation.isPending} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {sdmList.length === 0 && (
                                            <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">Belum ada data SDM</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SE Table */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="font-bold text-slate-800 text-lg">Tabel Daftar SE-CSIRT</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                                    <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">NO</th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Server className="w-3.5 h-3.5" /> NAMA SE</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> IP SE</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> AS NUMBER</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><UserCheck className="w-3.5 h-3.5" /> PENGELOLA</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> FITUR</div></th>
                                            <th className="px-6 py-4"><div className="flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> KATEGORI</div></th>
                                            <th className="px-6 py-4 text-center">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {seList.map((se: any, i: number) => (
                                            <tr key={se.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium">{i + 1}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{se.nama_se}</td>
                                                <td className="px-6 py-4 font-semibold text-blue-500">{se.ip_se}</td>
                                                <td className="px-6 py-4 text-slate-500">{se.as_number_se}</td>
                                                <td className="px-6 py-4 text-slate-700 font-medium">{se.pengelola_se}</td>
                                                <td className="px-6 py-4 text-slate-500">{se.fitur_se}</td>
                                                <td className="px-6 py-4">
                                                    {se.kategori_se ? <span className="bg-orange-50 border border-orange-100 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">{se.kategori_se}</span> : <span className="text-slate-400">-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => setViewingSe(se)} className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Eye className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {seList.length === 0 && (
                                            <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">Belum ada data SE</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {showForm && !editing && (
                    <CreateCsirtModal idPerusahaan={idPerusahaan} onSubmit={handleCreate} onClose={() => setShowForm(false)} loading={createMutation.isPending} />
                )}
                {editing && (
                    <EditCsirtModal initial={editing} idPerusahaan={idPerusahaan} onSubmit={handleUpdate} onClose={() => { setEditing(null); setShowForm(false); }} loading={updateMutation.isPending} />
                )}
                {showSdmModal && !editingSdm && activeCsirtId && (
                    <CreateSdmModal csirtId={activeCsirtId} onSave={handleSdmSave} onClose={() => setShowSdmModal(false)} loading={createSdmMutation.isPending} />
                )}
                {showSdmModal && editingSdm && activeCsirtId && (
                    <EditSdmModal initial={editingSdm} csirtId={activeCsirtId} onSave={handleSdmSave} onClose={() => { setShowSdmModal(false); setEditingSdm(null); }} loading={updateSdmMutation.isPending} />
                )}

                {viewingSe && (
                    <SeDetailModal se={viewingSe} onClose={() => setViewingSe(null)} />
                )}
                {downloadDoc && (
                    <DownloadDocModal fileUrl={downloadDoc.url} fileName={downloadDoc.name} csirtName={downloadDoc.csirtName} onClose={() => setDownloadDoc(null)} />
                )}
            </AnimatePresence>
        </RequireCompanyProfile>
    );
}