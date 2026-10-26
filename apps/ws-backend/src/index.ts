import { WebSocketServer } from "ws";
import { attachRealtime } from "http-backend/realtime";
const server = new WebSocketServer({ port: Number(process.env.WS_PORT || 8080), maxPayload: 2_200_000 });
server.on("connection", (ws) => attachRealtime(ws));
console.log("WebSocket server ready");
