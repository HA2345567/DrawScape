import type { NextFunction, Request, Response } from "express";
import { readToken } from "./security";
export type AuthenticatedRequest = Request & { userId?: number };
export function middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    req.userId = readToken(header.startsWith("Bearer ") ? header.slice(7) : header);
    next();
  } catch {
    res.status(401).json({ message: "Please sign in again." });
  }
}
