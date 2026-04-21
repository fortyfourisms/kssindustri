import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function LMSProgress() {
    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 mx-auto shadow-sm">
                        <TrendingUp className="w-9 h-9 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Progress & Penilaian</h2>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Fitur pencatatan progress dan riwayat penilaian sedang dalam pengembangan.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
