import { motion } from "framer-motion";

export function AnimatedPadlock() {
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Glow Effect */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute inset-0 bg-blue-500/20 rounded-full blur-[80px]"
            />

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
            >
                <svg
                    width="160"
                    height="180"
                    viewBox="0 0 160 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
                >
                    {/* Shackle */}
                    <motion.path
                        d="M40 70V50C40 27.9086 57.9086 10 80 10C102.091 10 120 27.9086 120 50V70"
                        stroke="white"
                        strokeWidth="16"
                        strokeLinecap="round"
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* Body */}
                    <motion.rect
                        x="20"
                        y="70"
                        width="120"
                        height="100"
                        rx="24"
                        fill="white"
                        animate={{
                            rotateY: [0, 15, 0, -15, 0],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <linearGradient id="padlockGradient" x1="0" y1="0" x2="120" y2="100" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white" />
                            <stop offset="1" stopColor="#E2E8F0" />
                        </linearGradient>
                    </motion.rect>

                    {/* Keyhole */}
                    <motion.circle
                        cx="80"
                        cy="110"
                        r="8"
                        fill="#1E293B"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    />
                    <motion.rect
                        x="76"
                        y="115"
                        width="8"
                        height="15"
                        rx="4"
                        fill="#1E293B"
                    />

                    {/* Reflection/Shine */}
                    <rect
                        x="35"
                        y="85"
                        width="90"
                        height="4"
                        rx="2"
                        fill="white"
                        fillOpacity="0.5"
                    />
                </svg>
            </motion.div>

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-40"
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.sin(i) * 50, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut",
                    }}
                    style={{
                        left: `${20 + i * 15}%`,
                        top: "80%",
                    }}
                />
            ))}
        </div>
    );
}
