import { Router } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { prismaClient as db } from "@repo/db";
import { getJwtSecret } from "@repo/backend-common";
import jwt from "jsonwebtoken";
import { signToken } from "./security";
const router = Router();
const enabled = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI === frontend() + "/api/v1/auth/google/callback");
const frontend = () => process.env.FRONTEND_URL || "http://localhost:3000";
const safeNext = (next: unknown) => typeof next === "string" && /^\/canvas(?:\/[a-zA-Z0-9_-]+)?$/.test(next) ? next : "/canvas";
const client = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
router.get("/providers", (_req, res) => res.json({ google: enabled() }));
router.get("/google", (req, res) => {
  if (!enabled()) { res.status(503).json({ message: "Google sign-in is not configured." }); return; }
  const state = jwt.sign({ nonce: randomBytes(24).toString("hex"), next: safeNext(req.query.next) }, getJwtSecret(), { expiresIn: "10m", issuer: "drawscape-oauth" });
  res.cookie("drawscape_oauth", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600_000, path: "/api/v1/auth" });
  res.redirect(client().generateAuthUrl({ scope: ["profile", "email"], state, prompt: "select_account" }));
});
router.get("/google/callback", async (req, res) => {
  const failure = () => res.redirect(frontend() + "/signin?error=Google%20sign-in%20failed.%20Please%20try%20again.");
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const cookie = req.headers.cookie?.split(";").map(s => s.trim()).find(s => s.startsWith("drawscape_oauth="))?.slice("drawscape_oauth=".length) || "";
  res.clearCookie("drawscape_oauth", { path: "/api/v1/auth" });
  if (!enabled() || !state || Buffer.byteLength(state) !== Buffer.byteLength(cookie) || !timingSafeEqual(Buffer.from(state), Buffer.from(cookie))) { failure(); return; }
  try {
    const data = jwt.verify(state, getJwtSecret(), { issuer: "drawscape-oauth", algorithms: ["HS256"] });
    if (typeof data === "string" || typeof req.query.code !== "string") { failure(); return; }
    const oauth = client();
    const { tokens } = await oauth.getToken(req.query.code);
    const ticket = await oauth.verifyIdToken({ idToken: tokens.id_token!, audience: process.env.GOOGLE_CLIENT_ID });
    const profile = ticket.getPayload();
    if (!profile?.email || !profile.email_verified) { failure(); return; }
    const email = profile.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });
    const user = existing
      ? await db.user.update({ where: { id: existing.id }, data: { googleId: profile.sub, photo: profile.picture } })
      : await db.user.create({ data: { email, name: profile.name || email, googleId: profile.sub, photo: profile.picture } });
    res.redirect(frontend() + "/signin?next=" + encodeURIComponent(safeNext(data.next)) + "#token=" + encodeURIComponent(signToken(user.id)));
  } catch { failure(); }
});
export default router;
