import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    Grid,
    Lightbulb,
    Lock,
    PlayCircle
} from "lucide-react";

// Mock data for chapters
const CHAPTERS = [
    {
        id: 1,
        number: "01",
        title: "Pengantar Kurasi Digital",
        module: "Modul 1: Dasar-Dasar Kurasi",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=A9kZzD7L5K4iO-t0",
        description: "Selamat datang di kursus ini. Di bab pertama ini kita akan membahas dasar-dasar yang penting."
    },
    {
        id: 2,
        number: "02",
        title: "Arsitektur Ruang Visual",
        module: "Modul 1: Dasar-Dasar Kurasi",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=A9kZzD7L5K4iO-t0",
        description: "Dalam bab ini, kita akan mengeksplorasi bagaimana arsitektur visual sebuah platform pembelajaran dapat mempengaruhi retensi informasi. Kita tidak hanya berbicara tentang tata letak, tetapi tentang bagaimana ruang kosong bertindak sebagai jeda pernapasan bagi kognisi manusia."
    },
    {
        id: 3,
        number: "03",
        title: "Teori Warna & Psikologi",
        module: "Modul 2: Komponen Visual",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=A9kZzD7L5K4iO-t0",
        description: "Memahami bagaimana warna mempengaruhi emosi dan psikologi audiens dalam membangun engagement."
    },
    {
        id: 4,
        number: "04",
        title: "Tipografi dalam Editorial",
        module: "Modul 2: Komponen Visual",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=A9kZzD7L5K4iO-t0",
        description: "Pemilihan jenis huruf yang tepat untuk memandu mata dan mempertahankan minat baca pengguna pada materi."
    }
];

export default function LMSCourse() {
    const navigate = useNavigate();
    const { courseId } = useParams();

    const [activeTab, setActiveTab] = useState("deskripsi");
    const [currentChapterId, setCurrentChapterId] = useState(1);
    const [maxUnlockedChapterId, setMaxUnlockedChapterId] = useState(1);

    const currentChapterIndex = CHAPTERS.findIndex(c => c.id === currentChapterId);
    const currentChapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

    const isCompleted = currentChapterId < maxUnlockedChapterId;
    const isLastChapter = currentChapterIndex === CHAPTERS.length - 1;

    const progressPercentage = Math.min(100, Math.round(((maxUnlockedChapterId - 1) / CHAPTERS.length) * 100));

    const handleNext = () => {
        if (!isLastChapter) {
            const nextChapterId = CHAPTERS[currentChapterIndex + 1].id;
            if (nextChapterId > maxUnlockedChapterId) {
                setMaxUnlockedChapterId(nextChapterId);
            }
            setCurrentChapterId(nextChapterId);
            setActiveTab("deskripsi");
        } else {
            // mark course as complete
            setMaxUnlockedChapterId(currentChapterId + 1);
        }
    };

    const handlePrev = () => {
        if (currentChapterIndex > 0) {
            setCurrentChapterId(CHAPTERS[currentChapterIndex - 1].id);
            setActiveTab("deskripsi");
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar (Chapter List) */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 pb-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm mb-2 font-semibold">
                            <span className="text-slate-700">Progress Belajar</span>
                            <span className="text-teal-600">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>

                    {/* Chapters Header */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 text-slate-800 font-bold text-sm">
                        <Grid className="w-4 h-4 text-blue-600" />
                        Daftar Bab
                    </div>

                    {/* Chapter List */}
                    <div className="space-y-1">
                        {CHAPTERS.map((chapter) => {
                            const isChapterCompleted = chapter.id < maxUnlockedChapterId;
                            const isCurrent = chapter.id === currentChapterId;
                            const isLocked = chapter.id > maxUnlockedChapterId;

                            if (isCurrent) {
                                return (
                                    <button key={chapter.id} className="w-full flex items-center gap-3 px-3 py-3 bg-blue-50/50 rounded-xl text-left border border-blue-100/50 relative overflow-hidden transition-colors">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                                        <PlayCircle className="w-5 h-5 text-blue-600 shrink-0" />
                                        <span className="text-sm font-bold text-blue-700 line-clamp-2">{chapter.number}. {chapter.title}</span>
                                    </button>
                                );
                            }

                            if (isLocked) {
                                return (
                                    <button key={chapter.id} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left cursor-not-allowed opacity-60">
                                        <Lock className="w-4 h-4 ml-0.5 mr-0.5 text-slate-400 shrink-0" />
                                        <span className="text-sm font-medium text-slate-500 line-clamp-2">{chapter.number}. {chapter.title}</span>
                                    </button>
                                );
                            }

                            // Completed/Unlocked but not current
                            return (
                                <button 
                                    key={chapter.id} 
                                    onClick={() => {
                                        setCurrentChapterId(chapter.id);
                                        setActiveTab("deskripsi");
                                    }} 
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 line-clamp-2">{chapter.number}. {chapter.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto hidden lg:block">
                    <button 
                        onClick={() => navigate("/dashboard/materi")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Video Player Area */}
                <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-xl mb-6 flex items-center justify-center relative">
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src={currentChapter.videoUrl} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen>
                    </iframe>
                </div>

                {/* Controls and Title */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <button 
                        onClick={handlePrev}
                        disabled={currentChapterIndex === 0}
                        className={`px-5 py-2.5 rounded-full border border-slate-200 font-bold text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center ${currentChapterIndex === 0 ? "opacity-50 cursor-not-allowed text-slate-400" : "hover:bg-slate-50 text-slate-700"}`}>
                        <ArrowLeft className="w-4 h-4" />
                        Sebelumnya
                    </button>

                    <div className="text-center order-first sm:order-none">
                        <h2 className="text-[20px] font-black text-[#26448f] mb-1">{currentChapter.number}. {currentChapter.title}</h2>
                        <p className="text-sm text-slate-500 font-medium">{currentChapter.module}</p>
                    </div>

                    <button 
                        onClick={handleNext}
                        disabled={isLastChapter && isCompleted}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center transition-colors w-full sm:w-auto justify-center ${isLastChapter && isCompleted ? "bg-teal-500 hover:bg-teal-600 cursor-default opacity-80" : "bg-[#2a45a3] hover:bg-[#20347d] text-white"}`}>
                        {isLastChapter ? (isCompleted ? "Pelajaran Selesai" : "Selesaikan Kursus") : (isCompleted ? "Selanjutnya" : "Selesai & Lanjut")}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-slate-200/60 mb-8 px-2 overflow-x-auto">
                    {["deskripsi", "materi_pendukung", "diskusi", "catatan"].map((t) => {
                        const labels: Record<string, string> = {
                            deskripsi: "Deskripsi Materi",
                            materi_pendukung: "Materi Pendukung",
                            diskusi: "Diskusi",
                            catatan: "Catatan Pribadi"
                        };
                        return (
                            <button 
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`pb-4 text-[15px] font-bold whitespace-nowrap transition-colors relative ${activeTab === t ? "text-blue-700" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                {labels[t]}
                                {activeTab === t && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-700 rounded-t-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === "deskripsi" && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        key={currentChapter.id}
                        className="max-w-4xl"
                    >
                        <h3 className="text-[28px] font-black text-slate-800 leading-tight mb-6">{currentChapter.title}</h3>
                        
                        <div className="space-y-5 text-[16px] leading-[1.8] text-slate-500 font-medium mb-10">
                            <p>
                                {currentChapter.description}
                            </p>
                        </div>

                        {/* Callout Demo */}
                        {currentChapter.id === 2 && (
                            <div className="bg-[#FFF8F0] rounded-2xl p-6 flex gap-4 items-start">
                                <div className="mt-0.5 flex-shrink-0">
                                    <Lightbulb className="w-6 h-6 text-[#D95F29]" fill="currentColor" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-[#A64216] mb-1.5">Kunci Utama</h4>
                                    <p className="text-[15px] text-[#C15822] font-medium leading-relaxed">
                                        Gunakan spasi minimal 24px untuk elemen yang berbeda guna meningkatkan fokus siswa.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
                
                {/* Dummy content for other tabs */}
                {activeTab === "materi_pendukung" && (
                    <div className="text-center py-12 text-slate-500 font-medium">
                        Materi pendukung belum tersedia.
                    </div>
                )}
                
                {activeTab === "diskusi" && (
                    <div className="text-center py-12 text-slate-500 font-medium">
                        Forum diskusi belum dimulai.
                    </div>
                )}

                {activeTab === "catatan" && (
                    <div className="text-center py-12 text-slate-500 font-medium">
                        Catatan pribadi kosong.
                    </div>
                )}
            </div>

            {/* Mobile Back Button */}
            <div className="lg:hidden mt-8 text-center border-t border-slate-200 pt-6">
                <button 
                    onClick={() => navigate("/dashboard/materi")}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
}
