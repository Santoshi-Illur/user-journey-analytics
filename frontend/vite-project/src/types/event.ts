export type EventType = "search" | "page_view" | "add_to_cart" | "purchase";

export interface Event {
  eventId: string;
  sessionId: string;
  userId: string;
  eventType: EventType;
  timestamp: string;
  payload?: Record<string, any>;
}
