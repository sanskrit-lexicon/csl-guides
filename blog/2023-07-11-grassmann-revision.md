---
slug: grassmann-revision
title: "Grassmann dictionary: major markup revision"
authors: []
tags: [dictionaries, markup]
---

The CDSL digitization of **Grassmann's *Wörterbuch zum Rig-Veda* (`GRA`)** received a major
revision, deepening its structured markup.

<!-- truncate -->

Highlights:

- **Abbreviations** identified and tagged — `<ab>` for most abbreviations, `<lang>`
  repurposed to mark related-word languages, and `<ls>` for references to articles and
  literary sources beyond the Ṛg-Veda.
- **Ṛg-Veda link references** (e.g. `{123,4. 15}`) inferred throughout.
- **Corrections, deletions, and additions** from Grassmann's *Verbesserungen und Nachträge*
  integrated, introducing a new `<chg>` markup element that may carry over to other
  dictionaries.

The revision was led by `@Andhrabharati`, with the *Verbesserungen und Nachträge*
digitization contributed by `@maltenth` and abbreviation interpretation help from `@fxru`.

Sources: [GRA#32](https://github.com/sanskrit-lexicon/GRA/issues/32) ·
[csl-newsletter, July 2023](https://github.com/sanskrit-lexicon/csl-newsletter/blob/main/july2023.md).
