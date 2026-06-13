# csl-guides

Documentation site for the **Cologne Digital Sanskrit Dictionaries** (CDSL),
[sanskrit-lexicon.uni-koeln.de](https://sanskrit-lexicon.uni-koeln.de).

Built with [Docusaurus](https://docusaurus.io/). Modeled on the level of detail
of the [dharmamitra-guides](https://dharmamitra.github.io/dharmamitra-guides),
adapted to the CDSL ecosystem with a hybrid navigation covering three audiences:

- **Using the Site** — end users (search, display modes, transliteration, downloads, scans)
- **Dictionaries** — the 42-dictionary catalog, abbreviations, citation conventions
- **Tools** — Simple-Search, Advanced Search, multi-dictionary display, offline StarDict
- **Contributing** — the change-file correction workflow and GitHub issue taxonomy
- **Developers** — repository map, generation pipeline, data formats, API

## Local development

```sh
npm install
npm start          # dev server with hot reload at http://localhost:3000/csl-guides/
```

## Build & deploy

```sh
npm run build      # static output in build/
npm run serve      # preview the production build locally
```

Deploys to GitHub Pages (`gh-pages` branch). See [docusaurus.config.js](docusaurus.config.js)
for `url` / `baseUrl` / `organizationName` / `projectName`.

## Status

Scaffold + first draft generated from the live site, the sibling CDSL repositories,
and the org `CLAUDE.md`. Pages marked with `:::caution Draft` need maintainer review —
search the repo for `TODO(verify)` to find every claim that needs confirmation.
