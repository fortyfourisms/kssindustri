export type EventStatus = "upcoming" | "past";

export type EventItem = {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  eventDate: string;
  location: string;
  format: "offline" | "online" | "hybrid";
  coverLabel: string;
  status: EventStatus;
};

export type EventRegistrationPayload = {
  fullName: string;
  email: string;
  company: string;
  position: string;
  phoneNumber: string;
  industrySector: string;
};

export type EventRegistrationResult = {
  registrationId: string;
  ticketNumber: string;
  registeredAt: string;
  attendee: EventRegistrationPayload;
  event: Pick<EventItem, "id" | "title" | "eventDate" | "location" | "format">;
  qrValue: string;
};
