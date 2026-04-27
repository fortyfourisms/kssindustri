import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type PageHeaderProps = {
    icon?: LucideIcon;
    title: string;
    subtitle?: string;
};

export function PageHeader({ icon: Icon, title, subtitle }: PageHeaderProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-[2rem] border border-blue-900/20 bg-gradient-to-r from-blue-700 via-blue-900 to-slate-950 px-6 py-7 shadow-xl shadow-blue-950/10 sm:px-8 lg:px-10"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_32%),radial-gradient(circle_at_80%_10%,_rgba(255,255,255,0.08),_transparent_22%)]" />
            <div className="absolute -right-24 top-8 h-44 w-[28rem] rounded-full bg-white/8 blur-3xl" />
            <div className="absolute left-24 top-10 h-40 w-[24rem] rounded-full border border-white/10 bg-white/5" />
            <div className="absolute left-1/3 top-5 h-32 w-[36rem] rounded-full bg-white/5" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white backdrop-blur-sm">
                                <Icon className="h-6 w-6" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-blue-50/80 sm:text-base">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
