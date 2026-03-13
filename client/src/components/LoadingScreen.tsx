import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Globe, Terminal } from 'lucide-react';

interface LoadingScreenProps {
    onLoadingComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('INITIALIZING CORE...');
    const [showContent, setShowContent] = useState(true);

    const statuses = [
        'INITIALIZING CORE...',
        'ESTABLISHING SECURE CONNECTION...',
        'LOADING SECURITY PROTOCOLS...',
        'SCANNING FOR VULNERABILITIES...',
        'SYNCING DATABASE...',
        'DECRYPTING ASSETS...',
        'SYSTEM READY.'
    ];

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

    useEffect(() => {
        const statusIndex = Math.min(
            Math.floor((progress / 100) * statuses.length),
            statuses.length - 1
        );
        setStatus(statuses[statusIndex]);
    }, [progress]);

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

                    {/* Glowing Ring */}
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative w-48 h-48 rounded-full border border-[#00aaff]/30 flex items-center justify-center shadow-[0_0_50px_rgba(0,170,255,0.1)]"
                    >
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-t-2 border-l-2 border-[#0088cc]/50"
                        />

                        <Shield className="w-20 h-20 text-[#0066cc] drop-shadow-[0_0_8px_rgba(0,102,204,0.4)]" />
                    </motion.div>

                    {/* Progress Section */}
                    <div className="mt-12 w-64 text-center">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-mono text-[#0066cc]/70 tracking-widest uppercase">
                                {status}
                            </span>
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
