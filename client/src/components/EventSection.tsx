import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEventsPreview } from "@/hooks/useEvents";
import type { EventItem } from "@/types/event.types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function EventPreviewCard({
  event,
  showAction,
}: {
  event: EventItem;
  showAction: boolean;
}) {
  const navigate = useNavigate();

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(31,60,136,0.10)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_100px_rgba(31,60,136,0.16)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,239,255,0.12),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
            {event.coverLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            <Clock3 className="h-3.5 w-3.5 text-cyan-600" />
            {event.format}
          </span>
        </div>

        <h3 className="mt-6 text-2xl font-bold leading-tight text-slate-900">
          {event.title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {event.shortDescription}
        </p>

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

        {showAction ? (
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate(`/events/${event.id}`)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0061ff] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
            >
              Join Event
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(`/events/${event.id}`)}
              className="text-sm font-semibold text-[#0061ff] transition hover:text-[#1f3c88]"
            >
              Lihat detail
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function EventSection() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useEventsPreview();

  return (
    <section id="events" className="relative overflow-hidden py-16 md:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_50%,#eef6ff_100%)]" />
        <div className="absolute left-[12%] top-10 h-60 w-60 rounded-full bg-[#0061ff]/10 blur-3xl" />
        <div className="absolute right-[10%] bottom-10 h-72 w-72 rounded-full bg-[#60efff]/18 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 tracking-tight leading-tight">
              Event Terbaru
              <span className="block text-slate-400">
                &amp; Terpopuler
              </span>
            </h2>
          </div>
    
        </div>

        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Upcoming Events</h3>
            </div>
            <button
              onClick={() => navigate("/events")}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#0061ff]"
            >
              Show More
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-80 animate-pulse rounded-[2rem] bg-slate-100" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-600">
              Gagal memuat preview event.
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              className="grid grid-cols-1 gap-6 xl:grid-cols-3"
            >
              {data?.upcoming.map((event) => (
                <motion.div
                  key={event.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                  }}
                >
                  <EventPreviewCard event={event} showAction />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-6 sm:hidden">
            <button
              onClick={() => navigate("/events")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#0061ff]"
            >
              Show More
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Past Events</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {data?.past.map((event) => (
              <EventPreviewCard key={event.id} event={event} showAction={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
