# tinig labs · Tagalog speech corpus

An open Tagalog speech corpus, collected at **[collect.tiniglabs.digital](https://collect.tiniglabs.digital)**.

Speakers read open-source Tagalog sentences and words aloud. Invited speech-language pathologists and linguists then check the IPA transcription that a phoneme model ([PhoneticXeus](https://huggingface.co/changelinglab/PhoneticXeus), on Modal) suggests for each clip, and fix it with an on-screen IPA keyboard. A clip is verified once two reviewers agree. Recordings and transcriptions are released under CC0.

The site is in closed beta. To take part, write to hello@tiniglabs.digital.

## Stack

- Next.js 16 (App Router) on Cloudflare Workers, through [OpenNext](https://opennext.js.org/cloudflare)
- Neon Postgres with Drizzle, and Neon Auth (Managed Better Auth) for accounts
- Cloudflare R2 for audio, served from `audio.tiniglabs.digital`
- Azure Communication Services for email, Cloudflare Turnstile for bot checks
- PhoneticXeus on a Modal T4 GPU for the suggested IPA

## Repository layout

| Path | What's there |
| --- | --- |
| `src/app` | Pages and API routes: record, review, guide, account, admin, auth and the webhook that sends code emails |
| `src/components` | UI, the recorder, the audio player and the IPA keyboard |
| `src/lib` | Auth, database, R2, email, rate limits, Turnstile and the Modal client |
| `src/db`, `drizzle/` | Schema and SQL migrations |
| `scripts/` | Corpus import and secret helpers |
| `modal/` | The phoneme model service (AGPL-3.0) |

## Local development

1. Copy `.env.example` to `.env` (for scripts and `next dev`) and `.dev.vars.example` to `.dev.vars` (for the Workers runtime). Fill in the values.
2. `npm install`
3. `npm run db:migrate` to create the tables, then `npm run import-corpus` to load about 100k prompts from Tatoeba, Common Voice and Wiktionary. Use `-- --dry` to preview without writing.
4. `npm run dev` for the Next.js dev server, or `npm run preview` to run the real Workers build locally on port 8787.

Before opening a pull request, run `npm run lint`, `npm run typecheck` and `npm run build`.

## Deployment

Every push to `main` deploys to production through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): lint, typecheck, OpenNext build, then `opennextjs-cloudflare deploy`. Pull requests run the same checks without deploying ([`ci.yml`](.github/workflows/ci.yml)).

The workflow needs these repository secrets:

| Secret | Why |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Deploys the Worker. Use the "Edit Cloudflare Workers" template. |
| `DATABASE_URL` | The home page prerenders live stats at build time. Without it the build still passes, but the stats show "—" until the hourly refresh. |

Runtime secrets (database, auth, R2, Modal, ACS, Turnstile) live in the Worker and survive deploys. Set them with `wrangler secret put <NAME>`; `wrangler.jsonc` lists them.

Database migrations are not run by the workflow. After merging a migration, run `npm run db:migrate` yourself, ideally before the deploy that needs it.

### First-time infrastructure

1. Create the R2 buckets `tagalog-speech-audio` and `tagalog-speech-corpus-cache`. Attach `audio.tiniglabs.digital` to the audio bucket and add a CORS rule that allows `PUT` from `https://collect.tiniglabs.digital`.
2. `ADMIN_EMAILS` (comma-separated) makes those accounts admins on first sign-in. Admins create invite codes at `/admin`.
3. In Neon Auth, point the `send.otp` webhook at `https://collect.tiniglabs.digital/api/neon-auth-webhook` so code emails use the tinig labs template.

## Cost notes

- Audio goes straight from the browser to R2 through presigned PUTs, falling back to the Worker. It's served from the CDN as `immutable`, and R2 egress is free.
- The browser encodes 16 kHz mono WAV, so there's no server transcoding. A 5 s clip is about 160 KB.
- Public pages are static or ISR, cached in R2 with the regional Cache API in front. Stats refresh hourly.
- Prompts are fetched 20 at a time and review items 10 at a time. Each write is one SQL statement.
- The model runs in batches every 30 minutes (Worker cron, then `/api/cron/pregenerate`), not once per upload.

## Modal (PhoneticXeus)

`modal/phonemes.py` serves PhoneticXeus on a T4 GPU. The weights are baked into the image, and the container shuts down after 60 s idle.

1. `pip install -r modal/requirements.txt`, then `modal setup`.
2. `modal secret create tinig-phonemes PHONEMES_TOKEN=<long random string>`
3. `modal deploy modal/phonemes.py`
4. Set `MODAL_ENDPOINT_URL` (the deployed `/transcribe` URL) and `MODAL_TOKEN` (the same token) as Worker secrets.

To try it on one file: `modal run modal/phonemes.py --wav clip.wav`.

Every 30 minutes the cron sends up to 32 clips per call. A clip that fails is retried on later runs and rejected after 3 failures.

## License

- The web app is under the [Functional Source License, FSL-1.1-Apache-2.0](LICENSE.md). Each release becomes Apache-2.0 after two years.
- `modal/` and tinig labs' model, training and data code are under [AGPL-3.0](modal/LICENSE).
- Recordings and transcriptions are CC0. Prompts keep their source licenses.
- The PhoneticXeus weights are CC BY-NC-SA 4.0 by their authors.

[LICENSING.md](LICENSING.md) has the details. To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contact

hello@tiniglabs.digital
