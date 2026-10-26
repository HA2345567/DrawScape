import { HTTP_BACKEND } from "@/config";
import type { CanvasElement } from "./types";
export async function getExistingShapes(roomId: string): Promise<CanvasElement[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(HTTP_BACKEND + "/api/v1/chats/" + roomId, { headers: { Authorization: "Bearer " + token } });
  if (!response.ok) throw new Error("Could not load canvas.");
  const data = await response.json();
  return data.messages.map((row: { message: string }) => JSON.parse(row.message).shape).filter((shape: CanvasElement) => !shape.isDeleted);
}
