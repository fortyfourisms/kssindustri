import { z } from "zod";

const PHONE_DIGIT_MIN = 10;
const PHONE_DIGIT_MAX = 15;

const trimmedRequiredString = (message: string) => z.string().trim().min(1, message);
const optionalTrimmedString = () => z.string().trim().optional().nullable();
const trimmedEmailString = () => z.string().trim().email("Email tidak valid");
const optionalEmailString = () => trimmedEmailString().optional().nullable();

const isValidOptionalPhone = (value: string) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, "");
    return digits.length >= PHONE_DIGIT_MIN && digits.length <= PHONE_DIGIT_MAX;
};

const isValidOptionalWebsite = (value: string) => {
    if (!value) return true;

    try {
        const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        const parsed = new URL(normalized);
        return Boolean(parsed.hostname) && parsed.hostname.includes(".");
    } catch {
        return false;
    }
};

const optionalPhoneString = () =>
    z.string()
        .trim()
        .refine(isValidOptionalPhone, `Nomor telepon harus ${PHONE_DIGIT_MIN}-${PHONE_DIGIT_MAX} digit`)
        .optional()
        .nullable();

const optionalWebsiteString = () =>
    z.string()
        .trim()
        .refine(isValidOptionalWebsite, "Website tidak valid")
        .optional()
        .nullable();

export const PerusahaanSchema = z.object({
    id: z.string().optional(),
    name: trimmedRequiredString("Nama perusahaan wajib diisi"),
    alamat: optionalTrimmedString(),
    email: optionalEmailString(),
    telepon: optionalPhoneString(),
    website: optionalWebsiteString(),
    photo: optionalTrimmedString(),
    id_sub_sektor: optionalTrimmedString(),
});

export const UpdatePerusahaanSchema = z.object({
    nama_perusahaan: trimmedRequiredString("Nama perusahaan wajib diisi"),
    alamat: optionalTrimmedString(),
    email: optionalEmailString(),
    telepon: optionalPhoneString(),
    website: optionalWebsiteString(),
    photo: optionalTrimmedString(),
    id_sub_sektor: optionalTrimmedString(),
});

export type Perusahaan = z.infer<typeof PerusahaanSchema>;

export const RegisterSchema = z.object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    email: trimmedEmailString(),
    password: z.string().min(8, "Password minimal 8 karakter"),
    perusahaanId: z.string().min(1, "Perusahaan wajib dipilih"),
});

export const LoginSchema = z.object({
    email: trimmedEmailString(),
    password: z.string().min(1, "Password wajib diisi"),
});

export const MfaVerifySchema = z.object({
    token: z.string().length(6, "Kode OTP harus 6 digit"),
});

export const UpdateProfileSchema = z.object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").optional(),
    email: trimmedEmailString().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter").optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type MfaVerifyInput = z.infer<typeof MfaVerifySchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

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

export const IkasResponseSchema = z.object({
    responses: z.record(z.string(), z.string()),
});

export const KseDataSchema = z.object({
    systemName: z.string().trim().min(1, "Nama sistem wajib diisi"),
    category: z.string().trim().min(1, "Kategori wajib diisi"),
    description: z.string().optional(),
    riskLevel: z.enum(["rendah", "sedang", "tinggi"]),
    data: z.record(z.string(), z.any()).optional(),
});

export const CsirtSchema = z.object({
    id: z.string().optional(),
    teamName: trimmedRequiredString("Nama tim wajib diisi"),
    contactEmail: trimmedEmailString(),
    phone: optionalPhoneString(),
    scope: trimmedRequiredString("Cakupan wajib diisi"),
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
