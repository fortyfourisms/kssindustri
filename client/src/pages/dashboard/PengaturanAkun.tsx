import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { useUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, UserCircle, Mail, User, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const AkunSchema = z.object({
    username: z.string().min(2, "Username minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
});
type AkunForm = z.infer<typeof AkunSchema>;

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

type PasswordForm = z.infer<typeof PasswordSchema>;

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function PengaturanAkun() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const { data: user, isLoading: isUserLoading } = useUser();

    // AKUN (Username & Email)
    const akunForm = useForm<AkunForm>({
        resolver: zodResolver(AkunSchema),
        values: {
            username: user?.username || "",
            email: user?.email || "",
        }
    });

    const akunMutation = useMutation({
        mutationFn: (d: AkunForm) => {
            const userId = user?.id || user?.id_user;
            if (!userId) throw new Error("ID user tidak ditemukan");
            
            // Sertakan jabatan yang sudah ada agar tidak di-null-kan oleh backend
            const currentJabatan = user?.jabatan_name || user?.id_jabatan || user?.jabatan || null;
            return apiClient.put<any>(`/api/users/${userId}`, { ...d, jabatan: currentJabatan });
        },
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
            toast({ title: "Akun berhasil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(PasswordSchema) });

    const passwordMutation = useMutation({
        mutationFn: (d: PasswordForm) => {
            const userId = user?.id || user?.id_user;
            if (!userId) throw new Error("ID user tidak ditemukan");
            return apiClient.put<any>(`/api/users/${userId}`, { currentPassword: d.currentPassword, newPassword: d.newPassword });
        },
        onSuccess: () => {
            passwordForm.reset();
            toast({ title: "Password diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    if (isUserLoading) {
        return (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <UserCircle className="w-5 h-5 text-slate-600" />
                    <h3 className="font-bold text-slate-900 text-lg">Informasi Dasar</h3>
                </div>
                <form onSubmit={akunForm.handleSubmit((d) => akunMutation.mutate(d))} className="space-y-5">
                    <div>
                        <label className={LABEL_CLS}>Username</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input {...akunForm.register("username")} className={`${INPUT_CLS} pl-10`} />
                        </div>
                        {akunForm.formState.errors.username && (
                            <p className="text-red-500 text-xs mt-1.5">{akunForm.formState.errors.username.message}</p>
                        )}
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input {...akunForm.register("email")} type="email" className={`${INPUT_CLS} pl-10`} />
                        </div>
                        {akunForm.formState.errors.email && (
                            <p className="text-red-500 text-xs mt-1.5">{akunForm.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={akunMutation.isPending}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {akunMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <Lock className="w-5 h-5 text-slate-600" />
                    <h3 className="font-bold text-slate-900 text-lg">Ganti Password</h3>
                </div>
                <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-5">
                    <div>
                        <label className={LABEL_CLS}>Password Lama</label>
                        <input {...passwordForm.register("currentPassword")} type="password" placeholder="••••••••" className={INPUT_CLS} />
                        {passwordForm.formState.errors.currentPassword && (
                            <p className="text-red-500 text-xs mt-1.5">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Password Baru</label>
                        <input {...passwordForm.register("newPassword")} type="password" placeholder="Minimal 8 karakter" className={INPUT_CLS} />
                        {passwordForm.formState.errors.newPassword && (
                            <p className="text-red-500 text-xs mt-1.5">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Konfirmasi Password Baru</label>
                        <input {...passwordForm.register("confirmPassword")} type="password" placeholder="Ulangi password baru" className={INPUT_CLS} />
                        {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1.5">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={passwordMutation.isPending}
                            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Simpan Password
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
