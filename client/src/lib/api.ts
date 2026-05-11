// ─── Simplified API façade ────────────────────────────────────────────────────
// Re-exports service functions and fills gaps for domains that don't have
// their own service file yet.  All HTTP calls go through apiClient.
// ──────────────────────────────────────────────────────────────────────────────

import { apiClient } from "@/services/apiClient";
import { authService } from "@/services/auth.service";
import { csirtService } from "@/services/csirt.service";
import { perusahaanService } from "@/services/perusahaan.service";
import { ikasService } from "@/services/ikas.service";
import { surveyService } from "@/services/survey.service";

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
        authService.login({
            identifier: data.email,
            password: data.password,
        }),

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
    /** GET /api/maturity/ikas — scoped to the authenticated user */
    getMyIkas: (idPerusahaan?: string | number) => ikasService.getMyIkas(idPerusahaan),
    saveIkas: (id: string, responses: Record<string, string>) =>
        apiClient.post<any>(`/api/maturity/ikas/${id}`, { responses }),
    updateIkas: (id: string, payload: Record<string, any>) =>
        ikasService.update(id, payload),
    /** Upload Excel file to import IKAS data (multipart/form-data) */
    importIkasExcel: (file: File) => ikasService.importExcel(file),
    requestIkasEdit: (id: string | number, payload: { reason: string }) =>
        ikasService.requestEdit(id, payload),

    // ── KSE ──────────────────────────────────────────────────────────────────
    getKse: () => apiClient.get<any>("/api/se"),
    saveKse: (data: any) => apiClient.post<any>("/api/se", data),
    getKseEditRequests: () => apiClient.get<any>("/api/se/edit-requests"),
    requestKseEdit: (id: string | number, payload: { catatan_user: string; data_perubahan: Record<string, any> }) =>
        apiClient.post<any>(`/api/se/${id}/request-edit`, {
            catatan_user: payload.catatan_user,
            data_perubahan: payload.data_perubahan,
        }),

    // ── CSIRT (delegates to csirtService) ────────────────────────────────────
    getCsirt: () => csirtService.getMembers(),
    createCsirt: (data: any) => csirtService.create(data),
    updateCsirt: (id: string, data: any) => csirtService.update(id, data),
    deleteCsirt: (id: string) => csirtService.delete(id),

    // ── Survei ───────────────────────────────────────────────────────────────
    getSurvei: () => surveyService.getRespondents(),
    getSurveyRespondentMe: () => surveyService.getMyRespondentOrNull(),
    getSurveyRespondentById: (id: string | number) => surveyService.getRespondentById(id),
    saveSurveyRespondent: (payload: any) => surveyService.createRespondent(payload),
    saveSurveyRespondentMe: (payload: any) => surveyService.upsertMyRespondent(payload),
    updateSurveyRespondent: (id: string | number, payload: any) => surveyService.updateRespondent(id, payload),
    deleteSurveyRespondent: (id: string | number) => surveyService.deleteRespondent(id),
    getSurveyProgress: (respondenId: string | number) => surveyService.getProgress(respondenId),
    getSurveyRisk: (respondenId: string | number) => surveyService.getRiskByRespondent(respondenId),
    saveSurveyRiskEligibility: (payload: any) => surveyService.saveEligibility(payload),
    saveSurveyRiskReason: (payload: any) => surveyService.saveReason(payload),
    saveSurveyRiskImpact: (payload: any) => surveyService.saveImpact(payload),
    saveSurveyRiskControl: (payload: any) => surveyService.saveControl(payload),
    saveSurveyRiskProgress: (payload: any) => surveyService.saveProgress(payload),
    navigateSurveyRisk: (payload: any) => surveyService.navigateRisk(payload),
    finishSurveyRisk: (payload: any) => surveyService.finishSurvey(payload),
    saveSurvei: (payload: any) => surveyService.saveRiskStep(payload),
};
