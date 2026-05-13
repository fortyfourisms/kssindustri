import { create } from "zustand";
import { surveyService } from "@/services/survey.service";
import { STATIC_SURVEY_RISKS } from "@/data/survey-static";
import type {
    SaveSurveyRiskDraftPayload,
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
    saveRiskDraft: (payload: SaveSurveyRiskDraftPayload) => Promise<ActionResult<SurveyRiskResponse | SurveyProgress>>;
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

function getRiskItems(risk: SurveyRiskResponse | null | undefined): SurveyRiskResponse[] {
    return Array.isArray(risk?.items) ? risk.items : [];
}

function hasPersistedRiskAnswer(risk: SurveyRiskResponse | null | undefined): boolean {
    if (!risk) return false;
    if (risk.pernah_terjadi === true) return true;
    if (risk.pernah_terjadi === false && typeof risk.alasan === "string" && risk.alasan.trim()) return true;

    return Boolean(
        typeof risk.dampak_reputasi === "number" ||
        typeof risk.dampak_operasional === "number" ||
        typeof risk.dampak_finansial === "number" ||
        typeof risk.dampak_hukum === "number" ||
        typeof risk.frekuensi === "number" ||
        typeof risk.ada_pengendalian === "boolean" ||
        (typeof risk.deskripsi_pengendalian === "string" && risk.deskripsi_pengendalian.trim())
    );
}

function getResumeRiskIndex(risk: SurveyRiskResponse | null | undefined, progress: SurveyProgress | null | undefined): number | null {
    const items = getRiskItems(risk);
    if (items.length === 0) return typeof progress?.current_risk === "number" ? Math.max(progress.current_risk - 1, 0) : null;

    for (let index = STATIC_SURVEY_RISKS.length - 1; index >= 0; index -= 1) {
        const targetRiskId = getStaticRiskIdAtIndex(index);
        const matchedItem = targetRiskId === null
            ? null
            : items.find((item) => extractRiskId(item) === targetRiskId) ?? null;

        if (hasPersistedRiskAnswer(matchedItem)) {
            return index;
        }
    }

    if (typeof progress?.current_risk === "number") {
        return Math.max(progress.current_risk - 1, 0);
    }

    return items.length > 0 ? 0 : null;
}

function findRiskItemForIndex(risk: SurveyRiskResponse | null | undefined, targetIndex: number | null | undefined): SurveyRiskResponse | null {
    if (!risk || typeof targetIndex !== "number" || !Number.isFinite(targetIndex) || targetIndex < 0) return null;

    const items = getRiskItems(risk);
    if (items.length === 0) return null;

    const targetRiskId = getStaticRiskIdAtIndex(targetIndex);
    const byRiskId = targetRiskId === null
        ? null
        : items.find((item) => extractRiskId(item) === targetRiskId) ?? null;

    if (byRiskId) {
        return {
            ...risk,
            ...byRiskId,
            current_risk: targetIndex,
        };
    }

    const byIndex = items[targetIndex] ?? null;
    return byIndex
        ? {
            ...risk,
            ...byIndex,
            current_risk: targetIndex,
        }
        : null;
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

    const fetchedItemsCount = getRiskItems(fetchedRisk).length;
    const fallbackItemsCount = getRiskItems(fallbackRisk).length;
    if (fetchedItemsCount > 0 && fallbackItemsCount === 0) return fetchedRisk;
    if (fallbackItemsCount > 0 && fetchedItemsCount === 0) return fallbackRisk;

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
    const matchedItem = findRiskItemForIndex(seedRisk, index);
    const sourceRisk = matchedItem ?? seedRisk;
    const shouldPreserveAnswers = matchesTargetRisk(sourceRisk, index);
    return {
        ...(sourceRisk ?? {}),
        current_risk: index,
        risiko_id: staticRisk?.id ?? sourceRisk?.risiko_id,
        nama_risiko: staticRisk?.nama_risiko ?? sourceRisk?.nama_risiko,
        deskripsi: staticRisk?.deskripsi ?? sourceRisk?.deskripsi,
        pernah_terjadi: shouldPreserveAnswers ? sourceRisk?.pernah_terjadi : undefined,
        alasan: shouldPreserveAnswers ? sourceRisk?.alasan : undefined,
        dampak_reputasi: shouldPreserveAnswers ? sourceRisk?.dampak_reputasi : undefined,
        dampak_operasional: shouldPreserveAnswers ? sourceRisk?.dampak_operasional : undefined,
        dampak_finansial: shouldPreserveAnswers ? sourceRisk?.dampak_finansial : undefined,
        dampak_hukum: shouldPreserveAnswers ? sourceRisk?.dampak_hukum : undefined,
        frekuensi: shouldPreserveAnswers ? sourceRisk?.frekuensi : undefined,
        ada_pengendalian: shouldPreserveAnswers ? sourceRisk?.ada_pengendalian : undefined,
        deskripsi_pengendalian: shouldPreserveAnswers ? sourceRisk?.deskripsi_pengendalian : undefined,
    };
}

function deriveProgressFromRisk(risk: SurveyRiskResponse | null): SurveyProgress | null {
    if (!risk) return null;

    const items = getRiskItems(risk);
    if (items.length === 0) return null;
    const totalRiskCount = Math.max(items.length, STATIC_SURVEY_RISKS.length);

    const currentRisk = typeof risk.current_risk === "number"
        ? risk.current_risk
        : items.filter((item) => {
            if (item.pernah_terjadi === true) return true;
            if (item.pernah_terjadi === false && typeof item.alasan === "string" && item.alasan.trim()) return true;

            return Boolean(
                typeof item.dampak_reputasi === "number" ||
                typeof item.dampak_operasional === "number" ||
                typeof item.dampak_finansial === "number" ||
                typeof item.dampak_hukum === "number" ||
                typeof item.frekuensi === "number" ||
                typeof item.ada_pengendalian === "boolean" ||
                (typeof item.deskripsi_pengendalian === "string" && item.deskripsi_pengendalian.trim())
            );
        }).length;
    return {
        responden_id: risk.responden_id,
        current_risk: currentRisk,
        total_risks: risk.total_risks ?? totalRiskCount,
        completed: Boolean(risk.completed ?? (typeof risk.total_risks === "number" ? currentRisk >= risk.total_risks : currentRisk >= totalRiskCount)),
        has_next: typeof risk.total_risks === "number" ? currentRisk < risk.total_risks : currentRisk < totalRiskCount,
        has_previous: currentRisk > 0,
        next_step: risk.next_step,
        items,
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
    const targetIndex = optimisticIndex ?? progressIndex ?? null;

    if (targetIndex === null) return preferredRisk;
    if (extractRiskIndex(preferredRisk) === targetIndex) {
        return buildRiskAtIndex(targetIndex, preferredRisk) ?? preferredRisk;
    }
    if (matchesTargetRisk(fallbackRisk, targetIndex)) return buildRiskAtIndex(targetIndex, fallbackRisk);
    if (matchesTargetRisk(fetchedRisk, targetIndex)) return buildRiskAtIndex(targetIndex, fetchedRisk);

    return buildRiskAtIndex(targetIndex, preferredRisk ?? fallbackRisk);
}

function resolveProgressState(
    fetched: SurveyProgress | null,
    fallback: SurveyProgress | null,
): SurveyProgress | null {
    if (fetched?.completed || fetched?.finished_at) return fetched;
    if (fallback?.completed || fallback?.finished_at) return fallback;
    return fetched ?? fallback;
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
            const existingProgress = get().progress;
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
            const resolvedProgress = resolveProgressState(progress ?? deriveProgressFromRisk(currentRisk), existingProgress);
            const progressWithItems = resolvedProgress?.items
                ? resolvedProgress
                : currentRisk?.items
                    ? ({ ...(resolvedProgress ?? {}), items: currentRisk.items } as SurveyProgress)
                    : resolvedProgress;
            const resumeRiskIndex = getResumeRiskIndex(currentRisk, progressWithItems);
            const baseCurrentRisk = resolveRiskForIndex(
                currentRisk,
                currentRisk,
                progressWithItems,
                typeof progressWithItems?.current_risk === "number" ? progressWithItems.current_risk : null,
            );
            const resolvedCurrentRisk = resumeRiskIndex === null
                ? baseCurrentRisk
                : buildRiskAtIndex(resumeRiskIndex, currentRisk ?? baseCurrentRisk) ?? baseCurrentRisk;

            set({
                currentRespondent: respondent,
                progress: progressWithItems,
                currentRisk: resolvedCurrentRisk,
                nextStep: extractNextStep(resolvedCurrentRisk ?? progressWithItems) ?? get().nextStep,
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
            const existingProgress = get().progress;
            const [progress, currentRisk] = await Promise.all([
                surveyService.getMyProgressOrNull(respondenId),
                surveyService.getMyRiskOrNull(),
            ]);
            const resolvedProgress = resolveProgressState(progress ?? deriveProgressFromRisk(currentRisk), existingProgress);
            const progressWithItems = resolvedProgress?.items
                ? resolvedProgress
                : currentRisk?.items
                    ? ({ ...(resolvedProgress ?? {}), items: currentRisk.items } as SurveyProgress)
                    : resolvedProgress;
            const resumeRiskIndex = getResumeRiskIndex(currentRisk, progressWithItems);
            const baseCurrentRisk = resolveRiskForIndex(
                currentRisk,
                currentRisk,
                progressWithItems,
                typeof progressWithItems?.current_risk === "number" ? progressWithItems.current_risk : null,
            );
            const resolvedCurrentRisk = resumeRiskIndex === null
                ? baseCurrentRisk
                : buildRiskAtIndex(resumeRiskIndex, currentRisk ?? baseCurrentRisk) ?? baseCurrentRisk;

            set({
                progress: progressWithItems,
                currentRisk: resolvedCurrentRisk,
                nextStep: extractNextStep(resolvedCurrentRisk ?? progressWithItems) ?? get().nextStep,
                loading: false,
            });

            return {
                success: true,
                data: { progress: progressWithItems, currentRisk: resolvedCurrentRisk },
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

    saveRiskDraft: async (payload) => {
        set({ saving: true, error: null });
        try {
            const result = await surveyService.saveRiskDraft(payload);
            const progress = await surveyService.getMyProgressOrNull(payload.responden_id);
            const fetchedRisk = await surveyService.getMyRiskOrNull();
            const currentRisk = resolveRiskForIndex(fetchedRisk, result as SurveyRiskResponse, progress, payload.current_risk);

            set({
                progress,
                currentRisk,
                nextStep: extractNextStep(result ?? currentRisk ?? progress) ?? get().nextStep,
                saving: false,
            });

            return { success: true, data: result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menyimpan draft survei";
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
            const resolvedProgress = resolveProgressState(progress, result);

            set({
                progress: resolvedProgress,
                nextStep: extractNextStep(resolvedProgress ?? result) ?? get().nextStep,
                saving: false,
            });

            return { success: true, data: resolvedProgress ?? result };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menyelesaikan survei";
            set({ saving: false, error: message });
            return { success: false, error: message };
        }
    },

    reset: () => set(initialState),
}));
