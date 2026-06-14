# Contributing to csl-guides

`csl-guides` is the **documentation site** for the Cologne Digital Sanskrit Dictionaries
(CDSL), built with [Docusaurus](https://docusaurus.io/) and published to GitHub Pages at
<https://sanskrit-lexicon.github.io/csl-guides/>.

> **Looking to fix a dictionary entry, a headword, or a scan?** That is *not* done here.
> Dictionary text is corrected in the per-dictionary repositories via the change-file
> workflow — see [Contributing](docs/contributing/overview.md) in the guides themselves.
> This repo is only the **guides about** CDSL.

## What belongs here

- Corrections and improvements to the guide pages (`docs/`, `blog/`).
- Site code: the Docusaurus config, React components (`src/`), and build scripts
  (`scripts/`).
- Screenshots and other static assets (`static/`).

## Local development

```sh
npm install
npm start          # dev server with hot reload at http://localhost:3000/csl-guides/
npm run build      # production build into build/ (also runs the broken-link check)
npm run serve      # preview the production build locally
```

Node ≥ 18 is required (CI uses Node 20).

> **If `npm start` shows a `@theme/SearchPage` (or similar) "module not found" error**, the
> `.docusaurus` cache is stale: run `npm run clear`, then `npm start` again.

## Editing content

- Pages are Markdown/MDX under `docs/`. A page that needs to embed a React component (a
  screenshot, the catalog, the site version) must use the **`.mdx`** extension.
- **Clickable links everywhere.** Render every path and URL as a link. Inside repo files
  (this file, `README.md`, the docs) relative links resolve; in GitHub *issue/PR/comment
  bodies* use full `blob`/`tree` URLs.
- **Don't hard-code the site version.** It is single-sourced from
  `src/data/dictionaries.json` (`siteVersion`) via the `SiteVersion` component
  (`src/components/SiteVersion.js`). Use `<SiteVersion />` in an `.mdx` page.
- **Screenshots** are shared via the `Screenshot` component
  (`src/components/Screenshot.js`), which carries intrinsic `width`/`height` to avoid
  layout shift. Pass the image's real pixel dimensions.

## Regenerating data and screenshots

```sh
npm run build:catalog                 # refresh src/data/dictionaries.json from the live site
node scripts/screenshots.mjs          # recapture all display screenshots (needs playwright)
node scripts/screenshots.mjs frontpage  # recapture just one (name filter)
```

The catalog is auto-generated; **do not hand-edit `src/data/dictionaries.json`**. The live
CDSL server rejects non-browser user agents, so the capture scripts identify as a desktop
browser — keep that when editing them.

## Submitting changes

1. Branch from `main` (do not commit directly to `main`).
2. Make your change; run `npm run build` locally — it must pass (the build fails on broken
   internal links).
3. Open a pull request against `main`. CI builds the site on every PR; merging to `main`
   triggers the GitHub Pages deploy.

## Conventions

- UTF-8, **no BOM**, in every file.
- Keep prose wrapped at a sensible width and match the surrounding style.
- Session state for longer work is journalled in `.ai_state.md`.

## License of contributions

The entire repository is licensed under [CC BY-SA 4.0](LICENSE). By contributing, you agree
that your contributions are licensed under the same terms.
