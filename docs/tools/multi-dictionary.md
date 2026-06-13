---
id: multi-dictionary
title: Multi-Dictionary Display & MW Inflected Forms
sidebar_label: Multi-Dictionary
---

# Multi-Dictionary Display & MW Inflected Forms

## Multi-dictionary display (`dalglob`)

CDSL offers an **experimental multi-dictionary display** (`dalglob`) that shows a single
headword's entries across **many dictionaries at once** — ideal for comparison, e.g.
seeing how Monier-Williams, Apte, and Böhtlingk-Roth each treat the same word. It is
implemented in
[`dalglob.php`](https://github.com/sanskrit-lexicon/csl-apidev/blob/master/dalglob.php)
in `csl-apidev`.

## MW Inflected forms

A **Monier-Williams inflected-forms** resource provides inflected forms tied to MW
headwords — useful when you encounter an inflected word and need to find its stem. It is
linked from the MW row on the front page ("Inflected forms") and lives at
`/scans/csl-inflect/web/index.php`, generated from
[`csl-inflect`](https://github.com/sanskrit-lexicon/csl-inflect) (see also
[`MWinflect`](https://github.com/sanskrit-lexicon/MWinflect)).

