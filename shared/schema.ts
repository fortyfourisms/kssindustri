import { z } from "zod";

// ─── Perusahaan Schemas ─────────────────────────────────────────────────────
export const PerusahaanSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nama perusahaan wajib diisi"),
    alamat: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    telepon: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    photo: z.string().optional().nullable(),
    id_sub_sektor: z.string().optional().nullable(),
});

export const UpdatePerusahaanSchema = z.object({
    nama_perusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
    alamat: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    telepon: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    photo: z.string().optional().nullable(),
    id_sub_sektor: z.string().optional().nullable(),
});

export type Perusahaan = z.infer<typeof PerusahaanSchema>;

// ─── User Schemas ─────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    perusahaanId: z.string().min(1, "Perusahaan wajib dipilih"),
});

export const LoginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
});

export const MfaVerifySchema = z.object({
    token: z.string().length(6, "Kode OTP harus 6 digit"),
});

export const UpdateProfileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").optional(),
    email: z.string().email("Email tidak valid").optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter").optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type MfaVerifyInput = z.infer<typeof MfaVerifySchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── User Type ────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    mfaSecret: string;
    mfaEnabled: boolean;
    perusahaanId: string;
    createdAt: string;
}

export interface SafeUser {
    id: string;
    name: string;
    email: string;
    mfaEnabled: boolean;
    perusahaanId: string;
    createdAt: string;
}

// ─── Module Schemas ───────────────────────────────────────────────────────────
export const IkasResponseSchema = z.object({
    responses: z.record(z.string(), z.string()),
});

export const KseDataSchema = z.object({
    systemName: z.string().min(1, "Nama sistem wajib diisi"),
    category: z.string().min(1, "Kategori wajib diisi"),
    description: z.string().optional(),
    riskLevel: z.enum(["rendah", "sedang", "tinggi"]),
    data: z.record(z.string(), z.any()).optional(),
});

export const CsirtSchema = z.object({
    id: z.string().optional(),
    teamName: z.string().min(1, "Nama tim wajib diisi"),
    contactEmail: z.string().email("Email tidak valid"),
    phone: z.string().optional(),
    scope: z.string().min(1, "Cakupan wajib diisi"),
    capabilities: z.array(z.string()).optional(),
    notes: z.string().optional(),
});

export const SurveiResponseSchema = z.object({
    answers: z.record(z.string(), z.number().min(1).max(5)),
});

export type IkasResponse = z.infer<typeof IkasResponseSchema>;
export type KseData = z.infer<typeof KseDataSchema>;
export type CsirtData = z.infer<typeof CsirtSchema>;
export type SurveiResponse = z.infer<typeof SurveiResponseSchema>;
