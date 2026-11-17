# Contributing

Thanks for helping build an open Tagalog speech corpus. There are two ways to help.

- **Record or review clips** at [collect.tiniglabs.digital](https://collect.tiniglabs.digital). The site is in closed beta, so ask for an invite at hello@tiniglabs.digital.
- **Improve the code**, as described below.

## Getting started

1. Fork the repository and branch from `main`.
2. Follow **Local development** in the [README](README.md). You need your own Neon database and, for uploads, an R2 bucket. Never use production credentials locally.
3. Keep each pull request to one change, and describe what it does and how you tested it. Add screenshots for UI changes, at phone width as well as desktop.

Before you push, run:

```bash
npm run lint
npm run typecheck
npm run build
```

CI runs the same checks on every pull request. Merges to `main` deploy to production straight away, so `main` must always be releasable.

## Guidelines

- **Design:** use the tokens in `src/app/globals.css` (pandan, mint, gatas, tinta, abo) and the components in `src/components/ui`. Keep UI copy short and plain.
- **Cost:** the site runs on free and cheap tiers. Avoid per-request database work on public pages, and keep audio off the Worker where you can.
- **Database:** change `src/db/schema.ts`, then run `npm run db:generate` and commit the SQL in `drizzle/`. Say in the PR that it includes a migration.
- **Secrets:** never commit `.env`, `.dev.vars` or keys. Add new secrets to `.env.example`, `.dev.vars.example` and the list in `wrangler.jsonc` with placeholder values.
- **The guide's IPA conventions:** a change should cite a source, or come with a review from a speech-language pathologist or linguist. Reviewers rely on these rules to agree character for character.

## Licensing of contributions

By contributing, you agree that your contribution is licensed under the same terms as the part of the project it changes:

- the web app (everything outside `modal/`): [FSL-1.1-Apache-2.0](LICENSE.md)
- `modal/` and other model, training or data code: [AGPL-3.0-or-later](modal/LICENSE)
- recordings, transcriptions and other data: CC0

Sign off your commits to certify the [Developer Certificate of Origin](https://developercertificate.org/), which says you wrote the change or have the right to submit it:

```bash
git commit -s -m "Describe the change"
```

## Reporting problems

- **Bugs and ideas:** open a GitHub issue.
- **Security issues:** email hello@tiniglabs.digital. Please don't open a public issue.
- **Personal data, or removing your recordings:** email hello@tiniglabs.digital. The [Privacy policy](https://collect.tiniglabs.digital/privacy) explains what can be removed.
