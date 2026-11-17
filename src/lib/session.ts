import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";
import { db, schema } from "@/db";
import type { Role } from "@/db/schema";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  consented: boolean;
};

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

/** Session + profile, memoised per request. Returns null when signed out. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  await connection(); // per-request: never prerender pages that read the session
  let session;
  try {
    ({ data: session } = await auth().getSession());
  } catch (e) {
    console.error("auth.getSession failed", e); // treat as signed out rather than a 500
    return null;
  }
  const u = session?.user;
  if (!u) return null;

  let [profile] = await db().select().from(schema.profiles).where(eq(schema.profiles.userId, u.id)).limit(1);
  if (!profile) {
    const role: Role = adminEmails().includes(u.email.toLowerCase()) ? "admin" : "speaker";
    [profile] = await db()
      .insert(schema.profiles)
      .values({ userId: u.id, role })
      .onConflictDoNothing()
      .returning();
    profile ??= (await db().select().from(schema.profiles).where(eq(schema.profiles.userId, u.id)))[0];
  }
  return { id: u.id, email: u.email, name: u.name, role: profile.role, consented: !!profile.consentAt };
});

export async function requireUser(opts: { roles?: Role[]; consent?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (opts.roles && !opts.roles.includes(user.role)) redirect("/");
  if (opts.consent && !user.consented) redirect("/onboarding");
  return user;
}

/** For route handlers: returns the user or a JSON error response. */
export async function apiUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  if (roles && !roles.includes(user.role)) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) } as const;
  }
  return { user } as const;
}

export const canReview = (role: Role) => role === "reviewer" || role === "admin";
