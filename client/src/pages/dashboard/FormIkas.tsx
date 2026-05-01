import { useState, useEffect, useMemo, useRef } from "react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, ArrowRight, ArrowLeft, CheckCircle2,
    UserCircle2, Save, Loader2, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssessmentStore } from "@/stores/assessment.store";
import { useIkasStore } from "@/stores/ikas.store";
import { useIkasAssessmentSetup } from "@/hooks/useIkasAssessmentSetup";
import { ikasService } from "@/services/ikas.service";
import AssessmentView from "@/pages/dashboard/Assessment/AssessmentView";
import { useUser } from "@/hooks/useAuth";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getKategoriKematangan } from "@/types/ikas.types";
import { getIkasEditRequestStatus, getIkasEditStatusMeta } from "@/lib/ikas-edit-request";
import { AppButton, AppInput, AppTextarea, FormActions, FormGroup, StatusBanner } from "@/ui";

const respondentSchema = z.object({
    responden: z.string().min(1, "Nama responden wajib diisi"),
    jabatan: z.string().min(1, "Jabatan wajib diisi"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    target_nilai: z.coerce.number().min(0, "Target nilai wajib diisi"),
    kategori_kematangan_keamanan_siber: z.string().min(1, "Kategori kematangan keamanan siber wajib diisi"),
    telepon: z.string().min(1, "Nomor telepon wajib diisi")
});

type RespondentFormValues = z.infer<typeof respondentSchema>;

const PANEL_CLS = "dashboard-section-card rounded-2xl border p-6 shadow-[0_24px_54px_rgba(148,163,184,0.18)]";
const PANEL_SOFT_CLS = "dashboard-surface rounded-2xl border p-4 shadow-sm";
const PANEL_HEADER_CLS = "dashboard-divider col-span-1 border-b pb-2 md:col-span-2";

function resolveCompanyId(...candidates: Array<unknown>) {
    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined) continue;
        const value = String(candidate).trim();
        if (value) return value;
    }
    return "";
}

function extractYear(value: string | null | undefined): number | null {
    if (!value) return null;
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct.getFullYear();

    const parts = String(value).split(/[-/]/);
    if (parts.length === 3) {
        const first = Number.parseInt(parts[0], 10);
        const last = Number.parseInt(parts[2], 10);
        if (!Number.isNaN(first) && first > 1900) return first;
        if (!Number.isNaN(last) && last > 1900) return last;
    }
    return null;
}

function normalizeDateInput(value: string | null | undefined) {
    if (!value) return new Date().toISOString().split('T')[0];
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct.toISOString().split('T')[0];
    return value;
}

function getVerificationStatus(raw: Record<string, any> | null | undefined) {
    if (typeof raw?.is_validated === "boolean") {
        return raw.is_validated ? "Terverifikasi" : "Menunggu verifikasi";
    }

    const value = String(
        raw?.status_verifikasi ??
        raw?.verifikasi ??
        raw?.validasi ??
        raw?.status ??
        ""
    ).trim().toLowerCase();

    if (!value) return "Belum diverifikasi";
    if (value.includes("tolak") || value.includes("reject") || value.includes("revisi")) return "Perlu revisi";
    if (value.includes("verif") || value.includes("valid") || value.includes("approve") || value.includes("setuju")) return "Terverifikasi";
    return "Menunggu verifikasi";
}

export default function FormIkas() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const lastHydratedYearRef = useRef<number | null>(null);

    // ── Assessment store ────────────────────────────────────────────────────────
    const saveRespondentProfile = useAssessmentStore(state => state.saveRespondentProfile);
    const respondentProfile = useAssessmentStore(state => state.respondentProfile);
    const setCurrentStakeholder = useAssessmentStore(state => state.setCurrentStakeholder);
    const setExistingIkasId = useAssessmentStore(state => state.setExistingIkasId);
    const existingIkasId = useAssessmentStore(state => state.existingIkasId);
    const initialized = useAssessmentStore(state => state.initialized);
    const initializeStore = useAssessmentStore(state => state.initialize);

    // ── IKAS store (respondent gating) ──────────────────────────────────────────
    const saveRespondent = useIkasStore(state => state.saveRespondent);
    const respondentSaved = useIkasStore(state => state.respondentSaved);
    const setRespondentSaved = useIkasStore(state => state.setRespondentSaved);
    const resetRespondentSaved = useIkasStore(state => state.resetRespondentSaved);
    const isLoading = useIkasStore(state => state.isLoading);
    const storeError = useIkasStore(state => state.error);

    // ── Company data ────────────────────────────────────────────────────────────
    const { data: meData } = useUser();
    const perusahaanId = resolveCompanyId(meData?.id_perusahaan, meData?.perusahaan?.id);
    const { perusahaan } = useCompanyProfile(meData);
    const perusahaanData = perusahaan ?? null;

    // ── Assessment setup from API (questions + existing answers) ───────────────
    const {
        assessmentData,
        answerMap,
        jawabanIdMap,
        hasExistingAnswers,
        isLoading: setupLoading,
    } = useIkasAssessmentSetup();

    // Sync questions structure into store
    const setAssessmentStructure = useAssessmentStore(state => state.setAssessmentStructure);
    const hydrateAnswers         = useAssessmentStore(state => state.hydrateAnswers);

    useEffect(() => {
        if (assessmentData) {
            setAssessmentStructure(assessmentData);
        }
    }, [assessmentData, setAssessmentStructure]);

    // Hydrate existing answers from DB into store once
    useEffect(() => {
        if (hasExistingAnswers && Object.keys(answerMap).length > 0) {
            hydrateAnswers(answerMap);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasExistingAnswers]);

    // ── Initialize store & stakeholder ─────────────────────────────────────────
    useEffect(() => {
        if (!initialized) {
            initializeStore();
        }
        setCurrentStakeholder('draft-ikas');
    }, [initialized, initializeStore, setCurrentStakeholder]);

    // ── React Hook Form ─────────────────────────────────────────────────────────
    const { register, handleSubmit, watch, reset, setValue, getValues, formState: { errors, isDirty } } = useForm<RespondentFormValues>({
        resolver: zodResolver(respondentSchema),
        defaultValues: {
            responden: respondentProfile()?.responden || "",
            telepon: respondentProfile()?.telepon || "",
            target_nilai: respondentProfile()?.target_nilai || 0,
            tanggal: respondentProfile()?.tanggal || new Date().toISOString().split('T')[0],
            jabatan: respondentProfile()?.jabatan || "",
            kategori_kematangan_keamanan_siber: respondentProfile()?.kategori_kematangan_keamanan_siber || "",
        }
    });

    const watchedTanggal = watch("tanggal");
    const watchedTargetNilai = watch("target_nilai");
    const selectedYear = useMemo(() => extractYear(watchedTanggal), [watchedTanggal]);
    const respondentCompanyId = resolveCompanyId(
        perusahaanData?.id,
        perusahaanId,
        respondentProfile()?.id_perusahaan,
    );

    useEffect(() => {
        const score = Number(watchedTargetNilai) || 0;
        const kategori = getKategoriKematangan(score);
        if (getValues("kategori_kematangan_keamanan_siber") !== kategori) {
            setValue("kategori_kematangan_keamanan_siber", kategori, { shouldDirty: false, shouldValidate: true });
        }
    }, [watchedTargetNilai, getValues, setValue]);

    // ── Fetch existing IKAS records from backend (for respondent pre-fill) ──────
    const { data: myIkasData, isLoading: listLoading } = useQuery({
        queryKey: ["my-ikas", respondentCompanyId || perusahaanId || "unknown"],
        queryFn: () => ikasService.getMyIkas(respondentCompanyId || perusahaanId),
        staleTime: 1000 * 60 * 2,
        enabled: !!(respondentCompanyId || perusahaanId),
    });

    const myIkasList = useMemo(() => (
        myIkasData
            ? (Array.isArray(myIkasData) ? myIkasData : [myIkasData])
            : []
    ), [myIkasData]);

    const scopedIkasList = useMemo(() => (
        myIkasList.filter((item: any) => {
            const itemCompanyId = resolveCompanyId(item?.id_perusahaan, item?.perusahaan?.id);
            return !respondentCompanyId || itemCompanyId === respondentCompanyId;
        })
    ), [myIkasList, respondentCompanyId]);

    const latestIkasRecord = useMemo(() => {
        if (scopedIkasList.length === 0) return null;
        return scopedIkasList.reduce((prev: any, curr: any) => {
            const prevDate = new Date(prev.updated_at ?? prev.created_at ?? prev.tanggal ?? 0).getTime();
            const currDate = new Date(curr.updated_at ?? curr.created_at ?? curr.tanggal ?? 0).getTime();
            return currDate > prevDate ? curr : prev;
        }, scopedIkasList[0]);
    }, [scopedIkasList]);

    const matchingYearIkasRecord = useMemo(() => {
        if (selectedYear === null) return null;
        return scopedIkasList.find((item: any) => extractYear(item?.tanggal ?? item?.created_at) === selectedYear) ?? null;
    }, [scopedIkasList, selectedYear]);
    const activeIkasRecord = useMemo(
        () => matchingYearIkasRecord ?? (selectedYear === null ? latestIkasRecord : null),
        [matchingYearIkasRecord, selectedYear, latestIkasRecord]
    );
    const activeVerificationStatus = useMemo(() => getVerificationStatus(activeIkasRecord), [activeIkasRecord]);
    const activeEditRequestStatus = useMemo(() => getIkasEditRequestStatus(activeIkasRecord), [activeIkasRecord]);
    const activeEditRequestMeta = useMemo(() => getIkasEditStatusMeta(activeEditRequestStatus), [activeEditRequestStatus]);
    const isEditBlockedByApproval = !!activeIkasRecord
        && activeVerificationStatus === "Terverifikasi"
        && activeEditRequestStatus !== "approved";

    // ── Detect existing record → set existingIkasId ────────────────────────────
    useEffect(() => {
        if (listLoading) return;
        if (matchingYearIkasRecord?.id) {
            setExistingIkasId(String(matchingYearIkasRecord.id));
        } else {
            setExistingIkasId(null);
        }
    }, [listLoading, matchingYearIkasRecord, setExistingIkasId]);

    // ── Pre-fill respondent form from API data ─────────────────────────────────
    useEffect(() => {
        if (listLoading) return;
        const sourceRecord = matchingYearIkasRecord ?? (selectedYear === null ? latestIkasRecord : null);
        if (!sourceRecord) return;

        const sourceYear = extractYear(sourceRecord.tanggal ?? sourceRecord.created_at);
        if (sourceYear !== null && lastHydratedYearRef.current === sourceYear && isDirty) return;

        reset({
            responden: sourceRecord.responden ?? "",
            telepon: sourceRecord.telepon ?? "",
            target_nilai: sourceRecord.target_nilai ?? 0,
            tanggal: normalizeDateInput(sourceRecord.tanggal),
            jabatan: sourceRecord.jabatan ?? "",
            kategori_kematangan_keamanan_siber: sourceRecord.kategori_kematangan_keamanan_siber ?? "",
        });
        lastHydratedYearRef.current = sourceYear;
        setRespondentSaved(Boolean(matchingYearIkasRecord));
    }, [listLoading, reset, matchingYearIkasRecord, latestIkasRecord, selectedYear, setRespondentSaved, isDirty]);

    // ── If existing answers found in DB, also mark respondent saved ───────────
    useEffect(() => {
        if (!setupLoading && hasExistingAnswers) {
            setRespondentSaved(true);
        }
    }, [setupLoading, hasExistingAnswers, setRespondentSaved]);

    // ── When form is dirty (user edited), reset respondentSaved ───────────────
    useEffect(() => {
        if (isDirty) {
            resetRespondentSaved();
        }
    }, [isDirty, resetRespondentSaved]);

    // ── Submit: POST or PUT respondent data ────────────────────────────────────
    const onSubmit = async (data: RespondentFormValues) => {
        if (isEditBlockedByApproval) {
            toast({
                title: "Perubahan data masih terkunci",
                description: "Data IKAS yang sudah terverifikasi hanya dapat diedit setelah pengajuan perubahan disetujui admin.",
                variant: "destructive",
            });
            return;
        }

        const resolvedPerusahaanId = resolveCompanyId(
            perusahaanData?.id,
            perusahaanId,
            meData?.id_perusahaan,
            meData?.perusahaan?.id,
            respondentProfile()?.id_perusahaan,
            scopedIkasList[0]?.id_perusahaan,
            scopedIkasList[0]?.perusahaan?.id,
        );

        if (!resolvedPerusahaanId) {
            toast({
                title: "Data perusahaan belum siap",
                description: "ID perusahaan tidak ditemukan. Lengkapi atau muat ulang profil perusahaan lalu coba lagi.",
                variant: "destructive",
            });
            return;
        }

        const respondentPayload = {
            ...data,
            id_perusahaan: resolvedPerusahaanId,
        };

        const result = await saveRespondent(respondentPayload, existingIkasId);

        if (!result.success) {
            toast({
                title: "Gagal menyimpan",
                description: result.error ?? "Terjadi kesalahan, coba lagi.",
                variant: "destructive",
            });
            return;
        }

        // Sync to assessment store (for AssessmentView usage)
        saveRespondentProfile({
            ...respondentPayload,
            updated_at: new Date().toISOString(),
            email: perusahaanData?.email,
            alamat: perusahaanData?.alamat,
            nama_perusahaan: perusahaanData?.nama_perusahaan,
        });

        reset(data);

        // Update existingIkasId if this was a new record
        if (!existingIkasId && result.data?.id) {
            setExistingIkasId(String(result.data.id));
        }

        // Invalidate cache so pre-fill reflects the latest saved data
        await queryClient.invalidateQueries({ queryKey: ["my-ikas", resolvedPerusahaanId] });

        toast({
            title: "Berhasil disimpan",
            description: existingIkasId
                ? "Data responden berhasil diperbarui."
                : "Data responden berhasil disimpan.",
        });

        setStep(2);
    };

    // ── Derived UI state ───────────────────────────────────────────────────────
    const isEditMode = !!existingIkasId;
    const canProceed = respondentSaved && !isDirty;
    const isCompanyReady = !!respondentCompanyId;

    useEffect(() => {
        if (isEditBlockedByApproval && step !== 1) {
            setStep(1);
        }
    }, [isEditBlockedByApproval, step]);

    return (
        <RequireCompanyProfile>
            <div className="max-w-7xl mx-auto space-y-6 pb-12">

                {/* Header Info */}
                <div className={`${PANEL_SOFT_CLS} flex flex-col items-start gap-3 md:p-5 sm:flex-row sm:items-center`}>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 font-display text-xl">
                            {step === 1 ? 'Data Responden' : 'Penilaian IKAS'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {step === 1
                                ? (isEditMode ? 'Edit informasi responden untuk penilaian IKAS.' : 'Lengkapi informasi instansi dan sistem elektronik yang akan dinilai.')
                                : 'Jawab pertanyaan penilaian keamanan siber.'}
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className={`${PANEL_SOFT_CLS} backdrop-blur-md p-3 md:p-4`}>
                    <div className="flex items-center justify-center gap-4 relative">
                        {/* Connecting line */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-slate-200 rounded -z-10">
                            <div className={`h-full bg-blue-500 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
                        </div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center gap-2 bg-white px-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 1 ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                            </div>
                            <span className={`text-xs font-bold leading-none ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Responden</span>
                        </div>

                        <div className="w-16"></div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center gap-2 bg-white px-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 2 ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                2
                            </div>
                            <span className={`text-xs font-bold leading-none ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>Penilaian</span>
                        </div>
                    </div>
                </div>

                {/* Step 1: Respondent Form */}
                {step === 1 && (
                    <motion.form
                        onSubmit={handleSubmit(onSubmit)}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className={PANEL_CLS}
                    >
                        <FormGroup className="gap-6">

                            <div className={PANEL_HEADER_CLS}>
                                <h2 className="flex items-center gap-2 font-bold text-[var(--dashboard-text)]">
                                    <UserCircle2 className="w-5 h-5 text-indigo-500" /> Data Responden
                                </h2>
                            </div>

                            <AppInput
                                label="Nama Perusahaan"
                                value={perusahaanData?.nama_perusahaan || ""}
                                readOnly
                                helperText="Data dari profil perusahaan"
                            />

                            <AppInput
                                label="Email"
                                type="email"
                                value={perusahaanData?.email || ""}
                                readOnly
                                helperText="Data dari profil perusahaan"
                            />

                            <AppTextarea
                                label="Alamat Lengkap"
                                value={perusahaanData?.alamat || ""}
                                readOnly
                                rows={2}
                                helperText="Data dari profil perusahaan"
                                containerClassName="col-span-1 md:col-span-2"
                                className="min-h-[88px]"
                            />

                            <AppInput
                                label={<>Nama Responden <span className="text-red-500">*</span></>}
                                placeholder="Nama lengkap"
                                error={errors.responden?.message}
                                {...register("responden")}
                            />

                            <AppInput
                                label={<>Jabatan <span className="text-red-500">*</span></>}
                                placeholder="Jabatan"
                                error={errors.jabatan?.message}
                                {...register("jabatan")}
                            />

                            <AppInput
                                label={<>Nomor Telepon <span className="text-red-500">*</span></>}
                                type="tel"
                                placeholder="0812345678"
                                error={errors.telepon?.message}
                                {...register("telepon")}
                            />

                            <AppInput
                                label={<>Tanggal Penilaian <span className="text-red-500">*</span></>}
                                type="date"
                                error={errors.tanggal?.message}
                                {...register("tanggal")}
                            />

                            <AppInput
                                label={<>Target Nilai <span className="text-red-500">*</span></>}
                                type="number"
                                step="0.01"
                                placeholder="0"
                                error={errors.target_nilai?.message}
                                {...register("target_nilai")}
                            />

                            <AppInput
                                label={<>Target Level Kematangan <span className="text-red-500">*</span></>}
                                readOnly
                                placeholder="Kategori Kematangan Keamanan Siber"
                                error={errors.kategori_kematangan_keamanan_siber?.message}
                                className="select-none"
                                {...register("kategori_kematangan_keamanan_siber")}
                            />
                        </FormGroup>

                        {/* Error Banner */}
                        <AnimatePresence>
                            {storeError && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5">
                                    <StatusBanner variant="danger" description={storeError} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success notice */}
                        <AnimatePresence>
                            {isEditBlockedByApproval && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5">
                                    <StatusBanner
                                        variant="warning"
                                        title="Perubahan data IKAS memerlukan persetujuan admin."
                                        description={activeEditRequestMeta.description}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {respondentSaved && !isDirty && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5">
                                    <StatusBanner variant="success" description="Data responden telah disimpan. Anda dapat lanjut ke penilaian." />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Unsaved changes notice */}
                        <AnimatePresence>
                            {isDirty && respondentSaved === false && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5">
                                    <StatusBanner
                                        variant="warning"
                                        description={<>Ada perubahan yang belum disimpan. Klik <strong className="mx-1">Simpan Data Responden</strong> sebelum melanjutkan.</>}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <FormActions>
                            <AppButton
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/dashboard/ikas')}
                                leftIcon={<ArrowLeft className="w-4 h-4" />}
                            >
                                Kembali
                            </AppButton>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Save Button */}
                                <AppButton
                                    type="submit"
                                    disabled={isLoading || !isCompanyReady || isEditBlockedByApproval}
                                    loading={isLoading}
                                    leftIcon={!isLoading ? <Save className="w-4 h-4" /> : undefined}
                                >
                                    {canProceed ? 'Perbarui Data Responden' : 'Simpan & Lanjut ke Penilaian'}
                                </AppButton>

                                {/* Continue Button — gated by respondentSaved */}
                                {canProceed && (
                                    <AppButton
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={isEditBlockedByApproval}
                                        variant="outline"
                                        rightIcon={<ArrowRight className="w-4 h-4" />}
                                    >
                                        Lanjut ke Penilaian
                                    </AppButton>
                                )}
                            </div>
                        </FormActions>
                    </motion.form>
                )}

                {/* Step 2: Assessment View */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className={`${PANEL_CLS} p-4 md:p-6`}
                    >
                        <AssessmentView
                            onBack={() => navigate('/dashboard/ikas')}
                            onEdit={() => setStep(1)}
                            embedded={true}
                            jawabanIdMap={jawabanIdMap}
                        />
                    </motion.div>
                )}

            </div>
        </RequireCompanyProfile>
    );
}
