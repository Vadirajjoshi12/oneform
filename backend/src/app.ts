import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import healthRoutes from "./routes/health.routes";
import poolRoutes from "./routes/pool.routes";
import nearbyRoutes from "./routes/nearby.routes";
import joinRoutes from "./routes/join.routes";

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://oneform-3.onrender.com",
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());

// Limit request body size to reduce accidental or abusive oversized payloads.
app.use(express.json({ limit: "100kb" }));

// General API protection: allow normal app usage while throttling abusive bursts.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Routes
app.use("/health", healthRoutes);
app.use("/api/pools/nearby", nearbyRoutes);
app.use("/api/pools", poolRoutes);
app.use("/api/pools", joinRoutes);

export default app;
