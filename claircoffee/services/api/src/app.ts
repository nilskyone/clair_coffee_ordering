import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import shiftRoutes from "./routes/shifts";
import menuRoutes from "./routes/menu";
import orderRoutes from "./routes/orders";
import customerRoutes from "./routes/customers";
import inventoryRoutes from "./routes/inventory";
import reportRoutes from "./routes/reports";
import publicRoutes from "./routes/public";

export function createApp() {
  const app = express();

  const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = [...envOrigins];
  const lanRegex = /^http:\\/\\/(\\d{1,3}\\.){3}\\d{1,3}:(5173|5174|5175|5176|5177|5178|5179)$/;

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || lanRegex.test(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      }
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/v1/auth", authRoutes);
  app.use("/v1/shifts", shiftRoutes);
  app.use("/v1/menu", menuRoutes);
  app.use("/v1/orders", orderRoutes);
  app.use("/v1/customers", customerRoutes);
  app.use("/v1/public", publicRoutes);
  app.use("/v1/inventory", inventoryRoutes);
  app.use("/v1/reports", reportRoutes);

  app.use(errorHandler);

  return app;
}
