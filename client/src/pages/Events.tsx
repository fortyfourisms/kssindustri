import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useUpcomingEvents } from "@/hooks/useEvents";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Events() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useUpcomingEvents();

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Navbar mode="preview" />

      <main className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eff6ff_100%)]" />
          <div className="absolute left-[12%] top-16 h-60 w-60 rounded-full bg-[#0061ff]/10 blur-3xl" />
          <div className="absolute right-[8%] top-24 h-72 w-72 rounded-full bg-[#60efff]/16 blur-3xl" />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-medium tracking-tight text-slate-900 leading-tight">
              Agenda terdekat untuk
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1f3c88] via-[#0061ff] to-[#60efff]">
                workshop, briefing, dan simulation
              </span>
            </h1>
            <p className="mt-5 max-w-3xl text-base md:text-lg leading-relaxed text-slate-600">
              Halaman ini menjadi destination dari tombol Show More pada landing page. Pengguna dapat meninjau seluruh event upcoming lalu masuk ke halaman detail untuk RSVP.
            </p>
          </div>

          <div className="mt-12">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-80 animate-pulse rounded-[2rem] bg-slate-100" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-600">
                Gagal memuat daftar event upcoming.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {data?.map((event) => (
                  <article
                    key={event.id}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_20px_80px_rgba(31,60,136,0.10)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_100px_rgba(31,60,136,0.16)]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,239,255,0.12),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                          {event.coverLabel}
                        </span>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          {event.format}
                        </span>
                      </div>

                      <h2 className="mt-6 text-2xl font-bold leading-tight text-slate-900">{event.title}</h2>
                      <p className="mt-4 text-base leading-relaxed text-slate-600">{event.shortDescription}</p>

                      <div className="mt-6 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-4 w-4 text-[#0061ff]" />
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-[#0061ff]" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="inline-flex items-center gap-2 rounded-full bg-[#0061ff] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                        >
                          Join Event
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
