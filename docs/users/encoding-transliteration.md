---
id: encoding-transliteration
title: Encoding & Transliteration
sidebar_label: Encoding & Transliteration
---

# Encoding & Transliteration

CDSL stores Sanskrit text internally in **SLP1**, and lets you *input* and *display*
words in several transliteration schemes. Knowing which scheme you are typing in is the
single most common source of "why didn't my word match" confusion.

## Schemes you will encounter

| Scheme | What it is | Example (*kṛṣṇa*) |
|---|---|---|
| **SLP1** | Sanskrit Library Phonetic Basic — the internal storage encoding; one ASCII char per phoneme | `kfRZa` |
| **IAST** | International Alphabet of Sanskrit Transliteration — the scholarly Roman standard with diacritics | `kṛṣṇa` |
| **Harvard-Kyoto (HK)** | ASCII scheme, case-sensitive | `kRSNa` |
| **Devanāgarī** | Native script (Unicode) | कृष्ण |

`TODO(verify)`: confirm the complete list of input/output schemes the live converters
support (e.g. ITRANS, Velthuis, WX, Roman/ISO-15919) and the exact labels used in the UI.

## Why SLP1 internally

SLP1 is **lossless and unambiguous**: every Sanskrit phoneme maps to exactly one ASCII
character, so sorting, searching, and round-tripping are deterministic. The downloadable
XML is in SLP1 for this reason (see **[Downloads & Data](downloads-and-data)**).

## Typing a headword

- If you have a **diacritic IAST** word (`kṛṣṇa`), choose the IAST input mode.
- If you only have an **ASCII keyboard**, Harvard-Kyoto (`kRSNa`) or SLP1 (`kfRZa`)
  avoid diacritics entirely.
- If you have **Devanāgarī**, paste it directly and select the Devanāgarī input mode.

If a lookup fails, the most likely cause is an input-scheme mismatch (e.g. typing IAST
while the box expects Harvard-Kyoto). Re-check the selected scheme first.

## Transcoding tooling

Conversion between schemes in the CDSL toolchain is handled by transcoders maintained in
the project (the same logic used when generating displays). For developers, see
**[Data Formats](../developers/data-formats)**.

:::caution Draft
The conversion table above is illustrative. Verify each cell against the live converter
before publishing, and add a one-row-per-scheme reference table with the full akṣara set.
:::
