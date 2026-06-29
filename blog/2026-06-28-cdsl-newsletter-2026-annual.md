---
slug: newsletter-2026-annual
title: "CDSL 2026 Year in Review (January–June)"
authors: []
tags: [newsletter]
date: 2026-06-28
---

The first half of 2026 brought the most visible changes to the CDSL project in years: a comprehensive new documentation site, preface texts for sixteen dictionaries, a new API layer, a new shared transcoding library, and sustained daily correction work — all alongside a programme of security hardening across every server-side codebase.

<!-- truncate -->

## New documentation and guides site

The project now has a comprehensive documentation site at [sanskrit-lexicon.github.io/csl-guides](https://sanskrit-lexicon.github.io/csl-guides/). It covers five areas: using the search interface and reading tools; deep-dive pages for all 43 dictionaries (with sample entries, abbreviation tables, and headword keying conventions); the multi-dictionary comparison tool; a contributor correction workflow; and a developer guide. A step-by-step guide to reading Monier-Williams — with 69 quiz questions linked to live CDSL entries — and a cross-dictionary abbreviation comparison are also included.

## Prefaces digitised for sixteen dictionaries

Sixteen dictionary repositories now have a `prefaces/` folder with the scanned preface text, along with English and Russian translations where the original is in German or French: Böhtlingk–Roth (PW, 36 pages), Macdonell (MD), Böhtlingk kürzere Fassung (PWK), Cappeller (CCS), Stchoupak (STC), Benfey (BEN), Schmidt (SCH), Shabda-Sagara (SHS), Vācaspatyam (VCP), Wilson (WIL), Monier-Williams 1872 (MW72), Indian Epigraphical Glossary (INM), Vedic Index (VEI), Indische Sprüche (BOP), Grassmann (GRA), and Macdonell Practical Dictionary (MD).

## New dictionary: NMMB integrated

The Nāmamālā dictionary (NMMB) was integrated into the online search infrastructure in June 2026: the XML generation pipeline, the web display, the offline app, and the headword normalisation layers were all updated. This is the first dictionary addition since the 2023 Hemachandra additions.

## Security hardening across all server-side endpoints

A Semgrep SAST scan was run across every PHP and Python codebase in the organisation. All reflected-XSS vulnerabilities in JSONP callback parameters were patched, database queries were converted to prepared statements, and Dependabot was configured on every active repository.

## Salt API Phase 1 and csl-standards v1.0.0

A new `api1/` layer launched in csl-apidev offering structured endpoints for Monier-Williams lookups (entries, ids, and a prototype graphql endpoint). The csl-standards repository reached v1.0.0 as the validation workbench for TEI/OntoLex export formats, and included a Benfey English sense extractor and GRA coordinate citation linking.

## sanskrit-util: shared transcoding library launched

The new [sanskrit-util](https://github.com/sanskrit-lexicon/sanskrit-util) repository provides canonical IAST/SLP1/Devanāgarī transcoding and normalisation as a dual Python + JavaScript library with a cross-language test suite and a browser global build (`window.SanskritUtil`).

---

*To receive future editions by email, [subscribe here](/users/newsletter).*
