# Development

## Requirements

- Node.js 22
- A [Neon](https://neon.tech) project with Neon Auth enabled (a free one is enough for development)
- For uploads: a Cloudflare account with R2
- For the model: a [Modal](https://modal.com) account and Python 3.11 or later

Never use production credentials locally.

## Run it locally

1. Copy `.env.example` to `.env` (read by `next dev` and the scripts) and `.dev.vars.example` to `.dev.vars` (read by the Workers runtime). Fill in the values.
2. Install and create the tables:

   ```bash
   npm install
   npm run db:migrate
   ```

3. Load about 100,000 prompts from Tatoeba, Common Voice and Wiktionary. Use `-- --dry` to preview without writing.

   ```bash
   npm run import-corpus
   ```

4. Start the site:

   ```bash
   npm run dev       # Next.js dev server, http://localhost:3000
   npm run preview   # the real Workers build, http://localhost:8787
   ```

`ADMIN_EMAILS` (comma-separated) makes those accounts admins the first time they sign in. Admins create invite codes at `/admin`.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

CI runs the same checks on every pull request.

## Stack

- Next.js 16 (App Router) on Cloudflare Workers, through [OpenNext](https://opennext.js.org/cloudflare)
- Neon Postgres with Drizzle ORM, over Neon's HTTP driver
- Neon Auth (Managed Better Auth): email and password with email codes
- Cloudflare R2 for audio, served from `audio.tiniglabs.digital`
- Cloudflare Turnstile and Workers rate limiting against bots
- Azure Communication Services for email
- PhoneticXeus on a Modal T4 GPU for the suggested IPA

## Project layout

| Path | What's there |
|---|---|
| `src/app` | Pages and API routes |
| `src/app/api` | Prompts, uploads, reviews, the admin export, the model cron and the Neon Auth webhook |
| `src/components` | UI components, the recorder, the audio player and the IPA keyboard |
| `src/lib` | Auth, R2, email, rate limits, Turnstile, upload tokens and the Modal client |
| `src/db`, `drizzle/` | The schema and its SQL migrations |
| `public/worklets` | The AudioWorklet that captures microphone audio |
| `scripts/` | The corpus import and a helper that pushes secrets to the Worker |
| `modal/` | The phoneme model service (AGPL-3.0) |

## Design conventions

- Colours and radii come from the tokens in `src/app/globals.css`: pandan, mint, gatas (milk), tinta (ink), abo (grey) and dahon (leaf, only on pandan surfaces). Cards use `rounded-lg` (24 px), fields and panels `rounded-md` (16 px), tags `rounded-sm` (8 px), and buttons and pills `rounded-full`. The site is light only, like tiniglabs.digital.
- Show logos with the components in `src/components/brand.tsx`. [BRAND.md](BRAND.md) has the rules.
- Use the components in `src/components/ui`.
- Text is Figtree, the tinig labs name is Montserrat, and IPA is Noto Sans. All three are served through `next/font`.
- Layouts must work at 375px wide. On phones, navigation and the main actions sit in a bottom bar, within reach of a thumb.

## How recording works

1. `/api/prompts/next` returns 20 prompts at a time. It picks the least-recorded ones first and skips those you've already recorded.
2. The browser records 16 kHz mono WAV with an AudioWorklet, so there's no transcoding on the server. A 5 s clip is about 160 KB.
3. `/api/recordings/upload-url` returns a presigned R2 PUT URL and a signed upload token. If the direct upload fails, the browser retries through the Worker (`/api/audio/[...key]`).
4. `/api/recordings` checks the token and saves the row.

Audio is served from the CDN as `immutable`. Keys are random, and R2 egress is free.

## How review works

1. Every 30 minutes a Worker cron calls `/api/cron/pregenerate`. It sends up to 32 pending clips to Modal in one request and stores the model's IPA. A clip that fails is retried on later runs and rejected after 3 failures.
2. `/api/review/next` gives a reviewer 10 clips they haven't reviewed and didn't record.
3. A clip is verified once two reviewers submit the same IPA. Two "bad audio" flags reject the clip and delete its audio.

## Email

Neon Auth sends its verification and password-reset codes to the `send.otp` webhook at `/api/neon-auth-webhook` instead of using its own template. The route checks Neon's Ed25519 signature and sends the code through Azure Communication Services, with the layout in `src/lib/auth-emails.ts`. Messages from the contact page are saved for `/admin`, and an alert email is sent too.

## Deploy

Every push to `main` deploys to production through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): lint, typecheck, an OpenNext build, then `opennextjs-cloudflare deploy`. Pull requests and other branches run the checks without deploying ([`ci.yml`](.github/workflows/ci.yml)).

### Repository secrets

| Secret | Why |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Deploys the Worker. Use the "Edit Cloudflare Workers" template. |
| `DATABASE_URL` | The home page prerenders live stats at build time. Without it the build still passes, but the stats show "—" until the hourly refresh. |

### Worker secrets

Runtime secrets live in the Worker, survive deploys, and are listed in `wrangler.jsonc`. Set them with `wrangler secret put <NAME>`. `node scripts/push-secrets.mjs` pushes the database, auth, Modal, cron and admin secrets from `.dev.vars` in one go, without printing them. The R2, email and Turnstile keys are set separately.

### Database migrations

The workflow doesn't run migrations, so a bad migration can't ship by itself. After changing `src/db/schema.ts`, run `npm run db:generate` and commit the SQL in `drizzle/`. Then run `npm run db:migrate` against production before the deploy that needs it.

### First-time infrastructure

1. Create the R2 buckets `tagalog-speech-audio` and `tagalog-speech-corpus-cache`. Attach `audio.tiniglabs.digital` to the audio bucket. Add a CORS rule that allows `PUT` from `https://collect.tiniglabs.digital`.
2. Put the `tiniglabs.digital` zone on Cloudflare. The Worker's route is `collect.tiniglabs.digital`.
3. In Neon Auth, add `https://collect.tiniglabs.digital` as a trusted domain. Point the `send.otp` webhook at `https://collect.tiniglabs.digital/api/neon-auth-webhook`.
4. Set the Worker secrets, then push to `main`.

## The model service

`modal/phonemes.py` serves PhoneticXeus on a T4 GPU. The weights are baked into the image, and the container shuts down after 60 s idle.

```bash
pip install -r modal/requirements.txt
modal setup
modal secret create tinig-phonemes PHONEMES_TOKEN=<long random string>
modal deploy modal/phonemes.py
```

Then set `MODAL_ENDPOINT_URL` (the deployed `/transcribe` URL) and `MODAL_TOKEN` (the same token) as Worker secrets. To try it on one file, run `modal run modal/phonemes.py --wav clip.wav`.

## Before launch

- Set `UNDER_DEVELOPMENT` and `CLOSED_BETA` in `src/lib/constants.ts` to `false`.
- Lower `head_sampling_rate` in `wrangler.jsonc` to `0.1`.
- Move DMARC for `tiniglabs.digital` from `p=none` to `p=quarantine`.
- Have a speech-language pathologist or linguist review the conventions in the guide.
