import express from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes will be registered here

app.use(errorHandler);

export default app;
