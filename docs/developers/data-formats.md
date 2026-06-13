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
- **Headwords**: carry `key`/`key1` fields in SLP1.

## Generated XML

The build produces XML per dictionary. Representative tags:

| Tag | Meaning |
|---|---|
| `<H1>` … | Entry / record wrapper `TODO(verify)` exact entry element names |
| `<h>`, `<key1>`, `<key2>` | Headword and its keys |
| `<body>` | Entry body |
| `<ls>` | Literary-source citation (link target) |
| `<lex>` | Lexical/grammatical category |
| `<ab>` | Abbreviation |

`TODO(verify)`: include the authoritative element list and a full annotated example
record. The dictionary-specific schema variations should be noted per dictionary.

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
