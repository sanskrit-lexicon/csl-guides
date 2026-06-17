---
id: data-formats
title: Data Formats
description: "The three representations a CDSL dictionary moves through — csl-orig source text, generated XML, and display HTML."
sidebar_label: Data Formats
---

# Data Formats

A dictionary moves through three representations: the **source text** in `csl-orig`
(hand-corrected), the **generated XML** (validated, downloadable), and several **derived
formats** (SQLite, JSON, StarDict) built for search and offline use. This page describes
each.

## Source text

Each dictionary's canonical source is a single UTF-8 plain-text file at
`csl-orig/v02/{dict}/{dict}.txt`. It is a **line-oriented** format (the change-file
workflow addresses lines by number — see **[Change Files](../contributing/change-files)**),
with one record per entry wrapped in markup.

- **Encoding**: UTF-8, **no BOM**. Sanskrit is stored in **SLP1**.

Each record runs from an `<L>` line to a `<LEND>` line. Example (Monier-Williams,
[`csl-orig/v02/mw/mw.txt`](https://github.com/sanskrit-lexicon/csl-orig/blob/master/v02/mw/mw.txt)):

```
<L>2<pc>1,1<k1>akAra<k2>a—kAra<e>3
<s>a—kAra</s> ¦ <lex>m.</lex> the letter or sound <s>a</s>.<info lex="m"/>
<LEND>
```

The `<L>` number is the record's **`lnum`** — its stable id, used by the API and
permalinks. It may be fractional (`1`, `1.1`, `144239.1`) when an entry is split or carries
homonyms. The broken bar `¦` separates the headword zone from the entry body.

### Markup tag set

| Tag | Meaning |
|---|---|
| `<L>` … `<LEND>` | Record start (carries the `lnum`) and end |
| `<pc>` | Page-column reference in the print (e.g. `1,1`; German dicts use `vol-page`, e.g. `1-0015`) |
| `<k1>`, `<k2>` | Headword keys in SLP1 — `k1` plain, `k2` with hyphenation/compound markers |
| `<h>` | Homonym number; `<hom>` is its display label |
| `<e>` | Entry/format code used in web link generation |
| `<s>`, `<s1>` | Sanskrit spans (`<s1>` for proper nouns), rendered from SLP1 to the chosen scheme |
| `<lex>` | Lexical / grammatical category (`m.`, `f.`, `adj.`, …) |
| `<ab>` | Abbreviation (optional `n=` gives the expansion id) |
| `<ls>` | Literary-source citation (a link target) |
| `<is>` | Sanskrit term set inside a non-English gloss (IAST) |
| `<div n="…">` | Numbered or typed sense division |
| `<lang n="…">`, `<gk>` | Foreign-script spans (e.g. Greek, Latin) |
| `<bot>` | Botanical / scientific name |
| `<info>` | Structured metadata as attributes (e.g. `lex="m"`, `verb=…`) |

:::note Brace conventions in the German and Apte sources
The angle-bracket tags above are the common structural layer. The German dictionaries
(PWG, PW, GRA) and Apte (AP90) additionally use **brace conventions** inside the body:
`{#…#}` = Sanskrit (SLP1), `{%…%}` = gloss text (German/Latin/italic), `{@…@}` = bold.
So a PWG body reads `{#a/kzata#}¦ … {%unverletzt%} <ls>ṚV. 5,78,9.</ls>`. Markup details
vary by dictionary; the per-dictionary conventions are described on the
[csl-doc](https://github.com/sanskrit-lexicon/csl-doc) pages (e.g. the "Marking Monier"
notes for MW).
:::

## Generated XML

The build (see **[Generation Pipeline](generation-pipeline)**) wraps these records into a
per-dictionary XML document and validates it against a generated DTD
([`one.dtd`](https://github.com/sanskrit-lexicon/csl-pywork/blob/master/v02/makotemplates/pywork/one.dtd)).
The structure:

```xml
<mw>                         <!-- root element = the dict code -->
  <H1>                       <!-- one record (MW/AP use H1–H4 for homonym depth) -->
    <h><key1>akAra</key1><key2>a—kAra</key2></h>
    <body><s>a—kAra</s> ¦ <lex>m.</lex> the letter or sound <s>a</s>.</body>
    <tail><L>2</L><pc>1,1</pc><info lex="m"/></tail>
  </H1>
  …
</mw>
```

`<h>` holds the headword keys (and `<hom>` if present), `<body>` the rendered entry, and
`<tail>` the bookkeeping (`<L>` lnum, `<pc>` page-column, `<info>` metadata). The
downloadable XML keeps headwords in SLP1 and preserves the `<ls>`/`<lex>`/`<ab>` markup for
display and linking. Validity is **gating** — nothing reaches `csl-orig` until the XML
parses (the pipeline's "All records parsed by ET" signal).

## Transliteration

SLP1 is the storage encoding; conversions to IAST, Harvard-Kyoto, Devanāgarī, ITRANS, etc.
are applied during generation and lookup by a shared transcoder. See
**[Encoding & Transliteration](../users/encoding-transliteration)** for the user-facing
view and the scheme table.

## Derived & downloadable formats

| Format | What it is | Where to get it |
|---|---|---|
| **XML (SLP1)** | The structured dictionary above | per-dict `download.html`; see [Downloads & Data](../users/downloads-and-data) |
| **SQLite** | The search databases the site queries (one `.sqlite` per dictionary, plus `*ab`/`*auth` side tables) | [`csl-sqlite`](https://github.com/sanskrit-lexicon/csl-sqlite) GitHub **Releases** (timestamped) |
| **JSON** | A compact `{words, text}` shape: `words` maps a headword to its record ids, `text` maps an id to `[body, pc, lnum]` | [`csl-json`](https://github.com/sanskrit-lexicon/csl-json) |
| **StarDict** | Offline dictionary packages, via an intermediate Babylon export | [`cologne-stardict`](https://github.com/sanskrit-lexicon/cologne-stardict); see [Offline / StarDict](../tools/offline-stardict) |
| **PDF / scans** | Typeset rendering and original print pages | per-dict scan index |

:::tip Interoperability model
For cross-dictionary tooling, [`csl-standards`](https://github.com/sanskrit-lexicon/csl-standards)
defines a neutral JSON exchange layer
([`docs/INTEROPERABILITY_MODEL.md`](https://github.com/sanskrit-lexicon/csl-standards/blob/master/docs/INTEROPERABILITY_MODEL.md))
that keys an entry across dictionaries and carries `forms`, `senses`, `citations`, and
`relations` — the basis for the CDSL-to-TEI and CDSL-to-OntoLex conversions.
:::

See **[Downloads & Data](../users/downloads-and-data)** for the per-dictionary download links.
