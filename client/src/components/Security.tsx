import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, Server } from "lucide-react";

const protections = [
    {
        title: "Enkripsi End-to-End",
        description: "Data penilaian Anda dienkripsi secara aman.",
        icon: Lock
    },
    {
        title: "Privasi Terjamin",
        description: "Kerahasiaan data organisasi adalah prioritas utama kami.",
        icon: EyeOff
    },
    {
        title: "Kedaulatan Data",
        description: "Data disimpan dalam infrastruktur nasional yang aman.",
        icon: Server
    },
    {
        title: "Kepatuhan Regulasi",
        description: "Sesuai dengan standar keamanan informasi nasional.",
        icon: Shield
    }
];

export function Security() {
    return (
        <section id="security" className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{}}
                        >
                            <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 tracking-tight leading-tight mb-8">
                                Keamanan & <br />
                                <span className="text-slate-400">Perlindungan Data</span>
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed mb-12 max-w-xl">
                                Kami memahami pentingnya integritas dan kerahasiaan data keamanan siber Anda. Platform kami dibangun dengan standar keamanan tertinggi dan enkripsi mutakhir.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {protections.map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{}}
                                    className="flex gap-4 group"
                                >
                                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <p.icon size={24} className="stroke-[1.5]" />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{p.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{p.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{}}
                            className="relative aspect-square max-w-md mx-auto"
                        >
                            {/* Decorative background blur */}
                            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] animate-pulse" />

                            <div className="relative z-10 w-full h-full border border-slate-100 rounded-[3rem] bg-white/80 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/5">
                                {/* Animated Shield Background */}
                                <Shield size={240} className="text-slate-50 absolute opacity-50" />

                                <div className="relative text-center p-12">
                                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-ping" style={{ animationDuration: '3s' }} />
                                        <Lock size={48} className="text-primary relative z-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Terjamin & Aman</h3>
                                    <p className="text-slate-500 font-medium tracking-wide text-xs uppercase">Secured by National Standards</p>

                                    {/* Small security badges/dots */}
                                    <div className="flex justify-center gap-2 mt-8">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-primary/30" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card Elements */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-4 -right-4 md:-right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 z-20 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                    <p className="text-sm font-bold text-slate-900">Protected</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Background elements to match Features/UsageFlow */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -z-10 pointer-events-none skew-x-12 translate-x-1/2" />
        </section>
    );
}
