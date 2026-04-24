import { motion } from "framer-motion";
import { BookOpen, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCoursesRoute } from "@/features/lms/lib/lms-routes";

export function LMSDashboard() {
    const navigate = useNavigate();

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-2xl font-bold font-display text-slate-900">Dashboard LMS</h1>
                    <p className="text-sm text-slate-500">
                        Selamat datang di pusat pembelajaran keamanan siber Anda.
                    </p>
                </div>

                {/* Quick Stats or Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => navigate(getCoursesRoute())}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer flex flex-col gap-4"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Materi Pembelajaran</h3>
                            <p className="text-sm text-slate-500 mt-1">Akses semua modul dan kelas yang tersedia.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        onClick={() => navigate("/lms/progress")}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:emerald-300 transition-all cursor-pointer flex flex-col gap-4"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Progress Belajar</h3>
                            <p className="text-sm text-slate-500 mt-1">Pantau perkembangan dan sertifikat Anda.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
