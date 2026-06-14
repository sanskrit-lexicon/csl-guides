---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
---

# Troubleshooting

Most lookup problems have the same handful of causes. Work down this list in order.

## "My word returns no results"

1. **Wrong input scheme — by far the most common cause.** The search box matches against a
   specific transliteration. An IAST word (`rāma`) typed while the box expects Harvard-Kyoto
   will not match. Re-check the selected **input** scheme and retype. See
   **[Encoding & Transliteration](encoding-transliteration)** for the scheme table and a
   worked *śiva* / *kṛṣṇa* example.
2. **You typed an inflected or sandhi'd form.** Dictionaries are keyed by **stem/headword**,
   not by inflected forms. Look up the stem (e.g. *gaccha-*, not *gacchati*). For
   Monier-Williams, the **[Inflected forms](../tools/multi-dictionary#mw-inflected-forms)**
   resource maps a form back to its headword.
3. **Spelling, homonyms, or long vs short vowels.** Switch to the **L** (List) display to
   browse neighbouring headwords and confirm the exact spelling and any homonym number.
4. **Wrong dictionary for the word.** A Vedic term may be absent from a classical dictionary
   and vice-versa. See **[Choosing a dictionary](../dictionaries/overview#choosing-a-dictionary)**.
5. **Accents (Vedic).** Some Vedic dictionaries (e.g. Grassmann) carry accent marks. If an
   accented search fails, retry without the accent, or check whether the display offers an
   *accent: no* option.

## "It matches, but the characters render wrong"

That is the **output** scheme, set independently of input. Switch the output menu to
`deva` (Devanāgarī), `roman` (IAST), or whichever you want to read. Storage is always SLP1;
display is converted on the fly — see **[Encoding & Transliteration](encoding-transliteration)**.

## "A citation link doesn't open a scanned page"

Not every literary-source citation (`<ls>`) has been linked to its scan yet — that linking
("Dictionary to Book") is ongoing editorial work. An unlinked citation is expected, not a
bug. See **[Scans & Print](scans-and-print)** and the
**[Issue Taxonomy](../contributing/issue-taxonomy)**.

## "A scan page is blurry, skewed, or missing"

That is worth reporting as a `scan-quality` issue. See **[Scans & Print](scans-and-print)**
and **[Contributing → Overview](../contributing/overview)**.

## Still stuck?

Check the **[FAQ](../faq)**, or open an issue on the dictionary's GitHub repository — see
**[Contributing](../contributing/overview)**.
