import { useEffect, useRef, useState } from "react";
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
  MessageSquare,
  PlayCircle,
  Save,
  Send,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { buildYoutubeEmbed } from "@/features/lms/services/lms.service";
import { useLmsStore } from "@/features/lms/stores/lms.store";

const TABS = [
  { key: "materi", label: "Materi", icon: BookOpen },
  { key: "materi_pendukung", label: "Materi Pendukung", icon: File },
  { key: "diskusi", label: "Diskusi", icon: MessageSquare },
  { key: "catatan", label: "Catatan Pribadi", icon: StickyNote },
];

function FilesTab() {
  const { materiFiles, isLoadingMateri } = useLmsStore();

  if (isLoadingMateri) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
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
          <a
            href={`/api/file-pendukung/${file.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh
          </a>
        </div>
      ))}
    </div>
  );
}

function DiscussionTab({ materiId }: { materiId: string }) {
  const { materiDiscussion, isLoadingMateri, postDiscussion } = useLmsStore();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const result = await postDiscussion(materiId, newMessage.trim());
    setSending(false);
    if (result.success) {
      setNewMessage("");
      toast.success("Pesan berhasil dikirim");
    } else {
      toast.error(result.error ?? "Gagal mengirim pesan");
    }
  };

  if (isLoadingMateri) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        {materiDiscussion.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500">Belum ada diskusi. Jadilah yang pertama!</p>
          </div>
        ) : (
          materiDiscussion.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                {(item.user?.name ?? "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-800">{item.user?.name ?? "Pengguna"}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100">{item.konten}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-3 sticky bottom-0 bg-white/80 backdrop-blur-sm pt-4 border-t border-slate-100">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Tulis pesan diskusi..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl transition-colors flex items-center gap-2 font-bold text-sm"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Kirim
        </button>
      </div>
    </div>
  );
}

function NotesTab({ materiId }: { materiId: string }) {
  const { materiNotes, saveNotes } = useLmsStore();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (materiNotes && !initialized.current) {
      setNotes(materiNotes.konten);
      initialized.current = true;
    }
  }, [materiNotes]);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveNotes(materiId, notes);
    setSaving(false);
    if (result.success) {
      setDirty(false);
      toast.success("Catatan tersimpan");
    } else {
      toast.error(result.error ?? "Gagal menyimpan catatan");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">Tulis catatan pribadi Anda tentang materi ini</p>
        {dirty && <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg">Belum tersimpan</span>}
      </div>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setDirty(true);
        }}
        placeholder="Tuliskan catatan Anda di sini..."
        rows={12}
        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition resize-none leading-relaxed"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Catatan
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
    loadMateriDetail(materiId);
    return () => {
      resetMateri();
    };
  }, [materiId, courseMateri, setActiveMateri, loadMateriDetail, resetMateri]);

  const materi = activeMateri;
  const sortedMateri = [...courseMateri].sort((a, b) => a.urutan - b.urutan);
  const currentIndex = sortedMateri.findIndex((m) => m.id === materiId);
  const nextMateri = currentIndex >= 0 && currentIndex < sortedMateri.length - 1 ? sortedMateri[currentIndex + 1] : null;
  const linkedQuizzes = materiId ? courseQuizzes.filter((q) => q.id_materi === materiId).sort((a, b) => a.urutan - b.urutan) : [];
  const isCompleted = materiId ? completedMateriIds.has(materiId) : false;
  const embedUrl = materi?.tipe === "video" && materi.youtube_id ? buildYoutubeEmbed(materi.youtube_id) : null;

  const handleSelesai = async () => {
    if (!isCompleted && materiId) {
      await markMateriCompleted(materiId);
      toast.success("Materi ditandai selesai");
    }
    if (linkedQuizzes.length > 0) {
      navigate(`/lms/materi/${courseId}/quiz/${linkedQuizzes[0].id}`);
    } else if (nextMateri) {
      navigate(`/lms/materi/${courseId}/learn/${nextMateri.id}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-2 lg:pt-6">
      {materi && (
        <div className="px-6 lg:px-10 xl:px-12 flex items-center justify-between mb-8">
          <div className="flex-1 min-w-0 pr-4 text-sm font-medium text-slate-400 truncate">
            <span className="hover:text-slate-600 cursor-pointer transition-colors" onClick={() => navigate("/lms/materi")}>
              Kelas Saya
            </span>
            <span className="mx-2">/</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors" onClick={() => navigate(`/lms/materi/${courseId}`)}>
              {activeCourse?.judul || "Course"}
            </span>
            <span className="mx-2">/</span>
            <span className="text-slate-600 font-bold">{materi.judul}</span>
          </div>

          <button
            onClick={() => {
              if (linkedQuizzes.length > 0) navigate(`/lms/materi/${courseId}/quiz/${linkedQuizzes[0].id}`);
              else if (nextMateri) navigate(`/lms/materi/${courseId}/learn/${nextMateri.id}`);
              else navigate(`/lms/materi/${courseId}`);
            }}
            className="text-teal-600 hover:text-teal-700 font-bold text-sm tracking-wide transition-colors whitespace-nowrap"
          >
            Selanjutnya
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 lg:px-8 xl:px-10 pb-12 session-scrollbar content-area-padding">
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
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1180px]">
            <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] overflow-hidden">
              <div className="bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#60efff] p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_30%)]" />
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3 text-white/80 text-[11px] font-black uppercase tracking-[0.22em]">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Learning Module
                    </span>
                    {materi.tipe === "video" && materi.durasi_detik && (
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="w-3.5 h-3.5" />
                        {Math.ceil(materi.durasi_detik / 60)} menit
                      </span>
                    )}
                  </div>
                  <h1 className="mt-4 text-[28px] lg:text-[34px] font-black text-white leading-tight max-w-4xl">{materi.judul}</h1>
                  <p className="mt-4 text-sm lg:text-base text-white/85 max-w-3xl leading-relaxed">
                    {materi.deskripsi_singkat || "Pelajari materi ini sampai tuntas, lanjutkan ke diskusi jika ada pertanyaan, lalu tandai selesai ketika Anda sudah benar-benar memahami isinya."}
                  </p>
                </div>
              </div>

              <div className="px-4 lg:px-6 pt-4 bg-white/80">
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
                  <div className="hidden sm:block text-xs font-black text-slate-400 tracking-widest px-4 pb-3">NOTES</div>
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
                      <div className="w-full p-8 md:p-10 min-h-[320px] bg-white">
                        {materi.konten_html ? (
                          <div className="prose prose-slate max-w-none text-slate-600 prose-headings:font-display prose-headings:text-slate-900" dangerouslySetInnerHTML={{ __html: materi.konten_html }} />
                        ) : materi.deskripsi_singkat ? (
                          <p className="text-base leading-relaxed text-slate-600 font-medium">{materi.deskripsi_singkat}</p>
                        ) : (
                          <p className="text-slate-400 font-medium italic">Materi teks masih kosong.</p>
                        )}
                      </div>
                    )}

                    <div className={`p-4 md:p-5 border-t border-slate-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${isCompleted ? "bg-teal-50/30" : ""}`}>
                      <span className="text-slate-600 font-medium text-[15px] md:pl-2">{isCompleted ? "Anda sudah memahami materi ini." : "Apakah sudah paham?"}</span>
                      <div className="flex w-full md:w-auto items-center gap-3">
                        <button
                          onClick={() => setActiveTab("diskusi")}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="hidden sm:inline">Tanyakan di Forum</span>
                          <span className="sm:hidden">Tanya Forum</span>
                        </button>
                        {isCompleted ? (
                          <div className="flex items-center gap-2 px-5 py-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-sm font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Selesai
                          </div>
                        ) : (
                          <button
                            onClick={handleSelesai}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-cyan-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Ya, Saya Sudah Paham
                          </button>
                        )}
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

              {activeTab === "diskusi" && materiId && (
                <motion.div key="diskusi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] p-6 md:p-8">
                    <DiscussionTab materiId={materiId} />
                  </div>
                </motion.div>
              )}

              {activeTab === "catatan" && materiId && (
                <motion.div key="catatan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(15,23,42,0.06)] p-6 md:p-8">
                    <NotesTab materiId={materiId} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  if (linkedQuizzes.length > 0) navigate(`/lms/materi/${courseId}/quiz/${linkedQuizzes[0].id}`);
                  else if (nextMateri) navigate(`/lms/materi/${courseId}/learn/${nextMateri.id}`);
                  else navigate(`/lms/materi/${courseId}`);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-700 border border-slate-200 shadow-sm hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                Lanjut ke tahap berikutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
