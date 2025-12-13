export interface Session {
  sessionId: string;
  userId: string;
  sessionStart: string;
  sessionEnd?: string;
  pagesVisited: number;
  purchaseCount: number;
  totalTimeMs: number;
  eventsCount: number;
}
