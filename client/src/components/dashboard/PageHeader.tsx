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
            className="dashboard-page-header relative overflow-hidden rounded-[2rem] border px-6 py-7 shadow-xl sm:px-8 lg:px-10"
        >
            <div className="absolute inset-0" style={{ background: "var(--dashboard-page-header-overlay)" }} />
            <div className="absolute -right-24 top-8 hidden h-44 w-[28rem] rounded-full blur-3xl sm:block" style={{ background: "var(--dashboard-page-header-chip-soft)" }} />
            <div
                className="absolute left-24 top-10 hidden h-40 w-[24rem] rounded-full border lg:block"
                style={{
                    background: "var(--dashboard-page-header-panel)",
                    borderColor: "var(--dashboard-page-header-outline)",
                }}
            />
            <div className="absolute left-1/3 top-5 hidden h-32 w-[36rem] rounded-full lg:block" style={{ background: "var(--dashboard-page-header-panel)" }} />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-sm"
                                style={{
                                    background: "var(--dashboard-page-header-chip)",
                                    borderColor: "var(--dashboard-page-header-outline)",
                                    color: "var(--dashboard-page-header-text)",
                                }}
                            >
                                <Icon className="h-6 w-6" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="dashboard-page-header-subtitle mt-2 max-w-2xl text-sm font-medium leading-relaxed sm:text-base">
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
