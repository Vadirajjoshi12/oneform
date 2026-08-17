import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import healthRoutes from "./routes/health.routes";
import poolRoutes from "./routes/pool.routes";
import nearbyRoutes from "./routes/nearby.routes";
import joinRoutes from "./routes/join.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());

app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/api/pools/nearby", nearbyRoutes);
app.use("/api/pools", poolRoutes);
app.use("/api/pools", joinRoutes);

export default app;