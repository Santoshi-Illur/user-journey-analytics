// src/services/userJourney.service.ts
import dayjs from "dayjs";
import mongoose from "mongoose";
import User from "../models/User";
import Session from "../models/Session";
import Event from "../models/Event";

export async function getUserJourney(
  userId: string,
  start?: string,
  end?: string,
  eventType?: string
) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user id");
  }

  const startDate = start
    ? dayjs(start).toDate()
    : dayjs().subtract(30, "day").toDate();
  const endDate = end ? dayjs(end).toDate() : new Date();

  // -------------------------
  // USER
  // -------------------------
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  // -------------------------
  // SESSIONS
  // -------------------------
  const sessions = await Session.find({
    userId: user._id,
    sessionStart: { $gte: startDate, $lte: endDate },
  })
    .sort({ sessionStart: -1 })
    .lean();

  const sessionIds = sessions.map((s) => s._id);

  // -------------------------
  // EVENTS (SAFE FILTER)
  // -------------------------
  const eventFilter: any = {
    userId: user._id,
    timestamp: { $gte: startDate, $lte: endDate },
  };

  // If sessionId exists in schema, use it
  if (sessionIds.length) {
    eventFilter.$or = [
      { sessionId: { $in: sessionIds } },
      { sessionId: { $exists: false } }, // backward compatibility
    ];
  }

  if (eventType) {
    eventFilter.eventType = eventType;
  }

  const events = await Event.find(eventFilter)
    .sort({ timestamp: 1 })
    .lean();

  // -------------------------
  // GROUP EVENTS BY SESSION
  // -------------------------
  const eventsBySession = new Map<string, any[]>();

  for (const ev of events) {
    const sid = ev.sessionId ? String(ev.sessionId) : "no-session";
    if (!eventsBySession.has(sid)) eventsBySession.set(sid, []);
    eventsBySession.get(sid)!.push(ev);
  }

  // -------------------------
  // SESSION KPIs
  // -------------------------
  const sessionsWithEvents = sessions.map((s) => {
    const evs = eventsBySession.get(String(s._id)) || [];

    const pagesVisited = evs.filter(
      (e) => e.eventType === "page_visit"
    ).length;

    const purchases = evs.filter(
      (e) => e.eventType === "purchase"
    ).length;

    const timeSpent = evs.reduce(
      (acc, e) => acc + (e.durationSec ?? 0),
      0
    );

    return {
      ...s,
      events: evs,
      pagesVisited,
      purchases,
      timeSpent,
    };
  });

  // -------------------------
  // OVERALL KPIs
  // -------------------------
  const pagesVisited = events.filter(
    (e) => e.eventType === "page_visit"
  ).length;

  const purchaseCount = events.filter(
    (e) => e.eventType === "purchase"
  ).length;

  const totalTime = events.reduce(
    (acc, e) => acc + (e.durationSec ?? 0),
    0
  );

  // -------------------------
  // TREND (DAILY)
  // -------------------------
  const trendMap: Record<
    string,
    { pageVisits: number; purchases: number; timeSpent: number }
  > = {};

  for (const ev of events) {
    const date = dayjs(ev.timestamp).format("YYYY-MM-DD");

    if (!trendMap[date]) {
      trendMap[date] = { pageVisits: 0, purchases: 0, timeSpent: 0 };
    }

    if (ev.eventType === "page_visit") trendMap[date].pageVisits++;
    if (ev.eventType === "purchase") trendMap[date].purchases++;
    trendMap[date].timeSpent += ev.durationSec ?? 0;
  }

  const trend = Object.entries(trendMap)
    .map(([date, v]) => ({
      date,
      pageVisits: v.pageVisits,
      purchases: v.purchases,
      timeSpent: v.timeSpent,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // -------------------------
  // RESPONSE (UNCHANGED SHAPE)
  // -------------------------
  return {
    user,
    metrics: {
      pagesVisited,
      purchaseCount,
      totalTime,
      sessionsCount: sessions.length,
    },
    sessions: sessionsWithEvents,
    trend,
  };
}
