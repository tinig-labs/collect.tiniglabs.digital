import { getCloudflareContext } from "@opennextjs/cloudflare";
import { apiUser } from "@/lib/session";
import { presignUpload } from "@/lib/r2";
import { signUpload } from "@/lib/upload-token";

export async function POST() {
  const { user, error } = await apiUser();
  if (error) return error;

  // Workers rate limiting binding: cheap, in-memory per location.
  const limiter = (getCloudflareContext().env as { UPLOAD_LIMITER?: RateLimit }).UPLOAD_LIMITER;
  // Fail open: a limiter outage must not block contributions.
  const allowed = await limiter?.limit({ key: user.id }).then((r) => r.success, () => true);
  if (allowed === false) {
    return Response.json({ error: "Too many uploads, slow down." }, { status: 429 });
  }

  const id = crypto.randomUUID();
  const key = `recordings/${id.slice(0, 2)}/${id}.wav`;
  const { url, headers } = await presignUpload(key, "audio/wav");
  // If the direct-to-R2 PUT is refused (bad token, network), the client retries through the Worker.
  const token = await signUpload(user.id, id);
  return Response.json({ id, key, url, headers, token, fallbackUrl: `/api/audio/${key}` });
}
