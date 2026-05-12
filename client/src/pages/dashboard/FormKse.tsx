import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { csirtService } from "@/services/csirt.service";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useToast } from "@/hooks/use-toast";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import KseQuestionCard from "@/components/assessment/KseQuestionCard";
import PaginationControl from "@/components/assessment/PaginationControl";
import { kseCategories, getKategoriSE } from "@/data/kse-data";
import { getKseEditRequestStatus, getKseEditStatusMeta, getLatestKseEditRequest, type KseEditRequestRecord } from "@/lib/kse-edit-request";
import {
    Monitor, ChevronRight, ArrowLeft, Save, CheckCircle2, Edit2,
    BarChart3, Scale, Loader2, AlertCircle, Eye, FileText, Lock, Send, Server
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppButton, AppTextarea, AppModal } from "@/ui";

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
    created_at?: string;
    updated_at?: string;
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
const QUESTIONS_PER_PAGE = 10;
const MAX_SCORE = 50;
const SECONDARY_BUTTON_CLS = "button-force-white dashboard-secondary-button inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition";
const PRIMARY_BUTTON_CLS = "button-force-white dashboard-primary-button inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0";
const SUCCESS_BUTTON_CLS = "button-force-white inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:from-emerald-800 hover:via-emerald-700 hover:to-green-600 active:translate-y-0";
const WARNING_BUTTON_CLS = "button-force-white dashboard-warning-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-all hover:-translate-y-0.5";
const EDIT_BUTTON_CLS = "button-force-white inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 px-4 py-3 text-[13px] font-bold transition-all hover:-translate-y-0.5 hover:from-sky-700 hover:via-blue-700 hover:to-indigo-700";

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

const FIELD_LABELS: Record<string, string> = {
    nama_se: 'Nama Sistem Elektronik',
    ip_se: 'IP SE',
    as_number_se: 'AS Number',
    pengelola_se: 'Pengelola SE',
    fitur_se: 'Fitur SE',
    id_perusahaan: 'Perusahaan',
    id_sub_sektor: 'Sub Sektor',
    nilai_investasi: 'Nilai Investasi',
    anggaran_operasional: 'Anggaran Operasional',
    kepatuhan_peraturan: 'Kepatuhan Peraturan',
    teknik_kriptografi: 'Teknik Kriptografi',
    jumlah_pengguna: 'Jumlah Pengguna',
    data_pribadi: 'Data Pribadi',
    klasifikasi_data: 'Klasifikasi Data',
    kekritisan_proses: 'Kekritisan Proses',
    dampak_kegagalan: 'Dampak Kegagalan',
    potensi_kerugian_dan_dampak_negatif: 'Potensi Kerugian dan Dampak Negatif',
};

interface KseChangePreviewItem {
    field: string;
    label: string;
    oldValue: string;
    newValue: string;
}

function normalizeValue(value: unknown) {
    if (value == null) return '';
    return String(value).trim();
}

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
    const queryClient = useQueryClient();

    const { data: user, isLoading: userLoading } = useQuery<any>({ queryKey: ["me"], queryFn: api.getMe });

    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const { perusahaan: pData } = useCompanyProfile(user);

    // Edit mode only: fetch specific SE by id from /api/se/{id}
    // Add mode never pre-fills from an existing record → existingSe stays null.
    const { data: seById } = useQuery<any>({
        queryKey: ["se", editId],
        queryFn: () => csirtService.getSeById(editId),
        enabled: !!user && !!editId,
    });
    const { data: editRequestData } = useQuery<any>({
        queryKey: ["se-edit-requests"],
        queryFn: api.getKseEditRequests,
        enabled: !!user,
    });

    // Fetch the company's own CSIRT record to get id_csirt for new SE records
    const { data: csirtData } = useQuery<any>({
        queryKey: ["csirt-by-perusahaan", perusahaanId],
        queryFn: () => csirtService.getMembers(),
        enabled: !!perusahaanId,
        select: (res: any) => {
            // Normalize to array then find the CSIRT belonging to this company
            const list: any[] = Array.isArray(res?.data) ? res.data
                : Array.isArray(res) ? res
                    : res?.csirt ? (Array.isArray(res.csirt) ? res.csirt : [res.csirt])
                        : [];
            return list.find((c: any) => String(c.id_perusahaan) === String(perusahaanId)) || list[0] || null;
        },
    });

    // Resolved CSIRT id (prefer edit-mode SE's csirt, fallback to company csirt)
    const resolvedCsirtId = csirtData?.id ?? '';

    // The resolved SE record to pre-fill:
    //   Edit mode → seById (fetched above)
    //   Add mode  → null  (always blank)
    const existingSe = editId ? (seById ?? null) : null;
    const editRequests = useMemo<KseEditRequestRecord[]>(() => {
        if (Array.isArray(editRequestData?.data)) return editRequestData.data;
        if (Array.isArray(editRequestData)) return editRequestData;
        return [];
    }, [editRequestData]);
    const editRequestStatus = useMemo(() => getKseEditRequestStatus(existingSe, editRequests), [existingSe, editRequests]);
    const editRequestMeta = useMemo(() => getKseEditStatusMeta(editRequestStatus), [editRequestStatus]);
    const latestEditRequest = useMemo(() => getLatestKseEditRequest(existingSe, editRequests), [existingSe, editRequests]);
    const isEditLocked = !!editId && editRequestStatus === 'pending_approval';

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
        created_at: undefined,
        updated_at: undefined,
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
    const [editReason, setEditReason] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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

    // ── STEP A: Hard-reset all form state whenever the mode changes (Add ↔ Edit)
    // This fires synchronously on every editId change, before data arrives,
    // so stale state from a previous navigation is never shown.
    useEffect(() => {
        setAnswers({});
        setIsSubmitted(false);
        setEditReason('');
        setShowConfirmModal(false);
        setCurrentStep(1);
        setCurrentCategoryId(kseCategories[0].id);
        setCurrentPage(1);
        setFormErrors({});
        // Snapshot the blank respondent shell with whatever user profile is ready.
        // The data-init effect below will overwrite once API data arrives.
        setRespondent({
            nama_perusahaan: '',
            jenis_usaha: '',
            nama_se: '',
            alamat: '',
            email: '',
            nomor_telepon: '',
            created_at: undefined,
            updated_at: undefined,
            ip_se: '',
            as_number_se: '',
            pengelola_se: '',
            fitur_se: '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]); // intentionally only editId — reset whenever mode flips

    // ── STEP B: Populate form from API data once it is ready ─────────────────
    // Add mode  → only user profile defaults (no SE pre-fill, NO localStorage restore)
    // Edit mode → seById data + answer mapping, then jump to step 2
    useEffect(() => {
        if (!user) return;
        if (perusahaanId && !pData) return; // Wait for company profile data
        // In Edit mode wait for seById to arrive before doing anything
        if (editId && !seById) return;

        // p refers to the full fetched company profile object
        const p = pData || user.perusahaan || {};
        const se = existingSe; // null in Add mode, seById object in Edit mode

        // ── Build profile shell from user perusahaan (common to both modes) ──
        const initial: KseRespondentProfile = {
            nama_perusahaan: p?.nama_perusahaan || '',
            jenis_usaha: p?.sub_sektor?.nama_sub_sektor || p?.sub_sektor?.name || '',
            nama_se: '',
            alamat: p?.alamat || '',
            email: p?.email || user.email || '',
            nomor_telepon: p?.telepon || '',
            created_at: undefined,
            updated_at: undefined,
            ip_se: '',
            as_number_se: '',
            pengelola_se: p?.nama_perusahaan || '', // Default otomatis ke nama instansi
            fitur_se: '',
            seId: '',
            id_perusahaan: p?.id || '',
            id_sub_sektor: p?.sub_sektor?.id || '',
            id_csirt: '',
        };

        if (editId && se) {
            // ── EDIT MODE: overlay with SE-specific values ──────────────────
            initial.nama_perusahaan = se.perusahaan?.nama_perusahaan || se.nama_perusahaan || initial.nama_perusahaan;
            initial.jenis_usaha = se.sub_sektor?.nama_sub_sektor || se.jenis_usaha || initial.jenis_usaha;
            initial.nama_se = se.nama_se || '';
            initial.ip_se = se.ip_se || '';
            initial.as_number_se = se.as_number_se || '';
            initial.pengelola_se = se.pengelola_se || initial.pengelola_se;
            initial.fitur_se = se.fitur_se || '';
            initial.seId = se.id || '';
            initial.id_perusahaan = se.id_perusahaan || initial.id_perusahaan;
            initial.id_sub_sektor = se.id_sub_sektor || initial.id_sub_sektor;
            initial.id_csirt = se.id_csirt || resolvedCsirtId;
            initial.created_at = se.created_at || undefined;
            initial.updated_at = se.updated_at || undefined;

            setRespondent(initial);

            // Map API answer fields → KseAnswer objects
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
                setAnswers(apiAnswers);
                setIsSubmitted(true);
                setCurrentStep(2); // jump straight to assessment tab
            }
        } else if (!editId) {
            // ── ADD MODE: start blank but auto-fill id_csirt from company CSIRT ───
            const addInitial = { ...initial, id_csirt: resolvedCsirtId };
            setRespondent(addInitial);
            setAnswers({});
            setIsSubmitted(false);
            setCurrentStep(1);
        }
    }, [user, perusahaanId, pData, existingSe, editId, seById, resolvedCsirtId]);

    // ── Persist answers on change ────────────────────────────────────────────
    useEffect(() => {
        if (slug === 'default') return;
        localStorage.setItem(ANSWERS_KEY, JSON.stringify({ answers, isSubmitted }));
    }, [answers, isSubmitted, ANSWERS_KEY, slug]);

    const buildEditablePayload = useCallback(() => {
        const penilaianPayload: Record<string, string> = {};
        Object.entries(answers).forEach(([qNo, ans]) => {
            const field = QUESTION_TO_FIELD[qNo];
            if (field && ans.selectedOption) {
                penilaianPayload[field] = ans.selectedOption;
            }
        });

        const payload: Record<string, any> = {
            ...penilaianPayload,
            nama_se: respondent.nama_se.trim(),
            ip_se: respondent.ip_se.trim(),
            as_number_se: respondent.as_number_se.trim(),
            pengelola_se: respondent.pengelola_se.trim(),
            fitur_se: respondent.fitur_se.trim(),
        };

        if (respondent.id_perusahaan) payload.id_perusahaan = respondent.id_perusahaan;
        if (respondent.id_sub_sektor) payload.id_sub_sektor = respondent.id_sub_sektor;

        return payload;
    }, [answers, respondent]);

    const originalEditablePayload = useMemo(() => {
        if (!editId || !existingSe) return {};

        const initialPayload: Record<string, any> = {
            nama_se: normalizeValue(existingSe.nama_se),
            ip_se: normalizeValue(existingSe.ip_se),
            as_number_se: normalizeValue(existingSe.as_number_se),
            pengelola_se: normalizeValue(existingSe.pengelola_se),
            fitur_se: normalizeValue(existingSe.fitur_se),
        };

        if (existingSe.id_perusahaan) initialPayload.id_perusahaan = normalizeValue(existingSe.id_perusahaan);
        if (existingSe.id_sub_sektor) initialPayload.id_sub_sektor = normalizeValue(existingSe.id_sub_sektor);

        Object.values(QUESTION_TO_FIELD).forEach((field) => {
            const value = normalizeValue(existingSe[field]);
            if (value) initialPayload[field] = value;
        });

        return initialPayload;
    }, [editId, existingSe]);

    const pendingChanges = useMemo<KseChangePreviewItem[]>(() => {
        if (!editId) return [];
        const currentPayload = buildEditablePayload();
        const keys = Array.from(new Set([...Object.keys(originalEditablePayload), ...Object.keys(currentPayload)]));

        return keys
            .map((field) => {
                const oldValue = normalizeValue(originalEditablePayload[field]);
                const newValue = normalizeValue(currentPayload[field]);
                if (oldValue === newValue) return null;
                return {
                    field,
                    label: FIELD_LABELS[field] || field,
                    oldValue: oldValue || 'Kosong',
                    newValue: newValue || 'Kosong',
                };
            })
            .filter((item): item is KseChangePreviewItem => item != null);
    }, [editId, buildEditablePayload, originalEditablePayload]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleRespondentChange = (field: keyof KseRespondentProfile, value: string) => {
        if (isEditLocked) return;
        setRespondent(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const validateRespondentForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!respondent.nama_se.trim()) errors.nama_se = 'Nama sistem elektronik wajib diisi';
        if (!respondent.ip_se?.trim()) errors.ip_se = 'IP SE wajib diisi';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRespondentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditLocked) return;
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

    const handleEditData = () => {
        if (isEditLocked) return;
        setCurrentStep(1);
    };

    const handleEditAnswers = () => {
        if (isEditLocked) return;
        setIsSubmitted(false);
        toast({ title: "Mode edit aktif", description: "Silakan ubah jawaban Anda." });
    };

    const handleOpenConfirmChanges = () => {
        if (isEditLocked) {
            toast({ title: editRequestMeta.label, description: editRequestMeta.description, variant: "destructive" });
            return;
        }
        if (!isAllAnswered) {
            toast({ title: "Jawaban belum lengkap", description: "Lengkapi seluruh pertanyaan sebelum mengajukan perubahan.", variant: "destructive" });
            return;
        }
        if (!pendingChanges.length) {
            toast({ title: "Belum ada perubahan", description: "Ubah minimal satu data sebelum mengajukan perubahan." });
            return;
        }
        setShowConfirmModal(true);
    };

    const handleSubmitEditRequest = async () => {
        if (!respondent.seId) return;
        if (!editReason.trim()) {
            toast({ title: "Catatan wajib diisi", description: "Tuliskan alasan perubahan sebelum submit.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const currentPayload = buildEditablePayload();
            const dataPerubahan = pendingChanges.reduce<Record<string, any>>((acc, item) => {
                acc[item.field] = currentPayload[item.field];
                return acc;
            }, {});

            await api.requestKseEdit(respondent.seId, {
                catatan_user: editReason.trim(),
                data_perubahan: dataPerubahan,
            });

            await queryClient.invalidateQueries({ queryKey: ["se"] });
            await queryClient.invalidateQueries({ queryKey: ["se-edit-requests"] });
            await queryClient.invalidateQueries({ queryKey: ["se", String(respondent.seId)] });

            setShowConfirmModal(false);
            setEditReason('');
            toast({
                title: "Perubahan diajukan",
                description: "Draft perubahan berhasil dikirim dan menunggu persetujuan admin.",
            });
            navigate('/dashboard/kse');
        } catch (e: any) {
            toast({
                title: "Gagal mengajukan perubahan",
                description: e?.message || "Request perubahan belum berhasil dikirim.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndExit = async () => {
        if (isEditLocked) {
            toast({ title: editRequestMeta.label, description: editRequestMeta.description, variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const payload: any = {
                ...buildEditablePayload(),
                kategori_se: kategoriSE.kategori,
                total_bobot: totalBobot,
            };
            // id_csirt is REQUIRED by the backend FK constraint — always include it
            const csirtId = respondent.id_csirt || resolvedCsirtId;
            if (csirtId) payload.id_csirt = csirtId;

            if (isAllAnswered) {
                if (!respondent.seId) {
                    const created = await csirtService.createSe(payload);
                    setRespondent(prev => ({ ...prev, seId: created.id }));
                    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...respondent, seId: created.id }));
                } else {
                    setIsSaving(false);
                    handleOpenConfirmChanges();
                    return;
                }
                await queryClient.invalidateQueries({ queryKey: ["se"] });
                await queryClient.invalidateQueries({ queryKey: ["se-edit-requests"] });
                setIsSubmitted(true);
                toast({ title: "Berhasil!", description: "Assessment berhasil diselesaikan dan disimpan." });
                setTimeout(() => navigate('/dashboard/kse'), 1200);
            } else {
                toast({ title: "Tersimpan", description: "Data berhasil disimpan sementara." });
            }
        } catch (e: any) {
            const errMsg = e?.message || "Data tersimpan secara lokal. Sinkronisasi ke server gagal.";
            toast({ title: "Gagal Menyimpan", description: errMsg, variant: "destructive" });
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
                    <div className="button-force-white flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 ring-1 ring-white/20">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="font-black text-slate-900 font-display text-xl">
                            {currentStep === 1 ? 'Data Responden' : 'Penilaian Kategorisasi Sistem Elektronik'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {currentStep === 1 ? 'Lengkapi informasi instansi dan sistem elektronik yang akan dinilai.' : 'Jawab pertanyaan kategorisasi sistem elektronik.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/kse')}
                        className={`${SECONDARY_BUTTON_CLS} px-4`}
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
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${currentStep >= 1 ? 'button-force-white border-blue-500 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                            </div>
                            <span className={`text-xs font-bold leading-none ${currentStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Responden</span>
                        </div>

                        <div className="w-16"></div>

                        <div className="flex flex-col items-center gap-2 bg-white px-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${currentStep >= 2 ? 'button-force-white border-blue-500 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
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
                                    {editId && (
                                        <div className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-5 ${editRequestMeta.badgeClassName}`}>
                                            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold">{editRequestMeta.label}</p>
                                                <p className="text-[13px] opacity-90">{editRequestMeta.description}</p>
                                                {latestEditRequest?.catatan_user && (
                                                    <p className="text-[13px] opacity-90 mt-1">Catatan user: {latestEditRequest.catatan_user}</p>
                                                )}
                                                {latestEditRequest?.catatan && (
                                                    <p className="text-[13px] opacity-90 mt-1">Catatan admin: {latestEditRequest.catatan}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleRespondentSubmit} noValidate>
                                        <fieldset disabled={isEditLocked} className={isEditLocked ? 'opacity-80' : ''}>
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

                                            {/* ── DETAIL SISTEM ELEKTRONIK ── */}
                                            <div className="md:col-span-2 mt-4 mb-1">
                                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Server className="w-4 h-4" /> DETAIL SISTEM ELEKTRONIK
                                                </h3>
                                                <hr className="border-slate-100 mt-2" />
                                            </div>

                                            {/* IP SE */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">IP SE <span className="text-red-500">*</span></label>
                                                <input type="text" placeholder="Contoh: 192.168.1.1" value={respondent.ip_se || ''} onChange={e => handleRespondentChange('ip_se', e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition ${formErrors.ip_se ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-white/80'}`} />
                                                {formErrors.ip_se && <p className="text-red-500 text-xs mt-1">{formErrors.ip_se}</p>}
                                            </div>

                                            {/* AS Number */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">AS Number</label>
                                                <input type="text" placeholder="Contoh: AS12345" value={respondent.as_number_se || ''} onChange={e => handleRespondentChange('as_number_se', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition" />
                                            </div>

                                            {/* Pengelola */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Pengelola</label>
                                                <input type="text" readOnly value={respondent.pengelola_se || ''}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm cursor-not-allowed" />
                                            </div>

                                            {/* Fitur SE */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Fitur SE</label>
                                                <input type="text" placeholder="Contoh: Firewall, IDS" value={respondent.fitur_se || ''} onChange={e => handleRespondentChange('fitur_se', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition" />
                                            </div>


                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/dashboard/kse')}
                                                    className={SECONDARY_BUTTON_CLS}
                                                >
                                                    <ArrowLeft className="w-4 h-4" /> Kembali
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isEditLocked}
                                                    className={`${editId ? PRIMARY_BUTTON_CLS : SUCCESS_BUTTON_CLS} w-full sm:w-auto disabled:opacity-60 disabled:hover:translate-y-0`}
                                                >
                                                    {editId ? 'Lanjut ke Perubahan KSE' : 'Mulai Kategorisasi'}
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ══════════════════ STEP 2: KSE Assessment ══════════════════ */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {editId && (
                                <div className={`mb-5 flex items-start gap-3 rounded-2xl px-4 py-3 ${editRequestMeta.badgeClassName}`}>
                                    <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">{editRequestMeta.label}</p>
                                        <p className="text-[13px] opacity-90">{editRequestMeta.description}</p>
                                        {latestEditRequest?.catatan_user && (
                                            <p className="text-[13px] opacity-90 mt-1">Catatan user: {latestEditRequest.catatan_user}</p>
                                        )}
                                        {latestEditRequest?.catatan && (
                                            <p className="text-[13px] opacity-90 mt-1">Catatan admin: {latestEditRequest.catatan}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                                {/* ── Sidebar ── */}
                                <div className="lg:col-span-1 lg:self-start">
                                    <div className="sticky top-2 z-20 h-fit space-y-4">

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
                                                        disabled={isSaving || isEditLocked}
                                                        className={`button-force-white relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] px-4 py-3 text-[13px] font-bold transition-all duration-300
                                                                ${isAllAnswered
                                                                ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 hover:-translate-y-0.5 hover:from-emerald-800 hover:via-emerald-700 hover:to-green-600'
                                                                : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:-translate-y-0.5 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-600'
                                                            }
                                                                disabled:opacity-50`}
                                                    >
                                                        {isSaving ? (
                                                            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                                                        ) : editId ? (
                                                            <><CheckCircle2 className="w-4 h-4" /> Konfirmasi Perubahan</>
                                                        ) : isAllAnswered ? (
                                                            <><CheckCircle2 className="w-4 h-4" /> Simpan &amp; Selesai</>
                                                        ) : (
                                                            <><Save className="w-4 h-4" /> Simpan Sementara</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={handleEditData}
                                                        disabled={isEditLocked}
                                                        className={`${EDIT_BUTTON_CLS} w-full disabled:opacity-60 disabled:hover:translate-y-0`}
                                                    >
                                                        <Edit2 className="w-4 h-4" /> Edit Data Responden
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={handleEditAnswers}
                                                    disabled={isEditLocked}
                                                    className={`${EDIT_BUTTON_CLS} w-full disabled:opacity-60 disabled:hover:translate-y-0`}
                                                >
                                                    <Edit2 className="w-4 h-4" /> Ubah Draft Perubahan
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
                                                <div className="button-force-white flex h-11 w-11 min-w-[44px] items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-indigo-400 ring-1 ring-white/20">
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
                                                    readonly={isSubmitted || isEditLocked}
                                                    onAnswer={handleAnswer}
                                                />
                                            ))}

                                            {/* Pagination */}
                                            {totalPagesInCategory > 1 && (
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
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AppModal
                    open={showConfirmModal}
                    onOpenChange={setShowConfirmModal}
                    title="Konfirmasi Perubahan"
                    description="Tinjau kembali data kategorisasi sistem elektronik yang berubah. Setelah dikirim, perubahan akan menunggu persetujuan admin sebelum diterapkan."
                    contentClassName="sm:max-w-2xl"
                    footer={
                        <>
                            <AppButton
                                type="button"
                                variant="ghost"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </AppButton>
                            <AppButton
                                type="button"
                                onClick={handleSubmitEditRequest}
                                disabled={isSaving || !editReason.trim() || !pendingChanges.length}
                                loading={isSaving}
                                leftIcon={!isSaving ? <Send className="w-4 h-4" /> : undefined}
                            >
                                Submit Perubahan
                            </AppButton>
                        </>
                    }
                >
                    <div className="space-y-4 py-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center gap-2 mb-3 text-slate-700">
                                    <Eye className="w-4 h-4" />
                                    <p className="text-sm font-bold">Data yang Diubah</p>
                                </div>
                                <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                                    {pendingChanges.map((item) => (
                                        <div key={item.field} className="rounded-xl border border-slate-200 bg-white p-3">
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                                            <div className="mt-2 grid gap-2 md:grid-cols-2">
                                                <div className="rounded-lg bg-rose-50 px-3 py-2">
                                                    <p className="text-[11px] font-semibold text-rose-500">Data saat ini</p>
                                                    <p className="text-sm text-slate-700">{item.oldValue}</p>
                                                </div>
                                                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                                                    <p className="text-[11px] font-semibold text-emerald-600">Data usulan</p>
                                                    <p className="text-sm text-slate-700">{item.newValue}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <AppTextarea
                                label="Alasan Edit"
                                value={editReason}
                                onChange={(e) => setEditReason(e.target.value)}
                                placeholder="Jelaskan alasan perubahan data kategorisasi sistem elektronik yang diajukan."
                                className="min-h-[120px]"
                            />
                        </div>
                </AppModal>
            </div>
        </RequireCompanyProfile>
    );
}
