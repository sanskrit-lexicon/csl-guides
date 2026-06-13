---
id: intro
title: Cologne Digital Sanskrit Dictionaries
slug: /
sidebar_label: Home
---

# Cologne Digital Sanskrit Dictionaries

The **Cologne Digital Sanskrit Dictionaries (CDSL)** is a freely available collection
of **42 Sanskrit dictionaries** published between 1832 and 1993, digitized and served
at **[sanskrit-lexicon.uni-koeln.de](https://sanskrit-lexicon.uni-koeln.de)**. Each
dictionary is fully searchable, cross-linked, downloadable, and available alongside the
original scanned pages.

These guides cover three audiences. Use the top navigation to jump to yours:

| If you want to… | Start here |
|---|---|
| Look up words, search, read scans, download data | **[Using the Site](users/using-the-website)** |
| Know which dictionary to use and how it is cited | **[Dictionaries](dictionaries/overview)** |
| Use Simple-Search, Advanced Search, offline apps | **[Tools](tools/overview)** |
| Report or submit corrections | **[Contributing](contributing/overview)** |
| Run the build pipeline, consume data/APIs | **[Developers](developers/architecture)** |

## What CDSL provides

- **42 dictionaries** across Sanskrit→English, English→Sanskrit, Sanskrit→French,
  Sanskrit→German, Sanskrit→Latin, Sanskrit→Sanskrit, and specialized indices
  (Mahābhārata, Vedas, Purāṇas, Buddhist texts). See the **[catalog](dictionaries/catalog)**.
- **Four display modes per dictionary** — *Basic*, *List*, *Advanced*, *Mobile*
  (the **B L A M** links on the front page). See **[Search & Display](users/search-and-display)**.
- **Multiple input/output transliterations** — SLP1, IAST, Harvard-Kyoto, Devanāgarī,
  and more. See **[Encoding & Transliteration](users/encoding-transliteration)**.
- **Downloads** — XML (in SLP1), PDF, and the original **scanned editions**.
  See **[Downloads & Data](users/downloads-and-data)**.
- **Offline access** via StarDict / Android. See **[Offline & StarDict](tools/offline-stardict)**.

## How CDSL is built (in one paragraph)

The dictionaries are maintained as plain-text source files in the
[`sanskrit-lexicon`](https://github.com/sanskrit-lexicon) GitHub organization. Source
text is **never edited in place by hand** — corrections are expressed as *change files*
applied by scripts, validated as XML, and committed with an audit trail. A generation
pipeline turns the source into the XML, search indices, and web displays you see on the
live site. The **[Developer Guide](developers/architecture)** documents this end to end.

:::caution Draft
This site was scaffolded and drafted automatically from the live site, the CDSL source
repositories, and project documentation. Sections marked **Draft** and any
`TODO(verify)` notes need confirmation by a maintainer before publication.
:::
