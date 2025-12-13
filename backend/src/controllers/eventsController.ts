import { Request, Response } from "express";
import Event from "../models/Event";
import mongoose from "mongoose";

/**
 * POST /api/events
 * Create event(s). Accepts either single event or array
 */
export const createEvents = async (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload) return res.status(400).json({ message: "Missing body" });

  const docs = Array.isArray(payload) ? payload : [payload];
  // minimal validation here — validate schema in production
  const created = await Event.insertMany(docs);
  res.json({ createdCount: created.length });
};

/**
 * GET /api/events
 * Query events by filters
 */
export const listEvents = async (req: Request, res: Response) => {
  const { userId, eventType, device, country, startDate, endDate, page = 0, limit = 50 } = req.query;

  const q: any = {};
  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) q.userId = String(userId);
  if (eventType) q.eventType = eventType;
  if (device) q.device = device;
  if (country) q.country = country;
  if (startDate || endDate) q.timestamp = {};
  if (startDate) q.timestamp.$gte = new Date(String(startDate));
  if (endDate) q.timestamp.$lte = new Date(String(endDate));

  const p = Number(page);
  const l = Number(limit);

  const items = await Event.find(q).sort({ timestamp: -1 }).skip(p * l).limit(l).lean();
  const total = await Event.countDocuments(q);

  res.json({ items, total, page: p, limit: l });
};
