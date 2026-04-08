import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Globe, Terminal } from 'lucide-react';
import kssiLogo from '@/assets/KSSI.svg';

interface LoadingScreenProps {
    onLoadingComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
    const [progress, setProgress] = useState(0);
    const [showContent, setShowContent] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.random() * 15;
                if (next >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setShowContent(false);
                        if (onLoadingComplete) onLoadingComplete();
                    }, 500);
                    return 100;
                }
                return next;
            });
        }, 200);

        return () => clearInterval(timer);
    }, [onLoadingComplete]);



    return (
        <AnimatePresence>
            {showContent && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 50%, #e0f2fe 100%)' }}
                >
                    {/* Subtle radial highlight */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(0,170,255,0.08)_0%,_transparent_70%)]" />
                    </div>

                    {/* Logo with Scaling Animation and Linear Gradient Glow */}
                    <div className="relative flex items-center justify-center mb-4">


                        {/* Logo statis dengan efek Shimmer Skeleton Modern */}
                        <div className="relative z-10 w-36 h-auto drop-shadow-xl">
                            <img
                                src={kssiLogo}
                                alt="KSSI Logo"
                                className="w-full h-auto"
                            />
                            {/* Shimmer Overlay dengan Mask SVG yang sama */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    maskImage: `url(${kssiLogo})`,
                                    WebkitMaskImage: `url(${kssiLogo})`,
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                }}
                            >
                                <motion.div
                                    animate={{ x: ["-100%", "150%"] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mt-12 w-64 text-center">
                        <div className="flex justify-end items-end mb-2">
                            <span className="text-[12px] font-mono text-[#0066cc]">
                                {Math.round(progress)}%
                            </span>
                        </div>

                        <div className="h-1 w-full bg-[#c8e0f7] rounded-full overflow-hidden border border-[#00aaff]/20">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-[#0066ff] via-[#00aaff] to-[#00ccff]"
                            />
                        </div>
                    </div>

                    {/* Footer / System Info */}
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-30">
                        <div className="flex gap-4">
                            <Terminal className="w-4 h-4 text-[#0066cc]" />
                            <Cpu className="w-4 h-4 text-[#0066cc]" />
                            <Globe className="w-4 h-4 text-[#0066cc]" />
                        </div>
                        <div className="text-[9px] font-mono text-[#0066cc] tracking-[0.2em]">
                            FORTYFOUR.DEV.TEAM // V1.0.0
                        </div>
                    </div>

                    {/* Tech lines decoration */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00aaff]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00aaff]/30 to-transparent" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
