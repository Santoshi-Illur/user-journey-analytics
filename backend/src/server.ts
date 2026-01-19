import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { MONGO_URI, PORT } from "./config";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import eventsRoutes from "./routes/events";
import funnelRoutes from "./routes/funnel";
import { errorHandler } from "./middleware/errorHandler";
import dashboardRouter from "./routes/dashboard.routes";
import userJourneyRouter from "./routes/userJourney.routes";
import funnelRouter from "./routes/funnel.routes";


const app = express();

app.use(helmet()); // provides security headers
app.use(cors()); // provides CORS headers
app.use(express.json({ limit: "1mb" }));

// Basic rate limit (tune for your infra)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/events", eventsRoutes);
// app.use("/api/funnel", funnelRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/user", userJourneyRouter);         // user journey endpoints like /api/user/:id/journey
app.use("/api/funnel", funnelRouter);



// health
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// error handler must be last
app.use(errorHandler);

// Connect & start
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connect error", err);
    process.exit(1);
  });
