import "server-only";
import { AwsClient } from "aws4fetch";

let _client: AwsClient | undefined;
const client = () =>
  (_client ??= new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  }));

/** Presigned PUT so the browser uploads straight to R2; audio bytes never pass through the Worker. */
export const hasPresign = () => !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ACCOUNT_ID);

export async function presignUpload(key: string, contentType: string, expiresSec = 600) {
  // Without S3 credentials, fall back to uploading through the Worker's R2 binding.
  if (!hasPresign()) return { url: `/api/audio/${key}`, headers: { "content-type": contentType } };
  const url = new URL(
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`,
  );
  url.searchParams.set("X-Amz-Expires", String(expiresSec));
  const signed = await client().sign(
    new Request(url, {
      method: "PUT",
      headers: {
        "content-type": contentType,
        // Files are immutable (UUID keys): let the CDN and browsers keep them for a year.
        "cache-control": "public, max-age=31536000, immutable",
      },
    }),
    { aws: { signQuery: true } },
  );
  return {
    url: signed.url,
    headers: { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" },
  };
}

export const audioUrl = (key: string) =>
  process.env.AUDIO_PUBLIC_BASE_URL ? `${process.env.AUDIO_PUBLIC_BASE_URL}/${key}` : `/api/audio/${key}`;
