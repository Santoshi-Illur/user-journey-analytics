// src/controllers/userJourney.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getUserJourney } from "../services/userJourney.service";
import { ok } from "../utils/apiResponse";

export const userJourneyHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;
  const eventType = req.query.eventType as string | undefined;

  const data = await getUserJourney(userId, start, end, eventType);
  res.json(ok(data));
});
