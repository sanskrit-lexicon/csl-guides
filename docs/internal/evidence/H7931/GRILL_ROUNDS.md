# H7931 — grill rounds: the OG card v4 design tree

_Created: 09-11-2026 · Last updated: 09-11-2026_

An unattended grill record for the per-page OG card. Rounds were run in order;
no pixel was drawn before Round 1 closed (the stop-budget rule). Each question
carries the recommended answer it was asked with, the evidence that settled it,
and its verdict. The frontier is empty at the end of Round 5.

**Inputs already settled by MG (09-11-2026, not re-litigated):** the `29 posts`
stat is removed; the dictionary's year (or year span), pages and entries are
added; the data menu beyond those three is proposed with a source and a
keep/cut verdict per field.

---

## Round 1 — What data earns a place on a 1200×630 card?

Tree node: `data model`. The question set below is the whole candidate frontier
from the handoff, plus two candidates the feeds suggested.

| # | Question | Recommended answer | Evidence | Verdict |
|---|---|---|---|---|
| 1.1 | Does the card print the blog post count? | No — remove it | MG input; 29 posts is not dictionary data | **cut** (settled) |
| 1.2 | Does the card print the dictionary year? | Yes — four digits, no thousands separator | `dictionaries.json` `year`, 45/45, span 1832–1993 | **keep** (settled) |
| 1.3 | Does the card print pages? | Yes, with the field's own coverage | `pages`, 43/45 numeric, total 45,603; PWG/ARMH null | **keep** (settled) |
| 1.4 | What does "entries" mean and where does it come from? | The csl-atlas OBS entry count, joined on lower-case code | `atlas-extract.json` `dicts[code].entries`, 44 rows; 43/45 catalog rows join (PD, NYBJ absent; pwkvn uncatalogued) | **keep** (settled) |
| 1.5 | Does a per-dictionary card print the site's guide count (v3's `112 guides`)? | No — same failure class as `29 posts` | it says nothing about the dictionary | **cut** (settled) |
| 1.6 | Does a per-dictionary card print the digitisation flags? | Not in the recommended layout; badges only in the atlas experiment | flags 44/45 · 38/45 · 44/45 are site-wide facts on a per-page card | **cut from A**, tested in D |
| 1.7 | Does the card print the language group? | Not in the recommended layout; tested in D | 7 groups, group sizes 14/3/2/5/1/8/12 | **cut from A**, tested in D |
| 1.8 | Does the card print scan/download availability? | No | `actions`: scanJpg 5/45, scanPdf 2/45 — almost always absent, and a binary product feature, not a social hook | **cut** (settled) |
| 1.9 | Does the card print corpus attestation (citation registers, `ls`)? | No | `atlas-extract.json` `ls`/`lsWithLocator` exists for 44 rows, but it is a technical measure that needs a denominator | **cut** (settled) |
| 1.10 | Does the card print a last-verified date? | No — there is no page-level source | the only date in the feeds is `generatedAt`, the build date; printing it as "verified" would be a false claim | **cut** (settled: no source, stop-budget rule) |
| 1.11 | Does the home card print a site aggregate? | Yes — `45 dictionaries · 1832–1993` | `totalRows`, year span 45/45 | **keep on home** (settled) |
| 1.12 | Does the home card print total pages / total entries? | No; entries may be a denominator in the scale experiment | pages total covers 43/45; entries total covers 44 atlas rows against 45 catalog rows | **cut** (settled) |

Frontier after Round 1: empty. The data model is the resolved object in
`scripts/og-card-v4/card-data.mjs` — every number the renderer can print is a
field there, and no card script types a number.

## Round 2 — What is loudest? (composition)

Tree node: `composition`. Four candidate compositions were named in the
handoff; each was rendered (see `LAYOUTS.md`).

| # | Question | Recommended answer | Verdict |
|---|---|---|---|
| 2.1 | Where does the data row sit in the recommended layout? | Under the title, after the description, as one line with a saffron lead-in rule | **settled** — Layout A |
| 2.2 | Is the entry count the hero number? | Not in A; tested as B | **settled** — B is the scale experiment, not the base |
| 2.3 | Is the year placed on the catalog's span? | Tested as C | **settled** — C is the timeline experiment |
| 2.4 | Are the digitisation flags the card's content? | Tested as D | **settled** — D is the atlas experiment |
| 2.5 | What do the four layouts have in common? | Brand kicker, section kicker, सं mark, saffron rule, ivory ground, 3-colour bottom strip, 1200×630 | **settled** — identity is shared; only composition differs |
| 2.6 | Does the description survive in A? | Yes, clamped to two lines at a sentence/clause/word boundary (the v3 rule) | **settled** |

Frontier after Round 2: empty. Four distinct compositions exist; the base is A.

## Round 3 — Which page types does the card serve?

Tree node: `scope`.

| # | Question | Recommended answer | Verdict |
|---|---|---|---|
| 3.1 | Does every page get the dictionary data row? | No — only dictionary pages have year/pages/entries | **settled** |
| 3.2 | What does a non-dictionary guide page show? | Title + description + section kicker; no stat row | **settled** |
| 3.3 | What does the home page show? | Brand title + site aggregate (`45 dictionaries · 1832–1993`), not a dictionary row | **settled** |
| 3.4 | Does a dictionary page with a missing atlas row print entries? | No — omit the clause; never guess | **settled** (PD, NYBJ) |
| 3.5 | Does a dictionary page with missing pages print pages? | No — omit the clause | **settled** (PWG, ARMH) |

Frontier after Round 3: empty.

## Round 4 — Denominators and honesty

Tree node: `honesty`. Every aggregate names its denominator; every per-dictionary
value names its dictionary.

| # | Question | Recommended answer | Verdict |
|---|---|---|---|
| 4.1 | `286,525 entries` — of what? | Of MW's atlas record count; the comparison bar prints `of 1,496,157 entries across 44 dictionaries` and `19.2% of the atlas` | **settled** |
| 4.2 | `45,603 pages` — of what? | 43 of 45 rows carry a numeric page count; the total is never printed without that clause | **settled** |
| 4.3 | `1832–1993` — of what? | The catalog's 45/45 year field; the timeline endpoints say `catalogue span` | **settled** |
| 4.4 | Is `1,899` a valid year rendering? | No — years are never thousands-separated | **settled** (caught in review, fixed in D) |
| 4.5 | Does a card ever claim "last verified"? | No — no page-level field exists | **settled** |

Frontier after Round 4: empty.

## Round 5 — Visual language and the production boundary

Tree node: `delivery`.

| # | Question | Recommended answer | Verdict |
|---|---|---|---|
| 5.1 | New palette? | No — v3 ivory/ink/saffron/bronze/sand, Charis SIL, vendored OFL fonts | **settled** |
| 5.2 | New mark? | No — the committed `static/img/logo-mark.png` (the SVG's Devanagari text is the H7886 tofu trap) | **settled** |
| 5.3 | Edit the production renderer? | No — `plugins/og-cards/*`, `deploy.yml` and the golden fixture stay untouched; the pixel gate stays green | **settled** |
| 5.4 | Where does the implementation happen? | A follow-up unit: one line in `renderCard.js`, the data resolution in the plugin, a re-baselined golden card in the same PR | **settled** |
| 5.5 | What is recommended for implementation? | Layout A, with the cost and loss stated in the ADR | **settled (recommendation, not a human decision)** |

Frontier after Round 5: **empty**.

---

## Decisions ledger

| ID | Decision | Basis |
|---|---|---|
| D1 | Remove `29 posts` from every card | MG input |
| D2 | Add year, pages, entries | MG input |
| D3 | Cards print per-page dictionary data, not site-wide counts, except the home card | Rounds 1, 3 |
| D4 | Missing source field ⇒ omit the clause, never invent | Stop-budget; Rounds 3, 4 |
| D5 | Every aggregate carries its denominator | Round 4 |
| D6 | Four distinct compositions rendered; A recommended | Round 2; `LAYOUTS.md` |
| D7 | Production renderer and golden fixture untouched; implementation is a follow-up | Edit scope; Round 5 |

No decision in this record is a human-only `@DECIDE`: the three design inputs
were already supplied by MG, and the layout recommendation is explicitly a
recommendation. The implementation unit may reverse it with a re-render.
