import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    Grid,
    Lightbulb,
    Lock,
    PlayCircle,
    ClipboardList,
    CheckCheck,
    XCircle,
    ChevronRight,
    Trophy,
    RotateCcw,
    FileText,
    BookOpen,
    AlertTriangle,
    Info,
    List,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
}

type ContentBlock =
    | { type: "heading"; level: 2 | 3; text: string }
    | { type: "paragraph"; text: string }
    | { type: "callout"; variant: "info" | "warning" | "tip"; title: string; text: string }
    | { type: "list"; ordered?: boolean; items: string[] }
    | { type: "divider" }
    | { type: "highlight"; text: string; label?: string; color?: "red" | "blue" | "green" | "yellow" | "purple" | "indigo" | "orange" | "slate" | "teal" };

interface Chapter {
    id: number;
    number: string;
    title: string;
    module: string;
    /** "video" chapters show YouTube embed, "text" chapters show rich article */
    contentType: "video" | "text";
    videoUrl?: string;
    description: string;
    /** Structured blocks — only used when contentType === "text" */
    textBlocks?: ContentBlock[];
    /** Reading time in minutes — auto-shown for text chapters */
    readingTime?: number;
    quizQuestions: QuizQuestion[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CHAPTERS: Chapter[] = [
    {
        id: 1,
        number: "01",
        title: "Pengantar Kurasi Digital",
        module: "Modul 1: Dasar-Dasar Kurasi",
        contentType: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=A9kZzD7L5K4iO-t0",
        description:
            "Selamat datang di kursus ini. Di bab pertama ini kita akan membahas dasar-dasar yang penting tentang kurasi digital dan bagaimana hal ini berhubungan dengan keamanan siber.",
        quizQuestions: [
            {
                id: 1,
                question: "Apa yang dimaksud dengan kurasi digital?",
                options: [
                    "Proses memilih dan mengelola konten digital secara selektif",
                    "Teknik enkripsi data di lingkungan cloud",
                    "Metode backup data secara otomatis",
                    "Protokol jaringan untuk distribusi konten",
                ],
                correctIndex: 0,
            },
            {
                id: 2,
                question: "Manakah yang BUKAN merupakan tujuan utama kurasi digital?",
                options: [
                    "Menyaring informasi yang relevan",
                    "Meningkatkan kualitas konten yang diakses",
                    "Mempercepat kecepatan internet pengguna",
                    "Mengurangi noise informasi",
                ],
                correctIndex: 2,
            },
            {
                id: 3,
                question: "Dalam konteks keamanan siber, kurasi digital berperan untuk?",
                options: [
                    "Menggantikan firewall jaringan",
                    "Membantu identifikasi ancaman melalui informasi terkurasi",
                    "Meningkatkan kecepatan transfer data",
                    "Mengotomatisasi proses enkripsi",
                ],
                correctIndex: 1,
            },
        ],
    },
    {
        id: 2,
        number: "02",
        title: "Arsitektur Ruang Visual",
        module: "Modul 1: Dasar-Dasar Kurasi",
        contentType: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=A9kZzD7L5K4iO-t0",
        description:
            "Dalam bab ini, kita akan mengeksplorasi bagaimana arsitektur visual sebuah platform pembelajaran dapat mempengaruhi retensi informasi. Kita tidak hanya berbicara tentang tata letak, tetapi tentang bagaimana ruang kosong bertindak sebagai jeda pernapasan bagi kognisi manusia.",
        quizQuestions: [
            {
                id: 1,
                question: "Apa fungsi utama 'white space' dalam desain antarmuka?",
                options: [
                    "Mengisi area kosong agar tidak terlihat hampa",
                    "Memberikan jarak visual yang membantu fokus pengguna",
                    "Mengurangi ukuran file halaman web",
                    "Meningkatkan kecepatan loading halaman",
                ],
                correctIndex: 1,
            },
            {
                id: 2,
                question: "Berapa jarak minimal (spacing) yang direkomendasikan antara elemen berbeda?",
                options: ["8px", "16px", "24px", "32px"],
                correctIndex: 2,
            },
            {
                id: 3,
                question: "Prinsip 'Visual Hierarchy' dalam arsitektur visual bertujuan untuk?",
                options: [
                    "Membuat semua elemen terlihat sama pentingnya",
                    "Mengarahkan perhatian pengguna ke informasi terpenting",
                    "Mengoptimalkan penggunaan warna pada antarmuka",
                    "Memastikan konsistensi font di seluruh halaman",
                ],
                correctIndex: 1,
            },
        ],
    },
    {
        id: 3,
        number: "03",
        title: "Teori Warna & Psikologi",
        module: "Modul 2: Komponen Visual",
        contentType: "text",
        readingTime: 7,
        description: "Memahami bagaimana warna mempengaruhi emosi dan psikologi audiens dalam membangun engagement visual.",
        textBlocks: [
            { type: "heading", level: 2, text: "Mengapa Warna Penting dalam Desain?" },
            { type: "paragraph", text: "Warna bukan sekadar elemen estetika — ia adalah bahasa non-verbal yang berbicara langsung ke sistem limbik otak manusia sebelum kita sempat berpikir secara rasional. Dalam sepersekian detik, otak kita sudah membuat keputusan berdasarkan warna yang kita lihat. Inilah mengapa pemilihan palet warna yang tepat menjadi fondasi penting dalam setiap sistem desain profesional." },
            { type: "callout", variant: "info", title: "Fakta Riset", text: "Menurut penelitian University of Winnipeg, warna mempengaruhi hingga 90% keputusan pembelian pertama dalam kurang dari 90 detik setelah interaksi awal." },
            { type: "heading", level: 2, text: "Roda Warna dan Harmoni" },
            { type: "paragraph", text: "Roda warna (color wheel) adalah alat fundamental yang digunakan desainer untuk memahami hubungan antar warna. Terdapat tiga kategori harmoni warna utama yang perlu dipahami:" },
            { type: "list", items: [
                "Monokromatik — variasi shade dan tint dari satu warna tunggal. Menciptakan kesan elegan dan kohesif.",
                "Komplementer — dua warna yang berseberangan di roda warna (misal: biru & oranye). Menciptakan kontras yang kuat dan dinamis.",
                "Triadik — tiga warna yang berjarak sama di roda warna. Menghasilkan komposisi yang vibrant dan seimbang.",
                "Analogous — tiga warna yang berdekatan di roda warna. Menghasilkan tampilan yang natural dan harmonis."
            ] },
            { type: "divider" },
            { type: "heading", level: 2, text: "Psikologi Per Warna" },
            { type: "paragraph", text: "Setiap warna membawa makna psikologis yang telah terbentuk melalui evolusi budaya dan pengalaman kolektif manusia. Berikut panduan singkat yang sering digunakan dalam desain digital:" },
            { type: "highlight", label: "Merah", color: "red",    text: "Energi, urgensi, passion, bahaya. Digunakan untuk tombol CTA kritis, notifikasi error, dan pesan peringatan. Meningkatkan detak jantung secara fisiologis." },
            { type: "highlight", label: "Biru",  color: "blue",   text: "Kepercayaan, stabilitas, profesionalisme, ketenangan. Pilihan dominan brand teknologi dan finansial (Facebook, Twitter, PayPal, Visa)." },
            { type: "highlight", label: "Hijau", color: "green",  text: "Pertumbuhan, alam, kesuksesan, kesehatan. Ideal untuk konfirmasi sukses, tema lingkungan, dan produk kesehatan." },
            { type: "highlight", label: "Kuning",color: "yellow", text: "Optimisme, perhatian, kehangatan. Efektif sebagai aksen highlight, namun perlu digunakan hemat agar tidak mengurangi keterbacaan." },
            { type: "divider" },
            { type: "heading", level: 2, text: "Aksesibilitas dan Kontras Warna" },
            { type: "paragraph", text: "Desain yang baik harus dapat diakses oleh semua orang, termasuk mereka yang mengalami buta warna (color blindness) yang mempengaruhi sekitar 8% pria dan 0.5% wanita. Standar WCAG 2.1 menetapkan rasio kontras minimum:" },
            { type: "list", ordered: true, items: [
                "Level AA untuk teks normal: rasio kontras minimal 4.5:1",
                "Level AA untuk teks besar (18px+): rasio kontras minimal 3:1",
                "Level AAA (aksesibilitas tinggi): rasio kontras minimal 7:1"
            ] },
            { type: "callout", variant: "warning", title: "Perhatian", text: "Jangan pernah menyampaikan informasi penting hanya melalui warna. Selalu sertakan label teks, ikon, atau pola visual alternatif untuk memastikan aksesibilitas penuh." },
            { type: "heading", level: 3, text: "Alat Bantu yang Direkomendasikan" },
            { type: "list", items: [
                "Coolors.co — Generator palet warna otomatis yang powerful",
                "Adobe Color — Eksplorasi harmoni warna berbasis roda warna",
                "Contrast Checker (WebAIM) — Validasi rasio kontras WCAG",
                "Color Oracle — Simulasi buta warna langsung di layar Anda"
            ] },
            { type: "callout", variant: "tip", title: "Tips Pro", text: "Mulai selalu dengan desain grayscale terlebih dahulu. Jika hierarki visual sudah terasa jelas tanpa warna, maka saat warna ditambahkan, hasilnya akan jauh lebih kuat dan konsisten." },
        ],
        quizQuestions: [
            { id: 1, question: "Warna merah dalam konteks psikologi warna sering diasosiasikan dengan?", options: ["Ketenangan dan kepercayaan", "Bahaya, urgensi, atau semangat", "Kebijaksanaan dan kreativitas", "Alam dan kesegaran"], correctIndex: 1 },
            { id: 2, question: "Warna biru sering digunakan produk teknologi karena?", options: ["Membangkitkan rasa lapar dan semangat", "Diasosiasikan dengan kepercayaan dan profesionalisme", "Membuat teks lebih mudah dibaca", "Mengurangi konsumsi daya layar"], correctIndex: 1 },
            { id: 3, question: "Rasio kontras minimum WCAG 2.1 Level AA untuk teks normal adalah?", options: ["2:1", "3:1", "4.5:1", "7:1"], correctIndex: 2 },
        ],
    },
    {
        id: 4,
        number: "04",
        title: "Tipografi dalam Editorial",
        module: "Modul 2: Komponen Visual",
        contentType: "text",
        readingTime: 8,
        description: "Pemilihan jenis huruf yang tepat untuk memandu mata dan mempertahankan minat baca pengguna pada materi.",
        textBlocks: [
            { type: "heading", level: 2, text: "Tipografi: Seni di Balik Teks" },
            { type: "paragraph", text: "Tipografi adalah seni dan teknik menata huruf agar teks tidak hanya terbaca, tetapi juga terasa. Sebuah teks yang ditata dengan baik dapat mengkomunikasikan kepribadian, urgensi, ketenangan, atau kegembiraan — bahkan sebelum pembaca memproses maknanya. Dalam konteks digital modern, tipografi yang buruk adalah salah satu penyebab utama tingginya bounce rate sebuah halaman." },
            { type: "callout", variant: "info", title: "Mengapa Ini Penting?", text: "Penelitian Microsoft menemukan bahwa rata-rata perhatian pengguna digital hanya 8 detik. Tipografi yang buruk membuang jatah emas tersebut — bahkan sebelum konten dibaca." },
            { type: "heading", level: 2, text: "Anatomi Sebuah Font" },
            { type: "paragraph", text: "Sebelum memilih font, penting untuk memahami elemen-elemen dasarnya:" },
            { type: "list", items: [
                "Baseline — garis imajiner tempat huruf 'berdiri'",
                "X-height — tinggi huruf kecil 'x', indikator utama keterbacaan",
                "Ascender & Descender — bagian huruf yang naik di atas atau turun di bawah baseline",
                "Serif — kait dekoratif di ujung stroke huruf",
                "Kerning — jarak antar pasangan huruf tertentu",
                "Tracking — jarak antar seluruh karakter dalam sebuah kata"
            ] },
            { type: "divider" },
            { type: "heading", level: 2, text: "Kategori Font dan Karakternya" },
            { type: "highlight", label: "Serif",              color: "indigo", text: "Times New Roman, Georgia, Playfair Display. Kesan: tradisional, terpercaya, editorial. Cocok untuk: long-form reading, jurnal, buku, headline berita." },
            { type: "highlight", label: "Sans-Serif",          color: "blue",   text: "Inter, Roboto, Helvetica, DM Sans. Kesan: modern, bersih, teknologi. Cocok untuk: UI digital, body text layar, aplikasi mobile." },
            { type: "highlight", label: "Monospace",           color: "slate",  text: "JetBrains Mono, Fira Code, Courier. Kesan: teknikal, presisi. Cocok untuk: kode program, data, instruksi teknis." },
            { type: "highlight", label: "Display / Decorative",color: "orange", text: "Bebas Neue, Lobster, Impact. Kesan: ekspresif, kreatif. Cocok untuk: headline besar, poster, branding — BUKAN body text." },
            { type: "divider" },
            { type: "heading", level: 2, text: "Prinsip Tipografi yang Wajib Diketahui" },
            { type: "heading", level: 3, text: "1. Hierarki Visual" },
            { type: "paragraph", text: "Gunakan variasi ukuran, berat (weight), dan warna untuk memandu mata pembaca. Aturan umum: maksimal 3 level hierarki (H1, H2, Body) untuk menjaga kejelasan. Jangan membuat semua teks berteriak dengan ukuran besar — biarkan kontras yang berbicara." },
            { type: "heading", level: 3, text: "2. Line Height dan Keterbacaan" },
            { type: "paragraph", text: "Line height (leading) adalah salah satu faktor terbesar keterbacaan. Terlalu rapat membuat teks sesak dan melelahkan. Terlalu longgar memutus ritme baca. Standar yang direkomendasikan: 1.4 – 1.6x untuk body text, dan 1.1 – 1.3x untuk heading besar." },
            { type: "callout", variant: "tip", title: "Aturan Praktis", text: "Untuk body text pada layar digital, gunakan ukuran minimal 16px dengan line-height 1.6. Ini adalah baseline yang sudah terbukti optimal untuk keterbacaan jangka panjang." },
            { type: "heading", level: 3, text: "3. Pasangan Font yang Efektif" },
            { type: "paragraph", text: "Kombinasi dua font yang tepat menciptakan harmoni visual: satu font untuk heading (biasanya lebih ekspresif) dan satu untuk body (lebih netral dan mudah dibaca). Hindari memadukan dua font dari kategori yang sama kecuali Anda memahami nuansanya." },
            { type: "list", items: [
                "Playfair Display (Serif Heading) + Inter (Sans-Serif Body) — klasik dan elegan",
                "Outfit (Sans-Serif Heading) + DM Sans (Sans-Serif Body) — modern dan bersih",
                "Bebas Neue (Display Heading) + Roboto (Sans-Serif Body) — kuat dan impactful"
            ] },
            { type: "callout", variant: "warning", title: "Hindari Ini", text: "Jangan gunakan lebih dari 2-3 font berbeda dalam satu desain. Setiap font tambahan mengorbankan konsistensi dan meningkatkan cognitive load pengguna secara signifikan." },
        ],
        quizQuestions: [
            { id: 1, question: "Apa perbedaan utama antara font Serif dan Sans-Serif?", options: ["Serif memiliki kait di ujung huruf, Sans-Serif tidak", "Sans-Serif lebih besar ukurannya dari Serif", "Serif hanya digunakan untuk heading", "Tidak ada perbedaan signifikan dalam penggunaan modern"], correctIndex: 0 },
            { id: 2, question: "Line height yang ideal untuk body text digital adalah?", options: ["1.0 – 1.2x ukuran font", "1.4 – 1.6x ukuran font", "2.0 – 2.5x ukuran font", "3.0x ukuran font"], correctIndex: 1 },
            { id: 3, question: "Penggunaan terlalu banyak variasi font dalam satu halaman dapat menyebabkan?", options: ["Tampilan lebih dinamis", "Hierarki visual lebih jelas", "Visual chaos yang mengurangi keterbacaan", "Halaman loading lebih cepat"], correctIndex: 2 },
        ],
    },
];

// ─── Text Article Renderer ────────────────────────────────────────────────────
const calloutConfig = {
    info:    { bg: "bg-blue-50",   border: "border-blue-200",  icon: Info,          iconColor: "text-blue-500",  titleColor: "text-blue-800",  textColor: "text-blue-700"  },
    warning: { bg: "bg-amber-50",  border: "border-amber-200", icon: AlertTriangle,  iconColor: "text-amber-500", titleColor: "text-amber-800", textColor: "text-amber-700" },
    tip:     { bg: "bg-teal-50",   border: "border-teal-200",  icon: Lightbulb,     iconColor: "text-teal-500",  titleColor: "text-teal-800",  textColor: "text-teal-700"  },
};

// Color palette for highlight label badges
const highlightColorMap: Record<string, { badge: string; cardBg: string; cardBorder: string }> = {
    red:    { badge: "bg-red-500 text-white",                  cardBg: "bg-red-50",    cardBorder: "border-red-200"    },
    blue:   { badge: "bg-blue-600 text-white",                 cardBg: "bg-blue-50",   cardBorder: "border-blue-200"   },
    green:  { badge: "bg-emerald-500 text-white",              cardBg: "bg-emerald-50",cardBorder: "border-emerald-200"},
    yellow: { badge: "bg-yellow-400 text-yellow-900",          cardBg: "bg-yellow-50", cardBorder: "border-yellow-200" },
    purple: { badge: "bg-purple-600 text-white",               cardBg: "bg-purple-50", cardBorder: "border-purple-200" },
    indigo: { badge: "bg-indigo-600 text-white",               cardBg: "bg-indigo-50", cardBorder: "border-indigo-200" },
    orange: { badge: "bg-orange-500 text-white",               cardBg: "bg-orange-50", cardBorder: "border-orange-200" },
    teal:   { badge: "bg-teal-500 text-white",                 cardBg: "bg-teal-50",   cardBorder: "border-teal-200"   },
    slate:  { badge: "bg-slate-600 text-white",                cardBg: "bg-slate-50",  cardBorder: "border-slate-200"  },
};
const defaultHighlight = { badge: "bg-gradient-to-br from-slate-800 to-slate-700 text-white", cardBg: "bg-white", cardBorder: "border-slate-200" };

function TextArticle({ chapter }: { chapter: Chapter }) {
    const blocks = chapter.textBlocks ?? [];
    return (
        <motion.div key={chapter.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            {/* Article Header */}
            <div className="mb-10 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full border border-indigo-100 uppercase tracking-widest">
                        <FileText className="w-3 h-3" /> Materi Teks
                    </span>
                    {chapter.readingTime && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
                            <BookOpen className="w-3 h-3" /> {chapter.readingTime} menit baca
                        </span>
                    )}
                </div>
                <h1 className="text-[32px] font-black text-slate-900 leading-tight mb-3">{chapter.title}</h1>
                <p className="text-[16px] text-slate-500 font-medium leading-relaxed">{chapter.description}</p>
            </div>
            {/* Blocks */}
            <div className="space-y-6">
                {blocks.map((block, i) => {
                    if (block.type === "heading") {
                        return block.level === 2
                            ? <h2 key={i} className="text-[22px] font-black text-slate-800 pt-4">{block.text}</h2>
                            : <h3 key={i} className="text-[17px] font-bold text-slate-700 pt-2">{block.text}</h3>;
                    }
                    if (block.type === "paragraph") {
                        return <p key={i} className="text-[15.5px] leading-[1.85] text-slate-600 font-medium">{block.text}</p>;
                    }
                    if (block.type === "callout") {
                        const cfg = calloutConfig[block.variant];
                        const Icon = cfg.icon;
                        return (
                            <div key={i} className={`flex gap-4 p-5 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
                                <div>
                                    <p className={`text-sm font-black mb-1 ${cfg.titleColor}`}>{block.title}</p>
                                    <p className={`text-sm font-medium leading-relaxed ${cfg.textColor}`}>{block.text}</p>
                                </div>
                            </div>
                        );
                    }
                    if (block.type === "list") {
                        return (
                            <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <ul className="space-y-2.5">
                                    {block.items.map((item, ii) => (
                                        <li key={ii} className="flex items-start gap-3 text-[15px] font-medium text-slate-700">
                                            {block.ordered
                                                ? <span className="font-black text-blue-600 shrink-0 w-5">{ii + 1}.</span>
                                                : <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                            }
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    }
                    if (block.type === "highlight") {
                        const hc = (block.color ? highlightColorMap[block.color] : null) ?? defaultHighlight;
                        return (
                            <div key={i} className={`flex gap-4 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${hc.cardBg} ${hc.cardBorder}`}>
                                {block.label && (
                                    <span className={`inline-block px-3 py-1.5 text-xs font-black rounded-xl min-w-[76px] text-center h-fit shrink-0 ${hc.badge}`}>
                                        {block.label}
                                    </span>
                                )}
                                <p className="text-[14.5px] font-medium text-slate-600 leading-relaxed">{block.text}</p>
                            </div>
                        );
                    }
                    if (block.type === "divider") {
                        return <hr key={i} className="border-slate-100 my-2" />;
                    }
                    return null;
                })}
            </div>
        </motion.div>
    );
}

// ─── Quiz Component ───────────────────────────────────────────────────────────
function QuizPanel({
    chapter,
    onComplete,
    onRetry,
}: {
    chapter: Chapter;
    onComplete: () => void;
    onRetry?: () => void;
}) {
    const questions = chapter.quizQuestions;
    const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
    const [submitted, setSubmitted] = useState(false);

    const allAnswered = answers.every((a) => a !== null);
    const score = submitted
        ? answers.reduce<number>((acc, ans, i) => acc + (ans === questions[i].correctIndex ? 1 : 0), 0)
        : 0;
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    const handleSelect = (qIdx: number, optIdx: number) => {
        if (submitted) return;
        setAnswers((prev) => {
            const next = [...prev];
            next[qIdx] = optIdx;
            return next;
        });
    };

    const handleSubmit = () => setSubmitted(true);

    const handleRetake = () => {
        setAnswers(Array(questions.length).fill(null));
        setSubmitted(false);
    };

    // ── Result screen ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-8 py-8 max-w-2xl mx-auto w-full"
            >
                {/* Score Card */}
                <div className={`w-full rounded-3xl p-8 text-center relative overflow-hidden ${passed ? "bg-gradient-to-br from-teal-500 to-emerald-600" : "bg-gradient-to-br from-rose-500 to-red-600"}`}>
                    <div className="absolute inset-0 opacity-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="absolute rounded-full bg-white" style={{ width: `${80 + i * 30}px`, height: `${80 + i * 30}px`, top: `${-20 + i * 10}%`, left: `${-10 + i * 20}%`, opacity: 0.3 }} />
                        ))}
                    </div>
                    <div className="relative z-10">
                        {passed ? (
                            <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4 drop-shadow-lg" />
                        ) : (
                            <XCircle className="w-16 h-16 text-white/80 mx-auto mb-4" />
                        )}
                        <div className="text-7xl font-black text-white mb-2">{percentage}%</div>
                        <p className="text-white/90 font-bold text-lg">
                            {passed ? "Selamat! Kamu Lulus 🎉" : "Belum Lulus — Coba Lagi"}
                        </p>
                        <p className="text-white/70 text-sm mt-1">
                            {score} dari {questions.length} soal benar
                        </p>
                    </div>
                </div>

                {/* Answer Review */}
                <div className="w-full space-y-4">
                    <h4 className="font-black text-slate-800 text-lg">Review Jawaban</h4>
                    {questions.map((q, i) => {
                        const isCorrect = answers[i] === q.correctIndex;
                        return (
                            <div key={q.id} className={`rounded-2xl border p-5 ${isCorrect ? "bg-teal-50 border-teal-200" : "bg-rose-50 border-rose-200"}`}>
                                <div className="flex items-start gap-3 mb-3">
                                    {isCorrect ? (
                                        <CheckCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    )}
                                    <p className="font-bold text-slate-800 text-sm">{i + 1}. {q.question}</p>
                                </div>
                                <div className="ml-8 space-y-1.5 text-sm">
                                    {q.options.map((opt, oi) => {
                                        const isCorrectOpt = oi === q.correctIndex;
                                        const isYours = oi === answers[i];
                                        return (
                                            <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium ${isCorrectOpt ? "bg-teal-100 text-teal-800" : isYours && !isCorrect ? "bg-rose-100 text-rose-700" : "text-slate-500"}`}>
                                                {isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                                                {isYours && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                                                {!isCorrectOpt && !isYours && <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                                                {opt}
                                                {isCorrectOpt && <span className="ml-auto text-[10px] font-black text-teal-700 uppercase tracking-wide">Benar</span>}
                                                {isYours && !isCorrect && <span className="ml-auto text-[10px] font-black text-rose-600 uppercase tracking-wide">Jawaban kamu</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={handleRetake}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Ulangi Kuis
                    </button>
                    {passed && (
                        <button
                            onClick={onComplete}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-2xl font-bold text-white transition-all shadow-lg shadow-teal-200"
                        >
                            Lanjut ke Bab Berikutnya
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    // ── Quiz screen ────────────────────────────────────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto w-full"
        >
            {/* Quiz Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-black text-slate-800 text-xl">Kuis Bab {chapter.number}</h3>
                    <p className="text-sm text-slate-500 font-medium">Jawab semua soal untuk melanjutkan ke bab berikutnya</p>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-2xl font-black text-slate-800">{answers.filter((a) => a !== null).length}<span className="text-slate-400 font-bold text-base">/{questions.length}</span></div>
                    <p className="text-[11px] text-slate-400 font-semibold">terjawab</p>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mb-8">
                {questions.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${answers[i] !== null ? "bg-blue-600" : "bg-slate-200"}`}
                    />
                ))}
            </div>

            {/* Questions */}
            <div className="space-y-8">
                {questions.map((q, qIdx) => (
                    <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIdx * 0.07 }}
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
                    >
                        <p className="font-bold text-slate-800 text-base mb-5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black mr-2.5">{qIdx + 1}</span>
                            {q.question}
                        </p>
                        <div className="space-y-2.5">
                            {q.options.map((opt, oi) => {
                                const isSelected = answers[qIdx] === oi;
                                return (
                                    <button
                                        key={oi}
                                        onClick={() => handleSelect(qIdx, oi)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left font-semibold text-sm transition-all duration-200 border-2 ${
                                            isSelected
                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200/60"
                                                : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                        }`}
                                    >
                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? "bg-white/20 text-white" : "bg-white border border-slate-200 text-slate-500"}`}>
                                            {String.fromCharCode(65 + oi)}
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8">
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-300 ${
                        allAnswered
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-300"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                    {allAnswered ? "Kumpulkan Jawaban →" : `Jawab ${questions.length - answers.filter((a) => a !== null).length} soal lagi`}
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LMSCourse() {
    const navigate = useNavigate();
    const { courseId } = useParams();

    const [activeTab, setActiveTab] = useState("deskripsi");
    const [currentChapterId, setCurrentChapterId] = useState(1);
    const [maxUnlockedChapterId, setMaxUnlockedChapterId] = useState(1);

    // Track which chapters have had their quiz completed
    const [completedQuizIds, setCompletedQuizIds] = useState<Set<number>>(new Set());

    // "idle" = watching video, "quiz" = doing quiz
    const [quizMode, setQuizMode] = useState<"idle" | "quiz">("idle");

    const currentChapterIndex = CHAPTERS.findIndex((c) => c.id === currentChapterId);
    const currentChapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

    const isCompleted = completedQuizIds.has(currentChapterId);
    const isLastChapter = currentChapterIndex === CHAPTERS.length - 1;

    const progressPercentage = Math.min(
        100,
        Math.round((completedQuizIds.size / CHAPTERS.length) * 100)
    );

    // Called when user clicks "Selesai & Lanjut" / next btn
    const handleNext = () => {
        if (isCompleted) {
            // Quiz already done for this chapter → go to next chapter
            if (!isLastChapter) {
                const nextChapterId = CHAPTERS[currentChapterIndex + 1].id;
                if (nextChapterId > maxUnlockedChapterId) {
                    setMaxUnlockedChapterId(nextChapterId);
                }
                setCurrentChapterId(nextChapterId);
                setActiveTab("deskripsi");
                setQuizMode("idle");
            }
        } else {
            // Must complete quiz first
            setQuizMode("quiz");
        }
    };

    // Called from QuizPanel when user passes the quiz
    const handleQuizComplete = () => {
        const newCompleted = new Set(completedQuizIds);
        newCompleted.add(currentChapterId);
        setCompletedQuizIds(newCompleted);

        if (!isLastChapter) {
            const nextChapterId = CHAPTERS[currentChapterIndex + 1].id;
            if (nextChapterId > maxUnlockedChapterId) {
                setMaxUnlockedChapterId(nextChapterId);
            }
            setCurrentChapterId(nextChapterId);
        }
        setQuizMode("idle");
        setActiveTab("deskripsi");
    };

    const handlePrev = () => {
        if (currentChapterIndex > 0) {
            setCurrentChapterId(CHAPTERS[currentChapterIndex - 1].id);
            setActiveTab("deskripsi");
            setQuizMode("idle");
        }
    };

    const handleSelectChapter = (chapterId: number) => {
        setCurrentChapterId(chapterId);
        setActiveTab("deskripsi");
        setQuizMode("idle");
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 flex flex-col lg:flex-row gap-6">
            {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 pb-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm mb-2 font-semibold">
                            <span className="text-slate-700">Progress Belajar</span>
                            <span className="text-teal-600">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
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
                            const isChapterDone = completedQuizIds.has(chapter.id);
                            const isCurrent = chapter.id === currentChapterId;
                            const isLocked = chapter.id > maxUnlockedChapterId;

                            if (isCurrent) {
                                return (
                                    <button
                                        key={chapter.id}
                                        className="w-full flex items-center gap-3 px-3 py-3 bg-blue-50/50 rounded-xl text-left border border-blue-100/50 relative overflow-hidden transition-colors"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />
                                        {chapter.contentType === "text"
                                            ? <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                                            : <PlayCircle className="w-5 h-5 text-blue-600 shrink-0" />}
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-bold text-blue-700 line-clamp-2">
                                                {chapter.number}. {chapter.title}
                                            </span>
                                            {/* Quiz badge */}
                                            {quizMode === "quiz" && (
                                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black rounded-lg">
                                                    <ClipboardList className="w-2.5 h-2.5" /> KUIS
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            }

                            if (isLocked) {
                                return (
                                    <button
                                        key={chapter.id}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left cursor-not-allowed opacity-60"
                                    >
                                        <Lock className="w-4 h-4 ml-0.5 mr-0.5 text-slate-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-slate-500 line-clamp-2">
                                                {chapter.number}. {chapter.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Selesaikan kuis sebelumnya</span>
                                        </div>
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={chapter.id}
                                    onClick={() => handleSelectChapter(chapter.id)}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                                >
                                    {isChapterDone ? (
                                        <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 line-clamp-2">
                                            {chapter.number}. {chapter.title}
                                        </span>
                                        {isChapterDone && (
                                            <span className="text-[10px] text-teal-600 font-bold">✓ Kuis selesai</span>
                                        )}
                                    </div>
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

            {/* ── Right Main Content ────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                <AnimatePresence mode="wait">
                    {quizMode === "quiz" ? (
                        // ── QUIZ MODE ─────────────────────────────────────────────────
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                            className="flex-1"
                        >
                            {/* Quiz Header banner */}
                            <div className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#2a45a3] rounded-3xl overflow-hidden shadow-xl mb-6 p-8 relative">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_50%)]" />
                                <div className="relative flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <ClipboardList className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-0.5">Kuis Materi</p>
                                        <h2 className="text-white font-black text-xl">
                                            Bab {currentChapter.number}: {currentChapter.title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setQuizMode("idle")}
                                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-bold transition-colors border border-white/20"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Kembali ke Materi
                                    </button>
                                </div>
                            </div>

                            <QuizPanel chapter={currentChapter} onComplete={handleQuizComplete} />
                        </motion.div>
                    ) : (
                        // ── NORMAL / TEXT MODE ───────────────────────────────────────────
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.3 }}
                            className="flex-1 flex flex-col"
                        >
                            {/* Content Area: Video or Text banner */}
                            {currentChapter.contentType === "video" ? (
                                <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-xl mb-6 flex items-center justify-center relative">
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={currentChapter.videoUrl}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                /* Text chapter header banner */
                                <div className="w-full bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl overflow-hidden shadow-xl mb-6 p-8 relative">
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white_0%,transparent_60%)]" />
                                    <div className="relative flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                                            <BookOpen className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-1">Materi Teks · {currentChapter.readingTime} menit baca</p>
                                            <h2 className="text-white font-black text-xl leading-tight">{currentChapter.title}</h2>
                                            <p className="text-indigo-200 text-sm font-medium mt-1 line-clamp-1">{currentChapter.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Controls and Title */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentChapterIndex === 0}
                                    className={`px-5 py-2.5 rounded-full border border-slate-200 font-bold text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center ${currentChapterIndex === 0 ? "opacity-50 cursor-not-allowed text-slate-400" : "hover:bg-slate-50 text-slate-700"}`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Sebelumnya
                                </button>

                                <div className="text-center order-first sm:order-none">
                                    <h2 className="text-[20px] font-black text-[#26448f] mb-1">
                                        {currentChapter.number}. {currentChapter.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">{currentChapter.module}</p>
                                </div>

                                {/* Next / Quiz button */}
                                {isLastChapter && isCompleted ? (
                                    <button
                                        onClick={() => navigate("/dashboard/materi")}
                                        className="px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white transition-all shadow-lg shadow-teal-200 w-full sm:w-auto justify-center"
                                    >
                                        <Trophy className="w-4 h-4" />
                                        Selesaikan Kelas
                                    </button>
                                ) : isCompleted ? (
                                    <button
                                        onClick={handleNext}
                                        className="px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 bg-[#2a45a3] hover:bg-[#20347d] text-white transition-colors w-full sm:w-auto justify-center"
                                    >
                                        Selanjutnya
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all shadow-lg shadow-orange-200 w-full sm:w-auto justify-center"
                                    >
                                        <ClipboardList className="w-4 h-4" />
                                        Selesai &amp; Kerjakan Kuis
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex items-center gap-8 border-b border-slate-200/60 mb-8 px-2 overflow-x-auto">
                                {["deskripsi", "materi_pendukung", "diskusi", "catatan"].map((t) => {
                                    const labels: Record<string, string> = {
                                        deskripsi: "Deskripsi Materi",
                                        materi_pendukung: "Materi Pendukung",
                                        diskusi: "Diskusi",
                                        catatan: "Catatan Pribadi",
                                    };
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setActiveTab(t)}
                                            className={`pb-4 text-[15px] font-bold whitespace-nowrap transition-colors relative ${activeTab === t ? "text-blue-700" : "text-slate-400 hover:text-slate-600"}`}
                                        >
                                            {labels[t]}
                                            {activeTab === t && (
                                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-700 rounded-t-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {activeTab === "deskripsi" && (
                                    <motion.div
                                        key={`desc-${currentChapter.id}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="max-w-4xl"
                                    >
                                        {currentChapter.contentType === "text" ? (
                                            /* ── Full Rich Text Article ── */
                                            <TextArticle chapter={currentChapter} />
                                        ) : (
                                            /* ── Video chapter short description ── */
                                            <>
                                                <h3 className="text-[28px] font-black text-slate-800 leading-tight mb-6">
                                                    {currentChapter.title}
                                                </h3>
                                                <div className="space-y-5 text-[16px] leading-[1.8] text-slate-500 font-medium mb-10">
                                                    <p>{currentChapter.description}</p>
                                                </div>
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
                                            </>
                                        )}


                                    </motion.div>
                                )}

                                {activeTab === "materi_pendukung" && (
                                    <motion.div key="mp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 text-slate-500 font-medium">
                                        Materi pendukung belum tersedia.
                                    </motion.div>
                                )}

                                {activeTab === "diskusi" && (
                                    <motion.div key="disk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 text-slate-500 font-medium">
                                        Forum diskusi belum dimulai.
                                    </motion.div>
                                )}

                                {activeTab === "catatan" && (
                                    <motion.div key="cat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 text-slate-500 font-medium">
                                        Catatan pribadi kosong.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
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
