import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  dotenv.config();
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
}

const connectionString = process.env.DATABASE_URL || "";
const pool = new pg.Pool({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 10000,
  query_timeout: 10000,
  statement_timeout: 10000,
  allowExitOnIdle: true,
});
const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({ adapter });
export { PrismaClient };


