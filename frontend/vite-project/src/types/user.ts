export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  totalSessions: number;
  lastActive: string;
  purchases: number;
  avgSessionTime: string;
  pagesPerSession: number;
}
