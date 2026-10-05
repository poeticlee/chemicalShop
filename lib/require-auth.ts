import { headers } from "next/headers";
import { auth } from "./auth";

export type SessionUser = { id: string; email: string; name?: string | null; role: string; locationIds: string[] };
export const ADMIN_ROLES = ["owner", "manager", "accountant"];
export const isAdminRole = (role?: string) => !!role && ADMIN_ROLES.includes(role);

export async function sessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const u = session.user as unknown as Record<string, unknown>;
  let locs: string[] = [];
  try { locs = JSON.parse(String(u.locationIds ?? "[]")); } catch { locs = []; }
  return { id: String(u.id), email: String(u.email ?? ""), name: (u.name as string | null) ?? null, role: String(u.role ?? "sales"), locationIds: locs };
}

export async function requireUser(allowedRoles?: string[]) {
  const u = await sessionUser();
  if (!u) return { error: Response.json({ error: "login required" }, { status: 401 }) as Response };
  if (allowedRoles && !allowedRoles.includes(u.role))
    return { error: Response.json({ error: "forbidden for role " + u.role }, { status: 403 }) as Response };
  // Location scope: non-owners are confined to their assigned locations
  return { user: u };
}

export function canSeeLocation(u: SessionUser, locationId: string) {
  if (u.role === "owner") return true;
  return u.locationIds.includes(locationId);
}
