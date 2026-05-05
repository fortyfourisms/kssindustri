import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTA() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden px-4 py-20 sm:py-24 lg:py-32">
            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{}}
                >
                    <h2 className="mx-auto mb-6 max-w-4xl text-[clamp(2.2rem,7vw,4.75rem)] font-normal leading-[1.05] tracking-tight text-primary sm:mb-8">
                        Mendorong Penguatan Keamanan Siber  <br className="hidden md:block" />
                        dan Perlindungan Data <br className="hidden md:block" />
                        Sektor Industri
                    </h2>

                    <p className="mx-auto mb-10 max-w-2xl text-base font-light text-dark/50 sm:mb-12 sm:text-lg md:text-xl">
                        Dengan platform yang aman dan terintegrasi, optimalkan ketahanan data dengan platform kami.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <button 
                            onClick={() => navigate("/register")}
                            className="group flex min-h-11 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-medium text-black transition-all duration-300 hover:bg-slate-100 sm:px-8"
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
