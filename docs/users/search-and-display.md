---
id: search-and-display
title: Search & Display Modes
sidebar_label: Search & Display
---

# Search & Display Modes

Each dictionary offers four reading/search interfaces, shown as **B L A M** on the front
page. They share the same underlying entries but differ in how you find and view them.

## Basic display (B)

Single-headword lookup with a clean reading view. Best when you already know the word.
Input accepts multiple transliteration schemes (see
**[Encoding & Transliteration](encoding-transliteration)**); the entry is rendered with:

- the headword,
- the body text (definitions, glosses),
- live cross-references where the markup supports them (literary-source citations,
  lexical and grammatical tags).

## List display (L)

Browse headwords as a navigable list. Useful for:

- confirming the exact spelling/sandhi of a headword,
- scanning neighbours alphabetically,
- jumping into the Basic view for any entry.

## Advanced search (A)

Search *within* entry bodies, not just headwords. Typical capabilities:

- full-text search across the entry body,
- pattern/wildcard matching,
- filtering by markup (e.g. entries citing a particular source).

`TODO(verify)`: enumerate the exact Advanced-search operators and fields exposed per
dictionary (wildcard syntax, regex support, field filters).

## Mobile display (M)

A responsive layout of the same content for phones and tablets.

## Result rendering and cross-links

Entries are generated from XML markup. Tags that drive linking and display include
(see **[Data Formats](../developers/data-formats)** for the full list):

| Tag | Meaning |
|---|---|
| `<ls>` | Literary source / citation — often a click-through to scanned pages |
| `<lex>` | Lexical/grammatical category |
| `<ab>` | Abbreviation |

When a `<ls>` reference has been linked (a "Dictionary to Book" task), clicking it opens
the cited scanned page. See **[Contributing → Issue Taxonomy](../contributing/issue-taxonomy)**
for how those links are built.
