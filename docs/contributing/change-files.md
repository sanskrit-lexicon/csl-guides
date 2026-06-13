---
id: change-files
title: Change Files
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
| `new` | Replace the line |
| `ins` | Insert after the given line |
| `del` | Delete the line |

All files must be **UTF-8** (no BOM — see the BOM rule in
**[Corrections Workflow](corrections-workflow)**).

## Worked example

To fix a typo on line 1234 of a dictionary:

```
; fix headword typo: krsna -> kfRZa (SLP1)
1234 old <H1><h><key1>krsna</key1>...
1234 new <H1><h><key1>kfRZa</key1>...
```

Then run the **[full workflow](corrections-workflow)**: snapshot → apply → validate XML
→ diff to audit change file → commit `csl-orig` + `csl-corrections`.

## Insertions and deletions

`diff_to_changes_dict.py` (used to regenerate the audit change file) assumes equal line
counts. If your change **adds or removes lines**, use `diff_to_changes.py` instead, which
handles differing line counts.
