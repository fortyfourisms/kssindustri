import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { perusahaanService } from "@/services/perusahaan.service";
import { useUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, UserCircle, Lock, Mail, User, Building2, MapPin, Phone, Globe, Image as ImageIcon, MoreVertical, Briefcase, Edit2, X, Camera } from "lucide-react";
import { motion } from "framer-motion";
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

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

function getInitials(name: string) {
    if (!name) return "";
    return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function EditProfil() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const [searchParams] = useSearchParams();
    const [isEditingPengguna, setIsEditingPengguna] = useState(false);
    const [isEditingPerusahaan, setIsEditingPerusahaan] = useState(false);
    const initialTab = searchParams.get("tab") === "perusahaan" ? "perusahaan" : "pengguna";

    const { data: user, isLoading: isUserLoading } = useUser();

    // Fetch perusahaan langsung dari GET /api/perusahaan/{id}
    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { data: perusahaan } = useQuery({
        queryKey: ["perusahaan", perusahaanId],
        queryFn: () => perusahaanService.getById(String(perusahaanId)),
        enabled: !!perusahaanId,
    });

    const { data: subSektors } = useQuery({ queryKey: ["subSektor"], queryFn: () => apiClient.get<any[]>("/api/sub_sektor") });

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

    const profileMutation = useMutation({
        mutationFn: (d: ProfileForm) => {
            const userId = user?.id || user?.id_user;
            if (!userId) throw new Error("ID user tidak ditemukan");
            return apiClient.put<any>(`/api/users/${userId}`, d);
        },
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
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
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["perusahaan", perusahaanId] });
            qc.invalidateQueries({ queryKey: ["me"] });
            toast({ title: "Profil perusahaan diperbarui" });
            setIsEditingPerusahaan(false);
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const uploadProfileImageMutation = useMutation({
        mutationFn: (formData: FormData) => {
            const userId = user?.id || user?.id_user;
            if (!userId) throw new Error("ID user tidak ditemukan");
            return apiClient.putForm<any>(`/api/users/${userId}`, formData);
        },
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
            toast({ title: "Foto profil/banner berhasil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal mengunggah foto", description: e.message, variant: "destructive" }),
    });

    const uploadPerusahaanImageMutation = useMutation({
        mutationFn: (formData: FormData) => {
            if (!perusahaanId) throw new Error("ID perusahaan tidak ditemukan");
            return apiClient.putForm<any>(`/api/perusahaan/${perusahaanId}`, formData);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["perusahaan", perusahaanId] });
            qc.invalidateQueries({ queryKey: ["me"] });
            toast({ title: "Foto/banner perusahaan berhasil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal mengunggah foto", description: e.message, variant: "destructive" }),
    });

    const userPhotoInputRef = useRef<HTMLInputElement>(null);
    const userBannerInputRef = useRef<HTMLInputElement>(null);
    const perusahaanBannerInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (type: 'user_photo' | 'user_banner' | 'perusahaan_banner', file: File) => {
        const formData = new FormData();
        if (type === 'user_photo') {
            formData.append("foto_profile", file); // Depending on your backend, using 'foto_profile' or 'photo'
            uploadProfileImageMutation.mutate(formData);
        } else if (type === 'user_banner') {
            formData.append("banner", file);
            uploadProfileImageMutation.mutate(formData);
        } else if (type === 'perusahaan_banner') {
            formData.append("photo", file);
            uploadPerusahaanImageMutation.mutate(formData);
        }
    };

    if (isUserLoading) {
        return (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        );
    }

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
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative"
                        >
                            {/* Banner */}
                            <div
                                className={`h-32 w-full bg-cover bg-center relative group overflow-hidden ${!user?.banner ? 'bg-gradient-to-r from-orange-100 to-rose-100' : ''}`}
                                style={{ backgroundImage: user?.banner ? `url(${getMediaUrl(user.banner)})` : undefined }}
                            >
                                {isEditingPengguna && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => userBannerInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-medium rounded-lg transition-all">
                                            <ImageIcon className="w-4 h-4" /> Ganti Banner
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="absolute right-4 top-4 z-20">
                                {!isEditingPengguna ? (
                                    <button 
                                        onClick={() => setIsEditingPengguna(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur hover:bg-white text-slate-700 text-sm font-semibold rounded-full shadow-sm transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Data
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditingPengguna(false)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-full shadow-sm transition-all"
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
                                    }}
                                />
                                <input
                                    type="file"
                                    ref={userBannerInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleUpload('user_banner', e.target.files[0]);
                                    }}
                                />
                            </div>

                            {/* Info Area */}
                            <div className="px-6 pb-6 relative">
                                {/* Profile Picture */}
                                <div className="absolute -top-12 left-6 group">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden flex items-center justify-center shadow-sm relative">
                                        {user?.foto_profile ? (
                                            <img
                                                src={getMediaUrl(user.foto_profile)}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                                                {user?.username ? getInitials(user.username) : <User className="w-10 h-10" />}
                                            </div>
                                        )}
                                        {isEditingPengguna && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => userPhotoInputRef.current?.click()} className="p-2 text-white hover:scale-110 transition-transform">
                                                    <Camera className="w-6 h-6" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-14">
                                    <h2 className="font-bold text-slate-900 text-2xl">{user?.display_name || user?.username || "Nama Pengguna"}</h2>
                                    <div className="flex flex-col gap-1.5 mt-1.5">
                                        <div className="flex flex-wrap items-center gap-x-2 text-sm">
                                            <span className="font-medium text-slate-600">{user?.email}</span>
                                            {user?.jabatan_name && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                                            <Briefcase className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                        <span className="font-medium">{user.jabatan_name}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-4">
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
                                className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-900 text-lg">Informasi Akun</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Nama Pengguna</p>
                                            <p className="font-medium text-slate-900 truncate">{user?.display_name || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Email</p>
                                            <p className="font-medium text-slate-900 truncate">{user?.email || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Jabatan</p>
                                            <p className="font-medium text-slate-900 truncate">{user?.jabatan_name || user?.jabatan || "-"}</p>
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
                                    className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm"
                                >
                            <div className="flex items-center gap-2 mb-5">
                                <UserCircle className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-900">Informasi Akun</h3>
                            </div>
                            <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
                                <div>
                                    <label className={LABEL_CLS}>Nama Pengguna</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input {...profileForm.register("display_name")} className={`${INPUT_CLS} pl-10`} />
                                    </div>
                                    {profileForm.formState.errors.display_name && (
                                        <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.display_name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input {...profileForm.register("email")} type="email" className={`${INPUT_CLS} pl-10`} />
                                    </div>
                                    {profileForm.formState.errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.email.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Jabatan</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input {...profileForm.register("jabatan")} className={`${INPUT_CLS} pl-10`} placeholder="Jabatan atau peranan" />
                                    </div>
                                    {profileForm.formState.errors.jabatan && (
                                        <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.jabatan.message}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={profileMutation.isPending}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative mb-6"
                        >
                            {/* Banner / Foto Perusahaan */}
                            <div
                                className={`h-40 w-full bg-cover bg-center relative group overflow-hidden ${!perusahaan?.photo ? 'bg-gradient-to-r from-blue-100 to-indigo-100' : ''}`}
                                style={{ backgroundImage: perusahaan?.photo ? `url(${getMediaUrl(perusahaan.photo)})` : undefined }}
                            >
                                {isEditingPerusahaan && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => perusahaanBannerInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-medium rounded-lg transition-all">
                                            <ImageIcon className="w-4 h-4" /> Ganti Foto/Banner Perusahaan
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="absolute right-4 top-4 z-20">
                                {!isEditingPerusahaan ? (
                                    <button 
                                        onClick={() => setIsEditingPerusahaan(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur hover:bg-white text-slate-700 text-sm font-semibold rounded-full shadow-sm transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Data
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditingPerusahaan(false)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-full shadow-sm transition-all"
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
                                    <h2 className="font-bold text-slate-900 text-2xl">{perusahaan?.nama_perusahaan || "Nama Perusahaan"}</h2>

                                    <div className="flex flex-col gap-2 mt-3">
                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                            {perusahaan?.email && (
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{perusahaan.email}</span>
                                                </div>
                                            )}

                                            {perusahaan?.telepon && (
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{perusahaan.telepon}</span>
                                                </div>
                                            )}
                                            
                                            {perusahaan?.website && (
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Globe className="w-4 h-4 text-slate-400" />
                                                    <a href={perusahaan.website.startsWith('http') ? perusahaan.website : `https://${perusahaan.website}`} target="_blank" rel="noreferrer" className="font-medium hover:text-blue-600 hover:underline">{perusahaan.website}</a>
                                                </div>
                                            )}
                                            
                                            {(perusahaan?.sub_sektor?.nama_sub_sektor || subSektors?.find((s:any) => s.id === perusahaan?.id_sub_sektor)?.nama_sub_sektor) && (
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-blue-600">{perusahaan?.sub_sektor?.nama_sub_sektor || subSektors?.find((s:any) => s.id === perusahaan?.id_sub_sektor)?.nama_sub_sektor}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {perusahaan?.alamat && (
                                        <p className="text-sm text-slate-500 mt-3 flex items-start gap-1.5">
                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
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
                                className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm"
                            >
                                <div className="mb-6 pb-4 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-900 text-lg">Informasi Perusahaan</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Nama Perusahaan</p>
                                            <p className="font-medium text-slate-900 truncate">{perusahaan?.nama_perusahaan || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Alamat</p>
                                            <p className="font-medium text-slate-900 truncate">{perusahaan?.alamat || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Email</p>
                                            <p className="font-medium text-slate-900 truncate">{perusahaan?.email || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Telepon</p>
                                            <p className="font-medium text-slate-900 truncate">{perusahaan?.telepon || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Website</p>
                                            <p className="font-medium text-slate-900 truncate">{perusahaan?.website || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-0.5">Sektor</p>
                                            <p className="font-medium text-slate-900 truncate">{perusahaan?.sub_sektor?.nama_sub_sektor || subSektors?.find((s:any) => s.id === perusahaan?.id_sub_sektor)?.nama_sub_sektor || "-"}</p>
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
                            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-900">Informasi Perusahaan</h3>
                            </div>
                            <form onSubmit={perusahaanForm.handleSubmit((d) => perusahaanMutation.mutate(d))} className="space-y-4">
                                <div>
                                    <label className={LABEL_CLS}>Nama Perusahaan</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input {...perusahaanForm.register("nama_perusahaan")} readOnly className={`${INPUT_CLS} pl-10 bg-slate-50 cursor-not-allowed text-slate-600`} placeholder="Nama Perusahaan" />
                                    </div>
                                    {perusahaanForm.formState.errors.nama_perusahaan && (
                                        <p className="text-red-500 text-xs mt-1">{perusahaanForm.formState.errors.nama_perusahaan.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Alamat</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input {...perusahaanForm.register("alamat")} className={`${INPUT_CLS} pl-10`} placeholder="Alamat Perusahaan" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL_CLS}>Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input {...perusahaanForm.register("email")} type="email" className={`${INPUT_CLS} pl-10`} placeholder="email@perusahaan.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={LABEL_CLS}>Telepon</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input {...perusahaanForm.register("telepon")} className={`${INPUT_CLS} pl-10`} placeholder="021-xxxxxxx" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL_CLS}>Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {perusahaanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan Perusahaan
                                </button>
                            </form>
                        </motion.div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
    );
}
