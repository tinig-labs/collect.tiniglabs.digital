"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser, requireUser } from "@/lib/session";
import type { Role } from "@/db/schema";
import { CLOSED_BETA, CONTACT_TOPICS } from "@/lib/constants";
import { emailConfigured, sendEmail } from "@/lib/email";
import { withinLimit } from "@/lib/limits";
import { verifyTurnstile } from "@/lib/turnstile";

const str = (f: FormData, k: string, max = 80) => {
  const v = String(f.get(k) ?? "").trim().slice(0, max);
  return v || null;
};

/** Atomically consumes one use of an invite code. Returns the granted role or null. */
async function redeem(code: string, { reviewerOnly = false } = {}): Promise<Role | null> {
  const res = await db().execute<{ role: Role }>(sql`
    UPDATE invite_codes SET uses = uses + 1
    WHERE code = ${code} AND uses < max_uses AND (expires_at IS NULL OR expires_at > now())
      AND (${!reviewerOnly} OR role <> 'speaker')
    RETURNING role`);
  return res.rows[0]?.role ?? null;
}

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboarding(_: OnboardingState, f: FormData): Promise<OnboardingState> {
  const user = await requireUser();
  if (f.get("consent") !== "on") return { error: "Consent is required to contribute recordings." };

  let role = user.role;
  const code = str(f, "invite", 64);
  if (CLOSED_BETA && role === "speaker" && !code) {
    return { error: "The corpus is in closed beta. Enter your invite code, or request one on the contact page." };
  }
  if (code && role === "speaker") {
    if (!(await withinLimit("INVITE_LIMITER", `invite:${user.id}`, { failOpen: false }))) {
      return { error: "Too many attempts. Wait a minute and try again." };
    }
    const granted = await redeem(code.toUpperCase());
    if (!granted) return { error: "That invite code is invalid, expired or fully used." };
    role = granted;
  }

  await db()
    .update(schema.profiles)
    .set({
      role,
      consentAt: new Date(),
      ageRange: str(f, "ageRange"),
      gender: str(f, "gender"),
      region: str(f, "region"),
      firstLanguage: str(f, "firstLanguage"),
      profession: str(f, "profession", 120),
    })
    .where(eq(schema.profiles.userId, user.id));

  redirect(role === "speaker" ? "/record" : "/review");
}

export async function redeemInvite(_: OnboardingState, f: FormData): Promise<OnboardingState> {
  const user = await requireUser();
  const code = str(f, "invite", 64);
  if (!code) return { error: "Enter an invite code." };
  if (!(await withinLimit("INVITE_LIMITER", `invite:${user.id}`, { failOpen: false }))) {
    return { error: "Too many attempts. Wait a minute and try again." };
  }
  const role = await redeem(code.toUpperCase(), { reviewerOnly: true });
  if (!role) return { error: "That invite code is invalid, expired or fully used." };
  await db()
    .update(schema.profiles)
    .set({ role, profession: str(f, "profession", 120) })
    .where(eq(schema.profiles.userId, user.id));
  redirect("/review");
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const s = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

export async function createInvite(f: FormData) {
  const admin = await requireUser({ roles: ["admin"] });
  const r = f.get("role");
  const role: Role = r === "admin" ? "admin" : r === "speaker" ? "speaker" : "reviewer";
  const maxUses = Math.min(Math.max(Number(f.get("maxUses")) || 1, 1), 500);
  const days = Number(f.get("days")) || 0;
  await db().insert(schema.inviteCodes).values({
    code: randomCode(),
    role,
    maxUses,
    note: str(f, "note", 120),
    expiresAt: days > 0 ? new Date(Date.now() + days * 86_400_000) : null,
    createdBy: admin.id,
  });
  revalidatePath("/admin");
}

export async function revokeInvite(f: FormData) {
  await requireUser({ roles: ["admin"] });
  const code = String(f.get("code"));
  await db().update(schema.inviteCodes).set({ expiresAt: new Date() }).where(eq(schema.inviteCodes.code, code));
  revalidatePath("/admin");
}


export type ContactState = { error?: string; sent?: boolean } | undefined;

export async function sendContact(_: ContactState, f: FormData): Promise<ContactState> {
  // Honeypot: real people never see or fill this field.
  if (str(f, "website")) return { sent: true };
  const name = str(f, "name", 120);
  const email = str(f, "email", 200);
  const topicRaw = String(f.get("topic") ?? "general");
  const topic = topicRaw in CONTACT_TOPICS ? topicRaw : "general";
  const message = String(f.get("message") ?? "").trim().slice(0, 5000);
  if (!name || !email || !message) return { error: "Fill in your name, email and message." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (message.length < 10) return { error: "Your message is a little short. Add a few more details." };

  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for") ?? "unknown";
  if (!(await withinLimit("INVITE_LIMITER", `contact:${ip}`))) return { error: "Too many messages. Try again in a minute." };
  if (!(await verifyTurnstile(f.get("cf-turnstile-response"), ip))) {
    return { error: "Please complete the bot check and try again." };
  }

  const user = await getCurrentUser();
  const [row] = await db()
    .insert(schema.contactMessages)
    .values({ name, email, topic, message, userId: user?.id ?? null })
    .returning({ id: schema.contactMessages.id });

  // Alert by email without making the sender wait. The message is already saved, so a failed
  // alert only means it shows up in /admin without a notification.
  const alertTo = process.env.CONTACT_ALERT_TO;
  if (alertTo && emailConfigured()) {
    const label = CONTACT_TOPICS[topic as keyof typeof CONTACT_TOPICS];
    const oneLine = (v: string) => v.replace(/\s+/g, " ").slice(0, 80);
    const alert = sendEmail({
      to: alertTo,
      subject: `[Speech corpus] ${label}: ${oneLine(name)}`,
      replyTo: { address: email, displayName: oneLine(name) },
      text: [
        `New message #${row.id} from the contact page.`,
        "",
        `From:   ${name} <${email}>${user ? " (signed in)" : ""}`,
        `Topic:  ${label}`,
        "",
        message,
        "",
        "Reply to this email to answer them directly.",
        "Mark it handled at https://collect.tiniglabs.digital/admin",
      ].join("\n"),
    }).catch((e) => console.error("contact alert failed", e));
    getCloudflareContext().ctx.waitUntil(alert);
  }
  return { sent: true };
}

export async function markContactHandled(f: FormData) {
  await requireUser({ roles: ["admin"] });
  const id = Number(f.get("id"));
  if (Number.isInteger(id)) {
    await db().update(schema.contactMessages).set({ handledAt: new Date() }).where(eq(schema.contactMessages.id, id));
  }
  revalidatePath("/admin");
}

export type ProfileState = { error?: string; saved?: boolean } | undefined;

/** Account page: optional speaker details and, for reviewers, profession. */
export async function updateProfile(_: ProfileState, f: FormData): Promise<ProfileState> {
  const user = await requireUser();
  await db()
    .update(schema.profiles)
    .set({
      ageRange: str(f, "ageRange"),
      gender: str(f, "gender"),
      region: str(f, "region"),
      firstLanguage: str(f, "firstLanguage"),
      ...(user.role !== "speaker" ? { profession: str(f, "profession", 120) } : {}),
    })
    .where(eq(schema.profiles.userId, user.id));
  revalidatePath("/account");
  return { saved: true };
}
