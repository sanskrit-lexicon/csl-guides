---
id: change-files
title: Change Files
description: "How CDSL corrections are expressed as change files applied by updateByLine.py — the replace/insert/delete format and its rules."
sidebar_label: Change Files
---

# Change Files

Corrections are expressed as **change files** applied by `updateByLine.py`:

```sh
python updateByLine.py <input_file> <changefile> <output_file>
```

## Format

Paired lines, with `;` introducing a comment:

```
1234 old original line text here
1234 new replacement line text here
```

Supported operations:

| Keyword | Effect |
|---|---|
| `new` | Replace the numbered line with the following text |
| `ins` | Insert the following text after the numbered line |
| `del` | Delete the numbered line |

All files must be **UTF-8** (no BOM — see the BOM rule in
**[Corrections Workflow](corrections-workflow)**).

The line number is not just a note for the reviewer. `updateByLine.py` uses it to find
the exact line, and the `old` text should match the current source line before the
replacement is accepted.

## Worked example

To fix a typo on line 1234 of a dictionary:

```
; fix headword typo: krsna -> kfzRa (SLP1)
1234 old <H1><h><key1>krsna</key1>...
1234 new <H1><h><key1>kfzRa</key1>...
```

Then run the **[full workflow](corrections-workflow)**: snapshot → apply → validate XML
→ diff to audit change file → commit `csl-orig` + `csl-corrections`.

## Replace, insert, delete

Most typo fixes are replacements:

```text
1234 old original line
1234 new corrected line
```

Insertions add a line after the numbered line:

```text
1234 old line before the insertion
1234 ins inserted line
```

Deletions remove the numbered line:

```text
1234 old line to delete
1234 del
```

After any insertion or deletion, the old and new files have different line counts, so the
audit step must use `diff_to_changes.py`, not `diff_to_changes_dict.py`.

## Insertions and deletions

`diff_to_changes_dict.py` (used to regenerate the audit change file) assumes equal line
counts. If your change **adds or removes lines**, use `diff_to_changes.py` instead, which
handles differing line counts.

## Encoding and BOM check

All source and change files should be UTF-8 without a byte-order mark. When Python writes
a file, use:

```python
open(path, 'w', encoding='utf-8')
```

Do not use `utf-8-sig`. After a generated or bulk edit, verify the first bytes:

```sh
python -c "with open('ap.txt','rb') as f: print(f.read(3).hex())"
```

The result must not be `efbbbf`.
