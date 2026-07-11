# csl-guides

_Created: 13-06-2026 · Last updated: 11-07-2026_

[![Deploy to GitHub Pages](https://github.com/sanskrit-lexicon/csl-guides/actions/workflows/deploy.yml/badge.svg)](https://github.com/sanskrit-lexicon/csl-guides/actions/workflows/deploy.yml)

Documentation site for the **Cologne Digital Sanskrit Dictionaries** (CDSL),
[sanskrit-lexicon.uni-koeln.de](https://sanskrit-lexicon.uni-koeln.de).

🌐 **Live site:** [sanskrit-lexicon.github.io/csl-guides](https://sanskrit-lexicon.github.io/csl-guides/)

Built with [Docusaurus](https://docusaurus.io/). Modeled on the level of detail
of the [dharmamitra-guides](https://dharmamitra.github.io/dharmamitra-guides),
adapted to the CDSL ecosystem with a hybrid navigation covering six audiences
(the [`sidebars.js`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/sidebars.js) navbar):

- **Using the Site** — end users (search, display modes, transliteration, downloads, scans),
  plus a six-quiz learning track (transliteration · devanāgarī · sandhi · samāsa · reading MW ·
  which-dictionary)
- **Dictionaries** — the 43-dictionary catalog (44 rows incl. the sample-only PD), a featured
  **deep page for every catalogued dictionary** (verified source-record samples), plus
  data-layer pages (corpus attestation, machine morphology, the dictionary landscape, citation
  sources), abbreviations, and citation conventions
- **Tools** — four beginner lead-magnets (**Your Name in Devanagari** transliterator, the
  **What's Your Sanskrit Level?** quiz, the **Sanskrit Word Game**, and the first-sentence
  article), plus Simple-Search, Advanced Search, a live multi-dictionary **comparison widget**,
  and offline StarDict
- **Contributing** — the change-file correction workflow and GitHub issue taxonomy
- **Developers** — repository map, generation pipeline, data formats, data cards, API
- **About** — project origins/history, publications and the ACL venue landscape, the Guides
  hypotheses, shared tasks & leaderboard, the DH programme, and the FAQ

## Use cases

What the guide actually helps you do (each links to the live page):

- **Look a word up across many dictionaries at once** — the live
  [multi-dictionary comparison widget](https://sanskrit-lexicon.github.io/csl-guides/tools/multi-dictionary)
  and [Simple-Search](https://sanskrit-lexicon.github.io/csl-guides/tools/simple-search).
- **Decide which dictionary to use** for a given need (Vedic, classical, etymological, bilingual)
  — the [which-dictionary guide & quiz](https://sanskrit-lexicon.github.io/csl-guides/users/which-dictionary-quiz)
  and the [43-dictionary catalog](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/catalog).
- **Read a dense entry confidently** — learn Monier-Williams' structure, symbols, and dhātu-tracing
  on [Reading Monier-Williams](https://sanskrit-lexicon.github.io/csl-guides/users/reading-monier-williams).
- **Type or convert Sanskrit** between IAST, SLP1, Harvard-Kyoto, and Devanāgarī — the
  [encoding & transliteration guide](https://sanskrit-lexicon.github.io/csl-guides/users/encoding-transliteration)
  and the live [Your Name in Devanagari](https://sanskrit-lexicon.github.io/csl-guides/tools/name-in-devanagari) tool.
- **Learn the script and grammar interactively** — the six-quiz track
  ([transliteration](https://sanskrit-lexicon.github.io/csl-guides/users/transliteration-quiz),
  [devanāgarī](https://sanskrit-lexicon.github.io/csl-guides/users/devanagari-quiz),
  [sandhi](https://sanskrit-lexicon.github.io/csl-guides/users/sandhi-quiz),
  [samāsa](https://sanskrit-lexicon.github.io/csl-guides/users/samasa-quiz), and more), plus the
  [Sanskrit Level quiz](https://sanskrit-lexicon.github.io/csl-guides/tools/sanskrit-level-quiz)
  and the [Sanskrit Word Game](https://sanskrit-lexicon.github.io/csl-guides/tools/word-game).
- **See the data behind the dictionaries** — corpus-frequency attestation, machine-morphology
  coverage, and the csl-atlas dictionary landscape on the
  [Dictionaries](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/overview) pages.
- **Cite an entry correctly** — [abbreviations & citation conventions](https://sanskrit-lexicon.github.io/csl-guides/dictionaries/abbreviations-and-citations).
- **Work offline** — [download a dictionary or the StarDict bundle](https://sanskrit-lexicon.github.io/csl-guides/users/downloads-and-data).
- **Fix or improve the data** — [report a typo](https://sanskrit-lexicon.github.io/csl-guides/contributing/report-a-typo)
  or follow the [change-file correction workflow](https://sanskrit-lexicon.github.io/csl-guides/contributing/corrections-workflow).
- **Build on top of CDSL** — the [API](https://sanskrit-lexicon.github.io/csl-guides/developers/api),
  [data formats](https://sanskrit-lexicon.github.io/csl-guides/developers/data-formats),
  [data cards](https://sanskrit-lexicon.github.io/csl-guides/developers/data-cards), and
  [repository map](https://sanskrit-lexicon.github.io/csl-guides/developers/repositories) for developers.

## News & newsletter

The [blog](https://github.com/sanskrit-lexicon/csl-guides/tree/main/blog) is mounted at
[`/news`](https://sanskrit-lexicon.github.io/csl-guides/news) and hosts the CDSL newsletter —
annual round-ups back to 2014 plus monthly issues through 2026. New issues are prepared with
the org `/cdsl-newsletter-publisher` skill, which keeps this blog and the
[csl-newsletter](https://github.com/sanskrit-lexicon/csl-newsletter) email archive in sync.

## Local development

```sh
npm install
npm start              # dev server with hot reload at http://localhost:3000/csl-guides/
npm run build:catalog  # regenerate src/data/dictionaries.json from live CDSL sources
```

Other `build:*` scripts under
[`scripts/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/scripts) regenerate the
committed data feeds (abbreviations, corpus frequency, Heritage coverage, atlas viz, the level
quiz, the word game) — none are hand-authored; see
[`package.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/package.json).

## Build & deploy

```sh
npm run build      # static output in build/
npm run serve      # preview the production build locally
```

`npm run build` is the verification gate: it runs `onBrokenLinks: 'throw'`, so a green build
proves every internal link resolves. Every push to `main` auto-builds and deploys to GitHub
Pages at [sanskrit-lexicon.github.io/csl-guides](https://sanskrit-lexicon.github.io/csl-guides/)
via [.github/workflows/deploy.yml](https://github.com/sanskrit-lexicon/csl-guides/blob/main/.github/workflows/deploy.yml)
— no manual `npm run deploy` step. See
[docusaurus.config.js](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docusaurus.config.js)
for `url` / `baseUrl` / `organizationName` / `projectName`.

## Status

Content is drafted and verified against the live site, the sibling CDSL repositories, and
the org [`CLAUDE.md`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/CLAUDE.md). The
dictionary catalog (44 rows, 43 fully digitized) is auto-generated from the live front page
(`npm run build:catalog`), so it cannot drift by hand. Every catalogued dictionary now has a
featured deep page, each quoting a real, verified source record. The still-gated **KOW** and
**KNA** (Russian) lack one — they will be added once they appear on the live CDSL front page.
Unresolved facts are flagged inline with `:::note` admonitions rather than guessed.

## License

The entire repository — guide content
([`docs/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/docs),
[`blog/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/blog)), images
([`static/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/static)), and the site
code ([`src/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/src),
[`scripts/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/scripts),
configuration) — is licensed under
[CC BY-SA 4.0](https://github.com/sanskrit-lexicon/csl-guides/blob/main/LICENSE), matching the
Cologne Digital Sanskrit Dictionaries data license. Screenshots of the live site and any quoted
dictionary text remain subject to the CDSL data terms (also CC BY-SA 4.0); reuse must preserve
attribution and share-alike.

_Dr. Mārcis Gasūns_
