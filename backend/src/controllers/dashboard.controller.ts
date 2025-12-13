// src/controllers/dashboard.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getDashboardData } from "../services/dashboard.service";
import { ok } from "../utils/apiResponse";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    start: req.query.start as string | undefined,
    end: req.query.end as string | undefined,
    device: req.query.device as string | undefined,
    country: req.query.country as string | undefined,
    eventType: req.query.eventType as string | undefined,
    q: req.query.q as string | undefined,
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10)
  };

  const data = await getDashboardData(query);
  res.json(ok({ ...data }));
});
