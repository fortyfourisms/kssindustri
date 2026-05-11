import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  File,
  FileText,
  Loader2,
  PlayCircle,
  Save,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { buildYoutubeEmbed, lmsService } from "@/features/lms/services/lms.service";
import {
  getLinkedQuizzesForMateri,
  getNextCourseStep,
  isMateriAccessible,
  isQuizPassed,
  sortMateriByOrder,
  useLmsStore,
} from "@/features/lms/stores/lms.store";
import { getCourseLearnRoute, getCourseQuizRoute, getCourseRoute, getCoursesRoute } from "@/features/lms/lib/lms-routes";
import { Skeleton } from "@/components/ui/skeleton";

const TABS = [
  { key: "materi", label: "Materi", icon: BookOpen },
  { key: "materi_pendukung", label: "Materi Pendukung", icon: File },
  { key: "feedback", label: "Feedback", icon: StickyNote },
];

function FilesTab() {
  const { materiFiles, isLoadingMateri } = useLmsStore();

  const handleDownload = (fileId: string) => {
    window.location.assign(lmsService.downloadFile(fileId));
  };

  if (isLoadingMateri) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (materiFiles.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <File className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">Belum ada file pendukung</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {materiFiles.map((file) => (
        <div key={file.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 line-clamp-1">{file.nama_file}</p>
            {file.ukuran > 0 && (
              <p className="text-xs text-slate-400 font-medium">
                {file.ukuran >= 1024 * 1024 ? `${(file.ukuran / (1024 * 1024)).toFixed(1)} MB` : `${(file.ukuran / 1024).toFixed(0)} KB`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleDownload(file.id)}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white transition-all duration-300 hover:bg-blue-700"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh
          </button>
        </div>
      ))}
    </div>
  );
}

function FeedbackTab({ materiId }: { materiId: string }) {
  const { saveFeedback } = useLmsStore();
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveFeedback(materiId, feedback);
    setSaving(false);
    if (result.success) {
      setDirty(false);
      toast.success("Feedback tersimpan");
    } else {
      toast.error(result.error ?? "Gagal menyimpan feedback");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">Tulis feedback Anda tentang materi ini</p>
        {dirty && <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg">Belum tersimpan</span>}
      </div>
      <p className="text-xs text-slate-400">
        Feedback disimpan saat Anda menekan tombol simpan.
      </p>
      <textarea
        value={feedback}
        onChange={(e) => {
          setFeedback(e.target.value);
          setDirty(true);
        }}
        placeholder="Tuliskan feedback Anda di sini..."
        rows={12}
        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition resize-none leading-relaxed"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Feedback
        </button>
      </div>
    </div>
  );
}

export default function LMSLearn() {
  const navigate = useNavigate();
  const { courseId, materiId } = useParams<{ courseId: string; materiId: string }>();
  const [activeTab, setActiveTab] = useState("materi");

  const {
    activeCourse,
    courseMateri,
    courseQuizzes,
    completedMateriIds,
    quizProgressById,
    activeMateri,
    isLoadingMateri,
    materiError,
    setActiveMateri,
    loadMateriDetail,
    markMateriCompleted,
    resetMateri,
  } = useLmsStore();

  useEffect(() => {
    if (!materiId) return;
    const found = courseMateri.find((m) => m.id === materiId);
    if (found) setActiveMateri(found);
    if (isMateriAccessible(sortMateriByOrder(courseMateri), materiId, completedMateriIds, courseQuizzes, quizProgressById)) {
      loadMateriDetail(materiId);
    }
    return () => {
      resetMateri();
    };
  }, [materiId, courseMateri, completedMateriIds, courseQuizzes, quizProgressById, setActiveMateri, loadMateriDetail, resetMateri]);

  const materi = activeMateri;
  const sortedMateri = sortMateriByOrder(courseMateri);
  const linkedQuizzes = materiId ? getLinkedQuizzesForMateri(materiId, courseQuizzes) : [];
  const isCompleted = materiId ? completedMateriIds.has(materiId) : false;
  const embedUrl = materi?.tipe === "video" && materi.youtube_id ? buildYoutubeEmbed(materi.youtube_id) : null;
  const isAccessible = materiId ? isMateriAccessible(sortedMateri, materiId, completedMateriIds, courseQuizzes, quizProgressById) : false;
  const nextStep = getNextCourseStep(sortedMateri, courseQuizzes, completedMateriIds, quizProgressById);
  const currentQuizPassed = linkedQuizzes.every((quiz) => isQuizPassed(quiz.id, quizProgressById));

  const navigateToNextStep = () => {
    if (!courseId) return;

    if (!isCompleted) return;

    if (linkedQuizzes.length > 0 && !currentQuizPassed) {
      navigate(getCourseQuizRoute(courseId, linkedQuizzes[0].id));
      return;
    }

    if (nextStep?.type === "materi") {
      navigate(getCourseLearnRoute(courseId, nextStep.id));
      return;
    }

    if (nextStep?.type === "quiz") {
      navigate(getCourseQuizRoute(courseId, nextStep.id));
      return;
    }

    navigate(getCourseRoute(courseId));
  };

  useEffect(() => {
    if (!courseId || !materiId || sortedMateri.length === 0) return;
    if (isAccessible) return;

    const fallbackStep = getNextCourseStep(sortedMateri, courseQuizzes, completedMateriIds, quizProgressById);
    if (fallbackStep?.type === "materi") {
      navigate(getCourseLearnRoute(courseId, fallbackStep.id), { replace: true });
    } else if (fallbackStep?.type === "quiz") {
      navigate(getCourseQuizRoute(courseId, fallbackStep.id), { replace: true });
    } else {
      navigate(getCourseRoute(courseId), { replace: true });
    }
  }, [courseId, materiId, sortedMateri, courseQuizzes, completedMateriIds, quizProgressById, isAccessible, navigate]);

  const handleSelesai = async () => {
    const completedAfterAction = new Set(completedMateriIds);

    if (!isCompleted && materiId) {
      const completedResult = await markMateriCompleted(materiId);
      if (!completedResult.success) {
        toast.error(completedResult.error ?? "Gagal menandai materi selesai");
        return;
      }
      completedAfterAction.add(materiId);
      toast.success("Materi ditandai selesai");
    }

    if (!courseId) return;

    if (linkedQuizzes.length > 0) {
      navigate(getCourseQuizRoute(courseId, linkedQuizzes[0].id));
      return;
    }

    const nextStepAfterCompletion = getNextCourseStep(sortedMateri, courseQuizzes, completedAfterAction, quizProgressById);
    if (nextStepAfterCompletion?.type === "materi") {
      navigate(getCourseLearnRoute(courseId, nextStepAfterCompletion.id));
      return;
    }

    if (nextStepAfterCompletion?.type === "quiz") {
      navigate(getCourseQuizRoute(courseId, nextStepAfterCompletion.id));
      return;
    }

    navigate(getCourseRoute(courseId));
  };

  return (
    <div className="flex h-full w-full flex-col pt-2 lg:pt-6">
      {materi && (
        <div className="mb-6 px-4 sm:px-6 lg:mb-8 lg:px-8">
          <div className="min-w-0 text-sm font-medium leading-relaxed text-slate-400">
            <span className="hover:text-slate-600 cursor-pointer transition-colors" onClick={() => navigate(getCoursesRoute())}>
              Kelas Saya
            </span>
            <span className="mx-2">/</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors" onClick={() => navigate(getCourseRoute(courseId!))}>
              {activeCourse?.judul || "Kelas"}
            </span>
            <span className="mx-2">/</span>
            <span className="break-words font-bold text-slate-600">{materi.judul}</span>
          </div>
        </div>
      )}

      <div className="session-scrollbar content-area-padding flex-1 overflow-y-auto px-4 pb-12 sm:px-6 lg:px-8">
        {!materi && isLoadingMateri && (
          <div className="flex flex-col items-center py-24">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-slate-400 font-medium">Memuat materi...</p>
          </div>
        )}

        {!materi && materiError && (
          <div className="flex flex-col items-center py-24 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <h3 className="text-base font-black text-slate-700 mb-1">Gagal Memuat Materi</h3>
            <p className="text-sm text-slate-400">{materiError}</p>
          </div>
        )}

        {materi && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl">
            <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] overflow-hidden">
              <div className="relative overflow-hidden bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#60efff] p-5 sm:p-6 lg:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_30%)]" />
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3 text-white/80 text-[11px] font-black uppercase tracking-[0.22em]">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Modul Pembelajaran
                    </span>
                    {materi.tipe === "video" && materi.durasi_detik && (
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="w-3.5 h-3.5" />
                        {Math.ceil(materi.durasi_detik / 60)} menit
                      </span>
                    )}
                  </div>
                  <h1 className="mt-4 max-w-4xl text-2xl font-black leading-tight text-white sm:text-[28px] lg:text-[34px]">{materi.judul}</h1>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/85 lg:text-base">
                    {materi.deskripsi_singkat || "Pelajari materi ini sampai tuntas, lalu tandai selesai ketika Anda sudah benar-benar memahami isinya."}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 px-4 pt-4 lg:px-6">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 relative">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {TABS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === key ? "text-blue-700" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        <Icon className="w-4 h-4 hidden sm:block" />
                        {label}
                        {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-700 rounded-t-full" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "materi" && (
                <motion.div key="materi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] overflow-hidden">
                    {materi.tipe === "video" ? (
                      embedUrl ? (
                        <div className="w-full aspect-[16/9] xl:aspect-[21/9] bg-[#111827] overflow-hidden relative shadow-inner">
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={embedUrl}
                            title={materi.judul}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[16/9] xl:aspect-[21/9] bg-[#111827] overflow-hidden flex flex-col items-center justify-center text-slate-500 shadow-inner">
                          <PlayCircle className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-sm font-medium">Video belum tersedia</p>
                        </div>
                      )
                    ) : (
                      <div className="min-h-[320px] w-full bg-white p-5 sm:p-6 md:p-10">
                        {materi.konten_html ? (
                          <div className="prose prose-slate max-w-none break-words text-slate-600 prose-headings:font-display prose-headings:text-slate-900 prose-img:h-auto prose-img:w-full prose-img:rounded-2xl prose-pre:overflow-x-auto" dangerouslySetInnerHTML={{ __html: materi.konten_html }} />
                        ) : materi.deskripsi_singkat ? (
                          <p className="text-base leading-relaxed text-slate-600 font-medium">{materi.deskripsi_singkat}</p>
                        ) : (
                          <p className="text-slate-400 font-medium italic">Materi teks masih kosong.</p>
                        )}
                      </div>
                    )}

                    <div className={`border-t border-slate-200 bg-white p-4 transition-all md:p-5 ${isCompleted ? "bg-teal-50/30" : ""}`}>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <span className="text-[15px] font-medium text-slate-600 md:pl-2">{isCompleted ? "Anda sudah memahami materi ini." : "Apakah sudah paham?"}</span>
                      <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
                        {isCompleted ? (
                          <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-5 text-sm font-bold text-teal-700">
                            <CheckCircle2 className="w-4 h-4" /> Selesai
                          </div>
                        ) : (
                          <button
                            onClick={handleSelesai}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 text-sm font-bold text-white transition-all duration-300 shadow-sm shadow-cyan-500/20 hover:from-teal-600 hover:to-cyan-600 md:w-auto"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Ya, Saya Sudah Paham
                          </button>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "materi_pendukung" && (
                <motion.div key="files" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] p-6 md:p-8">
                    <FilesTab />
                  </div>
                </motion.div>
              )}

              {activeTab === "feedback" && materiId && (
                <motion.div key="feedback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] p-6 md:p-8">
                    <FeedbackTab materiId={materiId} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex justify-end">
              <button
                onClick={navigateToNextStep}
                disabled={!isCompleted}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:text-blue-700 disabled:border-slate-100 disabled:text-slate-300 sm:w-auto"
              >
                Berikutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
