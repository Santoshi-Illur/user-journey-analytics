// src/services/funnel.service.ts
import dayjs from "dayjs";
import Event from "../models/Event";

export async function computeFunnel(start?: string, end?: string) {
  const startDate = start ? dayjs(start).toDate() : dayjs().subtract(30, "day").toDate();
  const endDate = end ? dayjs(end).toDate() : new Date();

  // aggregate unique sessions seen per eventType
  const pipeline = [
    { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: { sessionId: "$sessionId", eventType: "$eventType" } } },
    { $group: { _id: "$_id.eventType", sessions: { $addToSet: "$_id.sessionId" } } }
  ];

  const agg = await Event.aggregate(pipeline).exec();

  const counts: Record<string, number> = {};
  for (const g of agg) {
    counts[g._id] = Array.from(new Set(g.sessions.map((s: any) => String(s)))).length;
  }

  const stages = [
    { key: "session_start", label: "Session Start" },
    { key: "page_visit", label: "Page Visit" },
    { key: "product_view", label: "Product View" },
    { key: "add_to_cart", label: "Add to Cart" },
    { key: "checkout", label: "Checkout" },
    { key: "purchase", label: "Purchase" }
  ];

  const funnel = stages.map((s) => ({ stage: s.label, eventType: s.key, count: counts[s.key] ?? 0 }));

  const funnelWithConversion = funnel.map((f, idx, arr) => {
    const prev = idx === 0 ? null : arr[idx - 1];
    const conversion = prev && prev.count > 0 ? Number(((f.count / prev.count) * 100).toFixed(2)) : idx === 0 ? 100 : 0;
    return { ...f, conversionPercent: conversion };
  });

  // timeline per day
  const timelineAgg = await Event.aggregate([
    { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, eventType: "$eventType" }, sessions: { $addToSet: "$sessionId" } } },
    { $project: { _id: 0, day: "$_id.day", eventType: "$_id.eventType", count: { $size: "$sessions" } } },
    { $sort: { day: 1 } }
  ]).exec();

  const timelineMap = new Map<string, Record<string, number>>();
  timelineAgg.forEach((r: any) => {
    if (!timelineMap.has(r.day)) timelineMap.set(r.day, {});
    timelineMap.get(r.day)![r.eventType] = r.count;
  });

  const timeline = Array.from(timelineMap.entries()).map(([date, map]) => ({ date, ...map }));

  return { funnel: funnelWithConversion, timeline };
}
