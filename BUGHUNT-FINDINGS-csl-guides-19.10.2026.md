# Bug hunt — csl-guides — 19.10.2026

_Day-mode hunt (interactive, MG present) · repo [sanskrit-lexicon/csl-guides](https://github.com/sanskrit-lexicon/csl-guides) · base `origin/main` @ `349076a` (19-10-2026) · read-only hunt, no source edits._

**Provenance note.** The hunt started in the shared clone, whose `main` sits **2 unpushed commits ahead** of `origin/main` (`1995eaa`, `392a673` — the H7116 PWG sense-order page). Every finding below was therefore re-confirmed inside a clean worktree at `origin/main` @ `349076a` before landing, and the F1–F4 repros quoted here are from that worktree. One gate in the green table exists only on the local commits; it is marked as such.

Scope: the repo's own code — 25 `scripts/*.mjs`, 10 `scripts/*.py`, 6 `.github/workflows/*.yml`, `docusaurus.config.js`, `src/theme`, `src/ortho`. Vendored copies (`node_modules/`, `vendor/`, `package-lock.json`) and content prose were read only where a script's contract depended on them.

Method: static read of every gate script + the two quiz tools, then the `--check` gates the repo ships on `origin/main` executed **inside the worktree**, plus one independent recount of the citation feed straight from the TSV. Findings carry the command that produces them; nothing below is inferred from source alone.

## Ranked findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| F1 | **HIGH** | `scripts/_quiz-options.mjs` is imported by two scripts and **exists nowhere in git history** — `normalize:quiz-positions` and `build:level-quiz` both crash, and the verifier prints the dead command as its fix | `node scripts/normalize-quiz-answer-positions.mjs --check` → `ERR_MODULE_NOT_FOUND`, rc=1 |
| F2 | MEDIUM | `corpus-frequency` edge contract is **RED on `main`** and no workflow / npm script / hook runs it | `node scripts/build-corpus-frequency.mjs --check` → rc=1, two different SHA-256 |
| F3 | MEDIUM | Citation-graph numbers published on the site no longer reproduce from `csl-atlas`; `build-atlas-viz.mjs` has no `--check` to notice | committed 1,701/912/828,505 vs source 1,699/874/826,752 |
| F4 | LOW | Ortho query normalizer strips trailing punctuation only, so a quoted/parenthesised word never expands | `«августъ»` → `«августъ»` (unchanged); `августъ` → `августъ август` |

---

## F1 — HIGH — quiz tooling imports a module that was never committed

**Where:** [`scripts/build-level-quiz.mjs:22`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-level-quiz.mjs#L22) and [`scripts/normalize-quiz-answer-positions.mjs:26`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/normalize-quiz-answer-positions.mjs#L26) both do:

```js
import {canonicalOrder, applyOrder} from './_quiz-options.mjs';
```

`scripts/_quiz-options.mjs` does not exist and never did:

```
$ git log --all --oneline -- scripts/_quiz-options.mjs     # (empty)
$ git log --oneline --diff-filter=D --all -- scripts/_quiz-options.mjs   # (empty)
$ find . -name '_quiz-options*' -not -path './node_modules/*'            # (empty)
```

**Live repro (both npm scripts die before doing anything):**

```
$ node scripts/normalize-quiz-answer-positions.mjs --check
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../scripts/_quiz-options.mjs'
  imported from .../scripts/normalize-quiz-answer-positions.mjs
rc=1

$ node scripts/build-level-quiz.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../scripts/_quiz-options.mjs'
  imported from .../scripts/build-level-quiz.mjs
rc=1
```

**Why it matters — the guard's only advertised remedy is this broken command.** [`scripts/verify-quiz-answer-positions.mjs:71`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/verify-quiz-answer-positions.mjs#L71) fails a gameable bank with:

> `the quiz is solvable without reading it. Run npm run normalize:quiz-positions.`

and [`normalize-quiz-answer-positions.mjs:134`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/normalize-quiz-answer-positions.mjs#L134) repeats it on drift. A maintainer who hits the H1387 failure — a bank whose answers all sit at one index — follows the printed instruction and gets an `ERR_MODULE_NOT_FOUND`. There is no second path, and the generator that produced the bilingual lead-magnet quiz ([`src/data/level-quiz.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/level-quiz.json), 6 items, cited in CHANGELOG 0.7.0 and consumed by [`src/components/LevelQuiz.js:4`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/components/LevelQuiz.js#L4)) cannot be re-run at all.

**Why CI is green anyway:** no workflow invokes either command — `.github/workflows/ci.yml` runs `npm run verify:quiz-positions` (the *check*, which passes today at 52 answers) and nothing else in the quiz lane. The defect is invisible until someone needs to repair a bank.

**Blast radius (stated honestly):** the published site is unaffected — `src/data/level-quiz.json` is committed and the verifier is independent of the missing module. This is a lost-repair-path / lost-generator defect, not a runtime one.

**Fix sketch:** restore `_quiz-options.mjs` exporting `canonicalOrder(values, key)` (a deterministic permutation, keyed by `stem:id` so the en/ru blocks of one id share an order) and `applyOrder(values, order)`. Recovering the original algorithm from H313 is preferable to writing a fresh one — a new rule silently re-orders committed banks, which is a data decision, not a mechanical fix. Then wire `normalize:quiz-positions --check` into `ci.yml` so the remedy can never rot unnoticed again.

---

## F2 — MEDIUM — corpus-frequency edge contract is red on `main`, and nothing runs it

**Where:** [`scripts/build-corpus-frequency.mjs:69`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/build-corpus-frequency.mjs#L69) (SHA-256 pin vs upstream `kosha/data/frequency/lemma_frequency.tsv`).

```
$ node scripts/build-corpus-frequency.mjs --check
EDGE CONTRACT RED: upstream lemma_frequency.tsv moved.
  pinned   3d54e4dbf4fc90c75fdd10b7ab538ddde548718b703c935cadb4c22e43314d07
  current  c07f6a0229067267d2bf18ba79f43f5081f05fef8875a352cc18f5e157ceccef
Rebuild (npm run build:corpus-frequency) and re-commit the vendored feed.
rc=1
```

The pin is correct engineering — it caught real drift. The defect is that **nothing consumes the verdict**:

- `package.json` has `build:corpus-frequency` but **no `check:corpus-frequency`** (compare `check:ortho-edge`, which does have one);
- `.github/workflows/` never mentions corpus-frequency (grep over all 6 workflows);
- `.pre-commit-config.yaml` runs only yaml/eof/whitespace/merge-conflict/ruff — no data contracts.

So `src/data/corpus-frequency.json` has been pinned to a superseded DCS export while its sibling feeds (`ortho-query-expansions`, `pwg-sense-order`, `vedic-accent`, pref legends) all enforce their contracts in CI. That feed is not decorative: it backs `/dictionaries/corpus-attestation`, the word game's 26 words, and the level quiz's frequency items.

**Fix sketch:** add `"check:corpus-frequency": "node scripts/build-corpus-frequency.mjs --check"` to `package.json` and one `run:` step in `ci.yml` next to `check:ortho-edge`. Then decide the data question separately: rebuild + re-commit, or deliberately re-pin with a date note. (Not auto-fixed here: re-vendoring changes published numbers — a data call, not a bug fix.)

---

## F3 — MEDIUM — citation-graph numbers on the site no longer reproduce from `csl-atlas`

The committed feed [`src/data/citation-sources.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/data/citation-sources.json) was generated 11-07-2026 and states `edgeCount 1701 · nodeCount 912 · totalResolvedCites 828505`. Regenerating against the sibling checkout today yields `1699 / 874 / 826752`. Independent recount straight from the TSV, not from the builder:

```
$ awk -F'\t' 'NR>1{n++; s+=$NF} END{print "rows="n" sum_last_col="s}' \
    ../csl-atlas/data/citations/ls_citation_edges.tsv
rows=1699 sum_last_col=826752

$ awk -F'\t' 'NR>1{t[$2]=1; d[$1]=1} END{print "unique_texts="length(t)" dicts="length(d)}' \
    ../csl-atlas/data/citations/ls_citation_edges.tsv
unique_texts=874 dicts=11
```

The source is authoritative and clean (`csl-atlas` on `main`, no dirt; `ls_citation_edges.tsv` last changed 2026-09-24), so the two numbers differ because the upstream graph moved after the vendoring, not because the working copy was edited.

That makes a **stated invariant false on the live site** — [`docs/dictionaries/citation-sources.mdx:47`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/citation-sources.mdx#L47):

> **Validation:** vendored totals match the csl-atlas edge list exactly (828,505)

and the stale figures are published in at least four places ([`citation-graph.mdx:4`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/citation-graph.mdx#L4), [`citation-graph.mdx:147`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/citation-graph.mdx#L147), [`citation-sources.mdx:39`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/citation-sources.mdx#L39), [`dh-programme.md:71`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/dh-programme.md#L71), [`data-cards.md:142`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/developers/data-cards.md#L142)).

**Root cause is structural, not a typo:** of the five `build-*.mjs` data builders, exactly the two largest feeds — `build-atlas-viz.mjs` and `build-heritage-coverage.mjs` — ship **no `--check` mode** (`grep -ln '\-\-check' scripts/*.mjs` returns only corpus-frequency, ortho-query-expansions, pwg-sense-order, vedic-accent, normalize). Every other feed can prove "committed == reproducible"; these two cannot, so drift lands silently and only a manual re-run reveals it.

**Note on my own run:** passing `--check` to these two non-supporting builders re-executes them, which is why three data files briefly changed in the hunt tree (atlas-viz feeds + `generatedAt` stamps). They were reverted with `git checkout --` and the tree verified clean; the numbers above come from that run and from the independent TSV recount.

**Fix sketch:** add `--check` to both builders (same shape as the others: rebuild, compare, `exit 1` on mismatch, skip the `generatedAt` stamp in the comparison), run it in CI, then either re-vendor the atlas feed and update the four docs, or date-pin the snapshot and soften the "match exactly" claim.

---

## F4 — LOW — quoted or parenthesised query words never get ortho expansion

**Where:** [`src/ortho/orthoQueryCore.mjs:36`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/ortho/orthoQueryCore.mjs#L36) strips only *trailing* punctuation before the dictionary lookup:

```js
const word = chunk.replace(/[^\p{L}\p{N}_-]+$/u, '');
```

Live probe through the real normalizer (same code path the bundle uses):

```
"Thier"       -> "Thier tier"      ✓
"августъ"     -> "августъ август"  ✓
"Thier,"      -> "Thier tier,"     ✓
"«августъ»"   -> "«августъ»"       ✗ no expansion
"(Thier"      -> "(Thier"          ✗ no expansion
```

Pasting a word straight out of prose — `«августъ»`, `(Tier)`, `“Thier”` — silently loses the H3340 expansion, which is exactly the copy-paste case the feature exists for. Leading punctuation is never stripped, so the lookup key is `«августъ` and misses.

**Fix sketch:** strip leading punctuation too (`/^[^\p{L}\p{N}_-]+/`) and prepend it to `rest`. Untested by the current verifier, which queries bare tokens only.

---

## What verified green

Run against the same tree (`origin/main` @ `349076a`):

| Gate | Run in | Result |
|------|--------|--------|
| `check:ortho-edge` | worktree @ origin/main | GREEN — vendored `9c3bc9c2…` (de) / `9b6835b8…` (ru) match their pins; sibling layer degrades with a printed note when no checkout is present |
| `check:pref-legend` | worktree @ origin/main | OK — PWG 395/395, PW 302/302, 0 missing |
| `python3 scripts/changelog_duplicate_bullets.py` | worktree @ origin/main | `no duplicated entries` |
| `npm run verify:quiz-positions` | worktree @ origin/main | 52 answers / 7 banks, spread `0:19 1:9 2:10 3:14`, OK |
| `build-corpus-frequency --check` | worktree @ origin/main | **RED** — see F2 |
| `normalize-quiz-answer-positions --check` | worktree @ origin/main | **RED** — see F1 |
| `build-vedic-accent --check` | shared clone | GREEN — vendored `33c193af…` matches upstream (needs the sibling export path) |
| `build-abbreviations` (re-run) | shared clone | byte-identical output — idempotent |
| `build-pwg-sense-order --check` | shared clone **only** | reproduces from the atlas artifact — script does not exist on `origin/main` (it is one of the 2 unpushed H7116 commits) |
| CI on GitHub | network | last 3 runs (PR #219 + main) all `success`; `actions/checkout@v7`, `setup-node@v7`, `deploy-pages@v5`, `upload-pages-artifact@v5` all resolve to real releases |

## Checked and cleared (not defects)

- **[`src/theme/SearchPage/index.js:1`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/src/theme/SearchPage/index.js#L1)** — `import SearchPage from "./SearchPage"` with no extension is resolved by webpack's `.jsx` extension list (`SearchPage.jsx` is right beside it). A Node-ESM runner would fail here; the site build does not.
- **`verify-quiz-answer-positions.mjs` inspects 52 of 182 items** — the skip is correct, not a coverage hole: the remaining 130 are free-text `{question, answer}` concept items with no `options` array (`mw-quiz` 66/69, `sandhi-quiz` 27/30, `translit-quiz` 24/28), so answer *position* does not exist for them.
- **No committed secrets** — scan for `ghp_`/`github_pat_`/`sk-…`/`AKIA…`/PEM private-key blocks over the tracked tree: zero hits.
- **Workflow injection surface** — `dependabot-auto-merge.yml` interpolates only `github.event.pull_request.html_url` via `env:` (never into `run:`), and is gated on `github.actor == 'dependabot[bot]'`, so an untrusted fork PR cannot reach the `contents: write` job. `deploy.yml` runs `build:catalog` with `continue-on-error`, which is safe here because that script writes only at the end — a fetch failure leaves the committed feed in place.
- **`build-heritage-coverage.mjs` re-run** — output changed only in `generatedAt`; counts stable (25,140/185,803 = 13.5%), so no drift finding there.

## Suggested next steps

1. F1 first — it is the only finding that traps a maintainer mid-repair. Restore `_quiz-options.mjs` from H313 rather than re-inventing the ordering rule.
2. F2 — add the npm script + CI step; the data decision (rebuild vs re-pin) is MG's.
3. F3 — add `--check` to the two builders, then decide re-vendor vs date-pin; whichever it is, fix the "match exactly" sentence.
4. F4 — two-line change; fold into the next `src/ortho` touch.

_Elapsed: ~28 min (hunt + report, day mode). Hunt read-only; the only tree writes were the three builder outputs from the F3 probe, reverted and verified clean._
