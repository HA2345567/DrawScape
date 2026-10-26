import type { WebSocket } from "ws";
import { readToken } from "./security";
import { appendEvent, joinRoom, readRoomEvents } from "./events";
type Socket = Pick<WebSocket, "on" | "send" | "close" | "readyState">;
export function attachRealtime(ws: Socket) {
  let userId: number | undefined;
  let slug = "";
  let cursor = 0;
  let numericRoomId = 0;
  let closed = false;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let queue = Promise.resolve();
  const send = (value: unknown) => { if (ws.readyState === 1) ws.send(JSON.stringify(value)); };
  const cleanup = () => { closed = true; clearTimeout(pollTimer); clearTimeout(authTimer); clearTimeout(lifetime); };
  const fail = () => { send({ type: "error", message: "Connection could not sync. Reconnecting..." }); ws.close(1011, "Sync unavailable"); cleanup(); };
  const poll = async () => {
    if (closed || !slug) return;
    try {
      const data = await readRoomEvents(numericRoomId, cursor);
      for (const row of data.messages) send({ type: "chat", message: row.message, roomId: slug, id: row.id });
      cursor = data.nextCursor;
      if (!closed) pollTimer = setTimeout(() => void poll(), data.hasMore ? 0 : 500);
    } catch { fail(); }
  };
  const authTimer = setTimeout(() => { if (!userId) { ws.close(1008, "Authentication required"); cleanup(); } }, 5000);
  const lifetime = setTimeout(() => { ws.close(1001, "Reconnect to refresh session"); cleanup(); }, 240_000);
  ws.on("message", (data) => {
    queue = queue.then(async () => {
      if (closed) return;
      if (data.toString().length > 2_200_000) { ws.close(1009, "Message too large"); cleanup(); return; }
      const event = JSON.parse(data.toString());
      if (event.type === "auth") {
        userId = readToken(String(event.token || ""));
        clearTimeout(authTimer);
        send({ type: "authenticated" });
        return;
      }
      if (!userId) { ws.close(1008, "Authentication required"); cleanup(); return; }
      if (event.type === "join_room") {
        if (slug) throw new Error("One room per connection");
        slug = String(event.roomId || "");
        const after = Number(event.after || 0);
        if (!Number.isSafeInteger(after) || after < 0) throw new Error("Invalid cursor");
        numericRoomId = (await joinRoom(slug, userId)).id;
        cursor = after;
        send({ type: "joined", roomId: slug });
        void poll();
      } else if (event.type === "chat" && slug && event.roomId === slug) {
        await appendEvent(slug, userId, JSON.parse(event.message).shape);
      } else if (event.type === "leave_room") {
        ws.close(1000);
        cleanup();
      }
    }).catch(fail);
  });
  ws.on("close", cleanup);
  ws.on("error", cleanup);
}
