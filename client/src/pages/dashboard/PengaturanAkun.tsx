import { useMutation } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { useUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, UserCircle, Mail, User, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { emailSchema, usernameSchema } from "@/lib/form-validation";
import { AppButton, AppInput, FormSection } from "@/ui";

const AkunSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
});
type AkunForm = z.infer<typeof AkunSchema>;

const PasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Password lama wajib diisi"),
        newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
        confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        message: "Password baru tidak cocok",
        path: ["confirmPassword"],
    });

type PasswordForm = z.infer<typeof PasswordSchema>;

const FIELD_ICON_CLS = "pointer-events-none absolute left-3.5 top-[46px] h-4 w-4 text-[var(--dashboard-text-muted)]";

export default function PengaturanAkun() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const syncCurrentUser = useAuthStore((state) => state.syncCurrentUser);
    const { data: user, isLoading: isUserLoading } = useUser();

    const akunForm = useForm<AkunForm>({
        resolver: zodResolver(AkunSchema),
        values: {
            username: user?.username || "",
            email: user?.email || "",
        }
    });

    const akunMutation = useMutation({
        mutationFn: (d: AkunForm) => {
            const currentJabatan = user?.jabatan_name || user?.id_jabatan || user?.jabatan || null;
            return usersService.updateCurrentUser({ ...d, jabatan: currentJabatan });
        },
        onSuccess: (updated) => {
            qc.setQueryData(["me"], updated);
            syncCurrentUser(updated);
            toast({ title: "Akun berhasil diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(PasswordSchema) });

    const passwordMutation = useMutation({
        mutationFn: (d: PasswordForm) =>
            usersService.updateCurrentUser({ currentPassword: d.currentPassword, newPassword: d.newPassword }),
        onSuccess: () => {
            passwordForm.reset();
            toast({ title: "Password diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    if (isUserLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-info-soft-fg)]" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <FormSection
                    title="Informasi Dasar"
                    icon={<UserCircle className="w-5 h-5 text-[var(--dashboard-info-soft-fg)]" />}
                >
                    <form onSubmit={akunForm.handleSubmit((d) => akunMutation.mutate(d))} className="space-y-5">
                        <div className="relative">
                            <User className={FIELD_ICON_CLS} />
                            <AppInput
                                label="Username"
                                error={akunForm.formState.errors.username?.message}
                                {...akunForm.register("username")}
                                className="pl-10"
                            />
                        </div>
                        <div className="relative">
                            <Mail className={FIELD_ICON_CLS} />
                            <AppInput
                                label="Email"
                                type="email"
                                error={akunForm.formState.errors.email?.message}
                                {...akunForm.register("email")}
                                className="pl-10"
                            />
                        </div>
                        <AppButton
                            type="submit"
                            fullWidth
                            loading={akunMutation.isPending}
                            leftIcon={!akunMutation.isPending ? <Save className="w-4 h-4" /> : undefined}
                        >
                            Simpan Perubahan
                        </AppButton>
                    </form>
                </FormSection>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <FormSection
                    title="Ganti Password"
                    icon={<Lock className="w-5 h-5 text-[var(--dashboard-warning-soft-fg)]" />}
                >
                    <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-5">
                        <AppInput
                            label="Password Lama"
                            type="password"
                            placeholder="••••••••"
                            error={passwordForm.formState.errors.currentPassword?.message}
                            {...passwordForm.register("currentPassword")}
                        />
                        <AppInput
                            label="Password Baru"
                            type="password"
                            placeholder="Minimal 8 karakter"
                            error={passwordForm.formState.errors.newPassword?.message}
                            {...passwordForm.register("newPassword")}
                        />
                        <AppInput
                            label="Konfirmasi Password Baru"
                            type="password"
                            placeholder="Ulangi password baru"
                            error={passwordForm.formState.errors.confirmPassword?.message}
                            {...passwordForm.register("confirmPassword")}
                        />
                        <AppButton
                            type="submit"
                            fullWidth
                            loading={passwordMutation.isPending}
                            leftIcon={!passwordMutation.isPending ? <Lock className="w-4 h-4" /> : undefined}
                        >
                            Simpan Password
                        </AppButton>
                    </form>
                </FormSection>
            </motion.div>
        </div>
    );
}
