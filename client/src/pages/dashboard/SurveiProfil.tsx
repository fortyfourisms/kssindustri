import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ClipboardList, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { RequireCompanyProfile } from "@/components/RequireCompanyProfile";

const SURVEI_QUESTIONS = [
    { id: "Q1", category: "Aset", text: "Seberapa baik organisasi Anda mengidentifikasi dan mengelola aset informasi kritis?" },
    { id: "Q2", category: "Aset", text: "Apakah inventaris aset selalu diperbarui secara berkala?" },
    { id: "Q3", category: "Ancaman", text: "Seberapa baik organisasi mendeteksi ancaman siber yang masuk?" },
    { id: "Q4", category: "Ancaman", text: "Apakah ada proses analisis ancaman (threat intelligence) yang rutin?" },
    { id: "Q5", category: "Kerentanan", text: "Seberapa sering organisasi melakukan uji kerentanan (vulnerability assessment)?" },
    { id: "Q6", category: "Kerentanan", text: "Apakah patch keamanan diterapkan dalam waktu yang tepat?" },
    { id: "Q7", category: "Kontrol", text: "Seberapa efektif kontrol akses yang diterapkan di organisasi Anda?" },
    { id: "Q8", category: "Kontrol", text: "Apakah enkripsi digunakan untuk melindungi data sensitif?" },
    { id: "Q9", category: "Respons", text: "Seberapa siap organisasi dalam merespons insiden keamanan siber?" },
    { id: "Q10", category: "Respons", text: "Apakah ada rencana pemulihan yang telah diuji secara berkala?" },
];

const SCORE_LABELS = ["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"];
const SCORE_COLORS = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"];

function getRiskProfile(score: number) {
    if (score >= 80) return { label: "Risiko Rendah", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500" };
    if (score >= 60) return { label: "Risiko Sedang", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", bar: "bg-blue-500" };
    if (score >= 40) return { label: "Risiko Tinggi", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", bar: "bg-amber-500" };
    return { label: "Risiko Sangat Tinggi", color: "text-red-700", bg: "bg-red-50 border-red-200", bar: "bg-red-500" };
}

export default function SurveiProfil() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ["survei"], queryFn: api.getSurvei });
    const [answers, setAnswers] = useState<Record<string, number>>({});

    useEffect(() => {
        if (data?.answers) setAnswers(data.answers);
    }, [data]);

    const current = data?.answers ? { ...data.answers, ...answers } : answers;
    const answered = Object.values(current).filter(Boolean).length;
    const total = SURVEI_QUESTIONS.length;
    const progress = Math.round((answered / total) * 100);

    const savedScore = data?.score ?? null;
    const profile = savedScore !== null ? getRiskProfile(savedScore) : null;

    const saveMutation = useMutation({
        mutationFn: () => api.saveSurvei(current),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["survei"] });
            setAnswers({});
            toast({ title: "Tersimpan", description: "Survei profil risiko berhasil disimpan." });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const categories = Array.from(new Set(SURVEI_QUESTIONS.map((q) => q.category)));

    return (
        <RequireCompanyProfile>
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 font-display">Survei Profil Risiko</h1>
                            <p className="text-sm text-slate-500">Kuesioner penilaian profil risiko keamanan siber</p>
                        </div>
                    </div>

                    {/* Result Card */}
                    {profile && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl p-5 border ${profile.bg}`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className={`w-5 h-5 ${profile.color}`} />
                                <span className={`font-bold text-base ${profile.color}`}>{profile.label}</span>
                                <span className={`ml-auto text-2xl font-black ${profile.color}`}>{savedScore}%</span>
                            </div>
                            <div className="w-full bg-white/60 rounded-full h-2.5">
                                <motion.div
                                    className={`h-2.5 rounded-full ${profile.bar}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${savedScore}%` }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                            <p className="text-xs mt-2 opacity-70">Berdasarkan {total} pertanyaan survei</p>
                        </motion.div>
                    )}

                    {/* Progress */}
                    <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Progress</span>
                            <span className="text-sm font-bold text-orange-600">{answered}/{total}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <motion.div
                                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                    </div>

                    {/* Questions by category */}
                    {isLoading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
                    ) : (
                        categories.map((cat, ci) => (
                            <motion.div
                                key={cat}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: ci * 0.07 }}
                                className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 space-y-5"
                            >
                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Kategori: {cat}</h3>
                                {SURVEI_QUESTIONS.filter((q) => q.category === cat).map((q) => (
                                    <div key={q.id} className="space-y-2">
                                        <p className="text-sm text-slate-700">{q.text}</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                                                    title={SCORE_LABELS[n]}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${current[q.id] === n
                                                        ? `${SCORE_COLORS[n]} text-white border-transparent shadow-md`
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-orange-300"
                                                        }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        {current[q.id] && (
                                            <p className="text-xs text-slate-400">{SCORE_LABELS[current[q.id]]}</p>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        ))
                    )}

                    {/* Submit */}
                    <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending || answered === 0}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saveMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Menghitung...</>
                        ) : (
                            <><Save className="w-4 h-4" />Simpan & Hitung Profil Risiko</>
                        )}
                    </button>
                </div>
            </RequireCompanyProfile>
    );
}
