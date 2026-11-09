# H7931 — GitHub's social card vs our shipped v3 card

_Created: 09-11-2026 · Last updated: 09-11-2026_

Both cards are the real thing, committed next to this file:

| Evidence | File | Provenance |
|---|---|---|
| GitHub's card for `sanskrit-lexicon/csl-guides` | [`github-card-csl-guides.png`](github-card-csl-guides.png) | `og:image` read off the live repo page (the URL's hash segment is a cache-buster; the card content is keyed by repo), fetched 09-11-2026. 1200×600, PNG. |
| Our shipped v3 card, live data | [`v3-live-mw.png`](v3-live-mw.png) | Rendered 09-11-2026 by the **production** renderer `plugins/og-cards/renderCard.js`, unchanged, with `plugins/og-cards/index.js#siteStats()`'s derivation at this commit: 45 dictionaries (committed feed) · 112 guides · 29 posts. Page: `docs/dictionaries/mw.mdx`. |

The GitHub card is the **repository** card (what a link to the repo unfurls as).
Our v3 card is the **per-page** card for the Monier-Williams guide. That
difference is itself row 1: they answer different questions.

## Comparison table

| # | Axis | GitHub card | Our v3 card | Concrete difference |
|---|---|---|---|---|
| 1 | What it identifies | `sanskrit-lexicon/csl-guides` — the repository | `Monier-Williams (MW)` — the page, under the brand line | repo identity vs page identity |
| 2 | Description | The repo's About text: *"Docusaurus documentation/guides for the Cologne Digital Sanskrit Dictionaries (sanskrit-lexicon.uni-koeln.de)"* — 3 lines, sans-serif, grey | The page's `description:` frontmatter: *"Guide to the Monier-Williams Sanskrit–English Dictionary (1899) on CDSL — the standard general reference…"* — clamped to 2 lines, serif, muted | same site, different text register: repo tagline vs page summary |
| 3 | Numbers stated | **4 activity counts**: Contributors 3 · Issues 2 · Stars 0 · Forks 0 | **3 inventory counts**: 45 dictionaries · 112 guides · 29 posts | neither card states a dictionary fact (year, pages, entries) |
| 4 | Dictionary year | absent | absent — and MG has asked for it | v4 adds `1899`; GitHub cannot (it has no year field) |
| 5 | Pages / entries | absent | absent | v4 adds `1,333 pages · 286,525 entries` from the feeds |
| 6 | Licence | not printed (the repo API reports CC-BY-SA-4.0; the card omits it) | not printed | parity: neither card carries licence text |
| 7 | Mark | The organisation avatar — black **Om** on white, ~150×150, unframed | The site mark — **सं** in a brown rounded square, 100×100 | different symbols, different framing (bare avatar vs contained tile) |
| 8 | Attribution | owner name `sanskrit-lexicon` is inside the repo name | brand line `COLOGNE DIGITAL SANSKRIT DICTIONARIES` at top left | owner slug vs human-readable brand |
| 9 | Footer content | icon + number + label per stat, one row, four stats, bottom-left; octocat mark bottom-right | number over a small-caps label per stat, three stats, no icons; no right-hand mark | icon row vs typographic stat columns |
| 10 | Canvas | 1200×600 (aspect 2.00) | 1200×630 (aspect 1.905) | 30px taller; both above the 1.91:1 social minimum |
| 11 | Composition | title block left, avatar right; description under the title; stats row at the bottom; no rule, no kicker | brand line + section kicker, saffron rule, title left, mark right, description under the title, stats at the bottom | near-identical skeleton; v3 adds the rule + kickers |
| 12 | Type | system sans-serif, bold repo name, regular owner, grey 26–28px description | Charis SIL serif, 60px title, 26px description, letterspaced small caps | serif/sans split is the strongest visual difference |
| 13 | Ground | white | ivory `#FBF7EC` | warm paper vs neutral white |
| 14 | Accent | none in the text; a full-bleed multicolour bar (yellow/blue/purple/dark red) along the bottom edge | saffron `#D9A441` rule under the brand line + a full-bleed three-colour bar (saffron/bronze/sand) along the bottom edge | both use a bottom strip as the one colour gesture — v3's is a brand palette, GitHub's is a language/contribution ribbon |
| 15 | Section/category | none | `DICTIONARIES` kicker, upper right, saffron | v3 tells the reader which part of the site they are in |
| 16 | Activity / recency | live repo activity (contributors, issues, stars, forks) | none — counts are derived from committed feeds at build time | GitHub's numbers move; ours are pinned to a commit and checkable |
| 17 | Data honesty | stars/forks are live API facts; no denominators needed | 45/112/29 are counts of the committed catalogue, the docs tree and `blog/` | both countable, but v3's `29 posts` is the one MG judged noise (row 18) |
| 18 | The disliked stat | n/a | **`29 posts`** — to be removed in v4 | MG input, 09-11-2026 |

## What the comparison settles

1. **The skeleton is already right.** Both cards put identity top-left, a mark
   top-right, a description under the identity and counts at the bottom. v4
   does not need a new composition to add data — it needs a better bottom row.
2. **GitHub's card proves that counts on a card work when they are facts about
   the thing being linked.** Its four counts are about the repo; our three
   counts are about the site, not about the dictionary the page describes.
   That is exactly the defect MG named when he cut `29 posts`: the row answered
   a question nobody asked.
3. **The bottom strip is a shared device, not a differentiator.** Both cards
   use one; v4 keeps ours (brand palette) and spends the vertical space on a
   data row instead.
4. **GitHub omits licence, language and dates on this repo's card** (the repo
   has no detected language; the licence is not printed). Anything we add must
   earn its place on content, not on parity.
