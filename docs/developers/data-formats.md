---
id: data-formats
title: Data Formats
sidebar_label: Data Formats
---

# Data Formats

## Source text

Each dictionary's canonical source is a single UTF-8 plain-text file at
`csl-orig/v02/{dict}/{dict}.txt`. It is a **line-oriented** format (the change-file
workflow addresses lines by number — see **[Change Files](../contributing/change-files)**),
with one record per entry wrapped in markup.

- **Encoding**: UTF-8, **no BOM**. Sanskrit is stored in **SLP1**.

Each record runs from an `<L>` line to a `<LEND>` line. Example (Monier-Williams,
`csl-orig/v02/mw/mw.txt`):

```
<L>2<pc>1,1<k1>akAra<k2>a—kAra<e>3
<s>a—kAra</s> ¦ <lex>m.</lex> the letter or sound <s>a</s>.<info lex="m"/>
<LEND>
```

| Tag | Meaning |
|---|---|
| `<L>` … `<LEND>` | Record start (carries the line number) and end |
| `<pc>` | Page-column reference in the print (e.g. `1,1`) |
| `<k1>`, `<k2>` | Headword keys in SLP1 — `k1` plain, `k2` with hyphenation/compound markers |
| `<h>` | Homonym number; `<hom>` is its display label |
| `<e>` | Entry extent/format code |
| `<s>`, `<s1>` | Sanskrit spans (rendered from SLP1 to the chosen display scheme) |
| `<lex>` | Lexical/grammatical category |
| `<ab>` | Abbreviation |
| `<ls>` | Literary-source citation (a link target) |
| `<info>` | Structured metadata (e.g. `lex="m"`) |

Markup details vary by dictionary; the per-dictionary conventions are described on the
[csl-doc](https://github.com/sanskrit-lexicon/csl-doc) pages (e.g. the "Marking Monier"
notes for MW).

## Generated XML

The build wraps these records into per-dictionary XML and validates it (see
**[Generation Pipeline](generation-pipeline)**). The downloadable XML keeps headwords in
SLP1 and preserves the `<ls>`/`<lex>`/`<ab>` markup for display and linking.

## Transliteration

SLP1 is the storage encoding; conversions to IAST, Harvard-Kyoto, Devanāgarī, etc. are
applied during generation and lookup. See
**[Encoding & Transliteration](../users/encoding-transliteration)** for the user-facing
view and the scheme table.

## Downloadable artifacts

| Format | Notes |
|---|---|
| XML (SLP1) | The structured dictionary |
| PDF | Typeset rendering |
| Scans (jpg/pdf) | Original print pages |
| StarDict | Offline packages |

See **[Downloads & Data](../users/downloads-and-data)**.
