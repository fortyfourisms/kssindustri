import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { csirtService } from "@/services/csirt.service";
import { useToast } from "@/hooks/use-toast";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import KseQuestionCard from "@/components/assessment/KseQuestionCard";
import ProgressBar from "@/components/assessment/ProgressBar";
import PaginationControl from "@/components/assessment/PaginationControl";
import { kseCategories, getKategoriSE } from "@/data/kse-data";
import {
    Monitor, ChevronRight, ArrowLeft, Save, CheckCircle2, Edit2,
    BarChart3, Scale, Loader2, AlertCircle, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────
interface KseAnswer {
    selectedOption: 'A' | 'B' | 'C' | null;
    bobot: number;
}

interface KseRespondentProfile {
    nama_perusahaan: string;
    jenis_usaha: string;
    nama_se: string;
    alamat: string;
    email: string;
    nomor_telepon: string;
    tanggal_pengisian: string;
    ip_se: string;
    as_number_se: string;
    pengelola_se: string;
    fitur_se: string;
    seId?: string | number;
    id_csirt?: string;
    id_perusahaan?: string;
    id_sub_sektor?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const QUESTIONS_PER_PAGE = 5;
const MAX_SCORE = 50;

const QUESTION_TO_FIELD: Record<string, string> = {
    '1.1': 'nilai_investasi',
    '1.2': 'anggaran_operasional',
    '1.3': 'kepatuhan_peraturan',
    '1.4': 'teknik_kriptografi',
    '1.5': 'jumlah_pengguna',
    '1.6': 'data_pribadi',
    '1.7': 'klasifikasi_data',
    '1.8': 'kekritisan_proses',
    '1.9': 'dampak_kegagalan',
    '1.10': 'potensi_kerugian_dan_dampak_negatif',
};

// ── Helper: localStorage slug ────────────────────────────────────────────────
function getSlug(companyName: string) {
    return companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || 'default';
}

export default function FormKse() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id') || '';
    const { toast } = useToast();

    const { data: user, isLoading: userLoading } = useQuery<any>({ queryKey: ["me"], queryFn: api.getMe });

    // Edit mode: fetch specific SE by id from /api/se/{id}
    const { data: seById } = useQuery<any>({
        queryKey: ["se", editId],
        queryFn: () => csirtService.getSeById(editId),
        enabled: !!user && !!editId,
    });

    // New mode: fetch company's SE list just for company defaults (first record)
    const { data: seListRaw } = useQuery<any>({
        queryKey: ["se"],
        queryFn: api.getKse,
        enabled: !!user && !editId,
    });

    // Normalise: API returns { data: [...], total_count: N }
    const seListNorm: any[] = Array.isArray(seListRaw?.data)
        ? seListRaw.data
        : Array.isArray(seListRaw)
            ? seListRaw
            : seListRaw && typeof seListRaw === 'object' && seListRaw.id
                ? [seListRaw]
                : [];

    // The resolved SE record to pre-fill from
    const existingSe = editId ? seById : (seListNorm[0] ?? null);

    // ── Step state ───────────────────────────────────────────────────────────
    const [currentStep, setCurrentStep] = useState(1);

    // ── Respondent form state ────────────────────────────────────────────────
    const [respondent, setRespondent] = useState<KseRespondentProfile>({
        nama_perusahaan: '',
        jenis_usaha: '',
        nama_se: '',
        alamat: '',
        email: '',
        nomor_telepon: '',
        tanggal_pengisian: new Date().toISOString().split('T')[0],
        ip_se: '',
        as_number_se: '',
        pengelola_se: '',
        fitur_se: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // ── KSE answers state ────────────────────────────────────────────────────
    const [answers, setAnswers] = useState<Record<string, KseAnswer>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ── Category navigation state ────────────────────────────────────────────
    const [currentCategoryId, setCurrentCategoryId] = useState(kseCategories[0].id);
    const [currentPage, setCurrentPage] = useState(1);

    // ── Derived values ───────────────────────────────────────────────────────
    const slug = useMemo(() => {
        return getSlug(user?.perusahaan?.nama_perusahaan || 'default');
    }, [user]);

    const PROFILE_KEY = `kse_respondent_${slug}`;
    const ANSWERS_KEY = `kse_answers_${slug}`;

    const currentCategory = useMemo(() =>
        kseCategories.find(c => c.id === currentCategoryId) || kseCategories[0]
        , [currentCategoryId]);

    const currentQuestions = useMemo(() => {
        const start = (currentPage - 1) * QUESTIONS_PER_PAGE;
        return currentCategory.questions.slice(start, start + QUESTIONS_PER_PAGE);
    }, [currentCategory, currentPage]);

    const totalPagesInCategory = useMemo(() =>
        Math.ceil(currentCategory.questions.length / QUESTIONS_PER_PAGE)
        , [currentCategory]);

    const totalQuestions = useMemo(() =>
        kseCategories.reduce((sum, cat) => sum + cat.questions.length, 0)
        , []);

    const answeredCount = useMemo(() =>
        Object.values(answers).filter(a => a.selectedOption != null).length
        , [answers]);

    const isAllAnswered = answeredCount === totalQuestions;

    const totalBobot = useMemo(() =>
        Object.values(answers).reduce((sum, a) => sum + (a.bobot || 0), 0)
        , [answers]);

    const kategoriSE = useMemo(() => getKategoriSE(totalBobot), [totalBobot]);

    const scorePercentage = useMemo(() =>
        Math.min(Math.round((totalBobot / MAX_SCORE) * 100), 100)
        , [totalBobot]);

    // ── Pagination helpers ───────────────────────────────────────────────────
    const canGoPrevious = useMemo(() => {
        const isFirst = kseCategories[0].id === currentCategoryId;
        return !(isFirst && currentPage === 1);
    }, [currentCategoryId, currentPage]);

    const canGoNext = useMemo(() => {
        const isLast = kseCategories[kseCategories.length - 1].id === currentCategoryId;
        return !(isLast && currentPage === totalPagesInCategory);
    }, [currentCategoryId, currentPage, totalPagesInCategory]);

    // ── Init: load from localStorage + user profile + existing SE data ────────
    useEffect(() => {
        if (!user) return;
        // In edit mode, wait until seById is loaded
        if (editId && !seById) return;

        const p = user.perusahaan;
        const se = existingSe;

        const initial: KseRespondentProfile = {
            nama_perusahaan: se?.perusahaan?.nama_perusahaan || p?.nama_perusahaan || '',
            jenis_usaha: se?.sub_sektor?.nama_sub_sektor || p?.sub_sektor?.nama_sub_sektor || p?.sub_sektor?.name || '',
            nama_se: se?.nama_se || '',
            alamat: p?.alamat || '',
            email: p?.email || user.email || '',
            nomor_telepon: p?.telepon || '',
            tanggal_pengisian: new Date().toISOString().split('T')[0],
            ip_se: se?.ip_se || '',
            as_number_se: se?.as_number_se || '',
            pengelola_se: se?.pengelola_se || '',
            fitur_se: se?.fitur_se || '',
            seId: se?.id || '',
            id_perusahaan: se?.id_perusahaan || p?.id || '',
            id_sub_sektor: se?.id_sub_sektor || p?.sub_sektor?.id || '',
            id_csirt: se?.id_csirt || '',
        };

        // Only read localStorage when not in edit-by-id mode
        if (!editId) {
            try {
                const stored = localStorage.getItem(`kse_respondent_${getSlug(p?.nama_perusahaan || 'default')}`);
                if (stored) {
                    const saved = JSON.parse(stored);
                    Object.keys(saved).forEach(key => {
                        const k = key as keyof KseRespondentProfile;
                        if (!initial[k] && saved[k]) {
                            initial[k] = saved[k];
                        }
                    });
                    if (saved.nama_se) {
                        setCurrentStep(2);
                    }
                }
            } catch { }
        }

        setRespondent(initial);

        if (se) {
            const apiAnswers: Record<string, KseAnswer> = {};
            let hasApiAnswers = false;
            Object.entries(QUESTION_TO_FIELD).forEach(([qNo, field]) => {
                const val = se[field];
                if (val && ['A', 'B', 'C'].includes(val)) {
                    for (const cat of kseCategories) {
                        const q = cat.questions.find(q => q.no === qNo);
                        if (q) {
                            const opt = q.options[val as 'A' | 'B' | 'C'];
                            apiAnswers[qNo] = { selectedOption: val as 'A' | 'B' | 'C', bobot: opt?.bobot || 0 };
                            hasApiAnswers = true;
                            break;
                        }
                    }
                }
            });

            if (hasApiAnswers) {
                setAnswers(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(apiAnswers)) return prev;
                    return apiAnswers;
                });
                setIsSubmitted(true);
                // In edit mode, skip to step 2 automatically
                if (editId) setCurrentStep(2);
            }
        } else if (!editId) {
            try {
                const storedAnswers = localStorage.getItem(`kse_answers_${getSlug(p?.nama_perusahaan || 'default')}`);
                if (storedAnswers) {
                    const parsed = JSON.parse(storedAnswers);
                    setAnswers(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(parsed.answers || {})) return prev;
                        return parsed.answers || {};
                    });
                    setIsSubmitted(prev => prev !== (parsed.isSubmitted || false) ? (parsed.isSubmitted || false) : prev);
                }
            } catch { }
        }
    }, [user, existingSe, editId, seById]);

    // ── Persist answers on change ────────────────────────────────────────────
    useEffect(() => {
        if (slug === 'default') return;
        localStorage.setItem(ANSWERS_KEY, JSON.stringify({ answers, isSubmitted }));
    }, [answers, isSubmitted, ANSWERS_KEY, slug]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleRespondentChange = (field: keyof KseRespondentProfile, value: string) => {
        setRespondent(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const validateRespondentForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!respondent.nama_se.trim()) errors.nama_se = 'Nama sistem elektronik wajib diisi';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRespondentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateRespondentForm()) return;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(respondent));
        setCurrentStep(2);
    };

    const handleAnswer = useCallback((questionNo: string, optionKey: 'A' | 'B' | 'C', bobot: number) => {
        if (isSubmitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionNo]: { selectedOption: optionKey, bobot },
        }));
    }, [isSubmitted]);

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(p => p - 1);
        } else {
            const idx = kseCategories.findIndex(c => c.id === currentCategoryId);
            if (idx > 0) {
                const prevCat = kseCategories[idx - 1];
                setCurrentCategoryId(prevCat.id);
                setCurrentPage(Math.ceil(prevCat.questions.length / QUESTIONS_PER_PAGE));
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const nextPage = () => {
        if (currentPage < totalPagesInCategory) {
            setCurrentPage(p => p + 1);
        } else {
            const idx = kseCategories.findIndex(c => c.id === currentCategoryId);
            if (idx < kseCategories.length - 1) {
                setCurrentCategoryId(kseCategories[idx + 1].id);
                setCurrentPage(1);
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => { setCurrentPage(1); }, [currentCategoryId]);

    const handleEditData = () => { setCurrentStep(1); };

    const handleEditAnswers = () => {
        setIsSubmitted(false);
        toast({ title: "Mode edit aktif", description: "Silakan ubah jawaban Anda." });
    };

    const handleSaveAndExit = async () => {
        setIsSaving(true);
        try {
            const penilaianPayload: Record<string, string> = {};
            Object.entries(answers).forEach(([qNo, ans]) => {
                const field = QUESTION_TO_FIELD[qNo];
                if (field && ans.selectedOption) {
                    penilaianPayload[field] = ans.selectedOption;
                }
            });

            const payload = {
                ...penilaianPayload,
                kategori_se: kategoriSE.kategori,
                nama_se: respondent.nama_se,
                ip_se: respondent.ip_se || '',
                as_number_se: respondent.as_number_se || '',
                pengelola_se: respondent.pengelola_se || '',
                fitur_se: respondent.fitur_se || '',
                id_perusahaan: respondent.id_perusahaan || '',
                id_sub_sektor: respondent.id_sub_sektor || '',
                id_csirt: respondent.id_csirt || '',
            };

            if (isAllAnswered) {
                if (respondent.seId) {
                    await csirtService.updateSe(respondent.seId, payload);
                } else {
                    const created = await csirtService.createSe(payload as any);
                    setRespondent(prev => ({ ...prev, seId: created.id }));
                    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...respondent, seId: created.id }));
                }
                setIsSubmitted(true);
                toast({ title: "Berhasil!", description: "Assessment berhasil diselesaikan dan disimpan." });
                setTimeout(() => navigate('/dashboard/kse'), 1200);
            } else {
                toast({ title: "Tersimpan", description: "Data berhasil disimpan sementara." });
            }
        } catch (e: any) {
            console.warn('KSE save failed:', e);
            toast({ title: "Peringatan", description: "Data tersimpan secara lokal. Sinkronisasi ke server gagal.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Loading state ────────────────────────────────────────────────────────
    if (userLoading) {
        return (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <RequireCompanyProfile>
                <div className="max-w-7xl mx-auto space-y-6 pb-12">

                    {/* Header Info */}
                    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="font-black text-slate-900 font-display text-xl">
                                {currentStep === 1 ? 'Data Responden' : 'Penilaian KSE'}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {currentStep === 1 ? 'Lengkapi informasi instansi dan sistem elektronik yang akan dinilai.' : 'Jawab pertanyaan kategorisasi sistem elektronik.'}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/kse')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-3 md:p-4 shadow-sm">
                        <div className="flex items-center justify-center gap-4 relative">
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-slate-200 rounded -z-10">
                                <div className={`h-full bg-blue-500 transition-all duration-300 ${currentStep === 2 ? 'w-full' : 'w-0'}`} />
                            </div>

                            <div className="flex flex-col items-center gap-2 bg-white px-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${currentStep >= 1 ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                    {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                                </div>
                                <span className={`text-xs font-bold leading-none ${currentStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Responden</span>
                            </div>

                            <div className="w-16"></div>

                            <div className="flex flex-col items-center gap-2 bg-white px-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${currentStep >= 2 ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                    2
                                </div>
                                <span className={`text-xs font-bold leading-none ${currentStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>Penilaian</span>
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════ STEP 1: Data Responden ══════════════════ */}
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2">
                                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-500" /> Informasi Instansi &amp; Sistem
                                        </h2>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-5">
                                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                            <span className="text-[13px] text-blue-700">Data instansi diambil otomatis dari profil perusahaan.</span>
                                        </div>

                                        <form onSubmit={handleRespondentSubmit} noValidate>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Nama Instansi */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Nama Instansi / Perusahaan</label>
                                                    <input type="text" readOnly value={respondent.nama_perusahaan}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm cursor-not-allowed" />
                                                </div>

                                                {/* Sektor */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Sektor</label>
                                                    <input type="text" readOnly value={respondent.jenis_usaha}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm cursor-not-allowed" />
                                                </div>

                                                {/* Nama Sistem Elektronik */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                                                        Nama Sistem Elektronik <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={respondent.nama_se}
                                                        onChange={e => handleRespondentChange('nama_se', e.target.value)}
                                                        placeholder="Nama sistem elektronik"
                                                        className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 text-sm placeholder:text-slate-400
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition
                                                            ${formErrors.nama_se ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-white/80'}`}
                                                    />
                                                    {formErrors.nama_se && (
                                                        <p className="text-red-500 text-xs mt-1">{formErrors.nama_se}</p>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2"><hr className="border-slate-100 my-1" /></div>

                                                {/* Tanggal Pengisian */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                                                        Tanggal Pengisian <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={respondent.tanggal_pengisian}
                                                        onChange={e => handleRespondentChange('tanggal_pengisian', e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 text-sm
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
                                                    />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/dashboard/kse')}
                                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                                                >
                                                    <ArrowLeft className="w-4 h-4" /> Kembali
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/25
                                                        hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                                >
                                                    Mulai Kategorisasi
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ══════════════════ STEP 2: KSE Assessment ══════════════════ */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Progress Bar */}
                                <div className="sticky top-[74px] z-[99] -mt-2.5 mb-6">
                                    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 shadow-sm">
                                        <ProgressBar
                                            answered={answeredCount}
                                            total={totalQuestions}
                                            currentPage={currentPage}
                                            totalPages={totalPagesInCategory}
                                            title="Kategorisasi SE"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                                    {/* ── Sidebar ── */}
                                    <div className="lg:col-span-1">
                                        <div className="lg:sticky lg:top-[200px] space-y-4">

                                            {/* Score / Gauge Card */}
                                            <div className="bg-white rounded-2xl border border-slate-100/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                                                <div className="h-1 w-full rounded-t-2xl" style={{
                                                    background: `linear-gradient(135deg, ${kategoriSE.color}, ${kategoriSE.color}88)`
                                                }} />
                                                <div className="p-4 md:p-5 flex flex-col items-center text-center">
                                                    <div className="uppercase text-[10px] font-bold text-slate-400 tracking-[0.12em] mb-5 flex items-center gap-1.5">
                                                        <BarChart3 className="w-3.5 h-3.5 opacity-70" />
                                                        Hasil Penilaian
                                                    </div>

                                                    {/* Gauge Ring */}
                                                    <div
                                                        className="w-[140px] h-[140px] rounded-full flex items-center justify-center mb-5 relative"
                                                        style={{
                                                            background: `conic-gradient(${kategoriSE.color} ${scorePercentage}%, #f1f5f9 0deg)`,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 0 0 2px rgba(241,245,249,0.8)'
                                                        }}
                                                    >
                                                        <div className="w-[110px] h-[110px] rounded-full bg-white flex flex-col items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] z-[2]">
                                                            <span className="text-4xl font-extrabold text-slate-800 leading-none tracking-tighter">
                                                                {totalBobot}
                                                            </span>
                                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em] mt-1">
                                                                Skor
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[11px] text-slate-400 font-medium">Status Sistem Elektronik</span>
                                                        <span className="text-lg font-extrabold uppercase tracking-tight transition-colors duration-400"
                                                            style={{ color: kategoriSE.color }}>
                                                            {kategoriSE.kategori}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Card */}
                                            <div className="bg-white rounded-2xl border border-slate-100/50 shadow-sm p-3.5 space-y-3">
                                                {!isSubmitted ? (
                                                    <>
                                                        <button
                                                            onClick={handleSaveAndExit}
                                                            disabled={isSaving}
                                                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] font-bold text-[13px] text-white transition-all duration-300 relative overflow-hidden
                                                                ${isAllAnswered
                                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40'
                                                                    : 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-400/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/40'
                                                                }
                                                                disabled:opacity-50`}
                                                        >
                                                            {isSaving ? (
                                                                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                                                            ) : isAllAnswered ? (
                                                                <><CheckCircle2 className="w-4 h-4" /> Simpan &amp; Selesai</>
                                                            ) : (
                                                                <><Save className="w-4 h-4" /> Simpan Sementara</>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={handleEditData}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] font-bold text-[13px] text-blue-600 bg-blue-50 border border-blue-100
                                                                hover:bg-blue-100/80 hover:-translate-y-0.5 transition-all duration-300"
                                                        >
                                                            <Edit2 className="w-4 h-4" /> Edit Data Responden
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={handleEditAnswers}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] font-bold text-[13px] text-amber-600 bg-amber-50 border border-amber-100
                                                            hover:bg-amber-100/80 hover:-translate-y-0.5 transition-all duration-300"
                                                    >
                                                        <Edit2 className="w-4 h-4" /> Edit Data
                                                    </button>
                                                )}
                                            </div>

                                            {/* Criteria Card */}
                                            <div className="bg-white rounded-2xl border border-slate-100/50 shadow-sm overflow-hidden">
                                                <div className="px-4 md:px-5 pt-4 text-[13px] font-bold text-slate-700 flex items-center gap-2">
                                                    <Scale className="w-4 h-4 text-slate-400" />
                                                    Ketentuan Penilaian
                                                </div>
                                                <div className="p-4 md:p-5 pt-3 md:pt-4 space-y-2.5">
                                                    {[
                                                        { name: 'Strategis', range: '35 – 50', color: '#e63946', bg: 'rgba(230,57,70,0.08)' },
                                                        { name: 'Tinggi', range: '16 – 34', color: '#fb8500', bg: 'rgba(251,133,0,0.08)' },
                                                        { name: 'Rendah', range: '10 – 15', color: '#2a9d8f', bg: 'rgba(42,157,143,0.08)' },
                                                    ].map((crit, i, arr) => (
                                                        <div key={crit.name}
                                                            className={`flex justify-between items-center pb-2.5 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="w-2 h-2 rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.04)]"
                                                                    style={{ background: crit.color }} />
                                                                <span className="text-[13px] font-semibold text-slate-700">{crit.name}</span>
                                                            </div>
                                                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                                                                style={{ background: crit.bg, color: crit.color }}>
                                                                {crit.range}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Main Content ── */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-white rounded-2xl border border-slate-100/50 shadow-sm overflow-hidden min-h-[400px]">
                                            {/* Header */}
                                            <div className="p-4 md:p-6 pb-4">
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                                    <div className="w-11 h-11 min-w-[44px] rounded-[14px] bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/35">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-base md:text-lg font-bold text-slate-800 m-0 mb-1 leading-snug">{currentCategory.title}</h5>
                                                        <p className="text-xs md:text-[13px] text-slate-400 m-0 font-medium">
                                                            Silakan lengkapi pertanyaan di bawah ini sesuai kondisi instansi.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Questions */}
                                            <div className="px-4 md:px-6 pb-6 pt-4 bg-slate-50/80 border-t border-slate-100">
                                                {currentQuestions.map(q => (
                                                    <KseQuestionCard
                                                        key={q.no}
                                                        question={q}
                                                        selectedOption={answers[q.no]?.selectedOption}
                                                        readonly={isSubmitted}
                                                        onAnswer={handleAnswer}
                                                    />
                                                ))}

                                                {/* Pagination */}
                                                <div className="mt-8 pt-5 border-t border-slate-200">
                                                    <PaginationControl
                                                        currentPage={currentPage}
                                                        totalPages={totalPagesInCategory}
                                                        canGoPrevious={canGoPrevious}
                                                        canGoNext={canGoNext}
                                                        onPrevious={prevPage}
                                                        onNext={nextPage}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </RequireCompanyProfile>
    );
}
