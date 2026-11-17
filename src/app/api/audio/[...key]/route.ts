import { getCloudflareContext } from "@opennextjs/cloudflare";
import { apiUser } from "@/lib/session";
import { verifyUpload } from "@/lib/upload-token";

// Fallback audio path used when R2 S3 credentials are not configured (local dev, or before
// presigned uploads are set up). Uploads stream through the Worker's R2 binding.
const KEY = /^recordings\/[0-9a-f]{2}\/[0-9a-f-]{36}\.wav$/;
const bucket = () => (getCloudflareContext().env as unknown as { AUDIO: R2Bucket }).AUDIO;
const keyOf = async (ctx: { params: Promise<{ key: string[] }> }) => (await ctx.params).key.join("/");

export async function PUT(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { user, error } = await apiUser();
  if (error) return error;
  const key = await keyOf(ctx);
  if (!KEY.test(key) || !req.body) return new Response("Bad key", { status: 400 });
  const id = key.slice(-40, -4); // recordings/xx/<uuid>.wav
  if (!(await verifyUpload(user.id, id, req.headers.get("x-upload-token")))) {
    return new Response("Upload not issued to this account", { status: 403 });
  }
  if (Number(req.headers.get("content-length") ?? 0) > 2_000_000) return new Response("Too large", { status: 413 });
  // R2 needs a known length; clips are small (≤15 s ≈ 480 KB), so buffer them.
  const body = await req.arrayBuffer();
  if (body.byteLength > 2_000_000) return new Response("Too large", { status: 413 });
  if (await bucket().head(key)) return new Response("Exists", { status: 409 });
  await bucket().put(key, body, {
    httpMetadata: { contentType: "audio/wav", cacheControl: "public, max-age=31536000, immutable" },
  });
  return new Response(null, { status: 201 });
}

export async function GET(_: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const key = await keyOf(ctx);
  if (!KEY.test(key)) return new Response("Not found", { status: 404 });
  const obj = await bucket().get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: { "content-type": "audio/wav", "cache-control": "public, max-age=31536000, immutable", etag: obj.httpEtag },
  });
}
