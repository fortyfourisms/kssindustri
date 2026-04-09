import { useState, useEffect } from "react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ArrowRight, ArrowLeft, CheckCircle2, UserCircle2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssessmentStore } from "@/stores/assessment.store";
import AssessmentView from "@/pages/dashboard/Assessment/AssessmentView";
import { useUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { perusahaanService } from "@/services/perusahaan.service";
import { api } from "@/lib/api";

const respondentSchema = z.object({
    responden: z.string().min(1, "Nama responden wajib diisi"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    target_nilai: z.coerce.number().min(0, "Target nilai wajib diisi"),
    telepon: z.string().min(1, "Nomor telepon wajib diisi")
});

type RespondentFormValues = z.infer<typeof respondentSchema>;

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function FormIkas() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const saveRespondentProfile = useAssessmentStore(state => state.saveRespondentProfile);
    const respondentProfile = useAssessmentStore(state => state.respondentProfile);
    const setCurrentStakeholder = useAssessmentStore(state => state.setCurrentStakeholder);
    const setExistingIkasId = useAssessmentStore(state => state.setExistingIkasId);
    const initialized = useAssessmentStore(state => state.initialized);
    const initializeStore = useAssessmentStore(state => state.initialize);

    const { data: meData } = useUser();
    const perusahaanId = meData?.id_perusahaan || meData?.perusahaan?.id;
    const { data: perusahaan } = useQuery({
        queryKey: ["perusahaan", perusahaanId],
        queryFn: () => perusahaanService.getById(String(perusahaanId)),
        enabled: !!perusahaanId,
        staleTime: 1000 * 60 * 5,
    });

    // Fetch existing IKAS by company ID to detect if a record already exists
    const { data: ikasList } = useQuery({
        queryKey: ["ikasList", perusahaanId],
        queryFn: () => api.getIkasById(String(perusahaanId)),
        enabled: !!perusahaanId,
        staleTime: 1000 * 60 * 2,
    });

    useEffect(() => {
        if (!initialized) {
            initializeStore();
        }
        setCurrentStakeholder('draft-ikas');
    }, [initialized, initializeStore, setCurrentStakeholder]);

    // When form tanggal changes, detect if there's an existing record for that year
    const currentTanggal = respondentProfile()?.tanggal || new Date().toISOString().split('T')[0];
    useEffect(() => {
        if (!ikasList) {
            setExistingIkasId(null);
            return;
        }
        // getIkasById may return a single object or an array
        if (Array.isArray(ikasList)) {
            const selectedYear = new Date(currentTanggal).getFullYear();
            const match = (ikasList as any[]).find((item: any) => {
                const t = item.tanggal ?? item.created_at ?? "";
                return t ? new Date(t).getFullYear() === selectedYear : false;
            });
            setExistingIkasId(match?.id ?? null);
        } else {
            // single object — use its id directly
            setExistingIkasId((ikasList as any)?.id ?? null);
        }
    }, [ikasList, currentTanggal, setExistingIkasId]);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RespondentFormValues>({
        resolver: zodResolver(respondentSchema),
        defaultValues: {
            responden: respondentProfile()?.responden || "",
            telepon: respondentProfile()?.telepon || "",
            target_nilai: respondentProfile()?.target_nilai || 0,
            tanggal: respondentProfile()?.tanggal || new Date().toISOString().split('T')[0]
        }
    });

    // Re-detect existing ID when user changes the tanggal field (array case only)
    const watchedTanggal = watch("tanggal");
    useEffect(() => {
        if (!ikasList || !Array.isArray(ikasList) || !watchedTanggal) return;
        const selectedYear = new Date(watchedTanggal).getFullYear();
        const match = (ikasList as any[]).find((item: any) => {
            const t = item.tanggal ?? item.created_at ?? "";
            return t ? new Date(t).getFullYear() === selectedYear : false;
        });
        setExistingIkasId(match?.id ?? null);
    }, [watchedTanggal, ikasList, setExistingIkasId]);

    const onSubmit = (data: RespondentFormValues) => {
        saveRespondentProfile({
            ...data,
            updated_at: new Date().toISOString(),
            email: perusahaan?.email,
            alamat: perusahaan?.alamat,
            nama_perusahaan: perusahaan?.nama_perusahaan,
        });
        toast({ title: "Berhasil", description: "Data Responden berhasil disimpan." });
        setStep(2);
    };

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
                            {step === 1 ? 'Lengkapi informasi instansi dan sistem elektronik yang akan dinilai.' : 'Jawab pertanyaan penilaian keamanan siber.'}
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-3 md:p-4 shadow-sm">
                    <div className="flex items-center justify-center gap-4 relative">
                        {/* Line connecting steps */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-slate-200 rounded -z-10">
                            <div className={`h-full bg-blue-500 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
                        </div>

                        {/* Step 1 Node */}
                        <div className="flex flex-col items-center gap-2 bg-white px-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 1 ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                            </div>
                            <span className={`text-xs font-bold leading-none ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Responden</span>
                        </div>

                        <div className="w-16"></div>

                        {/* Step 2 Node */}
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
                                    <Building2 className="w-5 h-5 text-indigo-500" /> Data Perusahaan
                                </h2>
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Nama Perusahaan</label>
                                <input type="text" value={perusahaan?.nama_perusahaan || ''} readOnly className={`${INPUT_CLS} bg-slate-50 text-slate-500`} />
                                <p className="text-xs text-slate-400 mt-1">Data dari profil perusahaan</p>
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Email</label>
                                <input type="email" value={perusahaan?.email || ''} readOnly className={`${INPUT_CLS} bg-slate-50 text-slate-500`} />
                                <p className="text-xs text-slate-400 mt-1">Data dari profil perusahaan</p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className={LABEL_CLS}>Alamat Lengkap</label>
                                <textarea rows={2} value={perusahaan?.alamat || ''} readOnly className={`${INPUT_CLS} bg-slate-50 text-slate-500`} />
                                <p className="text-xs text-slate-400 mt-1">Data dari profil perusahaan</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mt-4">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <UserCircle2 className="w-5 h-5 text-blue-500" /> Detail Responden IKAS
                                </h2>
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Nama Responden <span className="text-red-500">*</span></label>
                                <input {...register("responden")} className={INPUT_CLS} placeholder="Nama lengkap" />
                                {errors.responden && <p className="text-red-500 text-xs mt-1">{errors.responden.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Nomor Telepon <span className="text-red-500">*</span></label>
                                <input type="tel" {...register("telepon")} className={INPUT_CLS} placeholder="0812345678" />
                                {errors.telepon && <p className="text-red-500 text-xs mt-1">{errors.telepon.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Tanggal <span className="text-red-500">*</span></label>
                                <input type="date" {...register("tanggal")} className={INPUT_CLS} />
                                {errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal.message}</p>}
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Target Nilai <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" {...register("target_nilai")} className={INPUT_CLS} placeholder="0" />
                                {errors.target_nilai && <p className="text-red-500 text-xs mt-1">{errors.target_nilai.message}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-5 border-t border-slate-100">
                            <button type="button" onClick={() => navigate('/dashboard/ikas')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Kembali
                            </button>
                            <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2">
                                Lanjut ke Penilaian <ArrowRight className="w-4 h-4" />
                            </button>
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
                        />
                    </motion.div>
                )}

            </div>
        </RequireCompanyProfile>
    );
}
