import { create } from "zustand";
import { surveyService } from "@/services/survey.service";
import { STATIC_SURVEY_RISKS } from "@/data/survey-static";
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

function extractRiskIndex(risk: SurveyRiskResponse | null | undefined): number | null {
    return typeof risk?.current_risk === "number" ? risk.current_risk : null;
}

function extractRiskId(risk: SurveyRiskResponse | null | undefined): number | null {
    if (typeof risk?.risiko_id === "number") return risk.risiko_id;
    if (typeof risk?.id === "number") return risk.id;
    return null;
}

function getStaticRiskIdAtIndex(index: number | null | undefined): number | null {
    if (typeof index !== "number" || !Number.isFinite(index) || index < 0) return null;
    return STATIC_SURVEY_RISKS[index]?.id ?? null;
}

function matchesTargetRisk(risk: SurveyRiskResponse | null | undefined, targetIndex: number | null | undefined): boolean {
    if (!risk || typeof targetIndex !== "number" || !Number.isFinite(targetIndex) || targetIndex < 0) return false;

    const riskIndex = extractRiskIndex(risk);
    if (riskIndex === targetIndex) return true;

    const targetRiskId = getStaticRiskIdAtIndex(targetIndex);
    const riskId = extractRiskId(risk);
    return targetRiskId !== null && riskId === targetRiskId;
}

function resolvePreferredRisk(
    fetchedRisk: SurveyRiskResponse | null,
    fallbackRisk: SurveyRiskResponse | null,
    progress: SurveyProgress | null,
): SurveyRiskResponse | null {
    if (!fetchedRisk) return fallbackRisk;
    if (!fallbackRisk) return fetchedRisk;

    const progressIndex = typeof progress?.current_risk === "number" ? progress.current_risk : null;
    const fetchedIndex = extractRiskIndex(fetchedRisk);
    const fallbackIndex = extractRiskIndex(fallbackRisk);

    if (progressIndex !== null) {
        if (fallbackIndex === progressIndex && fetchedIndex !== progressIndex) return fallbackRisk;
        if (fetchedIndex === progressIndex && fallbackIndex !== progressIndex) return fetchedRisk;
    }

    return fetchedRisk.updated_at ? fetchedRisk : fallbackRisk;
}

function buildRiskAtIndex(index: number, seedRisk: SurveyRiskResponse | null): SurveyRiskResponse | null {
    if (!Number.isFinite(index) || index < 0) return seedRisk;

    const staticRisk = STATIC_SURVEY_RISKS[index];
    const shouldPreserveAnswers = matchesTargetRisk(seedRisk, index);
    return {
        ...(seedRisk ?? {}),
        current_risk: index,
        risiko_id: staticRisk?.id ?? seedRisk?.risiko_id,
        nama_risiko: staticRisk?.nama_risiko ?? seedRisk?.nama_risiko,
        deskripsi: staticRisk?.deskripsi ?? seedRisk?.deskripsi,
        pernah_terjadi: shouldPreserveAnswers ? seedRisk?.pernah_terjadi : undefined,
        alasan: shouldPreserveAnswers ? seedRisk?.alasan : undefined,
        dampak_reputasi: shouldPreserveAnswers ? seedRisk?.dampak_reputasi : undefined,
        dampak_operasional: shouldPreserveAnswers ? seedRisk?.dampak_operasional : undefined,
        dampak_finansial: shouldPreserveAnswers ? seedRisk?.dampak_finansial : undefined,
        dampak_hukum: shouldPreserveAnswers ? seedRisk?.dampak_hukum : undefined,
        frekuensi: shouldPreserveAnswers ? seedRisk?.frekuensi : undefined,
        ada_pengendalian: shouldPreserveAnswers ? seedRisk?.ada_pengendalian : undefined,
        deskripsi_pengendalian: shouldPreserveAnswers ? seedRisk?.deskripsi_pengendalian : undefined,
    };
}

function resolveRiskForIndex(
    fetchedRisk: SurveyRiskResponse | null,
    fallbackRisk: SurveyRiskResponse | null,
    progress: SurveyProgress | null,
    optimisticIndex?: number | null,
): SurveyRiskResponse | null {
    const preferredRisk = resolvePreferredRisk(fetchedRisk, fallbackRisk, progress);
    const progressIndex = typeof progress?.current_risk === "number" ? progress.current_risk : null;
    const targetIndex = progressIndex ?? optimisticIndex ?? null;

    if (targetIndex === null) return preferredRisk;
    if (extractRiskIndex(preferredRisk) === targetIndex) return preferredRisk;
    if (matchesTargetRisk(fallbackRisk, targetIndex)) return buildRiskAtIndex(targetIndex, fallbackRisk);
    if (matchesTargetRisk(fetchedRisk, targetIndex)) return buildRiskAtIndex(targetIndex, fetchedRisk);

    return buildRiskAtIndex(targetIndex, preferredRisk ?? fallbackRisk);
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
                surveyService.getMyProgressOrNull(respondent.id),
                surveyService.getMyRiskOrNull(),
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
                surveyService.getMyProgressOrNull(respondenId),
                surveyService.getMyRiskOrNull(),
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
            const progress = await surveyService.getMyProgressOrNull(payload.responden_id);
            const fetchedRisk = await surveyService.getMyRiskOrNull();
            const resultRisk = "current_risk" in (result ?? {}) || "risiko_id" in (result ?? {})
                ? result as SurveyRiskResponse
                : null;
            const optimisticIndex = payload.finish
                ? payload.current_risk
                : payload.direction === "prev" || payload.direction === "previous"
                    ? Math.max(payload.current_risk - 1, 0)
                    : payload.current_risk + 1;
            const currentRisk = resolveRiskForIndex(fetchedRisk, resultRisk, progress, optimisticIndex);

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
            const progress = await surveyService.getMyProgressOrNull(respondenId);
            const fetchedRisk = await surveyService.getMyRiskOrNull();
            const optimisticIndex = direction === "prev" || direction === "previous"
                ? Math.max(currentRisk - 1, 0)
                : currentRisk + 1;
            const currentRiskData = resolveRiskForIndex(fetchedRisk, result, progress, optimisticIndex);

            set({
                progress,
                currentRisk: currentRiskData,
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
            const progress = await surveyService.getMyProgressOrNull(respondenId);

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
