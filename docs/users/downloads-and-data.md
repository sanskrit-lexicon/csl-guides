---
id: downloads-and-data
title: Downloads & Data
sidebar_label: Downloads & Data
---

# Downloads & Data

Every dictionary is downloadable. CDSL is open data — the per-dictionary GitHub repos
carry a **CC BY-SA 4.0** license. See
[Abbreviations & Citations](../dictionaries/abbreviations-and-citations) for the official
citation and acknowledgment wording.

## What you can download

| Format | Contents | Typical use |
|---|---|---|
| **XML (SLP1)** | The full structured dictionary, headwords in SLP1, marked-up entry bodies | Programmatic use, building apps, re-display |
| **PDF** | A typeset/printable rendering of the digital text | Reading, printing, citation |
| **Scanned editions (jpg/pdf)** | The original printed pages | Verifying the digital text against print |
| **StarDict packages** | Offline dictionary files | Use in StarDict-compatible apps / Android |

The **D** link on each front-page row goes to that dictionary's downloads; **S** goes to
its scans.

## XML structure (quick orientation)

Downloaded XML follows the Cologne markup conventions. Headwords carry a `key`/`key1`
encoding, and entry bodies use tags such as `<ls>` (literary source), `<lex>`
(lexical category), and `<ab>` (abbreviation). The full schema and worked examples are
in **[Data Formats](../developers/data-formats)**.

## Bulk / programmatic access

- The canonical source text and generated XML live in the per-dictionary repositories
  under the [`sanskrit-lexicon`](https://github.com/sanskrit-lexicon) GitHub org — e.g.
  Monier-Williams is [`MWS`](https://github.com/sanskrit-lexicon/MWS), Apte 1890 is
  [`AP90`](https://github.com/sanskrit-lexicon/AP90).
- A RESTful **web API** (native + a C-SALT-compatible "Salt API") serves lookups and
  search — see **[API](../developers/api)**.
- The per-dictionary **download page** is `/scans/{CODE}Scan/2020/web/webtc/download.html`
  (the **D** link on the front page).

## Licensing & citation

When you reuse CDSL data, cite both the **original print dictionary** and the **Cologne
Digital Sanskrit Dictionaries** digitization. See
**[Abbreviations & Citations](../dictionaries/abbreviations-and-citations)** for the
recommended citation form.
