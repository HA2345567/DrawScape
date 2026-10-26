import { upgradeWebSocket } from "@vercel/functions";
import { attachRealtime } from "http-backend/realtime";
export const runtime = "nodejs";
export const maxDuration = 300;
export function GET() {
  return upgradeWebSocket(ws => attachRealtime(ws), { maxPayload: 2_200_000 });
}
