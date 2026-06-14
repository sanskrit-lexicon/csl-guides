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

### A worked example

Suppose you look up **agni** ("fire") and want every major dictionary's treatment on one
page rather than opening each one's Basic view in turn. A multi-dictionary display stacks
them together — for instance:

- **Monier-Williams** (`MW`) — the broad Sanskrit→English standard;
- **Apte** (`AP90`) — classical usage and compounds;
- **Böhtlingk-Roth** (`PWG`) — the large, detailed Sanskrit→German treatment.

For a side-by-side sense of how the *same* entry differs in language and depth across
dictionaries, see
**[Search & Display → The same word across dictionaries](../users/search-and-display#the-same-word-across-dictionaries)**.

Because `dalglob` is experimental, treat its URL and output as subject to change; the
stable path for comparison is to open each dictionary's **B** (Basic) display from the
front page.

## MW Inflected forms

A **Monier-Williams inflected-forms** resource provides inflected forms tied to MW
headwords — useful when you encounter an inflected word and need to find its stem. It is
linked from the MW row on the front page ("Inflected forms") and lives at
`/scans/csl-inflect/web/index.php`, generated from
[`csl-inflect`](https://github.com/sanskrit-lexicon/csl-inflect) (see also
[`MWinflect`](https://github.com/sanskrit-lexicon/MWinflect)).

