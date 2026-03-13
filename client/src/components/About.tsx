import { motion } from "framer-motion";

export function About() {
    return (
        <section id="about" className="py-24 bg-transparent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        {/* Card 1: Evolving Beyond (Large) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6 }}
                            viewport={{}}
                            className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm flex flex-col justify-end min-h-[300px] md:min-h-[450px] cursor-default transition-shadow hover:shadow-xl"
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0D121F] mb-6 leading-tight">
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
                            className="bg-white border border-slate-100 rounded-[3rem] p-10 md:p-12 shadow-sm flex flex-col justify-between min-h-[300px] md:min-h-[400px] cursor-default transition-shadow hover:shadow-xl"
                        >
                            <p className="text-slate-800 text-lg font-medium leading-relaxed max-w-xs">
                                Misi kami adalah memperkuat kedaulatan digital nasional dengan menyediakan platform penilaian keamanan siber yang komprehensif bagi sektor industri strategis.
                            </p>

                            <div className="mt-8">
                                <button className="relative px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_10px_25px_rgba(37,99,235,0.4)] group overflow-hidden">
                                    <span className="relative z-10 transition-colors duration-300">Gabung Sekarang</span>
                                    <div className="absolute inset-0 bg-white/10 -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6 md:pt-12">
                        {/* Card 2: Decentralized Rails (Small) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{}}
                            className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm min-h-[250px] md:min-h-[300px] cursor-default transition-shadow hover:shadow-xl"
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
                            className="bg-white border border-slate-100 rounded-[3rem] p-10 md:p-12 shadow-sm flex flex-col justify-end min-h-[350px] md:min-h-[550px] cursor-default transition-shadow hover:shadow-xl"
                        >
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0D121F] mb-6 leading-tight">
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
