---
id: process-one-correction
title: Process One Correction
description: "A maintainer tutorial for turning one reported CDSL typo into a validated source correction and audit trail."
sidebar_label: Process One Correction
---

# Process One Correction

This page is the maintainer path for one correction. It assumes you have the sibling
repositories checked out and can run the validation scripts. If you only want to report a
problem, start with [Report a Typo](report-a-typo).

## Example record

The Scott backlog for AP in `csl-corrections/batch_20250418` gives compact real examples.
One AP correction form entry reads:

```text
Case 1323: 04/17/2025 dict=AP, L=4564, hw=arthaḥ, user=srhodes
old = kodhasyaiva
new = krodhasyaiva
status = PENDING
```

This tells you the dictionary (`AP`), the metaline / entry number (`L=4564`), the headword
(`arthaḥ`), and the proposed replacement. Your job is to verify whether this is a digital
typo, a print correction, a markup problem, or a question.

## 1. Find the source line

Open the source dictionary in `csl-orig`:

```sh
cd csl-orig/v02/ap
grep -n "<L>4564<" ap.txt
grep -n "kodhasyaiva" ap.txt
```

The source line is the unit changed by `updateByLine.py`. Do not correct a rendered HTML
display by hand; it is generated from this source.

## 2. Verify the classification

Before editing, compare three things:

| Evidence | Question |
|---|---|
| Digital source | Does the old text occur exactly as reported? |
| Printed scan | Does the scan show `kodhasyaiva`, `krodhasyaiva`, or something ambiguous? |
| Scholarly context | Does grammar or a parallel dictionary support the proposed form? |

If the scan supports the proposed correction, it is a digital typo. If the scan itself
shows the old wrong form but the correction is justified, it is a print correction and
must also be recorded in the dictionary's `printchange.txt`.

## 3. Apply the edit

For one same-line correction, create a small change file:

```text
; Scott AP case 1323: arthaḥ, digital typo
12345 old ... kodhasyaiva ...
12345 new ... krodhasyaiva ...
```

Then apply it to a snapshot:

```sh
cp csl-orig/v02/ap/ap.txt temp_ap_0.txt
python updateByLine.py temp_ap_0.txt change_ap_case1323.txt temp_ap_1.txt
cp temp_ap_1.txt csl-orig/v02/ap/ap.txt
```

Use the real line number and full original/replacement line. The `old` line is not a
hint; it is the exact text the script checks before replacing.

## 4. Validate XML

Run the standard build and XML check:

```sh
cd csl-pywork/v02
sh generate_dict.sh ap tempparent/ap
sh xmlchk_xampp.sh ap
rm -rf tempparent/ap
```

On a Windows machine without `xmllint`, `make_xml.py` reporting
`All records parsed by ET` is the local fallback signal, but full DTD validation is still
preferred before committing.

## 5. Generate the audit trail

Back in the batch directory, create the change file that will live in `csl-corrections`:

```sh
python diff_to_changes_dict.py temp_ap_0.txt temp_ap_1.txt change_ap_1.txt
```

Use `diff_to_changes_dict.py` only when the old and new files have the same line count.
If your correction inserted or deleted a line, use `diff_to_changes.py`.

## 6. Commit both repos

Commit the corrected source in `csl-orig`, and commit the audit materials in
`csl-corrections`.

```sh
cd csl-orig
git add v02/ap/ap.txt
git commit -m "AP correction for arthaḥ. Ref: sanskrit-lexicon/csl-corrections#101"

cd ../csl-corrections
git add batch_YYYYMMDD/dictionaries/ap
git commit -m "AP correction audit trail. Ref: sanskrit-lexicon/csl-corrections#101"
```

The exact message can vary, but the two commits should point to the same issue or batch.
That pairing is what lets future maintainers reconstruct both the source change and the
reason for it.

## Result

After this sequence, the canonical text is corrected in `csl-orig`, XML validity has been
checked, and `csl-corrections` records the before/after audit trail. The public display is
refreshed later by the normal generation process or by an explicit maintainer rebuild.
