export type EventStatus = "upcoming" | "past";

export type EventApiItem = {
  created_at?: string;
  deskripsi?: string;
  id: number | string;
  judul?: string;
  lokasi?: string;
  status?: string;
  tanggal?: string;
  updated_at?: string;
};

export type EventItem = {
  id: string;
  numericId?: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  eventDate: string;
  location: string;
  coverLabel: string;
  status: EventStatus;
  statusLabel?: string;
  format?: "offline" | "online" | "hybrid";
  backendStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type EventRegistrationPayload = {
  fullName: string;
  email: string;
  company: string;
  position: string;
  phoneNumber: string;
  industrySector: string;
};

export type EventRegistrationRequest = {
  email: string;
  jabatan: string;
  nama: string;
  no_hp: string;
  perusahaan: string;
  sektor: string;
};

export type EventRegistrationResult = {
  message: string;
  registeredAt: string;
  attendee: EventRegistrationPayload;
  event: Pick<EventItem, "id" | "title" | "eventDate" | "location" | "statusLabel">;
};
