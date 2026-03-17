import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Hero() {
  const [displayText, setDisplayText] = useState("");
  const fullText = "#JagaRuangSiber";
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleType = () => {
      const updatedText = isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1);

      setDisplayText(updatedText);

      if (!isDeleting && updatedText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
        setTypingSpeed(100);
      } else if (isDeleting && updatedText === "") {
        setIsDeleting(false);
        setTypingSpeed(150);
      } else if (isDeleting) {
        setTypingSpeed(50);
      }
    };

    let timer = setTimeout(() => {
      handleType();
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typingSpeed]);

  return (
    <section className="relative pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden bg-transparent min-h-[90vh] flex items-center">
      {/* Subtle overlay for better text contrast */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] z-[1]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-2 drop-shadow-sm"
          >
            Platform Penilaian Keamanan Siber <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Sektor Industri
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="h-12 mb-6 flex items-center"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              <i>{displayText}</i>
              <span className="inline-block w-[3px] h-8 bg-blue-600 ml-1 animate-pulse" />
            </h2>
          </motion.div>

          {/* <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed font-medium"
          >
            Meningkatkan Resiliensi Siber untuk Industri Nasional dengan Teknologi Pemantauan Real-time yang Terpercaya
          </motion.p> */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <button className="px-10 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 hover:scale-105 active:scale-95">
              Mulai Sekarang
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

