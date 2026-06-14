---
slug: csl-devanagari
title: "csl-devanagari — output closer to the printed text"
authors: []
tags: [data, encoding]
---

In response to a user request for Cologne data nearer to the printed text (Devanāgarī
rather than the internal SLP1 encoding), a new repository
[`csl-devanagari`](https://github.com/sanskrit-lexicon/csl-devanagari) was created.

<!-- truncate -->

It carries `to_devanagari.py` and `to_slp1.py` scripts for round-trip conversion: a
dictionary is converted to Devanāgarī and back to SLP1, and the two are diffed to verify
the conversion is lossless against the [`csl-orig`](https://github.com/sanskrit-lexicon/csl-orig)
source.

Source: [csl-newsletter, September 2021](https://github.com/sanskrit-lexicon/csl-newsletter/blob/main/september2021.md).
