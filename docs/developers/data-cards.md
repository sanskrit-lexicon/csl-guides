---
id: data-cards
title: "Data cards — every dataset this site ships"
description: "A data-statement/data-card convention for the machine-readable datasets csl-guides generates or vendors, with a card per feed: provenance, builder, license, limitations."
sidebar_label: Data cards
---

# Data cards — every dataset this site ships

_Created: 07-07-2026 · Last updated: 07-07-2026_

This site is not only prose: it commits a set of **machine-readable datasets** under
[`src/data/`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/src/data) that its
pages compute from at build time. Anyone may reuse those files — so each one carries a
**data card** here, following the *data statement* practice of
[Bender & Friedman 2018](https://aclanthology.org/Q18-1041/) (current
[schema v3, 2024](https://techpolicylab.uw.edu/data-statements/)) and
[Datasheets for Datasets](https://dl.acm.org/doi/10.1145/3458723), scaled to the size of
these feeds. This is also what the
[ACL Responsible NLP checklist](https://aclrollingreview.org/responsibleNLPresearch/) §B
demands of any paper that uses or releases an artifact: citation, license, provenance, and
use-restriction disclosure, per artifact.

## The convention

Every dataset under `src/data/` must have, from the moment it is added:

1. **A card on this page** — description, curation rationale, provenance, language and
   encoding, license/rights, known limitations, update policy.
2. **A builder script or an annotation note.** Generated feeds name their
   [`scripts/build-*.mjs`](https://github.com/sanskrit-lexicon/csl-guides/tree/main/scripts)
   builder (re-run it; never hand-edit the JSON). Annotated feeds (the gold panel, the
   quizzes) name their annotator, pass count, and grounding instead.
3. **In-file provenance** where the format allows it — `generatedAt`, `generatedBy`,
   `source`, `license` keys in the JSON itself, so a copied file stays self-describing.
4. **An org-level release path for anything that leaves the site.** These feeds are
   *redistributed aggregates* scoped to documenting CDSL. A feed that should become a
   citable dataset in its own right (DOI, versioned archive) goes through the org
   `/data-release` process — safety gate, license ruling, provenance README,
   `CITATION.cff`, versioned release — and gets a row in the
   [kosha data-hub manifest](https://github.com/gasyoun/kosha/blob/main/data/manifest/datasets.json),
   which is the org's registry of canonical derived datasets (public tier via
   [`data-v*` releases](https://github.com/gasyoun/kosha/releases), restricted tier private).
   None of the feeds below has a DOI yet; they are versioned only by this repo's releases.

Upstream rights for the non-Cologne feeds are documented per source in
[`src/data/NON_COLOGNE_SOURCES.md`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/NON_COLOGNE_SOURCES.md).

## Feed index

| Feed | Kind | Builder / annotation | Upstream | License |
|---|---|---|---|---|
| [dictionaries.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/dictionaries.json) | generated | [build-catalog.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-catalog.mjs) | live CDSL front page + GitHub org + csl-doc | facts about public resources |
| [abbreviations.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/abbreviations.json) | generated | [build-abbreviations.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-abbreviations.mjs) | dictionary repos' legend files | source dicts (public domain) |
| [atlas-extract.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/atlas-extract.json) | vendored | verbatim copy (H278) | [csl-atlas OBS artifacts](https://github.com/sanskrit-lexicon/csl-atlas/tree/main/data/obs) | CC BY 4.0 (atlas) |
| [citation-sources.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/citation-sources.json) + [cladogram.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/cladogram.json) | generated | [build-atlas-viz.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-atlas-viz.mjs) | csl-atlas committed artifacts | CC BY 4.0 (atlas) |
| [corpus-frequency.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/corpus-frequency.json) | generated | [build-corpus-frequency.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-corpus-frequency.mjs) | DCS via [kosha lemma_frequency.tsv](https://github.com/gasyoun/kosha/blob/main/data/frequency/lemma_frequency.tsv) | CC BY 4.0 |
| [heritage-coverage.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/heritage-coverage.json) | generated | [build-heritage-coverage.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-heritage-coverage.mjs) | [MW↔Heritage crosswalk](https://github.com/gasyoun/SanskritLexicography/blob/master/HeadwordLists/mw_heritage_crosswalk.tsv) | aggregates only (LGPLLR raw not redistributed) |
| [which-dictionary-gold.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/which-dictionary-gold.json) | annotated | single pass, Fable 5 (`claude-fable-5`), 2026-07-07 | dictionary front matter + atlas OBS | CC-BY-SA-4.0 |
| [routing-benchmark.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/routing-benchmark.json) | generated | [build-routing-benchmark.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-routing-benchmark.mjs) | derived from the gold panel | CC-BY-SA-4.0 |
| [hypothesis-metrics.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/hypothesis-metrics.json) | generated | [build-hypothesis-metrics.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-hypothesis-metrics.mjs) | the other feeds + `docs/` word counts | derived metrics |
| quiz datasets (6 files) | authored / part-generated | see card | Wikner course + `csl-orig/v02/mw/mw.txt` | site content |

## Cards

### dictionaries.json — the dictionary catalog

- **What / why.** The 44-row catalog of every dictionary on the live CDSL front page —
  code, year, title, digitization status, repo, scan/web links. Exists so catalog facts are
  *fetched from the live sources*, never hand-asserted.
- **Provenance.** Regenerated by `npm run build:catalog`
  ([build-catalog.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-catalog.mjs)):
  live CDSL front page + the GitHub org repo list + `csl-doc` + `csl-orig/v02`. Never edit
  the JSON by hand.
- **Language & encoding.** Metadata in English; dictionary titles as printed. UTF-8.
- **License / rights.** Factual metadata about publicly hosted resources.
- **Known limitations.** Snapshot of the front page at `generatedAt`; codes ≠ repo names
  (`REPO_OVERRIDES`); the front-page server rejects non-browser user agents, so the builder
  sends a browser UA.
- **Update policy.** CI refreshes it on deploy (non-fatal); re-run locally when the front
  page changes.

### abbreviations.json — dictionary abbreviation legends

- **What / why.** Machine-readable abbreviation legends for the dictionaries that publish
  one (18 of 44 with data), powering the
  [abbreviations comparison](/dictionaries/abbreviations-comparison).
- **Provenance.**
  [build-abbreviations.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-abbreviations.mjs)
  reads each dictionary repo's committed legend files.
- **Language & encoding.** Abbreviation tokens as printed (Latin/IAST); expansions in the
  source dictionary's language. UTF-8.
- **License / rights.** The legends belong to public-domain source dictionaries.
- **Known limitations.** Presence of a legend ≠ per-token resolvability — see
  [GH-4](/about/guides-hypotheses#gh-4--abbreviation-legend-exposure) for the exposure-vs-
  resolution distinction.
- **Update policy.** Re-run when a dictionary repo gains or fixes a legend.

### atlas-extract.json — vendored csl-atlas OBS extract

- **What / why.** Per-dictionary novelty (unique-headword share) and `<ls>` citation
  volumes, copied verbatim from the committed
  [csl-atlas](https://github.com/sanskrit-lexicon/csl-atlas) OBS artifacts
  ([headword_multiplicity.csv](https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/obs/headword_multiplicity.csv),
  [citation_registers.json](https://github.com/sanskrit-lexicon/csl-atlas/blob/main/data/obs/citation_registers.json)).
  Vendored so this site's builds never recompute atlas analysis (csl-atlas owns the engine).
- **Provenance.** Hand-vendored under H278; in-file `source` keys point at the exact
  upstream artifacts.
- **License / rights.** csl-atlas data, CC BY 4.0.
- **Known limitations.** Goes stale when the atlas re-derives; refresh means re-copying,
  never recomputing here.
- **Update policy.** Re-vendor on upstream change, verbatim.

### citation-sources.json + cladogram.json — atlas visualization feeds

- **What / why.** Per-dictionary top-cited classical texts (828,505 resolved `<ls>`
  citations → 912 texts, 11 dictionaries) and the 41-leaf UPGMA headword-overlap tree —
  the data behind [Citation sources](/dictionaries/citation-sources) and the
  [landscape cladogram](/dictionaries/landscape).
- **Provenance.** `npm run build:atlas-viz`
  ([build-atlas-viz.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-atlas-viz.mjs))
  reads the sibling csl-atlas checkout's committed artifacts; committed JSON keeps CI
  sibling-free.
- **License / rights.** csl-atlas data, CC BY 4.0.
- **Known limitations.** Citation graph covers 11 of 44 dictionaries; MW resolves to only
  5 coarse nodes and MD to 4 (placeholders, not profiles); MD's "Rigveda" is not yet folded
  into "Ṛgveda" upstream. All stated in the pages' chart-trust blocks.
- **Update policy.** Re-run the builder on atlas artifact change.

### corpus-frequency.json — DCS lemma frequencies

- **What / why.** Top 2,000 DCS lemmas (of 83,277) with per-period counts, SLP1-keyed —
  the corpus-attestation signal on
  [Corpus attestation](/dictionaries/corpus-attestation).
- **Provenance.**
  [build-corpus-frequency.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-corpus-frequency.mjs)
  reads [kosha's lemma_frequency.tsv](https://github.com/gasyoun/kosha/blob/main/data/frequency/lemma_frequency.tsv)
  (itself derived from the [Digital Corpus of Sanskrit](http://www.sanskrit-linguistics.org/dcs/)).
- **Language & encoding.** Sanskrit lemmas in SLP1; UTF-8.
- **License / rights.** CC BY — see
  [NON_COLOGNE_SOURCES.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/NON_COLOGNE_SOURCES.md).
- **Known limitations.** Top-2,000 truncation (77.0% of tokens, stated where used); DCS
  period labels carry an upstream label-truncation caveat (`3200`/`4700` = slots 3/4),
  decoded on the page.
- **Update policy.** Re-run on kosha frequency-table release bumps.

### heritage-coverage.json — MW↔Heritage coverage aggregates

- **What / why.** How much of MW (25,140 of 185,803 keys, 13.5%) the Sanskrit Heritage
  Platform's lexicon covers, per initial — the independent machine reading on
  [Machine morphology](/dictionaries/machine-morphology).
- **Provenance.**
  [build-heritage-coverage.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-heritage-coverage.mjs)
  aggregates the
  [H099 MW↔Heritage crosswalk](https://github.com/gasyoun/SanskritLexicography/blob/master/HeadwordLists/mw_heritage_crosswalk.tsv).
- **License / rights.** **Aggregates only, deliberately**: the Heritage lexicon is LGPLLR
  and its raw data is not redistributed here (an org-level `@DECIDE` not exercised).
- **Known limitations.** Coverage ≠ correctness; the crosswalk's own matching caveats
  apply (see its provenance docs).
- **Update policy.** Re-run on crosswalk change.

### which-dictionary-gold.json — routing gold panel

- **What / why.** 24 routing scenarios (18 mirroring the
  [which-dictionary quiz](/users/which-dictionary-quiz) + 6 probes) with the dictionary a
  lexicographer would pick, each with rationale and defensible alternates. Grounds
  [GH-1](/about/guides-hypotheses#gh-1--which-dictionary-routing-accuracy) and the
  [routing shared task](/about/shared-tasks).
- **Provenance / annotation.** Single annotation pass, Fable 5 (`claude-fable-5`),
  2026-07-07, judged against dictionary front matter and atlas OBS evidence — **no second
  annotator yet**, so no inter-annotator κ can be reported (stated wherever the panel is
  used; a human second pass is the standing next step).
- **Language & encoding.** Scenario prose in English; codes are catalog codes. UTF-8.
- **License / rights.** CC-BY-SA-4.0 (declared in-file).
- **Known limitations.** Annotator-class circularity for the 18 quiz-mirrored items (same
  documentation corpus grounds both quiz and gold); the 6 probes don't share that
  circularity.
- **Update policy.** Append-only for scenario ids; a second pass adds fields, never
  rewrites golds silently.

### routing-benchmark.json — the shared-task benchmark

- **What / why.** The public benchmark derived from the gold panel for the
  [which-dictionary routing shared task](/about/shared-tasks): dev (18) / test (6) splits,
  a 44-code answer space, strict + lenient metric definitions.
- **Provenance.**
  [build-routing-benchmark.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-routing-benchmark.mjs);
  scored by
  [score-routing-task.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/score-routing-task.mjs).
- **License / rights.** CC-BY-SA-4.0, inherited from the gold panel.
- **Known limitations.** Open golds (self-reported leaderboard, not a hidden test); small
  n — always report the Wilson interval the scorer prints, not the point estimate alone.
- **Update policy.** Versioned in-file (`version`); a new gold pass bumps it.

### hypothesis-metrics.json — measured hypothesis results

- **What / why.** Every number the [Guides Hypotheses](/about/guides-hypotheses) page
  reports (GH-1..GH-4), reproducible from committed inputs only.
- **Provenance.** `node scripts/build-hypothesis-metrics.mjs`.
- **Known limitations.** Inherits every upstream card's caveats; the file states which
  handoff added which fields.
- **Update policy.** Re-run after any change to the inputs it reads (quiz files, gold
  panel, atlas extract, deep pages).

### Quiz datasets — mw-quiz, translit, sandhi, samāsa, devanāgarī, which-dictionary

- **What / why.** The six-quiz learning track's items (176 total), rendered by the `Quiz`
  component.
- **Provenance / annotation.** Authored against the site's own documentation and Charles
  Wikner's course; **mw-quiz.json is part-generated**: every CDSL entry id and print
  page+column is extracted from the digital MW source (`csl-orig/v02/mw/mw.txt`
  `<L>`/`<pc>` records) — re-derive, never hand-edit ids.
- **Language & encoding.** Sanskrit in IAST/SLP1/Devanāgarī as each item requires; UTF-8.
- **License / rights.** Site content; grounded in public-domain dictionary data.
- **Known limitations.** Difficulty labels are hand-assigned and *uncalibrated* until
  GH-5's opt-in telemetry yields data; coverage skews toward word-finding modes (GH-3).
- **Update policy.** New quiz = new JSON + a card update here.

---

**Provenance.** Convention and cards authored 07-07-2026 by Fable 5 (`claude-fable-5`)
under handoff
[H281](https://github.com/gasyoun/Uprava/blob/main/handoffs/H281-Fable_csl-guides_guides_stream4_acl_uplift_07.07.26.md)
(Stream 4, ACL-standards uplift), reusing the standards survey in
[ACL_DH_COMPATIBILITY_ANALYSIS.md](https://github.com/gasyoun/SanskritLexicography/blob/master/ReverseDictionary/ACL_DH_COMPATIBILITY_ANALYSIS.md)
(H265).

_Dr. Mārcis Gasūns_
