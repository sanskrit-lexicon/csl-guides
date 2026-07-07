---
id: guides-hypotheses
title: "Guides Hypotheses — a testable QA agenda for this site"
description: "Falsifiable hypotheses about this documentation site and its learners — each with claim, data, metric, baseline, and the committed artifact that tests it."
sidebar_label: Guides Hypotheses
---

# Guides Hypotheses — a testable QA agenda for this site

_Created: 07-07-2026 · Last updated: 07-07-2026_

This page holds **guides-specific, falsifiable hypotheses** — claims about this
documentation site and the learner using it, *not* about the dictionary evidence itself
(dictionary-evidence hypotheses belong to
[csl-atlas](https://github.com/sanskrit-lexicon/csl-atlas), whose
[HYPOTHESIS_INDEX.md](https://github.com/sanskrit-lexicon/csl-atlas/blob/main/docs/HYPOTHESIS_INDEX.md)
is the rigor model this page follows). Each hypothesis states **claim → data → metric →
baseline → the committed artifact that tests it**. Refuted or weakened hypotheses stay
visible: a negative result is still evidence.

All measured numbers below are reproducible from committed inputs with:

```sh
node scripts/build-hypothesis-metrics.mjs   # writes src/data/hypothesis-metrics.json
```

csl-atlas evidence is **consumed, never recomputed**: the per-dictionary novelty and
citation figures are vendored verbatim from the committed atlas artifacts
([headword_multiplicity.csv](https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/obs/headword_multiplicity.csv),
[citation_registers.json](https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/obs/citation_registers.json))
into [atlas-extract.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/atlas-extract.json).

## Status index

| ID | Type | Claim | Status | Key number |
|---|---|---|---|---|
| GH-1 | Tested (with caveat) | The which-dictionary quiz routes users where a lexicographer would. | **Supported on the 18 covered scenarios; refuted as *complete* routing** — 5 of 6 probe scenarios route to dictionaries the quiz never recommends. | 18/18 agreement; 9 never-targeted golds |
| GH-2 | Tested | Deep-page depth follows dictionary fame/size, not lexical novelty. | **Supported** — depth tracks entry count (ρ = 0.56), not unique-headword share (ρ = −0.17). | IEG: 57.5 % unique, 440 words; PWG: 1.9 % unique, 822 words |
| GH-3 | Tested | The six-quiz track under-covers the entry-*reading* failure modes relative to the word-*finding* ones. | **Supported** — finding modes get 21–34 items each; reading modes get 1–3. | F8 citation-resolution: 2 items vs F4 compounds: 34 |
| GH-4 | Tested (upper bound) | Most citations a reader meets are in dictionaries whose abbreviation legend this site documents. | **Supported as an exposure bound** — 95.3 % of corpus `<ls>` citations occur in legend-documented dictionaries. | 1,187,169 / 1,245,644 |
| GH-5 | Instrumented — awaiting data | Quiz difficulty labels predict real learner error rates. | **Instrumentation shipped** — opt-in `localStorage` telemetry on multiple-choice questions; no error-rate data collected yet. | — |

## GH-1 — Which-dictionary routing accuracy

- **Claim.** The [which-dictionary quiz](/users/which-dictionary-quiz) sends a user to the
  dictionary a working lexicographer would pick, and its 18 scenarios cover the routing
  decisions readers actually face.
- **Data.** [which-dictionary-quiz.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/which-dictionary-quiz.json)
  scored against an independent gold panel,
  [which-dictionary-gold.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/which-dictionary-gold.json):
  the 18 quiz scenarios re-judged from the dictionaries' own identities and front matter,
  plus 6 probe scenarios the quiz does not ask.
- **Metric.** Primary agreement on judged items; count of items with defensible alternate
  answers; share of probe scenarios whose gold dictionary lies outside the quiz's answer set.
- **Baseline.** A random router over the 4 options per item would score 25 %.
- **Result.** Agreement is **18/18**, with 7/18 items admitting a defensible alternate the
  quiz treats as wrong (e.g. WD-05 accepts only AE though MWE and BOR are also
  English→Sanskrit dictionaries). But **5 of 6 probes route outside the quiz's answer set**:
  the quiz never recommends **SKD/VCP** (Sanskrit-definition lookups, MW's own "L." trail),
  **ACC** (work/author attestation — the corpus's *highest* dictionary-unique headword share,
  43.3 % per atlas OBS-R), **GRA** (Ṛgveda concordance), **LAN/FRI** (reader vocabularies),
  or **PW/CCS** (compact German). The quiz's 18 targets cover 18 of 44 catalogued
  dictionaries; the miss list overlaps heavily with the high-novelty tail.
- **Caveat.** The gold re-judgments were made by the same annotator class that grounds the
  quiz (single pass, Fable 5 `claude-fable-5`, against the same documentation corpus), so the
  18/18 figure is an internal-consistency check, not independent validation. The probe-gap
  finding does not share this circularity — it is a set-coverage fact.
- **Next test.** A second, human gold pass over the same panel (inter-annotator agreement);
  then extend the quiz toward the never-targeted golds.

## GH-2 — Deep-page depth follows size, not novelty

- **Claim.** The 44 [featured dictionary pages](/dictionaries/catalog) allocate depth by
  dictionary fame/size (MW, PWG), not by lexical novelty — so the most *independent*
  dictionaries get the least documentation.
- **Data.** Word counts of `docs/dictionaries/*.mdx` vs per-dictionary unique-headword share
  from atlas OBS-R (vendored in
  [atlas-extract.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/atlas-extract.json)).
- **Metric.** Spearman rank correlation of page words × unique %, contrasted with page
  words × entry count.
- **Baseline.** If depth tracked novelty, ρ(depth, unique %) would be positive and exceed
  ρ(depth, entries).
- **Result.** **ρ(depth, unique %) = −0.17** (none to slightly inverse) while
  **ρ(depth, entries) = 0.56** — depth follows size. Sharpest mismatches: **IEG** (57.5 %
  unique — second-highest in the corpus — 440 words), **PGN** (54.9 %, 443), **ACC** (43.3 %,
  455), **PUI** (38.6 %, 434), against **PWG** (1.9 % unique, 822 words). Counterexample
  worth keeping honest: **SKD** is both high-novelty (37.1 %) *and* the deepest page
  (1,500 words), so the skew is a tendency, not a law.
- **Next test.** Bring the four high-novelty thin pages (IEG, PGN, ACC, PUI) to ≥700 words
  and re-run; the correlation should move toward zero if the fix is real.

## GH-3 — The quiz track teaches word-*finding*, not entry-*reading*

- **Claim.** The six-quiz learning track concentrates on getting the learner *to* the right
  headword (script, transliteration, sandhi, compounds, dictionary choice) and under-covers
  what happens *inside* the entry (symbols, abbreviations, citations, grammatical labels) —
  the failure modes [Reading Monier-Williams](/users/reading-monier-williams) itself
  documents.
- **Data.** All 176 items across the six quiz JSON files, mapped to a 10-mode beginner
  failure taxonomy (mapping is encoded in
  [build-hypothesis-metrics.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-hypothesis-metrics.mjs)).
- **Metric.** Items per failure mode; a mode with 0 items is uncovered, 1–3 is thin.
- **Baseline.** Roughly even coverage would put ~17 items on each mode.
- **Result.** **Supported.** Finding modes: script-and-order 21, transliteration 29,
  sandhi 32, compounds 34, dictionary-choice 18. Reading modes: dhātu-tracing 7,
  **symbols 3, entry-abbreviations 3, citation-resolution 2, grammatical-labels 1**. No mode
  is fully uncovered, but everything a reader does after landing on the entry is thin —
  exactly the modes the MW reading guide flags as beginner traps.
- **Next test.** The queued "next quiz topic" decision (maintainer-gated, see
  `.ai_state.md`) should weigh an *entry-reading* quiz (symbols + abbreviations + `<ls>`
  citations + `lex` labels) above another word-finding topic; re-run the mapping after.

## GH-4 — Abbreviation-legend exposure

- **Claim.** The overwhelming share of `<ls>` citations a CDSL reader actually meets occurs
  in dictionaries whose abbreviation legend this site already documents machine-readably —
  so legend coverage is effectively complete *by exposure*, even though only 18 of 44
  dictionaries have data.
- **Data.** Per-dictionary `<ls>` counts from atlas OBS-C (vendored) × legend status per
  dictionary in
  [abbreviations.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/abbreviations.json).
- **Metric.** Share of corpus `<ls>` citations falling in `data`-status dictionaries.
- **Baseline.** Naive per-dictionary coverage says 18/44 = 41 %.
- **Result.** **95.3 %** (1,187,169 of 1,245,644 `<ls>` citations) occur in
  legend-documented dictionaries — exposure-weighted coverage is far ahead of dictionary
  count, because the citation-heavy dictionaries (MW, PWG, PW, AP90…) are exactly the
  documented ones. Remainder: 42,714 citations in `none`-status dictionaries, 15,761 in
  dictionaries outside the legend index.
- **Caveat.** This is an *exposure upper bound* on resolvability, not resolvability itself:
  per atlas OBS-C only ~59.3 % of `<ls>` citations are locator-bearing at all, and a
  documented legend does not guarantee each abbreviation resolves. A per-abbreviation
  frequency join (which abbreviation tokens are most seen vs which are in the legend) needs a
  per-abbreviation-frequency artifact that csl-atlas has not committed — **stub**: tracked as
  a csl-atlas request rather than recomputed here (see the atlas
  [CITATION_REGISTERS.md](https://github.com/sanskrit-lexicon/csl-atlas/blob/main/docs/CITATION_REGISTERS.md)
  abbreviation-family-merge next-test, which is the same artifact).
- **Next test.** When csl-atlas commits a per-abbreviation frequency table, replace the
  exposure bound with true token-level legend coverage.

## GH-5 — Difficulty labels predict learner error rates (instrumented — awaiting data)

- **Claim.** Quiz items labelled `hard` produce higher real error rates than `medium`, and
  `medium` higher than `easy` — i.e. the hand-assigned difficulty labels are calibrated.
- **Data (collection now live).** Per-item answer events (item id, chosen option, correct?,
  timestamp — no user identity needed), aggregated to per-item `{attempts, correct}`
  counters. No events have been collected yet — this section reports the mechanism, not a
  result.
- **Metric.** Monotonicity of mean error rate across the three labels
  (Jonckheere–Terpstra or simple ordered comparison), per quiz.
- **Baseline.** Uncalibrated labels: no ordering, error rates statistically
  indistinguishable across labels.
- **Mechanism shipped (H288, MG ruled 07-07-2026 telemetry belongs on the site).**
  [Quiz.js](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/components/Quiz.js)
  now has a visible, **off-by-default** opt-in toggle. When a reader turns it on,
  `multiple-choice`-typed items switch from the no-JS `<details>` reveal to a click-an-option
  interactive mode: choosing an option records `{itemId, difficulty, quizTitle, attempts,
  correct}` in the browser's `localStorage` (key `csl-guides-quiz-stats-v1`), then reveals the
  answer. All other item types, and multiple-choice items when telemetry is off, keep the
  original `<details>` reveal unchanged. A "Download my quiz stats" button exports the
  counters as JSON — the only way data leaves the browser, and only when the reader clicks
  it. No server, no network calls, no third-party scripts, no personal data, no user
  identity — client-side only, matching the privacy envelope this hypothesis originally
  stubbed.
- **Next test.** Once readers opt in and export stats, aggregate the exported JSON files by
  hand (no automatic collection channel exists, by design) and re-run the monotonicity
  check.

---

**Provenance.** Authored and measured 07-07-2026 by Fable 5 (`claude-fable-5`) under
handoff [H278](https://github.com/gasyoun/Uprava/blob/main/handoffs/H278-Fable_csl-guides_guides_stream1_hypotheses_07.07.26.md)
(Stream 1 of the csl-guides research programme). Metrics artifact:
[hypothesis-metrics.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/hypothesis-metrics.json).

_Dr. Mārcis Gasūns_
