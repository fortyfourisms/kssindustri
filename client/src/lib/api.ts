// Centralized API client — all requests include credentials (HttpOnly cookie)

// Vite expose VITE_ prefix vars ke client, non-VITE_ vars hanya untuk server
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(
    method: string,
    path: string,
    body?: unknown
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: "include",         // ✅ kirim httpOnly cookie otomatis
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? "Terjadi kesalahan");
    }

    // Some DELETE responses may be empty
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
}

export const api = {
    // ── Auth ──────────────────────────────────────────────────────────────────
    register: (data: { name: string; email: string; password: string; perusahaanId: string }) =>
        request<{ message: string }>("POST", "/api/register", data),

    login: (data: { email: string; password: string }) =>
        request<{ message: string; requireMfa: boolean }>("POST", "/api/login", data),

    logout: () => request<{ message: string }>("POST", "/api/logout"),

    getMe: () => request<any>("GET", `/api/me`),

    updateProfile: (data: any) => request<any>("PUT", "/api/profile", data),

    // ── MFA ───────────────────────────────────────────────────────────────────
    getMfaSetup: () =>
        request<{ qrCode: string; secret: string; mfaEnabled: boolean }>("GET", "/api/mfa/setup"),

    verifyMfa: (token: string) =>
        request<{ message: string; user: any }>("POST", "/api/mfa/verify", { token }),

    // ── Perusahaan ────────────────────────────────────────────────────────────
    // Note: company data for the logged-in user is included in GET /api/me
    // as a nested `perusahaan` object — use getMe() for that.
    getPerusahaan: () => request<any[]>("GET", "/api/perusahaan"),
    getPerusahaanDropdown: () => request<any[]>("GET", "/api/perusahaan/dropdown"),
    createPerusahaan: (nama_perusahaan: string) => request<any>("POST", "/api/perusahaan", { nama_perusahaan }),
    updatePerusahaan: (id: string, data: any) => request<any>("PUT", `/api/perusahaan/${id}`, data),

    // ── Sub Sektor ────────────────────────────────────────────────────────────
    getSubSektor: () => request<any[]>("GET", "/api/sub_sektor"),

    // ── IKAS ──────────────────────────────────────────────────────────────────
    getIkas: () => request<any>("GET", "/api/ikas"),
    getIkasById: (id: string) => request<any>("GET", `/api/maturity/ikas/${id}`),
    saveIkas: (responses: Record<string, string>) =>
        request<any>("POST", "/api/ikas", { responses }),

    // ── KSE ───────────────────────────────────────────────────────────────────
    getKse: () => request<any>("GET", "/api/kse"),
    saveKse: (data: any) => request<any>("POST", "/api/kse", data),

    // ── CSIRT ─────────────────────────────────────────────────────────────────
    getCsirt: () => request<any[]>("GET", "/api/csirt"),
    createCsirt: (data: any) => request<any>("POST", "/api/csirt", data),
    updateCsirt: (id: string, data: any) => request<any>("PUT", `/api/csirt/${id}`, data),
    deleteCsirt: (id: string) => request<any>("DELETE", `/api/csirt/${id}`),

    // ── Survei ────────────────────────────────────────────────────────────────
    getSurvei: () => request<any>("GET", "/api/survei"),
    saveSurvei: (answers: Record<string, number>) =>
        request<any>("POST", "/api/survei", { answers }),
};