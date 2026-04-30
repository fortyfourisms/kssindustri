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

const respondentSchema = z.object({
    responden: z.string().min(1, "Nama responden wajib diisi"),
    jabatan: z.string().min(1, "Jabatan wajib diisi"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    target_nilai: z.coerce.number().min(0, "Target nilai wajib diisi"),
    kategori_kematangan_keamanan_siber: z.string().min(1, "Kategori kematangan keamanan siber wajib diisi"),
    telepon: z.string().min(1, "Nomor telepon wajib diisi")
});

type RespondentFormValues = z.infer<typeof respondentSchema>;

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

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
                <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
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
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-3 md:p-4 shadow-sm">
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
                        className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <UserCircle2 className="w-5 h-5 text-indigo-500" /> Data Responden
                                </h2>
                            </div>

                            {/* Read-only company fields */}
                            <div>
                                <label className={LABEL_CLS}>Nama Perusahaan</label>
                                <input type="text" value={perusahaanData?.nama_perusahaan || ''} readOnly className={`${INPUT_CLS} bg-slate-50 text-slate-500`} />
                                <p className="text-xs text-slate-400 mt-1">Data dari profil perusahaan</p>
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Email</label>
                                <input type="email" value={perusahaanData?.email || ''} readOnly className={`${INPUT_CLS} bg-slate-50 text-slate-500`} />
                                <p className="text-xs text-slate-400 mt-1">Data dari profil perusahaan</p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={LABEL_CLS}>Alamat Lengkap</label>
                                <textarea rows={2} value={perusahaanData?.alamat || ''} readOnly className={`${INPUT_CLS} bg-slate-50 text-slate-500`} />
                                <p className="text-xs text-slate-400 mt-1">Data dari profil perusahaan</p>
                            </div>

                            {/* Editable respondent fields */}
                            <div>
                                <label className={LABEL_CLS}>Nama Responden <span className="text-red-500">*</span></label>
                                <input {...register("responden")} className={INPUT_CLS} placeholder="Nama lengkap" />
                                {errors.responden && <p className="text-red-500 text-xs mt-1">{errors.responden.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Jabatan <span className="text-red-500">*</span></label>
                                <input {...register("jabatan")} className={INPUT_CLS} placeholder="Jabatan" />
                                {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Nomor Telepon <span className="text-red-500">*</span></label>
                                <input type="tel" {...register("telepon")} className={INPUT_CLS} placeholder="0812345678" />
                                {errors.telepon && <p className="text-red-500 text-xs mt-1">{errors.telepon.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Tanggal Penilaian <span className="text-red-500">*</span></label>
                                <input type="date" {...register("tanggal")} className={INPUT_CLS} />
                                {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Target Nilai <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" {...register("target_nilai")} className={INPUT_CLS} placeholder="0" />
                                {errors.target_nilai && <p className="text-red-500 text-xs mt-1">{errors.target_nilai.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Target Level Kematangan <span className="text-red-500">*</span></label>
                                <input readOnly type="text" {...register("kategori_kematangan_keamanan_siber")} className={`${INPUT_CLS} bg-slate-50 text-slate-500 cursor-not-allowed select-none`} placeholder="Kategori Kematangan Keamanan Siber" />
                                {errors.kategori_kematangan_keamanan_siber && <p className="text-red-500 text-xs mt-1">{errors.kategori_kematangan_keamanan_siber.message}</p>}
                            </div>
                        </div>

                        {/* Error Banner */}
                        <AnimatePresence>
                            {storeError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{storeError}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success notice */}
                        <AnimatePresence>
                            {isEditBlockedByApproval && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-semibold">Perubahan data IKAS memerlukan persetujuan admin.</p>
                                        <p>{activeEditRequestMeta.description}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {respondentSaved && !isDirty && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="mt-5 flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium"
                                >
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    Data responden telah disimpan. Anda dapat lanjut ke penilaian.
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Unsaved changes notice */}
                        <AnimatePresence>
                            {isDirty && respondentSaved === false && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="mt-5 flex items-center gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    Ada perubahan yang belum disimpan. Klik <strong className="mx-1">Simpan Data Responden</strong> sebelum melanjutkan.
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-5 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/ikas')}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Kembali
                            </button>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Save Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !isCompanyReady || isEditBlockedByApproval}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> {canProceed ? 'Perbarui Data Responden' : 'Simpan & Lanjut ke Penilaian'}</>
                                    )}
                                </button>

                                {/* Continue Button — gated by respondentSaved */}
                                {canProceed && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={isEditBlockedByApproval}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        Lanjut ke Penilaian <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.form>
                )}

                {/* Step 2: Assessment View */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-4 md:p-6"
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
