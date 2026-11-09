# CONTEXT.md — csl-guides vocabulary of record

_Created: 09-11-2026 · Last updated: 09-11-2026_

The words this site uses about dictionaries, and the exact feed field behind
each one. Written for the H7931 OG-card v4 session; it is the vocabulary the
card, the guides and the ADR share. When a number is printed anywhere, it names
its source field and its denominator.

## Dictionary year

The publication year of the **printed edition** the CDSL digitises — not the
year of digitisation, not the year the guide page was written.

- Source: `src/data/dictionaries.json` → `groups[].items[].year`
- Coverage: **45/45** catalogued dictionaries carry a year
- Span: **1832** (Wilson, WIL) – **1993** (MCI)
- Format: four digits, no thousands separator. A year is never comma-formatted
  (`1899`, never `1,899`).

## Pages

The **printed-edition page count** of the dictionary — not web pages, not a
page count of the guide.

- Source: `src/data/dictionaries.json` → `groups[].items[].pages` (a string)
- Coverage: **43/45** rows carry a numeric value; **PWG** and **ARMH** carry
  `null`, so a total or a comparison must state the denominator
  (`45,603 pages across 43 of 45 dictionaries`).
- Total over the rows that carry one: **45,603**

## Entries

The count of **dictionary entries** in the csl-atlas OBS headword extract.
It is a record count from the atlas, not a count of headwords in the printed
book and not a count of senses.

- Source: `src/data/atlas-extract.json` → `dicts[<lower-case code>].entries`
- Coverage: **44** atlas rows. The join to the catalog is
  `code.toLowerCase()`: **43 of 45** catalogued dictionaries join (**PD** and
  **NYBJ** have no atlas row); the atlas additionally carries **pwkvn**, which
  is not catalogued. Every aggregate states which denominator it uses:
  `1,496,157 entries across 44 dictionaries` for the atlas whole, and
  `286,525 entries` for MW.
- Companion fields: `distinctLemmas`, `uniqueToDict`, `uniquePct`, `ls`
  (citation registers).

## Card data row

The single bibliographic line a v4 card prints for a dictionary page:

```
<year> · <pages> pages · <entries> entries
```

Resolved per page from the two feeds above; a field whose source is missing is
**omitted**, never guessed (`PWG · 720,203 entries`, no pages clause). The row
is per dictionary. The home card carries the site aggregate instead
(`45 dictionaries · 1832–1993`), and a non-dictionary guide page carries no
stat row at all.

**Posts are never a card stat** (MG, 09-11-2026). The blog post count was a v3
footer column; v4 removes it.

## Language group

One of the catalog's **7** top-level groups. Source:
`src/data/dictionaries.json` → `groups[].name`; a dictionary belongs to exactly
one.

| Group | Dictionaries |
|---|---|
| Sanskrit-English | 14 |
| English-Sanskrit | 3 |
| Sanskrit-French | 2 |
| Sanskrit-German | 5 |
| Sanskrit-Latin | 1 |
| Sanskrit-Sanskrit | 8 |
| Specialized | 12 |

## Digitisation flags

Site-wide catalog facts, each with its own denominator over the **45**
catalogued dictionaries:

| Flag | Source field | Value |
|---|---|---|
| fully digitised | `fullyDigitized` | 44/45 |
| documented in csl-doc | `documentedInCslDoc` | 38/45 |
| with csl-orig source | `withCslOrigSource` | 44/45 |

Per dictionary they are derivable (`actions.basic`, `cslDocUrl`, `cslOrigUrl`),
and the per-dictionary form is what a badge on a dictionary card must read.

## Card layout vocabulary

- **Library label** — title + one bibliographic line under it; v3's composition
  with the row added.
- **Scale card** — the entry count as the hero number, with a comparison bar
  against the atlas total and the denominator printed.
- **Timeline card** — the edition year placed on the catalog's real
  1832–1993 span.
- **Atlas card** — group kicker + digitisation badges; the product promise
  rather than another count of words.
- **Data row** — see above; one rendered line, never hand-typed.
- **Section kicker** — the saffron upper-right label (`DICTIONARIES`, `NEWS`,
  `TOOLS`, …) derived from the route's first path segment.

## Where the words are enforced

- `plugins/og-cards/` — the production renderer (v3; untouched by H7931).
- `scripts/og-card-v4/card-data.mjs` — the resolved data object for a v4 card;
  `render-layouts.mjs` prints only its fields.
- `docs/internal/adr/0001-og-card-v4-layout.md` — the layout decision.
