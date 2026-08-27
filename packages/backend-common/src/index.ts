
const env = (globalThis as typeof globalThis & {
	process?: { env?: Record<string, string | undefined> };
}).process?.env;

export const JWT_SECRET = env?.JWT_SECRET || "2334fdkfjkljfkj";