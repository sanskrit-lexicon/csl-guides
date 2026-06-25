---
id: process-scott-batch
title: Process a Scott Batch
description: "How maintainers process a named correction backlog such as Scott Rhodes' AP batch from csl-corrections."
sidebar_label: Process a Scott Batch
---

# Process a Scott Batch

Large contributor backlogs are handled as batches so that evidence, source edits,
validation, audit trails, and public refreshes stay synchronized. The model here is the
Scott Rhodes backlog prepared in `csl-corrections/batch_20250418`, especially the AP
sub-batch.

This is maintainer documentation. It deliberately omits private email handling, personal
access-token instructions, and obsolete authentication notes.

## Batch anatomy

The April 2025 Scott preparation split incoming correction-form rows into:

| File | Role |
|---|---|
| `cfr.tsv` | The full correction-form response table |
| `prev.tsv` | Already-handled lines before the batch window |
| `scott.tsv` | Scott Rhodes submissions selected for this named batch |
| `notscott.tsv` | New non-Scott lines left in the regular queue |
| `new_cfr.tsv` | Rebuilt queue: previous lines plus non-Scott pending lines |
| `correctionform.txt` | Human-readable pending cases generated from the selected TSV |
| `dictionaries/ap/ap_correctionform.txt` | AP-only correction cases |

The AP batch readme records 602 AP correction records. The generated AP file begins with
records like:

```text
Case 1332: 04/18/2025 dict=AP, L=4567, hw=arthavat, user=srhodes
old = (-vān) Aman.
new = (-vān) A man.
status = PENDING
```

That is the working unit: one proposed change attached to one dictionary, one entry
number, one headword, and one contributor.

## 1. Prepare the named batch

The Scott batch was prepared by copying and adapting an earlier separator script:

```sh
python separate_scott1.py 20250114 ../app/correction_response/cfr.tsv \
  prev.tsv scott.tsv notscott.tsv deleted.tsv
```

The readme records the sanity check:

```text
27451 lines read
26074 previous
1336 Scott
41 non-Scott
0 deleted
```

Then the live queue was rebuilt from `prev.tsv` and `notscott.tsv` so Scott's lines could
be processed independently:

```sh
cat prev.tsv notscott.tsv > new_cfr.tsv
cp new_cfr.tsv ../app/correction_response/cfr.tsv
```

For future named batches, keep the same invariant: the batch file contains only the
target contributor or campaign, while unrelated pending reports remain in the regular
queue.

## 2. Generate per-dictionary work files

Run the correction-form adjustment script over the selected batch:

```sh
python3 ../cfr_adj.py scott.tsv correctionform.txt
```

For the Scott batch this created dictionary-specific files, including:

```text
dictionaries/lrv/lrv_correctionform.txt
dictionaries/mw/mw_correctionform.txt
dictionaries/shs/shs_correctionform.txt
dictionaries/ap90/ap90_correctionform.txt
dictionaries/ap/ap_correctionform.txt
dictionaries/pui/pui_correctionform.txt
```

Process one dictionary at a time. Mixing dictionaries makes validation, commits, and
public refreshes harder to audit.

## 3. Edit source and working correction form together

The AP readme uses this pattern:

```sh
cp csl-orig/v02/ap/ap.txt temp_ap_0.txt
python prepedit.py ap_correctionform.txt tempwork_ap_correctionform.txt
cp temp_ap_0.txt temp_ap_1.txt
```

Then maintainers edit `temp_ap_1.txt` and `tempwork_ap_correctionform.txt` together:

- `temp_ap_1.txt` receives the source-text corrections.
- `tempwork_ap_correctionform.txt` records the decision for each case.
- Cases that are not ready stay marked as TODO rather than silently disappearing.

This dual edit is the heart of batch processing: source changes and review decisions stay
aligned case by case.

## 4. Classify done and todo cases

The AP batch partitions reviewed cases with status prefixes:

| Prefix | Meaning in the AP readme |
|---|---|
| `TODOx` | Done / accepted case |
| `TODO-` | Hyphen-related case left for separate handling |
| `TODOd` | Display-related case |
| `TODOm` | `M` / vowel issue |
| `TODOg1` | `g1` class issue, e.g. `€1P.` style forms |
| `TODOh` | Missing-headword issue |

The AP readme records the partition:

```text
506 ap_done.txt
53 ap_todo_hyphen.txt
8 ap_todo_display.txt
3 ap_todo_M_vowel.txt
3 ap_todo_g1.txt
2 ap_todo_hwmiss.txt
28 ap_todo_misc.txt
```

Those categories are not a universal ontology. They are the local triage buckets that made
this batch reviewable. Future batches should use clear bucket names and document them in
their readme.

## 5. Validate the dictionary

Once a dictionary's accepted corrections are in the temporary source file, promote it and
validate:

```sh
cp temp_ap_1.txt csl-orig/v02/ap/ap.txt
cd csl-pywork/v02
sh generate_dict.sh ap ../../ap
sh xmlchk_xampp.sh ap
```

The batch readmes record validation status before installation. Do not generate audit
files or commit a batch until XML generation has succeeded.

## 6. Generate audit and printchange files

For AP, the same-line-count audit file was generated with:

```sh
python diff_to_changes_dict.py temp_ap_0.txt temp_ap_1.txt change_ap_1.txt
```

The AP readme reports:

```text
602 changes written to change_ap_1.txt
```

Print corrections were extracted separately:

```sh
grep "** pc:" ap_correctionform_edit.txt > ap_printchange.txt
```

Only confirmed deviations from the printed source belong in `printchange.txt`. Digital
typos and markup repairs should not be recorded as print deviations.

## 7. Commit and refresh

Install the dictionary with two paired commits:

| Repo | Commit contents |
|---|---|
| `csl-orig` | The corrected source file, e.g. `v02/ap/ap.txt` |
| `csl-corrections` | Batch readme, edited correction form, audit change file, todo/done splits, printchange extract |

The Scott AP batch used commit messages pointing to
`sanskrit-lexicon/csl-corrections#101`. Keep that cross-reference in both repos.

After the commits are pulled on the server, regenerate the affected dictionary display:

```sh
cd csl-pywork/v02
sh generate_dict.sh ap ../../APScan/2020/
```

For multi-dictionary batches, repeat the display refresh for each changed dictionary.

## Batch checklist

- Select only the intended contributor/campaign into the named batch.
- Preserve unrelated pending items in the regular queue.
- Generate per-dictionary correction forms.
- Process one dictionary at a time.
- Edit source and correction-form status together.
- Keep TODO buckets for unresolved or special cases.
- Validate XML before audit and commit.
- Generate same-line or differing-line audit files with the correct script.
- Extract `printchange.txt` lines only for confirmed print deviations.
- Commit `csl-orig` and `csl-corrections` as a paired unit.
- Refresh public displays for every changed dictionary.
