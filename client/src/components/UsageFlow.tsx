import { motion } from "framer-motion";
import { UserPlus, Settings, ClipboardCheck, FileBarChart } from "lucide-react";

const steps = [
    {
        title: "Registrasi Akun",
        description: "Daftarkan akun organisasi untuk mulai menggunakan platform penilaian keamanan siber industri.",
        icon: UserPlus
    },
    {
        title: "Lengkapi Data Penilaian",
        description: "Isi berbagai instrumen dan formulir penilaian keamanan siber yang tersedia sesuai kondisi organisasi.",
        icon: ClipboardCheck
    },
    {
        title: "Sistem Melakukan Analisis",
        description: "Platform akan memproses data yang diisi untuk menghasilkan evaluasi tingkat kematangan keamanan siber.",
        icon: Settings
    },
    {
        title: "Unduh Laporan Hasil",
        description: "Setiap hasil penilaian dapat langsung diunduh sebagai laporan untuk kebutuhan evaluasi dan penguatan keamanan siber.",
        icon: FileBarChart
    }
];

export function UsageFlow() {
    return (
        <section id="flow" className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center sm:mb-14 lg:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-2xl font-display font-medium leading-tight text-slate-900 sm:text-3xl lg:text-5xl"
                    >
                        Alur Penggunaan Platform
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="mx-auto mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg"
                    >
                        Proses penilaian yang sistematis untuk memastikan hasil yang akurat dan terstandarisasi bagi instansi Anda.
                    </motion.p>
                </div>

                <div className="relative">
                    <div className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 lg:left-1/2 lg:-translate-x-1/2" />

                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        {steps.map((step, index) => {
                            const isEven = index % 2 === 0;
                            const Icon = step.icon;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.06 }}
                                    viewport={{ once: true, amount: 0.25 }}
                                    className="relative grid grid-cols-1 gap-4 pl-14 lg:grid-cols-2 lg:gap-10 lg:pl-0"
                                >
                                    <div
                                        className={`${
                                            isEven ? "lg:col-start-1 lg:pr-14" : "lg:col-start-2 lg:pl-14"
                                        }`}
                                    >
                                        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                                    {index + 1}
                                                </span>
                                                <h3 className="text-lg font-bold leading-tight text-foreground sm:text-xl">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pointer-events-none absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-white text-primary shadow-sm lg:left-1/2 lg:h-14 lg:w-14 lg:-translate-x-1/2">
                                        <Icon className="h-5 w-5 stroke-[1.8] lg:h-6 lg:w-6" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
