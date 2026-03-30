import { useEffect, useRef } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { perusahaanService } from "@/services/perusahaan.service";
import { useUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, UserCircle, Lock, Mail, User, Building2, MapPin, Phone, Globe, Image as ImageIcon, MoreVertical, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearch } from "wouter";
import { getMediaUrl } from "@/lib/utils";

const ProfileSchema = z.object({
    username: z.string().min(2, "Username minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    jabatan: z.string().optional().nullable(),
});

const PasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Password lama wajib diisi"),
        newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
        confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        message: "Password baru tidak cocok",
        path: ["confirmPassword"],
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
type PasswordForm = z.infer<typeof PasswordSchema>;
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
    const search = useSearch();
    const initialTab = new URLSearchParams(search).get("tab") === "perusahaan" ? "perusahaan" : "pengguna";

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
    const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(PasswordSchema) });
    const perusahaanForm = useForm<PerusahaanForm>({ resolver: zodResolver(PerusahaanSchema) });

    useEffect(() => {
        if (user) {
            profileForm.reset({ 
                username: user.username, 
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
        mutationFn: (d: ProfileForm) => apiClient.put<any>("/api/profile", d),
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
            toast({ title: "Profil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const passwordMutation = useMutation({
        mutationFn: (d: PasswordForm) =>
            apiClient.put<any>("/api/profile", { currentPassword: d.currentPassword, newPassword: d.newPassword }),
        onSuccess: () => {
            passwordForm.reset();
            toast({ title: "Password diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const perusahaanMutation = useMutation({
        mutationFn: (d: PerusahaanForm) => {
            if (!perusahaanId) throw new Error("ID perusahaan tidak ditemukan");
            // Strip `photo` (handled separately via file upload) and convert empty id_sub_sektor to null
            const { photo: _photo, ...rest } = d;
            const payload = {
                ...rest,
                id_sub_sektor: rest.id_sub_sektor || null,
            };
            return perusahaanService.update(String(perusahaanId), payload as any);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["perusahaan", perusahaanId] });
            qc.invalidateQueries({ queryKey: ["me"] });
            toast({ title: "Profil perusahaan diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const uploadProfileImageMutation = useMutation({
        mutationFn: (formData: FormData) => apiClient.putForm<any>("/api/profile", formData),
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
            toast({ title: "Foto profil berhasil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal mengunggah foto", description: e.message, variant: "destructive" }),
    });

    const uploadPerusahaanImageMutation = useMutation({
        mutationFn: (formData: FormData) => {
            if (!perusahaanId) throw new Error("ID perusahaan tidak ditemukan");
            return perusahaanService.update(String(perusahaanId), formData);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["perusahaan", perusahaanId] });
            qc.invalidateQueries({ queryKey: ["me"] });
            toast({ title: "Foto perusahaan berhasil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal mengunggah foto", description: e.message, variant: "destructive" }),
    });

    const userPhotoInputRef = useRef<HTMLInputElement>(null);
    const userBannerInputRef = useRef<HTMLInputElement>(null);
    const perusahaanPhotoInputRef = useRef<HTMLInputElement>(null);
    const perusahaanBannerInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (type: 'user_photo' | 'user_banner' | 'perusahaan_photo' | 'perusahaan_banner', file: File) => {
        const formData = new FormData();
        if (type === 'user_photo') {
            formData.append("foto_profile", file); // Depending on your backend, using 'foto_profile' or 'photo'
            uploadProfileImageMutation.mutate(formData);
        } else if (type === 'user_banner') {
            formData.append("banner", file);
            uploadProfileImageMutation.mutate(formData);
        } else if (type === 'perusahaan_photo') {
            formData.append("photo", file); // According to PerusahaanSchema, the field is 'photo'
            uploadPerusahaanImageMutation.mutate(formData);
        } else if (type === 'perusahaan_banner') {
            formData.append("banner", file);
            uploadPerusahaanImageMutation.mutate(formData);
        }
    };

    if (isUserLoading) {
        return (
            <DashboardLayout title="Profil">
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Profil">
            <div className="max-w-2xl mx-auto space-y-6">
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
                                className={`h-32 w-full bg-cover bg-center ${!user?.banner ? 'bg-gradient-to-r from-orange-100 to-rose-100' : ''}`}
                                style={{ backgroundImage: user?.banner ? `url(${getMediaUrl(user.banner)})` : undefined }}
                            />

                            {/* 3 Dots Menu */}
                            <div className="absolute right-4 top-4 z-20">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2 text-slate-800 bg-white/50 backdrop-blur hover:bg-white rounded-full transition-colors shadow-sm">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="z-[100]">
                                        <DropdownMenuItem onClick={() => userPhotoInputRef.current?.click()}>
                                            Ganti Foto Profil
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => userBannerInputRef.current?.click()}>
                                            Ganti Banner
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

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
                                <div className="absolute -top-12 left-6">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden flex items-center justify-center shadow-sm">
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
                                    </div>
                                </div>
                                <div className="pt-14">
                                    <h2 className="font-bold text-slate-900 text-2xl">{user?.username || "Username"}</h2>
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

                        {/* Profile form */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <UserCircle className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-900">Informasi Akun</h3>
                            </div>
                            <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
                                <div>
                                    <label className={LABEL_CLS}>Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input {...profileForm.register("username")} className={`${INPUT_CLS} pl-10`} />
                                    </div>
                                    {profileForm.formState.errors.username && (
                                        <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.username.message}</p>
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

                        {/* Password form */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.16 }}
                            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <Lock className="w-5 h-5 text-slate-600" />
                                <h3 className="font-bold text-slate-900">Ganti Password</h3>
                            </div>
                            <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
                                <div>
                                    <label className={LABEL_CLS}>Password Lama</label>
                                    <input {...passwordForm.register("currentPassword")} type="password" placeholder="••••••••" className={INPUT_CLS} />
                                    {passwordForm.formState.errors.currentPassword && (
                                        <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Password Baru</label>
                                    <input {...passwordForm.register("newPassword")} type="password" placeholder="Minimal 8 karakter" className={INPUT_CLS} />
                                    {passwordForm.formState.errors.newPassword && (
                                        <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Konfirmasi Password Baru</label>
                                    <input {...passwordForm.register("confirmPassword")} type="password" placeholder="Ulangi password baru" className={INPUT_CLS} />
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={passwordMutation.isPending}
                                    className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Ganti Password
                                </button>
                            </form>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="perusahaan" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative mb-6"
                        >
                            {/* Banner / Foto Perusahaan */}
                            <div
                                className={`h-40 w-full bg-cover bg-center ${!perusahaan?.photo ? 'bg-gradient-to-r from-blue-100 to-indigo-100' : ''}`}
                                style={{ backgroundImage: perusahaan?.photo ? `url(${getMediaUrl(perusahaan.photo)})` : undefined }}
                            />

                            {/* 3 Dots Menu */}
                            <div className="absolute right-4 top-4 z-20">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2 text-slate-800 bg-white/50 backdrop-blur hover:bg-white rounded-full transition-colors shadow-sm">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="z-[100]">
                                        <DropdownMenuItem onClick={() => perusahaanPhotoInputRef.current?.click()}>
                                            Ganti Foto Perusahaan
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => perusahaanBannerInputRef.current?.click()}>
                                            Ganti Banner Perusahaan
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <input
                                    type="file"
                                    ref={perusahaanPhotoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleUpload('perusahaan_photo', e.target.files[0]);
                                    }}
                                />
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

                                    <div className="flex flex-col gap-1.5 mt-1.5">
                                        <div className="flex flex-wrap items-center gap-x-2 text-sm">
                                            {perusahaan?.email && (
                                                <span className="font-medium text-slate-600">{perusahaan.email}</span>
                                            )}

                                            {perusahaan?.telepon && (
                                                <>
                                                    {perusahaan?.email && <span className="text-slate-300">•</span>}
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="font-medium">{perusahaan.telepon}</span>
                                                    </div>
                                                </>
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

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6"
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
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
