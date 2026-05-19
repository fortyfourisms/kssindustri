import { z } from "zod";

export const PHONE_NUMBER_MIN_LENGTH = 10;
export const PHONE_NUMBER_MAX_LENGTH = 15;

const PHONE_ALLOWED_CHARACTERS = /^[+\d\s().-]+$/;

export function normalizeWhitespace(value: string): string {
    return value.trim().replace(/\s+/g, " ");
}

export function normalizePhoneNumber(value: string): string {
    const trimmed = value.trim();
    const hasLeadingPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");

    return hasLeadingPlus ? `+${digits}` : digits;
}

export function getPhoneDigits(value: string): string {
    return value.replace(/\D/g, "");
}

export function isValidPhoneNumber(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed || !PHONE_ALLOWED_CHARACTERS.test(trimmed)) {
        return false;
    }

    const digits = getPhoneDigits(trimmed);
    return digits.length >= PHONE_NUMBER_MIN_LENGTH && digits.length <= PHONE_NUMBER_MAX_LENGTH;
}

export function isValidWebsite(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
        return false;
    }

    try {
        const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        const parsed = new URL(normalized);
        return Boolean(parsed.hostname) && parsed.hostname.includes(".");
    } catch {
        return false;
    }
}

const normalizedString = (requiredMessage: string, min: number, minMessage: string, max: number, maxMessage: string) =>
    z.string()
        .trim()
        .min(1, requiredMessage)
        .max(max, maxMessage)
        .transform(normalizeWhitespace)
        .refine((value) => value.length >= min, minMessage);

export const personNameSchema = normalizedString("Nama wajib diisi", 2, "Nama minimal 2 karakter", 100, "Nama maksimal 100 karakter");

export const companyNameSchema = normalizedString("Nama perusahaan wajib diisi", 2, "Nama perusahaan minimal 2 karakter", 120, "Nama perusahaan maksimal 120 karakter");

export const positionSchema = normalizedString("Jabatan wajib diisi", 2, "Jabatan minimal 2 karakter", 100, "Jabatan maksimal 100 karakter");

export const usernameSchema = z.string()
    .trim()
    .min(1, "Username wajib diisi")
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[A-Za-z0-9._-]+$/, "Username hanya boleh berisi huruf, angka, titik, strip, atau underscore");

export const emailSchema = z.string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Email tidak valid")
    .max(254, "Email terlalu panjang");

export const optionalEmailSchema = z.union([
    z.literal(""),
    emailSchema,
]);

export const phoneSchema = z.string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .refine(isValidPhoneNumber, `Nomor telepon harus 10-${PHONE_NUMBER_MAX_LENGTH} digit dan hanya boleh berisi angka atau simbol telepon umum`)
    .transform(normalizePhoneNumber);

export const optionalPhoneSchema = z.union([
    z.literal(""),
    z.string()
        .trim()
        .refine((value) => !value || isValidPhoneNumber(value), `Nomor telepon harus 10-${PHONE_NUMBER_MAX_LENGTH} digit dan hanya boleh berisi angka atau simbol telepon umum`)
        .transform((value) => (value ? normalizePhoneNumber(value) : "")),
]);

export const websiteSchema = z.string()
    .trim()
    .min(1, "Website wajib diisi")
    .max(255, "Website terlalu panjang")
    .refine(isValidWebsite, "Website tidak valid");

export const optionalWebsiteSchema = z.union([
    z.literal(""),
    z.string()
        .trim()
        .max(255, "Website terlalu panjang")
        .refine((value) => !value || isValidWebsite(value), "Website tidak valid"),
]);

export const eventRegistrationSchema = z.object({
    fullName: personNameSchema,
    email: emailSchema,
    company: companyNameSchema,
    position: positionSchema,
    phoneNumber: phoneSchema.transform((value) => value.replace(/^\+/, "")),
    industrySector: normalizedString("Sektor wajib dipilih", 1, "Sektor wajib dipilih", 100, "Sektor terlalu panjang"),
});

export const surveyRespondentSchema = z.object({
    responden_nama: personNameSchema,
    responden_jabatan: positionSchema,
    responden_perusahaan: companyNameSchema,
    responden_email: emailSchema,
    responden_telepon: phoneSchema,
    responden_sektor: normalizedString("Sektor wajib diisi", 1, "Sektor wajib diisi", 100, "Sektor terlalu panjang"),
    responden_sertifikat: z.string().trim().max(500, "Sertifikat/training maksimal 500 karakter").optional(),
});

export const picSchema = z.object({
    nama: personNameSchema,
    email: emailSchema,
    telepon: phoneSchema,
});

export const csirtProfileSchema = z.object({
    nama_csirt: normalizedString("Nama CSIRT wajib diisi", 2, "Nama CSIRT minimal 2 karakter", 120, "Nama CSIRT maksimal 120 karakter"),
    web_csirt: websiteSchema,
    telepon_csirt: phoneSchema,
    email_csirt: emailSchema,
});

export const csirtSdmSchema = z.object({
    nama_personel: personNameSchema,
    jabatan_csirt: positionSchema,
    jabatan_perusahaan: positionSchema,
    skill: normalizedString("Skill wajib diisi", 2, "Skill minimal 2 karakter", 120, "Skill maksimal 120 karakter"),
    sertifikasi: z.string().trim().max(500, "Daftar sertifikasi maksimal 500 karakter").optional(),
});
