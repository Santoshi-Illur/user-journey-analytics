import express from "express";
import { authMiddleware } from "../middleware/auth";
import Event from "../models/Event";

const router = express.Router();

// example funnel: fraction of users with session_start -> add_to_cart -> purchase in timeframe
router.get("/", authMiddleware, async (req, res) => {
  const { startDate, endDate } = req.query;
  const match: any = {};
  if (startDate || endDate) match.timestamp = {};
  if (startDate) match.timestamp.$gte = new Date(String(startDate));
  if (endDate) match.timestamp.$lte = new Date(String(endDate));

  // This is simplistic — in real use you would do user-level event sequencing via aggregation
  const totalSessions = await Event.countDocuments({ ...match, eventType: "session_start" });
  const addToCart = await Event.countDocuments({ ...match, eventType: "add_to_cart" });
  const purchases = await Event.countDocuments({ ...match, eventType: "purchase" });

  res.json({
    totalSessions,
    addToCart,
    purchases,
    funnel: [
      { step: "session_start", count: totalSessions },
      { step: "add_to_cart", count: addToCart },
      { step: "purchase", count: purchases },
    ],
  });
});

export default router;
