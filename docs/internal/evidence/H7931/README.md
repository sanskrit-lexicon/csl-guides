# H7931 — OG card v4 evidence

_Created: 09-11-2026 · Last updated: 09-11-2026_

The per-page OG card, v4: GitHub's card compared with our shipped v3, the data
model grilled to an empty frontier, and four 1200×630 layouts rendered on real
dictionary data. **No production file changed** — `plugins/og-cards/*`,
`deploy.yml` and `scripts/fixtures/og-cards/golden-card.png` are untouched.

## Evidence map

| Deliverable | File |
|---|---|
| GitHub card vs v3 card, 18-row content + layout table | [`GITHUB_VS_V3.md`](GITHUB_VS_V3.md) |
| The actual GitHub card for `sanskrit-lexicon/csl-guides` (1200×600) | [`github-card-csl-guides.png`](github-card-csl-guides.png) |
| The live v3 card for the MW page (production renderer, current data) | [`v3-live-mw.png`](v3-live-mw.png) |
| Grill rounds, design tree, decisions ledger, empty frontier | [`GRILL_ROUNDS.md`](GRILL_ROUNDS.md) |
| Four layouts with data rows, rationale and recommendation | [`LAYOUTS.md`](LAYOUTS.md) |
| Resolved card data + PNG SHA-256 (the machine-checkable source of every number) | [`card-data.json`](card-data.json) |
| Layout A — library label | [`layout-A-library-label.png`](layout-A-library-label.png) |
| Layout B — scale | [`layout-B-scale.png`](layout-B-scale.png) |
| Layout C — timeline | [`layout-C-timeline.png`](layout-C-timeline.png) |
| Layout D — atlas | [`layout-D-atlas.png`](layout-D-atlas.png) |
| Resolved vocabulary (year, pages, entries, card data row) | [`/CONTEXT.md`](../../../../CONTEXT.md) |
| ADR — library-label layout chosen, cost and loss stated | [`docs/internal/adr/0001-og-card-v4-layout.md`](../../adr/0001-og-card-v4-layout.md) |
| Prototype renderer + data model | [`scripts/og-card-v4/`](../../../../scripts/og-card-v4/) |

## Acceptance mapping

1. **Comparison table, ≥8 rows, each evidenced.** `GITHUB_VS_V3.md` — 18 rows,
   both cards committed beside it. The GitHub card is the live `og:image`; the
   v3 card is a fresh render from the production renderer with the current
   committed feed (footer `45 dictionaries · 112 guides · 29 posts`).
2. **Grill rounds, design tree, settled decisions, empty frontier.**
   `GRILL_ROUNDS.md` — five rounds, twelve data questions, five scope
   questions, five honesty questions, five delivery questions; frontier empty.
3. **`CONTEXT.md` + one ADR.** `/CONTEXT.md` defines dictionary year, pages,
   entries and the card data row with source fields and denominators;
   `docs/internal/adr/0001-og-card-v4-layout.md` records the layout choice.
   The ADR lives under `docs/internal/` because every doc under `docs/` is
   audited as a public page by `check:best-practices` and must be
   sidebar-reachable; an agent-facing decision record is not a public guide.
4. **Four distinct layouts, 1200×630, real values.** `LAYOUTS.md` +
   four PNGs + `card-data.json`. Values: year 1899, pages 1,333, entries
   286,525 (MW); site 45 dictionaries, years 45/45 span 1832–1993, pages
   43/45 (total 45,603), 7 groups, flags 44/45 · 38/45 · 44/45, atlas 44
   dictionaries / 1,496,157 entries.
5. **`29 posts` removed.** None of the four layouts carries it; the v4 data
   model has no posts field.
6. **Data menu beyond the three asks.** `GRILL_ROUNDS.md` Round 1 — every
   candidate with source, coverage and keep/cut verdict.
7. **Each layout with its data row + one-line rationale; recommendation names
   cost and loss.** `LAYOUTS.md` §Recommendation; `ADR` repeats the trade-off.

## Own-data canary (why the numbers are read, not typed)

The first run of `card-data.mjs` reported `pagesPresent: 45` because
`Number(null) === 0` — a null `pages` was being counted as a present zero. The
handoff's expected coverage is **43/45**, so the canary caught a real
source-encoding bug: `int()` now returns `null` for `null`/empty strings, and
the re-run reports 43 present / 45,603 total. A hand-typed number would have
passed silently; a value read from the feed exposed the bug. The fix is in
`scripts/og-card-v4/card-data.mjs` and the corrected value is in
`card-data.json`.

## Re-render (verifier)

```sh
node scripts/og-card-v4/render-layouts.mjs   # 4 PNGs + card-data.json, prints SHA-256 each
node scripts/og-card-v4/render-v3-live.mjs   # the v3 comparison card
```

The script exits non-zero if a dictionary code is absent or the feeds cannot be
read. It writes only inside `docs/internal/evidence/H7931/`.

## Provenance

- GitHub card fetched 2026-11-09 from the repo page's `og:image`
  (`opengraph.githubassets.com/…/sanskrit-lexicon/csl-guides`; the hash segment
  is a cache-buster, content keyed by repo). The exact-hash URL was rate-limited
  (HTTP 429, `Retry-After: 900`) at fetch time, so an equivalent cache-buster
  hash was used; three independent hash requests returned byte-identical PNGs
  (SHA-256 `0ce2e177…`). Dimensions 1200×600 confirmed from the PNG header and
  from the page's `og:image:width`/`height` tags.
- v3 card rendered 2026-11-09 through `plugins/og-cards/renderCard.js` with
  `siteStats()`'s derivation at HEAD `19709b3`: 45 dictionaries (committed
  feed), 112 public guide pages, 29 blog posts.
- Feeds: `src/data/dictionaries.json` (generatedAt 2026-11-09, totalRows 45) and
  `src/data/atlas-extract.json` (generatedAt 2026-07-07, license CC-BY-SA-4.0,
  44 dictionaries).
