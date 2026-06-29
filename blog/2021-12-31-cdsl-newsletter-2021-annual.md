---
slug: newsletter-2021-annual
title: "CDSL 2021 Year in Review"
authors: []
tags: [newsletter]
date: 2021-12-31
---

2021 was one of the most active years in the project's GitHub history: the Devanāgarī display layer launched, Boehtlingk's Indische Sprüche entered preparation, several dictionaries received extensive markup improvements, and the correction workflow was formalized with new tooling for users and contributors.

<!-- truncate -->

## csl-devanagari: Devanāgarī display launched

A major new feature arrived in September 2021 with the creation of the csl-devanagari repository. Two scripts — to_devanagari.py and to_slp1.py — handle round-trip conversion between SLP1 and Devanāgarī. More than thirty issues were filed and resolved in the first week alone, addressing edge cases in accented IAST and homophone characters (ऌ, ळ). The homepage was updated to reflect 38 dictionaries.

## Indische Sprüche preparation begins

The long-anticipated digital edition of Boehtlingk's Indische Sprüche (BOESP) — a collection of Sanskrit proverbs and quotations — entered active preparation. Jim Funderburk coordinated a proofreading effort involving Sampada, Andhrabharati, and Thomas, working through the three-volume ANSI source files. Greek text and link targets for the BOESP were added to PW and PWG, and the Mahābhārata Calcutta edition scans were added to provide link targets for the dense citation network.

## INM: deep markup improvements

The INM dictionary received sustained attention throughout December: the source file was split into sub-parts for maintainability, Greek text was added, punctuation in italic and bold ranges was corrected, and "widely spaced text" markup was introduced. All line-marker formatting was removed across all dictionaries in a clean-up pass that affected more than a dozen repositories.

## User correction infrastructure expands

The csl-lnum repository was created to give users a way to link directly to specific line numbers in csl-orig and submit corrections. The cologne-stardict files began including links to scan pages and correction forms, so stardict users can verify against the printed text and report errors without navigating the web interface.

## GRA and BEN markup advances

Grassmann's Wörterbuch zum Rig-Veda (GRA) gained structured `<ab>` and `<ls>` abbreviation markup, with support for Grassmann's own Verbesserungen und Nachtrage (corrections and additions). Benfey (BEN) received a new, more legible scan set and 180 systematic corrections to headword encoding.

---

*To receive future editions by email, [subscribe here](/users/newsletter).*
