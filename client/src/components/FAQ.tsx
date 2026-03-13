import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Apa itu platform Penilaian Keamanan Siber?",
        answer: "Platform ini adalah alat bantu bagi organisasi di sektor industri untuk mengukur dan meningkatkan kematangan tata kelola keamanan siber mereka."
    },
    {
        question: "Siapa yang dapat menggunakan platform ini?",
        answer: "Platform ini ditujukan bagi instansi pemerintah dan entitas swasta yang termasuk dalam kategori Penyelenggara Sistem Elektronik (PSE) di sektor industri."
    },
    {
        question: "Apakah data hasil penilaian bersifat rahasia?",
        answer: "Ya, semua data yang diinput ke dalam platform dienkripsi dan hanya dapat diakses oleh personil yang berwenang dari organisasi Anda."
    },
    {
        question: "Apa manfaat mengikuti penilaian IKAS?",
        answer: "IKAS membantu organisasi mengidentifikasi celah keamanan, mematuhi regulasi nasional, dan mendapatkan rekomendasi perbaikan yang konkret."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-transparent">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Pertanyaan Umum (FAQ)
                    </h2>
                    <p className="text-muted-foreground">
                        Temukan jawaban atas pertanyaan yang sering diajukan mengenai platform kami.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-foreground">{faq.question}</span>
                                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-slate-50">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
