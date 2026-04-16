import { useState, useEffect } from "react";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";
import { Info, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useAuth";

const INPUT_CLS = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition";
const LABEL_CLS = "block text-sm font-semibold text-slate-700 mb-1.5";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";

export default function SurveiProfil() {
    const [answers, setAnswers] = useState<Record<string, any>>({
        responden_nama: '',
        responden_jabatan: '',
        responden_perusahaan: '',
        responden_email: '',
        responden_telepon: '',
        responden_sektor: '',
        responden_sertifikat: '',
        q1: 'ya',
        q1_alasan: '',
        dampak_reputasi: null,
        dampak_operasional: 'cukup_signifikan',
        dampak_finansial: 'cukup_signifikan',
        dampak_hukum: 'cukup_signifikan',
        frekuensi: 'sedang',
        q4: 'ya',
        q5: ''
    });

    const { data: user } = useUser();
    const { data: subSektors } = useQuery({ queryKey: ["subSektor"], queryFn: () => apiClient.get<any[]>("/api/sub_sektor") });

    const [step, setStep] = useState(0);

    useEffect(() => {
        if (user && !answers.responden_nama) {
            setAnswers(prev => ({
                ...prev,
                responden_nama: user?.display_name || user?.username || '',
                responden_jabatan: user?.jabatan_name || user?.jabatan || '',
                responden_perusahaan: user?.perusahaan?.nama_perusahaan || '',
                responden_email: user?.email || '',
                responden_telepon: user?.perusahaan?.telepon || '',
                responden_sektor: user?.perusahaan?.sub_sektor?.id || user?.perusahaan?.id_sub_sektor || ''
            }));
        }
    }, [user]);

    const setAnswer = (key: string, val: any) => {
        setAnswers(prev => ({ ...prev, [key]: val }));
    };

    const isStep0Valid = answers.responden_nama && answers.responden_jabatan && answers.responden_perusahaan && answers.responden_email && answers.responden_telepon && answers.responden_sektor;

    const handleNext = () => {
        if (step === 0 && isStep0Valid) setStep(1);
    };

    const handlePrev = () => {
        if (step === 1) setStep(0);
    };

    // Calculate progress based on how many questions have answers
    let totalFields = 8;
    const activeAnswers = { ...answers };

    if (activeAnswers.q1 === 'tidak') {
        // Only keep q1 and q1_alasan
        const keysToKeep = ['q1', 'q1_alasan'];
        Object.keys(activeAnswers).forEach(key => {
            if (!keysToKeep.includes(key)) {
                delete activeAnswers[key];
            }
        });
        totalFields = 2; // q1 and q1_alasan
    } else {
        delete activeAnswers.q1_alasan;
        totalFields = 8; // all other fields
    }

    const answeredFields = Object.values(activeAnswers).filter(v => v !== null && v !== '').length;
    const progress = step === 0 ? 0 : Math.round((answeredFields / totalFields) * 100);

    return (
        <RequireCompanyProfile>
            <div className="min-h-screen bg-white pb-20 font-sans">
                {/* Thin top blue progress bar like in the screenshot */}
                <div className="fixed top-0 left-0 w-full h-[6px] bg-slate-200 z-50">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="max-w-[70rem] mx-auto px-4 sm:px-6 mt-16">
                    {/* Header Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-[22px] font-normal text-slate-800">
                            {step === 0 ? "Responden" : "Risiko 1. Pencurian Intellectual Property Perusahaan"}
                        </h1>
                    </div>

                    {step === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm p-6 mb-8 max-w-4xl mx-auto"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2">
                                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                        <UserCircle2 className="w-5 h-5 text-blue-500" /> Detail Responden
                                    </h2>
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={answers.responden_nama}
                                        onChange={(e) => setAnswer('responden_nama', e.target.value)}
                                        className={INPUT_CLS}
                                    />
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Jabatan <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={answers.responden_jabatan}
                                        onChange={(e) => setAnswer('responden_jabatan', e.target.value)}
                                        className={INPUT_CLS}
                                    />
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Perusahaan <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={answers.responden_perusahaan}
                                        onChange={(e) => setAnswer('responden_perusahaan', e.target.value)}
                                        className={INPUT_CLS}
                                    />
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Sektor <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5" /> Pilih salah satu opsi
                                    </p>
                                    <select
                                        value={answers.responden_sektor}
                                        onChange={(e) => setAnswer('responden_sektor', e.target.value)}
                                        className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
                                    >
                                        <option value="">Harap pilih...</option>
                                        {subSektors?.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.nama_sub_sektor}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Email <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5" /> Harap periksa format jawaban
                                    </p>
                                    <input
                                        type="email"
                                        value={answers.responden_email}
                                        onChange={(e) => setAnswer('responden_email', e.target.value)}
                                        className={INPUT_CLS}
                                    />
                                </div>

                                <div>
                                    <label className={LABEL_CLS}>Nomor Telepon/Whatsapp <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5" /> Berupa angka
                                    </p>
                                    <input
                                        type="tel"
                                        value={answers.responden_telepon}
                                        onChange={(e) => setAnswer('responden_telepon', e.target.value)}
                                        className={INPUT_CLS}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 mt-2">
                                    <label className={LABEL_CLS}>Sertifikat atau Training Keamanan Siber yang Pernah Diikuti</label>
                                    <textarea
                                        className={`${INPUT_CLS} min-h-[120px] resize-y mt-1.5`}
                                        value={answers.responden_sertifikat}
                                        onChange={(e) => setAnswer('responden_sertifikat', e.target.value)}
                                    />
                                </div>

                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <>
                            {/* Intro Card */}
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-8 text-[14px] text-slate-700 leading-relaxed shadow-sm">
                                <div className="mb-4 text-slate-600 font-medium">
                                    Risiko 1/14
                                </div>
                                <p className="mb-4">
                                    Intellectual Property atau Hak Kekayaan Intelektual mencakup paten, hak cipta, merek dagang, desain industri, rahasia dagang, serta inovasi lainnya yang menjadi aset strategis bagi perusahaan. Dalam era Industri 4.0, semakin banyak perusahaan mengandalkan teknologi digital untuk menyimpan, mengelola, dan berbagi informasi terkait HAKI mereka. Namun, hal ini juga meningkatkan risiko pencurian HAKI oleh pihak tidak bertanggung jawab, baik melalui serangan siber, insider threat (ancaman dari dalam), maupun kebocoran data yang tidak disengaja.
                                </p>
                                <p>
                                    Kami ingin mengetahui sejauh mana perusahaan Anda menyadari dan mengelola risiko ini. Mohon berikan jawaban yang mencerminkan kondisi aktual di perusahaan Anda.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Question 1 */}
                                <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6">
                                    <p className="text-[15px] font-medium text-slate-800 mb-3 flex items-start gap-1">
                                        <span className="text-red-500 mt-0.5">*</span>
                                        Apakah perusahaan Anda berpotensi mengalami atau pernah mengalami insiden <strong>pencurian Intellectual Property</strong>?
                                    </p>
                                    <div className="flex items-center gap-2 mb-4 text-[#00bcd4] text-sm font-medium">
                                        <Info className="w-4 h-4" />
                                        <span>Pilih salah satu dari jawaban berikut</span>
                                    </div>
                                    <div className="space-y-3 pl-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="q1"
                                                value="ya"
                                                checked={answers.q1 === 'ya'}
                                                onChange={() => setAnswer('q1', 'ya')}
                                                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">Ya</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="q1"
                                                value="tidak"
                                                checked={answers.q1 === 'tidak'}
                                                onChange={() => setAnswer('q1', 'tidak')}
                                                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">Tidak</span>
                                        </label>
                                    </div>
                                </div>

                                {answers.q1 === 'tidak' && (
                                    <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6">
                                        <p className="text-[15px] font-medium text-slate-800 mb-4 flex items-start gap-1">
                                            <span className="text-red-500 mt-0.5">*</span>
                                            Mengapa perusahaan Anda tidak berpotensi mengalami atau tidak pernah mengalami insiden <strong>pencurian Intellectual Property</strong>?
                                        </p>
                                        <textarea
                                            className="w-full min-h-[120px] p-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-shadow resize-y"
                                            value={answers.q1_alasan}
                                            onChange={(e) => setAnswer('q1_alasan', e.target.value)}
                                        />
                                    </div>
                                )}

                                {answers.q1 === 'ya' && (
                                    <>
                                        {/* Dampak Table */}
                                        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6 overflow-x-auto">
                                            <table className="w-full text-[12px] border-collapse border border-slate-300 min-w-[800px]">
                                                <thead>
                                                    <tr>
                                                        <th className="border border-slate-300 bg-slate-200 p-2 text-center w-[12%]">Dampak</th>
                                                        <th className="border border-slate-300 bg-[#a3d86d] p-2 text-center text-slate-900 w-[22%]">Tidak Signifikan</th>
                                                        <th className="border border-slate-300 bg-[#ffea56] p-2 text-center text-slate-900 w-[22%]">Cukup Signifikan</th>
                                                        <th className="border border-slate-300 bg-[#ffb74d] p-2 text-center text-slate-900 w-[22%]">Signifikan</th>
                                                        <th className="border border-slate-300 bg-[#f44336] p-2 text-center text-white w-[22%]">Sangat Signifikan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white">
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-slate-50">Reputasi</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Terdapat pemberitaan negatif, tetapi tidak berdampak pada kepercayaan stakeholder.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Pemberitaan negatif yang mulai memengaruhi kepercayaan sebagian kecil stakeholder.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Pemberitaan negatif yang menyebabkan penurunan kepercayaan sebagian besar stakeholder.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Pemberitaan negatif yang menyebabkan hilangnya kepercayaan hampir seluruh stakeholder.</td>
                                                    </tr>
                                                    <tr className="bg-slate-50">
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-slate-50">Operasional</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Penundaan proses bisnis hingga <strong>30 menit</strong> dengan dampak minimal.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Penundaan proses bisnis antara <strong>30 menit hingga 1 jam</strong>, menyebabkan sedikit gangguan operasional.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Penundaan proses bisnis antara <strong>1 hingga 8 jam</strong>, berdampak pada produktivitas dan layanan.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Penundaan proses bisnis <strong>lebih dari 8 jam</strong>, menyebabkan gangguan besar dalam operasional.</td>
                                                    </tr>
                                                    <tr className="bg-white">
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-slate-50">Finansial</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Kerugian atau pengeluaran tambahan hingga <strong>5% dari revenue organisasi</strong>.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Kerugian atau pengeluaran tambahan antara <strong>6% hingga 10% dari revenue organisasi</strong>.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Kerugian atau pengeluaran tambahan antara <strong>11% hingga 20% dari revenue organisasi</strong>.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Kerugian atau pengeluaran tambahan <strong>lebih dari 20% dari revenue organisasi</strong>.</td>
                                                    </tr>
                                                    <tr className="bg-slate-50">
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-slate-50">Hukum</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Terdapat permasalahan hukum kecil (misalnya, pelanggaran regulasi), tetapi belum sampai ke tuntutan hukum.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Tuntutan hukum yang berdampak kecil terhadap operasional perusahaan.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Tuntutan hukum yang memengaruhi sebagian besar kinerja dan performa organisasi.</td>
                                                        <td className="border border-slate-300 p-2 text-slate-700">Tuntutan hukum yang mengancam kelangsungan organisasi dan top manajemen.</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Question 2 Matrix */}
                                        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6 overflow-x-auto">
                                            <p className="text-[15px] font-medium text-slate-800 mb-6 flex items-start gap-1">
                                                <span className="text-red-500 mt-0.5">*</span>
                                                Seberapa besar dampak dari <strong>pencurian Intellectual Property</strong> perusahaan?
                                            </p>
                                            <table className="w-full text-sm border-collapse min-w-[700px]">
                                                <thead>
                                                    <tr className="border-[0.5px] border-slate-300">
                                                        <th className="p-3 text-left border-[0.5px] border-slate-300 w-[20%]"></th>
                                                        <th className="p-3 text-center border-[0.5px] border-slate-300 text-slate-700 w-[20%]">Tidak Signifikan</th>
                                                        <th className="p-3 text-center border-[0.5px] border-slate-300 text-slate-700 w-[20%]">Cukup Signifikan</th>
                                                        <th className="p-3 text-center border-[0.5px] border-slate-300 text-slate-700 w-[20%]">Signifikan</th>
                                                        <th className="p-3 text-center border-[0.5px] border-slate-300 text-slate-700 w-[20%]">Sangat Signifikan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        { id: 'reputasi', label: 'Reputasi' },
                                                        { id: 'operasional', label: 'Operasional' },
                                                        { id: 'finansial', label: 'Finansial' },
                                                        { id: 'hukum', label: 'Hukum' }
                                                    ].map((row, idx) => (
                                                        <tr key={row.id} className={`border-[0.5px] border-slate-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-50 transition-colors`}>
                                                            <td className="p-3 text-center border-[0.5px] border-slate-300 font-medium text-slate-700">{row.label}</td>
                                                            {['tidak_signifikan', 'cukup_signifikan', 'signifikan', 'sangat_signifikan'].map((val) => (
                                                                <td key={val} className="p-3 text-center border-[0.5px] border-slate-300">
                                                                    <input
                                                                        type="radio"
                                                                        name={`dampak_${row.id}`}
                                                                        value={val}
                                                                        checked={answers[`dampak_${row.id}`] === val}
                                                                        onChange={() => setAnswer(`dampak_${row.id}`, val)}
                                                                        className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500 cursor-pointer"
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Kriteria Kemungkinan Table */}
                                        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6 overflow-x-auto">
                                            <table className="w-full text-[13px] border-collapse border border-slate-300 min-w-[600px] max-w-3xl">
                                                <thead>
                                                    <tr>
                                                        <th className="border border-slate-300 bg-slate-200 p-2 text-center w-16">Nilai</th>
                                                        <th className="border border-slate-300 bg-slate-200 p-2 text-center w-24">Tingkat</th>
                                                        <th className="border border-slate-300 bg-slate-200 p-2 text-center">Kriteria Kemungkinan/Frekuensi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-slate-300 p-2 text-center bg-white">1</td>
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-[#a3d86d]">Kecil</td>
                                                        <td className="border border-slate-300 p-2 bg-white">Kemungkinan terjadinya tidak lebih dari 2 kali per tahun</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-slate-300 p-2 text-center bg-slate-50">2</td>
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-[#2196f3] text-white">Sedang</td>
                                                        <td className="border border-slate-300 p-2 bg-slate-50">Kemungkinan terjadinya <strong>lebih dari 2 kali / tahun</strong>, namun <strong>tidak lebih dari 5 kali / tahun</strong></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-slate-300 p-2 text-center bg-white">3</td>
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-[#ffeb3b]">Besar</td>
                                                        <td className="border border-slate-300 p-2 bg-white">Kemungkinan terjadinya <strong>lebih dari 5 kali / tahun</strong>, namun <strong>tidak lebih dari 10 kali / tahun</strong></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-slate-300 p-2 text-center bg-slate-50">4</td>
                                                        <td className="border border-slate-300 p-2 text-center font-medium bg-[#f44336] text-white">Sangat Besar</td>
                                                        <td className="border border-slate-300 p-2 bg-slate-50">Kemungkinan terjadinya <strong>lebih dari 10 kali / tahun</strong></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Question 3 Matrix (Frekuensi) */}
                                        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6 overflow-x-auto">
                                            <p className="text-[15px] font-medium text-slate-800 mb-6 flex items-start gap-1">
                                                <span className="text-red-500 mt-0.5">*</span>
                                                Seberapa sering dalam setahun risiko <strong>pencurian Intellectual Property</strong> berpotensi terjadi atau teridentifikasi di perusahaan Anda?
                                            </p>
                                            <table className="w-full text-sm border-collapse border-[0.5px] border-slate-300 max-w-2xl">
                                                <thead>
                                                    <tr className="border-[0.5px] border-slate-300">
                                                        <th className="p-3 border-[0.5px] border-slate-300 text-left w-1/2"></th>
                                                        <th className="p-3 border-[0.5px] border-slate-300 text-center text-slate-700 w-1/2">Frekuensi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        { id: 'kecil', label: 'Kecil' },
                                                        { id: 'sedang', label: 'Sedang' },
                                                        { id: 'besar', label: 'Besar' },
                                                        { id: 'sangat_besar', label: 'Sangat Besar' }
                                                    ].map((row, idx) => (
                                                        <tr key={row.id} className={`border-[0.5px] border-slate-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-50 transition-colors`}>
                                                            <td className="p-3 border-[0.5px] border-slate-300 text-center text-slate-700">{row.label}</td>
                                                            <td className="p-3 border-[0.5px] border-slate-300 text-center">
                                                                <input
                                                                    type="radio"
                                                                    name="frekuensi"
                                                                    value={row.id}
                                                                    checked={answers.frekuensi === row.id}
                                                                    onChange={() => setAnswer('frekuensi', row.id)}
                                                                    className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500 cursor-pointer"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Question 4 */}
                                        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6">
                                            <p className="text-[15px] font-medium text-slate-800 mb-3 flex items-start gap-1">
                                                <span className="text-red-500 mt-0.5">*</span>
                                                Apa perusahaan Anda telah memiliki tindakan pengendalian terhadap risiko <strong>pencurian Intellectual Property</strong>?
                                            </p>
                                            <div className="flex items-center gap-2 mb-4 text-[#00bcd4] text-sm font-medium">
                                                <Info className="w-4 h-4" />
                                                <span>Pilih salah satu dari jawaban berikut</span>
                                            </div>
                                            <div className="space-y-3 pl-3">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="q4"
                                                        value="ya"
                                                        checked={answers.q4 === 'ya'}
                                                        onChange={() => setAnswer('q4', 'ya')}
                                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Ya</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="q4"
                                                        value="tidak"
                                                        checked={answers.q4 === 'tidak'}
                                                        onChange={() => setAnswer('q4', 'tidak')}
                                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Tidak</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Question 5 */}
                                        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6">
                                            <p className="text-[15px] font-medium text-slate-800 mb-4 flex items-start gap-1">
                                                <span className="text-red-500 mt-0.5">*</span>
                                                Apa tindakan pengendalian yang telah dilakukan oleh perusahaan Anda terhadap risiko <strong>pencurian Intellectual Property</strong> perusahaan?
                                            </p>
                                            <textarea
                                                className="w-full min-h-[120px] p-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-shadow resize-y"
                                                placeholder="Tulis tindakan pengendalian di sini..."
                                                value={answers.q5}
                                                onChange={(e) => setAnswer('q5', e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                            </div>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-10 pb-8 pt-4">
                        <button
                            onClick={handlePrev}
                            className="px-6 py-2.5 rounded-lg border border-slate-300 bg-white shadow-sm text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={step === 0 && !isStep0Valid}
                            className="px-8 py-2.5 rounded-lg bg-[#ffca28] hover:bg-[#ffb300] text-slate-900 font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Berikutnya
                        </button>
                    </div>

                </div>
            </div>
        </RequireCompanyProfile>
    );
}
