import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type Limiter = "UPLOAD_LIMITER" | "INVITE_LIMITER";

/**
 * Workers rate limiting (per location, in memory). `failOpen` decides what happens if the
 * binding is missing or errors: uploads stay available, invite redemption does not.
 */
export async function withinLimit(binding: Limiter, key: string, { failOpen = true } = {}) {
  const limiter = (getCloudflareContext().env as Partial<Record<Limiter, RateLimit>>)[binding];
  if (!limiter) return failOpen;
  return limiter.limit({ key }).then((r) => r.success, () => failOpen);
}

/** Removes an audio object (rejected or withdrawn clip) without blocking the response. */
export function deleteAudioLater(key: string | null | undefined) {
  if (!key) return;
  const { env, ctx } = getCloudflareContext();
  const bucket = (env as unknown as { AUDIO: R2Bucket }).AUDIO;
  ctx.waitUntil(bucket.delete(key).catch((e) => console.error("audio delete failed", key, e)));
}
