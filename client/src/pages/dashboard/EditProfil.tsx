import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { usersService } from "@/services/users.service";
import { useUser } from "@/hooks/useAuth";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, UserCircle, Lock, Mail, User, Building2, MapPin, Phone, Globe, Image as ImageIcon, MoreVertical, Briefcase, Edit2, X, Camera, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { picService } from "@/services/pic.service";
import { PICPerusahaan } from "@/types/pic.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "react-router-dom";
import { getMediaUrl } from "@/lib/utils";

const ProfileSchema = z.object({
    display_name: z.string().min(2, "Nama pengguna minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    jabatan: z.string().optional().nullable(),
});

const PerusahaanSchema = z.object({
    nama_perusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
    alamat: z.string().optional().nullable(),
    email: z.string().email("Email tidak valid").optional().nullable().or(z.literal("")),
    telepon: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    photo: z.string().optional().nullable(),
    id_sub_sektor: z.string().optional().nullable(),
});

type ProfileForm = z.infer<typeof ProfileSchema>;
type PerusahaanForm = z.infer<typeof PerusahaanSchema>;

const INPUT_CLS = "dashboard-input w-full rounded-xl border px-4 py-2.5 text-sm transition";
const LABEL_CLS = "dashboard-label mb-1.5 block text-sm font-semibold";
const PANEL_CLS = "dashboard-section-card rounded-2xl border p-6 shadow-[0_24px_54px_rgba(148,163,184,0.18)]";
const PANEL_HEADER_CLS = "dashboard-divider mb-6 flex items-center gap-2 border-b pb-4";
const HERO_PANEL_CLS = "dashboard-table-surface relative overflow-hidden rounded-2xl border shadow-[0_24px_54px_rgba(148,163,184,0.18)]";
const MODAL_PANEL_CLS = "dashboard-modal-panel w-full max-w-md overflow-hidden rounded-3xl border p-6 shadow-[0_24px_54px_rgba(148,163,184,0.18)]";
const MUTED_BUTTON_CLS = "button-force-white dashboard-secondary-button inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all";
const DANGER_BUTTON_CLS = "button-force-white inline-flex items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-rose-500 via-red-500 to-red-600 px-4 py-2 text-sm font-semibold transition-all hover:from-rose-600 hover:via-red-600 hover:to-red-700";
const PRIMARY_BUTTON_CLS = "button-force-white dashboard-primary-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50";
const EDIT_BUTTON_CLS = "button-force-white dashboard-warning-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5";
const ICON_PILL_CLS = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--dashboard-info-soft-border)] bg-[var(--dashboard-info-soft-bg)]";
const INFO_LABEL_CLS = "mb-0.5 text-sm text-[var(--dashboard-text-muted)]";
const INFO_VALUE_CLS = "truncate font-medium text-[var(--dashboard-text)]";
const USER_BANNER_UPLOAD_BUTTON_CLS = "flex items-center gap-2 rounded-xl bg-[#e8edf6] px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all hover:bg-white";
const USER_PHOTO_UPLOAD_BUTTON_CLS = "flex h-11 w-11 items-center justify-center rounded-full bg-[#e8edf6] text-slate-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:bg-white";
const COMPANY_BANNER_UPLOAD_BUTTON_CLS = "flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/30";
const PIC_TABLE_CLS = "w-full whitespace-nowrap text-left text-sm text-[var(--dashboard-text-soft)]";
const PIC_TABLE_HEAD_CLS = "dashboard-table-head dashboard-table-divider border-b text-xs font-extrabold uppercase tracking-wider text-[var(--dashboard-text-muted)]";
const PIC_TABLE_BODY_CLS = "dashboard-table-divider divide-y";
const PIC_TABLE_ROW_CLS = "dashboard-table-row-hover transition-colors";
const GHOST_ICON_BUTTON_CLS = "rounded-xl p-2 transition-colors";
const FIELD_ICON_CLS = "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dashboard-text-muted)]";
const INFO_ICON_COLOR_CLS = "text-[var(--dashboard-info-soft-fg)]";
const META_ICON_CLS = "h-4 w-4 text-[var(--dashboard-text-muted)]";
const ERROR_TEXT_CLS = "mt-1 text-xs text-[var(--dashboard-danger-soft-fg)]";
const HERO_META_LINK_CLS = "font-medium text-[var(--dashboard-info-soft-fg)] transition-colors hover:opacity-80 hover:underline";
const BULLET_CLS = "text-[var(--dashboard-text-muted)]";
const AVATAR_FALLBACK_CLS = "flex h-full w-full items-center justify-center bg-[var(--dashboard-page-header)] text-3xl font-black text-white";
const HOVER_OVERLAY_CLS = "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100";

function getInitials(name: string) {
    if (!name) return "";
    return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function mergePerusahaanIntoUser<T extends Record<string, any> | null | undefined>(
    user: T,
    perusahaan: Record<string, any> | null | undefined
) {
    if (!user || !perusahaan) return user;

    return {
        ...user,
        id_perusahaan: user.id_perusahaan ?? perusahaan.id ?? "",
        companyId: user.companyId ?? perusahaan.id ?? "",
        has_company: true,
        hasCompany: true,
        perusahaan,
    };
}

// ─── Modal: Tambah/Edit PIC ──────────────────────────────────────────────────
function PicModal({ 
    initialData, 
    idPerusahaan, 
    onClose, 
    onSave, 
    loading 
}: { 
    initialData?: PICPerusahaan; 
    idPerusahaan: string; 
    onClose: () => void; 
    onSave: (data: any) => void; 
    loading: boolean;
}) {
    const [form, setForm] = useState({
        nama: initialData?.nama || "",
        email: initialData?.email || "",
        telepon: initialData?.telepon || ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...form, id_perusahaan: idPerusahaan });
    };

    return (
        <div className="dashboard-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={MODAL_PANEL_CLS}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-[var(--dashboard-text)]">{initialData ? "Edit PIC" : "Tambah PIC"}</h3>
                    <button onClick={onClose} className="dashboard-modal-close rounded-xl p-1 transition hover:brightness-95"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={LABEL_CLS}>Nama Lengkap</label>
                        <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className={INPUT_CLS} placeholder="Nama PIC" />
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Email</label>
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT_CLS} placeholder="email@domain.com" />
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Telepon</label>
                        <input required value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} className={INPUT_CLS} placeholder="Nomor Telepon" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className={`${MUTED_BUTTON_CLS} flex-1 justify-center py-2.5 font-bold`}>Batal</button>
                        <button type="submit" disabled={loading} className={`${PRIMARY_BUTTON_CLS} flex-1 py-2.5`}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

interface EditProfilProps {
    defaultTab?: "pengguna" | "perusahaan";
}

export default function EditProfil({ defaultTab = "pengguna" }: EditProfilProps) {
    const { toast } = useToast();
    const qc = useQueryClient();
    const rehydrateFromServer = useAuthStore((state) => state.rehydrateFromServer);
    const syncCurrentUser = useAuthStore((state) => state.syncCurrentUser);
    const [searchParams] = useSearchParams();
    const [isEditingPengguna, setIsEditingPengguna] = useState(false);
    const [isEditingPerusahaan, setIsEditingPerusahaan] = useState(false);
    const [pendingUserPhoto, setPendingUserPhoto] = useState<File | null>(null);
    const [pendingUserBanner, setPendingUserBanner] = useState<File | null>(null);
    const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
    const [userBannerPreview, setUserBannerPreview] = useState<string | null>(null);
    const initialTab = searchParams.get("tab") === "perusahaan" ? "perusahaan" : defaultTab;

    const { data: user, isLoading: isUserLoading } = useUser();

    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { perusahaan, isResolvingPerusahaan } = useCompanyProfile(user);

    const { data: subSektors } = useQuery({ queryKey: ["subSektor"], queryFn: () => apiClient.get<any[]>("/api/sub_sektor") });

    // PIC Queries & Mutations
    const [showPicModal, setShowPicModal] = useState(false);
    const [editingPic, setEditingPic] = useState<PICPerusahaan | undefined>();

    const { data: pics = [], isLoading: isLoadingPics } = useQuery({
        queryKey: ["pics", perusahaanId],
        queryFn: () => picService.getByPerusahaanId(String(perusahaanId)),
        enabled: !!perusahaanId,
    });

    const createPicMutation = useMutation({
        mutationFn: picService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["pics"] }); setShowPicModal(false); toast({ title: "PIC berhasil ditambahkan" }); },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const updatePicMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => picService.update(id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["pics"] }); setShowPicModal(false); setEditingPic(undefined); toast({ title: "PIC berhasil diperbarui" }); },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const deletePicMutation = useMutation({
        mutationFn: picService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["pics"] }); toast({ title: "PIC berhasil dihapus" }); },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const handleSavePic = (data: any) => {
        if (editingPic) {
            updatePicMutation.mutate({ id: editingPic.id, data });
        } else {
            createPicMutation.mutate(data);
        }
    };

    const handleDeletePic = (id: string, nama: string) => {
        if (confirm(`Hapus PIC ${nama}?`)) {
            deletePicMutation.mutate(id);
        }
    };

    const profileForm = useForm<ProfileForm>({ resolver: zodResolver(ProfileSchema) });
    const perusahaanForm = useForm<PerusahaanForm>({ resolver: zodResolver(PerusahaanSchema) });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                display_name: user.display_name || user.username || "",
                email: user.email,
                jabatan: user.jabatan_name || user.id_jabatan || user.jabatan || "",
            });
        }
    }, [user, profileForm]);

    useEffect(() => {
        const pData = perusahaan || user?.perusahaan;
        if (pData) {
            perusahaanForm.reset({
                nama_perusahaan: pData.nama_perusahaan || "",
                alamat: pData.alamat || "",
                email: pData.email || "",
                telepon: pData.telepon || "",
                website: pData.website || "",
                photo: pData.photo || "",
                id_sub_sektor: pData.sub_sektor?.id || pData.id_sub_sektor || "",
            });
        }
    }, [perusahaan, user?.perusahaan, perusahaanForm]);

    useEffect(() => {
        return () => {
            if (userPhotoPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(userPhotoPreview);
            }
        };
    }, [userPhotoPreview]);

    useEffect(() => {
        return () => {
            if (userBannerPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(userBannerPreview);
            }
        };
    }, [userBannerPreview]);

    const resetPendingUserMedia = () => {
        setPendingUserPhoto(null);
        setPendingUserBanner(null);
        setUserPhotoPreview((current) => {
            if (current?.startsWith("blob:")) {
                URL.revokeObjectURL(current);
            }
            return null;
        });
        setUserBannerPreview((current) => {
            if (current?.startsWith("blob:")) {
                URL.revokeObjectURL(current);
            }
            return null;
        });
    };

    const profileMutation = useMutation({
        mutationFn: async (payload: { data: ProfileForm; media?: FormData | null }) => {
            const updated = await usersService.updateCurrentUser(payload.data);
            if (payload.media) {
                return usersService.updateCurrentUserMedia(payload.media);
            }
            return updated;
        },
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
            syncCurrentUser(updated);
            resetPendingUserMedia();
            toast({ title: "Profil diperbarui" });
            setIsEditingPengguna(false);
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const perusahaanMutation = useMutation({
        mutationFn: (d: PerusahaanForm) => {
            if (!perusahaanId) throw new Error("ID perusahaan tidak ditemukan");
            const formData = new FormData();
            formData.append("nama_perusahaan", d.nama_perusahaan || "");
            formData.append("alamat", d.alamat || "");
            formData.append("email", d.email || "");
            formData.append("telepon", d.telepon || "");
            formData.append("website", d.website || "");
            if (d.id_sub_sektor) {
                formData.append("id_sub_sektor", d.id_sub_sektor);
            }
            return apiClient.putForm<any>(`/api/perusahaan/${perusahaanId}`, formData);
        },
        onSuccess: async (updatedPerusahaan) => {
            qc.setQueryData(["perusahaan", perusahaanId], updatedPerusahaan);
            const mergedUser = mergePerusahaanIntoUser(qc.getQueryData(["me"]) as Record<string, any> | undefined, updatedPerusahaan);
            if (mergedUser) {
                qc.setQueryData(["me"], mergedUser);
                syncCurrentUser(mergedUser);
            }
            qc.invalidateQueries({ queryKey: ["perusahaan", perusahaanId] });
            qc.invalidateQueries({ queryKey: ["me"] });
            await rehydrateFromServer();
            toast({ title: "Profil perusahaan diperbarui" });
            setIsEditingPerusahaan(false);
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const uploadPerusahaanImageMutation = useMutation({
        mutationFn: (formData: FormData) => {
            if (!perusahaanId) throw new Error("ID perusahaan tidak ditemukan");
            return apiClient.putForm<any>(`/api/perusahaan/${perusahaanId}`, formData);
        },
        onSuccess: async (updatedPerusahaan) => {
            qc.setQueryData(["perusahaan", perusahaanId], updatedPerusahaan);
            const mergedUser = mergePerusahaanIntoUser(qc.getQueryData(["me"]) as Record<string, any> | undefined, updatedPerusahaan);
            if (mergedUser) {
                qc.setQueryData(["me"], mergedUser);
                syncCurrentUser(mergedUser);
            }
            qc.invalidateQueries({ queryKey: ["perusahaan", perusahaanId] });
            qc.invalidateQueries({ queryKey: ["me"] });
            await rehydrateFromServer();
            toast({ title: "Foto/banner perusahaan berhasil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal mengunggah foto", description: e.message, variant: "destructive" }),
    });

    const userPhotoInputRef = useRef<HTMLInputElement>(null);
    const userBannerInputRef = useRef<HTMLInputElement>(null);
    const perusahaanBannerInputRef = useRef<HTMLInputElement>(null);

    const updateUserMediaPreview = (type: 'user_photo' | 'user_banner', file: File) => {
        const previewUrl = URL.createObjectURL(file);
        if (type === 'user_photo') {
            setPendingUserPhoto(file);
            setUserPhotoPreview((current) => {
                if (current?.startsWith("blob:")) {
                    URL.revokeObjectURL(current);
                }
                return previewUrl;
            });
            return;
        }

        setPendingUserBanner(file);
        setUserBannerPreview((current) => {
            if (current?.startsWith("blob:")) {
                URL.revokeObjectURL(current);
            }
            return previewUrl;
        });
    };

    const handleUpload = (type: 'user_photo' | 'user_banner' | 'perusahaan_banner', file: File) => {
        if (type === 'user_photo') {
            updateUserMediaPreview('user_photo', file);
        } else if (type === 'user_banner') {
            updateUserMediaPreview('user_banner', file);
        } else if (type === 'perusahaan_banner') {
            const formData = new FormData();
            formData.append("photo", file);
            uploadPerusahaanImageMutation.mutate(formData);
        }
    };

    const submitProfileUpdate = (data: ProfileForm) => {
        const media = pendingUserPhoto || pendingUserBanner
            ? (() => {
                const formData = new FormData();
                if (pendingUserPhoto) {
                    formData.append("profile_photo", pendingUserPhoto);
                }
                if (pendingUserBanner) {
                    formData.append("banner", pendingUserBanner);
                }
                return formData;
            })()
            : null;

        profileMutation.mutate({ data, media });
    };

    if (isUserLoading || (!!perusahaanId && isResolvingPerusahaan)) {
        return (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-info-soft-fg)]" /></div>
        );
    }

    const userBannerImage = userBannerPreview || (user?.banner ? getMediaUrl(user.banner) : "");
    const userPhotoImage = userPhotoPreview || (user?.foto_profile ? getMediaUrl(user.foto_profile) : "");

    return (
        <div className="max-w-4xl mx-auto space-y-6">
                <Tabs defaultValue={initialTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="pengguna">Profil Pengguna</TabsTrigger>
                        <TabsTrigger value="perusahaan">Profil Perusahaan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pengguna" className="space-y-6">
                        {/* Banner & Avatar Profile */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={HERO_PANEL_CLS}
                        >
                            {/* Banner */}
                            <div
                                className={`h-32 w-full bg-cover bg-center relative group overflow-hidden ${!userBannerImage ? 'bg-gradient-to-r from-indigo-900/60 to-blue-900/60' : ''}`}
                                style={{ backgroundImage: userBannerImage ? `url(${userBannerImage})` : undefined }}
                            >
                                {isEditingPengguna && (
                                    <div className={HOVER_OVERLAY_CLS}>
                                        <button onClick={() => userBannerInputRef.current?.click()} className={USER_BANNER_UPLOAD_BUTTON_CLS}>
                                            <ImageIcon className="w-4 h-4" /> Ganti Banner
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="absolute right-4 top-4 z-20">
                                {!isEditingPengguna ? (
                                    <button 
                                        onClick={() => setIsEditingPengguna(true)}
                                        className={EDIT_BUTTON_CLS}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Data
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            profileForm.reset({
                                                display_name: user?.display_name || user?.username || "",
                                                email: user?.email || "",
                                                jabatan: user?.jabatan_name || user?.id_jabatan || user?.jabatan || "",
                                            });
                                            resetPendingUserMedia();
                                            setIsEditingPengguna(false);
                                        }}
                                        className={DANGER_BUTTON_CLS}
                                    >
                                        <X className="w-4 h-4" />
                                        Batal
                                    </button>
                                )}

                                <input
                                    type="file"
                                    ref={userPhotoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleUpload('user_photo', e.target.files[0]);
                                        e.currentTarget.value = "";
                                    }}
                                />
                                <input
                                    type="file"
                                    ref={userBannerInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleUpload('user_banner', e.target.files[0]);
                                        e.currentTarget.value = "";
                                    }}
                                />
                            </div>

                            {/* Info Area */}
                            <div className="px-6 pb-6 relative">
                                {/* Profile Picture */}
                                <div className="absolute -top-12 left-6 group">
                                    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/70 bg-[var(--dashboard-surface)] shadow-sm">
                                        {userPhotoImage ? (
                                            <img
                                                src={userPhotoImage}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className={AVATAR_FALLBACK_CLS}>
                                                {user?.username ? getInitials(user.username) : <User className="w-10 h-10" />}
                                            </div>
                                        )}
                                        {isEditingPengguna && (
                                            <div className={HOVER_OVERLAY_CLS}>
                                                <button onClick={() => userPhotoInputRef.current?.click()} className={USER_PHOTO_UPLOAD_BUTTON_CLS}>
                                                    <Camera className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-14">
                                    <h2 className="text-2xl font-bold text-[var(--dashboard-text)]">{user?.display_name || user?.username || "Nama Pengguna"}</h2>
                                    <div className="flex flex-col gap-1.5 mt-1.5">
                                        <div className="flex flex-wrap items-center gap-x-2 text-sm">
                                            <span className="font-medium text-[var(--dashboard-text-muted)]">{user?.email}</span>
                                            {user?.jabatan_name && (
                                                <>
                                                    <span className={BULLET_CLS}>•</span>
                                                    <div className="flex items-center gap-1.5 text-[var(--dashboard-text-soft)]">
                                                        <div className="flex h-4 w-4 items-center justify-center rounded bg-[var(--dashboard-info-soft-fg)]">
                                                            <Briefcase className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                        <span className="font-medium">{user.jabatan_name}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-[var(--dashboard-text-muted)]">
                                        Bergabung: {user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : ""}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Menampilkan Data Akun (Read Only) */}
                        {!isEditingPengguna && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                className={PANEL_CLS}
                            >
                                <div className={PANEL_HEADER_CLS}>
                                    <h3 className="text-lg font-bold text-[var(--dashboard-text)]">Informasi Akun</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <User className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Nama Pengguna</p>
                                            <p className={INFO_VALUE_CLS}>{user?.display_name || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <Mail className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Email</p>
                                            <p className={INFO_VALUE_CLS}>{user?.email || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <Briefcase className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Jabatan</p>
                                            <p className={INFO_VALUE_CLS}>{user?.jabatan_name || user?.jabatan || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Edit Forms */}
                        {isEditingPengguna && (
                            <div className="space-y-6">
                                {/* Profile form */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 }}
                                    className={PANEL_CLS}
                                >
                            <div className="flex items-center gap-2 mb-5">
                                <UserCircle className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                <h3 className="font-bold text-[var(--dashboard-text)]">Informasi Akun</h3>
                            </div>
                            <form onSubmit={profileForm.handleSubmit(submitProfileUpdate)} className="space-y-4">
                                {(pendingUserPhoto || pendingUserBanner) && (
                                    <div className="rounded-xl border border-dashed border-[var(--dashboard-info-soft-border)] bg-[var(--dashboard-info-soft-bg)] px-4 py-3 text-sm text-[var(--dashboard-info-soft-fg)]">
                                        Perubahan foto profil atau banner belum disimpan. Klik `Perbarui Profil` untuk mengirim perubahan ke server.
                                    </div>
                                )}
                                <div>
                                    <label className={LABEL_CLS}>Nama Pengguna</label>
                                    <div className="relative">
                                        <User className={FIELD_ICON_CLS} />
                                        <input {...profileForm.register("display_name")} className={`${INPUT_CLS} pl-10`} />
                                    </div>
                                    {profileForm.formState.errors.display_name && (
                                        <p className={ERROR_TEXT_CLS}>{profileForm.formState.errors.display_name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Email</label>
                                    <div className="relative">
                                        <Mail className={FIELD_ICON_CLS} />
                                        <input {...profileForm.register("email")} type="email" className={`${INPUT_CLS} pl-10`} />
                                    </div>
                                    {profileForm.formState.errors.email && (
                                        <p className={ERROR_TEXT_CLS}>{profileForm.formState.errors.email.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Jabatan</label>
                                    <div className="relative">
                                        <Briefcase className={FIELD_ICON_CLS} />
                                        <input {...profileForm.register("jabatan")} className={`${INPUT_CLS} pl-10`} placeholder="Jabatan atau peranan" />
                                    </div>
                                    {profileForm.formState.errors.jabatan && (
                                        <p className={ERROR_TEXT_CLS}>{profileForm.formState.errors.jabatan.message}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={profileMutation.isPending}
                                    className={`${PRIMARY_BUTTON_CLS} w-full py-3`}
                                >
                                    {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Perbarui Profil
                                </button>
                            </form>
                        </motion.div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="perusahaan" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${HERO_PANEL_CLS} mb-6`}
                        >
                            {/* Banner / Foto Perusahaan */}
                            <div
                                className={`h-40 w-full bg-cover bg-center relative group overflow-hidden ${!perusahaan?.photo ? 'bg-gradient-to-r from-indigo-900/60 to-blue-900/60' : ''}`}
                                style={{ backgroundImage: perusahaan?.photo ? `url(${getMediaUrl(perusahaan.photo)})` : undefined }}
                            >
                                {isEditingPerusahaan && (
                                    <div className={HOVER_OVERLAY_CLS}>
                                        <button onClick={() => perusahaanBannerInputRef.current?.click()} className={COMPANY_BANNER_UPLOAD_BUTTON_CLS}>
                                            <ImageIcon className="w-4 h-4" /> Ganti Foto/Banner Perusahaan
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="absolute right-4 top-4 z-20">
                                {!isEditingPerusahaan ? (
                                    <button 
                                        onClick={() => setIsEditingPerusahaan(true)}
                                        className={EDIT_BUTTON_CLS}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Data
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditingPerusahaan(false)}
                                        className={DANGER_BUTTON_CLS}
                                    >
                                        <X className="w-4 h-4" />
                                        Batal
                                    </button>
                                )}

                                <input
                                    type="file"
                                    ref={perusahaanBannerInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleUpload('perusahaan_banner', e.target.files[0]);
                                    }}
                                />
                            </div>

                            {/* Info Area */}
                            <div className="px-6 pb-6 relative">
                                <div className="pt-6">
                                    <h2 className="text-2xl font-bold text-[var(--dashboard-text)]">{perusahaan?.nama_perusahaan || "Nama Perusahaan"}</h2>

                                    <div className="flex flex-col gap-2 mt-3">
                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                            {perusahaan?.email && (
                                                <div className="flex items-center gap-1.5 text-[var(--dashboard-text-soft)]">
                                                    <Mail className={META_ICON_CLS} />
                                                    <span className="font-medium">{perusahaan.email}</span>
                                                </div>
                                            )}

                                            {perusahaan?.telepon && (
                                                <div className="flex items-center gap-1.5 text-[var(--dashboard-text-soft)]">
                                                    <Phone className={META_ICON_CLS} />
                                                    <span className="font-medium">{perusahaan.telepon}</span>
                                                </div>
                                            )}
                                            
                                            {perusahaan?.website && (
                                                <div className="flex items-center gap-1.5 text-[var(--dashboard-text-soft)]">
                                                    <Globe className={META_ICON_CLS} />
                                                    <a href={perusahaan.website.startsWith('http') ? perusahaan.website : `https://${perusahaan.website}`} target="_blank" rel="noreferrer" className={HERO_META_LINK_CLS}>{perusahaan.website}</a>
                                                </div>
                                            )}
                                            
                                            {(perusahaan?.sub_sektor?.nama_sub_sektor || subSektors?.find((s:any) => s.id === perusahaan?.id_sub_sektor)?.nama_sub_sektor) && (
                                                <div className="flex items-center gap-1.5 text-[var(--dashboard-text-soft)]">
                                                    <Briefcase className={META_ICON_CLS} />
                                                    <span className="font-medium text-[var(--dashboard-info-soft-fg)]">{perusahaan?.sub_sektor?.nama_sub_sektor || subSektors?.find((s:any) => s.id === perusahaan?.id_sub_sektor)?.nama_sub_sektor}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {perusahaan?.alamat && (
                                        <p className="mt-3 flex items-start gap-1.5 text-sm text-[var(--dashboard-text-muted)]">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dashboard-text-muted)]" />
                                            {perusahaan.alamat}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Menampilkan Data Perusahaan (Read Only) */}
                        {!isEditingPerusahaan && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={PANEL_CLS}
                            >
                                <div className="dashboard-divider mb-6 border-b pb-4">
                                    <h3 className="text-lg font-bold text-[var(--dashboard-text)]">Informasi Perusahaan</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <Building2 className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Nama Perusahaan</p>
                                            <p className={INFO_VALUE_CLS}>{perusahaan?.nama_perusahaan || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <MapPin className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Alamat</p>
                                            <p className={INFO_VALUE_CLS}>{perusahaan?.alamat || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <Mail className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Email</p>
                                            <p className={INFO_VALUE_CLS}>{perusahaan?.email || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <Phone className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Telepon</p>
                                            <p className={INFO_VALUE_CLS}>{perusahaan?.telepon || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <Globe className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Website</p>
                                            <p className={INFO_VALUE_CLS}>{perusahaan?.website || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={ICON_PILL_CLS}>
                                            <Briefcase className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={INFO_LABEL_CLS}>Sektor</p>
                                            <p className={INFO_VALUE_CLS}>{perusahaan?.sub_sektor?.nama_sub_sektor || subSektors?.find((s:any) => s.id === perusahaan?.id_sub_sektor)?.nama_sub_sektor || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {isEditingPerusahaan && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`${PANEL_CLS} mb-6`}
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <Building2 className={`w-5 h-5 ${INFO_ICON_COLOR_CLS}`} />
                                <h3 className="font-bold text-[var(--dashboard-text)]">Informasi Perusahaan</h3>
                            </div>
                            <form onSubmit={perusahaanForm.handleSubmit((d) => perusahaanMutation.mutate(d))} className="space-y-4">
                                <div>
                                    <label className={LABEL_CLS}>Nama Perusahaan</label>
                                    <div className="relative">
                                        <Building2 className={FIELD_ICON_CLS} />
                                        <input {...perusahaanForm.register("nama_perusahaan")} readOnly className={`${INPUT_CLS} cursor-not-allowed bg-[var(--dashboard-section-muted)] pl-10 text-[var(--dashboard-text-muted)]`} placeholder="Nama Perusahaan" />
                                    </div>
                                    {perusahaanForm.formState.errors.nama_perusahaan && (
                                        <p className={ERROR_TEXT_CLS}>{perusahaanForm.formState.errors.nama_perusahaan.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Alamat</label>
                                    <div className="relative">
                                        <MapPin className={FIELD_ICON_CLS} />
                                        <input {...perusahaanForm.register("alamat")} className={`${INPUT_CLS} pl-10`} placeholder="Alamat Perusahaan" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL_CLS}>Email</label>
                                        <div className="relative">
                                            <Mail className={FIELD_ICON_CLS} />
                                            <input {...perusahaanForm.register("email")} type="email" className={`${INPUT_CLS} pl-10`} placeholder="email@perusahaan.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={LABEL_CLS}>Telepon</label>
                                        <div className="relative">
                                            <Phone className={FIELD_ICON_CLS} />
                                            <input {...perusahaanForm.register("telepon")} className={`${INPUT_CLS} pl-10`} placeholder="021-xxxxxxx" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL_CLS}>Website</label>
                                        <div className="relative">
                                            <Globe className={FIELD_ICON_CLS} />
                                            <input {...perusahaanForm.register("website")} className={`${INPUT_CLS} pl-10`} placeholder="https://www.perusahaan.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={LABEL_CLS}>Sektor</label>
                                        <div className="relative">
                                            <select
                                                {...perusahaanForm.register("id_sub_sektor")}
                                                className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
                                            >
                                                <option value="">-- Pilih Sektor --</option>
                                                {subSektors?.map((s: any) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.nama_sub_sektor}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={perusahaanMutation.isPending}
                                    className={`${PRIMARY_BUTTON_CLS} mt-4 w-full py-3`}
                                >
                                    {perusahaanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan Perusahaan
                                </button>
                            </form>
                        </motion.div>
                        )}

                        {/* PIC Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className={`${HERO_PANEL_CLS} mt-6`}
                        >
                            <div className="dashboard-table-divider flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-bold text-[var(--dashboard-text)]">Daftar PIC (Person in Charge)</h3>
                                {isEditingPerusahaan && (
                                    <button
                                        onClick={() => { setEditingPic(undefined); setShowPicModal(true); }}
                                        className={PRIMARY_BUTTON_CLS}
                                        disabled={!perusahaanId}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah PIC
                                    </button>
                                )}
                            </div>
                                <div className="overflow-x-auto">
                                    <table className={PIC_TABLE_CLS}>
                                        <thead className={PIC_TABLE_HEAD_CLS}>
                                            <tr>
                                                <th className="px-6 py-4">Nama</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Telepon</th>
                                                {isEditingPerusahaan && <th className="px-6 py-4 text-center">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody className={PIC_TABLE_BODY_CLS}>
                                            {isLoadingPics ? (
                                                <tr><td colSpan={isEditingPerusahaan ? 4 : 3} className="px-6 py-8 text-center text-[var(--dashboard-text-muted)]"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
                                            ) : pics.length === 0 ? (
                                                <tr><td colSpan={isEditingPerusahaan ? 4 : 3} className="px-6 py-8 text-center font-medium text-[var(--dashboard-text-muted)]">Belum ada data PIC</td></tr>
                                            ) : (
                                                pics.map((p) => (
                                                    <tr key={p.id} className={PIC_TABLE_ROW_CLS}>
                                                        <td className="px-6 py-4 font-bold text-[var(--dashboard-text)]">{p.nama}</td>
                                                        <td className="px-6 py-4">{p.email}</td>
                                                        <td className="px-6 py-4">{p.telepon}</td>
                                                        {isEditingPerusahaan && (
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button onClick={() => { setEditingPic(p); setShowPicModal(true); }} className={`${GHOST_ICON_BUTTON_CLS} bg-[var(--dashboard-warning-soft-bg)] text-[var(--dashboard-warning-soft-fg)] hover:brightness-95 tooltip`} title="Edit">
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => handleDeletePic(p.id, p.nama)} className={`${GHOST_ICON_BUTTON_CLS} bg-[var(--dashboard-danger-soft-bg)] text-[var(--dashboard-danger-soft-fg)] hover:brightness-95 tooltip`} title="Hapus">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                    </TabsContent>
                </Tabs>

                {/* Modals placed outside of regular layout */}
                <AnimatePresence>
                    {showPicModal && perusahaanId && (
                        <PicModal 
                            idPerusahaan={String(perusahaanId)} 
                            initialData={editingPic} 
                            onClose={() => { setShowPicModal(false); setEditingPic(undefined); }} 
                            onSave={handleSavePic} 
                            loading={createPicMutation.isPending || updatePicMutation.isPending} 
                        />
                    )}
                </AnimatePresence>
            </div>
    );
}
