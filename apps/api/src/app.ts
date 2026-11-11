import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/not-found-handler.js";
import { errorHandler } from "./middleware/error-handler.js";
import runRoutes from "./modules/runs/routes/run.routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);

app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/test-error", async () => {
  throw new Error("Testing global error handler");
});

app.use("/runs", runRoutes);

// Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
