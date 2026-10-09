import { PrismaClient } from "@prisma/client";
import { getConnectionString } from "@netlify/database";

// Netlify Database supplies the connection string for the current environment
// (production branch on deploys, isolated branch on deploy previews).
// Local `next dev` has no Netlify context, so it falls back to DATABASE_URL (localhost).
function resolveDatabaseUrl() {
  // On Netlify (builds, functions, previews) this picks the correct database branch.
  if (process.env.NETLIFY_DB_URL) {
    try {
      const s = getConnectionString();
      if (s) return s;
    } catch {
      // Fall through to DATABASE_URL below.
    }
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("No database: set DATABASE_URL or run with Netlify Database context");
  return url;
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  g.prisma ?? new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
