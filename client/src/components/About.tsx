import { motion } from "framer-motion";

export function About() {
    return (
        <section id="about" className="relative overflow-hidden bg-transparent py-16 sm:py-20 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        {/* Card 1: Evolving Beyond (Large) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6 }}
                            viewport={{}}
                            className="flex min-h-[220px] cursor-default flex-col justify-end rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl sm:p-7 md:min-h-[450px] md:rounded-[2.5rem] md:p-12"
                        >
                            <h2 className="mb-5 font-display text-[clamp(2rem,6vw,3rem)] font-bold leading-tight text-[#0D121F] md:mb-6">
                                Navigasi Ancaman <br />
                                Siber Modern
                            </h2>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-sm">
                                Kami membantu industri menghadapi kompleksitas lanskap ancaman digital dengan solusi penilaian keamanan yang proaktif, menggantikan pendekatan reaktif dengan strategi pertahanan siber yang terukur.
                            </p>
                        </motion.div>

                        {/* Card 3: Our Mission (Small) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{}}
                            className="flex min-h-[240px] cursor-default flex-col justify-between rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl sm:p-7 md:min-h-[400px] md:rounded-[3rem] md:p-12"
                        >
                            <p className="text-slate-800 text-lg font-medium leading-relaxed max-w-xs">
                                Misi kami adalah memperkuat kedaulatan digital nasional dengan menyediakan platform penilaian keamanan siber yang komprehensif bagi sektor industri strategis.
                            </p>

                            <div className="mt-8">
                                <button className="group relative min-h-11 overflow-hidden rounded-full bg-primary px-7 py-3.5 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary/90 hover:shadow-[0_10px_25px_rgba(37,99,235,0.4)] sm:px-8 sm:py-4">
                                    <span className="relative z-10 transition-colors duration-300">Gabung Sekarang</span>
                                    <div className="absolute inset-0 bg-white/10 -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-5 md:space-y-6 md:pt-12">
                        {/* Card 2: Decentralized Rails (Small) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{}}
                            className="min-h-[180px] cursor-default rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl sm:p-7 md:min-h-[300px] md:rounded-[2.5rem] md:p-12"
                        >
                            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-xs">
                                Arsitektur keamanan berbasis Zero Trust untuk memastikan integritas data dan perlindungan aset kritikal dari level infrastruktur hingga aplikasi.
                            </p>
                        </motion.div>

                        {/* Card 4: Disrupting Status Quo (Large) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="flex min-h-[280px] cursor-default flex-col justify-end rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl sm:p-7 md:min-h-[550px] md:rounded-[3rem] md:p-12"
                        >
                            <h2 className="mb-5 font-display text-[clamp(2rem,6vw,3rem)] font-bold leading-tight text-[#0D121F] md:mb-6">
                                Optimasi <br />
                                Keamanan Siber
                            </h2>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-sm">
                                Dapatkan visibilitas penuh melalui audit keamanan berkala, manajemen kerentanan yang cerdas, dan kepatuhan terhadap standar regulasi kemanan siber industri.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
