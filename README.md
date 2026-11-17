<h1 align="center">
  <a href="https://collect.tiniglabs.digital">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/banner-dark.svg">
      <img alt="tinig labs" src="public/banner.svg" width="520">
    </picture>
  </a>
</h1>

<p align="center">
  An open Tagalog speech corpus: people read prompts aloud, and speech professionals verify the IPA.
</p>

<p align="center">
  <a href="https://collect.tiniglabs.digital">Corpus</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://tiniglabs.digital">tinig labs</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://github.com/tinig-labs">GitHub</a>
</p>

<p align="center">
  <a href="LICENSE.md"><img alt="License: FSL-1.1-ALv2" src="https://img.shields.io/badge/license-FSL--1.1--ALv2-1F6B4F"></a>
  <a href="modal/LICENSE"><img alt="Model code: AGPL-3.0" src="https://img.shields.io/badge/model%20code-AGPL--3.0-13261F"></a>
  <a href="LICENSING.md"><img alt="Data: CC0" src="https://img.shields.io/badge/data-CC0-1F6B4F"></a>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-13261F?logo=nextdotjs&logoColor=white">
  <img alt="Node.js 22" src="https://img.shields.io/badge/node-22-1F6B4F?logo=nodedotjs&logoColor=white">
  <a href="https://github.com/tinig-labs/collect.tiniglabs.digital/actions/workflows/deploy.yml"><img alt="Deploy" src="https://img.shields.io/github/actions/workflow/status/tinig-labs/collect.tiniglabs.digital/deploy.yml?branch=main&label=deploy&color=13261F"></a>
</p>

---

This is the source for [collect.tiniglabs.digital](https://collect.tiniglabs.digital), where tinig labs is building an open Tagalog speech corpus. *Tinig* is Filipino for voice.

Speakers read short Tagalog sentences and words taken from open sources. A phoneme model ([PhoneticXeus](https://huggingface.co/changelinglab/PhoneticXeus)) suggests an IPA transcription for each clip. Invited speech-language pathologists and linguists then approve or correct it with an on-screen IPA keyboard. A clip is verified once two reviewers agree, character for character. Recordings and transcriptions are released under CC0.

The corpus is in closed beta. To take part, ask for an invite on the [contact page](https://collect.tiniglabs.digital/contact). The lab's website is a separate repository, [tiniglabs.digital](https://github.com/tinig-labs/tiniglabs.digital).

## What's on the site

| Page | What it does |
|---|---|
| `/` | Explains the corpus, with live counts of recordings, speakers, minutes and verified clips |
| `/record` | Shows one prompt at a time to record, play back, re-record or skip, with keyboard shortcuts |
| `/review` | For invited reviewers: the clip, its prompt and the model's IPA, with the IPA keyboard to correct it |
| `/record/history`, `/review/history` | Your own recordings and reviews |
| `/guide` | Recording tips and the IPA conventions reviewers follow |
| `/signup`, `/login`, `/forgot-password`, `/onboarding`, `/account` | Accounts, consent and profile |
| `/admin` | For admins: invite codes, contact messages and the dataset export |
| `/contact`, `/sources`, `/terms`, `/privacy` | Contact form, prompt attribution, Terms of Service and Privacy Policy |

The site runs on Cloudflare Workers with Neon Postgres and Neon Auth. Audio goes straight from the browser to Cloudflare R2. The model runs on Modal in batches every 30 minutes.

## Quick start

```bash
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:3000
```

You need Node.js 22 and your own Neon database. For the full setup, including R2, the model and the Workers runtime, see [DEVELOPMENT.md](DEVELOPMENT.md).

Every push to `main` deploys to production.

## Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md): project layout, local setup, how recording and review work, deploying, and the model service
- [CONTRIBUTING.md](CONTRIBUTING.md): how to report bugs and security problems, and how to propose changes
- [LICENSING.md](LICENSING.md): which license covers the code, the model code and the data
- [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md): the software, data sources, model and services the corpus is built on

## License

The web app is under the [Functional Source License 1.1, Apache 2.0 Future License](LICENSE.md) (FSL-1.1-ALv2). You can use, copy and change it for anything except a competing commercial product. Each version becomes available under Apache 2.0 two years after it's published.

The model service in `modal/` and the lab's training and data-processing code are under the [GNU Affero General Public License v3.0](modal/LICENSE). Recordings and transcriptions are CC0, and the prompts keep their source licenses. The PhoneticXeus weights are its authors' work under CC BY-NC-SA 4.0. They aren't part of this repository and aren't covered by its licenses. [LICENSING.md](LICENSING.md) has the details.

The tinig labs name and logo aren't covered by these licenses.
