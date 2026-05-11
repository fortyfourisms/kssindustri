import { apiClient } from "@/services/apiClient";
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
} from "@/types/survey.types";

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function readNumber(...values: unknown[]): number | undefined {
    for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim() !== "") {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) return parsed;
        }
    }
    return undefined;
}

function readString(...values: unknown[]): string | undefined {
    for (const value of values) {
        if (typeof value === "string" && value.trim() !== "") return value;
    }
    return undefined;
}

function readBoolean(...values: unknown[]): boolean | undefined {
    for (const value of values) {
        if (typeof value === "boolean") return value;
        if (value === 1 || value === "1" || value === "true") return true;
        if (value === 0 || value === "0" || value === "false") return false;
    }
    return undefined;
}

function normalizeList<T>(res: unknown): T[] {
    if (Array.isArray(res)) return res as T[];
    if (!res || typeof res !== "object") return [];

    const record = res as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];

    const firstArray = Object.values(record).find((value) => Array.isArray(value));
    return Array.isArray(firstArray) ? (firstArray as T[]) : [];
}

function normalizeOne<T>(res: unknown): T {
    if (Array.isArray(res)) return (res[0] ?? {}) as T;
    if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
        const data = (res as Record<string, unknown>).data;
        if (Array.isArray(data)) return (data[0] ?? {}) as T;
        return (data ?? {}) as T;
    }
    return (res ?? {}) as T;
}

function normalizeDirection(direction?: string): "next" | "prev" {
    if (direction === "previous" || direction === "prev") return "prev";
    return "next";
}

function normalizeRespondent(res: unknown): SurveyRespondent {
    const normalized = normalizeOne<unknown>(res);
    const record = asRecord(normalized);
    if (!record || Object.keys(record).length === 0) {
        return {
            id: 0,
            nama_lengkap: "",
            jabatan: "",
            email: "",
            no_telepon: "",
            nama_perusahaan: "",
        };
    }

    const perusahaanRecord = asRecord(record.perusahaan) ?? asRecord(record.company);
    const subSektorRecord =
        asRecord(record.sub_sektor) ??
        asRecord(record.subSektor) ??
        asRecord(perusahaanRecord?.sub_sektor) ??
        asRecord(perusahaanRecord?.subSektor);

    return {
        ...(record as Record<string, unknown>),
        id: readNumber(record.id, record.responden_id, record.respondent_id, record.respondentId) ?? 0,
        id_perusahaan: readString(record.id_perusahaan, record.perusahaan_id, record.company_id, perusahaanRecord?.id),
        nama_lengkap: readString(record.nama_lengkap, record.nama, record.full_name, record.name) ?? "",
        jabatan: readString(record.jabatan, record.position, record.role) ?? "",
        email: readString(record.email, record.email_pekerjaan, record.work_email) ?? "",
        no_telepon: readString(record.no_telepon, record.nomor_telepon, record.telepon, record.phone, record.whatsapp) ?? "",
        nama_perusahaan: readString(
            record.nama_perusahaan,
            record.perusahaan,
            perusahaanRecord?.nama_perusahaan,
            perusahaanRecord?.name,
        ) ?? "",
        nama_sektor: readString(
            record.nama_sektor,
            perusahaanRecord?.nama_sektor,
            perusahaanRecord?.sektor,
        ),
        nama_sub_sektor: readString(
            record.nama_sub_sektor,
            record.sub_sektor_nama,
            subSektorRecord?.nama_sub_sektor,
            subSektorRecord?.name,
        ),
        sertifikat_training: readString(
            record.sertifikat_training,
            record.sertifikat,
            record.training,
        ) ?? null,
        perusahaan: readString(
            record.perusahaan,
            record.nama_perusahaan,
            perusahaanRecord?.nama_perusahaan,
            perusahaanRecord?.name,
        ),
        sektor: readString(
            record.sektor,
            record.nama_sub_sektor,
            record.nama_sektor,
            subSektorRecord?.nama_sub_sektor,
            perusahaanRecord?.sektor,
        ),
        sektor_lainnya: readString(record.sektor_lainnya, record.sektorLainnya) ?? null,
    };
}

function isNotFoundError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 404;
}

function mergeNextStep<T extends SurveyRiskResponse | SurveyProgress>(result: T, fallback: SurveyRiskResponse | SurveyProgress | null): T {
    if (result?.next_step || !fallback?.next_step) return result;
    return {
        ...result,
        next_step: fallback.next_step,
    } as T;
}

function withRiskIdentity(payload: {
    responden_id: number;
    risiko_id?: number;
    custom_risiko_id?: number;
}) {
    return {
        responden_id: payload.responden_id,
        risiko_id: payload.risiko_id,
        custom_risiko_id: payload.custom_risiko_id,
    };
}

function normalizeRiskResponse(res: unknown): SurveyRiskResponse | null {
    const normalized = normalizeOne<unknown>(res);
    const record = asRecord(normalized);
    if (!record || Object.keys(record).length === 0) return null;

    const risikoRecord = asRecord(record.risiko) ?? asRecord(record.risk) ?? asRecord(record.active_risk);
    const customRisikoRecord = asRecord(record.custom_risiko) ?? asRecord(record.customRisk);

    const risikoId = readNumber(
        record.risiko_id,
        record.risk_id,
        record.id_risiko,
        risikoRecord?.risiko_id,
        risikoRecord?.risk_id,
        risikoRecord?.id,
    );
    const customRisikoId = readNumber(
        record.custom_risiko_id,
        record.customRiskId,
        record.custom_risk_id,
        customRisikoRecord?.custom_risiko_id,
        customRisikoRecord?.custom_risk_id,
        customRisikoRecord?.id,
    );

    return {
        ...record,
        id: readNumber(record.id),
        risiko_id: risikoId,
        custom_risiko_id: customRisikoId,
        current_risk: readNumber(record.current_risk, record.currentRisk, record.index, record.urutan),
        total_risks: readNumber(record.total_risks, record.totalRisks, record.total_steps, record.totalSteps),
        has_next: readBoolean(record.has_next, record.hasNext),
        has_previous: readBoolean(record.has_previous, record.hasPrevious),
        next_risk: readNumber(record.next_risk, record.nextRisk),
        previous_risk: readNumber(record.previous_risk, record.previousRisk),
        nama_risiko: readString(
            record.nama_risiko,
            record.namaRisiko,
            risikoRecord?.nama_risiko,
            risikoRecord?.namaRisiko,
            risikoRecord?.judul,
            risikoRecord?.title,
        ),
        judul: readString(record.judul, record.title, risikoRecord?.judul, risikoRecord?.title),
        deskripsi: readString(record.deskripsi, record.description, risikoRecord?.deskripsi, risikoRecord?.description),
        pernah_terjadi: readBoolean(record.pernah_terjadi, record.pernahTerjadi),
        alasan: readString(record.alasan, record.reason),
        dampak_reputasi: readNumber(record.dampak_reputasi, record.dampakReputasi),
        dampak_operasional: readNumber(record.dampak_operasional, record.dampakOperasional),
        dampak_finansial: readNumber(record.dampak_finansial, record.dampakFinansial),
        dampak_hukum: readNumber(record.dampak_hukum, record.dampakHukum),
        frekuensi: readNumber(record.frekuensi, record.frequency),
        ada_pengendalian: readBoolean(record.ada_pengendalian, record.adaPengendalian),
        deskripsi_pengendalian: readString(record.deskripsi_pengendalian, record.deskripsiPengendalian),
        next_step: readString(record.next_step, record.nextStep),
    };
}

export const surveyService = {
    async getRespondents(): Promise<SurveyRespondent[]> {
        const res = await apiClient.get<unknown>("/api/survey/responden");
        return normalizeList<unknown>(res).map((item) => normalizeRespondent(item));
    },

    async getMyRespondent(): Promise<SurveyRespondent> {
        const res = await apiClient.get<unknown>("/api/survey/responden/me");
        return normalizeRespondent(res);
    },

    async getMyRespondentOrNull(fallbackId?: number | string | null): Promise<SurveyRespondent | null> {
        try {
            const respondent = await surveyService.getMyRespondent();
            if (!respondent || !respondent.id) return null;
            return respondent;
        } catch (error: unknown) {
            if (isNotFoundError(error)) {
                return null;
            }
            throw error;
        }
    },

    async getRespondentById(id: number | string): Promise<SurveyRespondent> {
        const res = await apiClient.get<unknown>(`/api/survey/responden/${id}`);
        return normalizeRespondent(res);
    },

    async getRespondentByIdOrNull(id?: number | string | null): Promise<SurveyRespondent | null> {
        if (id === null || id === undefined || String(id).trim() === "") return null;
        try {
            return await surveyService.getRespondentById(id);
        } catch (error: unknown) {
            if (isNotFoundError(error)) {
                return null;
            }
            throw error;
        }
    },

    async createRespondent(payload: UpsertSurveyRespondentPayload): Promise<SurveyRespondent> {
        const res = await apiClient.post<unknown>("/api/survey/responden", payload);
        return normalizeRespondent(res);
    },

    async updateRespondent(id: number | string, payload: UpsertSurveyRespondentPayload): Promise<SurveyRespondent> {
        const res = await apiClient.put<unknown>(`/api/survey/responden/${id}`, payload);
        return normalizeRespondent(res);
    },

    async upsertMyRespondent(payload: UpsertSurveyRespondentPayload, existingId?: number | string | null): Promise<SurveyRespondent> {
        try {
            const res = await apiClient.post<unknown>("/api/survey/responden/me", payload);
            return normalizeRespondent(res);
        } catch (error: unknown) {
            if (!isNotFoundError(error)) {
                throw error;
            }

            if (existingId !== null && existingId !== undefined && String(existingId).trim() !== "") {
                return surveyService.updateRespondent(existingId, payload);
            }

            return surveyService.createRespondent(payload);
        }
    },

    async deleteRespondent(id: number | string): Promise<void> {
        return apiClient.delete(`/api/survey/responden/${id}`);
    },

    async getProgress(respondenId: number | string): Promise<SurveyProgress | null> {
        const res = await apiClient.get<unknown>(`/api/survey/progress/${respondenId}`);
        if (!res) return null;
        return normalizeOne<SurveyProgress>(res);
    },

    async getProgressOrNull(respondenId?: number | string | null): Promise<SurveyProgress | null> {
        if (respondenId === null || respondenId === undefined || String(respondenId).trim() === "") return null;
        try {
            return await surveyService.getProgress(respondenId);
        } catch (error: unknown) {
            if (isNotFoundError(error)) {
                return null;
            }
            throw error;
        }
    },

    async getRiskByRespondent(respondenId: number | string): Promise<SurveyRiskResponse | null> {
        const res = await apiClient.get<unknown>(`/api/survey/risiko/${respondenId}`);
        if (!res) return null;
        return normalizeRiskResponse(res);
    },

    async getRiskByRespondentOrNull(respondenId?: number | string | null): Promise<SurveyRiskResponse | null> {
        if (respondenId === null || respondenId === undefined || String(respondenId).trim() === "") return null;
        try {
            return await surveyService.getRiskByRespondent(respondenId);
        } catch (error: unknown) {
            if (isNotFoundError(error)) {
                return null;
            }
            throw error;
        }
    },

    async createCustomRisk(payload: SurveyCustomRiskPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>("/api/survey/risiko/custom-risk", payload);
    },

    async saveEligibility(payload: SurveyRiskEligibilityPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>("/api/survey/risiko/eligibility", payload);
    },

    async saveReason(payload: SurveyRiskReasonPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>("/api/survey/risiko/reason", payload);
    },

    async saveImpact(payload: SurveyRiskImpactPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>("/api/survey/risiko/dampak", payload);
    },

    async saveControl(payload: SurveyRiskControlPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>("/api/survey/risiko/pengendalian", payload);
    },

    async navigateRisk(payload: SurveyRiskNavigationPayload): Promise<SurveyRiskResponse> {
        return apiClient.post<SurveyRiskResponse>("/api/survey/risiko/navigate", {
            ...payload,
            direction: normalizeDirection(payload.direction),
        });
    },

    async saveProgress(payload: SurveyRiskNavigationPayload): Promise<SurveyProgress> {
        return apiClient.post<SurveyProgress>("/api/survey/risiko/save-progress", {
            ...payload,
            direction: normalizeDirection(payload.direction),
        });
    },

    async finishSurvey(payload: SurveyRiskFinishPayload): Promise<SurveyProgress> {
        void payload;
        return apiClient.post<SurveyProgress>("/api/survey/risiko/finish", {});
    },

    async saveRiskStep(payload: SaveSurveyRiskStepPayload): Promise<SurveyRiskResponse | SurveyProgress> {
        const identity = withRiskIdentity(payload);
        let lastResponse: SurveyRiskResponse | SurveyProgress | null = null;

        lastResponse = await surveyService.saveEligibility({
            ...identity,
            pernah_terjadi: payload.pernah_terjadi,
        });

        if (!payload.pernah_terjadi) {
            lastResponse = await surveyService.saveReason({
                ...identity,
                alasan: payload.alasan?.trim() || "",
            });
        } else {
            lastResponse = await surveyService.saveImpact({
                ...identity,
                dampak_finansial: payload.dampak_finansial,
                dampak_hukum: payload.dampak_hukum,
                dampak_operasional: payload.dampak_operasional,
                dampak_reputasi: payload.dampak_reputasi,
                frekuensi: payload.frekuensi,
            });

            lastResponse = await surveyService.saveControl({
                ...identity,
                ada_pengendalian: payload.ada_pengendalian,
                deskripsi_pengendalian: payload.deskripsi_pengendalian?.trim() || "",
            });
        }

        if (payload.finish) {
            const finishResult = await surveyService.finishSurvey({ responden_id: payload.responden_id });
            return mergeNextStep(finishResult, lastResponse);
        }

        await surveyService.saveProgress({
            responden_id: payload.responden_id,
            current_risk: payload.current_risk,
            direction: normalizeDirection(payload.direction),
        });

        const navigationResult = await surveyService.navigateRisk({
            responden_id: payload.responden_id,
            current_risk: payload.current_risk,
            direction: normalizeDirection(payload.direction),
        });
        return mergeNextStep(navigationResult, lastResponse);
    },
};
