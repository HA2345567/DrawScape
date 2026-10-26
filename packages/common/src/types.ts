import { z } from "zod";
const email = z.string().trim().toLowerCase().email().max(254);
export const CreateUserSchema = z.object({
  username: email, password: z.string().min(10).max(128), name: z.string().trim().min(1).max(100),
});
export const SigninSchema = z.object({ username: email, password: z.string().min(1).max(128) });
export const CreateRoomSchema = z.object({ roomName: z.string().regex(/^[a-zA-Z0-9_-]{6,64}$/) });
