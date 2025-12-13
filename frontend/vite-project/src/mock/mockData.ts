import { type UserProfile } from "../types/user";
import  { type Session } from "../types/session";
import { type Event } from "../types/event";

export const mockUser: UserProfile = {
  userId: "user-123",
  name: "John Doe",
  email: "john@example.com",
  totalSessions: 8,
  lastActive: new Date().toISOString(),
  purchases: 2,
  avgSessionTime: "9m 12s",
  pagesPerSession: 12,
};

export const mockSessions: Session[] = [
  {
    sessionId: "sess-1",
    userId: "user-123",
    sessionStart: new Date().toISOString(),
    pagesVisited: 15,
    purchaseCount: 1,
    totalTimeMs: 9 * 60 * 1000,
    eventsCount: 20,
  },
  {
    sessionId: "sess-2",
    userId: "user-123",
    sessionStart: new Date().toISOString(),
    pagesVisited: 6,
    purchaseCount: 0,
    totalTimeMs: 5 * 60 * 1000,
    eventsCount: 8,
  },
];

export const mockEvents: Event[] = [
  { eventId: "e1", userId: "user-123", sessionId: "sess-1", eventType: "search", timestamp: new Date().toISOString(), payload: { query: "shoes" } },
  { eventId: "e2", userId: "user-123", sessionId: "sess-1", eventType: "page_view", timestamp: new Date().toISOString(), payload: { url: "/product/1", duration_ms: 16000 } },
  { eventId: "e3", userId: "user-123", sessionId: "sess-1", eventType: "add_to_cart", timestamp: new Date().toISOString(), payload: { sku: "sku-1" } },
  { eventId: "e4", userId: "user-123", sessionId: "sess-1", eventType: "purchase", timestamp: new Date().toISOString(), payload: { orderId: "order-1" } },
];
