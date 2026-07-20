# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **`verify:quiz-positions` now runs in CI**, closing the H1387 follow-on: the guard existed but was a manual `npm run`, so nothing actually protected the six hand-authored banks. Wired into **both** workflows — [`ci.yml`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/.github/workflows/ci.yml) to gate pull requests, and [`deploy.yml`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/.github/workflows/deploy.yml) because CI runs only on `pull_request`, so a direct push to `main` would otherwise publish an unchecked quiz to the live site — the exact surface the defect sat on. Placed before the build in both (deterministic and instant, so it fails in seconds rather than after a ~40 s compile) and deliberately **not** `continue-on-error`: it cannot flake, so a red one means the data really is gameable. Verified by reintroducing the defect in `samasa-quiz.json` and confirming the CI command exits 1 naming the bank and the remedy.

### Fixed
- **Docusaurus 3.10.2 combined bump** — Dependabot split the 3.10.1 → 3.10.2 upgrade into one PR per package ([#110](https://github.com/sanskrit-lexicon/csl-guides/pull/110), [#111](https://github.com/sanskrit-lexicon/csl-guides/pull/111), [#112](https://github.com/sanskrit-lexicon/csl-guides/pull/112)); each one alone left the remaining `@docusaurus/*` packages at 3.10.1, and Docusaurus rejects a mixed core/plugin version set (`Invalid name=docusaurus-plugin-content-docs version number=3.10.1`), so all three builds were red and their auto-merge could never fire. Bumped `@docusaurus/core`, `preset-classic`, `theme-mermaid`, `module-type-aliases` and `types` to 3.10.2 together; production build verified green locally.
- **Quiz answer positions — every bank graded "always pick A" as a perfect score** ([H1387](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1387-Fable_csl-guides_quiz-answer-position-fixed-index-defect_20.07.26.md), [PR #119](https://github.com/sanskrit-lexicon/csl-guides/pull/119)). All seven item banks were authored with the correct answer written first and neither renderer shuffles, so **48 of 52 multiple-choice answers sat at index 0** (mw-quiz's 3 sat at index 1). Six public quizzes were solvable without reading them — including the beginner [level-quiz](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/level-quiz.json) lead magnet, where it made the score useless as the difficulty signal the H288 telemetry rails exist to collect. The generator authored the same way, so fixing the data alone would have been undone by the next `npm run build:level-quiz`.
  - New [`scripts/_quiz-options.mjs`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/_quiz-options.mjs) — deterministic and **idempotent**: indices are canonicalized by option text before being permuted by a PRNG seeded on the question id, so re-running converges instead of reshuffling forever. `build-level-quiz.mjs` uses the same helper, so generator and normalizer converge byte-for-byte.
  - [`normalize-quiz-answer-positions.mjs`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/normalize-quiz-answer-positions.mjs) applies it as a **text** transform, not a JSON round-trip: re-emitting through `JSON.stringify` reflowed the hand-authored banks and turned a pure reorder into an 866-line diff. Rewriting only each array's bracket span keeps every other byte identical — 59 lines changed, all reorders.
  - [`verify-quiz-answer-positions.mjs`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/verify-quiz-answer-positions.mjs) (`npm run verify:quiz-positions`) guards the class: fails if a bank's answers share one index, if any index holds >60% repo-wide, or if an answer is missing from its own options. **Confirmed to fail on the pre-fix data** before it passed on the fix.
  - Bilingual items keep one order across `en`/`ru` — permuting per-locale would sort `True`/`False` and `Верно`/`Неверно` differently and silently decouple the parallel arrays the level-quiz renderer depends on. Answers themselves are untouched; only option order moved. Position spread is now `0:19 1:9 2:10 3:14`.

## [0.9.0] - 2026-07-12

### Added
- **"How to read a Sanskrit dictionary entry" page** (`/dictionaries/entry-anatomy`, [H794](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H794-Opus_csl-guides_entry-anatomy-mdx-page_12.07.26.md)): the csl-guides consumer of the reusable `entry-anatomy` producer skill ([H791](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H791-Opus_claude-config_entry-anatomy-dict-skill_12.07.26.md)) — a colour-coded, hover-labelled dissection of four real entries, one per flagship dictionary (MW काल *kāla*, PWG गज *gaja*, AP90 काण *kāṇa*, GRA इध्म *idhma*), followed by a part-by-part written guide to the headword, homonym index, grammar tag, etymology, sense divisions, gloss, source citations, cross-references and Grassmann's attested Ṛg-Veda forms. New `EntryAnatomy` component + `scripts/build-entry-anatomy.py` → `src/data/entry-anatomy.json` (imports the skill over the sibling `csl-orig`, cleans residual markup, transliterates SLP1 Sanskrit forms to IAST, caps each card to 18 tokens); the committed JSON keeps the build free of the skill and csl-orig. Entry text renders as crawlable DOM (not an image), so the parts are SEO-visible. Placed in the Dictionaries sidebar after `abbreviations-comparison`.

## [0.8.0] - 2026-07-12

### Added
- **Citation-graph explainer page** (`/dictionaries/citation-graph`, [H715](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H715-Fable_csl-guides_citation-graph-explainer-page_11.07.26.md)): what the csl-atlas `<ls>` citation graph is (828,505 resolved citations → 912 canonical texts × 11 dictionaries), how it was built (abbreviation resolution, MW non-text filter, key borrowing, variant folding), its known limitations, and how to query the public TSVs — with two build-time figures from the committed `citation-sources.json` feed (per-dictionary share of the graph; the long-tail spread of texts by dictionary count, new `spread` field in `build-atlas-viz.mjs`), each with a data-table fallback and a trust block
- **Sanskrit Word Game** (`/tools/word-game`, [H315](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H315-Sonnet_csl-guides_beginner-lm-word-game_07.07.26.md)): the fourth beginner lead-magnet — a flashcard-streak game (see a frequency-ranked word in Devanagari, guess its meaning, build a streak). 26 words drawn from `corpus-frequency.json` (ranks 3–145), each gloss hand-verified against its cited Monier-Williams `<L>` entry in `csl-orig/v02/mw/mw.txt` (`scripts/build-word-game.mjs` → `src/data/word-game.json`, bilingual EN/RU, MW quote stored for provenance). First three words are pinned easy wins (dopamine before challenge, per the H315 handoff); streak persists in localStorage; share-your-streak copy prompt + stubbed soft-email capture appear at streak milestones (5/10/20/50), matching the H312/H313 capture pattern. Reuses the H288 quiz telemetry rails (`Quiz.js`) instead of a fourth telemetry scheme.

## [0.7.0] - 2026-07-09

### Added
- **"What's Your Sanskrit Level?" quiz** (`/tools/sanskrit-level-quiz`, [H313](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H313-Sonnet_csl-guides_beginner-lm-level-quiz_07.07.26.md)): the second beginner lead-magnet — 6 questions ramping from an akṣara-sound check to a sandhi concept, with the real-word/transliteration/frequency-comparison items drawn from the committed `corpus-frequency.json` feed (`scripts/build-level-quiz.mjs` → `src/data/level-quiz.json`, bilingual EN/RU). Ends in a level badge (Curious Novice / Can Sound It Out / Ready for Grammar) + a next-step CTA (free first Zoom class, per the H312 §0 funnel skeleton) and a stubbed soft-email capture (real ESP/list wiring gated on the same @DECIDE items as H312). Reuses the H288 quiz telemetry rails (`Quiz.js` opt-in/localStorage/export helpers, now exported) instead of a second telemetry scheme.

## [0.6.0] - 2026-07-09

### Added
- **Beginner article "How Long Until You Read Your First Sanskrit Sentence?"** (`/users/first-sanskrit-sentence`, [H314](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H314-Fable_csl-guides_beginner-lm-first-word-article_07.07.26.md)): the plain-language beginner lead-magnet — an honest data-backed timeline built on the committed `corpus-frequency.json` feed (top 25 lemmas = 22.5% of 4.55M DCS tokens), a top-10 first-words table, and a syllable-by-syllable walkthrough of *satyam eva jayate*; routes to the H312 transliterator, the Devanagari quiz, and Quick Start, with a soft samskrte.ru free-first-class bridge for Russian speakers
- **"Your Name in Devanagari" transliterator tool** (`/tools/name-in-devanagari`, [H312](https://github.com/gasyoun/Uprava/blob/main/handoffs/archive/H312-Sonnet_csl-guides_beginner-lm-transliterator-tool_07.07.26.md)): the first beginner lead-magnet — type a name or word in Latin letters and see it live in Devanagari, IAST, and SLP1, with quick-insert diacritic buttons, copy-to-clipboard, shareable PNG export, and a stubbed soft-email capture (real ESP/list wiring gated on the @DECIDE items in H312). Uses the vendored `sanskrit-util` transcoder via the abugida-correct `slp1_to_devanagari(to_slp1(text))` path — the package's own `iast_to_devanagari` was found to corrupt consonant+vowel sequences (`rāma` → `रआमअ`) and is filed upstream as [sanskrit-util#14](https://github.com/sanskrit-lexicon/sanskrit-util/issues/14).

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
