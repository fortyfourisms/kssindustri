import type { Perusahaan } from "@/types/perusahaan.types";

export interface UserSessionPayload {
    id: string;
    username: string;
    email: string;
    name?: string;
    display_name?: string;
    role?: string;
    role_id?: string;
    role_name?: string;
    jabatan?: string;
    jabatan_name?: string;
    id_jabatan?: string;
    id_perusahaan?: string;
    perusahaan?: Perusahaan | null;
    foto_profile?: string;
    banner?: string;
    status?: string;
    mfa_enabled?: boolean;
    has_company?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CurrentUser extends UserSessionPayload {
    name: string;
    displayName: string;
    role: string;
    roleId: string;
    roleName: string;
    jabatan: string;
    companyId: string;
    fotoProfile: string;
    banner: string;
    status: string;
    mfaEnabled: boolean;
    hasCompany: boolean | null;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    name?: string;
    display_name?: string;
    jabatan?: string;
    jabatan_name?: string;
    role?: string;
    role_id?: string;
    role_name?: string;
    id_jabatan?: string;
    id_perusahaan?: string;
    perusahaan?: Perusahaan | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
    slug?: string;
    phone?: string;
    location?: string;
    joined?: string;
    photo?: string;
    foto_profile?: string;
    banner?: string;
}

export interface CreateUserPayload {
    username: string;
    password: string;
    name: string;
    email: string;
    jabatan: string;
    role: string;
    phone: string;
    location: string;
    photo?: string;
    banner?: string;
}

export interface UpdateUserPayload {
    username?: string;
    password?: string;
    display_name?: string;
    name?: string;
    email?: string;
    jabatan?: string | null;
    role?: string;
    phone?: string;
    location?: string;
    photo?: string;
    banner?: string;
    currentPassword?: string;
    newPassword?: string;
    foto_profile?: string;
}
