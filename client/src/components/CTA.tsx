import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTA() {
    const navigate = useNavigate();

    return (
        <section className="py-32 px-4 relative overflow-hidden">
            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{}}
                >
                    <h2 className="text-4xl md:text-6xl font-normal tracking-tight text-primary mb-8 leading-[1.1] max-w-4xl mx-auto">
                        Mendorong Penguatan Keamanan Siber  <br className="hidden md:block" />
                        dan Perlindungan Data <br className="hidden md:block" />
                        Sektor Industri
                    </h2>

                    <p className="text-dark/50 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light">
                        Dengan platform yang aman dan terintegrasi, optimalkan ketahanan data dengan platform kami.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <button 
                            onClick={() => navigate("/register")}
                            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-medium hover:bg-slate-100 transition-all duration-300"
                        >
                            Daftar Sekarang
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
