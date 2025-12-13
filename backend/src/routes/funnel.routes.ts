// src/routes/funnel.routes.ts
import { Router } from "express";
import { funnelHandler } from "../controllers/funnel.controller";

const router = Router();

router.get("/", funnelHandler);

export default router;
