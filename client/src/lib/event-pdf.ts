import type { EventRegistrationResult } from "@/types/event.types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

export function downloadEventTicketPdf(ticket: EventRegistrationResult, qrCodeDataUrl: string) {
  const popup = window.open("", "_blank", "width=960,height=720");

  if (!popup) {
    throw new Error("Popup browser diblokir. Izinkan popup untuk mengunduh PDF tiket.");
  }

  const title = escapeHtml(ticket.event.title);
  const attendee = escapeHtml(ticket.attendee.fullName);
  const company = escapeHtml(ticket.attendee.company);
  const position = escapeHtml(ticket.attendee.position);
  const sector = escapeHtml(ticket.attendee.industrySector);
  const email = escapeHtml(ticket.attendee.email);
  const phone = escapeHtml(ticket.attendee.phoneNumber);
  const location = escapeHtml(ticket.event.location);
  const eventDate = escapeHtml(formatDate(ticket.event.eventDate));
  const registeredAt = escapeHtml(formatDate(ticket.registeredAt));
  const ticketNumber = escapeHtml(ticket.ticketNumber);

  popup.document.write(`
    <html>
      <head>
        <title>${title} - ${ticketNumber}</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; background: #eef4ff; margin: 0; padding: 32px; color: #0f172a; }
          .sheet { max-width: 860px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 64px rgba(15,23,42,.12); }
          .hero { padding: 32px; background: linear-gradient(135deg, #1f3c88 0%, #0061ff 60%, #60efff 100%); color: white; }
          .hero h1 { margin: 0 0 8px; font-size: 28px; }
          .hero p { margin: 0; opacity: .9; }
          .content { display: grid; grid-template-columns: 1.3fr .9fr; gap: 24px; padding: 32px; }
          .meta { display: grid; gap: 14px; }
          .meta-card { border: 1px solid #dbe6f5; border-radius: 16px; padding: 16px 18px; background: #f8fbff; }
          .label { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: #64748b; margin-bottom: 6px; }
          .value { font-size: 16px; font-weight: 700; color: #0f172a; }
          .qr-wrap { border: 1px solid #dbe6f5; border-radius: 16px; padding: 24px; text-align: center; }
          .qr-wrap img { width: 220px; height: 220px; }
          .ticket-number { margin-top: 16px; font-size: 18px; font-weight: 800; color: #1d4ed8; }
          .footer { padding: 0 32px 32px; color: #475569; font-size: 13px; }
          @media print {
            body { background: white; padding: 0; }
            .sheet { box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="hero">
            <h1>${title}</h1>
            <p>E-ticket registrasi event FortyFour</p>
          </div>
          <div class="content">
            <div class="meta">
              <div class="meta-card"><div class="label">Peserta</div><div class="value">${attendee}</div></div>
              <div class="meta-card"><div class="label">Perusahaan / Jabatan</div><div class="value">${company} - ${position}</div></div>
              <div class="meta-card"><div class="label">Email / Nomor HP</div><div class="value">${email} - ${phone}</div></div>
              <div class="meta-card"><div class="label">Tanggal Event</div><div class="value">${eventDate}</div></div>
              <div class="meta-card"><div class="label">Lokasi / Format</div><div class="value">${location} - ${ticket.event.format}</div></div>
              <div class="meta-card"><div class="label">Sektor Industri</div><div class="value">${sector}</div></div>
              <div class="meta-card"><div class="label">Registrasi Dibuat</div><div class="value">${registeredAt}</div></div>
            </div>
            <div class="qr-wrap">
              <img src="${qrCodeDataUrl}" alt="QR Ticket" />
              <div class="ticket-number">${ticketNumber}</div>
            </div>
          </div>
          <div class="footer">
            Simpan sebagai PDF dari dialog print browser untuk mendapatkan file e-ticket.
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  popup.document.close();
}
