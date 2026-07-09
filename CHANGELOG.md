# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2026-07-09

### Added
- **"What's Your Sanskrit Level?" quiz** (`/tools/sanskrit-level-quiz`, [H313](https://github.com/gasyoun/Uprava/blob/main/handoffs/H313-Sonnet_csl-guides_beginner-lm-level-quiz_07.07.26.md)): the second beginner lead-magnet — 6 questions ramping from an akṣara-sound check to a sandhi concept, with the real-word/transliteration/frequency-comparison items drawn from the committed `corpus-frequency.json` feed (`scripts/build-level-quiz.mjs` → `src/data/level-quiz.json`, bilingual EN/RU). Ends in a level badge (Curious Novice / Can Sound It Out / Ready for Grammar) + a next-step CTA (free first Zoom class, per the H312 §0 funnel skeleton) and a stubbed soft-email capture (real ESP/list wiring gated on the same @DECIDE items as H312). Reuses the H288 quiz telemetry rails (`Quiz.js` opt-in/localStorage/export helpers, now exported) instead of a second telemetry scheme.

## [0.6.0] - 2026-07-09

### Added
- **Beginner article "How Long Until You Read Your First Sanskrit Sentence?"** (`/users/first-sanskrit-sentence`, [H314](https://github.com/gasyoun/Uprava/blob/main/handoffs/H314-Fable_csl-guides_beginner-lm-first-word-article_07.07.26.md)): the plain-language beginner lead-magnet — an honest data-backed timeline built on the committed `corpus-frequency.json` feed (top 25 lemmas = 22.5% of 4.55M DCS tokens), a top-10 first-words table, and a syllable-by-syllable walkthrough of *satyam eva jayate*; routes to the H312 transliterator, the Devanagari quiz, and Quick Start, with a soft samskrte.ru free-first-class bridge for Russian speakers
- **"Your Name in Devanagari" transliterator tool** (`/tools/name-in-devanagari`, [H312](https://github.com/gasyoun/Uprava/blob/main/handoffs/H312-Sonnet_csl-guides_beginner-lm-transliterator-tool_07.07.26.md)): the first beginner lead-magnet — type a name or word in Latin letters and see it live in Devanagari, IAST, and SLP1, with quick-insert diacritic buttons, copy-to-clipboard, shareable PNG export, and a stubbed soft-email capture (real ESP/list wiring gated on the @DECIDE items in H312). Uses the vendored `sanskrit-util` transcoder via the abugida-correct `slp1_to_devanagari(to_slp1(text))` path — the package's own `iast_to_devanagari` was found to corrupt consonant+vowel sequences (`rāma` → `रआमअ`) and is filed upstream as [sanskrit-util#14](https://github.com/sanskrit-lexicon/sanskrit-util/issues/14).

## [0.5.0] - 2026-07-07

### Added
- **Shared tasks & leaderboard page** (`/about/shared-tasks`): the *which-dictionary routing* shared task goes live — public benchmark `src/data/routing-benchmark.json` (dev 18 / test 6 scenarios over the 44-code answer space, derived from the gold panel by `scripts/build-routing-benchmark.mjs`), official scorer `scripts/score-routing-task.mjs` (strict + lenient accuracy with 95% Wilson intervals), leaderboard with quiz-router and random baselines, and PR-based submission protocol; a second task (*dictionary-lineage detection*) documented as a proposal pending a csl-atlas similarity artifact
- **Data cards page** (`/developers/data-cards`): a Bender & Friedman data-statement convention for every dataset under `src/data/`, with a card per feed (catalog, abbreviations, atlas extract, atlas-viz feeds, corpus frequency, Heritage coverage, gold panel, benchmark, metrics, quizzes) — provenance, builder, license, known limitations, update policy — wired to the org `/data-release` path and the kosha data-hub manifest for anything released beyond the site
- **ACL publishing section on the Publications page**: Anthology-indexed venue landscape for CDSL work (WSC-CSDH, ISCLS, LaTeCH-CLfL, NLP4DH, WILDRE, LREC; liveness verified 07-07-2026), the ACL submission bar (Limitations section, Responsible-NLP checklist §B, page limits), and the site's metric presentation convention (metric + n + baseline + uncertainty + artifact)

### Changed
- **Guides Hypotheses presented to ACL standard**: GH-1 now reports accuracy with a 95% Wilson interval [82.4%, 100%] against random-4 (25%) and majority-class (5.6%) baselines, and states explicitly that Cohen's κ awaits a second annotation pass; GH-2's correlations carry n and two-tailed significance (ρ = 0.56, p = 7.7×10⁻⁵ vs ρ = −0.17, p = 0.26); `build-hypothesis-metrics.mjs` computes the new CI/baseline/significance fields

## [0.4.0] - 2026-07-07

### Added
- **Corpus attestation data-layer page** (`/dictionaries/corpus-attestation`): Digital Corpus of Sanskrit frequency joined to dictionary headwords — cumulative-coverage table (top 2,000 lemmas = 77.0% of 4.55M counted tokens), top-25 lemma table, and per-period profiles showing Vedic-heavy (*ūti*, *rayi*, *vṛṣan*), epic, and late-alchemical (*pārada*, *gandhaka*) vocabulary; all figures computed from the committed `corpus-frequency.json` feed at build time
- **Machine morphology data-layer page** (`/dictionaries/machine-morphology`): the Sanskrit Heritage Platform as an independent machine reading — MW↔Heritage coverage table (25,140 of 185,803 MW entries, 13.5%, per-initial breakdown), a frequency-joined sample linking top DCS lemmas to their Heritage `DICO` articles, and the wider vidyut / DharmaMitra / Saṃsādhanī ecosystem with per-source rights notes
- Components `CorpusFrequency` (+ `CorpusCoverage`, `PeriodProfiles`) and `HeritageCoverage` (+ `HeritageSample`) — SSR-safe pure-markup tables computed from the H282 Stream-5 feeds at render time
- Vendored `sanskrit-util` v0.4.0 JS (`src/vendor/sanskrit-util.js`, byte-identical copy of `sanskrit-util/js/index.mjs`) for SLP1 → IAST display — never edit in place, re-copy on upstream version bumps

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
