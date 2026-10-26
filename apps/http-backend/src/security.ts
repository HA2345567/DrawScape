import { randomBytes, scrypt as rawScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@repo/backend-common";
const scrypt = promisify(rawScrypt);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string | null) {
  if (!stored?.startsWith("scrypt:")) return false;
  const [, salt, hex] = stored.split(":");
  if (!salt || !hex || !/^[a-f0-9]{128}$/.test(hex)) return false;
  const hash = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(hash, Buffer.from(hex, "hex"));
}
export function signToken(userId: number) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d", issuer: "drawscape", audience: "drawscape" });
}
export function readToken(token: string): number {
  const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"], issuer: "drawscape", audience: "drawscape" });
  if (typeof decoded === "string" || !Number.isSafeInteger(decoded.userId) || decoded.userId <= 0) throw new Error("Invalid token");
  return decoded.userId as number;
}
