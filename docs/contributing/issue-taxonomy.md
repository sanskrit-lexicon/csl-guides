---
id: issue-taxonomy
title: GitHub Issue Taxonomy
sidebar_label: Issue Taxonomy
---

# GitHub Issue Taxonomy

Every issue in every Sanskrit Lexicon repository follows one shared taxonomy:
a **type** label, a **severity** label, a **milestone**, and a **project**.

## Milestones and projects

| Milestone | Scope |
|---|---|
| **Dictionary to Book (DTB)** | Link targets and link splitting |
| **Digitization Quality (DQ)** | Scan quality, encoding, bug fixes, text corrections |
| **Structured Data (SD)** | Markup normalization, structured data, editorial questions |
| **Major Enhancements (ME)** | Large new content, display upgrades, new versions |

> Discover milestone/project **numbers from the API** — never hardcode them. (MWS uses
> projects 5–8 because 1–4 were already taken; all other repos use 1–4.)

## Type labels (color `#0075ca`)

| Label | When to use |
|---|---|
| `link-target` | Build a click-through from a `<ls>` abbreviation to scanned PDF pages |
| `link-splitting` | Split combined `SOURCE N,N` refs into individual per-page links |
| `markup` | Normalize XML tag content (`<ls>`, `<lex>`, `<ab>`, …) |
| `text-correction` | Corrections to dictionary text (definitions, headwords) |
| `content-enhancement` | New material, display upgrades, structural additions |
| `encoding` | SLP1/AS/IAST transcoding, character rendering, hyphen/dash normalization |
| `scan-quality` | Replace blurry, skewed, or missing scan pages |
| `bug` | Broken links, XML structure errors, broken download files |
| `question` | Scholarly/editorial questions needing research before any code change |

## Severity labels

| Label | Color | Meaning |
|---|---|---|
| `minor` | `#e4e669` | Targeted, self-contained fix |
| `medium` | `#fbca04` | Standard unit of work — one index, a batch of corrections |
| `hard` | `#d93f0b` | Large effort spanning many sources, files, or dictionaries |

## Which milestone for which type

| Milestone | Types |
|---|---|
| Dictionary to Book | `link-target`, `link-splitting` |
| Digitization Quality | `scan-quality`, `encoding`, `bug`, `text-correction` |
| Structured Data | `markup`, `question` |
| Major Enhancements | `content-enhancement` |

## Stale default labels

GitHub ships `bug` and `question` as default labels that were applied loosely before this
taxonomy existed. After assigning the correct type label, delete the conflicting stale
default:

```sh
gh api repos/sanskrit-lexicon/REPO/issues/N/labels/<old-label> -X DELETE
```

## Automation

The taxonomy is applied across repos by the `/cologne-issue-runbook <REPO>` and
`/cologne-runbook-all` skills (audit → labels → milestones → projects → verification).
Maintainer reference only.
