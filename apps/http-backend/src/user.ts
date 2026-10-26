import { Router } from "express";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common";
import { prismaClient as db } from "@repo/db";
import { middleware, type AuthenticatedRequest } from "./middleware";
import { hashPassword, verifyPassword, signToken } from "./security";
import { appendEvent, joinRoom, readEvents } from "./events";
const router = Router();
const attempts = new Map<string, { count: number; expires: number }>();
router.use(["/signup", "/signin"], (req, res, next) => {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires < now) attempts.delete(key);
  const key = req.ip || "unknown";
  const entry = attempts.get(key) || { count: 0, expires: now + 60_000 };
  if (++entry.count > 30) { res.status(429).json({ message: "Too many attempts. Try again in a minute." }); return; }
  attempts.set(key, entry);
  next();
});
router.post("/signup", async (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Use a valid email, a name, and a password of 10-128 characters." }); return; }
  try {
    const user = await db.user.create({ data: { email: parsed.data.username, name: parsed.data.name, password: await hashPassword(parsed.data.password) } });
    res.status(201).json({ userId: user.id, token: signToken(user.id) });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      res.status(409).json({ message: "An account with this email already exists." }); return;
    }
    throw error;
  }
});
router.post("/signin", async (req, res) => {
  const parsed = SigninSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Enter a valid email and password." }); return; }
  const user = await db.user.findUnique({ where: { email: parsed.data.username } });
  if (!await verifyPassword(parsed.data.password, user?.password ?? null)) {
    res.status(401).json({ message: "Invalid email or password." }); return;
  }
  res.json({ token: signToken(user!.id) });
});
router.post("/room", middleware, async (req: AuthenticatedRequest, res) => {
  const parsed = CreateRoomSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: "Invalid room name." }); return; }
  const room = await joinRoom(parsed.data.roomName, req.userId!);
  res.json({ roomId: room.id, slug: room.slug });
});
router.post("/rooms/:slug/join", middleware, async (req: AuthenticatedRequest, res) => {
  const room = await joinRoom(String(req.params.slug), req.userId!);
  res.json({ roomId: room.id, slug: room.slug });
});
router.get("/chats/:roomId", middleware, async (req, res) => {
  const after = Number(req.query.after || 0);
  if (!Number.isSafeInteger(after) || after < 0) { res.status(400).json({ message: "Invalid cursor." }); return; }
  res.json(await readEvents(String(req.params.roomId), after));
});
router.post("/events/:slug", middleware, async (req: AuthenticatedRequest, res) => {
  const event = await appendEvent(String(req.params.slug), req.userId!, req.body?.shape, req.body?.clientId);
  res.status(201).json({ id: event.id });
});
router.get("/room/:slug", middleware, async (req, res) => {
  const room = await db.room.findUnique({ where: { slug: String(req.params.slug) } });
  res.status(room ? 200 : 404).json({ room });
});
export default router;
