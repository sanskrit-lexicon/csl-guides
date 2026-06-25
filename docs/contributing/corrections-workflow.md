---
id: corrections-workflow
title: Corrections Workflow
description: "The canonical step-by-step workflow for correcting a csl-orig source dictionary, from snapshot through XML validation to commit."
sidebar_label: Corrections Workflow
---

# Corrections Workflow

This is the canonical sequence for correcting a `csl-orig` source dictionary (the
"Jim Funderburk / Dhaval Patel pattern"). Do not deviate from it — the steps exist to
guarantee XML validity and a complete audit trail.

If you are new to the workflow, read [Process One Correction](process-one-correction)
first. If you are handling a named backlog such as Scott Rhodes' AP corrections, read
[Process a Scott Batch](process-scott-batch) first and use this page as the reference
checklist.

## The sequence

```sh
# 1. Snapshot current source
cp csl-orig/v02/{dict}/{dict}.txt temp_{dict}_0.txt

# 2. Apply corrections (via updateByLine.py or a direct edit)
python updateByLine.py temp_{dict}_0.txt change_file.txt temp_{dict}_1.txt

# 3. Put the result back into csl-orig
cp temp_{dict}_1.txt csl-orig/v02/{dict}/{dict}.txt

# 4. XML validation — REQUIRED before commit
cd csl-pywork/v02
sh generate_dict.sh {dict} tempparent/{dict}
sh xmlchk_xampp.sh {dict}
#   On Windows without XAMPP: make_xml.py reporting
#   "All records parsed by ET" is sufficient.
rm -rf tempparent/{dict}      # clean up

# 5. Generate the audit-trail change file (store in csl-corrections)
cd csl-corrections/batch_YYYYMMDD/dictionaries/{dict}/
python diff_to_changes_dict.py temp_{dict}_0.txt \
    csl-orig/v02/{dict}/{dict}.txt change_{dict}_N.txt

# 6. Commit both repos
#   csl-orig:        the corrected dict file
#   csl-corrections: the change file + readme.txt
```

## Critical rules

- **Corrections ARE committed directly to [`csl-orig`](https://github.com/sanskrit-lexicon/csl-orig)** —
  this is the canonical pattern. The change files in
  [`csl-corrections`](https://github.com/sanskrit-lexicon/csl-corrections) are the audit
  trail; they are **not** applied at generation time.
- **Always run XML validation (step 4) before committing** to `csl-orig`.
- `diff_to_changes_dict.py` assumes the **same line count** in old and new. If you
  insert or delete lines, use `diff_to_changes.py` instead.
- **No BOM.** When writing files with Python use `open(f, 'w', encoding='utf-8')` —
  *not* `utf-8-sig`. The `csl-orig` files never carry a UTF-8 BOM. Verify with:

  ```sh
  python -c "open('f','rb').read(3).hex()"   # must NOT be efbbbf
  ```

- `printchange.txt` records **deviations from the scanned print** — not digital/markup
  fixes.

## Which tutorial applies?

| Situation | Page |
|---|---|
| You found a problem but do not have a local setup | [Report a Typo](report-a-typo) |
| You are installing one accepted correction | [Process One Correction](process-one-correction) |
| You are processing many correction-form records | [Process a Scott Batch](process-scott-batch) |

## Local prerequisites (Windows)

`generate_dict.sh` needs:

- `python3` on `PATH` (a wrapper that forwards to `python` works).
- `mako` installed (`pip install mako`).
- [`csl-websanlexicon`](https://github.com/sanskrit-lexicon/csl-websanlexicon) as a
  sibling of [`csl-pywork`](https://github.com/sanskrit-lexicon/csl-pywork).
- `xmllint` is typically unavailable locally — use the ElementTree (ET) parse success as
  the validation signal.

## Change-file format

See **[Change Files](change-files)** for the exact line-paired format used by
`updateByLine.py`.
