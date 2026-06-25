# csl-guides

[![Deploy to GitHub Pages](https://github.com/sanskrit-lexicon/csl-guides/actions/workflows/deploy.yml/badge.svg)](https://github.com/sanskrit-lexicon/csl-guides/actions/workflows/deploy.yml)

Documentation site for the **Cologne Digital Sanskrit Dictionaries** (CDSL),
[sanskrit-lexicon.uni-koeln.de](https://sanskrit-lexicon.uni-koeln.de).

🌐 **Live site:** [sanskrit-lexicon.github.io/csl-guides](https://sanskrit-lexicon.github.io/csl-guides/)

Built with [Docusaurus](https://docusaurus.io/). Modeled on the level of detail
of the [dharmamitra-guides](https://dharmamitra.github.io/dharmamitra-guides),
adapted to the CDSL ecosystem with a hybrid navigation covering five audiences:

- **Using the Site** — end users (search, display modes, transliteration, downloads, scans),
  plus a six-quiz learning track (transliteration · devanāgarī · sandhi · samāsa · reading MW ·
  which-dictionary)
- **Dictionaries** — the 43-dictionary catalog, a featured **deep page for every catalogued
  dictionary** (verified source-record samples), abbreviations, and citation conventions
- **Tools** — Simple-Search, Advanced Search, a live multi-dictionary **comparison widget**,
  offline StarDict
- **Contributing** — the change-file correction workflow and GitHub issue taxonomy
- **Developers** — repository map, generation pipeline, data formats, API

## Local development

```sh
npm install
npm start              # dev server with hot reload at http://localhost:3000/csl-guides/
npm run build:catalog  # regenerate src/data/dictionaries.json from live CDSL sources
```

## Build & deploy

```sh
npm run build      # static output in build/
npm run serve      # preview the production build locally
```

Every push to `main` auto-builds and deploys to GitHub Pages at
[sanskrit-lexicon.github.io/csl-guides](https://sanskrit-lexicon.github.io/csl-guides/) via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml) — no manual `npm run deploy` step.
See [docusaurus.config.js](docusaurus.config.js) for `url` / `baseUrl` / `organizationName` /
`projectName`.

## Status

Content is drafted and verified against the live site, the sibling CDSL repositories, and
the org `CLAUDE.md`. The dictionary catalog is auto-generated from the live front page
(`npm run build:catalog`), so it cannot drift by hand. Every catalogued dictionary now has a
featured deep page, each quoting a real, verified source record. Only the still-gated
**KOW** and **KNA** (Russian) lack one — they will be added once they appear on the live
CDSL front page.

One item still awaits maintainer input and is flagged inline with a `:::note` admonition:

- how generated artifacts **reach the live server** (deploy mechanism/cadence) — [docs/developers/generation-pipeline.md](docs/developers/generation-pipeline.md).

## License

The entire repository — guide content (`docs/`, `blog/`), images (`static/`), and the site
code (`src/`, `scripts/`, configuration) — is licensed under
[CC BY-SA 4.0](LICENSE), matching the Cologne Digital Sanskrit Dictionaries data license.
Screenshots of the live site and any quoted dictionary text remain subject to the CDSL data
terms (also CC BY-SA 4.0); reuse must preserve attribution and share-alike.
