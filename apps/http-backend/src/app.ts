import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { prismaClient } from "@repo/db";
import { getJwtSecret } from "@repo/backend-common";
import userRouter from "./user";
import authRouter from "./auth";
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.FRONTEND_URL || false }));
app.use(express.json({ limit: "3mb" }));
app.use("/api", (_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
app.get("/api/v1/health", async (_req, res) => {
  getJwtSecret();
  await prismaClient.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", userRouter);
const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  const invalid = error?.name === "ZodError" || error?.type === "entity.too.large";
  if (invalid) { res.status(400).json({ message: "Invalid or oversized request." }); return; }
  console.error("Request failed:", error?.code || error?.name || "unknown");
  res.status(503).json({ message: "Service temporarily unavailable. Please try again." });
};
app.use(errors);
export default app;
