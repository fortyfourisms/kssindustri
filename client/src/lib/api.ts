// ─── Simplified API façade ────────────────────────────────────────────────────
// Re-exports service functions and fills gaps for domains that don't have
// their own service file yet.  All HTTP calls go through apiClient.
// ──────────────────────────────────────────────────────────────────────────────

import { apiClient } from "@/services/apiClient";
import { authService } from "@/services/auth.service";
import { csirtService } from "@/services/csirt.service";
import { perusahaanService } from "@/services/perusahaan.service";
import { ikasService } from "@/services/ikas.service";

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

    // ── IKAS (delegates to ikasService) ──────────────────────────────────────
    /** GET /api/maturity/ikas/{id} — for user-facing views (scoped to their own ID) */
    getIkasById: (id: string) => ikasService.getById(id),
    /** GET /api/maturity/ikas — full list for admin / year-over-year charts */
    getIkasList: () => ikasService.getAll(),
    saveIkas: (id: string, responses: Record<string, string>) =>
        apiClient.post<any>(`/api/maturity/ikas/${id}`, { responses }),
    updateIkas: (id: string, payload: Record<string, any>) =>
        ikasService.update(id, payload),
    /** Upload Excel file to import IKAS data (multipart/form-data) */
    importIkasExcel: (file: File) => ikasService.importExcel(file),

    // ── KSE ──────────────────────────────────────────────────────────────────
    getKse: () => apiClient.get<any>("/api/se"),
    saveKse: (data: any) => apiClient.post<any>("/api/se", data),

    // ── CSIRT (delegates to csirtService) ────────────────────────────────────
    getCsirt: () => csirtService.getMembers(),
    createCsirt: (data: any) => csirtService.create(data),
    updateCsirt: (id: string, data: any) => csirtService.update(id, data),
    deleteCsirt: (id: string) => csirtService.delete(id),

    // ── Survei ───────────────────────────────────────────────────────────────
    getSurvei: () => apiClient.get<any>("/api/survei"),
    saveSurvei: (answers: Record<string, number>) =>
        apiClient.post<any>("/api/survei", { answers }),
};