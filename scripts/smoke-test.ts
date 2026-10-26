import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import WebSocket from "ws";
import { prismaClient as db } from "../packages/db/src/index";
const base = process.argv[2] || process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const socketUrl = process.argv[3] || process.env.TEST_WS_URL || "ws://localhost:8080";
const cookie = process.argv[4] ? readFileSync(process.argv[4], "utf8").split(/\r?\n/).map(line => line.replace(/^#HttpOnly_/, "")).filter(line => line && !line.startsWith("#")).map(line => line.split("\t")).filter(parts => parts.length >= 7).map(parts => parts[5] + "=" + parts[6]).join("; ") : "";
const prefix = "drawscape-test-" + randomUUID();
const emails = [prefix + "-a@example.invalid", prefix + "-b@example.invalid"];
const password = "Drawscape-test-password!";
const clients: WebSocket[] = [];
let checks = 0;
const check = (name: string) => { checks++; console.log("PASS " + name); };
async function call(path: string, token?: string, body?: unknown, method?: string) {
  const response = await fetch(base + "/api/v1" + path, {
    method: method || (body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  return { status: response.status, data };
}
async function connect(token: string, roomId: string) {
  const ws = new WebSocket(socketUrl, { headers: cookie ? { Cookie: cookie } : {} });
  clients.push(ws);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(Error("Socket join timed out")), 15000);
    ws.on("open", () => ws.send(JSON.stringify({ type: "auth", token })));
    ws.on("error", reject);
    ws.on("message", raw => {
      const message = JSON.parse(raw.toString());
      if (message.type === "authenticated") ws.send(JSON.stringify({ type: "join_room", roomId, after: 0 }));
      if (message.type === "joined") { clearTimeout(timer); resolve(); }
    });
  });
  return ws;
}
function waitFor(ws: WebSocket, id: string, deleted = false) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { ws.off("message", listener); reject(Error("Peer did not receive persisted event")); }, 15000);
    const listener = (raw: WebSocket.RawData) => {
      const event = JSON.parse(raw.toString());
      if (event.type !== "chat") return;
      const { shape } = JSON.parse(event.message);
      if (shape.id === id && Boolean(shape.isDeleted) === deleted) { clearTimeout(timer); ws.off("message", listener); resolve(); }
    };
    ws.on("message", listener);
  });
}
try {
  assert.equal((await call("/health")).status, 200); check("API and database health");
  const accounts = [];
  for (const username of emails) {
    const response = await call("/signup", undefined, { username, password, name: "Disposable Drawscape test" });
    assert.equal(response.status, 201); assert.ok(response.data.token); accounts.push(response.data.token);
  }
  const [a, b] = accounts;
  const stored = await db.user.findUniqueOrThrow({ where: { email: emails[0] } });
  assert.ok(stored.password?.startsWith("scrypt:")); check("signup stores password hash");
  assert.equal((await call("/signin", undefined, { username: emails[0], password: "wrong" })).status, 401);
  assert.equal((await call("/signin", undefined, { username: emails[0], password })).status, 200);
  assert.equal((await call("/signup", undefined, { username: emails[0], password, name: "Duplicate" })).status, 409);
  assert.equal((await call("/signup", undefined, { username: "bad", password: "weak", name: "" })).status, 400); check("signin, duplicate-account, and input validation");
  assert.equal((await call("/chats/" + prefix)).status, 401);
  assert.equal((await call("/chats/" + prefix, "invalid-token")).status, 401); check("history rejects unauthenticated access");
  for (const token of accounts) assert.equal((await call("/rooms/" + prefix + "/join", token, {})).status, 200);
  await connect(a, prefix); const peer = await connect(b, prefix);
  const shape = { id: randomUUID(), type: "rectangle", x: 10, y: 20, width: 120, height: 80, strokeColor: "#ffffff", backgroundColor: "transparent", strokeWidth: 2, strokeStyle: "solid", opacity: 1 };
  let received = waitFor(peer, shape.id);
  assert.equal((await call("/events/" + prefix, a, { shape, clientId: "smoke-a" })).status, 201);
  await received; check("two clients receive persisted events over WebSocket");
  received = waitFor(peer, shape.id, true);
  assert.equal((await call("/events/" + prefix, a, { shape: { ...shape, isDeleted: true }, clientId: "smoke-a" })).status, 201);
  await received; check("deletion reaches peer");
  assert.equal((await call("/events/" + prefix, a, { shape, clientId: "smoke-a" })).status, 201);
  const history = await call("/chats/" + prefix, b);
  assert.equal(history.status, 200); assert.equal(history.data.messages.length, 3);
  const snapshot = new Map();
  for (const row of history.data.messages) { const item = JSON.parse(row.message).shape; if (item.isDeleted) snapshot.delete(item.id); else snapshot.set(item.id,item); }
  assert.equal(snapshot.size, 1); assert.equal(snapshot.get(shape.id).width, 120);
  assert.equal((await call("/chats/" + prefix + "?after=" + history.data.nextCursor, b)).data.messages.length, 0);
  check("refresh reconstruction and incremental history cursor");
  assert.equal((await call("/events/" + prefix, a, { shape: { id: "invalid" } })).status, 400); check("invalid shape rejected");
  const providers = await call("/auth/providers"); assert.equal(providers.status, 200);
  check("auth provider configuration endpoint");
  console.log(JSON.stringify({ result: "passed", checks, target: base }));
} finally {
  clients.forEach(ws => ws.close());
  const users = await db.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  const ids = users.map(user => user.id);
  await db.chat.deleteMany({ where: { userId: { in: ids } } });
  await db.room.deleteMany({ where: { adminId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
  console.log("Disposable test data removed.");
}
