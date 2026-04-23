import { apiClient } from '@/services/apiClient';
import type {
    SaveSurveyRiskStepPayload,
    SurveyCustomRiskPayload,
    SurveyProgress,
    SurveyRespondent,
    SurveyRiskControlPayload,
    SurveyRiskEligibilityPayload,
    SurveyRiskFinishPayload,
    SurveyRiskImpactPayload,
    SurveyRiskNavigationPayload,
    SurveyRiskReasonPayload,
    SurveyRiskResponse,
    UpsertSurveyRespondentPayload,
} from '@/types/survey.types';

function normalizeList<T>(res: unknown): T[] {
    if (Array.isArray(res)) return res as T[];
    if (!res || typeof res !== 'object') return [];

    const record = res as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];

    const firstArray = Object.values(record).find((value) => Array.isArray(value));
    return Array.isArray(firstArray) ? (firstArray as T[]) : [];
}

function normalizeOne<T>(res: unknown): T {
    if (Array.isArray(res)) return (res[0] ?? {}) as T;
    if (res && typeof res === 'object' && 'data' in (res as Record<string, unknown>)) {
        const data = (res as Record<string, unknown>).data;
        if (Array.isArray(data)) return (data[0] ?? {}) as T;
        return (data ?? {}) as T;
    }
    return (res ?? {}) as T;
}

export const surveyService = {
    async getRespondents(): Promise<SurveyRespondent[]> {
        const res = await apiClient.get<unknown>('/api/survey/responden');
        return normalizeList<SurveyRespondent>(res);
    },

    async getRespondentById(id: number | string): Promise<SurveyRespondent> {
        const res = await apiClient.get<unknown>(`/api/survey/responden/${id}`);
        return normalizeOne<SurveyRespondent>(res);
    },

    async createRespondent(payload: UpsertSurveyRespondentPayload): Promise<SurveyRespondent> {
        return apiClient.post<SurveyRespondent>('/api/survey/responden', payload);
    },

    async updateRespondent(id: number | string, payload: UpsertSurveyRespondentPayload): Promise<SurveyRespondent> {
        return apiClient.put<SurveyRespondent>(`/api/survey/responden/${id}`, payload);
    },

    async deleteRespondent(id: number | string): Promise<void> {
        return apiClient.delete(`/api/survey/responden/${id}`);
    },

    async findRespondentByEmail(email?: string | null): Promise<SurveyRespondent | null> {
        if (!email?.trim()) return null;
        const respondents = await surveyService.getRespondents();
        return respondents.find((item) => item.email?.trim().toLowerCase() === email.trim().toLowerCase()) ?? null;
    },

    async getProgress(respondenId: number | string): Promise<SurveyProgress | null> {
        const res = await apiClient.get<unknown>(`/api/survey/progress/${respondenId}`);
        if (!res) return null;
        return normalizeOne<SurveyProgress>(res);
    },

    async getRiskByRespondent(respondenId: number | string): Promise<SurveyRiskResponse | null> {
        const res = await apiClient.get<unknown>(`/api/survey/risiko/${respondenId}`);
        if (!res) return null;
        return normalizeOne<SurveyRiskResponse>(res);
    },

    async createCustomRisk(payload: SurveyCustomRiskPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>('/api/survey/risiko/custom-risk', payload);
    },

    async saveEligibility(payload: SurveyRiskEligibilityPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>('/api/survey/risiko/eligibility', payload);
    },

    async saveReason(payload: SurveyRiskReasonPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>('/api/survey/risiko/reason', payload);
    },

    async saveImpact(payload: SurveyRiskImpactPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>('/api/survey/risiko/dampak', payload);
    },

    async saveControl(payload: SurveyRiskControlPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>('/api/survey/risiko/pengendalian', payload);
    },

    async navigateRisk(payload: SurveyRiskNavigationPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>('/api/survey/risiko/navigate', payload);
    },

    async saveProgress(payload: SurveyRiskNavigationPayload): Promise<SurveyProgress> {
        return apiClient.post<SurveyProgress>('/api/survey/risiko/save-progress', payload);
    },

    async finishSurvey(payload: SurveyRiskFinishPayload): Promise<SurveyProgress> {
        return apiClient.post<SurveyProgress>('/api/survey/risiko/finish', payload);
    },

    async saveRiskStep(payload: SaveSurveyRiskStepPayload): Promise<SurveyRiskResponse | SurveyProgress> {
        const identity = {
            responden_id: payload.responden_id,
            risiko_id: payload.risiko_id,
            custom_risiko_id: payload.custom_risiko_id,
        };

        await surveyService.saveEligibility({
            ...identity,
            pernah_terjadi: payload.pernah_terjadi,
        });

        if (!payload.pernah_terjadi) {
            await surveyService.saveReason({
                ...identity,
                alasan: payload.alasan?.trim() || '',
            });
        } else {
            await surveyService.saveImpact({
                ...identity,
                dampak_finansial: payload.dampak_finansial,
                dampak_hukum: payload.dampak_hukum,
                dampak_operasional: payload.dampak_operasional,
                dampak_reputasi: payload.dampak_reputasi,
                frekuensi: payload.frekuensi,
            });

            await surveyService.saveControl({
                ...identity,
                ada_pengendalian: payload.ada_pengendalian,
                deskripsi_pengendalian: payload.deskripsi_pengendalian?.trim() || '',
            });
        }

        await surveyService.saveProgress({
            responden_id: payload.responden_id,
            current_risk: payload.current_risk,
            direction: payload.direction ?? 'next',
        });

        if (payload.finish) {
            return surveyService.finishSurvey({ responden_id: payload.responden_id });
        }

        return surveyService.navigateRisk({
            responden_id: payload.responden_id,
            current_risk: payload.current_risk,
            direction: payload.direction ?? 'next',
        });
    },
};
