import { useAuthStore } from "@/stores/auth.store";

/**
 * Boots the app by fetching user session silently.
 * Menggunakan "credentials: include" otomatis dari layanan rehydrateFromServer.
 * Jika koneksi fail (gagal), itu akan set authenticated menjadi false (silent handle).
 */
export async function bootstrapApp(): Promise<void> {
    try {
        // Ambil store auth secara langsung, ini adalah singleton pattern yang bisa
        // dijalankan di luar react cycle
        const currentStore = useAuthStore.getState();
        
        // rehydrateFromServer() sudah menghandle auth logic
        // dan silent intercept ke /api/auth/me
        await currentStore.rehydrateFromServer();

        // Bisa ditambah logic init lain dsini jika perlu (config, metrics, etc)
    } catch (e) {
        // Silent error, wajar kalau belum login (guest allowed)
        console.warn("[bootstrapApp] Session check fail or first visitor.");
    }
}
