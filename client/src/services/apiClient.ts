// ─── Base fetch API client ─────────────────────────────────────────────────────
// Wraps native fetch with cookie-based auth (credentials: 'include').
// No external HTTP library — zero dependencies.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const isFormData = init.body instanceof FormData;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        credentials: 'include', // HTTP-only cookie auth
        headers: isFormData
            ? (init.headers ?? {}) // let browser set multipart boundary
            : { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
    }

    // Some DELETE/POST responses may be empty
    const text = await res.text();
    return (text ? JSON.parse(text) : {}) as T;
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
