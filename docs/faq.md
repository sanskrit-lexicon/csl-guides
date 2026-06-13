---
id: faq
title: Frequently Asked Questions
sidebar_label: FAQ
---

# Frequently Asked Questions

### My word doesn't match — what's wrong?

Almost always an **input transliteration mismatch**. The search box expects a specific
scheme (SLP1, IAST, Harvard-Kyoto, Devanāgarī). Re-check the selected scheme and retype.
See **[Encoding & Transliteration](users/encoding-transliteration)**.

### What do the letters B, L, A, M mean next to each dictionary?

**B**asic, **L**ist, **A**dvanced, **M**obile display modes. **D** is downloads and **S**
is scans. See **[Using the Website](users/using-the-website)**.

### Which dictionary should I use?

For general Sanskrit→English start with **Monier-Williams**, then **Apte**. See
**[Dictionaries Overview](dictionaries/overview)**.

### Can I use the dictionaries offline?

Yes — via **StarDict** packages, including on Android. See
**[Offline & StarDict](tools/offline-stardict)**.

### Can I download the data?

Yes — **XML (SLP1)**, **PDF**, and the original **scans**. See
**[Downloads & Data](users/downloads-and-data)**.

### I found an error. How do I report or fix it?

Open a GitHub issue on the dictionary's repository, or submit a change file. See
**[Contributing](contributing/overview)**.

### Why is the internal encoding SLP1 and not Unicode Devanāgarī?

SLP1 is a lossless one-char-per-phoneme ASCII encoding, which makes sorting, searching,
and round-tripping deterministic. Devanāgarī and IAST are produced for display. See
**[Data Formats](developers/data-formats)**.

### Is there an API?

Yes — a RESTful API (native + a C-SALT-compatible "Salt API") with REST and GraphQL.
See the **[API](developers/api)** page.
