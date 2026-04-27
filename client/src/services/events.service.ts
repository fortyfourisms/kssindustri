import { eventItems } from "@/data/events";
import type {
  EventItem,
  EventRegistrationPayload,
  EventRegistrationResult,
} from "@/types/event.types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function sortByNearestEvent(a: EventItem, b: EventItem) {
  return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
}

function buildQrValue(event: EventItem, payload: EventRegistrationPayload, ticketNumber: string) {
  return JSON.stringify({
    ticketNumber,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.eventDate,
    attendee: payload.fullName,
    email: payload.email,
    company: payload.company,
    phoneNumber: payload.phoneNumber,
  });
}

export const eventsService = {
  async getLandingPreview() {
    await wait(250);

    const upcoming = eventItems
      .filter((event) => event.status === "upcoming")
      .sort(sortByNearestEvent)
      .slice(0, 3);

    const past = eventItems
      .filter((event) => event.status === "past")
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, 3);

    return { upcoming, past };
  },

  async getUpcomingEvents() {
    await wait(300);
    return eventItems.filter((event) => event.status === "upcoming").sort(sortByNearestEvent);
  },

  async getEventDetail(eventId: string) {
    await wait(300);
    const event = eventItems.find((item) => item.id === eventId);
    if (!event) {
      throw new Error("Event tidak ditemukan.");
    }

    return event;
  },

  async registerEvent(eventId: string, payload: EventRegistrationPayload): Promise<EventRegistrationResult> {
    await wait(900);

    const event = eventItems.find((item) => item.id === eventId);
    if (!event) {
      throw new Error("Event tidak ditemukan.");
    }

    const serial = Math.random().toString(36).slice(2, 8).toUpperCase();
    const ticketNumber = `EVT-${serial}`;
    const registrationId = crypto.randomUUID();

    return {
      registrationId,
      ticketNumber,
      registeredAt: new Date().toISOString(),
      attendee: payload,
      event: {
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        location: event.location,
        format: event.format,
      },
      qrValue: buildQrValue(event, payload, ticketNumber),
    };
  },
};
