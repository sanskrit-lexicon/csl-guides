# ADR 0001 — OG card v4 uses the library-label layout

_Created: 09-11-2026 · Last updated: 09-11-2026_

- **Status:** Proposed (H7931 prototype; the production renderer is unchanged and
  the implementation is a follow-up unit)
- **Context:** OG card v3 (per-page, 1200×630, H7886/H7903/H7906) prints a title,
  a description, a section kicker and a footer count row
  `45 dictionaries · 112 guides · 29 posts`. MG's design input for v4
  (09-11-2026): the `29 posts` stat is disliked and must go; the dictionary's
  **year**, **pages** and **entries** must be added; propose what else earns a
  place on a 1200×630 card.
- **Evidence:** `docs/internal/evidence/H7931/` — GitHub-vs-v3 comparison
  (`GITHUB_VS_V3.md`), grill record (`GRILL_ROUNDS.md`), four rendered layouts
  (`LAYOUTS.md`), the resolved data object (`card-data.json`), and the scripts
  under `scripts/og-card-v4/`.

## Decision

Implement v4 as the **library label** (Layout A): the v3 composition with the
description kept and one bibliographic line under the title —

```
1899 · 1,333 pages · 286,525 entries
```

— resolved per page from `src/data/dictionaries.json` and
`src/data/atlas-extract.json`, with `29 posts` removed and no other count row.
The home card carries the site aggregate (`45 dictionaries · 1832–1993`);
non-dictionary guide pages carry no stat row.

## Why A and not the other three

- **A is the only layout that fits every page type.** The card is per-page: a
  dictionary page gets the row, a guide/news/tool page has no dictionary row at
  all, and the home card gets the aggregate. B (hero entries), C (timeline) and
  D (atlas badges) only make sense on a dictionary page; shipping one of them
  would either force a new branch for the other ~160 pages or leave those pages
  with a layout that has nothing to say.
- **A states the three asked fields at equal weight without inventing a
  hierarchy.** The three values are all verifiable from the feeds; none is
  promoted above the title, so the card still reads as a page identifier first.
- **A keeps the v3 identity.** Ivory ground, Charis SIL, saffron rule, सं mark
  and the accent strip are unchanged, so the pixel gate
  (`scripts/fixtures/og-cards/golden-card.png`) and the site's visual language
  move together in one implementation step.

## What it costs and what it loses

- **Cost:** the implementation is a small renderer change (one extra line in
  `renderCard.js`, the data resolution in the plugin) plus a golden-card
  rewrite (`node scripts/check-og-cards.mjs --write-golden`) and a new pixel
  diff in the PR.
- **Loss:** the entry count is not loud. The scale story (B: 286,525 entries is
  19.2% of the atlas), the historical placement (C: 1899 on 1832–1993) and the
  digitisation promise (D: 44/45 fully digitised, 38/45 documented, 44/45 with
  source) are all sacrificed for legibility and page-type coverage. The atlas
  page and the dictionary deep pages are the right places for those stories;
  a social card is an identifier, not a dashboard.

## Alternatives considered

| Layout | Attraction | Rejection reason |
|---|---|---|
| B — scale hero | the number is the hook; the bar makes it honest | dictionary-only; suppresses the title; needs a denominator the reader did not ask for |
| C — timeline | places the edition in the library's history | dictionary-only; the year alone is not a hook; consumes the vertical space the title needs |
| D — atlas badges | states the digital product promise | dictionary-only; badge-soup risk at 630px; the flags are site-wide facts on a per-page card |

## Consequences

- The v4 data model is `scripts/og-card-v4/card-data.mjs`; every number on a
  card comes from it, and a missing source field degrades to omission.
- Production files (`plugins/og-cards/*`, `deploy.yml`, the golden fixture) are
  untouched by H7931; the implementation unit owns them and must re-baseline
  the golden card in the same PR.
- The `29 posts` column must not return: it is not in the v4 data model, and
  the data menu records the cut verdict.
