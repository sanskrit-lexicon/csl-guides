---
id: shared-tasks
title: "Shared tasks & leaderboard"
description: "Public benchmarks over CDSL documentation data — the which-dictionary routing task (live, with scorer and leaderboard) and the dictionary-lineage detection task (proposed)."
sidebar_label: Shared tasks
---

# Shared tasks & leaderboard

_Created: 07-07-2026 · Last updated: 07-07-2026_

Computational lexicography moves fastest where there is a **shared task**: a fixed public
benchmark, a fixed metric, and a leaderboard anyone can join (the model here is the ACL
[MWSA shared task on monolingual word-sense alignment](https://aclanthology.org/2020.globalex-1.4/)
and its kin). This page hosts the CDSL documentation corpus's own shared tasks: one live,
one proposed.

## Task 1 — Which-dictionary routing (live)

**Problem.** Given a one-sentence user scenario ("*I met a Sanskritized Pali-looking form
in the Mahāvastu, absent from MW*"), predict which of the 44 catalogued CDSL dictionaries
a working lexicographer would route the user to.

This is the decision every CDSL newcomer faces before any lookup, and the one the
[which-dictionary quiz](/users/which-dictionary-quiz) teaches. A system that routes well —
a rule set, a retrieval system, an LLM prompt — is directly useful as a front-door
recommender for the whole corpus.

**Benchmark.**
[routing-benchmark.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/routing-benchmark.json)
(v1.0, CC-BY-SA-4.0; card on the [data cards](/developers/data-cards) page):

- **dev** — 18 scenarios (the ones the site quiz also asks; tune freely on these);
- **test** — 6 probe scenarios the quiz does *not* ask, deliberately drawn from the
  high-novelty tail (SKD/VCP, ACC, GRA, reader vocabularies, compact German);
- **answer space** — all 44 catalog codes;
- **metrics** — *strict* accuracy (prediction = gold) and *lenient* accuracy (prediction
  in the accepted set: gold + documented defensible alternates). Report both, with the
  95% Wilson interval the scorer prints — n is small, the interval is not optional.

Golds are public: this is an **open benchmark with a self-reported leaderboard**, not a
hidden-test competition. The honesty convention is: never train/tune on *test*, and say in
your notes what your system saw.

**Run it.**

```sh
node scripts/score-routing-task.mjs my-predictions.json
# my-predictions.json: { "G-01": "MW", "G-02": "BHS", ..., "P-06": "PW" }
```

**Submit** by pull request against
[csl-guides](https://github.com/sanskrit-lexicon/csl-guides): add your predictions file
under `static/shared-task-submissions/` and a leaderboard row below, with the scorer's
verbatim output in the PR body.

### Leaderboard

| System | dev strict | dev lenient | test strict | test lenient | Date | Notes |
|---|---|---|---|---|---|---|
| Site quiz answer key | 18/18 = 100% [82.4, 100] | 100% | 0/6 = 0% | 0/6 = 0% | 2026-07-07 | The quiz's own key, applied as a router. Perfect on dev *by construction* (the gold panel re-judged the quiz's scenarios and agreed 18/18 — see the [GH-1 caveat](/about/guides-hypotheses#gh-1--which-dictionary-routing-accuracy)); scores 0 on test because it cannot answer scenarios it never asks — exactly the coverage gap GH-1 measured. |
| Random over 44 codes | ~2.3% (expected) | ~3.4% (expected) | ~2.3% (expected) | ~4.5% (expected) | 2026-07-07 | Analytic expectation, not a run: 1/44 strict; lenient = mean accepted-set size / 44 (dev 27/18 ≈ 1.5 codes, test 12/6 = 2 codes). |
| *your system* | | | | | | |

**Why the baseline rows matter:** the gap between the quiz-router's dev and test scores is
the benchmark's point. A submission that beats 0% on test while staying strong on dev has
learned routing knowledge the site itself does not yet encode — and its test-split error
analysis tells us which deep pages or quiz scenarios to write next.

## Task 2 — Dictionary-lineage detection (proposed)

**Problem.** Given a pair of CDSL dictionaries, predict whether a documented derivation
relationship exists between them (supplement-of, revision-of, built-on, distillation-of)
— e.g. SCH supplements PW; MW built on WIL; PW distills PWG; AP revises AP90.

**Why it matters.** Lineage is the backbone of the corpus's history (see
[Origins](/about/origins)) and of the headword-overlap
[cladogram](/dictionaries/landscape) — but the cladogram is *similarity*, not *lineage*,
and telling descent from mere overlap is a genuine research problem (the same
copy-detection question csl-corrections studies via shared-error loci).

**Status: proposed — not yet scaffolded.** An honest benchmark needs:

1. a gold edge list of documented derivation relationships, extracted from the 44
   [deep pages](/dictionaries/catalog) and dictionary front matter (agent-doable here);
2. a similarity feature layer that is *not* the gold's own source — the csl-atlas
   headword-overlap matrix and, ideally, its shared-error loci artifact
   (csl-atlas-side; consumed when committed, per this site's vendoring rule).

Until (2) exists as a committed atlas artifact, the task stays a proposal rather than a
leaderboard with one degenerate submission. Interest / discussion → the
[csl-guides issue tracker](https://github.com/sanskrit-lexicon/csl-guides/issues).

---

**Provenance.** Tasks designed 07-07-2026 by Fable 5 (`claude-fable-5`) under handoff
[H281](https://github.com/gasyoun/Uprava/blob/main/handoffs/H281-Fable_csl-guides_guides_stream4_acl_uplift_07.07.26.md)
(Stream 4, ACL-standards uplift). Task-1 numbers are reproducible from
[routing-benchmark.json](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/routing-benchmark.json)
and the committed scorer.

_Dr. Mārcis Gasūns_
