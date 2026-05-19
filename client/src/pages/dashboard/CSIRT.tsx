import { useState, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { csirtService } from "@/services/csirt.service";
import { getMediaUrl } from "@/lib/utils";
import { exportCsirtPdf } from "@/lib/pdf-export";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Loader2, Building2, Pencil, Phone, Globe, Mail, Server, Link as LinkIcon, Plus, User, ShieldCheck, Briefcase, Wrench, Award, Trash2, Hash, UserCheck, Settings, Tag, Eye, Save, X, Download } from "lucide-react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { motion, AnimatePresence } from "framer-motion";
import { useCsirtProfile } from "@/hooks/useCsirtProfile";
import { useUser } from "@/hooks/useAuth";
import { csirtProfileSchema } from "@/lib/form-validation";
import type { SdmCsirt, SeCsirt } from "@/types/csirt.types";

const INPUT_CLS = "dashboard-input w-full rounded-xl border px-4 py-2.5 text-sm transition";
const LABEL_CLS = "dashboard-label mb-1.5 block text-sm font-semibold";
const FILE_TRIGGER_CLS = "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[var(--dashboard-action-soft-bg)] px-4 py-2 text-sm font-semibold text-[var(--dashboard-action-soft-fg-strong)] transition hover:bg-[var(--dashboard-action-soft-hover)]";
const FILE_WRAPPER_CLS = "dashboard-table-surface dashboard-table-divider flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-sm";
const MODAL_BACKDROP_CLS = "dashboard-modal-backdrop fixed inset-0 z-50 flex items-stretch justify-center p-0 backdrop-blur-sm sm:items-center sm:p-4";
const MODAL_PANEL_CLS = "dashboard-modal-panel h-full w-full rounded-none border p-4 shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6";
const CLOSE_BUTTON_CLS = "dashboard-modal-close rounded-xl p-1 transition hover:bg-[var(--dashboard-surface-muted)] hover:text-[var(--dashboard-text)]";
const SECONDARY_BUTTON_CLS = "button-force-white dashboard-secondary-button inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold transition disabled:opacity-50";
const PRIMARY_BUTTON_CLS = "button-force-white dashboard-primary-button inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-50";
const WARNING_BUTTON_CLS = "button-force-white dashboard-warning-button inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-50";
const SUCCESS_BUTTON_CLS = "button-force-white inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 py-2.5 text-sm font-bold transition hover:from-emerald-800 hover:via-emerald-700 hover:to-green-600 disabled:opacity-50";
const TAG_INPUT_BUTTON_CLS = "dashboard-table-surface dashboard-text-soft rounded-xl border p-2.5 transition hover:border-[var(--dashboard-selection-border)] hover:bg-[var(--dashboard-surface)] disabled:cursor-not-allowed disabled:opacity-50";
const TAG_CHIP_CLS = "dashboard-chip-info flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold";
const ACTION_EDIT_BUTTON_CLS = "dashboard-chip-warning rounded-xl p-2 transition-colors";
const ACTION_DELETE_BUTTON_CLS = "dashboard-chip-danger rounded-xl p-2 transition-colors disabled:opacity-50";
const ACTION_VIEW_BUTTON_CLS = "dashboard-chip-info rounded-xl p-2 transition-colors";
const DOC_BUTTON_CLS = "dashboard-chip-success flex-1 rounded-xl border p-3 flex items-center gap-3 text-left transition-colors";

function extractFileName(path?: string | null) {
    if (!path) return "";
    const cleanPath = path.split("?")[0];
    const fileName = cleanPath.split("/").pop()?.split("\\").pop() || "";

    try {
        return decodeURIComponent(fileName);
    } catch {
        return fileName;
    }
}

function hasAllowedExtension(fileName: string, allowedExtensions: string[]) {
    const lowerName = fileName.toLowerCase();
    return allowedExtensions.some((extension) => lowerName.endsWith(extension.toLowerCase()));
}

function RequiredMark() {
    return <span className="text-red-500">*</span>;
}

type FileUploadFieldProps = {
    label: React.ReactNode;
    accept: string;
    allowedExtensions: string[];
    file: File | null;
    existingFileName?: string | null;
    placeholder: string;
    onFileChange: (file: File | null) => void;
};

function FileUploadField({
    label,
    accept,
    allowedExtensions,
    file,
    existingFileName,
    placeholder,
    onFileChange,
}: FileUploadFieldProps) {
    const { toast } = useToast();
    const previewName = file?.name || existingFileName || "";

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        if (!selectedFile) {
            onFileChange(null);
            return;
        }

        if (!hasAllowedExtension(selectedFile.name, allowedExtensions)) {
            onFileChange(null);
            event.target.value = "";
            toast({
                title: "Format file tidak didukung",
                description: `File harus menggunakan format ${allowedExtensions.join(", ")}.`,
                variant: "destructive",
            });
            return;
        }

        onFileChange(selectedFile);
    };

    return (
        <div>
            <label className={LABEL_CLS}>{label}</label>
            <div className={FILE_WRAPPER_CLS}>
                <label className={FILE_TRIGGER_CLS}>
                    Pilih File
                    <input type="file" accept={accept} onChange={handleChange} className="sr-only" />
                </label>
                <span className="min-w-0 truncate" style={{ color: previewName ? "var(--dashboard-text-soft)" : "var(--dashboard-text-muted)" }}>
                    {previewName || placeholder}
                </span>
            </div>
        </div>
    );
}

// ─── Modal: CSIRT Profile Create ──────────────────────────────────────────────
function CreateCsirtModal({ onSubmit, onClose, loading, idPerusahaan }: any) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ nama_csirt: "", web_csirt: "", telepon_csirt: "", email_csirt: "" });
    const [photoCsirt, setPhotoCsirt] = useState<File | null>(null);
    const [fileRfc, setFileRfc] = useState<File | null>(null);
    const [filePgp, setFilePgp] = useState<File | null>(null);
    const [fileStr, setFileStr] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = csirtProfileSchema.safeParse(formData);
        if (!parsed.success) {
            toast({
                title: "Data CSIRT belum valid",
                description: parsed.error.issues[0]?.message || "Periksa kembali data CSIRT.",
                variant: "destructive",
            });
            return;
        }
        const fd = new FormData();
        fd.append("nama_csirt", parsed.data.nama_csirt);
        fd.append("web_csirt", parsed.data.web_csirt);
        fd.append("telepon_csirt", parsed.data.telepon_csirt);
        fd.append("email_csirt", parsed.data.email_csirt);
        if (idPerusahaan) fd.append("id_perusahaan", idPerusahaan);
        if (photoCsirt) fd.append("photo_csirt", photoCsirt);
        if (fileRfc) fd.append("file_rfc2350", fileRfc);
        if (filePgp) fd.append("file_public_key_pgp", filePgp);
        if (fileStr) fd.append("file_str", fileStr);
        onSubmit(fd);
    };

    return (
        <div className={MODAL_BACKDROP_CLS}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${MODAL_PANEL_CLS} overflow-y-auto sm:max-w-xl`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl font-black" style={{ color: "var(--dashboard-text)" }}>Tambah CSIRT</h3>
                    <button onClick={onClose} className={CLOSE_BUTTON_CLS}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama CSIRT <RequiredMark /></label>
                        <input value={formData.nama_csirt} onChange={(e) => setFormData({ ...formData, nama_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: CSIRT-Perusahaan" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Website CSIRT <RequiredMark /></label>
                            <input type="url" value={formData.web_csirt} onChange={(e) => setFormData({ ...formData, web_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: https://csirt.perusahaan.go.id" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Telepon CSIRT <RequiredMark /></label>
                            <input type="tel" value={formData.telepon_csirt} onChange={(e) => setFormData({ ...formData, telepon_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: +62 21 12345678" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Email CSIRT <RequiredMark /></label>
                            <input type="email" value={formData.email_csirt} onChange={(e) => setFormData({ ...formData, email_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: csirt@perusahaan.go.id" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <FileUploadField
                            label={<>Foto CSIRT <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(Opsional)</span></>}
                            accept=".jpg,.jpeg,.png"
                            allowedExtensions={[".jpg", ".jpeg", ".png"]}
                            file={photoCsirt}
                            placeholder="Belum ada file dipilih"
                            onFileChange={setPhotoCsirt}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadField
                            label={<>Dokumen RFC2350 <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(Opsional)</span></>}
                            accept=".pdf"
                            allowedExtensions={[".pdf"]}
                            file={fileRfc}
                            placeholder="Upload dokumen RFC2350 (.pdf)"
                            onFileChange={setFileRfc}
                        />
                        <FileUploadField
                            label={<>PGP Public Key <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(Opsional)</span></>}
                            accept=".asc"
                            allowedExtensions={[".asc"]}
                            file={filePgp}
                            placeholder="Upload public key (.asc)"
                            onFileChange={setFilePgp}
                        />
                        <FileUploadField
                            label={<>STR <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(Opsional)</span></>}
                            accept=".pdf"
                            allowedExtensions={[".pdf"]}
                            file={fileStr}
                            placeholder="Upload STR (.pdf)"
                            onFileChange={setFileStr}
                        />
                    </div>
                    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row">
                        <button type="button" onClick={onClose} className={`${SECONDARY_BUTTON_CLS} flex-1`}>Batal</button>
                        <button type="submit" disabled={loading} className={`${PRIMARY_BUTTON_CLS} flex-1`}>
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
    const { toast } = useToast();
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
        const parsed = csirtProfileSchema.safeParse(formData);
        if (!parsed.success) {
            toast({
                title: "Data CSIRT belum valid",
                description: parsed.error.issues[0]?.message || "Periksa kembali data CSIRT.",
                variant: "destructive",
            });
            return;
        }
        const fd = new FormData();
        fd.append("nama_csirt", parsed.data.nama_csirt);
        fd.append("web_csirt", parsed.data.web_csirt);
        fd.append("telepon_csirt", parsed.data.telepon_csirt);
        fd.append("email_csirt", parsed.data.email_csirt);
        // Do not append id_perusahaan on update to prevent permission errors
        if (photoCsirt) fd.append("photo_csirt", photoCsirt);
        if (fileRfc) fd.append("file_rfc2350", fileRfc);
        if (filePgp) fd.append("file_public_key_pgp", filePgp);
        if (fileStr) fd.append("file_str", fileStr);
        onSubmit(fd);
    };

    return (
        <div className={MODAL_BACKDROP_CLS}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${MODAL_PANEL_CLS} overflow-y-auto sm:max-w-xl`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl font-black" style={{ color: "var(--dashboard-text)" }}>Edit Profil CSIRT</h3>
                    <button onClick={onClose} className={CLOSE_BUTTON_CLS}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama CSIRT <RequiredMark /></label>
                        <input value={formData.nama_csirt} onChange={(e) => setFormData({ ...formData, nama_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: CSIRT-Perusahaan" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Website CSIRT <RequiredMark /></label>
                            <input type="url" value={formData.web_csirt} onChange={(e) => setFormData({ ...formData, web_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: https://csirt.perusahaan.go.id" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Telepon CSIRT <RequiredMark /></label>
                            <input type="tel" value={formData.telepon_csirt} onChange={(e) => setFormData({ ...formData, telepon_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: +62 21 12345678" />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Email CSIRT <RequiredMark /></label>
                            <input type="email" value={formData.email_csirt} onChange={(e) => setFormData({ ...formData, email_csirt: e.target.value })} required className={INPUT_CLS} placeholder="Contoh: csirt@perusahaan.go.id" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <FileUploadField
                            label={<>Foto CSIRT <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(JPG, JPEG, PNG, Opsional)</span></>}
                            accept=".jpg,.jpeg,.png"
                            allowedExtensions={[".jpg", ".jpeg", ".png"]}
                            file={photoCsirt}
                            existingFileName={extractFileName(initial?.photo_csirt)}
                            placeholder="Belum ada file dipilih"
                            onFileChange={setPhotoCsirt}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadField
                            label={<>Dokumen RFC2350 <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(PDF, Opsional)</span></>}
                            accept=".pdf"
                            allowedExtensions={[".pdf"]}
                            file={fileRfc}
                            existingFileName={extractFileName(initial?.file_rfc2350)}
                            placeholder="Upload dokumen RFC2350 (.pdf)"
                            onFileChange={setFileRfc}
                        />
                        <FileUploadField
                            label={<>PGP Public Key <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(.asc, Opsional)</span></>}
                            accept=".asc"
                            allowedExtensions={[".asc"]}
                            file={filePgp}
                            existingFileName={extractFileName(initial?.file_public_key_pgp)}
                            placeholder="Upload public key (.asc)"
                            onFileChange={setFilePgp}
                        />
                        <FileUploadField
                            label={<>STR <span className="text-xs font-normal" style={{ color: "var(--dashboard-text-muted)" }}>(.pdf, Opsional)</span></>}
                            accept=".pdf"
                            allowedExtensions={[".pdf"]}
                            file={fileStr}
                            existingFileName={extractFileName(initial?.file_str)}
                            placeholder="Upload STR (.pdf)"
                            onFileChange={setFileStr}
                        />
                    </div>
                    <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row">
                        <button type="button" onClick={onClose} className={`${SECONDARY_BUTTON_CLS} flex-1`}>Batal</button>
                        <button type="submit" disabled={loading} className={`${PRIMARY_BUTTON_CLS} flex-1`}>
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
        <div className={MODAL_BACKDROP_CLS}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${MODAL_PANEL_CLS} overflow-y-auto sm:max-w-lg`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl font-black" style={{ color: "var(--dashboard-text)" }}>Tambah SDM</h3>
                    <button onClick={onClose} className={CLOSE_BUTTON_CLS}><X className="w-5 h-5" /></button>
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
                                <button type="button" onClick={handleAddSert} disabled={!sertInput.trim()} className={`${TAG_INPUT_BUTTON_CLS} flex shrink-0 items-center justify-center`} aria-label="Tambah Sertifikasi">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            {sertifikasiList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {sertifikasiList.map((s, idx) => (
                                        <div key={idx} className={TAG_CHIP_CLS}>
                                            <span>{s}</span>
                                            <button type="button" onClick={() => removeSert(idx)} className="transition hover:opacity-75"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                        <button type="button" onClick={onClose} className={`${SECONDARY_BUTTON_CLS} flex-1`}>Batal</button>
                        <button type="submit" disabled={loading} className={`${PRIMARY_BUTTON_CLS} flex-1`}>
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
        <div className={MODAL_BACKDROP_CLS}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${MODAL_PANEL_CLS} overflow-y-auto sm:max-w-lg`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl font-black" style={{ color: "var(--dashboard-text)" }}>Edit SDM</h3>
                    <button onClick={onClose} className={CLOSE_BUTTON_CLS}><X className="w-5 h-5" /></button>
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
                                <button type="button" onClick={handleAddSert} disabled={!sertInput.trim()} className={`${TAG_INPUT_BUTTON_CLS} flex shrink-0 items-center justify-center`} aria-label="Tambah Sertifikasi">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            {sertifikasiList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {sertifikasiList.map((s, idx) => (
                                        <div key={idx} className={TAG_CHIP_CLS}>
                                            <span>{s}</span>
                                            <button type="button" onClick={() => removeSert(idx)} className="transition hover:opacity-75"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                        <button type="button" onClick={onClose} className={`${SECONDARY_BUTTON_CLS} flex-1`}>Batal</button>
                        <button type="submit" disabled={loading} className={`${PRIMARY_BUTTON_CLS} flex-1`}>
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
        <div className={MODAL_BACKDROP_CLS}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${MODAL_PANEL_CLS} overflow-y-auto sm:max-w-md`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl font-black" style={{ color: "var(--dashboard-text)" }}>Detail SE</h3>
                    <button onClick={onClose} className={CLOSE_BUTTON_CLS}><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                    {rows.map(({ label, value }) => (
                        <div key={label} className="dashboard-section-muted flex flex-col gap-0.5 rounded-xl border px-4 py-3">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>{label}</span>
                            <span className="text-sm font-semibold" style={{ color: "var(--dashboard-text)" }}>{value}</span>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className={`${SECONDARY_BUTTON_CLS} mt-6 w-full`}>Tutup</button>
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
        <div className={MODAL_BACKDROP_CLS}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${MODAL_PANEL_CLS} overflow-y-auto text-center sm:max-w-sm`}>
                <div className="flex justify-end mb-2">
                    <button onClick={onClose} disabled={isDownloading} className={CLOSE_BUTTON_CLS}><X className="w-5 h-5" /></button>
                </div>
                <div className="dashboard-icon-info mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Download className="w-8 h-8" />
                </div>
                <h3 className="mb-2 font-display text-lg font-black" style={{ color: "var(--dashboard-text)" }}>Unduh Dokumen</h3>
                <p className="mb-6 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>Anda akan mengunduh dokumen <strong>{fileName}</strong>. Lanjutkan?</p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button type="button" onClick={onClose} disabled={isDownloading} className={`${SECONDARY_BUTTON_CLS} flex-1 disabled:opacity-50`}>Batal</button>
                    <button onClick={handleDownload} disabled={isDownloading} className={`${PRIMARY_BUTTON_CLS} flex-1`}>
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
    const { createMutation, updateMutation } = useCsirtProfile();

    // ── Modal state ─────────────────────────────────────────────────────────
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [showSdmModal, setShowSdmModal] = useState(false);
    const [editingSdm, setEditingSdm] = useState<SdmCsirt | null>(null);
    const [viewingSe, setViewingSe] = useState<SeCsirt | null>(null);
    const [downloadDoc, setDownloadDoc] = useState<{ url: string; name: string; csirtName?: string } | null>(null);

    // ── Queries ─────────────────────────────────────────────────────────────
    const { data: user } = useUser();
    const userData = user as any;
    const idPerusahaan: string = String(
        userData?.id_perusahaan ||
        userData?.perusahaan?.id ||
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
    const companyName =
        userData?.perusahaan?.nama_perusahaan ||
        csirt?.perusahaan?.nama_perusahaan ||
        "Stakeholder";

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

    const handleStartCreateCsirt = () => {
        setEditing(null);
        setShowForm(true);
    };


    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <RequireCompanyProfile>
            <div className="max-w-7xl mx-auto space-y-6">
                <PageHeader
                    icon={Building2}
                    title={`CSIRT - ${companyName}`}
                    subtitle="Detail informasi dan manajemen tim respons insiden siber perusahaan."
                />

                {isLoading ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--dashboard-selection-text)" }} /></div>
                ) : !csirt ? (
                    <div className="dashboard-table-surface rounded-3xl border py-16 text-center" style={{ color: "var(--dashboard-text-muted)" }}>
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="mb-2 font-semibold" style={{ color: "var(--dashboard-text-soft)" }}>Belum ada data CSIRT</p>
                        <p className="mt-1 mb-6 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>Silakan daftarkan tim CSIRT perusahaan Anda terlebih dahulu.</p>
                        <button
                            onClick={handleStartCreateCsirt}
                            className={`${PRIMARY_BUTTON_CLS} inline-flex whitespace-nowrap px-6 py-3`}
                        >
                            <Plus className="w-5 h-5" /> Buat Profil CSIRT
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Main Card */}
                        <div className="dashboard-table-surface mb-6 overflow-hidden rounded-3xl border shadow-sm">
                            <div className="dashboard-divider flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold" style={{ color: "var(--dashboard-text)" }}>Profil CSIRT</h3>
                                        <p className="text-sm" style={{ color: "var(--dashboard-text-muted)" }}>Detail informasi dan manajemen CSIRT</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                await exportCsirtPdf(companyName);
                                            } catch (error: any) {
                                                toast({
                                                    title: "Export PDF gagal",
                                                    description: error?.message || "Tidak dapat membuka jendela export.",
                                                    variant: "destructive",
                                                });
                                            }
                                        }}
                                        className={`${SUCCESS_BUTTON_CLS} whitespace-nowrap px-5 sm:px-6`}
                                    >
                                        <Download className="w-4 h-4" /> Export PDF
                                    </button>
                                    <button
                                        onClick={() => { setEditing(csirt); setShowForm(true); }}
                                        className={`${WARNING_BUTTON_CLS} whitespace-nowrap px-5 sm:px-6`}
                                    >
                                        <Pencil className="w-4 h-4" /> Edit CSIRT
                                    </button>
                                </div>
                            </div>

                            <div className="dashboard-section-muted relative z-10 flex flex-col gap-8 p-6 md:flex-row md:p-8">
                                <div className="flex-1 flex flex-col md:flex-row gap-6">
                                    <div className="dashboard-table-surface dashboard-table-divider flex h-40 w-40 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl border p-2 shadow-md">
                                        {getMediaUrl(csirt.photo_csirt) ? (
                                            <img src={getMediaUrl(csirt.photo_csirt)} alt="CSIRT Photo" className="w-full h-full object-cover rounded-2xl" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                        ) : (
                                            <div className="dashboard-chip-info flex h-full w-full items-center justify-center rounded-2xl border">
                                                <Building2 className="h-16 w-16 opacity-60" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="mb-6 font-display text-3xl font-bold" style={{ color: "var(--dashboard-text)" }}>{csirt.nama_csirt}</h3>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3" style={{ color: "var(--dashboard-text-soft)" }}>
                                                <div className="dashboard-icon-info flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Telepon</p>
                                                    <p className="font-bold" style={{ color: "var(--dashboard-text)" }}>{csirt.telepon_csirt || "-"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3" style={{ color: "var(--dashboard-text-soft)" }}>
                                                <div className="dashboard-icon-success flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                                    <Globe className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Website</p>
                                                    {csirt.web_csirt ? (
                                                        <a href={csirt.web_csirt.startsWith("http") ? csirt.web_csirt : `https://${csirt.web_csirt}`} target="_blank" rel="noreferrer" className="font-bold transition-opacity hover:opacity-80" style={{ color: "var(--dashboard-text)" }}>
                                                            {csirt.web_csirt}
                                                        </a>
                                                    ) : <p className="font-bold" style={{ color: "var(--dashboard-text)" }}>-</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3" style={{ color: "var(--dashboard-text-soft)" }}>
                                                <div className="dashboard-icon-warning flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Email</p>
                                                    {csirt.email_csirt ? (
                                                        <a href={`mailto:${csirt.email_csirt}`} className="font-bold transition-opacity hover:opacity-80" style={{ color: "var(--dashboard-text)" }}>
                                                            {csirt.email_csirt}
                                                        </a>
                                                    ) : <p className="font-bold" style={{ color: "var(--dashboard-text)" }}>-</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <div className="dashboard-section-muted flex flex-1 items-center gap-4 rounded-2xl border p-5">
                                            <div style={{ color: "var(--dashboard-selection-text)" }}><UserCheck className="w-6 h-6" /></div>
                                            <div>
                                                <h4 className="text-xl font-bold" style={{ color: "var(--dashboard-selection-text)" }}>{sdmList.length}</h4>
                                                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>SDM Terdaftar</p>
                                            </div>
                                        </div>
                                        <div className="dashboard-section-muted flex flex-1 items-center gap-4 rounded-2xl border p-5">
                                            <div style={{ color: "var(--dashboard-success-soft-fg)" }}><Server className="w-6 h-6" /></div>
                                            <div>
                                                <h4 className="text-xl font-bold" style={{ color: "var(--dashboard-success-soft-fg)" }}>{seList.length}</h4>
                                                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dashboard-text-soft)" }}>SE Terdaftar</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dashboard-table-surface mt-2 flex flex-col gap-3 rounded-2xl border p-4 shadow-sm">
                                        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Dokumen Pendukung</h4>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                            {csirt.file_rfc2350 ? (
                                                <button onClick={() => setDownloadDoc({ url: getMediaUrl(csirt.file_rfc2350), name: "RFC 2350", csirtName: csirt.nama_csirt })} className={DOC_BUTTON_CLS}>
                                                    <Download className="w-5 h-5" />
                                                    <span className="text-xs font-semibold">RFC 2350</span>
                                                </button>
                                            ) : <span className="flex-1 p-3 text-xs italic" style={{ color: "var(--dashboard-text-muted)" }}>RFC 2350 belum diunggah</span>}
                                            {csirt.file_public_key_pgp ? (
                                                <button onClick={() => setDownloadDoc({ url: getMediaUrl(csirt.file_public_key_pgp), name: "PGP Public Key", csirtName: csirt.nama_csirt })} className={DOC_BUTTON_CLS}>
                                                    <Download className="w-5 h-5" />
                                                    <span className="text-xs font-semibold">PGP Public Key</span>
                                                </button>
                                            ) : <span className="flex-1 p-3 text-xs italic" style={{ color: "var(--dashboard-text-muted)" }}>PGP Key belum diunggah</span>}
                                            {csirt.file_str ? (
                                                <button onClick={() => setDownloadDoc({ url: getMediaUrl(csirt.file_str), name: "Surat Tanda Registrasi", csirtName: csirt.nama_csirt })} className={DOC_BUTTON_CLS}>
                                                    <Download className="w-5 h-5" />
                                                    <span className="text-xs font-semibold">Surat Tanda Registrasi</span>
                                                </button>
                                            ) : <span className="flex-1 p-3 text-xs italic" style={{ color: "var(--dashboard-text-muted)" }}>Surat Tanda Registrasi belum diunggah</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SDM Table */}
                        <div className="dashboard-table-surface mb-6 overflow-hidden rounded-3xl border shadow-sm">
                            <div className="dashboard-divider flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-bold" style={{ color: "var(--dashboard-text)" }}>Tabel Daftar SDM CSIRT</h3>
                                <button onClick={() => { setEditingSdm(null); setShowSdmModal(true); }} className={`${PRIMARY_BUTTON_CLS} whitespace-nowrap px-5`}>
                                    <Plus className="w-4 h-4" /> Tambah SDM
                                </button>
                            </div>
                            <div className="space-y-4 p-4 md:hidden">
                                {sdmList.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed p-5 text-center text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
                                        Belum ada data SDM
                                    </div>
                                ) : (
                                    sdmList.map((sdm: any, i: number) => (
                                        <div key={sdm.id} className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: "var(--dashboard-border)", background: "var(--dashboard-surface)" }}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>SDM #{i + 1}</p>
                                                    <h4 className="mt-1 text-base font-bold" style={{ color: "var(--dashboard-text)" }}>{sdm.nama_personel}</h4>
                                                    <p className="mt-1 text-sm font-medium" style={{ color: "var(--dashboard-selection-text)" }}>{sdm.csirt?.nama_csirt || csirt.nama_csirt}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { setEditingSdm(sdm); setShowSdmModal(true); }} className={ACTION_EDIT_BUTTON_CLS}><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteSdm(sdm)} disabled={deleteSdmMutation.isPending} className={ACTION_DELETE_BUTTON_CLS}><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Jabatan CSIRT</p>
                                                    <p className="mt-1" style={{ color: "var(--dashboard-text-soft)" }}>{sdm.jabatan_csirt || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Jabatan Perusahaan</p>
                                                    <p className="mt-1" style={{ color: "var(--dashboard-text-soft)" }}>{sdm.jabatan_perusahaan || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Keahlian</p>
                                                    <p className="mt-1" style={{ color: "var(--dashboard-text-soft)" }}>{sdm.skill || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Sertifikasi</p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {sdm.sertifikasi ? sdm.sertifikasi.split(',').map((s: string, idx: number) => {
                                                            const trimmed = s.trim();
                                                            if (!trimmed) return null;
                                                            return (
                                                                <span key={idx} className="dashboard-chip-info rounded-md border px-2.5 py-1 text-xs font-bold tracking-wide">
                                                                    {trimmed}
                                                                </span>
                                                            );
                                                        }) : <span style={{ color: "var(--dashboard-text-muted)" }}>-</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full whitespace-nowrap text-left text-sm" style={{ color: "var(--dashboard-text-soft)" }}>
                                    <thead className="dashboard-table-head text-xs uppercase font-extrabold tracking-wider">
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
                                    <tbody className="dashboard-table-divider divide-y">
                                        {sdmList.map((sdm: any, i: number) => (
                                            <tr key={sdm.id} className="dashboard-table-row-hover transition-colors">
                                                <td className="px-6 py-4 font-medium">{i + 1}</td>
                                                <td className="px-6 py-4 font-bold" style={{ color: "var(--dashboard-text)" }}>{sdm.nama_personel}</td>
                                                <td className="px-6 py-4 font-semibold" style={{ color: "var(--dashboard-selection-text)" }}>{sdm.csirt?.nama_csirt || csirt.nama_csirt}</td>
                                                <td className="px-6 py-4 font-medium" style={{ color: "var(--dashboard-text-soft)" }}>{sdm.jabatan_csirt}</td>
                                                <td className="px-6 py-4" style={{ color: "var(--dashboard-text-muted)" }}>{sdm.jabatan_perusahaan}</td>
                                                <td className="px-6 py-4" style={{ color: "var(--dashboard-text-muted)" }}>{sdm.skill}</td>
                                                <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {sdm.sertifikasi ? sdm.sertifikasi.split(',').map((s: string, idx: number) => {
                                                            const trimmed = s.trim();
                                                            if (!trimmed) return null;
                                                            return (
                                                                <span key={idx} className="dashboard-chip-info rounded-md border px-2.5 py-1 text-xs font-bold tracking-wide">
                                                                    {trimmed}
                                                                </span>
                                                            );
                                                        }) : <span style={{ color: "var(--dashboard-text-muted)" }}>-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => { setEditingSdm(sdm); setShowSdmModal(true); }} className={ACTION_EDIT_BUTTON_CLS}><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteSdm(sdm)} disabled={deleteSdmMutation.isPending} className={ACTION_DELETE_BUTTON_CLS}><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {sdmList.length === 0 && (
                                            <tr><td colSpan={8} className="px-6 py-8 text-center" style={{ color: "var(--dashboard-text-muted)" }}>Belum ada data SDM</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SE Table */}
                        <div className="dashboard-table-surface overflow-hidden rounded-3xl border shadow-sm">
                            <div className="dashboard-divider flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-bold" style={{ color: "var(--dashboard-text)" }}>Tabel Daftar SE-CSIRT</h3>
                            </div>
                            <div className="space-y-4 p-4 md:hidden">
                                {seList.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed p-5 text-center text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
                                        Belum ada data SE
                                    </div>
                                ) : (
                                    seList.map((se: any, i: number) => (
                                        <div key={se.id} className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: "var(--dashboard-border)", background: "var(--dashboard-surface)" }}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>SE #{i + 1}</p>
                                                    <h4 className="mt-1 text-base font-bold" style={{ color: "var(--dashboard-text)" }}>{se.nama_se}</h4>
                                                </div>
                                                <button onClick={() => setViewingSe(se)} className={ACTION_VIEW_BUTTON_CLS}><Eye className="w-4 h-4" /></button>
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>IP SE</p>
                                                    <p className="mt-1 font-semibold" style={{ color: "var(--dashboard-selection-text)" }}>{se.ip_se || "-"}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>AS Number</p>
                                                        <p className="mt-1" style={{ color: "var(--dashboard-text-soft)" }}>{se.as_number_se || "-"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Kategori</p>
                                                        <div className="mt-2">
                                                            {se.kategori_se ? <span className="dashboard-chip-warning rounded-lg border px-3 py-1 text-xs font-bold tracking-wide">{se.kategori_se}</span> : <span style={{ color: "var(--dashboard-text-muted)" }}>-</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Pengelola</p>
                                                    <p className="mt-1" style={{ color: "var(--dashboard-text-soft)" }}>{se.pengelola_se || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Fitur</p>
                                                    <p className="mt-1" style={{ color: "var(--dashboard-text-soft)" }}>{se.fitur_se || "-"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full whitespace-nowrap text-left text-sm" style={{ color: "var(--dashboard-text-soft)" }}>
                                    <thead className="dashboard-table-head text-xs uppercase font-extrabold tracking-wider">
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
                                    <tbody className="dashboard-table-divider divide-y">
                                        {seList.map((se: any, i: number) => (
                                            <tr key={se.id} className="dashboard-table-row-hover transition-colors">
                                                <td className="px-6 py-4 font-medium">{i + 1}</td>
                                                <td className="px-6 py-4 font-bold" style={{ color: "var(--dashboard-text)" }}>{se.nama_se}</td>
                                                <td className="px-6 py-4 font-semibold" style={{ color: "var(--dashboard-selection-text)" }}>{se.ip_se}</td>
                                                <td className="px-6 py-4" style={{ color: "var(--dashboard-text-muted)" }}>{se.as_number_se}</td>
                                                <td className="px-6 py-4 font-medium" style={{ color: "var(--dashboard-text-soft)" }}>{se.pengelola_se}</td>
                                                <td className="px-6 py-4" style={{ color: "var(--dashboard-text-muted)" }}>{se.fitur_se}</td>
                                                <td className="px-6 py-4">
                                                    {se.kategori_se ? <span className="dashboard-chip-warning rounded-lg border px-3 py-1 text-xs font-bold tracking-wide">{se.kategori_se}</span> : <span style={{ color: "var(--dashboard-text-muted)" }}>-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => setViewingSe(se)} className={ACTION_VIEW_BUTTON_CLS}><Eye className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {seList.length === 0 && (
                                            <tr><td colSpan={8} className="px-6 py-8 text-center" style={{ color: "var(--dashboard-text-muted)" }}>Belum ada data SE</td></tr>
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
