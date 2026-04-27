import QRCode from "react-qr-code";
import { CalendarDays, Download, MapPin, Ticket } from "lucide-react";
import type { EventRegistrationResult } from "@/types/event.types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EventTicketCard({
  ticket,
  onDownloadPdf,
}: {
  ticket: EventRegistrationResult;
  onDownloadPdf: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Registrasi Berhasil</p>
        <h4 className="mt-2 text-2xl font-bold text-slate-900">{ticket.event.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          QR e-ticket siap digunakan untuk proses check-in saat event berlangsung.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Peserta</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{ticket.attendee.fullName}</p>
            <p className="text-sm text-slate-600">{ticket.attendee.company} - {ticket.attendee.position}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <CalendarDays className="h-4 w-4 text-[#0061ff]" />
                Tanggal Event
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">{formatDate(ticket.event.eventDate)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <MapPin className="h-4 w-4 text-[#0061ff]" />
                Lokasi
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">{ticket.event.location}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Ticket className="h-4 w-4 text-[#0061ff]" />
              Nomor Tiket
            </div>
            <p className="mt-2 text-base font-extrabold text-[#0061ff]">{ticket.ticketNumber}</p>
          </div>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-2 rounded-full bg-[#0061ff] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="inline-flex rounded-3xl border border-slate-200 bg-white p-4">
            <QRCode value={ticket.qrValue} size={180} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">Scan untuk check-in</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Tunjukkan QR ini saat hadir di lokasi atau saat verifikasi partisipasi event.
          </p>
        </div>
      </div>
    </div>
  );
}
