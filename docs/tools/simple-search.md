---
id: simple-search
title: Simple-Search
description: "Simple-Search, the quick CDSL lookup entry point — pick a dictionary, type a word the way it sounds, and get its entries."
sidebar_label: Simple-Search
---
_Created: 13-06-2026 · Last updated: 31-10-2026_

# Simple-Search

**Simple-Search** is the quick lookup entry point, linked from the front
page's navigation bar. It is one page over all dictionaries: pick a
dictionary, type a word, read the entries — no need to open a dictionary
row first. The live page is
[`/scans/awork/apidev/simple-search/v1.0/list-0.2s.html`](https://sanskrit-lexicon.uni-koeln.de/scans/awork/apidev/simple-search/v1.0/list-0.2s.html)
(source:
[`simple-search/v1.0` in csl-apidev](https://github.com/sanskrit-lexicon/csl-apidev/tree/main/simple-search/v1.0)).

## The controls

Four controls sit above one word box (the labels on the page are lowercase):

| Control | Options | Default | What it does |
|---|---|---|---|
| dictionary | any dictionary code, with autocomplete as you type | — | Which dictionary to search (codes as in the [catalog](/dictionaries/catalog); the [abbreviation lists](/dictionaries/abbreviations-and-citations) are linked right on the page). |
| input | HK · SLP1 · ITRANS · Devanagari · IAST · **simple** | simple | The scheme you type the word in. **simple** means "as it sounds in plain ASCII letters" — no diacritics needed. |
| output | Devanagari · HK · SLP1 · ITRANS · **IAST** | IAST | How headwords are shown in the results. |
| accent? | Show · **Hide** | Hide | Whether Vedic accents are displayed. |

Type the word into the **citation** box and press Enter.

## What happens on search

- With **simple** input (the default), the page first offers **alternate
  headwords**: a numbered list of dictionary spellings your input could
  correspond to (your own input is the bold entry). The first is loaded
  automatically; click another to switch. This is what makes the page
  forgiving — `agni` works whether you thought of the stem or a declined
  form.
- With an explicit scheme (HK/SLP1/ITRANS/Devanagari/IAST), the word goes
  straight to that dictionary's **List display** (a prefix-completion
  suggestion box helps while you type).

Either way the result is the dictionary's own two-pane List view — headword
index and entry pane — described in
[Search & Display](/users/search-and-display). For full-text search inside
entries, use [Advanced Search](/tools/advanced-search).

## Tips

- If the alternates list offers nothing close to your word, check the
  **input** scheme — an IAST word typed while the box still says something
  else will not match.
- Preferences persist across visits via cookies.
- Each dictionary's List display is also reachable directly, without this
  page, via the **L** link in its front-page row
  (`/scans/{CODE}Scan/2020/web/webtc1/index.php`).

## Under the hood

The search path is the csl-apidev service: `listview.php` renders the List
display, the simple-alternates come from the
[`simple-search`](https://github.com/sanskrit-lexicon/csl-apidev/tree/main/simple-search)
service (`getword_list_1.0.php`), and the type-ahead suggestions from
[`getsuggest.php`](https://github.com/sanskrit-lexicon/csl-apidev/blob/main/getsuggest.php)
(all CORS-open, so other sites can build on them too — see the
[API page](/developers/api)).

_Dr. Mārcis Gasūns_
