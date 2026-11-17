import "server-only";

// Ties an upload id to the account that requested it, so ids can't be reused across accounts.
// Keyed off CRON_SECRET with a purpose label (no extra secret to manage).
const enc = new TextEncoder();

async function key() {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET is not set");
  return crypto.subtle.importKey("raw", enc.encode(`upload-token:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function signUpload(userId: string, id: string) {
  return hex(await crypto.subtle.sign("HMAC", await key(), enc.encode(`${userId}:${id}`)));
}

export async function verifyUpload(userId: string, id: string, token: unknown) {
  if (typeof token !== "string" || !/^[0-9a-f]{64}$/.test(token)) return false;
  const bytes = Uint8Array.from(token.match(/../g)!.map((h) => parseInt(h, 16)));
  return crypto.subtle.verify("HMAC", await key(), bytes, enc.encode(`${userId}:${id}`));
}
