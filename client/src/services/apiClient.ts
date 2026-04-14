// ─── Base fetch API client ─────────────────────────────────────────────────────
// Wraps native fetch with cookie-based auth (credentials: 'include').
// Includes automatic token refresh interceptor via POST /api/refresh.
// No external HTTP library — zero dependencies.

const BASE_URL = (window as any)._env_?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '';

// ─── Refresh Token Interceptor State ──────────────────────────────────────────
// Mencegah race condition ketika banyak request gagal 401 secara bersamaan.
// Hanya satu refresh yang berjalan; sisanya antri dan di-replay setelah selesai.

let isRefreshing = false;
type QueueItem = { resolve: () => void; reject: (err: unknown) => void };
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown): void {
    failedQueue.forEach((item) => (error ? item.reject(error) : item.resolve()));
    failedQueue = [];
}

/**
 * Endpoint yang TIDAK boleh memicu refresh token untuk menghindari infinite loop.
 * - /api/login   : belum ada session
 * - /api/refresh : jika ini pun 401, artinya refresh token sudah expired
 * - /api/logout  : sedang keluar, tidak perlu retry
 */
const NO_REFRESH_PATHS = ['/api/login', '/api/refresh', '/api/logout', '/api/register'];

/**
 * Header internal yang ditambahkan ke request yang sudah diulang setelah refresh.
 * Jika request yang diulang MASIH mendapat 401, interceptor tidak akan mencoba
 * refresh lagi — langsung redirect ke /login.
 * Backend harus mengabaikan header ini (umumnya diabaikan otomatis).
 */
const NO_RETRY_HEADER = 'x-no-refresh-retry';

/** Normalisasi RequestInit.headers menjadi Record agar bisa di-spread + ditambahkan header. */
function mergeHeaders(base: RequestInit['headers'], extra: Record<string, string>): Record<string, string> {
    const h = new Headers(base as HeadersInit | undefined);
    const result: Record<string, string> = {};
    h.forEach((v, k) => { result[k] = v; });
    return { ...result, ...extra };
}

async function attemptRefresh(): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/refresh`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) {
        throw new Error(`Refresh failed: ${res.status}`);
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const isFormData = init.body instanceof FormData;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        credentials: 'include', // HTTP-only cookie auth
        headers: isFormData
            ? (init.headers ?? {}) // let browser set multipart boundary
            : { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });

    // ── 401 Interceptor ──────────────────────────────────────────────────────
    // Jika respons 401 dan bukan endpoint auth → coba refresh token dulu.
    if (res.status === 401 && !NO_REFRESH_PATHS.some((p) => path.startsWith(p))) {

        // ── Guard: retry hanya SEKALI ──────────────────────────────────────────
        // Jika request ini sudah diulang setelah refresh (ada NO_RETRY_HEADER),
        // berarti access token baru pun invalid → hentikan, redirect ke login.
        const existingHeaders = new Headers(init.headers as HeadersInit | undefined);
        if (existingHeaders.has(NO_RETRY_HEADER)) {
            window.location.href = '/login';
            const err = new Error('Session expired') as any;
            err.status = 401;
            throw err;
        }

        // Jika sedang ada proses refresh, antri request ini dan tunggu hasilnya
        if (isRefreshing) {
            await new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            });
            // Tandai agar request yang diulang dari antrian tidak retry lagi
            return request<T>(path, {
                ...init,
                headers: mergeHeaders(init.headers, { [NO_RETRY_HEADER]: '1' }),
            });
        }

        // Mulai proses refresh
        isRefreshing = true;
        try {
            await attemptRefresh();
            // Refresh berhasil — bebaskan semua request yang antri
            processQueue(null);
            // Coba ulang request asli dengan cookie baru + tandai sudah diulang
            return request<T>(path, {
                ...init,
                headers: mergeHeaders(init.headers, { [NO_RETRY_HEADER]: '1' }),
            });
        } catch (refreshError) {
            // Refresh gagal (refresh token sudah expired/tidak valid)
            processQueue(refreshError);
            // Paksa logout: redirect ke halaman login
            window.location.href = '/login';
            throw refreshError;
        } finally {
            isRefreshing = false;
        }
    }
    // ── End Interceptor ──────────────────────────────────────────────────────

    if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const message = errData?.message || errData?.error || res.statusText || `HTTP ${res.status}`;
        const error = new Error(message) as any;
        error.status = res.status;
        error.response = { status: res.status, data: errData };
        throw error;
    }

    // Some DELETE/POST responses may be empty
    const text = await res.text();
    try {
        return (text ? JSON.parse(text) : {}) as T;
    } catch (parseError) {
        const errMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        if (text.trim().startsWith('<')) {
            throw new Error(`Server returned HTML instead of JSON. Check your API URL or proxy configuration. (Status ${res.status})`);
        }
        throw new Error(`Failed to parse API response: ${errMessage}`);
    }
}

export const apiClient = {
    get: <T>(path: string) =>
        request<T>(path, { method: 'GET' }),

    post: <T>(path: string, body: unknown) => {
        const isForm = body instanceof FormData;
        return request<T>(path, { method: 'POST', body: isForm ? body : JSON.stringify(body) });
    },

    put: <T>(path: string, body: unknown) => {
        const isForm = body instanceof FormData;
        return request<T>(path, { method: 'PUT', body: isForm ? body : JSON.stringify(body) });
    },

    patch: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T = void>(path: string) =>
        request<T>(path, { method: 'DELETE' }),

    /** For FormData (file uploads) — browser sets Content-Type + boundary automatically */
    postForm: <T>(path: string, body: FormData) =>
        request<T>(path, { method: 'POST', body }),

    putForm: <T>(path: string, body: FormData) =>
        request<T>(path, { method: 'PUT', body }),
};
