// src/routes/userJourney.routes.ts
import { Router } from "express";
import { userJourneyHandler } from "../controllers/userJourney.controller";

const router = Router();

router.get("/:id/journey", userJourneyHandler);

export default router;
