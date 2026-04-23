export type SurveyDirection = 'next' | 'previous' | string;

export type SurveyScaleValue = 1 | 2 | 3 | 4;

export interface SurveyRespondent {
    id: number;
    nama_lengkap: string;
    jabatan: string;
    perusahaan: string;
    email: string;
    no_telepon: string;
    sektor: string;
    sektor_lainnya?: string | null;
    sertifikat_training?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UpsertSurveyRespondentPayload {
    nama_lengkap: string;
    jabatan: string;
    perusahaan: string;
    email: string;
    no_telepon: string;
    sektor: string;
    sektor_lainnya?: string;
    sertifikat_training?: string;
}

export interface SurveyCustomRiskPayload extends Record<string, unknown> {
    responden_id: number;
}

export interface SurveyRiskEligibilityPayload {
    responden_id: number;
    risiko_id?: number;
    custom_risiko_id?: number;
    pernah_terjadi: boolean;
}

export interface SurveyRiskReasonPayload {
    responden_id: number;
    risiko_id?: number;
    custom_risiko_id?: number;
    alasan: string;
}

export interface SurveyRiskImpactPayload {
    responden_id: number;
    risiko_id?: number;
    custom_risiko_id?: number;
    dampak_finansial: SurveyScaleValue;
    dampak_hukum: SurveyScaleValue;
    dampak_operasional: SurveyScaleValue;
    dampak_reputasi: SurveyScaleValue;
    frekuensi: SurveyScaleValue;
}

export interface SurveyRiskControlPayload {
    responden_id: number;
    risiko_id?: number;
    custom_risiko_id?: number;
    ada_pengendalian: boolean;
    deskripsi_pengendalian: string;
}

export interface SurveyRiskNavigationPayload {
    responden_id: number;
    current_risk: number;
    direction: SurveyDirection;
}

export interface SurveyRiskFinishPayload {
    responden_id: number;
}

export interface SurveyProgress {
    responden_id?: number;
    current_risk?: number;
    completed?: boolean;
    finished_at?: string | null;
    updated_at?: string;
    total_risks?: number;
    total_steps?: number;
    has_next?: boolean;
    has_previous?: boolean;
    [key: string]: unknown;
}

export interface SurveyRiskResponse {
    id?: number;
    risiko_id?: number;
    custom_risiko_id?: number | null;
    current_risk?: number;
    total_risks?: number;
    has_next?: boolean;
    has_previous?: boolean;
    next_risk?: number | null;
    previous_risk?: number | null;
    nama_risiko?: string;
    judul?: string;
    deskripsi?: string;
    pernah_terjadi?: boolean;
    alasan?: string;
    dampak_reputasi?: number;
    dampak_operasional?: number;
    dampak_finansial?: number;
    dampak_hukum?: number;
    frekuensi?: number;
    ada_pengendalian?: boolean;
    deskripsi_pengendalian?: string;
    [key: string]: unknown;
}

export interface SaveSurveyRiskStepPayload {
    responden_id: number;
    current_risk: number;
    direction?: SurveyDirection;
    finish?: boolean;
    risiko_id?: number;
    custom_risiko_id?: number;
    pernah_terjadi: boolean;
    alasan?: string;
    dampak_reputasi: SurveyScaleValue;
    dampak_operasional: SurveyScaleValue;
    dampak_finansial: SurveyScaleValue;
    dampak_hukum: SurveyScaleValue;
    frekuensi: SurveyScaleValue;
    ada_pengendalian: boolean;
    deskripsi_pengendalian: string;
}
