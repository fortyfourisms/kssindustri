// ─── Simplified API façade ────────────────────────────────────────────────────
// Re-exports service functions and fills gaps for domains that don't have
// their own service file yet.  All HTTP calls go through apiClient.
// ──────────────────────────────────────────────────────────────────────────────

import { apiClient } from "@/services/apiClient";
import { authService } from "@/services/auth.service";
import { csirtService } from "@/services/csirt.service";
import { perusahaanService } from "@/services/perusahaan.service";

export const api = {
    // ── Auth (delegates to authService) ──────────────────────────────────────
    register: (data: { name: string; email: string; password: string; perusahaanId: string }) =>
        authService.register({
            username: data.name,
            email: data.email,
            password: data.password,
            id_perusahaan: data.perusahaanId,
        }),

    login: (data: { email: string; password: string }) =>
        authService.login(data),

    logout: () => authService.logout(),

    getMe: () => authService.verifySession(),

    // ── MFA (delegates to authService) ───────────────────────────────────────
    getMfaSetup: () =>
        apiClient.get<{ qrCode: string; secret: string; mfaEnabled: boolean }>("/api/mfa/setup"),

    verifyMfa: (token: string) =>
        apiClient.post<{ message: string; user: any }>("/api/mfa/verify", { token }),

    // ── Profile ──────────────────────────────────────────────────────────────
    updateProfile: (data: any) => apiClient.put<any>("/api/profile", data),

    // ── Perusahaan (delegates to perusahaanService) ─────────────────────────
    getPerusahaan: () => perusahaanService.getAll(),
    getPerusahaanDropdown: () => perusahaanService.getDropdown(),
    createPerusahaan: (data: any) => perusahaanService.create(data),
    getPerusahaanById: (id: string) => perusahaanService.getById(id),
    updatePerusahaan: (id: string, data: any) => perusahaanService.update(id, data),
    deletePerusahaan: (id: string) => perusahaanService.delete(id),

    // ── Sub Sektor ───────────────────────────────────────────────────────────
    getSubSektor: () => apiClient.get<any[]>("/api/sub_sektor"),

    // ── IKAS ─────────────────────────────────────────────────────────────────
    getIkas: () => apiClient.get<any>("/api/ikas"),
    getIkasById: (id: string) => apiClient.get<any>(`/api/maturity/ikas/${id}`),
    saveIkas: (responses: Record<string, string>) =>
        apiClient.post<any>("/api/ikas", { responses }),

    // ── KSE ──────────────────────────────────────────────────────────────────
    getKse: () => apiClient.get<any>("/api/se"),
    saveKse: (data: any) => apiClient.post<any>("/api/se", data),

    // ── CSIRT (delegates to csirtService) ────────────────────────────────────
    getCsirt: () => csirtService.getMembers(),
    createCsirt: (data: any) => csirtService.create(data),
    updateCsirt: (id: string, data: any) => csirtService.update(Number(id), data),
    deleteCsirt: (id: string) => csirtService.delete(Number(id)),

    // ── Survei ───────────────────────────────────────────────────────────────
    getSurvei: () => apiClient.get<any>("/api/survei"),
    saveSurvei: (answers: Record<string, number>) =>
        apiClient.post<any>("/api/survei", { answers }),
};