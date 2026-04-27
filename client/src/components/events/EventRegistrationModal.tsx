import { useMemo, useState } from "react";
import QRCode from "qrcode";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEventRegistration } from "@/hooks/useEvents";
import { downloadEventTicketPdf } from "@/lib/event-pdf";
import { industrySectorOptions } from "@/data/events";
import type {
  EventItem,
  EventRegistrationPayload,
  EventRegistrationResult,
} from "@/types/event.types";
import { EventTicketCard } from "@/components/events/EventTicketCard";

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
    if (uiState.status === "success") return "E-ticket Event";
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
      const ticket = await registrationMutation.mutateAsync(form);
      setUiState({ status: "success", ticket });
      toast({
        title: "Registrasi berhasil",
        description: "QR e-ticket sudah siap untuk digunakan saat check-in.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim registrasi.";
      setUiState({ status: "error", message });
    }
  };

  const handleDownloadPdf = async (ticket: EventRegistrationResult) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrValue, {
        width: 256,
        margin: 1,
      });
      downloadEventTicketPdf(ticket, qrCodeDataUrl);
    } catch (error) {
      toast({
        title: "Gagal menyiapkan PDF",
        description: error instanceof Error ? error.message : "Coba lagi beberapa saat.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white shadow-[0_30px_120px_rgba(15,23,42,0.24)]">
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

        <div className="p-6">
          {uiState.status === "success" ? (
            <EventTicketCard
              ticket={uiState.ticket}
              onDownloadPdf={() => handleDownloadPdf(uiState.ticket)}
            />
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
