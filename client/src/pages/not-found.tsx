import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Map,
  Search,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type QuickLink = {
  label: string;
  href: string;
  match: string[];
};

type LandingScrollState = {
  scrollTarget?: string;
};

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  const resolveNavigation = (href: string) => {
    const [pathname, hash = ""] = href.split("#");

    if (!hash) {
      navigate(pathname);
      return;
    }

    navigate(pathname, {
      state: { scrollTarget: hash } satisfies LandingScrollState,
    });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      navigate("/");
      return;
    }

    navigate("/blog");
  };

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#eff7ff_48%,#f7fbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(54,118,245,0.14)_0%,rgba(54,118,245,0)_72%)] blur-2xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(23,167,245,0.12)_0%,rgba(23,167,245,0)_74%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[-8rem] h-96 w-96 rounded-full border border-[#dbeafe] opacity-70" />
        <div className="absolute right-[-3rem] top-[-2rem] h-72 w-72 rounded-full border border-[#dbeafe] opacity-70" />
        <div className="absolute right-24 top-20 h-3 w-3 rounded-full bg-blue-200" />
        <div className="absolute right-44 top-36 h-2 w-2 rounded-full bg-sky-200" />
        <div className="absolute right-32 top-44 h-1.5 w-1.5 rounded-full bg-cyan-300" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">

          <motion.section
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
            className="mx-auto flex w-full max-w-xl flex-col items-start"
          >
            <h1 className="font-display text-[clamp(5rem,12vw,8.5rem)] font-black leading-[0.9] tracking-[-0.06em] text-[#114c72]">
              404
            </h1>

            <h2 className="mt-3 max-w-lg font-display text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.05] text-slate-900">
              Ups! Sepertinya Anda tersesat.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Halaman yang Anda cari tidak dapat ditemukan. Mungkin tautannya rusak,
              sudah dipindahkan, atau alamat yang dimasukkan belum tepat.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2059d8_0%,#17a7f5_100%)] px-7 text-sm font-bold text-white shadow-[0_18px_40px_rgba(32,89,216,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(32,89,216,0.34)]"
              >
                Kembali ke Beranda
              </button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
