---
id: overview
title: Contributing Overview
description: "Two paths into CDSL contribution: report one typo without local setup, or process validated corrections as a maintainer."
sidebar_label: Overview
---

# Contributing Overview

CDSL is maintained openly on GitHub at
[github.com/sanskrit-lexicon](https://github.com/sanskrit-lexicon). Anyone can report
an error, and maintainers can turn those reports into validated source corrections with
a complete audit trail.

## Choose your path

| You are... | Start here | Outcome |
|---|---|---|
| A reader who found one typo | [Report a Typo](report-a-typo) | A precise, evidence-rich report maintainers can act on |
| A maintainer handling one accepted report | [Process One Correction](process-one-correction) | One validated source edit plus audit-trail change file |
| A maintainer processing many reports | [Process a Scott Batch](process-scott-batch) | A per-dictionary batch with done/todo splits, validation, and paired commits |

## The golden rule

**Source files are never edited by hand in an ad-hoc way.** Corrections are expressed as
**change files** applied by scripts, validated as XML, and committed with an audit
trail. This keeps every edit reviewable and reversible. See
**[Corrections Workflow](corrections-workflow)** and **[Change Files](change-files)**.

## Ways to help

| You want to… | Do this |
|---|---|
| Report a wrong definition, headword, or scan | Follow [Report a Typo](report-a-typo) |
| Propose or install a specific text fix | Follow [Process One Correction](process-one-correction) |
| Process a named contributor backlog | Follow [Process a Scott Batch](process-scott-batch) |
| Link a citation to its scanned page | A "Dictionary to Book" task — see [Issue Taxonomy](issue-taxonomy) |
| Improve markup / structured data | A "Structured Data" task — see [Issue Taxonomy](issue-taxonomy) |

## What makes a good report

Every correction begins as evidence, not just a replacement string. A good report names
the **dictionary**, **headword**, **observed text**, **expected text**, **scan or print
evidence**, and the **transliteration** used. Maintainers then classify it with the
[Issue Taxonomy](issue-taxonomy) and decide whether it is a text correction, markup
repair, scan problem, or scholarly question.

## What gets corrected where

- **Digital text fixes** (typos, wrong characters, markup) → change files →
  applied to the source in [`csl-orig`](https://github.com/sanskrit-lexicon/csl-orig),
  with an audit trail in
  [`csl-corrections`](https://github.com/sanskrit-lexicon/csl-corrections).
- **Deviations from the printed scan** → recorded in a `printchange.txt`, *not* applied
  as silent edits.
- **Display or pipeline bugs** → fixed in the relevant tooling repository, then
  regenerated into the public displays.
