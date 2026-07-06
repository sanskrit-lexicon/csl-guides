# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Org-wide conventions (the Cologne dictionary repos, correction workflow, issue taxonomy)
> live in the parent `../CLAUDE.md`. **This** repo is different from its siblings: it is a
> Docusaurus **documentation site** *about* the CDSL ecosystem, not a dictionary-source or
> corrections repo. There is no `updateByLine.py` / `csl-orig` workflow here.

## What this is

A [Docusaurus](https://docusaurus.io/) 3.6 site (React 19, Node ≥18; CI uses Node 20)
documenting the Cologne Digital Sanskrit Dictionaries for five audiences. Output deploys to
GitHub Pages at `https://sanskrit-lexicon.github.io/csl-guides/`.

## Commands

```sh
npm install
npm start            # dev server + hot reload at /csl-guides/
npm run build        # production build into build/ (runs onBrokenLinks:'throw')
npm run serve        # preview the production build
npm run build:catalog # regenerate src/data/dictionaries.json from live sources
node scripts/screenshots.mjs   # recapture display screenshots (needs: npx playwright install chromium)
```

There is no test suite. **`npm run build` is the verification gate** — it fails on any broken
internal link (`onBrokenLinks: 'throw'`), so a green build is the proof a content change is
sound. To verify the way CI does: `npm ci && npm run build`.

## Architecture

- **Content** is [docs/](docs/) (`.md`/`.mdx`) plus the [blog/](blog/) which is mounted at
  `/news` (a post with `slug: X` lands at `/news/X`, *not* a date path). Docs are served at
  the **site root** (`routeBasePath: '/'`), so a doc link is `/users/quick-start`, not
  `/docs/...`.
- **Sidebars are manual** — [sidebars.js](sidebars.js) defines five audience sidebars
  (`usersSidebar`, `dictionariesSidebar`, `toolsSidebar`, `contributingSidebar`,
  `developersSidebar`) wired to navbar items in [docusaurus.config.js](docusaurus.config.js).
  A new doc page is invisible until added to a sidebar.
- **Custom React components** live in [src/components/](src/components/) and are imported into
  `.mdx` pages: `DictionaryCatalog`, `DictionaryComparison` (live side-by-side CDSL lookup),
  `Quiz` (renders the MW quiz dataset), `Screenshot`, `SiteVersion`, `HomepageFeatures`.
- **The `:::table` directive** ([src/remark/rst-table-directive.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/remark/rst-table-directive.mjs),
  registered as a `remarkPlugins` entry on `docs`/`blog` in
  [docusaurus.config.js](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docusaurus.config.js)) renders an RST grid/simple table — merged cells
  that GFM pipe tables can't express — into a real `<table>`:

  ````
  :::table
  ```rst-table
  +-------+-------+
  | A     | B     |
  +=======+=======+
  | 1     | 2     |
  +-------+-------+
  ```
  :::
  ````

  It shells out to **Pandoc** (`pandoc --from rst --to html5`) at build time, so **Pandoc must be
  on PATH** wherever `npm run build`/`npm start` runs (already true for GitHub-hosted CI runners).
  This is the escape hatch for merged cells, not a replacement for ordinary pipe tables — the
  ~30 existing hand-authored tables in `docs/` are plain pipe tables and were deliberately left
  as-is (none of them have merged cells). The `/docx-to-md` skill emits `:::table` blocks
  automatically when its target is under `csl-guides`.
- **The MW quiz dataset** ([src/data/mw-quiz.json](src/data/mw-quiz.json)) is rendered by
  `Quiz` on [docs/users/reading-monier-williams.mdx](docs/users/reading-monier-williams.mdx)
  and is **generated/verified, not hand-authored**: each lookup's `cdsl.entryId` + page is
  taken from the digital MW source (`csl-orig/v02/mw/mw.txt` `<L>`/`<pc>` records), so don't
  hand-edit the ids — re-derive them from the source.
- **Swizzled theme components** live in [src/theme/](src/theme/) (these override Docusaurus
  theme internals, not page-level imports). Currently
  [DocItem/Content](src/theme/DocItem/Content/index.js) is a `--wrap` swizzle that renders the
  page's git last-updated date top-right (see below).

## Per-page "last updated" date

Each doc page shows its git last-commit date in the top-right corner. Three pieces, all
required together:
- `showLastUpdateTime: true` in [docusaurus.config.js](docusaurus.config.js) — this is what
  populates `metadata.lastUpdatedAt` (a **millisecond** timestamp; `new Date(ms)`, no `*1000`).
- [src/theme/DocItem/Content/index.js](src/theme/DocItem/Content/index.js) reads it via
  `useDoc()` and renders `.docPageLastUpdated` above the H1, formatted with a **fixed
  `en-US`/UTC locale** (don't make it locale/timezone-dependent — that causes a hydration
  mismatch). The default footer copy is hidden via `.theme-last-updated` in
  [src/css/custom.css](src/css/custom.css).
- **`fetch-depth: 0` in [.github/workflows/deploy.yml](.github/workflows/deploy.yml)** — the
  build needs full git history. A shallow clone (the Actions default) stamps *every* page with
  the same date. Verify a change by confirming pages show *different* dates, not just that one
  renders.

## The dictionary catalog (don't hand-edit the data)

The 43-dictionary catalog table is **generated, not authored**.
[scripts/build-catalog.mjs](scripts/build-catalog.mjs) fetches the live CDSL front page +
the GitHub org repo list + `csl-doc` + `csl-orig/v02` and writes
[src/data/dictionaries.json](src/data/dictionaries.json), which
[DictionaryCatalog.js](src/components/DictionaryCatalog.js) renders. To change catalog data,
re-run `npm run build:catalog` — never edit the JSON by hand.

Non-obvious facts baked into the script:
- A dictionary's **display code ≠ its GitHub repo**. `REPO_OVERRIDES = {MW:'MWS', AE:'ApteES',
  PW:'PWK'}`; `NO_REPO` lists codes with no own repo. (E.g. code `PW` → repo `PWK`.)
- The live front-page server 403s non-browser user agents, so both this script and
  `screenshots.mjs` send a desktop browser UA.
- `GUIDE_PAGES` in `DictionaryCatalog.js` (codes that have a "featured dictionary" deep page)
  must be **kept in sync** with the `Featured dictionaries` list in `sidebars.js`.

## CI / deploy

- [deploy.yml](.github/workflows/deploy.yml): on push to `main`, refreshes the catalog
  (non-fatal), builds, and deploys to GitHub Pages (`gh-pages`).
- [ci.yml](.github/workflows/ci.yml): builds on every PR (no deploy) — this is the broken-link
  gate.
- [link-check.yml](.github/workflows/link-check.yml): **external** links only (lychee), weekly
  + `workflow_dispatch`. Internal links are already covered by the build. It needs
  `--root-dir "${{ github.workspace }}"` so Docusaurus root-relative routes (`/news`, `/img/...`)
  don't fail extraction before filters run; verify a change by dispatching it, not assuming.

## Editorial conventions

- **Canonical tone**: every factual claim about a dictionary or the pipeline must be verified
  against a real source file (a record in `csl-orig`, a `csl-doc` page), not asserted. Deep
  pages quote a real, verified sample record.
- Unresolved facts are flagged inline with a `:::note` admonition rather than guessed.
- Session state for this repo is tracked in [.ai_state.md](.ai_state.md) — read it for current
  WIP and hard-won gotchas (e.g. MWE markup, PW/PWK, screenshot availability) before starting.
