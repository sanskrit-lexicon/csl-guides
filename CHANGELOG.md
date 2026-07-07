# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-07-07

### Added
- Opt-in quiz telemetry (GH-5 instrumentation): a visible, off-by-default toggle switches multiple-choice quiz items to an interactive mode recording per-item attempt counters in `localStorage` only, with a "Download my quiz stats" JSON export — no server, data leaves the browser only by explicit download
- **The Dictionary Landscape** page (`/dictionaries/landscape`): interactive era × novelty × size scatter of all 43 dictionaries (bubble = distinct lemmas, y = % of headwords unique to the dictionary, color = language group; csl-atlas OBS-R data) plus a read-only rendering of the csl-atlas UPGMA headword-overlap cladogram (41 dictionaries)
- **What Each Dictionary Quotes** page (`/dictionaries/citation-sources`): per-dictionary top-cited classical texts + corpus-wide overview, from the csl-atlas `<ls>` citation-frequency graph (828,505 resolved citations → 912 canonical texts across 11 dictionaries)
- `scripts/build-atlas-viz.mjs` (`npm run build:atlas-viz`) vendoring the csl-atlas citation graph + cladogram into `src/data/{citation-sources,cladogram}.json`
- Components `DictionaryLandscape`, `CitationSources`, `Cladogram` — theme-aware (light + dark validated palette), hover tooltips, group filters, and a data-table fallback per chart; every figure carries a trust block naming its source artifact and n

## [0.2.0] - 2026-07-03

### Added
- Featured deep page for **NMMB** (*Nāmamālikā* of Bhoja, Deccan College 1955) — live on CDSL since June 2026; wired into the catalog's guide links and the Featured sidebar
- Featured deep page for **PWKVN** (Böhtlingk's own *Nachträge und Verbesserungen* appendixes to PW, ~25k records; experimental display only)
- July 2026 newsletter: NMMB live, PWKVN digitized, `master`→`main` rename, SKD Sāyaṇa fix

### Changed
- All `sanskrit-lexicon` GitHub links updated `master`→`main` after the org-wide default-branch rename (only `Cologne-Sanskrit-Tamil` keeps `master`); catalog and abbreviations datasets regenerated
- Dictionary count boilerplate bumped 42 → 43 (44 catalog rows incl. the sample-only PD)

### Fixed
- `build-catalog.mjs` no longer hardcodes the `/2020/web/` display path — the web-app year is derived from each row's href (NMMB lives under `/2026/web/`, so its links 404'd)

## [0.1.0] - 2026-06-30

### Added
- Initial release of csl-guides documentation site
- Docusaurus-based documentation framework
- Sanskrit Lexicon project documentation structure
- PR workflow templates
- Contributing guidelines and Code of Conduct

### Changed

### Deprecated

### Removed

### Fixed

### Security
