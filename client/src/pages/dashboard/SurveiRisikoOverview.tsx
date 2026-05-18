import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    CircleDashed,
    ClipboardList,
    Clock3,
    FilePenLine,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useUser } from "@/hooks/useAuth";
import { useSurveyStore } from "@/stores/survey.store";
import { STATIC_SURVEY_RISKS } from "@/data/survey-static";

const PRIMARY_BUTTON_CLS = "button-force-white dashboard-primary-button inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50";
const SECONDARY_BUTTON_CLS = "button-force-white dashboard-secondary-button inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5";
const WARNING_BUTTON_CLS = "button-force-white dashboard-warning-button inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5";
const CARD_CLS = "dashboard-section-card rounded-[1.75rem] border p-6 shadow-sm";

function getSurveyStatusLabel(
    hasRespondent: boolean,
    completed: boolean,
    currentRiskNumber: number | null,
    totalRiskCount: number | null,
) {
    if (!hasRespondent) return "Belum dimulai";
    if (completed) return "Survei selesai";
    return "Data responden sudah tersimpan";
}

export default function SurveiRisikoOverview() {
    const navigate = useNavigate();
    const { data: user } = useUser();
    const { perusahaan, isResolvingPerusahaan } = useCompanyProfile(user ?? null);
    const fetchCurrentRespondent = useSurveyStore((state) => state.fetchCurrentRespondent);
    const currentRespondent = useSurveyStore((state) => state.currentRespondent);
    const progress = useSurveyStore((state) => state.progress);
    const nextStep = useSurveyStore((state) => state.nextStep);
    const loading = useSurveyStore((state) => state.loading);

    useEffect(() => {
        void fetchCurrentRespondent();
    }, [fetchCurrentRespondent]);

    const hasRespondent = Boolean(currentRespondent?.id);
    const surveyCompleted = Boolean(progress?.completed || progress?.finished_at);
    const currentRiskNumber = typeof progress?.current_risk === "number" ? progress.current_risk + 1 : null;
    const totalRiskCount = STATIC_SURVEY_RISKS.length;
    const progressPercent = !hasRespondent
        ? 0
        : surveyCompleted
            ? 100
            : currentRiskNumber !== null && totalRiskCount > 0
                ? Math.round((currentRiskNumber / totalRiskCount) * 100)
                : 12;
    const surveyStatus = getSurveyStatusLabel(hasRespondent, surveyCompleted, currentRiskNumber, totalRiskCount);
    const statusTitle = !hasRespondent
        ? "Mulai asesmen risiko dari data responden"
        : surveyCompleted
            ? "Survei profil risiko Anda sudah selesai"
            : "Survei profil risiko siap untuk dilanjutkan";
    const statusDescription = !hasRespondent
        ? "Lengkapi data responden terlebih dahulu agar sistem dapat menyiapkan alur penilaian risiko yang sesuai dengan organisasi Anda."
        : surveyCompleted
            ? "Anda telah selesai mengisi survei."
            : "Data responden sudah tersedia. Anda dapat langsung melanjutkan pengisian risiko dari progres terakhir.";
    const primaryLabel = !hasRespondent
        ? "Isi Data Responden"
        : surveyCompleted
            ? null
            : "Lanjutkan Survei";
    const primaryAction = () => {
        navigate(hasRespondent ? "/survei-resiko/form" : "/survei-resiko/form?step=responden");
    };
    const secondaryLabel = hasRespondent ? "Perbarui Data Responden" : "Kembali ke Dashboard";
    const secondaryAction = () => {
        navigate(hasRespondent ? "/survei-resiko/form?step=responden" : "/dashboard");
    };
    const recommendation = !hasRespondent
        ? "Lengkapi identitas responden untuk membuka seluruh tahapan survei."
        : surveyCompleted
            ? "Tinjau jawaban terakhir atau lakukan pembaruan data responden jika ada perubahan organisasi."
            : nextStep
                ? `Tahap berikutnya yang terdeteksi: ${nextStep}.`
                : "Lanjutkan ke risiko berikutnya sesuai progres terakhir yang tersimpan.";

    const isRespondentLoading = loading && !currentRespondent;
    const isSurveyStatusLoading = loading && hasRespondent && !progress;
    const instansiValue = currentRespondent?.nama_perusahaan || perusahaan?.nama_perusahaan || null;
    const isInstansiLoading = !instansiValue && (loading || isResolvingPerusahaan);

    const summaryItems = [
        {
            label: "Status Responden",
            value: hasRespondent ? "Sudah tersedia" : "Belum tersedia",
            icon: UserRound,
            loading: isRespondentLoading,
        },
        {
            label: "Status Survei",
            value: surveyStatus,
            icon: surveyCompleted ? CheckCircle2 : Clock3,
            loading: isSurveyStatusLoading,
        },
        {
            label: "Instansi",
            value: instansiValue || "Belum tersedia",
            icon: ShieldCheck,
            loading: isInstansiLoading,
        },
    ];

    const phases = [
        {
            title: "Data Responden",
            description: hasRespondent
                ? `Tersimpan atas nama ${currentRespondent?.nama_lengkap || "responden"}.`
                : "Belum diisi. Tahap ini wajib sebelum penilaian risiko dimulai.",
            done: hasRespondent,
        },
        {
            title: "Penilaian Risiko",
            description: surveyCompleted
                ? "Seluruh risiko sudah ditinjau dan disimpan."
                : hasRespondent
                    ? currentRiskNumber !== null
                        ? `Sedang berada di risiko ${currentRiskNumber}${totalRiskCount ? ` dari ${totalRiskCount}` : ""}.`
                        : "Siap dimulai setelah data responden dikonfirmasi."
                    : "Akan tersedia setelah data responden lengkap.",
            done: surveyCompleted,
        },
    ];

    return (
        <RequireCompanyProfile>
            <div className="dashboard-page-wrap relative min-h-screen overflow-hidden font-sans">
                <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-20 sm:px-6">
                    <PageHeader
                        icon={ClipboardList}
                        title="Survei Profil Risiko"
                        subtitle="Cek status pengisian Anda terlebih dahulu, lalu lanjutkan ke langkah yang paling relevan sesuai progres organisasi."
                    />

                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="relative overflow-hidden rounded-[2rem] border p-7 shadow-xl sm:p-8"
                        style={{
                            background: "linear-gradient(135deg, var(--dashboard-page-header-panel), var(--dashboard-surface))",
                            borderColor: "var(--dashboard-border)",
                        }}
                    >
                        <div className="absolute inset-0 opacity-70" style={{ background: "var(--dashboard-page-header-overlay)" }} />
                        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: "var(--dashboard-text)" }}>
                                        {statusTitle}
                                    </h2>
                                    <p className="max-w-2xl text-sm leading-7 sm:text-base" style={{ color: "var(--dashboard-text-soft)" }}>
                                        {statusDescription}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--dashboard-text-muted)" }}>
                                        <span>Progress</span>
                                        <span>{progressPercent}%</span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full" style={{ background: "var(--dashboard-progress-track)" }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${progressPercent}%`,
                                                background: "linear-gradient(90deg, #f59e0b 0%, #fb923c 100%)",
                                            }}
                                        />
                                    </div>
                                </div>
                                {!surveyCompleted ? (
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button type="button" onClick={primaryAction} className={PRIMARY_BUTTON_CLS}>
                                            {primaryLabel}
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={secondaryAction} className={hasRespondent ? WARNING_BUTTON_CLS : SECONDARY_BUTTON_CLS}>
                                            {secondaryLabel}
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <div className={`${CARD_CLS} space-y-4`} style={{ borderColor: "var(--dashboard-border)" }}>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--dashboard-text-muted)" }}>
                                        Ringkasan
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {summaryItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={item.label}
                                                className="flex items-start gap-3 rounded-2xl border p-4"
                                                style={{ borderColor: "var(--dashboard-border)", background: "var(--dashboard-surface)" }}
                                            >
                                                <div
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                                                    style={{ background: "var(--dashboard-card-chip)", color: "var(--dashboard-selection-text)" }}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--dashboard-text-muted)" }}>
                                                        {item.label}
                                                    </p>
                                                    {item.loading ? (
                                                        <Skeleton className="mt-2 h-5 w-32 rounded-lg" />
                                                    ) : (
                                                        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--dashboard-text)" }}>
                                                            {item.value}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <section className="grid gap-5 lg:grid-cols-2">
                        {phases.map((phase, index) => (
                            <motion.article
                                key={phase.title}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.08 }}
                                className={`${CARD_CLS} h-full`}
                                style={{ borderColor: "var(--dashboard-border)" }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                                        style={{
                                            background: phase.done ? "rgba(16, 185, 129, 0.12)" : "var(--dashboard-card-chip)",
                                            color: phase.done ? "#059669" : "var(--dashboard-selection-text)",
                                        }}
                                    >
                                        {phase.done ? <CheckCircle2 className="h-6 w-6" /> : <FilePenLine className="h-6 w-6" />}
                                    </div>
                                    <span className="dashboard-chip-info rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                                        {phase.done ? "Selesai" : "Tahap aktif"}
                                    </span>
                                </div>
                                <h3 className="mt-5 text-lg font-black tracking-tight" style={{ color: "var(--dashboard-text)" }}>
                                    {phase.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7" style={{ color: "var(--dashboard-text-soft)" }}>
                                    {phase.description}
                                </p>
                            </motion.article>
                        ))}
                    </section>
                </div>
            </div>
        </RequireCompanyProfile>
    );
}
