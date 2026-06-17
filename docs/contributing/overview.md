---
id: overview
title: Contributing Overview
description: "How to contribute to CDSL on GitHub — where the repositories live and how corrections flow into the dictionaries."
sidebar_label: Overview
---

# Contributing Overview

CDSL is maintained openly on GitHub at
[github.com/sanskrit-lexicon](https://github.com/sanskrit-lexicon). Anyone can report
an error or propose a correction.

## The golden rule

**Source files are never edited by hand in an ad-hoc way.** Corrections are expressed as
**change files** applied by scripts, validated as XML, and committed with an audit
trail. This keeps every edit reviewable and reversible. See
**[Corrections Workflow](corrections-workflow)** and **[Change Files](change-files)**.

## Ways to contribute

| You want to… | Do this |
|---|---|
| Report a wrong definition, headword, or scan | Open a GitHub issue on the dictionary's repo |
| Propose a specific text fix | Submit a change file (see [Change Files](change-files)) |
| Link a citation to its scanned page | A "Dictionary to Book" task — see [Issue Taxonomy](issue-taxonomy) |
| Improve markup / structured data | A "Structured Data" task — see [Issue Taxonomy](issue-taxonomy) |

## Reporting an issue

1. Find the dictionary's repository (named by its code, e.g.
   [`MWS`](https://github.com/sanskrit-lexicon/MWS)).
2. Open an issue describing the problem, with the **headword**, the **observed** text,
   the **expected** text, and ideally a **scan reference**.
3. Maintainers classify it using the **[Issue Taxonomy](issue-taxonomy)** (type label,
   severity, milestone, project).

## What gets corrected where

- **Digital text fixes** (typos, wrong characters, markup) → change files →
  applied to the source in [`csl-orig`](https://github.com/sanskrit-lexicon/csl-orig),
  with an audit trail in
  [`csl-corrections`](https://github.com/sanskrit-lexicon/csl-corrections).
- **Deviations from the printed scan** → recorded in a `printchange.txt`, *not* applied
  as silent edits.
