import { create } from 'zustand';
import { surveyService } from '@/services/survey.service';
import type {
    SaveSurveyRiskStepPayload,
    SurveyProgress,
    SurveyRespondent,
    SurveyRiskResponse,
    UpsertSurveyRespondentPayload,
} from '@/types/survey.types';

interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    reason?: 'not_found' | 'error';
}

interface SurveyStoreState {
    respondents: SurveyRespondent[];
    currentRespondent: SurveyRespondent | null;
    progress: SurveyProgress | null;
    currentRisk: SurveyRiskResponse | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    fetchRespondents: () => Promise<void>;
    hydrateByUserId: (userId?: number | string | null) => Promise<ActionResult<SurveyRespondent>>;
    saveRespondent: (payload: UpsertSurveyRespondentPayload, existingId?: number | string | null) => Promise<ActionResult<SurveyRespondent>>;
    loadSurveyContext: (respondenId: number | string) => Promise<ActionResult<{ progress: SurveyProgress | null; currentRisk: SurveyRiskResponse | null }>>;
    saveRiskStep: (payload: SaveSurveyRiskStepPayload) => Promise<ActionResult<SurveyRiskResponse | SurveyProgress>>;
    navigateRisk: (payload: { respondenId: number | string; currentRisk: number; direction: string }) => Promise<ActionResult<SurveyRiskResponse>>;
    finishSurvey: (respondenId: number | string) => Promise<ActionResult<SurveyProgress>>;
    reset: () => void;
}

const initialState = {
    respondents: [] as SurveyRespondent[],
    currentRespondent: null as SurveyRespondent | null,
    progress: null as SurveyProgress | null,
    currentRisk: null as SurveyRiskResponse | null,
    loading: false,
    saving: false,
    error: null as string | null,
};

export const useSurveyStore = create<SurveyStoreState>()((set, get) => ({
    ...initialState,

    fetchRespondents: async () => {
        set({ loading: true, error: null });
        try {
            const respondents = await surveyService.getRespondents();
            set({ respondents, loading: false });
        } catch (error: unknown) {
            set({
                loading: false,
                error: error instanceof Error ? error.message : 'Gagal memuat data responden survei',
            });
        }
    },

    hydrateByUserId: async (userId) => {
        set({ loading: true, error: null });
        try {
            const respondent = await surveyService.getRespondentByIdOrNull(userId);
            if (!respondent) {
                set({ currentRespondent: null, progress: null, currentRisk: null, loading: false });
                return { success: false, error: 'Responden survei belum ditemukan', reason: 'not_found' };
            }

            const [progress, currentRisk] = await Promise.all([
                surveyService.getProgress(respondent.id),
                surveyService.getRiskByRespondent(respondent.id),
            ]);

            set({
                currentRespondent: respondent,
                progress,
                currentRisk,
                loading: false,
            });

            return { success: true, data: respondent };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal memuat konteks survei';
            set({ loading: false, error: message });
            return { success: false, error: message, reason: 'error' };
        }
    },

    saveRespondent: async (payload, existingId) => {
        set({ saving: true, error: null });
        try {
            const result = existingId
                ? await surveyService.updateRespondent(existingId, payload)
                : await surveyService.createRespondent(payload);

            set((state) => ({
                currentRespondent: result,
                respondents: existingId
                    ? state.respondents.map((item) => (item.id === result.id ? result : item))
                    : [result, ...state.respondents.filter((item) => item.id !== result.id)],
                saving: false,
            }));

            return { success: true, data: result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal menyimpan responden survei';
            set({ saving: false, error: message });
            return { success: false, error: message };
        }
    },

    loadSurveyContext: async (respondenId) => {
        set({ loading: true, error: null });
        try {
            const [progress, currentRisk] = await Promise.all([
                surveyService.getProgress(respondenId),
                surveyService.getRiskByRespondent(respondenId),
            ]);

            set({ progress, currentRisk, loading: false });

            return {
                success: true,
                data: { progress, currentRisk },
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal memuat progress survei';
            set({ loading: false, error: message });
            return { success: false, error: message };
        }
    },

    saveRiskStep: async (payload) => {
        set({ saving: true, error: null });
        try {
            const result = await surveyService.saveRiskStep(payload);
            const progress = await surveyService.getProgress(payload.responden_id);
            const currentRisk = await surveyService.getRiskByRespondent(payload.responden_id);

            set({
                progress,
                currentRisk,
                saving: false,
            });

            return { success: true, data: result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal menyimpan jawaban survei';
            set({ saving: false, error: message });
            return { success: false, error: message };
        }
    },

    navigateRisk: async ({ respondenId, currentRisk, direction }) => {
        set({ saving: true, error: null });
        try {
            const result = await surveyService.navigateRisk({
                responden_id: Number(respondenId),
                current_risk: currentRisk,
                direction,
            });
            const progress = await surveyService.getProgress(respondenId);
            const currentRiskData = await surveyService.getRiskByRespondent(respondenId);

            set({
                progress,
                currentRisk: currentRiskData ?? result,
                saving: false,
            });

            return { success: true, data: currentRiskData ?? result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal berpindah ke risiko berikutnya';
            set({ saving: false, error: message });
            return { success: false, error: message };
        }
    },

    finishSurvey: async (respondenId) => {
        set({ saving: true, error: null });
        try {
            const result = await surveyService.finishSurvey({ responden_id: Number(respondenId) });
            const progress = await surveyService.getProgress(respondenId);

            set({
                progress: progress ?? result,
                saving: false,
            });

            return { success: true, data: progress ?? result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Gagal menyelesaikan survei';
            set({ saving: false, error: message });
            return { success: false, error: message };
        }
    },

    reset: () => set(initialState),
}));
