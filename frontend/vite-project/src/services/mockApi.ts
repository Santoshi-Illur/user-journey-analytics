import { mockUser, mockSessions, mockEvents } from "../mock/mockData";
import { UserProfile } from "../types/user";
import { Session } from "../types/session";
import { Event } from "../types/event";

export const api = {
  async getUser(userId: string): Promise<UserProfile | null> {
    return userId === mockUser.userId ? mockUser : null;
  },
  async getSessions(userId: string): Promise<Session[]> {
    return mockSessions.filter(s => s.userId === userId);
  },
  async getSessionEvents(sessionId: string): Promise<Event[]> {
    return mockEvents.filter(e => e.sessionId === sessionId);
  }
};
