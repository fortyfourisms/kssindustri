import { useMutation, useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services/events.service";
import type { EventRegistrationSubmitPayload } from "@/types/event.types";

export function useEventsPreview() {
  return useQuery({
    queryKey: ["events-preview"],
    queryFn: () => eventsService.getLandingPreview(),
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: () => eventsService.getUpcomingEvents(),
  });
}

export function useEventDetail(eventSlug?: string) {
  return useQuery({
    queryKey: ["events", "detail", eventSlug],
    queryFn: () => eventsService.getEventDetail(eventSlug || ""),
    enabled: Boolean(eventSlug),
  });
}

export function useEventRegistration(eventId: string) {
  return useMutation({
    mutationFn: (payload: EventRegistrationSubmitPayload) => eventsService.registerEvent(eventId, payload),
  });
}
