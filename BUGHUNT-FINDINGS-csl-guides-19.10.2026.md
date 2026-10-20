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

---

## Addendum — 19.10.2026, second pass (independent session, same day)

_A second hunt ran on this repo on the same day, started before PR #221 merged and landing after it. It did not re-file the report: PR #221 stays the canonical report for 19.10.2026, and this section extends it. Nothing below is taken on trust from PR #221 — every claim was re-derived from the tree, and the two decisive artefacts are reproducible byte-for-byte._

Four items: one **correction of a verdict** (A1), three **new findings** (A2–A4), and one **fix that has already landed** (A5). One correction to a recommended fix also falls out of A4.

### A1 — CORRECTION to F2: the corpus-frequency contract is not drift — it is a fingerprint of one build machine's local copy of the upstream

PR #221 reads F2 as *"The pin is correct engineering — it caught real drift."* That reading is wrong, and the fix sketch that follows it ("rebuild + re-commit, or deliberately re-pin with a date note") cannot work. The upstream did not move. **The pin was never taken from the upstream at all.**

The pinned hash is not the hash of another version of the file — it is the hash of **the same file with CRLF line endings**:

```
$ python3 - <<'PY'
import hashlib
b = open('kosha/data/frequency/lemma_frequency.tsv','rb').read()
PINNED = '3d54e4dbf4fc90c75fdd10b7ab538ddde548718b703c935cadb4c22e43314d07'
for name, data in [('current bytes (LF)', b),
                   ('CRLF-normalised',   b.replace(b'\n', b'\r\n'))]:
    print(f"{name:22} {hashlib.sha256(data).hexdigest()}")
PY
current bytes (LF)      c07f6a0229067267d2bf18ba79f43f5081f05fef8875a352cc18f5e157ceccef
CRLF-normalised         3d54e4dbf4fc90c75fdd10b7ab538ddde548718b703c935cadb4c22e43314d07   <-- the pin
```

And the CRLF form was **never an upstream commit**. Every commit that carries the file — the original `c06545597` (02-07-2026), the PR branch `0f10e7467` and the merge `11fe51a0a` — carries the *same LF blob*:

```
$ for c in c06545597 0f10e7467 11fe51a0a; do git -C ../kosha cat-file -p $c:data/frequency/lemma_frequency.tsv | shasum -a 256; done
c07f6a0229067267…   (c06545597)
c07f6a0229067267…   (0f10e7467)
c07f6a0229067267…   (11fe51a0a)
```

**How the CRLF bytes got there.** kosha adopted `* text=auto eol=lf` on 31-07-2026 (`c550d428e`) — but git does not rewrite an already-present working-tree file when a `.gitattributes` rule appears. The TSV kept its CRLF bytes on disk until a later checkout/reset resynced it to the committed LF blob. On 22-08-2026, `npm run build:corpus-frequency` read **that local working-tree copy**, and the edge contract pinned its hash.

**So the contract is not a contract with the upstream.** It is a fingerprint of one build machine's local copy of the upstream path. It can only be green on a machine whose `kosha/data/frequency/lemma_frequency.tsv` happens to hold CRLF bytes; on every machine whose working tree matches its own index — i.e. on every *correct* checkout — it is red. The upstream's own committed state has satisfied the contract's own `current` value (`c07f6a02…`) since the day it was first committed.

**No data moved.** Rebuilding the feed from the live upstream and diffing it against the committed one gives **identical** `stats` (83,277 / 59,282 / 4,550,704 / 2,000), the same 2,002 lemmas, 0 only-in-committed, 0 only-in-upstream, and 0 lemmas whose content differs. Rebuilding against the CRLF variant changes **exactly one field** — `generatedAt` (`2026-08-22` → `2026-10-19`); `lemmas`, `stats` and `sourceSha256` are unchanged. So the prescribed remedy does not repair the class: it republishes an identical payload under a pin that is still red against the real upstream, and the only way to make it green is to re-bless a byte state upstream never had.

**Consequences.** (i) The contract has been red on every correct checkout for **58 days** (pinned 22-08-2026) — and the only checkout where it was green is the one that has since been resynced. (ii) The site publishes the claim that this feed carries a working contract — [`docs/dictionaries/corpus-attestation.mdx:116`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/corpus-attestation.mdx#L116): *"(SHA-256 edge contract over the upstream bytes, `--check` mode)"* — while that contract is red. (iii) The sibling contracts have the same shape and the same exposure: `build-vedic-accent.mjs` and `build-pwg-sense-order.mjs` hash **a local path** the same way, and are one line-ending flip away from the identical false red.

**Recommended fix (data-neutral, MG's call).** Make the pin independent of the build machine's line endings: hash the **LF-normalised** upstream bytes — the form upstream's own `.gitattributes` declares canonical — and update the one `sourceSha256` string in `src/data/corpus-frequency.json`. The published payload does not move: `lemmas` and `stats` stay byte-identical, provable by the rebuild diff above. The same normalisation should be applied to the other two contracts before they inherit the same trap. A stronger alternative is to compare the *rebuilt payload* against the committed one (as `build-atlas-viz` / `build-heritage-coverage` should grow), which proves reproducibility rather than byte equality — and, unlike a byte hash, is line-ending-agnostic by construction.

### A2 — NEW (MEDIUM) — the "top 2,000" slice is 2,002 lemmas, and the feed's own field says 2,000

`build-corpus-frequency.mjs` treats `TOP_N = 2000` as a **row count**, but applies it as a **rank threshold** (`rank <= TOP_N`, line 118) over an upstream column that is a **tied** rank. In the selected slice there are **2,002 rows over only 1,132 distinct rank values** (highest rank present: 1,999; e.g. rank 1,010 appears 6×, 1,962 appears 12×). So the slice size is data-dependent, not `TOP_N`.

The build's own stdout admits it — `Wrote …: top 2002 of 83277 lemmas` — while the feed it writes carries `stats.topN: 2000` and an array of 2,002. `stats.topN` has **no consumer** anywhere in the repo, so the one machine-readable statement of the slice size is both wrong and unused.

Six published places say "top 2,000": [`corpus-attestation.mdx:108`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/corpus-attestation.mdx#L108) and [`:123`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/corpus-attestation.mdx#L123), [`dh-programme.md:72`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/dh-programme.md#L72) and [`:85`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/about/dh-programme.md#L85), [`first-sanskrit-sentence.mdx:142`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/users/first-sanskrit-sentence.mdx#L142), [`data-cards.md:168`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/developers/data-cards.md#L168).

**The headline percentages are correct** — the slice's token share is 77.0025 % → "77.0 %", top-100 is 35.2876 % → "35.3 %", top-25 is 22.4830 % → "22.5 %" — so the *magnitude* of the error is 2 lemmas in 2,002. The defect is that the count is asserted rather than derived, and it can move whenever upstream's tie structure moves. Note also that the same page's trust block claims *"Every table and percentage on this page is computed from the committed feeds at build time — nothing is hand-typed"*, while these three figures **are** hand-typed.

**Recommended fix.** Derive the count instead of asserting it: add a `lemmasSelected` field to the feed (the true array length), have the pages print it from the feed, and either drop the literal "2,000" or make it the threshold it actually is (`rankAll <= 2000`).

### A3 — NEW (MEDIUM) — `check:pref-legend` is a 2-of-44 pilot that reports a repo-wide OK

`scripts/pref_legend_parity.py:29` is `PILOT_DICTS = ("PWG", "PW")`, and line 300 defaults to exactly those two. The abbreviations feed carries **44** dictionaries (`src/data/abbreviations.json` → `dicts` has 44 entries). The gate therefore verifies **2 of 44** and prints:

```
{"dict": "PWG", "legend_n": 395, "cross_n": 395, "cross_nonshort": 390, "missing_nonshort": 0, "ok": true}
{"dict": "PW",  "legend_n": 302, "cross_n": 302, "cross_nonshort": 298, "missing_nonshort": 0, "ok": true}
pref_legend_parity --check OK
```

`OK` with no scope marker, on a package script named `check:pref-legend` — a repo-wide-sounding name. The *data* file is honest about its scope (`src/data/pref-legends.json` carries a `pilot: [2]` key); the *gate* is not. A reader who runs it will take "OK" as repo-wide.

This gate is also the one place in the repo where a pilot could be widened safely: the legend and crosscheck feeds for the other 42 dictionaries already exist under `scripts/out/`, so the coverage gap is a coverage decision, not a data-availability one.

**Recommended fix.** Print the scope in the verdict line (`OK (pilot: 2 of 44 dictionaries)`), rename the script to say `pilot`, and either widen it or state the pilot bound in the package-script name.

### A4 — NEW (MEDIUM) — three of the four drift gates are wired to nothing, and two of them *cannot* be wired to GitHub CI as they stand

Census of every gate that can prove "committed == reproducible" against the upstream it claims to vendor:

| gate | verdict now | npm script | in a workflow? | needs a sibling checkout? |
|---|---|---|---|---|
| `build-ortho-query-expansions.mjs --check` | GREEN | `check:ortho-edge` | **yes** | no |
| `build-vedic-accent.mjs --check` | GREEN | — | no | yes (VisualDCS export path) |
| `build-pwg-sense-order.mjs --check` | GREEN | — | no | yes (`../csl-atlas`) |
| `build-corpus-frequency.mjs --check` | **RED** (A1) | — | no | yes (`../kosha`) |
| `pref_legend_parity.py --check` | GREEN | `check:pref-legend` | no | no |
| `build-atlas-viz.mjs` / `build-heritage-coverage.mjs` | no `--check` at all (PR #221 F3) | — | — | yes |

Two things follow, and the second corrects PR #221's own fix sketch for F2.

1. **Only one of the four SHA-256 edge contracts is wired into CI.** The other three are wired to nothing — not to a workflow, not to `.pre-commit-config.yaml` (which runs only yaml/eof/whitespace/merge-conflict/ruff), and, for two of them, not even to an npm script. PR #221 noted this for `corpus-frequency`; it holds for `vedic-accent` and `pwg-sense-order` too, and for `check:pref-legend`.

2. **PR #221's prescription for F2 — "add … one `run:` step in `ci.yml` next to `check:ortho-edge`" — would turn CI red.** `build-corpus-frequency.mjs --check` exits 1 without the sibling checkout. Simulated with a checkout that has no `../kosha`:

   ```
   $ node scripts/build-corpus-frequency.mjs --check     # in a checkout with no sibling kosha
   Cannot read …/kosha/data/frequency/lemma_frequency.tsv.
   This script needs the sibling kosha checkout … The committed src/data/corpus-frequency.json remains valid without it.
   exit=1
   ```

   `build-pwg-sense-order.mjs --check` fails the same way (`ENOENT … /csl-atlas/data/pd/pd_sense_order_compare_summary.json`, exit 1). GitHub Actions checks out *this* repo only. So these contracts **cannot** run in GitHub CI as written — they belong to the estate's local/nightly lane, where the siblings exist, and the right wiring there is an npm script plus a scheduled/local gate runner, not a `ci.yml` step. `check:ortho-edge` works in CI precisely because it needs no sibling.

   **Resolved 20-10-2026 (PR #225).** `check:pref-legend` joined `ci.yml`. The five sibling-dependent gates now have the runner this finding asked for: `scripts/check-contracts.mjs` (`npm run check:contracts`) runs every gate, resolves siblings through `ATLAS_ROOT` / `SANSKRITLEX_ROOT` / `KOSHA_ROOT` / `VISUALDCS_ROOT`, and `scripts/launchd/` arms a weekly lane that runs it against a throwaway detached worktree of `origin/main`. SKIP is its own exit code (2) and never counts as green — a gate that cannot run proves nothing.

### A5 — F1 is FIXED — and the root cause was the `.gitignore` scratch rule, not a forgotten `git add`

PR #221 reported that `scripts/_quiz-options.mjs` *"exists nowhere in git history"*, and recommended restoring it *"from H313 rather than re-inventing the ordering rule"*. Both halves of that were harder than they looked, and both are now settled.

**The rule is recoverable — from the H1387 record, not from H313.** The H313 handoff does not contain the helper's code, and no copy of the file survives in any clone, any git object, or any public repo (GitHub code search for `filename:_quiz-options.mjs` returns nothing). What does survive is the H1387 handoff's own description of the algorithm: *"Indices are canonicalized by option text before being permuted by a mulberry32 PRNG seeded (FNV-1a) on the question id."* Reconstructing that rule and testing it against the committed data is a falsifiable claim, and it holds exactly:

| proof | result |
|---|---|
| `npm run build:level-quiz` | regenerates `src/data/level-quiz.json` **byte-identically** to the committed file |
| `npm run check:quiz-positions` | 52 option lists across 7 banks, **0 reordered, 0 files would change** |
| `npm run verify:quiz-positions` | 52 answers, spread `0:19 1:9 2:10 3:14` — unchanged |

The byte-identical regeneration is the strong one: the generator applies `canonicalOrder` to *hand-authored* options and writes the result, so reproducing the committed file bit-for-bit pins the permutation, the text-canonicalisation step, the PRNG, the shuffle direction, the float-vs-modulo pick and the key format simultaneously. **No published quiz data changes** — which is exactly the condition PR #221 set for a safe fix ("a new rule silently re-orders committed banks, which is a data decision"). This is not a new rule.

**The root cause is the ignore rule, and it is now fixed too.** `.gitignore` has carried `scripts/_*.mjs` since `eacd37e` (25-06-2026), added for "one-off scratch harnesses (e.g. `_css-compare.mjs`)". The rule predates the file (H313, 09-07-2026, wrote the helper; H1387, 20-07-2026, added the normalizer that imports it) and **silently swallowed it** — no `scripts/_*.mjs` was ever tracked, and the helper existed only in the authoring session's working tree. So "never committed" was never a forgotten `git add`; the file was *uncommittable*. The fix adds a `!scripts/_quiz-options.mjs` negation, so the scratch pattern can no longer hide an imported module, plus a CI step for `check:quiz-positions` so the remedy itself cannot rot unnoticed again.

Landed as [PR #222](https://github.com/sanskrit-lexicon/csl-guides/pull/222) — merged `e175109`.

### Verified clean in this pass

- **Site build green** — `npm run build` → `[SUCCESS] Generated static files`, exit 0, on the fix branch and on `origin/main` @ `f0373d1`.
- **`npm run verify:quiz-positions`** — 52 answers across 7 banks, spread `0:19 1:9 2:10 3:14`; **`npm run check:quiz-positions`** — 0 reordered, 0 files changed.
- **`npm run verify:sanitizer`** — all hostile fixtures defused, legit Cologne markup preserved.
- **`npm run check:ortho-edge`** — vendored `9c3bc9c2…` (de) / `9b6835b8…` (ru) match their pins.
- **`node scripts/verify-ortho-query.mjs --bundle build`** — GREEN end-to-end against the production bundle (the real CI invocation).
- **`python3 scripts/pref_legend_parity.py --check`** — PWG 395/395, PW 302/302, 0 missing.
- **`node scripts/verify-atlas-viz.mjs`** — cannot run locally: the Playwright chromium headless shell is not installed on this machine (`Executable doesn't exist at …/chrome-headless-shell`). This is an environment gap, not a repo defect — CI installs it (`npx playwright install --with-deps chromium`) and the job is green there.
- **PWG sense-order page numbers re-audited against the feed** — the hard-coded prose figures (τ = +0.32, +265 y drift, 40 % not-forward, 54.8 % forward) all reconcile with `src/data/pwg-sense-order.json`; the verdict table's `clearsFloor` values are consistent with the rule as stated (PD beats a dictionary by Δτ ≥ 0.10).
- **PWG sense-order drift gate green** — `node scripts/build-pwg-sense-order.mjs --check` → reproduces from the atlas artifact.
- **No other `scripts/_*.mjs` is imported by tracked code** — the ignore-rule hazard (A5) is currently confined to the one helper. An estate-wide scan of every `.gitignore` under `~/Documents/GitHub/` found no other repo with the same glob: the near neighbours are narrower (`claude-config` negates `!/scripts/_msk.py`; `CommentaryStrategies` ignores the single path `scripts/_rebuild_summary.json`), and the rest match only `scripts/__pycache__/`.

_Elapsed: ~34 min for the second pass (independent hunt, verification, the F1 recovery and fix, and this addendum)._

## Status — A1 landed 20.10.2026

A1 is fixed in this PR. The pin is now the **LF-normalised** upstream hash (`c07f6a02…`, replacing the CRLF `3d54e4db…` that no upstream commit ever carried), via a shared [`scripts/edge-hash.mjs`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/edge-hash.mjs); the committed payload does not move (rebuild diff: `lemmas` and `stats` identical, only `generatedAt` would change). Verified: green on both the LF upstream and a CRLF copy of the same file, red on a one-byte tamper. `build-vedic-accent.mjs` deliberately keeps its raw-byte pin — its source is a `.gz`, so there is no line-ending form to normalise; that exception is now documented in the script and the data card. `build-pwg-sense-order.mjs` is not on `origin/main` yet (it rides the unpushed H7116 commits); when it lands it should call `sha256Lf` too.

