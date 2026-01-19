import { UserProfile } from "../types/user";
import { Session } from "../types/session";
import { Event } from "../types/event";

export const seedUsers: UserProfile[] = [
  {
    userId: "user_1",
    name: "Alice Johnson",
    email: "alice@example.com",
    totalSessions: 5,
    lastActive: "2026-01-10T12:34:56.000Z",
    purchases: 2,
    avgSessionTime: "00:12:34",
    pagesPerSession: 4,
  },
  {
    userId: "user_2",
    name: "Bob Martinez",
    email: "bob@example.com",
    totalSessions: 3,
    lastActive: "2026-01-12T09:20:00.000Z",
    purchases: 1,
    avgSessionTime: "00:08:10",
    pagesPerSession: 3,
  },
  {
    userId: "user_3",
    name: "Clara Zhang",
    email: "clara@example.com",
    totalSessions: 8,
    lastActive: "2026-01-14T07:15:30.000Z",
    purchases: 5,
    avgSessionTime: "00:20:05",
    pagesPerSession: 6,
  },
];

export const seedSessions: Session[] = [
  {
    sessionId: "sess_1",
    userId: "user_1",
    sessionStart: "2026-01-10T12:00:00.000Z",
    sessionEnd: "2026-01-10T12:15:00.000Z",
    pagesVisited: 5,
    purchaseCount: 1,
    totalTimeMs: 15 * 60 * 1000,
    eventsCount: 6,
  },
  {
    sessionId: "sess_2",
    userId: "user_2",
    sessionStart: "2026-01-12T09:00:00.000Z",
    sessionEnd: "2026-01-12T09:10:10.000Z",
    pagesVisited: 3,
    purchaseCount: 0,
    totalTimeMs: 10 * 60 * 1000 + 10 * 1000,
    eventsCount: 4,
  },
  {
    sessionId: "sess_3",
    userId: "user_3",
    sessionStart: "2026-01-14T07:00:00.000Z",
    sessionEnd: "2026-01-14T07:25:05.000Z",
    pagesVisited: 10,
    purchaseCount: 2,
    totalTimeMs: 25 * 60 * 1000 + 5 * 1000,
    eventsCount: 12,
  },
];

export const seedEvents: Event[] = [
  {
    eventId: "evt_1",
    sessionId: "sess_1",
    userId: "user_1",
    eventType: "page_view",
    timestamp: "2026-01-10T12:00:05.000Z",
    payload: { path: "/", title: "Home" },
  },
  {
    eventId: "evt_2",
    sessionId: "sess_1",
    userId: "user_1",
    eventType: "search",
    timestamp: "2026-01-10T12:03:12.000Z",
    payload: { query: "running shoes" },
  },
  {
    eventId: "evt_3",
    sessionId: "sess_1",
    userId: "user_1",
    eventType: "add_to_cart",
    timestamp: "2026-01-10T12:07:30.000Z",
    payload: { productId: "sku_123", price: 79.99 },
  },
  {
    eventId: "evt_4",
    sessionId: "sess_1",
    userId: "user_1",
    eventType: "purchase",
    timestamp: "2026-01-10T12:10:00.000Z",
    payload: { orderId: "ord_987", total: 79.99 },
  },
  {
    eventId: "evt_5",
    sessionId: "sess_2",
    userId: "user_2",
    eventType: "page_view",
    timestamp: "2026-01-12T09:00:05.000Z",
    payload: { path: "/products/456", title: "Product 456" },
  },
  {
    eventId: "evt_6",
    sessionId: "sess_3",
    userId: "user_3",
    eventType: "page_view",
    timestamp: "2026-01-14T07:00:10.000Z",
    payload: { path: "/category/running", title: "Running" },
  },
  {
    eventId: "evt_7",
    sessionId: "sess_3",
    userId: "user_3",
    eventType: "add_to_cart",
    timestamp: "2026-01-14T07:10:30.000Z",
    payload: { productId: "sku_999", price: 49.5 },
  },
  {
    eventId: "evt_8",
    sessionId: "sess_3",
    userId: "user_3",
    eventType: "purchase",
    timestamp: "2026-01-14T07:20:00.000Z",
    payload: { orderId: "ord_654", total: 49.5 },
  },
];

export function getSeedData() {
  return {
    users: seedUsers,
    sessions: seedSessions,
    events: seedEvents,
  };
}

export default getSeedData;
