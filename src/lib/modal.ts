import "server-only";

/**
 * Client for the PhoneticXeus endpoint in modal/phonemes.py (the only file that knows its shape).
 *
 *   POST MODAL_ENDPOINT_URL            e.g. https://jomzxc--tinig-phonemes-phonemes-web.us-east.modal.run/transcribe
 *   Authorization: Bearer MODAL_TOKEN  (PHONEMES_TOKEN in the Modal secret)
 *   { "items": [{ "id": "<uuid>", "audio_url": "https://..." }] }
 *   -> { "model": "changelinglab/PhoneticXeus@<commit>", "results": [{ "id", "ipa" } | { "id", "error" }] }
 */
export type PhonemeResult = { id: string; ipa?: string; error?: string };

// Covers a cold start (container boot + loading 2.3 GB of weights onto the GPU) plus the batch.
const TIMEOUT_MS = 240_000;

export async function transcribeBatch(items: { id: string; audioUrl: string }[]) {
  const endpoint = process.env.MODAL_ENDPOINT_URL;
  if (!endpoint) throw new Error("MODAL_ENDPOINT_URL is not set");
  if (!process.env.MODAL_TOKEN) throw new Error("MODAL_TOKEN is not set");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.MODAL_TOKEN}` },
    body: JSON.stringify({ items: items.map((i) => ({ id: i.id, audio_url: i.audioUrl })) }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Modal responded ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const body = (await res.json()) as { model?: string; results?: PhonemeResult[] };
  if (!Array.isArray(body.results)) throw new Error("Modal response has no results array");
  return { model: body.model ?? "changelinglab/PhoneticXeus", results: body.results };
}
