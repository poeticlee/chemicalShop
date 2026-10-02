import { createHash, randomBytes } from "crypto";
export const hashPassword = (pw: string) => createHash("sha256").update(`chemshop:${pw}`).digest("hex");
export const makeToken = (userId: string) => Buffer.from(`${userId}.${randomBytes(16).toString("hex")}`).toString("base64url");
export const isAdmin = (role?: string) => role === "owner" || role === "manager" || role === "accountant";
