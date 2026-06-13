---
id: catalog
title: Dictionary Catalog
sidebar_label: Catalog
---

# Dictionary Catalog

This catalog is verified against the **[live front page](https://sanskrit-lexicon.uni-koeln.de)**
(the authoritative source for display codes, titles, and years), cross-checked against the
actual repository names in the [`sanskrit-lexicon`](https://github.com/sanskrit-lexicon)
GitHub org, and reconciled with the per-dictionary pages in
**[csl-doc](https://github.com/sanskrit-lexicon/csl-doc)** — the project's existing Sphinx
"front matter / user notes / prefaces" documentation. See
[Reconciliation with csl-doc](#reconciliation-with-csl-doc) below for what each source
contributed.

**Codes are the website display codes.** Where the GitHub repository is named
differently, that is noted in the *Repo* column (e.g. display **MW** → repo
[`MWS`](https://github.com/sanskrit-lexicon/MWS)). A dash (—) means no dedicated
per-dictionary repository was found in the org — the dictionary is served on the site but
has not been migrated to its own GitHub repo.

:::note Count — resolved
The front page states "The **42** dictionaries…", yet the table has **43 rows**. The extra
row is **`PD`**, which is shown as a **sample only** (marked `*`, "funded by the DFG-NEH
Project 2010-2013"): it links to a `pd-sample.php` page and has **no `…Scan` code and no
B/L/A/M display**. The HTML confirms exactly **42 distinct `…Scan` dictionary codes** — the
fully digitized dictionaries the headline counts — plus the PD sample = 43 rows. csl-doc
documents 38 (no PD page, since there is no full dictionary to document).
:::

## Sanskrit–English (14)

| Code | Title | Author | Year | Repo |
|---|---|---|---|---|
| `WIL` | Sanskrit–English Dictionary | Wilson | 1832 | [WIL](https://github.com/sanskrit-lexicon/WIL); shares [Wil-YAT](https://github.com/sanskrit-lexicon/Wil-YAT) corrections repo |
| `YAT` | Sanskrit–English Dictionary | Yates | 1846 | no own repo; corrections in [Wil-YAT](https://github.com/sanskrit-lexicon/Wil-YAT) |
| `GST` | Goldstücker Sanskrit–English Dictionary (only words beginning *a-*) | Goldstücker | 1856 | — |
| `BEN` | Sanskrit–English Dictionary | Benfey | 1866 | [BEN](https://github.com/sanskrit-lexicon/BEN) |
| `MW72` | Sanskrit–English Dictionary (1st ed.) | Monier-Williams | 1872 | [MW72](https://github.com/sanskrit-lexicon/MW72) |
| `LAN` | Lanman's Sanskrit Reader (vocabulary) | Lanman | 1884 | — |
| `LRV` | Standard Sanskrit–English Dictionary | L.R. Vaidya | 1889 | [LRV](https://github.com/sanskrit-lexicon/LRV) |
| `AP90` | Practical Sanskrit–English Dictionary | Apte | 1890 | [AP90](https://github.com/sanskrit-lexicon/AP90) |
| `CAE` | Sanskrit–English Dictionary | Cappeller | 1891 | [CAE](https://github.com/sanskrit-lexicon/CAE) |
| `MD` | Sanskrit–English Dictionary | Macdonell | 1893 | [MD](https://github.com/sanskrit-lexicon/MD) |
| `MW` | Sanskrit–English Dictionary | Monier-Williams | 1899 | [MWS](https://github.com/sanskrit-lexicon/MWS) |
| `SHS` | Shabda-Sagara Sanskrit–English Dictionary | — | 1900 | [SHS](https://github.com/sanskrit-lexicon/SHS) |
| `AP` | Practical Sanskrit–English Dictionary (revised) | Apte | 1957 | [AP](https://github.com/sanskrit-lexicon/AP) |
| `PD` | An Encyclopedic Dictionary of Sanskrit on Historical Principles (**sample only**, 4328 pp.) | Ghatage & Bhatta (eds.) | 1976 | — (sample page, not a full digitization) |

## English–Sanskrit (3)

| Code | Title | Author | Year | Repo |
|---|---|---|---|---|
| `MWE` | English–Sanskrit Dictionary | Monier-Williams | 1851 | — |
| `BOR` | English–Sanskrit Dictionary | Borooah | 1877 | [BOR](https://github.com/sanskrit-lexicon/BOR) |
| `AE` | Student's English–Sanskrit Dictionary | Apte | 1920 | [ApteES](https://github.com/sanskrit-lexicon/ApteES) |

## Sanskrit–French (2)

| Code | Title | Author | Year | Repo |
|---|---|---|---|---|
| `BUR` | Dictionnaire Sanscrit–Français | Burnouf | 1866 | [BUR](https://github.com/sanskrit-lexicon/BUR) |
| `STC` | Dictionnaire Sanscrit–Français | Stchoupak | 1932 | [STC](https://github.com/sanskrit-lexicon/STC) |

## Sanskrit–German (5)

| Code | Title | Author | Year | Repo |
|---|---|---|---|---|
| `PWG` | Grosses Petersburger Wörterbuch | Böhtlingk & Roth | 1855 | [PWG](https://github.com/sanskrit-lexicon/PWG) |
| `GRA` | Wörterbuch zum Rig Veda | Grassmann | 1873 | [GRA](https://github.com/sanskrit-lexicon/GRA) |
| `PW` | Sanskrit-Wörterbuch in kürzerer Fassung | Böhtlingk | 1879 | [PWK](https://github.com/sanskrit-lexicon/PWK) |
| `CCS` | Sanskrit Wörterbuch | Cappeller | 1887 | [CCS](https://github.com/sanskrit-lexicon/CCS) |
| `SCH` | Nachträge zum Sanskrit-Wörterbuch | Schmidt | 1928 | [SCH](https://github.com/sanskrit-lexicon/SCH) |

## Sanskrit–Latin (1)

| Code | Title | Author | Year | Repo |
|---|---|---|---|---|
| `BOP` | Glossarium Sanscritum | Bopp | 1847 | [BOP](https://github.com/sanskrit-lexicon/BOP) |

## Sanskrit–Sanskrit (6)

| Code | Title | Author | Year | Repo |
|---|---|---|---|---|
| `ARMH` | Abhidhānaratnamālā of Halāyudha | Halāyudha | 1861 | — |
| `VCP` | Vācaspatyam | — | 1873 | [VCP](https://github.com/sanskrit-lexicon/VCP) |
| `SKD` | Śabdakalpadruma | — | 1886 | [SKD](https://github.com/sanskrit-lexicon/SKD) |
| `ABCH` | Abhidhānacintāmaṇi of Hemacandrācārya | Hemacandra | 1896 | — |
| `ACPH` | Abhidhānacintāmaṇipariśiṣṭa of Hemacandrācārya | Hemacandra | 1896 | — |
| `ACSJ` | Abhidhānacintāmaṇiśiloñcha of Jinadeva | Jinadeva | 1896 | — |

The four Abhidhāna codes (`ARMH`, `ABCH`, `ACPH`, `ACSJ`) have **no dedicated org repo** —
they are served on the website but not yet migrated to GitHub (like the unmigrated entries
in the other groups).

## Specialized (12)

| Code | Title | Author | Year | Repo |
|---|---|---|---|---|
| `INM` | Index to the Names in the Mahābhārata | — | 1904 | [INM](https://github.com/sanskrit-lexicon/INM) |
| `VEI` | Vedic Index of Names and Subjects | — | 1912 | [VEI](https://github.com/sanskrit-lexicon/VEI) |
| `PUI` | The Purāṇa Index | — | 1951 | [PUI](https://github.com/sanskrit-lexicon/PUI) |
| `BHS` | Buddhist Hybrid Sanskrit Dictionary | Edgerton | 1953 | [BHS](https://github.com/sanskrit-lexicon/BHS) |
| `FRI` | Sanskrit Reader Vocabulary | Friš | 1956 | [FRI](https://github.com/sanskrit-lexicon/FRI) |
| `ACC` | Aufrecht's Catalogus Catalogorum | Aufrecht | 1962 | [ACC](https://github.com/sanskrit-lexicon/ACC) |
| `KRM` | Kṛdantarūpamālā | — | 1965 | [KRM](https://github.com/sanskrit-lexicon/KRM) |
| `IEG` | Indian Epigraphical Glossary | — | 1966 | — |
| `SNP` | Meulenbeld's Sanskrit Names of Plants | Meulenbeld | 1974 | — |
| `PE` | Puranic Encyclopedia | — | 1975 | — |
| `PGN` | Personal and Geographical Names in the Gupta Inscriptions | — | 1978 | — |
| `MCI` | Mahābhārata Cultural Index | — | 1993 | [MCI](https://github.com/sanskrit-lexicon/MCI) |

## In preparation (not yet on the front page)

These dictionaries have repositories in the org but are **not yet listed on the live
front page**. They include a Sanskrit–Russian language group that the current front page
does not represent.

| Repo | Title | Author | Year | Language | Status |
|---|---|---|---|---|---|
| [AMAR](https://github.com/sanskrit-lexicon/AMAR) | Amarakośa (Nāmaliṅgānuśāsana) | Amarasiṃha | — | SA → SA | Source `amar.txt` built, bound for `csl-orig/v02/amar/` |
| [KOW](https://github.com/sanskrit-lexicon/KOW) | Sanskrito-russkiy slovar | Kossowich | 1854 | SA → RU | ~13,488 entries; corrections/scans repo |
| [KNA](https://github.com/sanskrit-lexicon/KNA) | Sanskrit–Russian Vocabulary | Knauer | 1908 | SA → RU | 3,271 entries; corrections repo |

## Reconciliation with csl-doc

[csl-doc](https://github.com/sanskrit-lexicon/csl-doc) is the project's existing Sphinx
documentation site. Each dictionary has a `source/dictionaries/{code}.rst` page holding
its **front matter, prefaces, and user notes** (the dictionary *text* itself lives in
[`csl-orig`](https://github.com/sanskrit-lexicon/csl-orig), conventionally at
`csl-orig/v02/{code}/{code}.txt`). The page URL pattern is:

```
https://github.com/sanskrit-lexicon/csl-doc/blob/master/source/dictionaries/{code}.rst
```

csl-doc's [`index.rst`](https://github.com/sanskrit-lexicon/csl-doc/blob/master/source/dictionaries/index.rst)
documents **38 dictionaries**, all of which are a subset of the 43 on the front page.

**On the website but *not* in csl-doc (5):**

| Code | Title | Has org repo? |
|---|---|---|
| `PD` | Encyclopedic Dictionary of Sanskrit on Historical Principles | No |
| `FRI` | Friš Sanskrit Reader Vocabulary | **Yes** — [FRI](https://github.com/sanskrit-lexicon/FRI) (repo but no csl-doc page) |
| `ARMH` | Abhidhānaratnamālā of Halāyudha | No |
| `ACPH` | Abhidhānacintāmaṇipariśiṣṭa | No |
| `ACSJ` | Abhidhānacintāmaṇiśiloñcha | No |

Note: of the four Abhidhāna texts, only **`ABCH`** has a csl-doc page
([abch.rst](https://github.com/sanskrit-lexicon/csl-doc/blob/master/source/dictionaries/abch.rst));
`ARMH`/`ACPH`/`ACSJ` have neither a repo nor a csl-doc page.

## Resolved by reconciliation

- **Wilson vs Yates** — *separate dictionaries.* csl-doc has distinct
  [wil.rst](https://github.com/sanskrit-lexicon/csl-doc/blob/master/source/dictionaries/wil.rst)
  and [yat.rst](https://github.com/sanskrit-lexicon/csl-doc/blob/master/source/dictionaries/yat.rst)
  pages. `WIL` has its own repo; `YAT` has none (its corrections live in the shared
  [Wil-YAT](https://github.com/sanskrit-lexicon/Wil-YAT) repo).
- **`PW` display code** — confirmed by
  [pw.rst](https://github.com/sanskrit-lexicon/csl-doc/blob/master/source/dictionaries/pw.rst)
  ("Böhtlingk Sanskrit-Wörterbuch in kürzerer Fassung"); the repo is `PWK`.
- **Source location of the "unmigrated" dictionaries** — `GST`, `LAN`, `IEG`, `SNP`,
  `PE`, `PGN`, `MWE` all have csl-doc front-matter pages; their text lives in `csl-orig`,
  not in a per-dictionary repo.
- **Titles** — adopted csl-doc's fuller forms (e.g. `LRV` = *Standard Sanskrit–English
  Dictionary*, L.R. Vaidya; `GST` covers only words beginning with *a-*).
- **AMAR/KNA/KOW** — not Abhidhāna texts; separate newer dictionaries (see *In
  preparation*). None has a csl-doc page yet.

## Still open

- **csl-doc coverage gaps** — `FRI` has a repo but no csl-doc page; the three uncovered
  Abhidhāna texts (`ARMH`, `ACPH`, `ACSJ`) may also warrant pages. (`PD` does not — it is
  a sample only, see the *Count* note above.)
- Missing publishers/editions for several titles — fill from each dictionary's print
  front matter (the csl-doc `prefaces/` pages are the place to mine these).
