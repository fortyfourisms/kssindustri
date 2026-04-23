import { useState, useEffect } from "react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { Info, UserCircle2, ArrowRight, ArrowLeft, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { useSurveyStore } from "@/stores/survey.store";
import { useToast } from "@/hooks/use-toast";
import type { SurveyRiskResponse, SurveyScaleValue, UpsertSurveyRespondentPayload } from "@/types/survey.types";

const INPUT_CLS = "w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/60 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-slate-300 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.03)]";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-2 tracking-wide";
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

    useEffect(() => {
        if (!user?.email) return;
        void hydrateByEmail(user.email);
    }, [user?.email, hydrateByEmail]);

    useEffect(() => {
        if (!currentRespondent && !currentRisk) return;

        setAnswers({
            ...DEFAULT_ANSWERS,
            responden_nama: currentRespondent?.nama_lengkap || DEFAULT_ANSWERS.responden_nama,
            responden_jabatan: currentRespondent?.jabatan || DEFAULT_ANSWERS.responden_jabatan,
            responden_perusahaan: currentRespondent?.perusahaan || DEFAULT_ANSWERS.responden_perusahaan,
            responden_email: currentRespondent?.email || DEFAULT_ANSWERS.responden_email,
            responden_telepon: currentRespondent?.no_telepon || DEFAULT_ANSWERS.responden_telepon,
            responden_sektor: currentRespondent?.sektor || DEFAULT_ANSWERS.responden_sektor,
            responden_sertifikat: currentRespondent?.sertifikat_training || DEFAULT_ANSWERS.responden_sertifikat,
            q1: typeof currentRisk?.pernah_terjadi === "boolean" ? (currentRisk.pernah_terjadi ? "ya" : "tidak") : DEFAULT_ANSWERS.q1,
            q1_alasan: typeof currentRisk?.alasan === "string" ? currentRisk.alasan : DEFAULT_ANSWERS.q1_alasan,
            dampak_reputasi: typeof currentRisk?.dampak_reputasi === "number" ? (API_TO_IMPACT[currentRisk.dampak_reputasi] || DEFAULT_ANSWERS.dampak_reputasi) : DEFAULT_ANSWERS.dampak_reputasi,
            dampak_operasional: typeof currentRisk?.dampak_operasional === "number" ? (API_TO_IMPACT[currentRisk.dampak_operasional] || DEFAULT_ANSWERS.dampak_operasional) : DEFAULT_ANSWERS.dampak_operasional,
            dampak_finansial: typeof currentRisk?.dampak_finansial === "number" ? (API_TO_IMPACT[currentRisk.dampak_finansial] || DEFAULT_ANSWERS.dampak_finansial) : DEFAULT_ANSWERS.dampak_finansial,
            dampak_hukum: typeof currentRisk?.dampak_hukum === "number" ? (API_TO_IMPACT[currentRisk.dampak_hukum] || DEFAULT_ANSWERS.dampak_hukum) : DEFAULT_ANSWERS.dampak_hukum,
            frekuensi: typeof currentRisk?.frekuensi === "number" ? (API_TO_FREQUENCY[currentRisk.frekuensi] || DEFAULT_ANSWERS.frekuensi) : DEFAULT_ANSWERS.frekuensi,
            q4: typeof currentRisk?.ada_pengendalian === "boolean" ? (currentRisk.ada_pengendalian ? "ya" : "tidak") : DEFAULT_ANSWERS.q4,
            q5: typeof currentRisk?.deskripsi_pengendalian === "string" ? currentRisk.deskripsi_pengendalian : DEFAULT_ANSWERS.q5,
        });

        if (currentRespondent || currentRisk) {
            setStep(1);
        }
    }, [currentRespondent, currentRisk]);

    useEffect(() => {
        setIsFinished(Boolean(progressState?.completed || progressState?.finished_at));
    }, [progressState]);

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
    const progress = step === 0 ? 0 : Math.round((answeredFields / totalFields) * 100);
    const riskTitle = String(currentRisk?.nama_risiko || currentRisk?.judul || DEFAULT_RISK_TITLE);
    const riskDescription = typeof currentRisk?.deskripsi === "string" && currentRisk.deskripsi.trim()
        ? currentRisk.deskripsi
        : DEFAULT_RISK_DESCRIPTION;
    const currentRiskNumber = getCurrentRiskIndex(currentRisk, progressState as Record<string, any> | null) + 1;
    const totalRiskCount = typeof currentRisk?.total_risks === "number"
        ? currentRisk.total_risks
        : typeof progressState?.total_risks === "number"
            ? progressState.total_risks
            : typeof progressState?.total_steps === "number"
                ? progressState.total_steps
                : undefined;
    const nextLabel = step === 0
        ? "Simpan & Lanjut"
        : isFinished
            ? "Survei Selesai"
            : hasNextRisk(currentRisk, progressState as Record<string, any> | null)
                ? "Simpan & Berikutnya"
                : "Simpan & Selesaikan";

    return (
        <RequireCompanyProfile>
            <div className="min-h-screen bg-indigo-50/20 pb-24 font-sans relative overflow-hidden">
                {/* Gradient Progress Bar */}
                <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200/50 z-50">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="max-w-[55rem] mx-auto px-4 sm:px-6 mt-20 relative z-10">
                    {/* Header Details */}
                    <div className="text-center mb-10">
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-4 rounded-full bg-blue-100/60 border border-blue-200/60 text-blue-800 text-[11px] font-bold tracking-widest uppercase shadow-sm">
                                {step === 0 ? <UserCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                {step === 0 ? "Survei Profil Risiko" : "Penilaian Risiko Berjenjang"}
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                {step === 0 ? "Informasi Responden" : riskTitle}
                            </h1>
                            {step === 1 && (
                                <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
                                    {riskDescription}
                                </p>
                            )}
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                                className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 mb-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">

                                    <div className="col-span-1 md:col-span-2 pb-4 border-b border-slate-100 mb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                                                <UserCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">Detail Responden</h2>
                                                <p className="text-sm text-slate-500 mt-0.5">Lengkapi profil Anda untuk memulai pengisian survei.</p>
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
                                        <p className="text-[13px] text-slate-500 mb-2 flex items-center gap-1.5">
                                            <Info className="w-3.5 h-3.5 text-blue-500" /> Pilih salah satu opsi yang sesuai
                                        </p>
                                        <select
                                            value={answers.responden_sektor}
                                            onChange={(e) => setAnswer('responden_sektor', e.target.value)}
                                            className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
                                        >
                                            <option value="">Harap pilih...</option>
                                            {subSektors?.map((s: any) => (
                                                <option key={s.id} value={s.id}>{s.nama_sub_sektor}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={LABEL_CLS}>Email Pekerjaan <span className="text-red-500">*</span></label>
                                        <p className="text-[13px] text-slate-500 mb-2 flex items-center gap-1.5">
                                            <Info className="w-3.5 h-3.5 text-blue-500" /> Pastikan format email sudah benar
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
                                        <p className="text-[13px] text-slate-500 mb-2 flex items-center gap-1.5">
                                            <Info className="w-3.5 h-3.5 text-blue-500" /> Berupa angka tanpa spasi
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

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }}
                            >
                                {/* Intro Card */}
                                <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border border-blue-100/70 rounded-[1.5rem] p-7 sm:p-9 mb-10 text-[15px] text-slate-700 leading-relaxed shadow-sm relative overflow-hidden backdrop-blur-md">
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-blue-100/80 text-blue-700 font-semibold text-sm mb-6">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            Risiko {currentRiskNumber}{typeof totalRiskCount === "number" ? ` dari ${totalRiskCount}` : ""}
                                        </div>
                                        <p className="mb-4 text-slate-800 font-medium text-lg leading-snug">{riskTitle}</p>
                                        <p className="mb-4 text-[15px] opacity-90 leading-relaxed">{riskDescription}</p>
                                        <div className="bg-white/60 rounded-xl p-4 mt-6 border border-white">
                                            <p className="opacity-95 italic text-sm text-slate-600 flex gap-3 items-start">
                                                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
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
                                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all duration-300">
                                        <p className="text-base font-semibold text-slate-800 mb-4 flex items-start gap-2">
                                            <span className="text-rose-500 mt-0.5">*</span>
                                            <span>Apakah perusahaan Anda berpotensi mengalami atau pernah mengalami insiden <strong className="text-blue-700">{riskTitle}</strong>?</span>
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
                                                        ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                                                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-base font-bold ${answers.q1 === opt.value ? 'text-blue-700' : 'text-slate-800'}`}>
                                                            {opt.label}
                                                        </span>
                                                        <input
                                                            type="radio"
                                                            name="q1"
                                                            value={opt.value}
                                                            checked={answers.q1 === opt.value}
                                                            onChange={() => setAnswer('q1', opt.value)}
                                                            className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <span className="text-[13px] text-slate-500">{opt.desc}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {answers.q1 === 'tidak' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.02)]">
                                            <p className="text-base font-semibold text-slate-800 mb-4 flex items-start gap-2">
                                                <span className="text-rose-500 mt-0.5">*</span>
                                                <span>Mengapa perusahaan Anda tidak berpotensi mengalami atau tidak pernah mengalami insiden <strong className="text-blue-700">{riskTitle}</strong>?</span>
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
                                            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.02)]">
                                                <p className="text-base font-semibold text-slate-800 mb-6 flex items-start gap-2">
                                                    <span className="text-rose-500 mt-0.5">*</span>
                                                    <span>Seberapa besar dampak dari <strong className="text-blue-700">{riskTitle}</strong> pada kriteria berikut?</span>
                                                </p>
                                                <div className="overflow-hidden rounded-xl border border-slate-200/80">
                                                    <table className="w-full text-sm min-w-[700px]">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                                                <th className="p-4 text-left font-semibold w-[20%]">Kategori</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-emerald-600">Tidak Signifikan</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-amber-500">Cukup Signifikan</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-orange-500">Signifikan</th>
                                                                <th className="p-4 text-center font-medium w-[20%] text-rose-500">Sangat Signifikan</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {[
                                                                { id: 'reputasi', label: 'Dampak Reputasi' },
                                                                { id: 'operasional', label: 'Dampak Operasional' },
                                                                { id: 'finansial', label: 'Dampak Finansial' },
                                                                { id: 'hukum', label: 'Dampak Hukum' }
                                                            ].map((row) => (
                                                                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                                                    <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">{row.label}</td>
                                                                    {['tidak_signifikan', 'cukup_signifikan', 'signifikan', 'sangat_signifikan'].map((val) => (
                                                                        <td key={val} className="p-4 text-center">
                                                                            <input
                                                                                type="radio"
                                                                                name={`dampak_${row.id}`}
                                                                                value={val}
                                                                                checked={answers[`dampak_${row.id}`] === val}
                                                                                onChange={() => setAnswer(`dampak_${row.id}`, val)}
                                                                                className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer shadow-sm"
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
                                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-slate-700">
                                                <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-zinc-100/50 backdrop-blur-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Info className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <h3 className="font-semibold text-slate-800 text-[15px] tracking-wide">Panduan Referensi Kriteria Dampak</h3>
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto p-4 sm:p-6 bg-white">
                                                    <table className="w-full text-[11px] sm:text-xs lg:text-[13px] border-collapse min-w-[600px] lg:min-w-full rounded-lg overflow-hidden ring-1 ring-slate-200">
                                                        <thead>
                                                            <tr>
                                                                <th className="bg-slate-100 text-slate-700 p-3 text-left w-[12%] border-b border-r border-slate-200 font-semibold">Kategori Dampak</th>
                                                                <th className="bg-[#10b981]/10 text-emerald-700 p-3 text-center w-[22%] border-b border-slate-200 font-semibold">Tidak Signifikan (1)</th>
                                                                <th className="bg-[#fbbf24]/10 text-amber-700 p-3 text-center w-[22%] border-b border-slate-200 font-semibold">Cukup Signifikan (2)</th>
                                                                <th className="bg-[#f97316]/10 text-orange-700 p-3 text-center w-[22%] border-b border-slate-200 font-semibold">Signifikan (3)</th>
                                                                <th className="bg-[#ef4444]/10 text-rose-700 p-3 text-center w-[22%] border-b border-slate-200 font-semibold">Sangat Signifikan (4)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {[
                                                                { title: "Reputasi", cols: ["Terdapat pemberitaan negatif kompartemen, tidak berdampak pada kepercayaan.", "Pemberitaan negatif yang memengaruhi kepercayaan sebagian kecil stakeholder.", "Pemberitaan negatif yang menurunkan kepercayaan sebagian besar stakeholder.", "Pemberitaan yang menyebabkan hilangnya kepercayaan hampir seluruh stakeholder."] },
                                                                { title: "Operasional", cols: ["Penundaan bisnis s/d 30 menit, dampak minimal.", "Penundaan 30 menit s/d 1 jam, sedikit gangguan.", "Penundaan 1 s/d 8 jam, berdampak pada produktivitas.", "Penundaan lebih dari 8 jam, gangguan operasional masif."] },
                                                                { title: "Finansial", cols: ["Kerugian tambahan s/d 5% dari revenue.", "Kerugian tambahan 6% - 10% dari revenue.", "Kerugian tambahan 11% - 20% dari revenue.", "Kerugian lebih dari 20% dari revenue."] },
                                                                { title: "Hukum", cols: ["Masalah hukum kecil, belum ada tuntutan.", "Tuntutan hukum yang berdampak kecil.", "Tuntutan memengaruhi kinerja organisasi.", "Tuntutan yang mengancam kelangsungan organisasi."] }
                                                            ].map((row, i) => (
                                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                                    <td className="p-3 bg-slate-50 border-r border-slate-200 border-b border-slate-100 font-medium text-slate-800">{row.title}</td>
                                                                    {row.cols.map((col, j) => (
                                                                        <td key={j} className="p-3 border-b border-slate-100 border-r border-slate-100/50 text-slate-600">{col}</td>
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
                                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Info className="w-5 h-5 text-indigo-500" />
                                                        <h3 className="font-semibold text-slate-800">Panduan Kriteria Frekuensi</h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: 'Kecil', desc: '≤ 2 kali per tahun', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                                                            { label: 'Sedang', desc: '> 2 s/d 5 kali per tahun', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                                                            { label: 'Besar', desc: '> 5 s/d 10 kali per tahun', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                                                            { label: 'Sangat Besar', desc: '> 10 kali per tahun', color: 'bg-rose-100 text-rose-700 border-rose-200' },
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                                <span className={`px-3 py-1 rounded-[8px] text-[13px] font-bold border ${item.color}`}>{item.label}</span>
                                                                <span className="text-sm text-slate-600 font-medium">{item.desc}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Question 3 Matrix (Frekuensi Input) */}
                                                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_25px_rgb(0,0,0,0.02)]">
                                                    <p className="text-[15px] font-semibold text-slate-800 mb-6 flex items-start gap-2">
                                                        <span className="text-rose-500 mt-0.5">*</span>
                                                        <span>Seberapa sering dalam setahun risiko <strong className="text-blue-700">{riskTitle}</strong> ini berpotensi terjadi?</span>
                                                    </p>
                                                    <div className="space-y-3">
                                                        {[
                                                            { id: 'kecil', label: 'Kecil' },
                                                            { id: 'sedang', label: 'Sedang' },
                                                            { id: 'besar', label: 'Besar' },
                                                            { id: 'sangat_besar', label: 'Sangat Besar' }
                                                        ].map((row) => (
                                                            <label key={row.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.frekuensi === row.id ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white'}`}>
                                                                <span className={`font-semibold ${answers.frekuensi === row.id ? 'text-blue-700' : 'text-slate-700'}`}>{row.label}</span>
                                                                <input
                                                                    type="radio"
                                                                    name="frekuensi"
                                                                    value={row.id}
                                                                    checked={answers.frekuensi === row.id}
                                                                    onChange={() => setAnswer('frekuensi', row.id)}
                                                                    className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 shadow-sm"
                                                                />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Question 4 & 5 */}
                                            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.02)]">
                                                <p className="text-base font-semibold text-slate-800 mb-4 flex items-start gap-2">
                                                    <span className="text-rose-500 mt-0.5">*</span>
                                                    <span>Apakah perusahaan Anda memiliki tindakan pengendalian terhadap risiko <strong className="text-blue-700">{riskTitle}</strong>?</span>
                                                </p>
                                                
                                                <div className="flex gap-4 mt-5 mb-8">
                                                    {[
                                                        { value: 'ya', label: 'Mempunyai Pengendalian' },
                                                        { value: 'tidak', label: 'Belum Mempunyai' }
                                                    ].map((opt) => (
                                                        <label key={opt.value} className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers.q4 === opt.value ? 'border-blue-500 bg-blue-50/40 shadow-sm text-blue-700' : 'border-slate-200 bg-white hover:border-blue-200 text-slate-700'}`}>
                                                            <input
                                                                type="radio"
                                                                name="q4"
                                                                value={opt.value}
                                                                checked={answers.q4 === opt.value}
                                                                onChange={() => setAnswer('q4', opt.value)}
                                                                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="font-semibold text-[15px]">{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <div className="pt-6 border-t border-slate-100">
                                                    <p className="text-[15px] font-medium text-slate-800 mb-3 flex items-start gap-2">
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
                        className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-12 mb-10 pt-8 border-t border-slate-200/60 relative z-10"
                    >
                        <button
                            onClick={() => { void handlePrev(); }}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border ${step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} bg-white border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm w-full sm:w-auto`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {hasPreviousRisk(currentRisk, progressState as Record<string, any> | null) ? "Risiko Sebelumnya" : "Kembali ke Responden"}
                        </button>
                        
                        <button
                            onClick={() => { void handleNext(); }}
                            disabled={saving || isFinished || (step === 0 ? !isStep0Valid : !isStep1Valid)}
                            className="group flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-[15px] transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none w-full sm:w-auto cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {nextLabel}
                            {!saving ? <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> : null}
                        </button>
                    </motion.div>

                </div>
            </div>
        </RequireCompanyProfile>
    );
}
