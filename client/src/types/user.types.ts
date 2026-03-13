// ─── User Types ──────────────────────────────────────────────────────────────

export interface User {
    id: string;
    slug: string;
    username: string;
    name: string;
    email: string;
    jabatan: string;
    role: string;
    phone: string;
    location: string;
    joined: string;
    photo?: string;
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
    name?: string;
    email?: string;
    jabatan?: string;
    role?: string;
    phone?: string;
    location?: string;
    photo?: string;
    banner?: string;
}
