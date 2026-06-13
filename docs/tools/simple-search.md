---
id: simple-search
title: Simple-Search
sidebar_label: Simple-Search
---

# Simple-Search

**Simple-Search** is the quick lookup entry point linked from the front page. It is
designed for the common case: type a word, get its entries.

## How to use it

1. Open Simple-Search from the front page.
2. Choose your **input transliteration** (see **[Encoding & Transliteration](../users/encoding-transliteration)**).
3. Type the headword.
4. Review matching entries; follow into the per-dictionary Basic view for full context.

## Tips

- If you get no results, re-check the **input scheme** — an IAST word typed in a
  Harvard-Kyoto box will not match.
- Simple-Search targets **headwords**; to search *inside* entries use
  **[Advanced Search](advanced-search)**.

## Under the hood

Simple-Search is powered by the API's `listview` action, with `getsuggest` providing
prefix autocomplete (see the [API](../developers/api) page). The same display is reachable
per dictionary via the **L** (List) link, `/scans/{CODE}Scan/2020/web/webtc1/index.php`.
