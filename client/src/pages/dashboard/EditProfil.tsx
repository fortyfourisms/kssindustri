import { useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, UserCircle, Lock, Mail, User, Building2, MapPin, Phone, Globe, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "wouter";

const ProfileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
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
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function EditProfil() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const search = useSearch();
    const initialTab = new URLSearchParams(search).get("tab") === "perusahaan" ? "perusahaan" : "pengguna";

    // Single query: useUser returns user array element + nested perusahaan (if backend adds it back for backward compatibility)
    const { data: user, isLoading: isUserLoading } = useUser();
    const perusahaan = user?.perusahaan;
    const { data: subSektors } = useQuery({ queryKey: ["subSektor"], queryFn: api.getSubSektor });

    const profileForm = useForm<ProfileForm>({ resolver: zodResolver(ProfileSchema) });
    const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(PasswordSchema) });
    const perusahaanForm = useForm<PerusahaanForm>({ resolver: zodResolver(PerusahaanSchema) });

    useEffect(() => {
        if (user) profileForm.reset({ name: user.username || user.name, email: user.email });
    }, [user, profileForm]);

    useEffect(() => {
        if (perusahaan) {
            perusahaanForm.reset({
                nama_perusahaan: perusahaan.nama_perusahaan || perusahaan.name || "",
                alamat: perusahaan.alamat || "",
                email: perusahaan.email || "",
                telepon: perusahaan.telepon || "",
                website: perusahaan.website || "",
                photo: perusahaan.photo || "",
                id_sub_sektor: perusahaan.sub_sektor?.id || perusahaan.id_sub_sektor || "",
            });
        }
    }, [perusahaan, perusahaanForm]);

    const profileMutation = useMutation({
        mutationFn: (d: ProfileForm) => api.updateProfile(d),
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
            toast({ title: "Profil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const passwordMutation = useMutation({
        mutationFn: (d: PasswordForm) =>
            api.updateProfile({ currentPassword: d.currentPassword, newPassword: d.newPassword }),
        onSuccess: () => {
            passwordForm.reset();
            toast({ title: "Password diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const perusahaanMutation = useMutation({
        // Update via PUT /api/perusahaan/:id — same as Vue stakeholders update
        mutationFn: (d: PerusahaanForm) => {
            const id = user?.id_perusahaan || perusahaan?.id;
            if (!id) throw new Error("ID perusahaan tidak ditemukan");
            return api.updatePerusahaan(String(id), d);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["me"] });
            toast({ title: "Profil perusahaan diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

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
                        {/* Avatar */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 flex items-center gap-5"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/25">
                                {(user?.username || user?.name) ? getInitials(user.username || user.name) : <User className="w-8 h-8" />}
                            </div>
                            <div>
                                <h2 className="font-black text-slate-900 font-display text-xl">{user?.username || user?.name}</h2>
                                <p className="text-slate-500 text-sm">{user?.email}</p>
                                <p className="text-xs text-slate-400 mt-1">Bergabung: {user?.created_at || user?.createdAt ? new Date(user.created_at || user.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : ""}</p>
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
                                    <label className={LABEL_CLS}>Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input {...profileForm.register("name")} className={`${INPUT_CLS} pl-10`} />
                                    </div>
                                    {profileForm.formState.errors.name && (
                                        <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.name.message}</p>
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
                                        <input {...perusahaanForm.register("nama_perusahaan")} className={`${INPUT_CLS} pl-10`} placeholder="Nama Perusahaan" />
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
                                        <label className={LABEL_CLS}>Photo URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input {...perusahaanForm.register("photo")} className={`${INPUT_CLS} pl-10`} placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Sub Sektor</label>
                                    <div className="relative">
                                        <select
                                            {...perusahaanForm.register("id_sub_sektor")}
                                            className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
                                        >
                                            <option value="">-- Pilih Sub Sektor --</option>
                                            {subSektors?.map((s: any) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nama_sektor} - {s.nama_sub_sektor}
                                                </option>
                                            ))}
                                        </select>
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
