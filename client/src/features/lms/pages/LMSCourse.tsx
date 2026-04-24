import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useLmsStore } from "@/features/lms/stores/lms.store";
import { getCourseLearnRoute, getCourseQuizRoute, getCoursesRoute, isCoursePath } from "@/features/lms/lib/lms-routes";

function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 xl:px-12 pb-12 animate-pulse">
      <div className="flex-1 space-y-4">
        <div className="h-56 bg-slate-200 rounded-3xl" />
        <div className="h-6 w-64 bg-slate-200 rounded-full" />
        <div className="h-4 w-full bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="text-base font-black text-slate-700 mb-1">Gagal Memuat Kelas</h3>
      <p className="text-sm text-slate-400 mb-4">{message}</p>
      <button onClick={onRetry} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors">
        Coba Lagi
      </button>
    </div>
  );
}

export default function LMSCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();

  const {
    courseMateri,
    courseQuizzes,
    completedMateriIds,
    isLoadingCourse,
    courseError,
    fetchCourseById,
    fetchCourseQuizzes,
    resetCourse,
  } = useLmsStore();

  useEffect(() => {
    if (!courseId) return;
    fetchCourseById(courseId);
    fetchCourseQuizzes(courseId);
    return () => {
      resetCourse();
    };
  }, [courseId, fetchCourseById, fetchCourseQuizzes, resetCourse]);

  const sortedMateri = [...courseMateri].sort((a, b) => a.urutan - b.urutan);

  useEffect(() => {
    if (!isLoadingCourse && sortedMateri.length > 0 && courseId && isCoursePath(location.pathname, courseId)) {
      const firstUncompleted = sortedMateri.find((m) => !completedMateriIds.has(m.id));
      if (firstUncompleted) {
        navigate(getCourseLearnRoute(courseId, firstUncompleted.id), { replace: true });
      } else {
        const unlinkedQuizzes = courseQuizzes.filter((q) => !q.id_materi).sort((a, b) => a.urutan - b.urutan);
        if (unlinkedQuizzes.length > 0) {
          navigate(getCourseQuizRoute(courseId, unlinkedQuizzes[0].id), { replace: true });
        } else {
          navigate(getCourseLearnRoute(courseId, sortedMateri[sortedMateri.length - 1].id), { replace: true });
        }
      }
    }
  }, [isLoadingCourse, sortedMateri, location.pathname, courseId, completedMateriIds, courseQuizzes, navigate]);

  if (isLoadingCourse) return <Skeleton />;
  if (courseError) {
    return (
      <ErrorCard
        message={courseError}
        onRetry={() => {
          if (courseId) {
            fetchCourseById(courseId);
            fetchCourseQuizzes(courseId);
          }
        }}
      />
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#f4f7fb] overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-transparent relative">
        <div className="lg:hidden flex items-center p-4 border-b border-slate-100 bg-white/90 backdrop-blur-xl sticky top-0 z-10">
          <button onClick={() => navigate(getCoursesRoute())} className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-800">Kembali ke Daftar Kelas</span>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
