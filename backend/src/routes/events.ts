import express from "express";
import { createEvents, listEvents } from "../controllers/eventsController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, createEvents);
router.get("/", authMiddleware, listEvents);

export default router;
