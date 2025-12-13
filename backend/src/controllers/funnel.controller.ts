// src/controllers/funnel.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { computeFunnel } from "../services/funnel.service";
import { ok } from "../utils/apiResponse";

export const funnelHandler = asyncHandler(async (req: Request, res: Response) => {
  const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;
  const data = await computeFunnel(start, end);
  res.json(ok(data));
});
