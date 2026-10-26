import { describe, expect, test } from "bun:test";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword, signToken, readToken } from "../apps/http-backend/src/security";
import { getJwtSecret } from "@repo/backend-common";
describe("authentication security", () => {
  test("passwords are salted, hashed, and verified without storing plaintext", async () => {
    const password = "Drawscape-test-password!";
    const first = await hashPassword(password);
    expect(first).not.toContain(password);
    expect(first).not.toBe(await hashPassword(password));
    expect(await verifyPassword(password, first)).toBe(true);
    expect(await verifyPassword("incorrect", first)).toBe(false);
    expect(await verifyPassword(password, password)).toBe(false);
    expect(await verifyPassword(password, null)).toBe(false);
  });
  test("tokens have bounded lifetime and validate issuer, signature, and user ID", () => {
    const token = signToken(123);
    expect(readToken(token)).toBe(123);
    const payload = jwt.decode(token) as jwt.JwtPayload;
    expect(payload.exp! - payload.iat!).toBe(7 * 24 * 60 * 60);
    expect(() => readToken(jwt.sign({ userId: 123 }, "old-hardcoded-secret"))).toThrow();
    expect(() => readToken(jwt.sign({ userId: 123 }, getJwtSecret(), { expiresIn: -1, issuer: "drawscape", audience: "drawscape" }))).toThrow();
    expect(() => readToken(jwt.sign({ userId: "123" }, getJwtSecret(), { issuer: "drawscape", audience: "drawscape" }))).toThrow();
  });
});
