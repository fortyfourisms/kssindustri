import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ChevronRight,
    FileText,
    Download,
    MessageSquare,
    BookOpen,
    Send,
    AlertCircle,
    Loader2,
    StickyNote,
    Save,
    CheckCircle2,
    File,
} from "lucide-react";
import { useLmsStore } from "@/stores/lms.store";
import { buildYoutubeEmbed } from "@/services/lms.service";
import { toast } from "sonner";

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
    { key: "deskripsi", label: "Deskripsi Materi", icon: BookOpen },
    { key: "materi_pendukung", label: "Materi Pendukung", icon: File },
    { key: "diskusi", label: "Diskusi", icon: MessageSquare },
    { key: "catatan", label: "Catatan Pribadi", icon: StickyNote },
];

// ─── Files Tab ────────────────────────────────────────────────────────────────
function FilesTab() {
    const { materiFiles, isLoadingMateri } = useLmsStore();

    if (isLoadingMateri) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
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
                        {/* ukuran: BIGINT dari DB */}
                        {file.ukuran > 0 && (
                            <p className="text-xs text-slate-400 font-medium">
                                {file.ukuran >= 1024 * 1024
                                    ? `${(file.ukuran / (1024 * 1024)).toFixed(1)} MB`
                                    : `${(file.ukuran / 1024).toFixed(0)} KB`}
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

// ─── Discussion Tab ───────────────────────────────────────────────────────────
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
        return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>;
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
                                {/* user adalah DiskusiWithUser.user (JOIN dari API response) */}
                                {(item.user?.name ?? "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-800">{item.user?.name ?? "Pengguna"}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                {/* konten: kolom DB diskusi */}
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100">
                                    {item.konten}
                                </p>
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

// ─── Notes Tab ────────────────────────────────────────────────────────────────
function NotesTab({ materiId }: { materiId: string }) {
    const { materiNotes, saveNotes } = useLmsStore();
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (materiNotes && !initialized.current) {
            // konten: kolom DB catatan_pribadi
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
                onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LMSLearn() {
    const navigate = useNavigate();
    const { courseId, materiId } = useParams<{ courseId: string; materiId: string }>();
    const [activeTab, setActiveTab] = useState("deskripsi");

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
        // Cari materi dari courseMateri (sudah ada di store)
        const found = courseMateri.find((m) => m.id === materiId);
        if (found) setActiveMateri(found);
        loadMateriDetail(materiId);
        return () => { resetMateri(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [materiId]);

    const materi = activeMateri;
    // Urutkan berdasarkan kolom `urutan`
    const sortedMateri = [...courseMateri].sort((a, b) => a.urutan - b.urutan);
    const currentIndex = sortedMateri.findIndex((m) => m.id === materiId);
    const prevMateri = currentIndex > 0 ? sortedMateri[currentIndex - 1] : null;
    const nextMateri = currentIndex >= 0 && currentIndex < sortedMateri.length - 1 ? sortedMateri[currentIndex + 1] : null;
    const linkedQuizzes = materiId ? courseQuizzes.filter(q => q.id_materi === materiId).sort((a, b) => a.urutan - b.urutan) : [];

    const isCompleted = materiId ? completedMateriIds.has(materiId) : false;

    // Build YouTube embed dari youtube_id
    const embedUrl = materi?.tipe === "video" && materi.youtube_id
        ? buildYoutubeEmbed(materi.youtube_id)
        : null;

    return (
        <div className="w-full h-full flex flex-col">

            {/* Loading */}
            {!materi && isLoadingMateri && (
                <div className="flex flex-col items-center py-24">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Memuat materi...</p>
                </div>
            )}

            {/* Error */}
            {!materi && materiError && (
                <div className="flex flex-col items-center py-24 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                    <h3 className="text-base font-black text-slate-700 mb-1">Gagal Memuat Materi</h3>
                    <p className="text-sm text-slate-400">{materiError}</p>
                </div>
            )}

            {materi && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Video: embed YouTube dari youtube_id */}
                    {materi.tipe === "video" && embedUrl && (
                        <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-xl mb-6 relative">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={embedUrl}
                                title={materi.judul}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Video tanpa youtube_id */}
                    {materi.tipe === "video" && !embedUrl && (
                        <div className="w-full aspect-video bg-slate-100 rounded-3xl overflow-hidden shadow-xl mb-6 flex items-center justify-center">
                            <p className="text-sm text-slate-400 font-medium">Video belum tersedia</p>
                        </div>
                    )}

                    {/* Teks: header banner */}
                    {materi.tipe === "teks" && (
                        <div className="w-full bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl mb-6 p-8 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white_0%,transparent_60%)]" />
                            <div className="relative flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                                    <BookOpen className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {/* durasi_detik: kolom DB */}
                                    {materi.durasi_detik && (
                                        <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-1">
                                            TEKS · {Math.ceil(materi.durasi_detik / 60)} menit baca
                                        </p>
                                    )}
                                    <h2 className="text-white font-black text-xl leading-tight">{materi.judul}</h2>
                                    {/* deskripsi_singkat: kolom DB */}
                                    {materi.deskripsi_singkat && (
                                        <p className="text-indigo-200 text-sm font-medium mt-1 line-clamp-2">{materi.deskripsi_singkat}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action & Nav Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => prevMateri && navigate(`/dashboard/materi/${courseId}/learn/${prevMateri.id}`)}
                                disabled={!prevMateri}
                                className={`flex items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:px-4 sm:py-2.5 rounded-xl border font-bold text-sm transition-colors ${!prevMateri ? "opacity-50 cursor-not-allowed border-slate-100 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                                title="Materi Sebelumnya"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Sebelumnya</span>
                            </button>
                        </div>

                        <div className="flex-1 flex justify-center px-4 order-first sm:order-none pb-4 sm:pb-0 border-b border-slate-100 sm:border-0 mb-2 sm:mb-0">
                            <span className="text-[17px] sm:text-lg font-extrabold text-slate-800 text-center line-clamp-2 tracking-tight" title={materi.judul}>
                                {materi.judul}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:justify-end shrink-0">
                            {isCompleted && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Selesai</span>
                                </div>
                            )}

                            {linkedQuizzes.length > 0 ? (
                                <button
                                    onClick={async () => {
                                        if (!isCompleted && materiId) await markMateriCompleted(materiId);
                                        navigate(`/dashboard/materi/${courseId}/quiz/${linkedQuizzes[0].id}`);
                                    }}
                                    className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                        !isCompleted 
                                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0" 
                                        : "border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700"
                                    }`}
                                >
                                    {!isCompleted && <CheckCircle2 className="w-4 h-4 text-orange-200" />}
                                    {!isCompleted ? "Tandai Selesai & Lanjut Kuis" : "Lanjut Kuis"}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        if (!isCompleted && materiId) await markMateriCompleted(materiId);
                                        if (nextMateri) navigate(`/dashboard/materi/${courseId}/learn/${nextMateri.id}`);
                                        else navigate(`/dashboard/materi/${courseId}`);
                                    }}
                                    className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                        !isCompleted 
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md text-white border-0" 
                                            : "border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-none"
                                    }`}
                                >
                                    {!isCompleted && <CheckCircle2 className="w-4 h-4 text-blue-200" />}
                                    {!isCompleted ? (nextMateri ? "Tandai Selesai & Selanjutnya" : "Tandai Selesai & Kembali") : "Selanjutnya"}
                                    {!isCompleted && !nextMateri ? null : <ChevronRight className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center border-b border-slate-200/60 mb-8 overflow-x-auto">
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-5 pb-4 pt-1 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === key ? "text-blue-700" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                                {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-700 rounded-t-full" />}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === "deskripsi" && (
                            <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-4">{materi.judul}</h3>
                                {/* konten_html: kolom DB (tipe teks) */}
                                {materi.tipe === "teks" && materi.konten_html ? (
                                    <div className="prose prose-slate max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: materi.konten_html }} />
                                ) : materi.deskripsi_singkat ? (
                                    <p className="text-base leading-relaxed text-slate-600 font-medium">{materi.deskripsi_singkat}</p>
                                ) : (
                                    <p className="text-slate-400 font-medium">Tidak ada deskripsi untuk materi ini.</p>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "materi_pendukung" && (
                            <motion.div key="files" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <FilesTab />
                            </motion.div>
                        )}

                        {activeTab === "diskusi" && materiId && (
                            <motion.div key="diskusi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <DiscussionTab materiId={materiId} />
                            </motion.div>
                        )}

                        {activeTab === "catatan" && materiId && (
                            <motion.div key="catatan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <NotesTab materiId={materiId} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
