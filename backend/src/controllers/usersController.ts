import { Request, Response } from "express";
import User from "../models/User";
import Event from "../models/Event";
import mongoose from "mongoose";

/**
 * GET /api/users
 * Query params: q, device, country, event (filter), startDate, endDate, page, limit
 */
export const listUsers = async (req: Request, res: Response) => {
  const q = (req.query.q as string) || "";
  const device = (req.query.device as string) || "";
  const country = (req.query.country as string) || "";
  const eventType = (req.query.event as string) || "";
  const page = Number(req.query.page || 0);
  const limit = Number(req.query.limit || 10);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : null;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : null;

  // NOTE: for efficiency consider pre-aggregated daily user stats
  const match: any = {};
  if (q) match.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  if (device) match.device = device;
  if (country) match.country = country;

  const users = await User.find(match)
    .skip(page * limit)
    .limit(limit)
    .lean();

  // optionally compute purchases/pages/time by querying events per user -> here just return user + light stats
  const userIds = users.map((u) => u._id);
  const eventsMatch: any = { userId: { $in: userIds } };
  if (eventType) eventsMatch.eventType = eventType;
  if (startDate || endDate) {
    eventsMatch.timestamp = {};
    if (startDate) eventsMatch.timestamp.$gte = startDate;
    if (endDate) eventsMatch.timestamp.$lte = endDate;
  }

  const agg = await Event.aggregate([
    { $match: eventsMatch },
    { $group: { _id: "$userId", pagesVisited: { $sum: { $cond: [{ $eq: ["$eventType", "page_visit"] }, 1, 0] } }, purchases: { $sum: { $cond: [{ $eq: ["$eventType", "purchase"] }, 1, 0] } }, time: { $sum: "$durationSec" } } },
  ]);

  const statsByUser = new Map(agg.map((a: any) => [String(a._id), a]));

  const result = users.map((u: any) => ({
    userId: u._id,
    name: u.name,
    email: u.email,
    device: u.device,
    country: u.country,
    pagesVisited: statsByUser.get(String(u._id))?.pagesVisited || 0,
    purchaseCount: statsByUser.get(String(u._id))?.purchases || 0,
    timeOnPage: statsByUser.get(String(u._id))?.time || 0,
  }));

  const total = await User.countDocuments(match);

  res.json({ data: result, total, page, limit });
};

/**
 * GET /api/users/:id
 * Return user profile + recent events (paginated)
 */
export const getUserJourney = async (req: Request, res: Response) => {
  const id = req.params.id;
  const page = Number(req.query.page || 0);
  const limit = Number(req.query.limit || 50);
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

  const user = await User.findById(id).lean();
  if (!user) return res.status(404).json({ message: "Not found" });

  const events = await Event.find({ userId: id }).sort({ timestamp: -1 }).skip(page * limit).limit(limit).lean();
  res.json({ user, events, page, limit });
};
