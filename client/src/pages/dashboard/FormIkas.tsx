import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, Save, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssessmentStore } from "@/stores/assessment.store";
import AssessmentView from "@/pages/dashboard/Assessment/AssessmentView";

const respondentSchema = z.object({
    instansi: z.string().min(1, "Instansi wajib diisi"),
    namaSistem: z.string().min(1, "Nama sistem wajib diisi"),
    jenisSistem: z.enum(["IT", "OT", "IT & OT"]),
    sektor: z.string().min(1, "Sektor wajib diisi"),
    alamat: z.string().min(1, "Alamat wajib diisi"),
    email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
    nomorTelepon: z.string().min(1, "Nomor telepon wajib diisi"),
    namaResponden: z.string().min(1, "Nama responden wajib diisi"),
    jabatanResponden: z.string().min(1, "Jabatan responden wajib diisi"),
    tahunPengukuran: z.string().min(4, "Tahun tidak valid"),
    targetLevel: z.coerce.number().min(1).max(5),
    targetNilai: z.string().min(1, "Target nilai wajib diisi"),
    acuanManajemenRisiko: z.string().min(1, "Acuan manajemen risiko wajib diisi"),
    acuanKeamananSiber: z.string().min(1, "Acuan keamanan siber wajib diisi"),
    tanggalPengisian: z.string().min(1, "Tanggal wajib diisi")
});

type RespondentFormValues = z.infer<typeof respondentSchema>;

const SEKTOR_OPTIONS = [
    'Administrasi Pemerintahan',
    'Energi dan Sumber Daya Mineral',
    'Transportasi',
    'Keamanan',
    'Kesehatan',
    'TIK',
    'Pangan',
    'Pertahanan',
    'Sektor Lain'
];

const TARGET_LEVEL_OPTIONS = [
    { value: 1, label: 'Level 1 - Awal' },
    { value: 2, label: 'Level 2 - Berulang' },
    { value: 3, label: 'Level 3 - Terdefinisi' },
    { value: 4, label: 'Level 4 - Terkelola' },
    { value: 5, label: 'Level 5 - Inovatif' }
];

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function FormIkas() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const saveRespondentProfile = useAssessmentStore(state => state.saveRespondentProfile);
    const respondentProfile = useAssessmentStore(state => state.respondentProfile);
    const setCurrentStakeholder = useAssessmentStore(state => state.setCurrentStakeholder);
    const initialized = useAssessmentStore(state => state.initialized);
    const initializeStore = useAssessmentStore(state => state.initialize);

    useEffect(() => {
        if (!initialized) {
            initializeStore();
        }
        // Use a generic placeholder ID for current stakeholder since there's no dynamic ID provided yet.
        // In a real app this might be tied to an actual assessment ID or company ID
        setCurrentStakeholder('draft-ikas');
    }, [initialized, initializeStore, setCurrentStakeholder]);

    const { register, handleSubmit, formState: { errors } } = useForm<RespondentFormValues>({
        resolver: zodResolver(respondentSchema),
        defaultValues: respondentProfile() || {
            jenisSistem: "IT",
            sektor: "Kesehatan",
            tahunPengukuran: new Date().getFullYear().toString(),
            targetLevel: 3,
            targetNilai: "2.51 - 3.50",
            tanggalPengisian: new Date().toISOString().split('T')[0]
        }
    });

    const onSubmit = (data: RespondentFormValues) => {
        saveRespondentProfile({
            ...data,
            targetLevel: data.targetLevel as 1 | 2 | 3 | 4 | 5,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        toast({ title: "Berhasil", description: "Data Responden berhasil disimpan." });
        setStep(2);
    };

    return (
        <DashboardLayout title="Input Data IKAS">
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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 1 ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}>
                                    {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                                </div>
                                <span className={`text-xs font-bold leading-none ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Responden</span>
                            </div>

                            <div className="w-16"></div>

                            {/* Step 2 Node */}
                            <div className="flex flex-col items-center gap-2 bg-white px-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${step >= 2 ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}>
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
                                        <Building2 className="w-5 h-5 text-blue-500" /> Informasi Instansi & Sistem
                                    </h2>
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Instansi / Penyelenggara <span className="text-red-500">*</span></label>
                                    <input {...register("instansi")} className={INPUT_CLS} placeholder="Contoh: Kementerian XYZ" />
                                    {errors.instansi && <p className="text-red-500 text-xs mt-1">{errors.instansi.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Nama Sistem Elektronik <span className="text-red-500">*</span></label>
                                    <input {...register("namaSistem")} className={INPUT_CLS} placeholder="Contoh: Sistem Informasi ABC" />
                                    {errors.namaSistem && <p className="text-red-500 text-xs mt-1">{errors.namaSistem.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Jenis Sistem <span className="text-red-500">*</span></label>
                                    <select {...register("jenisSistem")} className={INPUT_CLS}>
                                        <option value="IT">IT</option>
                                        <option value="OT">OT</option>
                                        <option value="IT & OT">IT & OT</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Sektor <span className="text-red-500">*</span></label>
                                    <select {...register("sektor")} className={INPUT_CLS}>
                                        {SEKTOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className={LABEL_CLS}>Alamat Lengkap <span className="text-red-500">*</span></label>
                                    <textarea {...register("alamat")} rows={2} className={INPUT_CLS} placeholder="Alamat instansi" />
                                    {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Email <span className="text-red-500">*</span></label>
                                    <input type="email" {...register("email")} className={INPUT_CLS} placeholder="email@example.com" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Nomor Telepon <span className="text-red-500">*</span></label>
                                    <input type="tel" {...register("nomorTelepon")} className={INPUT_CLS} placeholder="021-1234567" />
                                    {errors.nomorTelepon && <p className="text-red-500 text-xs mt-1">{errors.nomorTelepon.message}</p>}
                                </div>

                                <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mt-4">
                                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                        <UserCircle2 className="w-5 h-5 text-indigo-500" /> Detail Responden & Pengukuran
                                    </h2>
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Nama Responden <span className="text-red-500">*</span></label>
                                    <input {...register("namaResponden")} className={INPUT_CLS} placeholder="Nama lengkap" />
                                    {errors.namaResponden && <p className="text-red-500 text-xs mt-1">{errors.namaResponden.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Jabatan Responden <span className="text-red-500">*</span></label>
                                    <input {...register("jabatanResponden")} className={INPUT_CLS} placeholder="Level/Jabatan" />
                                    {errors.jabatanResponden && <p className="text-red-500 text-xs mt-1">{errors.jabatanResponden.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Tahun Pengukuran <span className="text-red-500">*</span></label>
                                    <input type="number" {...register("tahunPengukuran")} className={INPUT_CLS} />
                                    {errors.tahunPengukuran && <p className="text-red-500 text-xs mt-1">{errors.tahunPengukuran.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Target Level <span className="text-red-500">*</span></label>
                                    <select {...register("targetLevel")} className={INPUT_CLS}>
                                        {TARGET_LEVEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Target Nilai <span className="text-red-500">*</span></label>
                                    <input {...register("targetNilai")} className={INPUT_CLS} />
                                    {errors.targetNilai && <p className="text-red-500 text-xs mt-1">{errors.targetNilai.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Tanggal Pengisian <span className="text-red-500">*</span></label>
                                    <input type="date" {...register("tanggalPengisian")} className={INPUT_CLS} />
                                    {errors.tanggalPengisian && <p className="text-red-500 text-xs mt-1">{errors.tanggalPengisian.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Acuan Manajemen Risiko <span className="text-red-500">*</span></label>
                                    <input {...register("acuanManajemenRisiko")} className={INPUT_CLS} placeholder="Contoh: ISO 27005" />
                                    {errors.acuanManajemenRisiko && <p className="text-red-500 text-xs mt-1">{errors.acuanManajemenRisiko.message}</p>}
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Acuan Keamanan Siber <span className="text-red-500">*</span></label>
                                    <input {...register("acuanKeamananSiber")} className={INPUT_CLS} placeholder="Contoh: NIST CSF" />
                                    {errors.acuanKeamananSiber && <p className="text-red-500 text-xs mt-1">{errors.acuanKeamananSiber.message}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-5 border-t border-slate-100">
                                <button type="button" onClick={() => setLocation('/dashboard/ikas')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
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
                                onBack={() => setLocation('/dashboard/ikas')}
                                onEdit={() => setStep(1)}
                                embedded={true}
                            />
                        </motion.div>
                    )}

                </div>
            </RequireCompanyProfile>
        </DashboardLayout>
    );
}

// Missing imports logic for lucide icons
import { Building2, UserCircle2 } from "lucide-react";
