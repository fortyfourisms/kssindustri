import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, MapPin, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEventRegistration } from "@/hooks/useEvents";
import { industrySectorOptions } from "@/data/events";
import type {
  EventItem,
  EventRegistrationPayload,
  EventRegistrationResult,
} from "@/types/event.types";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

type RegistrationUiState =
  | { status: "form" }
  | { status: "submitting" }
  | { status: "success"; ticket: EventRegistrationResult }
  | { status: "error"; message: string };

export function EventRegistrationModal({
  event,
  isOpen,
  onClose,
}: {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const registrationMutation = useEventRegistration(event.id);
  const [form, setForm] = useState<EventRegistrationPayload>({
    fullName: "",
    email: "",
    company: "",
    position: "",
    phoneNumber: "",
    industrySector: industrySectorOptions[0],
  });
  const [uiState, setUiState] = useState<RegistrationUiState>({ status: "form" });

  const title = useMemo(() => {
    if (uiState.status === "success") return "Registrasi Berhasil";
    return "Workshop Registration";
  }, [uiState.status]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof EventRegistrationPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (uiState.status === "error") {
      setUiState({ status: "form" });
    }
  };

  const handleSubmit = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault();
    setUiState({ status: "submitting" });

    try {
      const result = await registrationMutation.mutateAsync(form);
      setUiState({ status: "success", ticket: result });
      toast({
        title: "Registrasi berhasil",
        description: result.message,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim registrasi.";
      setUiState({ status: "error", message });
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-[0_30px_120px_rgba(15,23,42,0.24)] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">RSVP Flow</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{event.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {uiState.status === "success" ? (
            <RegistrationSuccessState ticket={uiState.ticket} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Nama lengkap</label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={inputClassName}
                    placeholder="Nama peserta"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={inputClassName}
                    placeholder="nama@perusahaan.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Perusahaan</label>
                  <input
                    required
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className={inputClassName}
                    placeholder="Nama perusahaan"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Jabatan</label>
                  <input
                    required
                    value={form.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    className={inputClassName}
                    placeholder="Jabatan saat ini"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Nomor HP</label>
                  <input
                    required
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    className={inputClassName}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Sektor industri</label>
                  <select
                    required
                    value={form.industrySector}
                    onChange={(e) => handleChange("industrySector", e.target.value)}
                    className={inputClassName}
                  >
                    {industrySectorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {uiState.status === "error" ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {uiState.message}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uiState.status === "submitting"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0061ff] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uiState.status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses Registrasi
                    </>
                  ) : (
                    "Submit Registrasi"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function RegistrationSuccessState({ ticket }: { ticket: EventRegistrationResult }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Registrasi Berhasil</p>
            <h4 className="mt-2 text-2xl font-bold text-slate-900">{ticket.event.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{ticket.message}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Peserta</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{ticket.attendee.fullName}</p>
          <p className="text-sm text-slate-600">{ticket.attendee.company} - {ticket.attendee.position}</p>
          <p className="mt-2 text-sm text-slate-600">{ticket.attendee.email}</p>
          <p className="text-sm text-slate-600">{ticket.attendee.phoneNumber}</p>
          <p className="mt-2 text-sm text-slate-600">Sektor: {ticket.attendee.industrySector}</p>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <CalendarDays className="h-4 w-4 text-[#0061ff]" />
              Tanggal event
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">{formatDate(ticket.event.eventDate)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MapPin className="h-4 w-4 text-[#0061ff]" />
              Lokasi
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">{ticket.event.location}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-500">Status kegiatan</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{ticket.event.statusLabel}</p>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Registrasi tercatat pada {formatDate(ticket.registeredAt)}. Tim penyelenggara dapat menghubungi Anda lewat email atau nomor HP yang didaftarkan.
          </p>
        </div>
      </div>
    </div>
  );
}
