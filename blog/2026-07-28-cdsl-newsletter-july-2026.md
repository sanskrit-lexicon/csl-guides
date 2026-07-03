---
slug: newsletter-2026-07
title: "CDSL Newsletter — July 2026"
authors: []
tags: [newsletter]
date: 2026-07-28
---

Here is the July 2026 edition of the Cologne Digital Sanskrit Dictionaries newsletter,
covering the activity of the past month. Significant work this period: a broad preface
digitisation sweep, a new dictionary added to the online search, security hardening across
all the server-side code, and the first release of the new structured API for
Monier-Williams.

<!-- truncate -->

## Prefaces digitised for sixteen more dictionaries

A systematic effort to OCR and transcribe the front matter of every CDSL dictionary has
been under way throughout June. Sixteen dictionary repositories now have a `prefaces/`
folder with the scanned preface text, along with English and Russian translations where the
original is in German or French:

Böhtlingk–Roth (PW, 36 pages), Macdonell (MD), Böhtlingk kürzere Fassung (PWK),
Cappeller (CCS), Stchoupak Sanscrit-Français (STC), Benfey (BEN), Schmidt (SCH),
Shabda-Sagara (SHS), Vācaspatyam (VCP), Wilson (WIL), Monier-Williams 1872 (MW72, complete
front matter), Indian Epigraphical Glossary (INM), Vedic Index (VEI), Böhtlingk Indische
Sprüche (BOP), and Grassmann / Macdonell (already included in the June relaunch).

The goal is to make the scholarly apparatus of each dictionary — the editor's introduction,
scope note, abbreviation conventions, and acknowledgements — accessible online for the
first time. A summary page will be added to the guides site as the sweep completes.

## New dictionary live: NMMB (Nāmamālikā of Bhoja)

The *Nāmamālikā* attributed to King Bhoja (NMMB) is now **live on the CDSL front page** —
the first addition to the online collection since the current catalog took shape. It is a
compact synonym kośa in
verse (506 synonym groups in three *prakaraṇa*s, from the 1955 Deccan College edition),
digitized by the [sanskrit-kosha project](https://github.com/sanskrit-kosha/kosha) with all
the usual displays (Basic, List, Advanced, Mobile) and downloads. The guides site has a
[new deep page for NMMB](/dictionaries/nmmb) with a verified sample record and its headword
key conventions, and the [catalog](/dictionaries/catalog) now counts 43 digitized
dictionaries.

## Böhtlingk's own Nachträge digitized (PWKVN)

A second new digitization landed in `csl-orig`: **PWKVN**, the "Nachträge und
Verbesserungen" (addenda and corrections) appendixes that Böhtlingk printed at the end of
each of the seven volumes of his shorter *Sanskrit-Wörterbuch* (PW) — nearly 25,000 short
records of the author's own corrections and additions. It is not yet a front-page catalog
entry, but it is browsable through an
[experimental display](https://www.sanskrit-lexicon.uni-koeln.de/scans/csl-apidev/pwkvn/)
and documented on a [new guides page](/dictionaries/pwkvn).

## Repository housekeeping: default branches renamed to `main`

The organisation's repositories — including `csl-orig`, the canonical source of every
dictionary's digitization — renamed their default branch from `master` to `main`. GitHub
redirects old links, but anything that pins raw file URLs to a branch should switch to
`main`. All links on this site have been updated.

## Security hardening across all server-side endpoints

A Semgrep SAST (static analysis) scan was run across every PHP and Python codebase in the
organisation. All reflected-XSS vulnerabilities in JSONP callback parameters have been
patched (csl-apidev, csl-websanlexicon, mw-dev, GRA, CORRECTIONS). Database queries in
the correction submission handler and the main search API have been converted to prepared
statements. Dependabot is now configured on every active repository and pull requests are
auto-merged when they pass CI.

These patches are live on the CDSL web server. No user data was at risk (the site does not
have accounts or user-submitted content), but the input validation gaps have been closed.

## Salt API Phase 1: structured endpoint for Monier-Williams

A new `api1/` layer is now deployed in csl-apidev, offering three structured endpoints for
MW lookups: `api1/entries` (full XML entry by key), `api1/ids` (headword-to-internal-ID
mapping), and `api1/graphql` (prototype structured query). This is the foundation for the
forthcoming semantic linking work (TEI/OntoLex export, GRA coordinate citations, and the
Benfey English sense extractor). The csl-standards repository reached v1.0.0 as the
validation workbench for these export formats.

Developer documentation will follow in the guides site.

## Text corrections: 43 batches closed in June

The daily correction workflow continued through the month. Forty-three correction issues
were closed in June across MW, SHS, SKD, INM, SCH, LRV, WIL, and AE — sourced from
proofreading against the original print editions. The cologne-stardict offline dictionaries
were regenerated automatically after each batch (82 commits, tracking every correction
commit in csl-orig).

One highlight: a systematic fix of the commentator Sāyaṇa's name in the Śabdakalpadruma
(`sAyanaH` → `sAyaNaH`, 165 occurrences), caught by proofreading the retroflex ṇ.

To report an error or suggest a correction, open an issue at
[github.com/sanskrit-lexicon/CORRECTIONS](https://github.com/sanskrit-lexicon/CORRECTIONS/issues/new).

## sanskrit-util: shared transcoding library launched

A new repository, [sanskrit-util](https://github.com/sanskrit-lexicon/sanskrit-util),
provides the canonical IAST/SLP1/Devanāgarī transcoding and normalisation functions as a
dual Python + JavaScript library. The two implementations are behaviour-identical and share
a cross-language test suite. A browser global build (`window.SanskritUtil`) is available
for direct use in web pages without a bundler. This consolidates the transcoding code that
was previously duplicated across several repos.

---

*To receive future editions by email, [subscribe here](/users/newsletter).*
