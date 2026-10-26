export const HTTP_BACKEND = process.env.NEXT_PUBLIC_API_URL || "";
export function getWebSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return "ws://localhost:8080";
  return `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/ws`;
}
