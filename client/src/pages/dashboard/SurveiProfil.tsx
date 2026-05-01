import { useState, useEffect, useMemo } from "react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { Info, UserCircle2, ArrowRight, ArrowLeft, AlertTriangle, Loader2, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { useSurveyStore } from "@/stores/survey.store";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { STATIC_SURVEY_RISKS, STATIC_SURVEY_SECTORS } from "@/data/survey-static";
import type { SurveyProgress, SurveyRespondent, SurveyRiskResponse, SurveyScaleValue, UpsertSurveyRespondentPayload } from "@/types/survey.types";

const INPUT_CLS = "dashboard-input w-full rounded-xl border px-4 py-3 text-sm transition-all duration-300";
const LABEL_CLS = "dashboard-label mb-2 block text-sm font-semibold tracking-wide";
const PANEL_CLS = "dashboard-section-card rounded-2xl p-6 sm:p-8";
const TABLE_PANEL_CLS = "dashboard-table-surface rounded-2xl shadow-sm overflow-hidden";
const SECONDARY_BUTTON_CLS = "dashboard-table-surface dashboard-text-soft inline-flex items-center justify-center rounded-xl border px-6 py-3 text-sm font-semibold transition-all shadow-sm hover:bg-[var(--dashboard-surface)]";
const PRIMARY_BUTTON_CLS = "dashboard-primary-button flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-[15px] font-semibold transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50";
const SELECTED_CARD_CLS = "dashboard-option-selected";
const SELECTED_TEXT_CLS = "dashboard-option-selected-text";
const DEFAULT_RISK_TITLE = "Pencurian Intellectual Property";
const DEFAULT_RISK_DESCRIPTION = "Silakan evaluasi dan berikan estimasi dampak yang mungkin terjadi terkait perlindungan Hak Kekayaan Intelektual perusahaan Anda.";
const IMPACT_TO_API: Record<string, SurveyScaleValue> = {
    tidak_signifikan: 1,
    cukup_signifikan: 2,
    signifikan: 3,
    sangat_signifikan: 4,
};
const API_TO_IMPACT: Record<number, string> = {
    1: "tidak_signifikan",
    2: "cukup_signifikan",
    3: "signifikan",
    4: "sangat_signifikan",
};
const FREQUENCY_TO_API: Record<string, SurveyScaleValue> = {
    kecil: 1,
    sedang: 2,
    besar: 3,
    sangat_besar: 4,
};
const API_TO_FREQUENCY: Record<number, string> = {
    1: "kecil",
    2: "sedang",
    3: "besar",
    4: "sangat_besar",
};
const DEFAULT_ANSWERS = {
    responden_nama: '',
    responden_jabatan: '',
    responden_perusahaan: '',
    responden_email: '',
    responden_telepon: '',
    responden_sektor: '',
    responden_sertifikat: '',
    q1: 'ya',
    q1_alasan: '',
    dampak_reputasi: null,
    dampak_operasional: 'cukup_signifikan',
    dampak_finansial: 'cukup_signifikan',
    dampak_hukum: 'cukup_signifikan',
    frekuensi: 'sedang',
    q4: 'ya',
    q5: ''
};

const STATIC_RESPONDENT_KEY = "survey-static-respondent-v1";
const STATIC_PROGRESS_KEY = "survey-static-progress-v1";
const STATIC_ANSWERS_KEY = "survey-static-answers-v1";

type SurveyMode = "pending" | "backend" | "static";
type StoredRiskAnswers = Record<number, Partial<typeof DEFAULT_ANSWERS>>;

function canUseBrowserStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredJson<T>(key: string, fallback: T): T {
    if (!canUseBrowserStorage()) return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function writeStoredJson(key: string, value: unknown) {
    if (!canUseBrowserStorage()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
}

function hasNextRisk(risk: SurveyRiskResponse | null, progress: Record<string, any> | null): boolean {
    if (typeof risk?.has_next === "boolean") return risk.has_next;
    if (typeof progress?.has_next === "boolean") return progress.has_next;
    if (typeof risk?.next_risk === "number") return true;

    const totalRisks = typeof risk?.total_risks === "number"
        ? risk.total_risks
        : typeof progress?.total_risks === "number"
            ? progress.total_risks
            : typeof progress?.total_steps === "number"
                ? progress.total_steps
                : undefined;

    if (typeof totalRisks === "number") {
        return getCurrentRiskIndex(risk, progress) + 1 < totalRisks;
    }

    return true;
}

function hasPreviousRisk(risk: SurveyRiskResponse | null, progress: Record<string, any> | null): boolean {
    if (typeof risk?.has_previous === "boolean") return risk.has_previous;
    if (typeof progress?.has_previous === "boolean") return progress.has_previous;
    if (typeof risk?.previous_risk === "number") return true;
    return getCurrentRiskIndex(risk, progress) > 0;
}

function getRiskId(risk: SurveyRiskResponse | null): number | undefined {
    if (!risk) return undefined;
    if (typeof risk.risiko_id === "number") return risk.risiko_id;
    if (typeof risk.id === "number") return risk.id;
    return undefined;
}

function getCustomRiskId(risk: SurveyRiskResponse | null): number | undefined {
    if (!risk) return undefined;
    return typeof risk.custom_risiko_id === "number" ? risk.custom_risiko_id : undefined;
}

function getCurrentRiskIndex(risk: SurveyRiskResponse | null, progress: Record<string, any> | null): number {
    if (risk && typeof risk.current_risk === "number") return risk.current_risk;
    if (progress && typeof progress.current_risk === "number") return progress.current_risk;
    return 0;
}

export default function SurveiProfil() {
    const [answers, setAnswers] = useState<Record<string, any>>(DEFAULT_ANSWERS);

    const { data: user } = useUser();
    const { toast } = useToast();
    const { data: subSektors } = useQuery({ queryKey: ["subSektor"], queryFn: () => apiClient.get<any[]>("/api/sub_sektor") });
    const currentRespondent = useSurveyStore((state) => state.currentRespondent);
    const currentRisk = useSurveyStore((state) => state.currentRisk);
    const progressState = useSurveyStore((state) => state.progress);
    const saving = useSurveyStore((state) => state.saving);
    const hydrateByEmail = useSurveyStore((state) => state.hydrateByEmail);
    const saveRespondent = useSurveyStore((state) => state.saveRespondent);
    const loadSurveyContext = useSurveyStore((state) => state.loadSurveyContext);
    const saveRiskStep = useSurveyStore((state) => state.saveRiskStep);
    const navigateRisk = useSurveyStore((state) => state.navigateRisk);

    const [step, setStep] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [surveyMode, setSurveyMode] = useState<SurveyMode>("pending");
    const [localRespondent, setLocalRespondent] = useState<SurveyRespondent | null>(null);
    const [localProgress, setLocalProgress] = useState<SurveyProgress | null>(null);
    const [localRiskIndex, setLocalRiskIndex] = useState(0);
    const [localRiskAnswers, setLocalRiskAnswers] = useState<StoredRiskAnswers>({});

    useEffect(() => {
        setLocalRespondent(readStoredJson<SurveyRespondent | null>(STATIC_RESPONDENT_KEY, null));
        setLocalProgress(readStoredJson<SurveyProgress | null>(STATIC_PROGRESS_KEY, null));
        setLocalRiskAnswers(readStoredJson<StoredRiskAnswers>(STATIC_ANSWERS_KEY, {}));
    }, []);

    useEffect(() => {
        if (!user?.email) {
            setSurveyMode("static");
            return;
        }

        let cancelled = false;

        const bootstrap = async () => {
            const result = await hydrateByEmail(user.email);
            if (cancelled) return;

            if (result.success) {
                setSurveyMode("backend");
                return;
            }

            setSurveyMode("static");
        };

        void bootstrap();

        return () => {
            cancelled = true;
        };
    }, [user?.email, hydrateByEmail]);

    useEffect(() => {
        const storedIndex = typeof localProgress?.current_risk === "number" ? localProgress.current_risk : 0;
        const maxIndex = Math.max(STATIC_SURVEY_RISKS.length - 1, 0);
        setLocalRiskIndex(Math.min(Math.max(storedIndex, 0), maxIndex));
    }, [localProgress]);

    const fallbackSectors = useMemo(
        () => (Array.isArray(subSektors) && subSektors.length > 0 ? subSektors : STATIC_SURVEY_SECTORS),
        [subSektors]
    );

    const staticCurrentRisk = useMemo<SurveyRiskResponse | null>(() => {
        const risk = STATIC_SURVEY_RISKS[localRiskIndex];
        if (!risk) return null;

        const storedAnswers = localRiskAnswers[risk.id] ?? {};
        return {
            id: risk.id,
            risiko_id: risk.id,
            current_risk: localRiskIndex,
            total_risks: STATIC_SURVEY_RISKS.length,
            has_next: localRiskIndex < STATIC_SURVEY_RISKS.length - 1,
            has_previous: localRiskIndex > 0,
            next_risk: localRiskIndex < STATIC_SURVEY_RISKS.length - 1 ? localRiskIndex + 1 : null,
            previous_risk: localRiskIndex > 0 ? localRiskIndex - 1 : null,
            nama_risiko: risk.nama_risiko,
            deskripsi: risk.deskripsi,
            pernah_terjadi: typeof storedAnswers.q1 === "string" ? storedAnswers.q1 === "ya" : undefined,
            alasan: typeof storedAnswers.q1_alasan === "string" ? storedAnswers.q1_alasan : undefined,
            dampak_reputasi: typeof storedAnswers.dampak_reputasi === "string" ? IMPACT_TO_API[storedAnswers.dampak_reputasi] : undefined,
            dampak_operasional: typeof storedAnswers.dampak_operasional === "string" ? IMPACT_TO_API[storedAnswers.dampak_operasional] : undefined,
            dampak_finansial: typeof storedAnswers.dampak_finansial === "string" ? IMPACT_TO_API[storedAnswers.dampak_finansial] : undefined,
            dampak_hukum: typeof storedAnswers.dampak_hukum === "string" ? IMPACT_TO_API[storedAnswers.dampak_hukum] : undefined,
            frekuensi: typeof storedAnswers.frekuensi === "string" ? FREQUENCY_TO_API[storedAnswers.frekuensi] : undefined,
            ada_pengendalian: typeof storedAnswers.q4 === "string" ? storedAnswers.q4 === "ya" : undefined,
            deskripsi_pengendalian: typeof storedAnswers.q5 === "string" ? storedAnswers.q5 : undefined,
        };
    }, [localRiskAnswers, localRiskIndex]);

    const activeRespondent = surveyMode === "backend" ? currentRespondent : localRespondent;
    const activeRisk = surveyMode === "backend" ? currentRisk : staticCurrentRisk;
    const activeProgress = surveyMode === "backend"
        ? progressState
        : (
            localProgress ?? {
                current_risk: localRiskIndex,
                total_risks: STATIC_SURVEY_RISKS.length,
                has_next: localRiskIndex < STATIC_SURVEY_RISKS.length - 1,
                has_previous: localRiskIndex > 0,
                completed: false,
            }
        );
    const isStaticMode = surveyMode === "static";
    const isLoadingMode = surveyMode === "pending";

    useEffect(() => {
        if (!activeRespondent && !activeRisk) return;

        setAnswers({
            ...DEFAULT_ANSWERS,
            responden_nama: activeRespondent?.nama_lengkap || DEFAULT_ANSWERS.responden_nama,
            responden_jabatan: activeRespondent?.jabatan || DEFAULT_ANSWERS.responden_jabatan,
            responden_perusahaan: activeRespondent?.perusahaan || DEFAULT_ANSWERS.responden_perusahaan,
            responden_email: activeRespondent?.email || user?.email || DEFAULT_ANSWERS.responden_email,
            responden_telepon: activeRespondent?.no_telepon || DEFAULT_ANSWERS.responden_telepon,
            responden_sektor: activeRespondent?.sektor || DEFAULT_ANSWERS.responden_sektor,
            responden_sertifikat: activeRespondent?.sertifikat_training || DEFAULT_ANSWERS.responden_sertifikat,
            q1: typeof activeRisk?.pernah_terjadi === "boolean" ? (activeRisk.pernah_terjadi ? "ya" : "tidak") : DEFAULT_ANSWERS.q1,
            q1_alasan: typeof activeRisk?.alasan === "string" ? activeRisk.alasan : DEFAULT_ANSWERS.q1_alasan,
            dampak_reputasi: typeof activeRisk?.dampak_reputasi === "number" ? (API_TO_IMPACT[activeRisk.dampak_reputasi] || DEFAULT_ANSWERS.dampak_reputasi) : DEFAULT_ANSWERS.dampak_reputasi,
            dampak_operasional: typeof activeRisk?.dampak_operasional === "number" ? (API_TO_IMPACT[activeRisk.dampak_operasional] || DEFAULT_ANSWERS.dampak_operasional) : DEFAULT_ANSWERS.dampak_operasional,
            dampak_finansial: typeof activeRisk?.dampak_finansial === "number" ? (API_TO_IMPACT[activeRisk.dampak_finansial] || DEFAULT_ANSWERS.dampak_finansial) : DEFAULT_ANSWERS.dampak_finansial,
            dampak_hukum: typeof activeRisk?.dampak_hukum === "number" ? (API_TO_IMPACT[activeRisk.dampak_hukum] || DEFAULT_ANSWERS.dampak_hukum) : DEFAULT_ANSWERS.dampak_hukum,
            frekuensi: typeof activeRisk?.frekuensi === "number" ? (API_TO_FREQUENCY[activeRisk.frekuensi] || DEFAULT_ANSWERS.frekuensi) : DEFAULT_ANSWERS.frekuensi,
            q4: typeof activeRisk?.ada_pengendalian === "boolean" ? (activeRisk.ada_pengendalian ? "ya" : "tidak") : DEFAULT_ANSWERS.q4,
            q5: typeof activeRisk?.deskripsi_pengendalian === "string" ? activeRisk.deskripsi_pengendalian : DEFAULT_ANSWERS.q5,
        });

        if (activeRespondent) {
            setStep(1);
        } else {
            setStep(0);
        }
    }, [activeRespondent, activeRisk, user?.email]);

    useEffect(() => {
        setIsFinished(Boolean(activeProgress?.completed || activeProgress?.finished_at));
    }, [activeProgress]);

    const setAnswer = (key: string, val: any) => {
        setAnswers(prev => ({ ...prev, [key]: val }));
    };

    const isStep0Valid = answers.responden_nama && answers.responden_jabatan && answers.responden_perusahaan && answers.responden_email && answers.responden_telepon && answers.responden_sektor;
    const isStep1Valid = answers.q1 === "tidak"
        ? Boolean(answers.q1_alasan?.trim())
        : Boolean(
            answers.dampak_reputasi &&
            answers.dampak_operasional &&
            answers.dampak_finansial &&
            answers.dampak_hukum &&
            answers.frekuensi &&
            answers.q4 &&
            (answers.q4 === "tidak" || answers.q5?.trim())
        );

    const submitRisk = async (direction: "next" | "previous") => {
        if (isStaticMode) {
            const activeRiskId = STATIC_SURVEY_RISKS[localRiskIndex]?.id;
            if (!activeRiskId) return false;

            const nextAnswers = {
                ...localRiskAnswers,
                [activeRiskId]: {
                    q1: answers.q1,
                    q1_alasan: answers.q1_alasan,
                    dampak_reputasi: answers.dampak_reputasi,
                    dampak_operasional: answers.dampak_operasional,
                    dampak_finansial: answers.dampak_finansial,
                    dampak_hukum: answers.dampak_hukum,
                    frekuensi: answers.frekuensi,
                    q4: answers.q4,
                    q5: answers.q5,
                },
            };
            setLocalRiskAnswers(nextAnswers);
            writeStoredJson(STATIC_ANSWERS_KEY, nextAnswers);

            const shouldFinish = direction === "next" && localRiskIndex >= STATIC_SURVEY_RISKS.length - 1;
            if (shouldFinish) {
                const finishedProgress: SurveyProgress = {
                    current_risk: localRiskIndex,
                    total_risks: STATIC_SURVEY_RISKS.length,
                    completed: true,
                    finished_at: new Date().toISOString(),
                    has_next: false,
                    has_previous: localRiskIndex > 0,
                };
                setLocalProgress(finishedProgress);
                writeStoredJson(STATIC_PROGRESS_KEY, finishedProgress);
                setIsFinished(true);
                toast({
                    title: "Survei selesai",
                    description: "Jawaban survei risiko statis berhasil disimpan di browser.",
                });
                return true;
            }

            const nextIndex = direction === "next"
                ? Math.min(localRiskIndex + 1, STATIC_SURVEY_RISKS.length - 1)
                : Math.max(localRiskIndex - 1, 0);
            const nextProgress: SurveyProgress = {
                current_risk: nextIndex,
                total_risks: STATIC_SURVEY_RISKS.length,
                completed: false,
                has_next: nextIndex < STATIC_SURVEY_RISKS.length - 1,
                has_previous: nextIndex > 0,
            };
            setLocalRiskIndex(nextIndex);
            setLocalProgress(nextProgress);
            writeStoredJson(STATIC_PROGRESS_KEY, nextProgress);

            toast({
                title: direction === "next" ? "Jawaban tersimpan" : "Kembali ke risiko sebelumnya",
                description: "Data survei statis berhasil diperbarui di browser.",
            });
            return true;
        }

        if (!currentRespondent?.id) {
            toast({
                title: "Responden belum tersedia",
                description: "Simpan data responden terlebih dahulu.",
                variant: "destructive",
            });
            return false;
        }

        const risikoId = getRiskId(currentRisk);
        const customRisikoId = getCustomRiskId(currentRisk);
        if (!risikoId && !customRisikoId) {
            toast({
                title: "Identitas risiko belum tersedia",
                description: "Backend belum mengirim risiko aktif untuk responden ini.",
                variant: "destructive",
            });
            return false;
        }

        const shouldFinish = direction === "next" && !hasNextRisk(currentRisk, progressState as Record<string, any> | null);
        const result = await saveRiskStep({
            responden_id: currentRespondent.id,
            current_risk: getCurrentRiskIndex(currentRisk, progressState as Record<string, any> | null),
            direction,
            finish: shouldFinish,
            risiko_id: risikoId,
            custom_risiko_id: customRisikoId,
            pernah_terjadi: answers.q1 === "ya",
            alasan: answers.q1_alasan || "",
            dampak_reputasi: IMPACT_TO_API[answers.dampak_reputasi] ?? 1,
            dampak_operasional: IMPACT_TO_API[answers.dampak_operasional] ?? 2,
            dampak_finansial: IMPACT_TO_API[answers.dampak_finansial] ?? 2,
            dampak_hukum: IMPACT_TO_API[answers.dampak_hukum] ?? 2,
            frekuensi: FREQUENCY_TO_API[answers.frekuensi] ?? 2,
            ada_pengendalian: answers.q4 === "ya",
            deskripsi_pengendalian: answers.q4 === "ya" ? answers.q5 || "" : "",
        });

        if (!result.success) {
            toast({
                title: "Gagal menyimpan jawaban",
                description: result.error || "Jawaban survei belum berhasil dikirim.",
                variant: "destructive",
            });
            return false;
        }

        if (shouldFinish) {
            setIsFinished(true);
            toast({
                title: "Survei selesai",
                description: "Seluruh jawaban survei profil risiko berhasil dikirim.",
            });
            return true;
        }

        toast({
            title: direction === "next" ? "Jawaban tersimpan" : "Kembali ke risiko sebelumnya",
            description: direction === "next"
                ? "Progress survei risiko berhasil diperbarui."
                : "Data risiko saat ini sudah tersimpan.",
        });
        return true;
    };

    const handleNext = async () => {
        if (step === 0 && isStep0Valid) {
            const respondentPayload: UpsertSurveyRespondentPayload = {
                nama_lengkap: answers.responden_nama,
                jabatan: answers.responden_jabatan,
                perusahaan: answers.responden_perusahaan,
                email: answers.responden_email,
                no_telepon: answers.responden_telepon,
                sektor: String(answers.responden_sektor),
                sertifikat_training: answers.responden_sertifikat || '',
                sektor_lainnya: '',
            };

            if (isStaticMode) {
                const staticRespondent: SurveyRespondent = {
                    id: localRespondent?.id ?? Date.now(),
                    ...respondentPayload,
                    created_at: localRespondent?.created_at ?? new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                const initialProgress: SurveyProgress = localProgress ?? {
                    current_risk: 0,
                    total_risks: STATIC_SURVEY_RISKS.length,
                    completed: false,
                    has_next: true,
                    has_previous: false,
                };
                setLocalRespondent(staticRespondent);
                setLocalProgress(initialProgress);
                writeStoredJson(STATIC_RESPONDENT_KEY, staticRespondent);
                writeStoredJson(STATIC_PROGRESS_KEY, initialProgress);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep(1);
                toast({
                    title: "Data responden tersimpan",
                    description: "Mode statis aktif. Lanjutkan pengisian survei risiko.",
                });
                return;
            }

            const respondentResult = await saveRespondent(respondentPayload, currentRespondent?.id);
            if (!respondentResult.success || !respondentResult.data) {
                toast({
                    title: "Gagal menyimpan responden",
                    description: respondentResult.error || "Data responden belum dapat disimpan.",
                    variant: "destructive",
                });
                return;
            }

            await loadSurveyContext(respondentResult.data.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(1);
            toast({
                title: "Data responden tersimpan",
                description: "Lanjutkan pengisian survei risiko.",
            });
            return;
        }

        if (step === 1) {
            if (!isStep1Valid) {
                toast({
                    title: "Jawaban belum lengkap",
                    description: "Lengkapi jawaban risiko sebelum melanjutkan.",
                    variant: "destructive",
                });
                return;
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            await submitRisk("next");
        }
    };

    const handlePrev = async () => {
        if (step === 1) {
            if (isStaticMode) {
                if (localRiskIndex > 0) {
                    if (isStep1Valid) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        await submitRisk("previous");
                        return;
                    }

                    const nextIndex = Math.max(localRiskIndex - 1, 0);
                    const nextProgress: SurveyProgress = {
                        current_risk: nextIndex,
                        total_risks: STATIC_SURVEY_RISKS.length,
                        completed: false,
                        has_next: true,
                        has_previous: nextIndex > 0,
                    };
                    setLocalRiskIndex(nextIndex);
                    setLocalProgress(nextProgress);
                    writeStoredJson(STATIC_PROGRESS_KEY, nextProgress);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep(0);
                return;
            }

            if (hasPreviousRisk(currentRisk, progressState as Record<string, any> | null) && currentRespondent?.id) {
                if (isStep1Valid) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    await submitRisk("previous");
                    return;
                }

                const result = await navigateRisk({
                    respondenId: currentRespondent.id,
                    currentRisk: getCurrentRiskIndex(currentRisk, progressState as Record<string, any> | null),
                    direction: "previous",
                });

                if (!result.success) {
                    toast({
                        title: "Gagal membuka risiko sebelumnya",
                        description: result.error || "Coba lagi beberapa saat lagi.",
                        variant: "destructive",
                    });
                    return;
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(0);
        }
    };

    let totalFields = 8;
    const activeAnswers = { ...answers };

    if (activeAnswers.q1 === 'tidak') {
        const keysToKeep = ['q1', 'q1_alasan'];
        Object.keys(activeAnswers).forEach(key => {
            if (!keysToKeep.includes(key)) {
                delete activeAnswers[key];
            }
        });
        totalFields = 2;
    } else {
        delete activeAnswers.q1_alasan;
        totalFields = 8;
    }

    const answeredFields = Object.values(activeAnswers).filter(v => v !== null && v !== '').length;
    const riskTitle = String(activeRisk?.nama_risiko || activeRisk?.judul || DEFAULT_RISK_TITLE);
    const riskDescription = typeof activeRisk?.deskripsi === "string" && activeRisk.deskripsi.trim()
        ? activeRisk.deskripsi
        : DEFAULT_RISK_DESCRIPTION;
    const currentRiskNumber = getCurrentRiskIndex(activeRisk, activeProgress as Record<string, any> | null) + 1;
    const totalRiskCount = typeof activeRisk?.total_risks === "number"
        ? activeRisk.total_risks
        : typeof activeProgress?.total_risks === "number"
            ? activeProgress.total_risks
            : typeof activeProgress?.total_steps === "number"
                ? activeProgress.total_steps
                : undefined;
    const progress = step === 0
        ? 0
        : typeof totalRiskCount === "number" && totalRiskCount > 0
            ? Math.round((currentRiskNumber / totalRiskCount) * 100)
            : Math.round((answeredFields / totalFields) * 100);
    const nextLabel = step === 0
        ? "Simpan & Lanjut"
        : isFinished
            ? "Survei Selesai"
            : hasNextRisk(activeRisk, activeProgress as Record<string, any> | null)
                ? "Simpan & Berikutnya"
                : "Simpan & Selesaikan";
    const pageTitle = "Survei Profil Risiko";
    const pageSubtitle = step === 0
        ? "Lengkapi informasi responden untuk memulai penilaian risiko berjenjang."
        : `Risiko ${currentRiskNumber}${typeof totalRiskCount === "number" ? ` dari ${totalRiskCount}` : ""}. Lengkapi jawaban sesuai kondisi aktual organisasi Anda.`;

    return (
        <RequireCompanyProfile>
            <div className="dashboard-page-wrap relative min-h-screen overflow-hidden font-sans">
                {/* Gradient Progress Bar */}
                <div className="fixed top-0 left-0 z-50 h-1.5 w-full" style={{ background: "var(--dashboard-progress-track)" }}>
                    <div
                        className="dashboard-primary-button h-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-20 sm:px-6 relative z-10">
                    <PageHeader
                        icon={Building2}
                        title={pageTitle}
                        subtitle={pageSubtitle}
                    />

                    <div className="w-full">

                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                                className="dashboard-section-card mb-8 rounded-[2rem] p-8 backdrop-blur-xl sm:p-10"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">

                                    <div className="dashboard-divider col-span-1 mb-2 border-b pb-4 md:col-span-2">
                                        <div className="flex items-center gap-4">
                                            <div className="dashboard-primary-button flex h-12 w-12 items-center justify-center rounded-full text-white">
                                                <UserCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold" style={{ color: "var(--dashboard-text)" }}>Detail Responden</h2>
                                                <p className="mt-0.5 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>Lengkapi profil Anda untuk memulai pengisian survei.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={LABEL_CLS}>Nama Lengkap <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={answers.responden_nama}
                                            onChange={(e) => setAnswer('responden_nama', e.target.value)}
                                            className={INPUT_CLS}
                                            placeholder="Masukkan nama lengkap Anda"
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLS}>Jabatan <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={answers.responden_jabatan}
                                            onChange={(e) => setAnswer('responden_jabatan', e.target.value)}
                                            className={INPUT_CLS}
                                            placeholder="Contoh: IT Security Manager"
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLS}>Perusahaan <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={answers.responden_perusahaan}
                                            onChange={(e) => setAnswer('responden_perusahaan', e.target.value)}
                                            className={INPUT_CLS}
                                            placeholder="Nama instansi/perusahaan"
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLS}>Sektor <span className="text-red-500">*</span></label>
                                        <p className="mb-2 flex items-center gap-1.5 text-[13px]" style={{ color: "var(--dashboard-text-muted)" }}>
                                            <Info className="h-3.5 w-3.5" style={{ color: "var(--dashboard-selection-text)" }} /> Pilih salah satu opsi yang sesuai
                                        </p>
                                        <select
                                            value={answers.responden_sektor}
                                            onChange={(e) => setAnswer('responden_sektor', e.target.value)}
                                            className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
                                        >
                                            <option value="">Harap pilih...</option>
                                            {fallbackSectors?.map((s: any) => (
                                                <option key={s.id} value={s.id}>{s.nama_sub_sektor}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={LABEL_CLS}>Email Pekerjaan <span className="text-red-500">*</span></label>
                                        <p className="mb-2 flex items-center gap-1.5 text-[13px]" style={{ color: "var(--dashboard-text-muted)" }}>
                                            <Info className="h-3.5 w-3.5" style={{ color: "var(--dashboard-selection-text)" }} /> Pastikan format email sudah benar
                                        </p>
                                        <input
                                            type="email"
                                            value={answers.responden_email}
                                            onChange={(e) => setAnswer('responden_email', e.target.value)}
                                            className={INPUT_CLS}
                                            placeholder="email@perusahaan.com"
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLS}>Nomor Telepon/Whatsapp <span className="text-red-500">*</span></label>
                                        <p className="mb-2 flex items-center gap-1.5 text-[13px]" style={{ color: "var(--dashboard-text-muted)" }}>
                                            <Info className="h-3.5 w-3.5" style={{ color: "var(--dashboard-selection-text)" }} /> Berupa angka tanpa spasi
                                        </p>
                                        <input
                                            type="tel"
                                            value={answers.responden_telepon}
                                            onChange={(e) => setAnswer('responden_telepon', e.target.value)}
                                            className={INPUT_CLS}
                                            placeholder="081234567890"
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 mt-2">
                                        <label className={LABEL_CLS}>Sertifikat atau Training Keamanan Siber yang Pernah Diikuti</label>
                                        <textarea
                                            className={`${INPUT_CLS} min-h-[120px] resize-y mt-1 transition-shadow`}
                                            value={answers.responden_sertifikat}
                                            placeholder="Contoh: CEH, CISA, CISSP, CompTIA Security+ (opsional)"
                                            onChange={(e) => setAnswer('responden_sertifikat', e.target.value)}
                                        />
                                    </div>

                                </div>
                            </motion.div>
                        )}

                        {step === 1 && !isLoadingMode && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }}
                            >
                                {/* Intro Card */}
                                    <div className="dashboard-section-emphasis relative mb-10 overflow-hidden rounded-[1.5rem] p-7 text-[15px] leading-relaxed shadow-sm backdrop-blur-md sm:p-9" style={{ color: "var(--dashboard-text-soft)" }}>
                                    <div className="relative z-10">
                                        <div className="dashboard-chip-info mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm">
                                            <AlertTriangle className="dashboard-chip-warning h-4 w-4 rounded-full border p-0.5" />
                                            Risiko {currentRiskNumber}{typeof totalRiskCount === "number" ? ` dari ${totalRiskCount}` : ""}
                                        </div>
                                        <h2 className="mb-4 text-2xl font-black tracking-tight sm:text-3xl" style={{ color: "var(--dashboard-text)" }}>
                                            {riskTitle}
                                        </h2>
                                        <p className="mb-6 text-[15px] leading-relaxed opacity-90" style={{ color: "var(--dashboard-text-soft)" }}>
                                            {riskDescription}
                                        </p>
                                        <div className="dashboard-section-card rounded-xl border p-4">
                                            <p className="flex items-start gap-3 text-sm italic opacity-95" style={{ color: "var(--dashboard-text-soft)" }}>
                                                <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--dashboard-selection-text)" }} />
                                                Sejauh mana organisasi Anda menyadari dan mengelola ancaman ini? Mohon berikan jawaban yang secara akurat merepresentasikan kondisi aktual.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {isFinished && (
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800 shadow-sm">
                                            Survei profil risiko sudah ditandai selesai. Anda masih dapat meninjau jawaban terakhir yang tersimpan.
                                        </div>
                                    )}
                                    {/* Question 1 */}
                                    <div className={`${PANEL_CLS} backdrop-blur-sm transition-all duration-300 hover:shadow-[var(--dashboard-card-hover-shadow)]`}>
                                        <p className="mb-4 flex items-start gap-2 text-base font-semibold" style={{ color: "var(--dashboard-text)" }}>
                                            <span className="text-rose-500 mt-0.5">*</span>
                                            <span>Apakah perusahaan Anda berpotensi mengalami atau pernah mengalami insiden <strong className={SELECTED_TEXT_CLS}>{riskTitle}</strong>?</span>
                                        </p>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                            {[
                                                { value: 'ya', label: 'Ya', desc: 'Berpotensi atau pernah mengalami' },
                                                { value: 'tidak', label: 'Tidak', desc: 'Sama sekali tidak berpotensi' }
                                            ].map((opt) => (
                                                <label 
                                                    key={opt.value} 
                                                    className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                                        answers.q1 === opt.value 
                                                        ? SELECTED_CARD_CLS
                                                        : 'dashboard-table-surface hover:border-[var(--dashboard-selection-border)] hover:bg-[var(--dashboard-surface)]'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-base font-bold ${answers.q1 === opt.value ? SELECTED_TEXT_CLS : ''}`} style={answers.q1 === opt.value ? undefined : { color: "var(--dashboard-text)" }}>
                                                            {opt.label}
                                                        </span>
                                                        <input
                                                            type="radio"
                                                            name="q1"
                                                            value={opt.value}
                                                            checked={answers.q1 === opt.value}
                                                            onChange={() => setAnswer('q1', opt.value)}
                                                            className="h-5 w-5 cursor-pointer"
                                                            style={{ accentColor: "var(--dashboard-focus-ring)" }}
                                                        />
                                                    </div>
                                                    <span className="text-[13px]" style={{ color: "var(--dashboard-text-muted)" }}>{opt.desc}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {answers.q1 === 'tidak' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`${PANEL_CLS} backdrop-blur-sm`}>
                                            <p className="mb-4 flex items-start gap-2 text-base font-semibold" style={{ color: "var(--dashboard-text)" }}>
                                                <span className="text-rose-500 mt-0.5">*</span>
                                                <span>Mengapa perusahaan Anda tidak berpotensi mengalami atau tidak pernah mengalami insiden <strong className={SELECTED_TEXT_CLS}>{riskTitle}</strong>?</span>
                                            </p>
                                            <textarea
                                                className={`${INPUT_CLS} min-h-[140px] resize-y`}
                                                placeholder="Berikan penjelasan Anda di sini..."
                                                value={answers.q1_alasan}
                                                onChange={(e) => setAnswer('q1_alasan', e.target.value)}
                                            />
                                        </motion.div>
                                    )}

                                    {answers.q1 === 'ya' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-8">
                                            {/* Question 2 Matrix */}
                                            <div className={`${PANEL_CLS} backdrop-blur-sm`}>
                                                <p className="mb-6 flex items-start gap-2 text-base font-semibold" style={{ color: "var(--dashboard-text)" }}>
                                                    <span className="text-rose-500 mt-0.5">*</span>
                                                    <span>Seberapa besar dampak dari <strong className={SELECTED_TEXT_CLS}>{riskTitle}</strong> pada kriteria berikut?</span>
                                                </p>
                                                <div className="dashboard-table-surface overflow-hidden rounded-xl border">
                                                    <table className="w-full text-sm min-w-[700px]">
                                                        <thead>
                                                            <tr className="dashboard-table-head dashboard-table-divider border-b">
                                                                <th className="p-4 text-left font-semibold w-[20%]">Kategori</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-emerald-600">Tidak Signifikan</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-amber-500">Cukup Signifikan</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-orange-500">Signifikan</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-rose-500">Sangat Signifikan</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="dashboard-table-divider divide-y">
                                                            {[
                                                                { id: 'reputasi', label: 'Dampak Reputasi' },
                                                                { id: 'operasional', label: 'Dampak Operasional' },
                                                                { id: 'finansial', label: 'Dampak Finansial' },
                                                                { id: 'hukum', label: 'Dampak Hukum' }
                                                            ].map((row) => (
                                                                <tr key={row.id} className="dashboard-table-row-hover transition-colors">
                                                                    <td className="dashboard-section-muted p-4 font-semibold" style={{ color: "var(--dashboard-text-soft)" }}>{row.label}</td>
                                                                    {['tidak_signifikan', 'cukup_signifikan', 'signifikan', 'sangat_signifikan'].map((val) => (
                                                                        <td key={val} className="p-4 text-center">
                                                                            <input
                                                                                type="radio"
                                                                                name={`dampak_${row.id}`}
                                                                                value={val}
                                                                                checked={answers[`dampak_${row.id}`] === val}
                                                                                onChange={() => setAnswer(`dampak_${row.id}`, val)}
                                                                                className="h-5 w-5 cursor-pointer shadow-sm"
                                                                                style={{ accentColor: "var(--dashboard-focus-ring)" }}
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Dampak Table Reference */}
                                            <div className={TABLE_PANEL_CLS} style={{ color: "var(--dashboard-text-soft)" }}>
                                                <div className="dashboard-section-muted dashboard-divider flex items-center justify-between border-b p-5 backdrop-blur-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="dashboard-icon-info flex h-8 w-8 items-center justify-center rounded-full">
                                                            <Info className="h-4 w-4" />
                                                        </div>
                                                        <h3 className="text-[15px] font-semibold tracking-wide" style={{ color: "var(--dashboard-text)" }}>Panduan Referensi Kriteria Dampak</h3>
                                                    </div>
                                                </div>
                                                <div className="dashboard-table-surface overflow-x-auto p-4 sm:p-6">
                                                    <table className="min-w-[600px] w-full overflow-hidden rounded-lg border-collapse text-[11px] ring-1 sm:text-xs lg:min-w-full lg:text-[13px]" style={{ ["--tw-ring-color" as string]: "var(--dashboard-border)" }}>
                                                        <thead>
                                                            <tr>
                                                                <th className="dashboard-table-head dashboard-table-divider border-b border-r p-3 text-left font-semibold" style={{ width: "12%", color: "var(--dashboard-text-soft)" }}>Kategori Dampak</th>
                                                                <th className="dashboard-table-divider border-b p-3 text-center font-semibold" style={{ width: "22%", background: "var(--dashboard-success-soft-bg)", color: "var(--dashboard-success-soft-fg)" }}>Tidak Signifikan (1)</th>
                                                                <th className="dashboard-table-divider border-b p-3 text-center font-semibold" style={{ width: "22%", background: "var(--dashboard-warning-soft-bg)", color: "var(--dashboard-warning-soft-fg)" }}>Cukup Signifikan (2)</th>
                                                                <th className="dashboard-table-divider border-b p-3 text-center font-semibold" style={{ width: "22%", background: "var(--dashboard-nav-warning-icon)", color: "var(--text-inverse)" }}>Signifikan (3)</th>
                                                                <th className="dashboard-table-divider border-b p-3 text-center font-semibold" style={{ width: "22%", background: "var(--dashboard-danger-soft-bg)", color: "var(--dashboard-danger-soft-fg)" }}>Sangat Signifikan (4)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {[
                                                                { title: "Reputasi", cols: ["Terdapat pemberitaan negatif kompartemen, tidak berdampak pada kepercayaan.", "Pemberitaan negatif yang memengaruhi kepercayaan sebagian kecil stakeholder.", "Pemberitaan negatif yang menurunkan kepercayaan sebagian besar stakeholder.", "Pemberitaan yang menyebabkan hilangnya kepercayaan hampir seluruh stakeholder."] },
                                                                { title: "Operasional", cols: ["Penundaan bisnis s/d 30 menit, dampak minimal.", "Penundaan 30 menit s/d 1 jam, sedikit gangguan.", "Penundaan 1 s/d 8 jam, berdampak pada produktivitas.", "Penundaan lebih dari 8 jam, gangguan operasional masif."] },
                                                                { title: "Finansial", cols: ["Kerugian tambahan s/d 5% dari revenue.", "Kerugian tambahan 6% - 10% dari revenue.", "Kerugian tambahan 11% - 20% dari revenue.", "Kerugian lebih dari 20% dari revenue."] },
                                                                { title: "Hukum", cols: ["Masalah hukum kecil, belum ada tuntutan.", "Tuntutan hukum yang berdampak kecil.", "Tuntutan memengaruhi kinerja organisasi.", "Tuntutan yang mengancam kelangsungan organisasi."] }
                                                            ].map((row, i) => (
                                                                <tr key={i} className="dashboard-table-row-hover transition-colors">
                                                                    <td className="dashboard-section-muted dashboard-table-divider border-b border-r p-3 font-medium" style={{ color: "var(--dashboard-text)" }}>{row.title}</td>
                                                                    {row.cols.map((col, j) => (
                                                                        <td key={j} className="dashboard-table-divider border-b border-r p-3" style={{ color: "var(--dashboard-text-soft)" }}>{col}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Frekuensi Section */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Kriteria Frekuensi Ref */}
                                                <div className={`${TABLE_PANEL_CLS} p-6`}>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Info className="w-5 h-5 text-indigo-500" />
                                                        <h3 className="font-semibold" style={{ color: "var(--dashboard-text)" }}>Panduan Kriteria Frekuensi</h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: 'Kecil', desc: '≤ 2 kali per tahun', color: 'dashboard-chip-success' },
                                                            { label: 'Sedang', desc: '> 2 s/d 5 kali per tahun', color: 'dashboard-chip-info' },
                                                            { label: 'Besar', desc: '> 5 s/d 10 kali per tahun', color: 'dashboard-chip-warning' },
                                                            { label: 'Sangat Besar', desc: '> 10 kali per tahun', color: 'dashboard-chip-danger' },
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="dashboard-table-surface dashboard-table-divider flex items-center justify-between rounded-xl border p-3.5 shadow-sm">
                                                                <span className={`rounded-[8px] border px-3 py-1 text-[13px] font-bold ${item.color}`}>{item.label}</span>
                                                                <span className="text-sm font-medium" style={{ color: "var(--dashboard-text-soft)" }}>{item.desc}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Question 3 Matrix (Frekuensi Input) */}
                                                <div className={`${PANEL_CLS} p-6 backdrop-blur-sm`}>
                                                    <p className="mb-6 flex items-start gap-2 text-[15px] font-semibold" style={{ color: "var(--dashboard-text)" }}>
                                                        <span className="text-rose-500 mt-0.5">*</span>
                                                        <span>Seberapa sering dalam setahun risiko <strong className={SELECTED_TEXT_CLS}>{riskTitle}</strong> ini berpotensi terjadi?</span>
                                                    </p>
                                                    <div className="space-y-3">
                                                        {[
                                                            { id: 'kecil', label: 'Kecil' },
                                                            { id: 'sedang', label: 'Sedang' },
                                                            { id: 'besar', label: 'Besar' },
                                                            { id: 'sangat_besar', label: 'Sangat Besar' }
                                                        ].map((row) => (
                                                            <label key={row.id} className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${answers.frekuensi === row.id ? SELECTED_CARD_CLS : 'dashboard-section-muted hover:border-[var(--dashboard-selection-border)] hover:bg-[var(--dashboard-surface)]'}`}>
                                                                <span className={`font-semibold ${answers.frekuensi === row.id ? SELECTED_TEXT_CLS : ''}`} style={answers.frekuensi === row.id ? undefined : { color: "var(--dashboard-text-soft)" }}>{row.label}</span>
                                                                <input
                                                                    type="radio"
                                                                    name="frekuensi"
                                                                    value={row.id}
                                                                    checked={answers.frekuensi === row.id}
                                                                    onChange={() => setAnswer('frekuensi', row.id)}
                                                                    className="h-5 w-5 shadow-sm"
                                                                    style={{ accentColor: "var(--dashboard-focus-ring)" }}
                                                                />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Question 4 & 5 */}
                                            <div className={`${PANEL_CLS} backdrop-blur-sm`}>
                                                <p className="mb-4 flex items-start gap-2 text-base font-semibold" style={{ color: "var(--dashboard-text)" }}>
                                                    <span className="text-rose-500 mt-0.5">*</span>
                                                    <span>Apakah perusahaan Anda memiliki tindakan pengendalian terhadap risiko <strong className={SELECTED_TEXT_CLS}>{riskTitle}</strong>?</span>
                                                </p>
                                                
                                                <div className="flex gap-4 mt-5 mb-8">
                                                    {[
                                                        { value: 'ya', label: 'Mempunyai Pengendalian' },
                                                        { value: 'tidak', label: 'Belum Mempunyai' }
                                                    ].map((opt) => (
                                                        <label key={opt.value} className={`flex-1 flex items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all ${answers.q4 === opt.value ? SELECTED_CARD_CLS : 'dashboard-table-surface hover:border-[var(--dashboard-selection-border)]'}`} style={{ color: answers.q4 === opt.value ? "var(--dashboard-selection-text)" : "var(--dashboard-text-soft)" }}>
                                                            <input
                                                                type="radio"
                                                                name="q4"
                                                                value={opt.value}
                                                                checked={answers.q4 === opt.value}
                                                                onChange={() => setAnswer('q4', opt.value)}
                                                                className="h-5 w-5"
                                                                style={{ accentColor: "var(--dashboard-focus-ring)" }}
                                                            />
                                                            <span className="font-semibold text-[15px]">{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <div className="dashboard-divider border-t pt-6">
                                                    <p className="mb-3 flex items-start gap-2 text-[15px] font-medium" style={{ color: "var(--dashboard-text)" }}>
                                                        <span className="text-rose-500 mt-0.5">*</span>
                                                        <span>Sebutkan tindakan pengendalian yang telah dilakukan:</span>
                                                    </p>
                                                    <textarea
                                                        className={`${INPUT_CLS} min-h-[140px] resize-y`}
                                                        placeholder="Jelaskan secara singkat. Contoh: Pengetatan akses VPN, klasifikasi data sensitif, NDAs..."
                                                        value={answers.q5}
                                                        onChange={(e) => setAnswer('q5', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Footer */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="dashboard-divider relative z-10 mt-12 mb-10 flex flex-col-reverse items-center justify-between gap-4 border-t pt-8 sm:flex-row"
                    >
                        <button
                            onClick={() => { void handlePrev(); }}
                            className={`${SECONDARY_BUTTON_CLS} ${step === 0 || isLoadingMode ? 'pointer-events-none opacity-0' : 'opacity-100'} w-full gap-2 sm:w-auto`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {hasPreviousRisk(activeRisk, activeProgress as Record<string, any> | null) ? "Risiko Sebelumnya" : "Kembali ke Responden"}
                        </button>
                        
                        <button
                            onClick={() => { void handleNext(); }}
                            disabled={saving || isLoadingMode || isFinished || (step === 0 ? !isStep0Valid : !isStep1Valid)}
                            className={`${PRIMARY_BUTTON_CLS} group w-full cursor-pointer sm:w-auto`}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {nextLabel}
                            {!saving ? <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> : null}
                        </button>
                    </motion.div>
                    </div>

                </div>
            </div>
        </RequireCompanyProfile>
    );
}
