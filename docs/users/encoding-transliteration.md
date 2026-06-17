---
id: encoding-transliteration
title: Encoding & Transliteration
description: "How CDSL stores Sanskrit in SLP1 and the input/display schemes (IAST, Harvard-Kyoto, Devanāgarī) — the key to making your word match."
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

## Vedic accents

Several dictionaries record **Vedic pitch accents**, and the data carries them — for
Monier-Williams alone the accent mark sits on tens of thousands of headwords.

**Which dictionaries mark accents:**

| Dictionary | Accents? |
|---|---|
| [Monier-Williams (MW)](../dictionaries/mw) | Yes |
| [Böhtlingk-Roth (PWG)](../dictionaries/pwg) and [shorter (PW)](../dictionaries/pw) | Yes |
| [Grassmann (GRA)](../dictionaries/gra) | Yes — central; it is a Ṛg-Veda dictionary |
| [Apte (AP90)](../dictionaries/ap90) | No |

**How they are encoded.** In the SLP1 source the **udātta** (high pitch) is written `/`
attached to its vowel — e.g. MW keys *agni* as `agni/` (accent on the final *-i*, agní). The
other Vedic accents (anudātta, svarita) appear as `\` and `^` in the entry body of the
German and Grassmann sources. When rendered, accents show in **Roman** as a combining acute
(`á`, `ā́`) and in **Devanāgarī** as the usual udātta/anudātta strokes. The precise marking
scheme is described per dictionary on its [csl-doc](https://github.com/sanskrit-lexicon/csl-doc)
page.

:::tip You never have to type an accent
Each entry stores a **plain** search key and a separate **accented** display key
(`<k1>agni` vs `<k2>agni/`). Lookup uses the plain key, so typing `agni` finds the word
whether or not you know its accent. The accent is for *display*, not for matching.
:::

**Showing or hiding accents.** The displays offer an **accent** toggle, and the
[API](../developers/api) exposes it as `accent=yes|no` (it governs whether accents appear in
**Devanāgarī** output). Turn it off for a cleaner reading text; on to study the pitch.

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
