import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const slogans = ["#JagaRuangSiber", "#NyamanKarenaAman"];
  const [activeSloganIndex, setActiveSloganIndex] = useState(0);
  const fullText = slogans[activeSloganIndex];
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
        setActiveSloganIndex((prev) => (prev + 1) % slogans.length);
        setTypingSpeed(150);
      } else if (isDeleting) {
        setTypingSpeed(50);
      }
    };

    let timer = setTimeout(() => {
      handleType();
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, fullText, isDeleting, slogans.length, typingSpeed]);

  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-transparent pb-12 pt-24 sm:min-h-[82vh] sm:pb-16 lg:min-h-[88vh] lg:pb-20 lg:pt-36 xl:pt-44">
      {/* Subtle overlay for better text contrast */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] z-[1]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-3 max-w-4xl text-balance font-display text-[clamp(2.125rem,9vw,5.75rem)] font-bold leading-[1.05] tracking-tight text-slate-900 drop-shadow-sm"
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
            className="mb-6 flex min-h-[2.75rem] items-center sm:min-h-[3rem]"
          >
            <h2 className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-[clamp(1rem,4vw,1.875rem)] font-bold text-slate-800 text-transparent">
              <i>{displayText}</i>
              <span className="ml-1 inline-block h-7 w-[3px] animate-pulse bg-blue-600 sm:h-8" />
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
            className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <button 
              onClick={() => navigate("/register")}
              className="h-11 w-full rounded-full bg-slate-900 px-6 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all duration-300 hover:scale-[1.01] hover:bg-black active:scale-[0.99] sm:w-auto sm:px-10 sm:text-base"
            >
              Mulai Sekarang
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
