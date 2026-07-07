---
id: dh-programme
title: "The DH uplift programme — how this site became measurable"
description: "Synthesis of the July 2026 five-stream digital-humanities uplift: external data feeds, falsifiable hypotheses, visualizations, corpus data layers, and ACL-standard reporting — with every result in one table."
sidebar_label: DH programme synthesis
---

# The DH uplift programme — how this site became measurable

_Created: 07-07-2026 · Last updated: 07-07-2026_

In one week of July 2026 this site went from a documentation collection to a
**measurable digital-humanities object**: it now carries external corpus evidence,
states falsifiable hypotheses about itself, visualizes the dictionary landscape it
documents, and reports every number to the ACL community standard. The work ran as
five coordinated streams; this page is the synthesis — what each stream delivered,
how they interlock, the consolidated results, and what remains open.

## The shape of the programme

The five streams were not independent essays — they form a dependency chain:

1. **Feeds first (S5).** Two non-Cologne data feeds were wired in as committed,
   rights-cleared JSON: DCS corpus frequency and MW↔Heritage morphology coverage
   (surveyed with three further sources in
   [NON_COLOGNE_SOURCES.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/NON_COLOGNE_SOURCES.md)).
   The governing rule: **consume the committed derived artifact, never scrape a live
   site** — every downstream page reads these feeds at render time, nothing is
   hand-typed.
2. **Hypotheses frame the questions (S1).** The
   [Guides Hypotheses](./guides-hypotheses.md) page states five falsifiable claims
   about this site and its learners (GH-1…GH-5), each with claim → data → metric →
   baseline → committed artifact. These define *what the site should be measured on* —
   and the streams that follow either supply the measurements or turn the gaps into
   benchmarks.
3. **Visualizations and data layers show the evidence (S2 + S3).** Three
   visualizations on the [dictionary landscape](../dictionaries/landscape.mdx) and
   [citation sources](../dictionaries/citation-sources.mdx) pages render the
   csl-atlas evidence (novelty, overlap, citations); two data-layer pages —
   [corpus attestation](../dictionaries/corpus-attestation.mdx) and
   [machine morphology](../dictionaries/machine-morphology.mdx) — turn the S5 feeds
   into reader-facing signals (is this headword attested in a real corpus? does a
   machine reading of it exist?).
4. **The ACL lens sits over all of it (S4).** The programme closes by holding the
   site to the standard of the field it borrows from: a
   [metric-presentation convention](./publications.md) (metric + n + baseline +
   uncertainty + artifact), [data cards](../developers/data-cards.md) for every
   dataset the site ships, a live [shared task](./shared-tasks.md) built from GH-1's
   own coverage gap, and a liveness-verified [venue landscape](./publications.md)
   for publishing about CDSL.

The through-line: **S5 supplied evidence, S1 posed the questions, S2/S3 rendered the
answers, S4 made the reporting citable.** A negative or partial result (GH-1's probe
failure, GH-2's depth-follows-size finding) was kept visible rather than smoothed
over — the shared task's test split *is* GH-1's failure mode, promoted to a benchmark.

## Results at a glance

All figures below are reproducible from committed artifacts; each row links to the
page that documents the measurement in full.

| Measurement | Result | Documented at |
|---|---|---|
| Which-dictionary routing accuracy (GH-1) | 18/18 = 100%, 95% Wilson CI [82.4%, 100%], vs random-4 (25%) and majority-class (5.6%) baselines — **but** 5 of 6 probe scenarios route to dictionaries the quiz never recommends (9 never-targeted golds) | [GH-1](./guides-hypotheses.md#gh-1--which-dictionary-routing-accuracy) |
| Deep-page depth follows size, not novelty (GH-2) | ρ(depth, entries) = 0.56 (n = 44, p = 7.7×10⁻⁵); ρ(depth, unique %) = −0.17 (p = 0.26, n.s.) | [GH-2](./guides-hypotheses.md#gh-2--deep-page-depth-follows-size-not-novelty) |
| Quiz track teaches word-*finding*, not entry-*reading* (GH-3) | finding modes carry 18–34 items each; reading modes 1–7 (citation-resolution: 2; grammatical labels: 1) | [GH-3](./guides-hypotheses.md#gh-3--the-quiz-track-teaches-word-finding-not-entry-reading) |
| Abbreviation-legend exposure (GH-4) | 95.3% of corpus `<ls>` citations (1,187,169 of 1,245,644) fall in legend-documented dictionaries | [GH-4](./guides-hypotheses.md#gh-4--abbreviation-legend-exposure) |
| Difficulty-label calibration (GH-5) | instrumented — opt-in, client-only quiz telemetry shipped; no error-rate data yet | [GH-5](./guides-hypotheses.md) |
| Dictionary landscape | 43 dictionaries on year × unique-headword-% × size; BHS 57.6% unique, ACC 43.3%, SKD 37.1%; corpus-wide 1,496,157 entries → 410,259 distinct lemmas | [landscape](../dictionaries/landscape.mdx) |
| Headword-overlap cladogram | 41 dictionaries, UPGMA; recovers the known families (PW–PWG, AP–AP90, CAE–CCS, SHS–WIL–YAT, PWKVN–SCH) | [landscape](../dictionaries/landscape.mdx) |
| Citation sources | 828,505 resolved `<ls>` citations → 912 canonical texts across 11 dictionaries (PWG alone: 536,172) | [citation sources](../dictionaries/citation-sources.mdx) |
| Corpus attestation | top 2,000 of 83,277 DCS lemmas (≈1% of MW's 185,803 entries) account for 77.0% of 4,550,704 corpus tokens | [corpus attestation](../dictionaries/corpus-attestation.mdx) |
| Machine-morphology coverage | 25,140 of 185,803 MW entries (13.5%, a lower bound) have a Heritage article; ā- initial leads at 20.7% | [machine morphology](../dictionaries/machine-morphology.mdx) |
| Shared task: which-dictionary routing | dev 18 / test 6 scenarios over all 44 codes; site quiz router scores 100% dev / 0% test (strict) — the coverage gap made into a benchmark | [shared tasks](./shared-tasks.md) |
| Data documentation | data cards for all 9 feeds + 6 quiz datasets (176 items), per the Bender & Friedman data-statement convention | [data cards](../developers/data-cards.md) |
| Publishing venues | 6 live ACL-family venues (WSC §23, ISCLS, LaTeCH-CLfL, NLP4DH, WILDRE, LREC) + JOHD, liveness-verified 07-07-2026 | [publications](./publications.md) |

## Stream by stream

### S5 — non-Cologne data feeds (the foundation)

Two feeds, each with a builder script reading a sibling checkout so CI stays
sibling-free:
[corpus-frequency.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/corpus-frequency.json)
(top 2,000 DCS lemmas with per-period counts, from the kosha
[lemma_frequency.tsv](https://github.com/gasyoun/kosha/blob/main/data/frequency/lemma_frequency.tsv);
DCS is CC BY) and
[heritage-coverage.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/heritage-coverage.json)
(185,803 MW keys against the Heritage crosswalk — aggregates only; redistribution of
the LGPLLR raw data is deliberately not exercised). The five-resource survey with
per-source rights verdicts lives in
[NON_COLOGNE_SOURCES.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/NON_COLOGNE_SOURCES.md):
DCS and Heritage wired; VedaWeb gated on an upstream bulk export; DharmaMitra
link-only (no bulk-download license); Saṃsādhanī validation-only until a LICENSE
appears upstream.

### S1 — Guides Hypotheses (the questions)

[Five falsifiable hypotheses](./guides-hypotheses.md) about the site itself, all
metrics computed by
[build-hypothesis-metrics.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-hypothesis-metrics.mjs)
into
[hypothesis-metrics.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/hypothesis-metrics.json).
The headline finding is deliberately double-edged: the routing quiz is perfectly
*consistent* (18/18 against a gold panel) yet demonstrably *incomplete* (5 of 6 probe
scenarios need dictionaries the quiz never recommends — SKD/VCP, ACC, GRA, reader
vocabularies, compact German). GH-2 found that page depth tracks dictionary **size**
(ρ = 0.56), not **novelty** (ρ = −0.17): the most under-served pages are the
high-novelty indexes IEG, PGN, ACC, PUI.

### S2 — visualizations (the landscape)

Three theme-aware, SSR-safe visualizations, each with a chart-trust block (source
artifact, n, date) and a data-table fallback: the era × novelty × size scatter and
the 41-leaf UPGMA cladogram on [landscape](../dictionaries/landscape.mdx), and the
per-dictionary most-quoted-texts explorer on
[citation sources](../dictionaries/citation-sources.mdx). csl-atlas evidence is
vendored by
[build-atlas-viz.mjs](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-atlas-viz.mjs)
and consumed, never recomputed. Stated caveats stay attached to the charts: the
citation graph covers 11 of 43 dictionaries, and MW's 312k `<ls>` tags currently
resolve to only 5 coarse nodes (a placeholder, not a profile).

### S3 — data-layer sections (the corpus reading)

Two pages turn the S5 feeds into reading guidance:
[corpus attestation](../dictionaries/corpus-attestation.mdx) (cumulative coverage,
top-25 table, per-period profiles from Vedic *ūti*/*rayi* to late rasaśāstra
*pārada*/*gandhaka*, and how to read a corpus-zero "L.-only" headword) and
[machine morphology](../dictionaries/machine-morphology.mdx) (Heritage/INRIA as an
independent machine reading of MW, per-initial coverage, and the
vidyut / DharmaMitra / Saṃsādhanī ecosystem with per-source rights). Every figure on
both pages is computed from the committed feeds at render time.

### S4 — ACL-standard reporting (the lens)

The closing stream retrofitted the field's reporting bar onto everything above:
GH-1/GH-2 numbers gained Wilson intervals, explicit baselines, and significance
levels (and an explicit "κ not yet computable — single annotation pass" statement);
every dataset the site ships got a [data card](../developers/data-cards.md);
GH-1's coverage gap became a [shared task](./shared-tasks.md) with a dev/test split,
a scorer, and a self-reported leaderboard; and
[publications](./publications.md) now documents the live venue landscape and the
submission bar (Limitations section, Responsible-NLP checklist, metric conventions).

## What remains open

The programme's own standard requires saying what is *not* done:

- **GH-1** — no inter-annotator κ yet (single gold pass); the quiz targets 18 of 44
  catalogued dictionaries. A second, independent gold pass and quiz extension toward
  the 9 never-targeted golds are the named next tests.
- **GH-2** — bring IEG, PGN, ACC, PUI to ≥700 words and re-run the correlation.
- **GH-3** — an entry-reading quiz would rebalance the track; the next-quiz-topic
  choice is a maintainer decision, now with data behind it.
- **GH-4** — the exposure bound (95.3%) awaits replacement by token-level coverage
  once csl-atlas commits the per-abbreviation frequency table.
- **GH-5** — instrumentation is live; results wait on opt-in telemetry exports.
- **Shared task 2 (dictionary-lineage detection)** — a proposal until csl-atlas
  commits the headword-overlap similarity artifact it would score against.
- **VedaWeb feed** — gated on the upstream VedaWeb 2.0 bulk export; the
  corpus-attestation page grows a Vedic-accent section when it lands.
- **DOIs** — no feed has a DOI yet; the routing benchmark and gold panel are the
  first candidates for a citable data release.
- **Venue choice** — the landscape is documented; picking a venue for a concrete
  CDSL paper is a human decision.

## Provenance

All five streams and this synthesis were executed by **Fable 5**
(`claude-fable-5`) on 07-07-2026, as five stream deliveries
([#87](https://github.com/sanskrit-lexicon/csl-guides/pull/87),
[#89](https://github.com/sanskrit-lexicon/csl-guides/pull/89),
[#94](https://github.com/sanskrit-lexicon/csl-guides/pull/94),
[#96](https://github.com/sanskrit-lexicon/csl-guides/pull/96),
[#98](https://github.com/sanskrit-lexicon/csl-guides/pull/98)) plus this capstone.
The opt-in quiz telemetry instrument (GH-5) was delivered separately by Sonnet 5
(`claude-sonnet-5`, [#92](https://github.com/sanskrit-lexicon/csl-guides/pull/92)).

_Dr. Mārcis Gasūns_
