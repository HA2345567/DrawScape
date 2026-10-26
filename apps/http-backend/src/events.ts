import { z } from "zod";
import { prismaClient as db } from "@repo/db";
export const slugSchema = z.string().regex(/^[a-zA-Z0-9_-]{6,64}$/);
const shapeSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(["rectangle","diamond","ellipse","arrow","line","freedraw","text","image"]),
  isDeleted: z.boolean().optional(),
  x: z.number().finite(), y: z.number().finite(), width: z.number().finite(), height: z.number().finite(),
  src: z.string().max(2_000_000).regex(/^data:image\/(png|jpeg|webp|gif);base64,/).optional(),
}).passthrough();
export async function joinRoom(slug: string, userId: number) {
  slugSchema.parse(slug);
  return db.room.upsert({ where: { slug }, update: {}, create: { slug, adminId: userId } });
}
export async function appendEvent(slug: string, userId: number, value: unknown, clientId?: string) {
  slugSchema.parse(slug);
  const shape = shapeSchema.parse(value);
  const message = JSON.stringify({ shape, clientId: typeof clientId === "string" ? clientId.slice(0, 100) : undefined });
  if (Buffer.byteLength(message) > 2_100_000) throw new Error("Element too large");
  const room = await db.room.findUnique({ where: { slug } });
  if (!room) throw new Error("Room not found");
  return db.$transaction(async tx => {
    // Serialize inserts within a room so cursor IDs follow commit order.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${room.id})`;
    return tx.chat.create({ data: { roomId: room.id, userId, message } });
  });
}
export async function readEvents(slug: string, after = 0) {
  slugSchema.parse(slug);
  const room = await db.room.findUnique({ where: { slug } });
  if (!room) return { messages: [], nextCursor: after, hasMore: false };
  return readRoomEvents(room.id, after);
}
export async function readRoomEvents(roomId: number, after: number) {
  const rows = await db.chat.findMany({
    where: { roomId, id: { gt: after } }, orderBy: { id: "asc" }, take: 21,
  });
  let bytes = 0;
  const messages = [];
  for (const row of rows.slice(0, 20)) {
    const size = Buffer.byteLength(JSON.stringify(row));
    if (messages.length && bytes + size > 2_500_000) break;
    messages.push(row); bytes += size;
  }
  const hasMore = rows.length > messages.length;
  return { messages, nextCursor: messages.at(-1)?.id ?? after, hasMore };
}
