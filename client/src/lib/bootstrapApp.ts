import { useAuthStore } from "@/stores/auth.store";

/**
 * Boots the app dengan silent session restore yang efisien.
 *
 * Urutan:
 *   1. POST /api/refresh \u2014 cek apakah refresh token cookie masih valid.
 *   2. Jika berhasil \u2192 GET /api/me \u2192 hydrate Zustand store.
 *   3. Jika gagal (guest / token expired) \u2192 set unauthenticated, lanjut (silent).
 *
 * Keuntungan vs pendekatan lama (langsung GET /api/me):
 *   - Guest tidak membuang round-trip ke /api/me yang pasti 401.
 *   - /api/me hanya dipanggil jika kita yakin ada session yang valid.
 *   - Landing page tetap bisa diakses tanpa login.
 */
export async function bootstrapApp(): Promise<void> {
    // Ambil store auth secara langsung \u2014 singleton, aman dipanggil di luar React cycle.
    const store = useAuthStore.getState();

    // bootstrapSession() tidak pernah throw \u2014 error ditangani secara internal.
    await store.bootstrapSession();
}

