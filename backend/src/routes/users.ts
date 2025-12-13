import express from "express";
import { listUsers, getUserJourney } from "../controllers/usersController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Protected routes
router.get("/", authMiddleware, listUsers);
router.get("/:id", authMiddleware, getUserJourney);

export default router;
