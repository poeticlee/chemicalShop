import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "*.netlify.app").split(",").map(s => s.trim()).filter(Boolean),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, requireEmailVerification: false, minPasswordLength: 8 },
  session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60 },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "sales", required: false },
      locationIds: { type: "string", defaultValue: "[]", required: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Bootstrap safety: the very first account becomes owner.
        // Every later signup is forced to sales — only an owner can promote via /api/users.
        async before(user) {
          const count = await prisma.user.count();
          if (count === 0) return { data: { ...user, role: "owner" } };
          if (user.role === "owner" || user.role === "manager") return { data: { ...user, role: "sales" } };
          return { data: user };
        },
      },
    },
  },
});
