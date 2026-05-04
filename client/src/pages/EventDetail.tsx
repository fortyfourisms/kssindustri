import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Loader2, MapPin, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";
import { useEventDetail } from "@/hooks/useEvents";
import { useScrollToTop } from "@/hooks/useScrollToTop";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function EventDetail() {
  const { eventId } = useParams();
  const { data: event, isLoading, isError } = useEventDetail(eventId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useScrollToTop(eventId);

  useEffect(() => {
    if (event?.status === "past" && isModalOpen) {
      setIsModalOpen(false);
    }
  }, [event?.status, isModalOpen]);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white">
      <Navbar mode="preview" />

      <main className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_45%,#eff6ff_100%)]" />
          <div className="absolute left-[8%] top-12 h-64 w-64 rounded-full bg-[#0061ff]/12 blur-3xl" />
          <div className="absolute right-[12%] top-20 h-72 w-72 rounded-full bg-[#60efff]/18 blur-3xl" />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0061ff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke event list
            </Link>
          </div>

          {isLoading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0061ff]" />
            </div>
          ) : isError || !event ? (
            <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-600">
              Event tidak ditemukan atau gagal dimuat.
            </div>
          ) : (
            <>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_360px]">
                <div>
                  <span className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                    {event.coverLabel}
                  </span>
                  <h1 className="mt-5 text-4xl md:text-6xl font-display font-medium tracking-tight text-slate-900 leading-tight">
                    {event.title}
                  </h1>
                  <div
                    className="event-html-content prose prose-slate mt-6 max-w-3xl text-base md:text-lg leading-relaxed text-slate-600 prose-headings:font-display prose-headings:text-slate-900 prose-a:text-[#0061ff] prose-strong:text-slate-900 prose-img:my-6 prose-img:max-w-full prose-img:rounded-2xl prose-img:shadow-lg prose-ul:my-4 prose-ol:my-4 prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: event.fullDescription }}
                  />
                </div>

                <aside className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-[0_24px_80px_rgba(31,60,136,0.10)] backdrop-blur-xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Event Detail / RSVP</p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <CalendarDays className="h-4 w-4 text-[#0061ff]" />
                        Tanggal event
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-900">{formatDate(event.eventDate)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <MapPin className="h-4 w-4 text-[#0061ff]" />
                        Lokasi
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-900">{event.location}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <Users className="h-4 w-4 text-[#0061ff]" />
                        Status
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-900">{event.statusLabel}</p>
                    </div>
                  </div>

                  {event.status === "upcoming" ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#0061ff] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                    >
                      Join Event
                    </button>
                  ) : (
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-semibold text-slate-500">
                      Event ini sudah selesai dan registrasi ditutup.
                    </div>
                  )}
                </aside>
              </div>
            </>
          )}
        </section>

        <Footer />
      </main>

      {event?.status === "upcoming" ? (
        <EventRegistrationModal
          event={event}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
