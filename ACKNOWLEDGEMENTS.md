# Acknowledgements

The tinig labs speech corpus is built on the work of others. Thank you.

## Prompts

| Source | What we use | License |
|---|---|---|
| [Tatoeba](https://tatoeba.org) | Tagalog sentences | CC BY 2.0 FR, some CC0. Each author is credited on the [Sources](https://collect.tiniglabs.digital/sources) page. |
| [Common Voice](https://github.com/common-voice/common-voice) | Tagalog sentences | CC0 |
| [Wiktionary](https://www.wiktionary.org), through [kaikki.org](https://kaikki.org) | Tagalog headwords | CC BY-SA |

## Model

[PhoneticXeus](https://huggingface.co/changelinglab/PhoneticXeus) by changelinglab suggests the IPA that reviewers check. It is licensed CC BY-NC-SA 4.0, and is downloaded when the model service is deployed rather than included here.

## Software

| Project | Used for | License |
|---|---|---|
| [Next.js](https://github.com/vercel/next.js) | Web framework | MIT |
| [React](https://github.com/facebook/react) | User interface | MIT |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | Styling | MIT |
| [OpenNext for Cloudflare](https://github.com/opennextjs/opennextjs-cloudflare) | Running Next.js on Cloudflare Workers | MIT |
| [Wrangler](https://github.com/cloudflare/workers-sdk) | Building and deploying the Worker | MIT or Apache 2.0 |
| [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm) | Database schema, queries and migrations | Apache 2.0 |
| [Neon serverless driver](https://github.com/neondatabase/serverless) | Postgres over HTTP from the Worker | MIT |
| [Neon Auth](https://github.com/neondatabase/neon-js) | Accounts and sessions | Apache 2.0 |
| [aws4fetch](https://github.com/mhart/aws4fetch) | Signing R2 upload URLs | MIT |
| [Modal](https://github.com/modal-labs/modal-client) | Running the model | Apache 2.0 |
| [TypeScript](https://github.com/microsoft/TypeScript) | Type checking | Apache 2.0 |
| [ESLint](https://github.com/eslint/eslint) | Linting | MIT |

Each package's full license is in its folder under `node_modules` after `npm install`. Transitive dependencies are listed in `package-lock.json`.

## Typefaces

- [Figtree](https://github.com/erikdkennedy/figtree) by Erik Kennedy, under the SIL Open Font License 1.1. Used for all text.
- [Montserrat](https://github.com/JulietaUla/Montserrat) by Julieta Ulanovsky and contributors, under the SIL Open Font License 1.1. Used for the tinig labs name.
- [Noto Sans](https://github.com/notofonts/latin-greek-cyrillic) by Google, under the SIL Open Font License 1.1. Used for IPA.

All three are served from this site through `next/font`, not loaded from Google.

## License

The web app's license is the [Functional Source License](https://fsl.software), created by Sentry as part of the [Fair Source](https://fair.io) initiative. The model code is under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.en.html).

## Hosting and services

The site runs on Cloudflare Workers, with audio in Cloudflare R2 and bot checks from Cloudflare Turnstile. The database and accounts are on Neon. Email is sent with Azure Communication Services, and the model runs on Modal.
