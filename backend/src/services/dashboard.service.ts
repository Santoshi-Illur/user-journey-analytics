// src/services/dashboard.service.ts
import dayjs from "dayjs";
import User from "../models/User";
import Event from "../models/Event";
import Session from "../models/Session";
import mongoose from "mongoose";

export interface DashboardQuery {
  start?: string;
  end?: string;
  device?: string;
  country?: string;
  eventType?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function getDashboardData(query: DashboardQuery) {
  const {
    start, end, device, country, eventType, q,
    page = 1, limit = 10
  } = query;

  const startDate = start ? dayjs(start).toDate() : dayjs().subtract(30, "day").toDate();
  const endDate = end ? dayjs(end).toDate() : new Date();
  const pageNum = Math.max(1, Number(page));
  const pageLimit = Math.max(1, Number(limit));

  // user filter
  const userMatch: any = {};
  if (device) userMatch.device = device;
  if (country) userMatch.country = country;
  if (q) userMatch.$or = [
    { name: { $regex: q, $options: "i" } },
    { email: { $regex: q, $options: "i" } },
  ];

  const totalUsers = await User.countDocuments(userMatch);

  const users = await User.find(userMatch)
    .skip((pageNum - 1) * pageLimit)
    .limit(pageLimit)
    .lean()
    .exec();

  const userIds = users.map((u) => u._id);

  // Build event match
  const eventMatch: any = {
    timestamp: { $gte: startDate, $lte: endDate }
  };

  if (eventType) eventMatch.eventType = eventType;

  // If userIds exist, restrict by them
  if (userIds.length) eventMatch.userId = { $in: userIds };

  // KPIs aggregation
  const metricsAgg = await Event.aggregate([
    { $match: eventMatch },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        purchases: { $sum: { $cond: [{ $eq: ["$eventType", "purchase"] }, 1, 0] } },
        totalTime: { $sum: { $ifNull: ["$durationSec", 0] } },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        _id: 0,
        totalEvents: 1,
        purchases: 1,
        totalTime: 1,
        uniqueUsersCount: { $size: "$uniqueUsers" }
      }
    }
  ]).exec();

  const metrics = metricsAgg[0] || { totalEvents: 0, purchases: 0, totalTime: 0, uniqueUsersCount: 0 };
  const totalSessions = await Session.countDocuments({ sessionStart: { $gte: startDate, $lte: endDate }, ...(userIds.length ? { userId: { $in: userIds } } : {}) });

  // Per-user stats
  let perUserStats: any[] = [];
  if (userIds.length) {
    perUserStats = await Event.aggregate([
      { $match: { ...eventMatch, userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          pagesVisited: { $sum: { $cond: [{ $eq: ["$eventType", "page_visit"] }, 1, 0] } },
          purchases: { $sum: { $cond: [{ $eq: ["$eventType", "purchase"] }, 1, 0] } },
          timeSpent: { $sum: { $ifNull: ["$durationSec", 0] } },
        }
      }
    ]).exec();
  }

  const statMap = new Map<string, any>(perUserStats.map((s) => [String(s._id), s]));
  const usersWithStats = users.map((u) => {
    const s = statMap.get(String(u._id)) || { pagesVisited: 0, purchases: 0, timeSpent: 0 };
    return {
      userId: u._id,
      name: u.name,
      email: u.email,
      device: u.device,
      country: u.country,
      pagesVisited: s.pagesVisited,
      purchases: s.purchases,
      timeSpent: s.timeSpent
    };
  });

  // Trend data by day
  const trendAgg = await Event.aggregate([
    { $match: eventMatch },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        pageVisits: { $sum: { $cond: [{ $eq: ["$eventType", "page_visit"] }, 1, 0] } },
        purchases: { $sum: { $cond: [{ $eq: ["$eventType", "purchase"] }, 1, 0] } },
        timeSpent: { $sum: { $ifNull: ["$durationSec", 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]).exec();

  const trendData = trendAgg.map((t) => ({ date: t._id, pageVisits: t.pageVisits, purchases: t.purchases, timeSpent: t.timeSpent }));

  return {
    filters: { startDate, endDate, device, country, eventType, q },
    metrics: {
      totalEvents: metrics.totalEvents,
      purchases: metrics.purchases,
      totalTimeSec: metrics.totalTime,
      uniqueUsers: metrics.uniqueUsersCount,
      totalSessions,
      totalUsers
    },
    pagination: {
      page: pageNum,
      limit: pageLimit,
      totalUsers
    },
    users: usersWithStats,
    trendData
  };
}
