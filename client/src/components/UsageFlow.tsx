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
        <section id="flow" className="py-24 md:py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-16 md:mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-6xl font-display font-medium text-slate-900 tracking-tight leading-tight"
                    >
                        Alur Penggunaan Platform
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto px-4"
                    >
                        Proses penilaian yang sistematis untuk memastikan hasil yang akurat dan terstandarisasi bagi instansi Anda.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Central Vertical Line */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10" />

                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div key={index} className="grid grid-cols-2 items-center gap-2 md:gap-12">
                                    {/* Left Side */}
                                    <div className={`flex items-center ${isEven ? 'justify-center' : 'justify-end pr-2 md:pr-4'}`}>
                                        {isEven ? (
                                            /* Icon on Left */
                                            <motion.div
                                                initial={{ opacity: 0, x: -30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5 }}
                                                viewport={{}}
                                                className="w-16 h-16 md:w-40 md:h-40 rounded-xl md:rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center relative group"
                                            >
                                                <div className="absolute inset-1.5 md:inset-2.5 rounded-xl md:rounded-3xl border-2 border-dashed border-primary/20 animate-spin-slow" />
                                                <div className="p-2 md:p-4 bg-white rounded-lg md:rounded-2xl shadow-lg md:shadow-xl group-hover:scale-110 transition-transform duration-500">
                                                    <step.icon size={16} className="md:w-8 md:h-8 text-primary stroke-[1.5]" />
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* Text on Left (Odd) */
                                            <motion.div
                                                initial={{ opacity: 0, x: -30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5 }}
                                                viewport={{}}
                                                className="flex flex-row items-center gap-2 md:gap-4 text-right"
                                            >
                                                <div className="flex flex-col items-end flex-grow min-w-0">
                                                    <h3 className="text-[12px] md:text-2xl font-bold text-foreground mb-0.5 md:mb-3 truncate w-full">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-[10px] md:text-base text-muted-foreground leading-tight md:leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 w-6 h-6 md:w-10 md:h-10 rounded-full bg-primary text-white text-[10px] md:text-base font-bold flex items-center justify-center border-2 md:border-4 border-white shadow-md z-20 -mr-[13.5px] md:-mr-[20.5px]">
                                                    {index + 1}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Right Side */}
                                    <div className={`flex items-center ${isEven ? 'justify-start pl-2 md:pl-4' : 'justify-center'}`}>
                                        {isEven ? (
                                            /* Text on Right (Even) */
                                            <motion.div
                                                initial={{ opacity: 0, x: 30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5 }}
                                                viewport={{}}
                                                className="flex flex-row items-center gap-2 md:gap-4"
                                            >
                                                <div className="flex-shrink-0 w-6 h-6 md:w-10 md:h-10 rounded-full bg-primary text-white text-[10px] md:text-base font-bold flex items-center justify-center border-2 md:border-4 border-white shadow-md z-20 -ml-[13.5px] md:-ml-[20.5px]">
                                                    {index + 1}
                                                </div>
                                                <div className="flex flex-col flex-grow min-w-0">
                                                    <h3 className="text-[12px] md:text-2xl font-bold text-foreground mb-0.5 md:mb-3 truncate w-full">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-[10px] md:text-base text-muted-foreground leading-tight md:leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* Icon on Right */
                                            <motion.div
                                                initial={{ opacity: 0, x: 30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5 }}
                                                viewport={{}}
                                                className="w-16 h-16 md:w-40 md:h-40 rounded-xl md:rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center relative group"
                                            >
                                                <div className="absolute inset-1.5 md:inset-2.5 rounded-xl md:rounded-3xl border-2 border-dashed border-primary/20 animate-spin-slow" />
                                                <div className="p-2 md:p-4 bg-white rounded-lg md:rounded-2xl shadow-lg md:shadow-xl group-hover:scale-110 transition-transform duration-500">
                                                    <step.icon size={16} className="md:w-8 md:h-8 text-primary stroke-[1.5]" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
