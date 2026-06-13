---
id: encoding-transliteration
title: Encoding & Transliteration
sidebar_label: Encoding & Transliteration
---

# Encoding & Transliteration

CDSL stores Sanskrit text internally in **SLP1**, and lets you *input* and *display*
words in several transliteration schemes. Knowing which scheme you are typing in is the
single most common source of "why didn't my word match" confusion.

## Schemes the displays offer

SLP1 is the website's *lingua franca* (storage encoding). The display **input/output**
menus let you read or type in these schemes (the transcoder names are the values the API
uses):

| Scheme (transcoder name) | What it is | *rāma* | *śiva* |
|---|---|---|---|
| **`slp1`** | Sanskrit Library Phonetic Basic — the internal encoding; one ASCII char per phoneme | `rAma` | `Siva` |
| **`deva`** | Devanāgarī (Unicode) | राम | शिव |
| **`roman`** | Roman with diacritics (IAST-style) | rāma | śiva |
| **`hk`** | Harvard-Kyoto — ASCII, case-sensitive | `rAma` | `ziva` |
| **`itrans`** | ITRANS — ASCII scheme | `rAma` | `shiva` |

:::tip Why two example words
*rāma* looks **identical** in SLP1, Harvard-Kyoto, and ITRANS (all `rAma`) — none of its
sounds are written differently across those ASCII schemes, so for this word the input
scheme barely matters. *śiva* is the opposite: the **ś** sound is `S` in SLP1, `z` in
Harvard-Kyoto, and `sh` in ITRANS — three different ASCII spellings of the same letter.
The sounds where the schemes actually diverge are the sibilants (`ś`, `ṣ`), vocalic `ṛ`/`ḷ`,
and the retroflex consonants. When your word contains one of those, choosing the right
input scheme is exactly what makes the lookup match.
:::

Two more transcoders exist but are **not** in the display input/output menus: **`wx`**
(used at Hyderabad University) and **`as`** (Anglicized Sanskrit, Thomas Malten's
letter-number scheme). `slp1` and `deva` are the values seen in the
[API](../developers/api) `input`/`output` parameters.

## Why SLP1 internally

SLP1 is **lossless and unambiguous**: every Sanskrit phoneme maps to exactly one ASCII
character, so sorting, searching, and round-tripping are deterministic. The downloadable
XML is in SLP1 for this reason (see **[Downloads & Data](downloads-and-data)**).

## Typing a headword

- If you have a **diacritic Roman** word (`rāma`), choose the `roman` input mode.
- If you only have an **ASCII keyboard**, Harvard-Kyoto (`hk`), ITRANS (`itrans`), or
  SLP1 (`slp1`) avoid diacritics entirely.
- If you have **Devanāgarī**, paste it directly and select the `deva` input mode.

If a lookup fails, the most likely cause is an input-scheme mismatch (e.g. typing `roman`
while the box expects `hk`). Re-check the selected scheme first.

## Transcoding tooling

Scheme conversion uses the project's **transcoder**, developed in Java by Ralph Bunker
and ported to PHP (`transcoder.php`) and Python
([funderburkjim/sanskrit-transcoding](https://github.com/funderburkjim/sanskrit-transcoding)).
It works from per-pair XML tables named `{X}_{Y}.xml` (e.g. `slp1_deva.xml`), compiled
into a finite-state machine at runtime. For example `transcoder_processString('rAma',
'slp1', 'deva')` returns राम. See also **[Data Formats](../developers/data-formats)**.
