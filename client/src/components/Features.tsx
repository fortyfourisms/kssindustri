import React, { useRef, MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const FeatureHeader = () => (
  <div className="mb-10 sm:mb-12">
    <h2 className="font-display text-[clamp(2.2rem,7vw,4.75rem)] font-medium leading-[1.02] tracking-tight text-slate-900">
      Layanan & <br />
      <span className="text-slate-400">Ketahanan Siber</span>
    </h2>
  </div>
);

const GridLine = ({ orientation }: { orientation: 'horizontal' | 'vertical' }) => (
  <div className={cn(
    "absolute bg-slate-200/60 pointer-events-none",
    orientation === 'horizontal' ? "h-[1px] left-0 right-0" : "w-[1px] top-0 bottom-0"
  )} />
);

const FeatureCard = ({ children, className, variants, inverted = false }: { children: ReactNode, className?: string, variants?: any, inverted?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={containerRef}
      variants={variants}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative overflow-hidden group cursor-pointer border-r border-b border-slate-200/60 transition-all duration-500",
        inverted ? "bg-slate-900 hover:bg-white" : "hover:bg-primary",
        className
      )}
    >

      {/* Dynamic Cursor Glow Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
        style={{
            background: inverted
                ? `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.1), transparent 60%)`
                : `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.4), transparent 60%)`
        }}
      />
      <div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
            background: inverted
                ? `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.05), transparent 80%)`
                : `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.6), transparent 80%)`
        }}
      />
      
      {children}
    </motion.div>
  );
};

export function Features() {
  const navigate = useNavigate();

  return (
    <section id="features" className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <FeatureHeader />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
          className="relative border-t border-l border-slate-200/60"
        >
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Feature 1: IKAS */}
            <FeatureCard
              variants={itemVariants}
              className="p-6 sm:p-8 md:col-span-1"
            >
              <div className="relative z-10 flex flex-col h-full pointer-events-none">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-6 block group-hover:text-white transition-colors">Survei</span>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-white transition-colors">
                  Pemetaan Profil Risiko Siber
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 group-hover:text-white/80 transition-colors">
                  Identifikasi kerentanan dan ancaman untuk memahami profil risiko keamanan siber organisasi Anda.
                </p>
                <div className="mt-auto pt-4 flex items-center text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                  PELAJARI LEBIH LANJUT <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </FeatureCard>

            {/* Feature 2: KSE (Large) */}
            <FeatureCard
              variants={itemVariants}
              className="bg-slate-50/30 p-6 sm:p-8 md:col-span-2"
            >
              <div className="relative z-10 max-w-sm pointer-events-none">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-6 block group-hover:text-white transition-colors">KSE</span>
                <h3 className="mb-4 text-xl font-bold text-slate-900 transition-colors group-hover:text-white sm:text-2xl">
                  Kategorisasi Sistem Elektronik
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                  Kategorisasi sistem elektronik untuk menentukan tingkat proteksi yang dibutuhkan (Tinggi, Moderat, atau Rendah).
                </p>
              </div>

              {/* Graphic for KSE */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-all duration-700 pointer-events-none pr-8">
                <svg width="240" height="120" viewBox="0 0 240 120" fill="none" className="group-hover:text-white transition-colors">
                  <rect x="10" y="20" width="60" height="80" rx="4" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="90" y="10" width="60" height="100" rx="4" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="170" y="30" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="40" cy="60" r="4" fill="currentColor" className="text-blue-500 group-hover:text-white" />
                  <circle cx="120" cy="60" r="4" fill="currentColor" className="text-orange-500 group-hover:text-white" />
                  <circle cx="200" cy="60" r="4" fill="currentColor" className="text-green-500 group-hover:text-white" />
                </svg>
              </div>
            </FeatureCard>
          </div>

          {/* Middle Row: Large Graphic Feature */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Visual Decorative Element */}
            <FeatureCard
              variants={itemVariants}
              className="flex items-center justify-center bg-white p-6 sm:p-8 md:col-span-1"
            >
              <svg width="100%" height="100%" viewBox="0 0 200 200" className="text-slate-200 group-hover:text-white/40 transition-colors duration-700 pointer-events-none relative z-10">
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={20 + i * 15}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray={i % 2 === 0 ? "4 4" : "none"}
                  />
                ))}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="5"
                  fill="currentColor"
                  className="text-primary group-hover:text-white transition-colors"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </svg>
            </FeatureCard>

            {/* Feature: Main Statement / Results */}
            <FeatureCard
              variants={itemVariants}
                className="pointer-events-auto bg-white p-6 sm:p-8 md:col-span-2 md:p-12"
            >
              <div className="relative z-10 pointer-events-none">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-6 block group-hover:text-white transition-colors">IKAS</span>
                <h3 className="mb-5 text-[clamp(2rem,6vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-slate-900 transition-colors group-hover:text-white md:mb-6">
                  Instrumen Penilaian<br />Kematangan Keamanan Siber
                </h3>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-500 transition-colors group-hover:text-white/80 sm:text-lg">
                  Evaluasi mandiri untuk mengukur tingkat kematangan keamanan siber organisasi sesuai standar nasional.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-400 group-hover:text-white/60 relative z-20">
                <span className="hover:text-primary group-hover:hover:text-white cursor-pointer transition-colors">Visualisasi Data ›</span>
                <span className="hover:text-primary group-hover:hover:text-white cursor-pointer transition-colors">Auto-Reporting ›</span>
                <span className="hover:text-primary group-hover:hover:text-white cursor-pointer transition-colors">Compliance Mapping ›</span>
              </div>
            </FeatureCard>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Feature 4: CSIRT (Wide) */}
            <FeatureCard
              variants={itemVariants}
              className="bg-white p-6 sm:p-8 md:col-span-2 md:p-12"
            >
              <div className="relative z-10 max-w-md pointer-events-none">
                <h3 className="mb-4 text-[clamp(1.75rem,5vw,2.5rem)] font-bold text-slate-900 transition-colors group-hover:text-white">CSIRT Services</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-6 group-hover:text-white/80 transition-colors">
                  Infrastruktur untuk koordinasi tim tanggap insiden siber dalam menangani ancaman secara efektif dan sistematis.
                </p>
                <div className="inline-flex items-center gap-2 text-primary font-bold text-sm border-b-2 border-primary/20 group-hover:text-white group-hover:border-white transition-all pb-1 pointer-events-auto cursor-pointer hover:border-primary">
                  Dedicated response team <span className="text-lg group-hover:translate-x-1 transition-transform">›</span>
                </div>
              </div>

              {/* Radar Graphic for CSIRT */}
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-40 transition-all duration-700 pointer-events-none translate-x-1/4 translate-y-1/4">
                <svg width="300" height="300" viewBox="0 0 300 300" className="group-hover:text-white transition-colors">
                  <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="150" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="150" cy="150" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="150" y1="150" x2="150" y2="10" stroke="currentColor" strokeWidth="2">
                    <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="5s" repeatCount="indefinite" />
                  </line>
                </svg>
              </div>
            </FeatureCard>

            {/* Extra Decorative / Contact */}
            <FeatureCard
              variants={itemVariants}
              inverted
              className="flex flex-col justify-center p-6 text-white sm:p-8 md:col-span-1"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
              </div>
              <div className="relative z-10 pointer-events-none">
                <h4 className="text-xl font-bold mb-4 group-hover:text-slate-900 transition-colors">Kelas &amp; Materi Keamanan Siber</h4>
                <p className="text-slate-400 text-sm mb-6 group-hover:text-slate-500 transition-colors">
                  Tingkatkan literasi dan kompetensi SDM melalui berbagai modul pembelajaran interaktif terkait keamanan siber.
                </p>
                <button 
                  onClick={() => {
                    const section = document.querySelector("#courses");
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full py-3 bg-white text-slate-900 rounded-lg text-sm font-bold pointer-events-auto hover:bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500"
                >
                  Lihat Materi
                </button>
              </div>
            </FeatureCard>
          </div>
        </motion.div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/30 -z-10 pointer-events-none mask-gradient-to-l" />
    </section>
  );
}
