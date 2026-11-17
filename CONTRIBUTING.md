# Contributing

Thanks for helping build an open Tagalog speech corpus. This repository is the corpus site at [collect.tiniglabs.digital](https://collect.tiniglabs.digital). The lab's website and its other models, datasets and tools live in their own repositories under [github.com/tinig-labs](https://github.com/tinig-labs).

tinig labs is run by one developer, so replies can take a few days.

## Ways to help

- **Record or review clips.** The corpus is in closed beta, so ask for an invite on the [contact page](https://collect.tiniglabs.digital/contact). Speech-language pathologists and linguists are especially welcome as reviewers.
- **Improve the code**, as described below.

## What's welcome

- Bug fixes, broken links and typos
- Accessibility fixes: keyboard use, screen readers, contrast and reduced motion
- Corrections to Tagalog text, and to the IPA conventions in the guide
- Better recording on more browsers and devices
- Performance, cost and security improvements

For a new page, a new feature or a change to the visual design, open an issue first so we can agree on it before you spend time on it.

A change to the guide's IPA conventions should cite a source or come with a review from a speech-language pathologist or linguist. Reviewers rely on these rules to agree character for character, so a change also affects clips already reviewed.

## Reporting a bug

Open an issue with:

- the page URL
- what you expected and what happened
- your browser and device, and for recording problems, your microphone
- a screenshot, if it's visual

## Reporting a security problem

Don't open a public issue. Report it privately through the repository's **Security** tab (**Report a vulnerability**), or email hello@tiniglabs.digital. Include the steps to reproduce it and what an attacker could do.

For personal data, or to have your recordings removed, write to hello@tiniglabs.digital. The [Privacy Policy](https://collect.tiniglabs.digital/privacy) explains what can be removed.

## Making a change

1. Fork the repository and create a branch from `main`.
2. Set up the project with the steps in [DEVELOPMENT.md](DEVELOPMENT.md). Use your own Neon database, never production.
3. Make your change. Keep each pull request to one change.
4. Run the checks:

   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

5. Open a pull request that says what changed and why. For visual changes, add screenshots at phone and desktop widths.

Merges to `main` deploy to production straight away, so `main` must always be releasable.

### Checklist

- [ ] Lint, typecheck and build pass
- [ ] Interactive elements work with a keyboard and show a focus state
- [ ] Layout works at 375px wide without horizontal scrolling
- [ ] Copy follows the style below
- [ ] A schema change comes with its SQL migration in `drizzle/` (`npm run db:generate`)
- [ ] New secrets are added to `.env.example`, `.dev.vars.example` and `wrangler.jsonc` with placeholder values, never real ones
- [ ] If the change affects what the site collects or publishes, `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` are updated too

## Writing style

- Sentence case for headings and buttons
- "tinig labs" is always lowercase and rendered with the `Brand` component
- Short, plain sentences. Buttons say what they do, and errors say how to fix the problem.
- Don't promise release dates or features that aren't built

## Licensing of contributions

By contributing, you agree that your contribution is licensed under the same terms as the part of the project it changes:

- the web app (everything outside `modal/`): [FSL-1.1-ALv2](LICENSE.md)
- `modal/` and other model, training or data-processing code: [AGPL-3.0-or-later](modal/LICENSE)
- recordings, transcriptions and other data: CC0

Sign off your commits to certify the [Developer Certificate of Origin](https://developercertificate.org/), which says you wrote the change or have the right to submit it:

```bash
git commit -s -m "Describe the change"
```
