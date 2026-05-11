import { create } from "zustand";
import { surveyService } from "@/services/survey.service";
import type {
    SaveSurveyRiskStepPayload,
    SurveyProgress,
    SurveyRespondent,
    SurveyRiskResponse,
    UpsertSurveyRespondentPayload,
} from "@/types/survey.types";

interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    reason?: "not_found" | "error";
}

interface SurveyStoreState {
    respondents: SurveyRespondent[];
    currentRespondent: SurveyRespondent | null;
    progress: SurveyProgress | null;
    currentRisk: SurveyRiskResponse | null;
    nextStep: string | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    fetchRespondents: () => Promise<void>;
    hydrateByUserId: (userId?: number | string | null) => Promise<ActionResult<SurveyRespondent>>;
    fetchCurrentRespondent: (userId?: number | string | null) => Promise<ActionResult<SurveyRespondent>>;
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
    nextStep: null as string | null,
    loading: false,
    saving: false,
    error: null as string | null,
};

function extractNextStep(result: unknown): string | null {
    if (!result || typeof result !== "object") return null;
    const step = (result as Record<string, unknown>).next_step;
    return typeof step === "string" && step.trim() ? step.trim() : null;
}

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
                error: error instanceof Error ? error.message : "Gagal memuat data responden survei",
            });
        }
    },

    fetchCurrentRespondent: async (userId) => {
        set({ loading: true, error: null });
        try {
            const respondent = await surveyService.getMyRespondentOrNull(userId);
            if (!respondent) {
                set({ currentRespondent: null, progress: null, currentRisk: null, nextStep: null, loading: false });
                return { success: false, error: "Responden survei belum ditemukan", reason: "not_found" };
            }

            set({
                currentRespondent: respondent,
                loading: true,
            });

            const [progress, currentRisk] = await Promise.all([
                surveyService.getProgressOrNull(respondent.id),
                surveyService.getRiskByRespondentOrNull(respondent.id),
            ]);

            set({
                currentRespondent: respondent,
                progress,
                currentRisk,
                nextStep: extractNextStep(currentRisk ?? progress) ?? get().nextStep,
                loading: false,
            });

            return { success: true, data: respondent };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal memuat konteks survei";
            set({ loading: false, error: message });
            return { success: false, error: message, reason: "error" };
        }
    },

    hydrateByUserId: async (userId) => {
        return get().fetchCurrentRespondent(userId);
    },

    saveRespondent: async (payload, existingId) => {
        set({ saving: true, error: null });
        try {
            const result = await surveyService.upsertMyRespondent(payload, existingId);

            set((state) => ({
                currentRespondent: result,
                respondents: state.respondents.some((item) => item.id === result.id)
                    ? state.respondents.map((item) => (item.id === result.id ? result : item))
                    : [result, ...state.respondents],
                saving: false,
            }));

            return { success: true, data: result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menyimpan responden survei";
            set({ saving: false, error: message });
            return { success: false, error: message };
        }
    },

    loadSurveyContext: async (respondenId) => {
        set({ loading: true, error: null });
        try {
            const [progress, currentRisk] = await Promise.all([
                surveyService.getProgressOrNull(respondenId),
                surveyService.getRiskByRespondentOrNull(respondenId),
            ]);

            set({
                progress,
                currentRisk,
                nextStep: extractNextStep(currentRisk ?? progress) ?? get().nextStep,
                loading: false,
            });

            return {
                success: true,
                data: { progress, currentRisk },
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal memuat progress survei";
            set({ loading: false, error: message });
            return { success: false, error: message };
        }
    },

    saveRiskStep: async (payload) => {
        set({ saving: true, error: null });
        try {
            const result = await surveyService.saveRiskStep(payload);
            const progress = await surveyService.getProgress(payload.responden_id);
            const currentRisk = await surveyService.getRiskByRespondentOrNull(payload.responden_id);

            set({
                progress,
                currentRisk,
                nextStep: extractNextStep(result ?? currentRisk ?? progress) ?? get().nextStep,
                saving: false,
            });

            return { success: true, data: result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menyimpan jawaban survei";
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
            const currentRiskData = await surveyService.getRiskByRespondentOrNull(respondenId);

            set({
                progress,
                currentRisk: currentRiskData ?? result,
                nextStep: extractNextStep(currentRiskData ?? result ?? progress) ?? get().nextStep,
                saving: false,
            });

            return { success: true, data: currentRiskData ?? result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal berpindah ke risiko berikutnya";
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
                nextStep: extractNextStep(progress ?? result) ?? get().nextStep,
                saving: false,
            });

            return { success: true, data: progress ?? result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menyelesaikan survei";
            set({ saving: false, error: message });
            return { success: false, error: message };
        }
    },

    reset: () => set(initialState),
}));
